import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
    }

    const cvs = await prisma.cV.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        createdAt: true,
        status: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(cvs);
  } catch (error) {
    console.error("CV-г ачаалахад алдаа гарлаа:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "CV-г ачаалахад алдаа гарлаа",
      },
      { status: 500 }
    );
  }
}
