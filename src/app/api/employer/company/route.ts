import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Нэвтрээгүй байна" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { company: true },
    });

    if (!user || !user.company) {
      return NextResponse.json(
        { message: "Компанийн мэдээлэл олдсонгүй" },
        { status: 404 }
      );
    }

    return NextResponse.json(user.company);
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json({ message: "Алдаа гарлаа" }, { status: 500 });
  }
}
