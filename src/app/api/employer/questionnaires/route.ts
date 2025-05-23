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

    // Delete existing questions
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
        questions: true,
      },
    });

    return NextResponse.json(questionnaire);
  } catch (error) {
    console.error("Error updating questionnaire:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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

    // Delete questions first due to foreign key constraint
    await prisma.question.deleteMany({
      where: {
        questionnaireId: id,
      },
    });

    // Delete questionnaire
    await prisma.questionnaire.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting questionnaire:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
