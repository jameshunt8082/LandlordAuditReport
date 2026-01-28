import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sql } from "@vercel/postgres";
import { randomUUID } from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// Stripe webhook secret from dashboard
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json(
          { error: "Webhook signature verification failed" },
          { status: 400 }
        );
      }
    } else {
      // For development without webhook secret - parse event directly
      // WARNING: Do not use this in production!
      console.warn("STRIPE_WEBHOOK_SECRET not set - skipping signature verification");
      event = JSON.parse(body) as Stripe.Event;
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed for ${paymentIntent.id}:`, paymentIntent.last_payment_error?.message);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const metadata = paymentIntent.metadata;
  
  // Extract customer information from payment metadata
  const customerName = metadata.customer_name;
  const customerEmail = metadata.customer_email;
  const propertyAddress = metadata.property_address;
  const serviceType = metadata.service_type;

  if (!customerName || !customerEmail || !propertyAddress || !serviceType) {
    console.error("Missing metadata in payment intent:", paymentIntent.id);
    return;
  }

  // Determine tier based on service type
  const tier = serviceType === "onsite" ? "tier_1" : "tier_0";

  // Generate unique token for the audit
  const token = randomUUID();

  try {
    // Check if audit already exists for this payment intent
    const existingAudit = await sql`
      SELECT id FROM audits WHERE payment_intent_id = ${paymentIntent.id}
    `;

    if (existingAudit.rows.length > 0) {
      console.log(`Audit already exists for payment ${paymentIntent.id}`);
      return;
    }

    // Create the audit record
    const result = await sql`
      INSERT INTO audits (
        auditor_id,
        token,
        client_name,
        landlord_email,
        property_address,
        risk_audit_tier,
        conducted_by,
        payment_intent_id,
        payment_status,
        payment_amount,
        service_type,
        created_at
      )
      VALUES (
        NULL,
        ${token},
        ${customerName},
        ${customerEmail},
        ${propertyAddress},
        ${tier},
        'Self-Service',
        ${paymentIntent.id},
        'paid',
        ${paymentIntent.amount},
        ${serviceType},
        NOW()
      )
      RETURNING id, token
    `;

    console.log(`Created audit ${result.rows[0].id} for payment ${paymentIntent.id}`);

    // TODO: Send email notification to customer with audit link
    // await sendAuditEmail(customerEmail, customerName, result.rows[0].token);

  } catch (error) {
    console.error("Failed to create audit from payment:", error);
    throw error;
  }
}
