import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

/**
 * GET /api/audits/by-payment/[paymentIntentId]
 * 
 * Looks up an audit by its Stripe payment intent ID.
 * Used by the payment success page to redirect users to their questionnaire.
 * 
 * Returns:
 * - { found: true, token: string } if audit exists
 * - { found: false } if audit not yet created (webhook pending)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paymentIntentId: string }> }
) {
  try {
    const { paymentIntentId } = await params;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment intent ID is required" },
        { status: 400 }
      );
    }

    // Query audit by payment_intent_id
    const result = await sql`
      SELECT token, status, client_name, property_address
      FROM audits
      WHERE payment_intent_id = ${paymentIntentId}
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      // Audit not yet created - webhook may still be processing
      return NextResponse.json({ found: false }, { status: 200 });
    }

    const audit = result.rows[0];

    return NextResponse.json({
      found: true,
      token: audit.token,
      clientName: audit.client_name,
      propertyAddress: audit.property_address,
      status: audit.status,
    });
  } catch (error) {
    console.error("Lookup audit by payment error:", error);
    return NextResponse.json(
      { error: "Failed to lookup audit" },
      { status: 500 }
    );
  }
}
