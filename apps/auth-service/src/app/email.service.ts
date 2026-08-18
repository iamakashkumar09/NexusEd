import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendOtpEmail(to: string, code: string, type: 'REGISTER' | 'RESET_PASSWORD') {
    const subject = type === 'REGISTER' 
      ? 'Verify your NexusEd account' 
      : 'Reset your NexusEd password';
      
    const headerText = type === 'REGISTER'
      ? 'Welcome to NexusEd!'
      : 'Password Reset Request';

    const bodyText = type === 'REGISTER'
      ? 'Thank you for signing up. Please use the following One-Time Password (OTP) to verify your email address and activate your account. This code is valid for 10 minutes.'
      : 'We received a request to reset your password. Please use the following One-Time Password (OTP) to reset it. This code is valid for 10 minutes.';

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0914; color: #ffffff; }
        .container { max-width: 600px; margin: 40px auto; background-color: #151226; border-radius: 16px; overflow: hidden; border: 1px solid #2a2440; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
        .header { padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #2a1659 0%, #151226 100%); border-bottom: 1px solid #2a2440; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #eaddff; }
        .content { padding: 40px 30px; text-align: center; }
        .content p { font-size: 15px; line-height: 1.6; color: #a89fcc; margin-bottom: 30px; }
        .otp-box { background-color: #0b0914; border: 1px solid #3d2b73; border-radius: 12px; padding: 20px; margin: 0 auto 30px auto; max-width: 300px; }
        .otp-code { font-size: 52px; font-weight: 800; letter-spacing: 12px; color: #d0bfff; margin: 0; }
        .footer { padding: 30px; text-align: center; border-top: 1px solid #2a2440; background-color: #0f0c1c; }
        .footer p { font-size: 12px; color: #6b638c; margin: 0; }
        .accent { color: #9f7aea; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nexus<span class="accent">Ed</span></h1>
        </div>
        <div class="content">
          <h2 style="font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 0;">${headerText}</h2>
          <p>${bodyText}</p>
          <div class="otp-box">
            <p class="otp-code">${code}</p>
          </div>
          <p style="font-size: 13px; color: #6b638c; margin-bottom: 0;">If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} NexusEd. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    try {
      if (!process.env.SMTP_USER) {
        // If no SMTP configured, just log it out (development mode)
        this.logger.debug(`[Mock Email] To: ${to} | Type: ${type} | OTP: ${code}`);
        return true;
      }
      
      await this.transporter.sendMail({
        from: `"NexusEd" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`OTP email sent to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      return false;
    }
  }
}
