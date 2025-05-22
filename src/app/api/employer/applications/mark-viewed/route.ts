import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Нэвтэрсэн байх шаардлагатай" },
        { status: 401 }
      );
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { company: true },
    });

    if (!user?.company) {
      return NextResponse.json({ error: "Компани олдсонгүй" }, { status: 404 });
    }

    // Mark all pending applications as viewed
    await prisma.jobApplication.updateMany({
      where: {
        job: {
          companyId: user.company.id,
        },
        status: "PENDING",
        viewedAt: null,
      },
      data: {
        viewedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking applications as viewed:", error);
    return NextResponse.json(
      { error: "Өргөдлүүдийг тэмдэглэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}
