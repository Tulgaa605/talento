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
    const formData = await request.formData();
    const questionnaireId = formData.get("questionnaireId") as string;

    if (!questionnaireId) {
      return NextResponse.json(
        { error: "Questionnaire ID is required" },
        { status: 400 }
      );
    }

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

    const questionnaire = await prisma.questionnaire.findUnique({
      where: {
        id: questionnaireId,
      },
    });

    if (!questionnaire) {
      return NextResponse.json(
        { error: "Questionnaire not found" },
        { status: 404 }
      );
    }

    await prisma.notification.create({
      data: {
        userId: application.userId,
        title: "Шинэ асуулга ирлээ",
        message: `${questionnaire.title} асуулгад хариулаарай`,
        type: "QUESTIONNAIRE",
        link: `/questionnaires/${questionnaireId}`,
      },
    });
    await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { questionnaireId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending questionnaire:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
