import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json();

    console.log('=== RESET PASSWORD API CALLED ===');
    console.log('Email received:', email);
    console.log('Code received:', code);
    console.log('Code type:', typeof code);

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "Бүх талбарыг бөглөнө үү" },
        { status: 400 }
      );
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = code.toString().trim();

    console.log('Normalized email:', normalizedEmail);
    console.log('Normalized code:', normalizedCode);

    // Find the password reset request
    const passwordReset = await prisma.passwordReset.findFirst({
      where: {
        email: normalizedEmail,
        token: normalizedCode,
        used: false,
        expires: {
          gt: new Date(), // Not expired
        },
      },
      include: {
        user: true,
      },
    });

    console.log('Password reset record found:', passwordReset ? 'YES' : 'NO');
    if (passwordReset) {
      console.log('Password reset details:', {
        id: passwordReset.id,
        email: passwordReset.email,
        token: passwordReset.token,
        expires: passwordReset.expires,
        used: passwordReset.used,
      });
    } else {
      // Debug: Check if there are any records for this email
      const allRecords = await prisma.passwordReset.findMany({
        where: { 
          email: normalizedEmail,
        },
      });
      console.log('All password reset records for this email:', allRecords.map(r => ({
        id: r.id,
        email: r.email,
        token: r.token,
        expires: r.expires,
        used: r.used,
        expired: r.expires < new Date(),
        tokenMatch: r.token === normalizedCode,
      })));
      
      // Also check all recent records (last 30 minutes) to help debug
      const recentRecords = await prisma.passwordReset.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 60 * 1000), // Last 30 minutes
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      });
      console.log('Recent password reset records (last 30 min):', recentRecords.map(r => ({
        id: r.id,
        email: r.email,
        token: r.token,
        expires: r.expires,
        used: r.used,
        createdAt: r.createdAt,
      })));
    }

    if (!passwordReset) {
      return NextResponse.json(
        { error: "Баталгаажуулах код буруу эсвэл хүчингүй болсон байна" },
        { status: 400 }
      );
    }

    // Validate new password
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await prisma.user.update({
      where: { id: passwordReset.userId },
      data: { password: hashedPassword },
    });

    // Mark password reset as used
    await prisma.passwordReset.update({
      where: { id: passwordReset.id },
      data: { used: true },
    });

    // Delete all other password reset requests for this user
    await prisma.passwordReset.deleteMany({
      where: {
        userId: passwordReset.userId,
        id: { not: passwordReset.id },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Нууц үг амжилттай солигдлоо. Шинэ нууц үгээрээ нэвтэрнэ үү.",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Дотоод серверийн алдаа" },
      { status: 500 }
    );
  }
}
