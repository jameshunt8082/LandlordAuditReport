import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { checkoutLimiter, getClientIP } from "@/lib/rate-limiter";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia"
});

// Service pricing configuration (amounts in pence for GBP)
const SERVICE_PRICES: Record<string, { amount: number; name: string }> = {
  online: { amount: 5000, name: "Online Risk Audit" },    // £50.00
};

export async function POST(req: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(req);
    const rateLimitResult = checkoutLimiter.check(clientIP);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many checkout attempts. Please try again later." },
        { 
          status: 429,
          headers: checkoutLimiter.getHeaders(rateLimitResult),
        }
      );
    }

    const body = await req.json();
    const serviceId = body.serviceId || body.serviceID;
    const email = body.email;
    const name = body.name;
    const address = body.address || body.propertyAddress;

    // Validate required fields
    if (!serviceId || !email || !name || !address) {
      return NextResponse.json(
        { error: "Missing required fields: serviceId, email, name, address" },
        { status: 400 }
      );
    }

    // Validate service type and get price
    const service = SERVICE_PRICES[serviceId];
    if (!service) {
      return NextResponse.json(
        { error: `Invalid service type: ${serviceId}. Valid option: online` },
        { status: 400 }
      );
    }

    // Get the origin for redirect URLs
    const origin = req.headers.get("origin") || "https://landlord-audit.vercel.app";

    // Create Stripe Checkout Session (redirect-based)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}?canceled=true`,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: service.amount,
            product_data: {
              name: service.name,
              description: `Property audit for: ${address}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        customer_name: name,
        customer_email: email,
        property_address: address,
        service_type: serviceId,
      },
      // Pre-fill customer name in Stripe Checkout
      payment_intent_data: {
        metadata: {
          customer_name: name,
          customer_email: email,
          property_address: address,
          service_type: serviceId,
        },
      },
    });

    return NextResponse.json(
      { 
        url: session.url,
        sessionId: session.id,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Stripe checkout error:", error);
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
