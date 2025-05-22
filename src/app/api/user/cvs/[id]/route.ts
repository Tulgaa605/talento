import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Нэвтрээгүй байна" },
        { status: 401 }
      );
    }

    const cvId = context.params.id;

    // Check if the CV exists and belongs to the user
    const cv = await prisma.cV.findFirst({
      where: {
        id: cvId,
        userId: session.user.id,
      },
    });

    if (!cv) {
      return NextResponse.json(
        { error: "CV олдсонгүй" },
        { status: 404 }
      );
    }

    // Delete the CV
    await prisma.cV.delete({
      where: {
        id: cvId,
      },
    });

    return NextResponse.json({ message: "CV амжилттай устгагдлаа" });
  } catch (error) {
    console.error("Error deleting CV:", error);
    return NextResponse.json(
      { error: "CV устгахад алдаа гарлаа" },
      { status: 500 }
    );
  }
} 