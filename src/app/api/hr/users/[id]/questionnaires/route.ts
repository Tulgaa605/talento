import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCompanyId } from '@/lib/hr-utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Нэвтэрсэн байх шаардлагатай" },
        { status: 401 }
      );
    }

    const { id: userId } = await params;

    // Get current user's companyId
    const companyId = await getCompanyId(session.user.id);
    
    if (!companyId) {
      return NextResponse.json([]);
    }

    // Verify the requested user belongs to this company
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Хэрэглэгч олдсонгүй" },
        { status: 404 }
      );
    }

    // Allow access if:
    // 1. User belongs to this company (user.companyId === companyId)
    // 2. User is a jobseeker (companyId: null) who has submitted questionnaires for this company
    if (user.companyId !== companyId) {
      if (user.companyId === null) {
        // Jobseeker - check if they have submitted questionnaires for this company
        const hasQuestionnaireResponse = await prisma.questionnaireResponse.findFirst({
          where: {
            userId: userId,
            questionnaire: {
              companyId: companyId,
            },
          },
        });

        if (!hasQuestionnaireResponse) {
          return NextResponse.json(
            { error: "Энэ хэрэглэгч танай компанид хамаарахгүй байна" },
            { status: 403 }
          );
        }
      } else {
        // User belongs to another company - deny access
        return NextResponse.json(
          { error: "Энэ хэрэглэгч танай компанид хамаарахгүй байна" },
          { status: 403 }
        );
      }
    }

    // Get questionnaires for this company
    const companyQuestionnaires = await prisma.questionnaire.findMany({
      where: { companyId: companyId },
      select: { id: true },
    });

    const questionnaireIds = companyQuestionnaires.map(q => q.id);

    if (questionnaireIds.length === 0) {
      return NextResponse.json([]);
    }

    // Get questionnaire responses for this user from this company's questionnaires
    const responses = await prisma.questionnaireResponse.findMany({
      where: {
        userId: userId,
        questionnaireId: { in: questionnaireIds },
      },
      select: {
        id: true,
        questionnaireId: true,
        createdAt: true,
        attachmentFile: true,
        attachmentUrl: true,
        formData: true,
        questionnaire: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
        answers: {
          select: {
            id: true,
            value: true,
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
    console.error("Error fetching user questionnaire responses:", error);
    return NextResponse.json(
      { error: "Албан хаагчийн анкетийг авахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}

