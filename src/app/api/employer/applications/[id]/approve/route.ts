import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: applicationId } = await params;

    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { job: { include: { company: true } }, user: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true },
    });

    if (!user?.company || user.company.id !== application.job.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status: "EMPLOYER_APPROVED" },
    });

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: "Шинэ CV зөвшөөрөх хүсэлт",
          message: `${application.job.title} ажлын байрны ${application.user.name} нэртэй хүний CV-г ажил олгогч зөвшөөрлөө.`,
          type: "ADMIN_APPROVAL_REQUEST",
          link: `/admin/applications/${applicationId}`,
          createdAt: new Date(),
        },
      });
    }

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("Error approving application:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}