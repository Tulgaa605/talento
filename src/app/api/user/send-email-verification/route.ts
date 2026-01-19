import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail, generateVerificationCodeEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Нэвтрээгүй байна" },
        { status: 401 }
      );
    }

    const { newEmail } = await request.json();

    if (!newEmail) {
      return NextResponse.json(
        { error: "Шинэ имэйл хаяг шаардлагатай" },
        { status: 400 }
      );
    }

    // Normalize email to lowercase
    const normalizedEmail = newEmail.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Имэйл хаяг буруу байна" },
        { status: 400 }
      );
    }

    // Check if new email is already used by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        id: { not: session.user.id },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Энэ имэйл хаяг өөр хэрэглэгчээс ашиглагдсан байна" },
        { status: 400 }
      );
    }

    // Check if new email is same as current email
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (currentUser?.email?.toLowerCase().trim() === normalizedEmail) {
      return NextResponse.json(
        { error: "Шинэ имэйл хаяг одоогийн имэйл хаягтай ижил байна" },
        { status: 400 }
      );
    }

    // Generate 6-digit verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    console.log('Generated email verification code:', verificationCode);

    // Delete any existing email verification requests for this user
    await prisma.passwordReset.deleteMany({
      where: { 
        userId: session.user.id,
        // We'll use a special prefix in the email field to identify email verification
        // Format: "EMAIL_VERIFY:{newEmail}"
        email: { startsWith: "EMAIL_VERIFY:" }
      },
    });

    // Create new email verification request
    // Store the new email in the email field with a prefix to distinguish from password reset
    const emailVerification = await prisma.passwordReset.create({
      data: {
        email: `EMAIL_VERIFY:${normalizedEmail}`,
        token: verificationCode,
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        userId: session.user.id,
      },
    });

    console.log('Email verification record created:', emailVerification.id);

    // Create email content for email verification (different from password reset)
    const emailContent = {
      subject: 'Имэйл хаяг баталгаажуулах код - Job Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #0C213A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Job Portal</h1>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #0C213A; margin-top: 0;">Имэйл хаяг баталгаажуулах код</h2>
            
            <p style="color: #333; font-size: 16px; line-height: 1.5;">
              ${currentUser?.name ? `Сайн байна уу, ${currentUser.name}!` : 'Сайн байна уу!'}
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.5;">
              Таны имэйл хаяг солих баталгаажуулах код:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #0C213A; color: white; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 5px; display: inline-block;">
                ${verificationCode}
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.4;">
              Энэ код 10 минутын дараа хүчингүй болно. Хэрэв та имэйл хаяг солих хүсэлт илгээгээгүй бол энэ имэйлийг үл тоомсорлож болно.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              Энэ имэйл автоматаар илгээгдсэн. Хариу бичих шаардлагагүй.
            </p>
          </div>
        </div>
      `,
      text: `
        Job Portal - Имэйл хаяг баталгаажуулах код
        
        ${currentUser?.name ? `Сайн байна уу, ${currentUser.name}!` : 'Сайн байна уу!'}
        
        Таны имэйл хаяг солих баталгаажуулах код: ${verificationCode}
        
        Энэ код 10 минутын дараа хүчингүй болно. Хэрэв та имэйл хаяг солих хүсэлт илгээгээгүй бол энэ имэйлийг үл тоомсорлож болно.
        
        Энэ имэйл автоматаар илгээгдсэн. Хариу бичих шаардлагагүй.
      `
    };
    
    console.log('Sending email verification code to:', normalizedEmail);
    const emailResult = await sendEmail({
      to: normalizedEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    console.log('Email result:', emailResult);

    if (!emailResult.success) {
      // In development mode, keep the record even if email fails
      if (emailResult.devMode) {
        console.log('=== DEVELOPMENT MODE ===');
        console.log('Email not sent, but verification record is kept for testing');
        console.log('Verification code:', verificationCode);
        console.log('Email verification ID:', emailVerification.id);
        console.log('========================');
        
        return NextResponse.json({
          success: true,
          message: `Баталгаажуулах код: ${verificationCode} (Development mode - код console дээр харагдана)`,
          devMode: true,
          code: verificationCode, // Include code in response for development
        });
      }
      
      // In production, delete the record if email fails
      await prisma.passwordReset.delete({
        where: { id: emailVerification.id },
      });
      
      console.log('Email failed, deleted email verification record');
      return NextResponse.json(
        { error: "Имэйл илгээхэд алдаа гарлаа. Дахин оролдоно уу." },
        { status: 500 }
      );
    }

    console.log('Email verification code sent successfully');
    return NextResponse.json({
      success: true,
      message: "Баталгаажуулах код шинэ имэйл хаяг руу илгээгдлээ. 10 минутын дотор хүчингүй болно.",
    });
  } catch (error) {
    console.error("Email verification request error:", error);
    return NextResponse.json(
      { error: "Дотоод серверийн алдаа" },
      { status: 500 }
    );
  }
}

