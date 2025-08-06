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

    // ✅ role нь EMPLOYER эсвэл ADMIN байх ёстой
    const user = await prisma.user.findFirst({
      where: {
        email: session.user.email,
        OR: [
          { role: "EMPLOYER" },
          { role: "ADMIN" }
        ]
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
        { status: 403 }
      );
    }

    if (!user.company) {
      return NextResponse.json(
        { error: "Таны компани олдсонгүй. Эхлээд компани бүртгүүлнэ үү." },
        { status: 404 }
      );
    }

    // 1. Get all jobs posted by this company
    const jobs = await prisma.job.findMany({
      where: {
        companyId: user.company.id,
      },
      select: {
        id: true,
        title: true,
      },
    });

    const jobIds = jobs.map((job) => job.id);

    if (jobIds.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Get all applications for these jobs
    const applications = await prisma.jobApplication.findMany({
      where: {
        jobId: {
          in: jobIds,
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
    console.error("❌ Error in GET /api/employer/applications:", error);
    return NextResponse.json(
      { error: "Системийн алдаа гарлаа. Дараа дахин оролдоно уу." },
      { status: 500 }
    );
  }
}
