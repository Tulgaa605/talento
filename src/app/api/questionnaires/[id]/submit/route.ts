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

    const { id: questionnaireId } = params;
    const body = await request.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Answers are required" },
        { status: 400 }
      );
    }

    // Get the questionnaire
    const questionnaire = await prisma.questionnaire.findUnique({
      where: {
        id: questionnaireId,
      },
      include: {
        questions: true,
      },
    });

    if (!questionnaire) {
      return NextResponse.json(
        { error: "Questionnaire not found" },
        { status: 404 }
      );
    }

    // Create questionnaire response
    const response = await prisma.questionnaireResponse.create({
      data: {
        questionnaireId,
        userId: session.user.id,
        answers: {
          create: answers.map(
            (answer: { questionId: string; answer: string }) => ({
              questionId: answer.questionId,
              value: answer.answer,
            })
          ),
        },
      },
    });

    // Create notification for the employer
    await prisma.notification.create({
      data: {
        userId: questionnaire.companyId, // This will notify the company
        title: "Шинэ асуулгын хариу ирлээ",
        message: `${session.user.name} асуулгад хариулсан байна`,
        type: "QUESTIONNAIRE_RESPONSE",
        link: `/employer/questionnaires/${questionnaireId}/responses/${response.id}`,
      },
    });

    return NextResponse.json({ success: true, responseId: response.id });
  } catch (error) {
    console.error("Error submitting questionnaire:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
