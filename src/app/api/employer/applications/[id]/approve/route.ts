import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applicationId = params.id;

    // Get the application and verify ownership
    const application = await prisma.jobApplication.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        user: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Verify that the user is associated with the company
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        company: true,
      },
    });

    if (!user?.company || user.company.id !== application.job.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update application status
    const updatedApplication = await prisma.jobApplication.update({
      where: {
        id: applicationId,
      },
      data: {
        status: "ACCEPTED",
      },
    });

    // Create notification for the applicant
    await prisma.notification.create({
      data: {
        userId: application.userId,
        title: "Таны CV зөвшөөрөгдлөө",
        message: `${application.job.title} ажлын байрны CV зөвшөөрөгдлөө`,
        type: "CV_APPROVED",
        link: `/jobs/${application.jobId}`,
      },
    });

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("Error approving application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
