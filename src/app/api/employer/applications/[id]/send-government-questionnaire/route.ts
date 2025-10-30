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

    // Get the application with user info
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

    if (!application || !application.userId) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Verify the employer has access to this application
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

    // Find or create the government employee questionnaire
    let governmentQuestionnaire = await prisma.questionnaire.findFirst({
      where: {
        type: "GOVERNMENT_EMPLOYEE",
        companyId: user.company.id,
      },
    });

    // If it doesn't exist, create one
    if (!governmentQuestionnaire) {
      governmentQuestionnaire = await prisma.questionnaire.create({
        data: {
          title: "Төрийн албан хаагчийн анкет",
          description: "Төрийн албан хаагчийн мэдээлэл бөглөх анкет",
          type: "GOVERNMENT_EMPLOYEE",
          companyId: user.company.id,
        },
      });
    }

    // Create notification for the jobseeker
    if (application.userId) {
      await prisma.notification.create({
        data: {
          userId: application.userId,
          title: "Төрийн албан хаагчийн анкет ирлээ",
          message: `${user.company.name} компани танд Төрийн албан хаагчийн анкет илгээсэн байна. Анкетаа бөглөнө үү.`,
          type: "GOVERNMENT_QUESTIONNAIRE",
          link: `/government-questionnaire/${governmentQuestionnaire.id}`,
        },
      });
    }

    // Update the application with questionnaire reference
    await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { questionnaireId: governmentQuestionnaire.id },
    });

    return NextResponse.json({ 
      success: true,
      questionnaireId: governmentQuestionnaire.id 
    });
  } catch (error) {
    console.error("Error sending government questionnaire:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

