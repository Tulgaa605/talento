import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get all questionnaires including government ones
    const questionnaires = await prisma.questionnaire.findMany({
      where: {
        OR: [
          { type: 'GOVERNMENT_EMPLOYEE' },
          { type: 'CUSTOM' },
          { type: 'PERSONAL' }
        ]
      },
      include: {
        questions: true,
        company: {
          select: {
            name: true,
            logoUrl: true
          }
        },
        responses: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
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
