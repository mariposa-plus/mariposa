import nodemailer from 'nodemailer';

// Check if we're in development mode and SMTP is not configured
const isDevelopment = process.env.NODE_ENV === 'development';
const hasEmailConfig = process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS;

// Create reusable transporter using SMTP credentials
const transporter = hasEmailConfig
  ? nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '465'),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      debug: isDevelopment, // Enable debug logs in development
      logger: isDevelopment, // Enable logger in development
    })
  : null;

/**
 * Verify SMTP connection
 */
export async function verifyEmailConnection(): Promise<void> {
  if (!transporter) {
    console.warn('⚠️  Email service not configured - emails will be logged to console');
    return;
  }

  try {
    await transporter.verify();
    console.log('✅ Email service connected successfully');
  } catch (error: any) {
    console.error('❌ Email service connection failed:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      secure: process.env.EMAIL_SECURE,
      error: error.message,
    });
    throw new Error(`Email service verification failed: ${error.message}`);
  }
}

/**
 * Send OTP code via email using SMTP
 */
export async function sendOTPEmail(email: string, code: string): Promise<void> {
  const emailContent = {
    from: process.env.EMAIL_FROM || 'Pipeline Builder <noreply@mariposa.plus>',
    to: email,
    subject: 'Your Login Code',
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a2e; margin-bottom: 20px;">Login to Pipeline Builder</h2>
        <p style="color: #666; margin-bottom: 20px;">Enter this code to complete your login:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1a2e;">${code}</span>
        </div>
        <p style="color: #999; font-size: 14px;">This code expires in 10 minutes.</p>
        <p style="color: #999; font-size: 14px;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  };

  // Development fallback: log to console if no SMTP configured
  if (!transporter) {
    console.log('\n📧 [DEV MODE] Email would be sent:');
    console.log('━'.repeat(50));
    console.log(`To: ${email}`);
    console.log(`Subject: ${emailContent.subject}`);
    console.log(`OTP Code: ${code}`);
    console.log('━'.repeat(50) + '\n');
    return;
  }

  try {
    const info = await transporter.sendMail(emailContent);
    console.log('✅ OTP email sent successfully:', {
      to: email,
      messageId: info.messageId,
      response: info.response,
    });
  } catch (error: any) {
    console.error('❌ Error sending OTP email:', {
      to: email,
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });

    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed - please check EMAIL_USER and EMAIL_PASS');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      throw new Error('Failed to connect to email server - please check EMAIL_HOST and EMAIL_PORT');
    } else if (error.code === 'ESOCKET') {
      throw new Error('Email socket error - please check EMAIL_SECURE setting');
    } else {
      throw new Error(`Failed to send OTP email: ${error.message}`);
    }
  }
}
