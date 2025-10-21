import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file) {
      return NextResponse.json({ message: "Файл олдсонгүй" }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json(
        { message: "Хэрэглэгчийн ID олдсонгүй" },
        { status: 400 }
      );
    }

    // Ensure the logged-in user matches the userId being updated (security check)
    if (session.user.id !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Зургийг base64 data URL болгоно (serverless-friendly)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const imageUrl = `data:${file.type};base64,${base64}`;

    // Update the user's profileImageUrl in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profileImageUrl: imageUrl },
    });

    return NextResponse.json(
      {
        message: "Зураг амжилттай хуулагдлаа",
        imageUrl,
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { message: "Зураг хуулах үед алдаа гарлаа" },
      { status: 500 }
    );
  }
}
