import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sql } from "@vercel/postgres";
import { randomUUID } from "crypto";
import { sendQuestionnaireEmail } from "@/lib/email";

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
      case "checkout.session.completed": {
        // Stripe Checkout redirect flow completed
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`[Webhook] Checkout session completed: ${session.id}`);
        
        // Ensure payment was successful before provisioning
        if (session.payment_status === "paid") {
          console.log(`[Webhook] Session ${session.id} paid, processing fulfillment`);
          await handlePaymentSuccess(session);
        } else {
          console.log(`[Webhook] Session ${session.id} completed but payment status is: ${session.payment_status}`);
        }
        break;
      }

      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`[Webhook] Async payment succeeded for session: ${session.id}`);
        await handlePaymentSuccess(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[Webhook] PaymentIntent succeeded: ${paymentIntent.id}`);
        
        // Fallback fulfillment check: If it was a checkout session, handle it
        if (paymentIntent.metadata?.checkout_session_id) {
          try {
            const sessions = await stripe.checkout.sessions.list({
              payment_intent: paymentIntent.id,
              limit: 1,
            });
            if (sessions.data.length > 0) {
              console.log(`[Webhook] Found session ${sessions.data[0].id} for PI ${paymentIntent.id}, triggering fulfillment`);
              await handlePaymentSuccess(sessions.data[0]);
            }
          } catch (err) {
            console.error("[Webhook] Error during PI fallback fulfillment:", err);
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[Webhook] Payment failed for ${paymentIntent.id}:`, paymentIntent.last_payment_error?.message);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("[Webhook] Global error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handlePaymentSuccess(session: Stripe.Checkout.Session) {
  console.log(`[Fulfillment] Processing session: ${session.id}`);
  
  // Extract metadata from session or associated payment intent
  let metadata = session.metadata || {};
  
  // The Payment Intent ID is attached to the session
  const paymentIntentId = typeof session.payment_intent === 'string' 
    ? session.payment_intent 
    : session.payment_intent?.id || session.id;

  // If session metadata is empty, try to fetch from payment intent
  if (Object.keys(metadata).length === 0 && typeof session.payment_intent === 'string') {
    try {
      const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
      if (pi.metadata && Object.keys(pi.metadata).length > 0) {
        console.log(`[Fulfillment] Found metadata on payment intent ${pi.id}`);
        metadata = pi.metadata;
      }
    } catch (err) {
      console.error("[Fulfillment] Error retrieving PI metadata:", err);
    }
  }
  
  // Extract customer information with multiple fallbacks
  const customerEmail = 
    metadata.customer_email || 
    session.customer_details?.email || 
    session.customer_email;
    
  const customerName = 
    metadata.customer_name || 
    session.customer_details?.name || 
    "Valued Customer";

  const propertyAddress = metadata.property_address || "Address not provided";
  const serviceType = metadata.service_type || "online";

  console.log(`[Fulfillment] Data: Email=${customerEmail}, Name=${customerName}, Address=${propertyAddress}, Service=${serviceType}`);

  if (!customerEmail) {
    console.error("[Fulfillment] CRITICAL: Missing customer email for session:", session.id);
    return;
  }

  // Determine tier based on service type
  const tier = "tier_0";

  try {
    // Check if audit already exists for this payment intent or session
    const existingAudit = await sql`
      SELECT id, token, status FROM audits WHERE payment_intent_id = ${paymentIntentId}
    `;

    let auditToken: string;
    let auditId: number;

    if (existingAudit.rows.length > 0) {
      auditId = existingAudit.rows[0].id;
      auditToken = existingAudit.rows[0].token;
      console.log(`[Fulfillment] Audit already exists for payment ${paymentIntentId} (Audit ID: ${auditId})`);
      
      // If audit exists but is still pending, we retry the email 
      // (This handles cases where the webhook retries after a previous email failure)
      if (existingAudit.rows[0].status !== 'pending') {
        console.log(`[Fulfillment] Audit ${auditId} is already ${existingAudit.rows[0].status}, skipping email retry`);
        return;
      }
      
      console.log(`[Fulfillment] Audit ${auditId} is still pending, attempting to send email again...`);
    } else {
      // Create the audit record
      console.log("[Fulfillment] Creating new audit record in database...");
      const token = randomUUID();
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
          ${paymentIntentId},
          'paid',
          ${session.amount_total || 5000},
          ${serviceType},
          NOW()
        )
        RETURNING id, token
      `;

      auditId = result.rows[0].id;
      auditToken = result.rows[0].token;
      console.log(`[Fulfillment] Successfully created audit ${auditId}`);
    }

    // Send email notification to customer with audit link
    console.log(`[Fulfillment] Attempting to send email to ${customerEmail}...`);
    try {
      await sendQuestionnaireEmail(
        customerEmail,
        auditToken,
        customerName,
        propertyAddress
      );
      console.log(`[Fulfillment] Questionnaire email sent successfully to ${customerEmail}`);
    } catch (emailError) {
      // Log email error but don't fail the webhook - audit was created successfully
      console.error(`[Fulfillment] ERROR: Failed to send email to ${customerEmail}:`, emailError);
      // We don't re-throw here because we want to return 200 to Stripe since the audit is created
      // Stripe will only retry if we return a 5xx error.
      // If we want Stripe to retry the email, we SHOULD re-throw.
      // Given the "email functionality not working" report, let's re-throw to trigger retries.
      throw emailError;
    }

  } catch (error) {
    console.error("[Fulfillment] ERROR: Failed to process fulfillment:", error);
    
    // Log failed payment for manual recovery (only if it's not already in audits)
    try {
      const checkAudit = await sql`SELECT id FROM audits WHERE payment_intent_id = ${paymentIntentId}`;
      if (checkAudit.rows.length === 0) {
        await sql`
          INSERT INTO failed_payments (
            payment_intent_id,
            customer_name,
            customer_email,
            property_address,
            service_type,
            payment_amount,
            error_message,
            created_at
          )
          VALUES (
            ${paymentIntentId},
            ${customerName},
            ${customerEmail},
            ${propertyAddress},
            ${serviceType},
            ${session.amount_total || 5000},
            ${error instanceof Error ? error.message : 'Unknown error'},
            NOW()
          )
          ON CONFLICT (payment_intent_id) DO UPDATE SET
            retry_count = failed_payments.retry_count + 1,
            last_retry_at = NOW(),
            error_message = EXCLUDED.error_message
        `;
        console.log(`[Fulfillment] Logged failed payment ${paymentIntentId} for manual recovery`);
      }
    } catch (logError) {
      console.error("[Fulfillment] CRITICAL ERROR: Failed to log failed payment:", logError);
    }
    
    // Re-throw to trigger Stripe retry
    throw error;
  }
}
