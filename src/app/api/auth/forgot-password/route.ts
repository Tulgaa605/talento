import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, generateVerificationCodeEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    console.log('=== FORGOT PASSWORD API CALLED ===');
    const { email } = await request.json();
    console.log('Email received:', email);

    if (!email) {
      console.log('No email provided');
      return NextResponse.json(
        { error: "Имэйл хаяг шаардлагатай" },
        { status: 400 }
      );
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    console.log('Normalized email:', normalizedEmail);

    // Check if user exists - try exact match first, then case-insensitive
    console.log('Looking for user with email:', normalizedEmail);
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // If not found, try case-insensitive search (for MongoDB)
    if (!user) {
      console.log('Exact match not found, trying case-insensitive search...');
      const users = await prisma.user.findMany({
        where: {
          email: {
            not: null,
          },
        },
      });
      user = users.find(u => u.email?.toLowerCase().trim() === normalizedEmail) || null;
    }

    if (!user) {
      console.log('User not found with email:', normalizedEmail);
      return NextResponse.json(
        { error: "Энэ имэйл хаягтай хэрэглэгч олдсонгүй" },
        { status: 404 }
      );
    }

    console.log('User found:', user.email);

    // Generate 6-digit verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    console.log('Generated verification code:', verificationCode);

    // Delete any existing password reset requests for this user
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    });

    // Create new password reset request
    // Use normalized email to ensure consistency
    const passwordReset = await prisma.passwordReset.create({
      data: {
        email: normalizedEmail, // Use normalized email instead of user.email
        token: verificationCode,
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        userId: user.id,
      },
    });

    console.log('Password reset record created:', passwordReset.id);

    // Send verification code email
    const emailContent = generateVerificationCodeEmail(verificationCode, user.name || undefined);
    
    console.log('Sending email to:', user.email);
    const emailResult = await sendEmail({
      to: user.email!,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    console.log('Email result:', emailResult);

    if (!emailResult.success) {
      // In development mode, keep the record even if email fails
      // User can see the code in console logs
      if (emailResult.devMode) {
        console.log('=== DEVELOPMENT MODE ===');
        console.log('Email not sent, but password reset record is kept for testing');
        console.log('Verification code:', verificationCode);
        console.log('Password reset ID:', passwordReset.id);
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
        where: { id: passwordReset.id },
      });
      
      console.log('Email failed, deleted password reset record');
      return NextResponse.json(
        { error: "Имэйл илгээхэд алдаа гарлаа. Дахин оролдоно уу." },
        { status: 500 }
      );
    }

    console.log('Email sent successfully');
    return NextResponse.json({
      success: true,
      message: "Баталгаажуулах код имэйлдээ илгээгдлээ. 10 минутын дотор хүчингүй болно.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Дотоод серверийн алдаа" },
      { status: 500 }
    );
  }
}
