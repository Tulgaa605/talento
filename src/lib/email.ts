import nodemailer from 'nodemailer';

// Gmail SMTP configuration - only create if credentials are available
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter && process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not regular password!)
      },
    });
  }
  return transporter;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    // Check if environment variables are set
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || 
        process.env.GMAIL_USER === 'your-email@gmail.com' || 
        process.env.GMAIL_APP_PASSWORD === 'your-gmail-app-password') {
      
      // Development mode - just log the email content
      console.log('=== EMAIL WOULD BE SENT ===');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Content:', text || html.replace(/<[^>]*>/g, ''));
      console.log('========================');
      
      return { 
        success: true, 
        messageId: 'dev-mode-' + Date.now(),
        devMode: true
      };
    }

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
    };

    console.log('Attempting to send email:', { to, subject, from: process.env.GMAIL_USER });
    
    const emailTransporter = getTransporter();
    if (!emailTransporter) {
      throw new Error('Email transporter not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.');
    }
    
    const result = await emailTransporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Provide helpful error message for Gmail App Password issues
      if (errorMessage.includes('Application-specific password required') || 
          errorMessage.includes('Invalid login') ||
          errorMessage.includes('EAUTH')) {
        errorMessage = 'Gmail authentication failed. Please ensure you are using an App Password (not your regular password). Go to your Google Account settings > Security > 2-Step Verification > App passwords to generate one.';
      }
    }
    
    return { success: false, error: errorMessage };
  }
}

export function generatePasswordResetEmail(token: string, userName?: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  
  return {
    subject: 'Нууц үг сэргээх - Job Portal',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0C213A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Job Portal</h1>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #0C213A; margin-top: 0;">Нууц үг сэргээх хүсэлт</h2>
          
          <p style="color: #333; font-size: 16px; line-height: 1.5;">
            ${userName ? `Сайн байна уу, ${userName}!` : 'Сайн байна уу!'}
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.5;">
            Та нууц үгээ сэргээх хүсэлт илгээсэн байна. Доорх товчийг дарж шинэ нууц үг үүсгэх боломжтой:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #0C213A; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Нууц үг сэргээх
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.4;">
            Энэ холбоос 1 цагийн дараа хүчингүй болно. Хэрэв та нууц үг сэргээх хүсэлт илгээгээгүй бол энэ имэйлийг үл тоомсорлож болно.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Энэ имэйл автоматаар илгээгдсэн. Хариу бичих шаардлагагүй.
          </p>
        </div>
      </div>
    `,
    text: `
      Job Portal - Нууц үг сэргээх хүсэлт
      
      ${userName ? `Сайн байна уу, ${userName}!` : 'Сайн байна уу!'}
      
      Та нууц үгээ сэргээх хүсэлт илгээсэн байна. Доорх холбоосоор шинэ нууц үг үүсгэх боломжтой:
      
      ${resetUrl}
      
      Энэ холбоос 1 цагийн дараа хүчингүй болно. Хэрэв та нууц үг сэргээх хүсэлт илгээгээгүй бол энэ имэйлийг үл тоомсорлож болно.
      
      Энэ имэйл автоматаар илгээгдсэн. Хариу бичих шаардлагагүй.
    `
  };
}

export function generateVerificationCodeEmail(code: string, userName?: string) {
  return {
    subject: 'Баталгаажуулах код - Job Portal',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0C213A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Job Portal</h1>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #0C213A; margin-top: 0;">Баталгаажуулах код</h2>
          
          <p style="color: #333; font-size: 16px; line-height: 1.5;">
            ${userName ? `Сайн байна уу, ${userName}!` : 'Сайн байна уу!'}
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.5;">
            Таны нууц үг сэргээх баталгаажуулах код:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #0C213A; color: white; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 5px; display: inline-block;">
              ${code}
            </div>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.4;">
            Энэ код 10 минутын дараа хүчингүй болно. Хэрэв та нууц үг сэргээх хүсэлт илгээгээгүй бол энэ имэйлийг үл тоомсорлож болно.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Энэ имэйл автоматаар илгээгдсэн. Хариу бичих шаардлагагүй.
          </p>
        </div>
      </div>
    `,
    text: `
      Job Portal - Баталгаажуулах код
      
      ${userName ? `Сайн байна уу, ${userName}!` : 'Сайн байна уу!'}
      
      Таны нууц үг сэргээх баталгаажуулах код: ${code}
      
      Энэ код 10 минутын дараа хүчингүй болно. Хэрэв та нууц үг сэргээх хүсэлт илгээгээгүй бол энэ имэйлийг үл тоомсорлож болно.
      
      Энэ имэйл автоматаар илгээгдсэн. Хариу бичих шаардлагагүй.
    `
  };
}
