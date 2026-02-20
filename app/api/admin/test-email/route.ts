import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = process.env.SMTP_SECURE === 'true';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    const from = process.env.SMTP_FROM;

    const configStatus = {
      SMTP_HOST: host || 'MISSING',
      SMTP_PORT: port || 'MISSING',
      SMTP_SECURE: secure || 'MISSING',
      SMTP_USER: user ? 'CONFIGURED' : 'MISSING',
      SMTP_PASSWORD: pass ? 'CONFIGURED' : 'MISSING',
      SMTP_FROM: from || 'MISSING',
    };

    if (!host || !user || !pass) {
      return NextResponse.json({
        success: false,
        message: 'Missing mandatory SMTP configuration variables',
        config: configStatus,
      }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    try {
      await transporter.verify();

      // If 'sendTo' query parameter is provided, perform a real send test
      const sendTo = req.nextUrl.searchParams.get('sendTo');
      if (sendTo) {
        const info = await transporter.sendMail({
          from: from || 'Landlord Audit <no-reply@landlordaudit.com>',
          to: sendTo,
          subject: 'Test Email from Landlord Audit Diagnostic',
          text: 'If you are receiving this, the SMTP send route is fully working.',
        });
        return NextResponse.json({
          success: true,
          message: `SMTP connection verified AND test email successfully sent to ${sendTo}`,
          config: configStatus,
          info,
        });
      }

      return NextResponse.json({
        success: true,
        message: 'SMTP connection successfully verified (add ?sendTo=email@domain.com to actually test sending)',
        config: configStatus,
      });
    } catch (verifyError) {
      return NextResponse.json({
        success: false,
        message: 'SMTP configuration found, but connection failed',
        config: configStatus,
        error: verifyError instanceof Error ? verifyError.message : 'Unknown verify error',
        stack: verifyError instanceof Error ? verifyError.stack : undefined,
        raw: verifyError
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Unexpected server error during email diagnostics',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
