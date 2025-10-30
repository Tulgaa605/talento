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

    // Check if user exists
    console.log('Looking for user with email:', email);
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('User not found:', email);
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
    const passwordReset = await prisma.passwordReset.create({
      data: {
        email: user.email!,
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
      // If email fails, delete the password reset record
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
