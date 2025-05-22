import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
    }

    // Get user's applications
    const applications = await prisma.jobApplication.findMany({
      where: {
        user: {
          email: session.user.email,
        },
      },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        cv: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching user applications:", error);
    return NextResponse.json(
      { error: "Өргөдлүүдийг ачаалахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}
