import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const responses = await prisma.questionnaireResponse.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        questionnaire: {
          include: {
            company: {
              select: {
                name: true,
                logoUrl: true,
              },
            },
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

    const createdQuestionnaires = await prisma.questionnaire.findMany({
      where: {
        company: {
          name: "Хувийн анкет"
        }
      },
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true,
          },
        },
        questions: true,
        responses: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch government questionnaires sent to this user via job applications
    const sentQuestionnaires = await prisma.jobApplication.findMany({
      where: {
        userId: session.user.id,
        questionnaireId: {
          not: null,
        },
      },
      include: {
        questionnaire: {
          include: {
            company: {
              select: {
                name: true,
                logoUrl: true,
              },
            },
            questions: true,
          },
        },
        job: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`Found ${responses.length} questionnaire responses for user ${session.user.id}`);
    console.log(`Found ${createdQuestionnaires.length} created questionnaires`);
    console.log(`Found ${sentQuestionnaires.length} sent questionnaires`);

    const formattedResponses = responses.map((response) => ({
      id: response.id,
      questionnaireId: response.questionnaireId,
      questionnaireTitle: response.questionnaire.title,
      questionnaireDescription: response.questionnaire.description,
      questionnaireType: response.questionnaire.type,
      companyName: response.questionnaire.company?.name || 'Хувийн анкет',
      companyLogoUrl: response.questionnaire.company?.logoUrl || null,
      submittedAt: response.createdAt,
      attachmentFile: response.attachmentFile,
      attachmentUrl: response.attachmentUrl,
      formData: response.formData,
      type: 'response',
      status: 'submitted',
      answers: response.answers.map((answer) => ({
        questionId: answer.questionId,
        questionText: answer.question.text,
        questionType: answer.question.type,
        value: answer.value,
      })),
    }));

    const formattedCreated = createdQuestionnaires.map((questionnaire) => ({
      id: questionnaire.id,
      questionnaireId: questionnaire.id,
      questionnaireTitle: questionnaire.title,
      questionnaireDescription: questionnaire.description,
      questionnaireType: questionnaire.type,
      companyName: questionnaire.company?.name || 'Хувийн анкет',
      companyLogoUrl: questionnaire.company?.logoUrl || null,
      submittedAt: questionnaire.createdAt,
      attachmentFile: questionnaire.attachmentFile,
      attachmentUrl: questionnaire.attachmentUrl,
      formData: null,
      type: 'created',
      status: 'created',
      responseCount: questionnaire.responses.length,
      questions: questionnaire.questions,
    }));

    // Format sent (pending) questionnaires
    const formattedSent = sentQuestionnaires
      .filter(app => app.questionnaire) // Only include if questionnaire exists
      .filter(app => {
        // Check if user has already responded to this questionnaire
        const alreadyResponded = responses.some(r => r.questionnaireId === app.questionnaireId);
        return !alreadyResponded;
      })
      .map((application) => ({
        id: `sent-${application.id}`,
        questionnaireId: application.questionnaireId!,
        questionnaireTitle: application.questionnaire!.title,
        questionnaireDescription: application.questionnaire!.description,
        questionnaireType: application.questionnaire!.type,
        companyName: application.questionnaire!.company?.name || 'Компани',
        companyLogoUrl: application.questionnaire!.company?.logoUrl || null,
        submittedAt: application.createdAt,
        jobTitle: application.job?.title || '',
        attachmentFile: null,
        attachmentUrl: null,
        formData: null,
        type: 'sent',
        status: 'pending',
        answers: [],
      }));

    const allQuestionnaires = [...formattedResponses, ...formattedCreated, ...formattedSent].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    return NextResponse.json(allQuestionnaires);
  } catch (error) {
    console.error("Error fetching user questionnaires:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
