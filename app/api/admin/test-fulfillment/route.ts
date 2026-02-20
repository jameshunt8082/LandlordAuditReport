import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sql } from '@vercel/postgres';
import { randomUUID } from 'crypto';
import { sendQuestionnaireEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

/**
 * DIAGNOSTIC ENDPOINT: Manually trigger fulfillment for the most recent checkout session.
 * This bypasses the webhook entirely to prove the fulfillment pipeline works.
 * 
 * GET /api/admin/test-fulfillment
 *   - Lists recent checkout sessions and shows their metadata
 * 
 * GET /api/admin/test-fulfillment?fulfill=SESSION_ID&sendTo=email@example.com
 *   - Manually runs the fulfillment logic for a specific session
 *   - Creates the audit if it doesn't exist
 *   - Sends the email to the specified address (or the session's customer email)
 */
export async function GET(req: NextRequest) {
  const steps: string[] = [];
  const log = (msg: string) => {
    console.log(`[TestFulfillment] ${msg}`);
    steps.push(msg);
  };

  try {
    const fulfillSessionId = req.nextUrl.searchParams.get('fulfill');
    const overrideEmail = req.nextUrl.searchParams.get('sendTo');

    // =========================================================================
    // MODE 1: List recent sessions (no ?fulfill= param)
    // =========================================================================
    if (!fulfillSessionId) {
      log('Listing recent checkout sessions...');
      
      const sessions = await stripe.checkout.sessions.list({ limit: 5 });
      
      const sessionSummaries = sessions.data.map(s => ({
        id: s.id,
        payment_status: s.payment_status,
        payment_intent: s.payment_intent,
        customer_email: s.customer_email || s.customer_details?.email,
        metadata: s.metadata,
        created: new Date(s.created * 1000).toISOString(),
        amount_total: s.amount_total,
        currency: s.currency,
      }));

      log(`Found ${sessionSummaries.length} sessions`);

      // Also check webhook secret status
      const webhookSecretStatus = process.env.STRIPE_WEBHOOK_SECRET 
        ? `CONFIGURED (starts with ${process.env.STRIPE_WEBHOOK_SECRET.substring(0, 10)}...)` 
        : 'MISSING';
      
      // Check SMTP vars
      const smtpStatus = {
        SMTP_HOST: process.env.SMTP_HOST || 'MISSING',
        SMTP_USER: process.env.SMTP_USER ? 'CONFIGURED' : 'MISSING',
        SMTP_PASSWORD: process.env.SMTP_PASSWORD ? 'CONFIGURED' : 'MISSING',
      };

      return NextResponse.json({
        mode: 'LIST',
        message: 'Add ?fulfill=SESSION_ID to manually trigger fulfillment for a session. Add &sendTo=email to override recipient.',
        webhookSecret: webhookSecretStatus,
        smtp: smtpStatus,
        sessions: sessionSummaries,
        steps,
      });
    }

    // =========================================================================
    // MODE 2: Manually fulfill a specific session
    // =========================================================================
    log(`Fulfilling session: ${fulfillSessionId}`);

    // Step 1: Retrieve the session from Stripe
    log('Step 1: Retrieving checkout session from Stripe...');
    const session = await stripe.checkout.sessions.retrieve(fulfillSessionId);
    log(`Session retrieved: payment_status=${session.payment_status}, payment_intent=${session.payment_intent}`);
    log(`Session metadata: ${JSON.stringify(session.metadata)}`);
    log(`Customer email: ${session.customer_email || session.customer_details?.email || 'NONE'}`);

    // Step 2: Extract metadata
    log('Step 2: Extracting metadata...');
    let metadata = session.metadata || {};

    // If session metadata is empty, try payment intent
    if (Object.keys(metadata).length === 0 && typeof session.payment_intent === 'string') {
      log('Session metadata empty, checking payment intent...');
      const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
      log(`PaymentIntent metadata: ${JSON.stringify(pi.metadata)}`);
      if (pi.metadata && Object.keys(pi.metadata).length > 0) {
        metadata = pi.metadata;
        log('Using PaymentIntent metadata');
      }
    }

    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || session.id;

    const customerEmail = overrideEmail || metadata.customer_email || session.customer_details?.email || session.customer_email;
    const customerName = metadata.customer_name || session.customer_details?.name || 'Valued Customer';
    const propertyAddress = metadata.property_address || 'Address not provided';
    const serviceType = metadata.service_type || 'online';

    log(`Resolved - Email: ${customerEmail}, Name: ${customerName}, Address: ${propertyAddress}`);

    if (!customerEmail) {
      return NextResponse.json({
        success: false,
        message: 'No customer email found. Provide ?sendTo=email to override.',
        steps,
      }, { status: 400 });
    }

    // Step 3: Check if audit already exists
    log('Step 3: Checking database for existing audit...');
    const existingAudit = await sql`
      SELECT id, token, status, landlord_email FROM audits WHERE payment_intent_id = ${paymentIntentId}
    `;

    let auditToken: string;
    let auditId: number;
    let auditCreated: boolean;

    if (existingAudit.rows.length > 0) {
      auditId = existingAudit.rows[0].id;
      auditToken = existingAudit.rows[0].token;
      auditCreated = false;
      log(`Audit already exists: ID=${auditId}, Token=${auditToken}, Status=${existingAudit.rows[0].status}, Email=${existingAudit.rows[0].landlord_email}`);
    } else {
      // Step 4: Create audit
      log('Step 4: Creating new audit record...');
      const token = randomUUID();
      const result = await sql`
        INSERT INTO audits (
          auditor_id, token, client_name, landlord_email, property_address,
          risk_audit_tier, conducted_by, payment_intent_id, payment_status,
          payment_amount, service_type, created_at
        ) VALUES (
          NULL, ${token}, ${customerName}, ${customerEmail}, ${propertyAddress},
          'tier_0', 'Self-Service', ${paymentIntentId}, 'paid',
          ${session.amount_total || 5000}, ${serviceType}, NOW()
        ) RETURNING id, token
      `;
      auditId = result.rows[0].id;
      auditToken = result.rows[0].token;
      auditCreated = true;
      log(`Audit created: ID=${auditId}, Token=${auditToken}`);
    }

    // Step 5: Send email
    log(`Step 5: Sending questionnaire email to ${customerEmail}...`);
    try {
      await sendQuestionnaireEmail(customerEmail, auditToken, customerName, propertyAddress);
      log('Email sent successfully!');
    } catch (emailError) {
      const errMsg = emailError instanceof Error ? emailError.message : 'Unknown email error';
      log(`Email FAILED: ${errMsg}`);
      return NextResponse.json({
        success: false,
        message: `Audit ${auditCreated ? 'created' : 'exists'}, but email failed`,
        error: errMsg,
        auditId,
        auditToken,
        steps,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Fulfillment complete! Audit ${auditCreated ? 'created' : 'already existed'} and email sent to ${customerEmail}`,
      auditId,
      auditToken,
      auditCreated,
      questionnaireUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://landlord-audit.vercel.app'}/audit/${auditToken}`,
      steps,
    });

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    log(`FATAL ERROR: ${errMsg}`);
    return NextResponse.json({
      success: false,
      message: 'Diagnostic failed',
      error: errMsg,
      stack: error instanceof Error ? error.stack : undefined,
      steps,
    }, { status: 500 });
  }
}
