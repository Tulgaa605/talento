import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { cvId, questionnaireId } = body;

    if (!cvId || !questionnaireId) {
      return NextResponse.json(
        { error: "CV ID and Questionnaire ID are required" },
        { status: 400 }
      );
    }

    const cv = await prisma.cV.findUnique({
      where: {
        id: cvId,
      },
      include: {
        user: true,
      },
    });

    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    const questionnaire = await prisma.questionnaire.findUnique({
      where: {
        id: questionnaireId,
      },
      include: {
        company: true,
      },
    });

    if (!questionnaire) {
      return NextResponse.json(
        { error: "Questionnaire not found" },
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

    if (!user?.company || user.company.id !== questionnaire.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.notification.create({
      data: {
        userId: cv.userId,
        title: "Шинэ асуулга ирлээ",
        message: `${questionnaire.title} асуулгад хариулаарай`,
        type: "QUESTIONNAIRE",
        link: `/questionnaires/${questionnaireId}`,
      },
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
