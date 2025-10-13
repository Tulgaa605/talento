// src/app/api/employer/questionnaires/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type QuestionPayload = {
  text: string;
  type: "TEXT" | "MULTIPLE_CHOICE" | "SINGLE_CHOICE";
  required: boolean;
  options?: string[] | null;
  order: number;
};

type PostBody = {
  title: string;
  description?: string;
  questions: QuestionPayload[];
  companyId: string;
  attachmentFile?: string;
  attachmentUrl?: string;
  type?: string;
};

type PutBody = {
  id: string;
  title: string;
  description?: string;
  questions: QuestionPayload[];
  attachmentFile?: string;
  attachmentUrl?: string;
  type?: string;
};

function mapQuestionForCreate(q: QuestionPayload) {
  const opts = Array.isArray(q.options) ? q.options : undefined;
  return {
    text: q.text,
    type: q.type,
    required: q.required,
    order: q.order,
    ...(opts ? { options: opts } : {}),
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true },
    });

    if (!user?.company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const questionnaires = await prisma.questionnaire.findMany({
      where: { companyId: user.company.id },
      include: {
        responses: {
          include: {
            user: { select: { name: true, email: true } },
            answers: {
              include: {
                question: {
                  select: { text: true, type: true }
                }
              }
            }
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(questionnaires);
  } catch (error) {
    console.error("Error fetching questionnaires:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as PostBody;
    const {
      title,
      description,
      questions,
      companyId,
      attachmentFile,
      attachmentUrl,
      type,
    } = body;

    if (!title || !companyId || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const questionnaire = await prisma.questionnaire.create({
      data: {
        title,
        description,
        type: type || "CUSTOM",
        attachmentFile,
        attachmentUrl,
        companyId,
        questions: {
          create: questions.map(mapQuestionForCreate),
        },
      },
      include: { questions: true },
    });

    return NextResponse.json(questionnaire);
  } catch (error) {
    console.error("Error creating questionnaire:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as PutBody;
    const { id, title, description, questions, attachmentFile, attachmentUrl, type } =
      body;

    if (!id || !title || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingQuestionnaire = await prisma.questionnaire.findUnique({
      where: { id },
      include: {
        questions: { include: { answers: true } },
      },
    });

    if (!existingQuestionnaire) {
      return NextResponse.json(
        { error: "Questionnaire not found" },
        { status: 404 }
      );
    }

    // Clean existing answers tied to questions
    for (const question of existingQuestionnaire.questions) {
      await prisma.answer.deleteMany({ where: { questionId: question.id } });
    }

    // Remove existing questions
    await prisma.question.deleteMany({ where: { questionnaireId: id } });

    const questionnaire = await prisma.questionnaire.update({
      where: { id },
      data: {
        title,
        description,
        type: type || "CUSTOM",
        attachmentFile,
        attachmentUrl,
        questions: {
          create: questions.map(mapQuestionForCreate),
        },
      },
      include: {
        questions: { orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json(questionnaire);
  } catch (error) {
    console.error("Error updating questionnaire:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Questionnaire ID is required" },
        { status: 400 }
      );
    }

    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id },
      include: {
        questions: { include: { answers: true } },
        responses: { include: { answers: true } },
      },
    });

    if (!questionnaire) {
      return NextResponse.json(
        { error: "Questionnaire not found" },
        { status: 404 }
      );
    }

    // Delete answers tied to responses
    for (const response of questionnaire.responses) {
      await prisma.answer.deleteMany({ where: { responseId: response.id } });
    }
    // Delete responses
    await prisma.questionnaireResponse.deleteMany({
      where: { questionnaireId: id },
    });

    // Delete answers tied to questions (defensive)
    for (const question of questionnaire.questions) {
      await prisma.answer.deleteMany({ where: { questionId: question.id } });
    }
    // Delete questions
    await prisma.question.deleteMany({ where: { questionnaireId: id } });

    // Delete questionnaire
    await prisma.questionnaire.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting questionnaire:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
