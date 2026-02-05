import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';
import { sendQuestionnaireEmail } from '@/lib/email';

// =============================================================================
// POST /api/email/send-questionnaire
// =============================================================================
// Sends the questionnaire link email to the landlord.
//
// Request body:
//   { auditToken: string } - The unique token for the audit
//
// Returns:
//   200: { success: true, message: string }
//   400: { error: string } - Validation error
//   404: { error: string } - Audit not found
//   500: { error: string } - Server/email error
// =============================================================================

const requestSchema = z.object({
  auditToken: z.string().uuid('Invalid audit token format'),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const { auditToken } = requestSchema.parse(body);

    // Fetch audit from database
    const result = await sql`
      SELECT 
        id,
        token,
        client_name,
        landlord_email,
        property_address,
        status,
        payment_status
      FROM audits
      WHERE token = ${auditToken}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    const audit = result.rows[0];

    // Validate audit has email
    if (!audit.landlord_email) {
      return NextResponse.json(
        { error: 'Audit does not have a landlord email address' },
        { status: 400 }
      );
    }

    // Check if audit is still pending (not already submitted)
    if (audit.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot send email for audit with status: ${audit.status}` },
        { status: 400 }
      );
    }

    // Send the email
    await sendQuestionnaireEmail(
      audit.landlord_email,
      audit.token,
      audit.client_name,
      audit.property_address
    );

    return NextResponse.json(
      {
        success: true,
        message: `Questionnaire email sent to ${audit.landlord_email}`,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    // Handle email configuration errors
    if (error instanceof Error && error.message.includes('Email configuration missing')) {
      return NextResponse.json(
        { error: 'Email service is not configured. Please set SMTP environment variables.' },
        { status: 500 }
      );
    }

    // Log and return generic error
    console.error('Send questionnaire email error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to send email: ${message}` },
      { status: 500 }
    );
  }
}
