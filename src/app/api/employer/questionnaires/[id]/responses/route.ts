import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const questionnaireId = params.id;

    // Get the questionnaire to verify ownership
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

    // Verify that the user is associated with the company
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

    // Fetch responses with user and answer details
    const responses = await prisma.questionnaireResponse.findMany({
      where: {
        questionnaireId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        answers: {
          include: {
            question: {
              select: {
                text: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(responses);
  } catch (error) {
    console.error("Error fetching questionnaire responses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
