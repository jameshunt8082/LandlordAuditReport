import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// Get audit by token (public route)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const result = await sql`
      SELECT 
        id,
        token,
        status,
        client_name,
        landlord_email,
        property_address,
        risk_audit_tier,
        conducted_by,
        created_at
      FROM audits
      WHERE token = ${token}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Audit not found" },
        { status: 404 }
      );
    }

    const audit = result.rows[0];

    // Don't allow access if already submitted
    if (audit.status !== "pending") {
      return NextResponse.json(
        { 
          error: "This audit has already been submitted",
          status: audit.status
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ audit });
  } catch (error) {
    console.error("Get audit by token error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

