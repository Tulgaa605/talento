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
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const questionnaire = await prisma.questionnaire.findUnique({
      where: {
        id: params.id,
      },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
        responses: {
          where: {
            userId: session.user.id,
          },
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });

    if (!questionnaire) {
      return new NextResponse("Questionnaire not found", { status: 404 });
    }

    // Add hasResponded flag to the response
    const response = {
      ...questionnaire,
      hasResponded: questionnaire.responses.length > 0,
      responseDate: questionnaire.responses[0]?.createdAt || null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[QUESTIONNAIRE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
