import nodemailer from 'nodemailer';

// =============================================================================
// EMAIL SERVICE CONFIGURATION
// =============================================================================
// Configure these environment variables in .env.local:
//
// SMTP_HOST=smtp.example.com        (e.g., smtp.gmail.com, smtp.sendgrid.net)
// SMTP_PORT=587                     (587 for TLS, 465 for SSL)
// SMTP_SECURE=false                 (true for port 465, false for 587)
// SMTP_USER=your_username           (email or API key)
// SMTP_PASSWORD=your_password       (email password or API key)
// SMTP_FROM="Landlord Audit <no-reply@yourapp.com>"
// NEXT_PUBLIC_BASE_URL=https://your-domain.com
// =============================================================================

/**
 * Create Nodemailer transporter with SMTP configuration from environment variables.
 * This is lazily initialized to avoid errors during build time.
 */
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error(
      'Email configuration missing. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in environment variables.'
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

/**
 * Email template for sending questionnaire link to landlord.
 */
function getQuestionnaireEmailTemplate(
  clientName: string,
  questionnaireLink: string,
  propertyAddress: string
) {
  const textContent = `
Hello ${clientName},

Your Landlord Audit questionnaire is ready!

Please complete your property assessment for: ${propertyAddress}

Click here to start: ${questionnaireLink}

This link is unique to your audit. Please do not share it with others.

If you have any questions, please contact us.

Best regards,
The Landlord Audit Team
`.trim();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Landlord Audit Questionnaire</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Landlord Audit</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
    <h2 style="color: #333; margin-top: 0;">Hello ${clientName},</h2>
    
    <p>Your Landlord Audit questionnaire is ready!</p>
    
    <p><strong>Property:</strong> ${propertyAddress}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${questionnaireLink}" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                font-weight: bold;
                display: inline-block;">
        Start Questionnaire
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666;">
      This link is unique to your audit. Please do not share it with others.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
    
    <p style="font-size: 12px; color: #999; margin-bottom: 0;">
      If you have any questions, please contact us.<br>
      Best regards,<br>
      <strong>The Landlord Audit Team</strong>
    </p>
  </div>
</body>
</html>
`.trim();

  return { textContent, htmlContent };
}

/**
 * Send questionnaire email to landlord.
 *
 * @param to - Recipient email address
 * @param auditToken - Unique audit token for the questionnaire link
 * @param clientName - Name of the landlord/client
 * @param propertyAddress - Address of the property being audited
 */
export async function sendQuestionnaireEmail(
  to: string,
  auditToken: string,
  clientName: string,
  propertyAddress: string
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://landlord-audit.vercel.app';
  const questionnaireLink = `${baseUrl}/audit/${auditToken}`;

  const { textContent, htmlContent } = getQuestionnaireEmailTemplate(
    clientName,
    questionnaireLink,
    propertyAddress
  );

  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || 'Landlord Audit <no-reply@landlordaudit.com>';

  console.log(`[Email] Sending to ${to} from ${from}...`);

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: 'Your Landlord Audit Questionnaire is Ready',
      text: textContent,
      html: htmlContent,
    });
    console.log(`[Email] Message sent successfully: ${info.messageId}`);
  } catch (error) {
    console.error(`[Email] Failed to send email:`, error);
    // Provide more specific error details for common SMTP issues
    if (error instanceof Error) {
      if (error.message.includes('EAUTH')) {
        console.error('[Email] SMTP Authentication failed - check SMTP_USER and SMTP_PASSWORD');
      } else if (error.message.includes('ECONNREFUSED')) {
        console.error('[Email] SMTP Connection refused - check SMTP_HOST and SMTP_PORT');
      }
    }
    throw error; // Re-throw to allow handler to log/handle it
  }
}

/**
 * Verify SMTP connection is working.
 * Useful for testing configuration.
 */
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email connection verification failed:', error);
    return false;
  }
}
