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

    const { id: responseId } = await params;

    // Get the questionnaire response with related data
    const response = await prisma.questionnaireResponse.findUnique({
      where: { id: responseId },
      include: {
        questionnaire: {
          include: {
            company: {
              include: {
                users: true
              }
            }
          }
        },
        user: true
      }
    });

    if (!response) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    // Check if the current user is part of the company that owns this questionnaire
    const isAuthorized = response.questionnaire.company.users.some(
      (user) => user.id === session.user.id
    );

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized to approve this response" },
        { status: 403 }
      );
    }

    // Get the response details for response
    const updatedResponse = await prisma.questionnaireResponse.findUnique({
      where: { id: responseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        questionnaire: {
          select: {
            title: true
          }
        }
      }
    });

    // Update user status to approved
    await prisma.user.update({
      where: { id: response.userId },
      data: { status: "APPROVED" }
    });

    // Create notification for the user
    await prisma.notification.create({
      data: {
        userId: response.userId,
        title: "Таны анкет зөвшөөрөгдлөө",
        message: `${response.questionnaire.title} анкет зөвшөөрөгдлөө. Одоо та ажилтны бүртгэлд орж болно.`,
        type: "QUESTIONNAIRE_APPROVED",
        link: `/employer/hr/employees/new?userId=${response.userId}`,
        createdAt: new Date(),
      },
    });

    return NextResponse.json(updatedResponse);
  } catch (error) {
    console.error("Error approving questionnaire response:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
