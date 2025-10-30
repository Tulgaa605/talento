import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "Бүх талбарыг бөглөнө үү" },
        { status: 400 }
      );
    }

    // Find the password reset request
    const passwordReset = await prisma.passwordReset.findFirst({
      where: {
        email,
        token: code,
        used: false,
        expires: {
          gt: new Date(), // Not expired
        },
      },
      include: {
        user: true,
      },
    });

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
