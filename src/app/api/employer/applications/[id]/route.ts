import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
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

    const { id: applicationId } = await params;
    const { status } = await request.json();
    if (!status) {
      return NextResponse.json({ error: "Статус оруулна уу" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true },
    });

    if (!user?.company) {
      return NextResponse.json({ error: "Компани олдсонгүй" }, { status: 404 });
    }

    const application = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        job: {
          companyId: user.company.id,
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Өргөдөл олдсонгүй" }, { status: 404 });
    }

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status,
        viewedAt: application.viewedAt ? application.viewedAt : new Date(),
      },
    });

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Статус шинэчлэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}
