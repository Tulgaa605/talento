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

    // Get user's applications
    const newApplicationsCount = await prisma.jobApplication.count({
      where: {
        user: {
          email: session.user.email,
        },
        status: "PENDING",
        OR: [
          { viewedAt: null },
          { viewedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }, // Applications not viewed in last 24 hours
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
