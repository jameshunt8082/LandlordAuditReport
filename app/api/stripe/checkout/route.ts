import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia"
});

// Service pricing configuration (amounts in pence for GBP)
const SERVICE_PRICES: Record<string, number> = {
  online: 5000,  // £50.00
  onsite: 50000, // £500.00
};

export async function POST(req: NextRequest) {
  try {
    // Accept both camelCase and snake_case field names for compatibility
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
    const amount = SERVICE_PRICES[serviceId];
    if (!amount) {
      return NextResponse.json(
        { error: `Invalid service type: ${serviceId}. Valid options: online, onsite` },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "gbp",
      receipt_email: email,
      metadata: {
        customer_name: name,
        customer_email: email,
        property_address: address,
        service_type: serviceId,
      },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json(
      { 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Stripe checkout error:", error);
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
