import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      );
    }

    const questionnaires = await prisma.questionnaire.findMany({
      where: {
        companyId,
      },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
      },
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

    const body = await request.json();
    const { title, description, questions, companyId } = body;

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
        companyId,
        questions: {
          create: questions.map((q: any) => ({
            text: q.text,
            type: q.type,
            required: q.required,
            options: q.options,
            order: q.order,
          })),
        },
      },
      include: {
        questions: true,
      },
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

    const body = await request.json();
    const { id, title, description, questions } = body;

    if (!id || !title || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // First check if the questionnaire exists
    const existingQuestionnaire = await prisma.questionnaire.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
      },
    });

    if (!existingQuestionnaire) {
      return NextResponse.json(
        { error: "Questionnaire not found" },
        { status: 404 }
      );
    }

    // Delete existing answers first
    for (const question of existingQuestionnaire.questions) {
      await prisma.answer.deleteMany({
        where: {
          questionId: question.id,
        },
      });
    }

    // Then delete existing questions
    await prisma.question.deleteMany({
      where: {
        questionnaireId: id,
      },
    });

    // Update questionnaire and create new questions
    const questionnaire = await prisma.questionnaire.update({
      where: {
        id,
      },
      data: {
        title,
        description,
        questions: {
          create: questions.map((q: any) => ({
            text: q.text,
            type: q.type,
            required: q.required,
            options: q.options,
            order: q.order,
          })),
        },
      },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
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

    // First check if the questionnaire exists and get all related data
    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
        responses: {
          include: {
            answers: true,
          },
        },
      },
    });

    if (!questionnaire) {
      return NextResponse.json(
        { error: "Questionnaire not found" },
        { status: 404 }
      );
    }

    // Delete all answers first
    for (const response of questionnaire.responses) {
      await prisma.answer.deleteMany({
        where: {
          responseId: response.id,
        },
      });
    }

    // Delete all responses
    await prisma.questionnaireResponse.deleteMany({
      where: {
        questionnaireId: id,
      },
    });

    // Delete all question answers
    for (const question of questionnaire.questions) {
      await prisma.answer.deleteMany({
        where: {
          questionId: question.id,
        },
      });
    }

    // Delete all questions
    await prisma.question.deleteMany({
      where: {
        questionnaireId: id,
      },
    });

    // Finally delete the questionnaire
    await prisma.questionnaire.delete({
      where: {
        id,
      },
    });

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
