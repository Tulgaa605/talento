import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Нэвтрээгүй байна" },
        { status: 401 }
      );
    }

    const { code, newEmail } = await request.json();

    if (!code || !newEmail) {
      return NextResponse.json(
        { error: "Код болон шинэ имэйл хаяг шаардлагатай" },
        { status: 400 }
      );
    }

    // Normalize email to lowercase
    const normalizedEmail = newEmail.toLowerCase().trim();
    const normalizedCode = code.toString().trim();

    // Find the email verification record
    const emailVerification = await prisma.passwordReset.findFirst({
      where: {
        userId: session.user.id,
        email: `EMAIL_VERIFY:${normalizedEmail}`,
        used: false,
        expires: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!emailVerification) {
      return NextResponse.json(
        { error: "Баталгаажуулах код олдсонгүй эсвэл хүчингүй болсон байна" },
        { status: 400 }
      );
    }

    // Verify the code
    if (emailVerification.token !== normalizedCode) {
      return NextResponse.json(
        { error: "Баталгаажуулах код буруу байна" },
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

    // Update user email
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { email: normalizedEmail },
    });

    // Mark verification as used
    await prisma.passwordReset.update({
      where: { id: emailVerification.id },
      data: { used: true },
    });

    // Delete all other email verification requests for this user
    await prisma.passwordReset.deleteMany({
      where: {
        userId: session.user.id,
        email: { startsWith: "EMAIL_VERIFY:" },
        id: { not: emailVerification.id },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Имэйл хаяг амжилттай шинэчлэгдлээ",
      user: {
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Дотоод серверийн алдаа" },
      { status: 500 }
    );
  }
}

