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

    // Get user with company info
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
        role: "EMPLOYER", // Ensure user is an employer
      },
      include: {
        company: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Та ажил олгогч эрхгүй байна. Эхлээд ажил олгогчоор бүртгүүлнэ үү.",
        },
        { status: 404 }
      );
    }

    if (!user.company) {
      return NextResponse.json(
        { error: "Таны компани олдсонгүй. Эхлээд компани бүртгүүлнэ үү." },
        { status: 404 }
      );
    }

    // Get all applications for jobs posted by this company
    const applications = await prisma.jobApplication.findMany({
      where: {
        job: {
          companyId: user.company.id,
        },
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        cv: {
          select: {
            id: true,
            fileName: true,
            fileUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error in GET /api/employer/applications:", error);
    return NextResponse.json(
      { error: "Системийн алдаа гарлаа. Дараа дахин оролдоно уу." },
      { status: 500 }
    );
  }
}
