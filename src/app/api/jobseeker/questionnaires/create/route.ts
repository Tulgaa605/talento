import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface QuestionPayload {
  text: string;
  type: string;
  required: boolean;
  options?: string[];
  order: number;
}

interface PostBody {
  title: string;
  description: string;
  questions: QuestionPayload[];
  type?: string;
  attachmentFile?: string;
  attachmentUrl?: string;
}

function mapQuestionForCreate(q: QuestionPayload) {
  const opts = q.options?.filter(Boolean);
  return {
    text: q.text,
    type: q.type,
    required: q.required,
    order: q.order,
    ...(opts ? { options: opts } : {}),
  };
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as PostBody;
    const {
      title,
      description,
      questions,
      attachmentFile,
      attachmentUrl,
      type,
    } = body;

    if (!title || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Заавал оруулах талбаруудыг бөглөнө үү" },
        { status: 400 }
      );
    }

    // Create or find a dummy company for jobseeker questionnaires
    let dummyCompany = await prisma.company.findFirst({
      where: { name: "Хувийн анкет" }
    });

    if (!dummyCompany) {
      dummyCompany = await prisma.company.create({
        data: {
          name: "Хувийн анкет",
          description: "Jobseeker personal questionnaires",
          location: "Mongolia"
        }
      });
    }

    // Create the questionnaire
    const questionnaire = await prisma.questionnaire.create({
      data: {
        title,
        description: description || "",
        type: type || "PERSONAL",
        attachmentFile,
        attachmentUrl,
        companyId: dummyCompany.id,
        questions: {
          create: questions.map(mapQuestionForCreate)
        }
      },
      include: {
        questions: true,
        company: {
          select: {
            name: true,
            logoUrl: true
          }
        }
      }
    });

    return NextResponse.json(questionnaire);
  } catch (error) {
    console.error("Error creating jobseeker questionnaire:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}