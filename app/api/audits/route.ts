import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@vercel/postgres";
import { z } from "zod";
import { randomUUID } from "crypto";

const createAuditSchema = z.object({
  client_name: z.string().min(1, "Client name is required"),
  landlord_email: z.string().email("Invalid email").min(1, "Landlord email is required"),
  property_address: z.string().min(1, "Property address is required"),
  risk_audit_tier: z.enum(["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"]),
  conducted_by: z.string().min(1, "Conducted by is required"),
});

// Create new audit
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createAuditSchema.parse(body);

    // Generate unique token
    const token = randomUUID();

    // Create audit
    const result = await sql`
      INSERT INTO audits (
        auditor_id, 
        token, 
        client_name, 
        landlord_email, 
        property_address, 
        risk_audit_tier, 
        conducted_by,
        created_at
      )
      VALUES (
        ${session.user.id},
        ${token},
        ${data.client_name},
        ${data.landlord_email},
        ${data.property_address},
        ${data.risk_audit_tier},
        ${data.conducted_by},
        NOW()
      )
      RETURNING *
    `;

    const audit = result.rows[0];

    return NextResponse.json(
      {
        message: "Audit created successfully",
        audit: {
          id: audit.id,
          token: audit.token,
          client_name: audit.client_name,
          property_address: audit.property_address,
          status: audit.status,
          created_at: audit.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Create audit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get all audits for logged-in auditor
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin users see all audits (including self-service with NULL auditor_id)
    // Regular auditors see only their own
    const isAdmin = session.user.role === 'admin';

    const result = isAdmin
      ? await sql`
          SELECT 
            id, token, status, client_name, landlord_email,
            property_address, risk_audit_tier, conducted_by,
            created_at, submitted_at
          FROM audits
          ORDER BY created_at DESC
        `
      : await sql`
          SELECT 
            id, token, status, client_name, landlord_email,
            property_address, risk_audit_tier, conducted_by,
            created_at, submitted_at
          FROM audits
          WHERE auditor_id = ${session.user.id}
          ORDER BY created_at DESC
        `;

    // Count pending submissions
    const pendingCount = result.rows.filter(
      (audit) => audit.status === "submitted"
    ).length;

    return NextResponse.json({
      audits: result.rows,
      stats: {
        total: result.rows.length,
        pending: pendingCount,
        completed: result.rows.filter((a) => a.status === "completed").length,
      },
    });
  } catch (error) {
    console.error("Get audits error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

