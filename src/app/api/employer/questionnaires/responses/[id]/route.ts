import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { formData } = body;

    if (!formData) {
      return NextResponse.json(
        { error: "Form data is required" },
        { status: 400 }
      );
    }

    // Verify that the user has access to this response (employer owns the questionnaire)
    const response = await prisma.questionnaireResponse.findUnique({
      where: { id },
      include: {
        questionnaire: {
          include: {
            company: {
              include: {
                users: true
              }
            }
          }
        }
      }
    });

    if (!response) {
      return NextResponse.json(
        { error: "Response not found" },
        { status: 404 }
      );
    }

    // Check if the current user is part of the company that owns this questionnaire
    const isAuthorized = response.questionnaire.company.users.some(
      (user) => user.id === session.user.id
    );

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized to edit this response" },
        { status: 403 }
      );
    }

    // Update the response
    const updatedResponse = await prisma.questionnaireResponse.update({
      where: { id },
      data: {
        formData: JSON.stringify(formData),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        answers: {
          include: {
            question: {
              select: {
                text: true,
                type: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(updatedResponse);
  } catch (error) {
    console.error("Error updating questionnaire response:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

