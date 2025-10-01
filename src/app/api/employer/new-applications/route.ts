import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Нэвтэрсэн байх шаардлагатай" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { company: true },
    });

    if (!user?.company) {
      return NextResponse.json({ error: "Компани олдсонгүй" }, { status: 404 });
    }

    const newApplicationsCount = await prisma.jobApplication.count({
      where: {
        job: {
          companyId: user.company.id,
        },
        status: "PENDING",
        OR: [
          { viewedAt: null },
          { viewedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        ],
      },
    });

    return NextResponse.json({ count: newApplicationsCount });
  } catch (error) {
    console.error("Error fetching new applications count:", error);
    return NextResponse.json(
      { error: "Шинэ өргөдлийн тоог ачаалахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}
