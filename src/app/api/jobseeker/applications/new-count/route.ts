import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "USER") {
      return NextResponse.json(
        { error: "Ажил хайгч эрхгүй байна" },
        { status: 403 }
      );
    }

    const newApplicationsCount = await prisma.jobApplication.count({
      where: {
        userId: user.id,
        status: "PENDING",
      },
    });

    return NextResponse.json({ count: newApplicationsCount });
  } catch (error) {
    return NextResponse.json(
      { error: "Системийн алдаа гарлаа" },
      { status: 500 }
    );
  }
}
