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
      include: { company: true },
    });

    if (!user || user.role !== "EMPLOYER") {
      return NextResponse.json(
        { error: "Ажил олгогч эрхгүй байна" },
        { status: 403 }
      );
    }

    if (!user.company) {
      return NextResponse.json(
        { error: "Компани бүртгэлгүй байна" },
        { status: 404 }
      );
    }

    const newApplicationsCount = await prisma.jobApplication.count({
      where: {
        job: {
          companyId: user.company.id,
        },
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
