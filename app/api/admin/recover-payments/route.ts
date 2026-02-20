import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@vercel/postgres";
import { randomUUID } from "crypto";

/**
 * GET /api/admin/recover-payments
 * Lists all failed payments that need recovery
 * 
 * POST /api/admin/recover-payments
 * Attempts to recover a specific failed payment by creating its audit
 */

// List all unrecovered failed payments
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // RBAC: Only admin users can access admin endpoints
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const result = await sql`
      SELECT 
        id,
        payment_intent_id,
        customer_name,
        customer_email,
        property_address,
        service_type,
        payment_amount,
        error_message,
        retry_count,
        created_at,
        last_retry_at
      FROM failed_payments
      WHERE recovered = FALSE
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      failedPayments: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Error fetching failed payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch failed payments" },
      { status: 500 }
    );
  }
}

// Attempt to recover a failed payment
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // RBAC: Only admin users can access admin endpoints
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { paymentIntentId } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "paymentIntentId is required" },
        { status: 400 }
      );
    }

    // Get the failed payment record
    const failedPayment = await sql`
      SELECT * FROM failed_payments 
      WHERE payment_intent_id = ${paymentIntentId} AND recovered = FALSE
    `;

    if (failedPayment.rows.length === 0) {
      return NextResponse.json(
        { error: "Failed payment not found or already recovered" },
        { status: 404 }
      );
    }

    const payment = failedPayment.rows[0];

    // Check if audit already exists
    const existingAudit = await sql`
      SELECT id, token FROM audits WHERE payment_intent_id = ${paymentIntentId}
    `;

    if (existingAudit.rows.length > 0) {
      // Audit exists, mark as recovered
      await sql`
        UPDATE failed_payments 
        SET recovered = TRUE, last_retry_at = NOW()
        WHERE payment_intent_id = ${paymentIntentId}
      `;

      return NextResponse.json({
        message: "Audit already exists, marked as recovered",
        auditToken: existingAudit.rows[0].token,
      });
    }

    // Create the audit
    const tier = "tier_0";
    const token = randomUUID();

    await sql`
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
        ${payment.customer_name},
        ${payment.customer_email},
        ${payment.property_address},
        ${tier},
        'Self-Service (Recovered)',
        ${paymentIntentId},
        'paid',
        ${payment.payment_amount},
        ${payment.service_type},
        NOW()
      )
    `;

    // Mark as recovered
    await sql`
      UPDATE failed_payments 
      SET recovered = TRUE, last_retry_at = NOW()
      WHERE payment_intent_id = ${paymentIntentId}
    `;

    console.log(`Recovered payment ${paymentIntentId}, created audit with token ${token}`);

    return NextResponse.json({
      message: "Payment recovered successfully",
      auditToken: token,
      auditLink: `/audit/${token}`,
    });
  } catch (error) {
    console.error("Error recovering payment:", error);
    return NextResponse.json(
      { error: "Failed to recover payment" },
      { status: 500 }
    );
  }
}
