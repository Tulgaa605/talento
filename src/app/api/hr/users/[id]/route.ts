import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Нэвтэрсэн байх шаардлагатай" },
        { status: 401 }
      );
    }

    const { id: userId } = await params;

    const user = await prisma.user.findUnique({
      where: { 
        id: userId,
        role: 'USER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        position: true,
        department: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Хэрэглэгч олдсонгүй" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Хэрэглэгч авахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}