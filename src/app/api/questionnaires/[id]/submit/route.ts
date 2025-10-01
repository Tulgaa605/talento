// File: src/app/api/questionnaires/[id]/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** ---- Types for request body (answers) and question shape ---- */
type QuestionnaireAnswers = {
  personalInfo?: {
    fatherName?: string;
    name?: string;
    gender?: string;
    birthYear?: string;
    birthMonth?: string;
    birthAimag?: string;
    birthSoum?: string;
    birthPlace?: string;
    surname?: string;
    ethnicity?: string;
    socialOrigin?: string;
    currentAddress?: {
      aimag?: string;
      soum?: string;
      homeAddress?: string;
      phone?: string;
      mobile?: string;
      email?: string;
    };
  };
  education?: {
    generalEducation?: Array<{
      schoolName?: string;
      degree?: string;
      endDate?: string;
    }>;
  };
  skills?: {
    individualSkills?: {
      selfAwareness?: { values?: string[] };
      stressManagement?: { reduceStress?: string[] };
      problemSolving?: { appropriateApproaches?: string[] };
    };
  };
  foreignLanguages?: Array<{
    language: string;
    listening?: string;
    speaking?: string;
    reading?: string;
    writing?: string;
  }>;
  computerSkills?: {
    software?: Array<{ name: string; level?: string }>;
    officeEquipment?: { internet?: string };
  };
  workExperience?: Array<{
    organization?: string;
    position?: string;
    startDate?: string;
    endDate?: string;
  }>;
};

type QuestionShape = { id: string; text: string };

// 👇 Next.js 15: params must be a Promise and should be awaited
type RouteCtx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // await the promise
    const questionnaireId = id;

    const body = (await request.json()) as { answers?: QuestionnaireAnswers };
    const { answers } = body;
    if (!answers) {
      return NextResponse.json(
        { error: "Answers are required" },
        { status: 400 }
      );
    }

    // Questionnaire exists?
    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id: questionnaireId },
      include: { questions: true },
    });
    if (!questionnaire) {
      return NextResponse.json(
        { error: "Questionnaire not found" },
        { status: 404 }
      );
    }

    // Already submitted?
    const existingResponse = await prisma.questionnaireResponse.findFirst({
      where: { questionnaireId, userId: session.user.id },
    });
    if (existingResponse) {
      return NextResponse.json(
        { error: "You have already submitted this questionnaire" },
        { status: 400 }
      );
    }

    // Create response + answers
    const response = await prisma.questionnaireResponse.create({
      data: {
        questionnaireId,
        userId: session.user.id,
        answers: {
          create: questionnaire.questions.map((question: QuestionShape) => ({
            questionId: question.id,
            value: getAnswerValue(answers, question),
          })),
        },
      },
      include: {
        answers: { include: { question: true } },
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error submitting questionnaire:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/** ---- Pure helper with strict types ---- */
function getAnswerValue(
  answers: QuestionnaireAnswers,
  question: QuestionShape
): string {
  const q = question.text.toLowerCase();

  // Personal Information
  if (q.includes("эцэг") || q.includes("эх")) return answers.personalInfo?.fatherName ?? "";
  if (q.includes("нэр") && !q.includes("эцэг") && !q.includes("эх"))
    return answers.personalInfo?.name ?? "";
  if (q.includes("хүйс")) return answers.personalInfo?.gender ?? "";
  if (q.includes("төрсөн он")) return answers.personalInfo?.birthYear ?? "";
  if (q.includes("төрсөн сар")) return answers.personalInfo?.birthMonth ?? "";
  if (q.includes("төрсөн аймаг") || q.includes("төрсөн хот"))
    return answers.personalInfo?.birthAimag ?? "";
  if (q.includes("төрсөн сум") || q.includes("төрсөн дүүрэг"))
    return answers.personalInfo?.birthSoum ?? "";
  if (q.includes("төрсөн газар")) return answers.personalInfo?.birthPlace ?? "";
  if (q.includes("овог")) return answers.personalInfo?.surname ?? "";
  if (q.includes("үндэс") || q.includes("угсаа"))
    return answers.personalInfo?.ethnicity ?? "";
  if (q.includes("нийгмийн гарал")) return answers.personalInfo?.socialOrigin ?? "";

  // Contact Information
  if (q.includes("оршин суугаа аймаг") || q.includes("оршин суугаа хот"))
    return answers.personalInfo?.currentAddress?.aimag ?? "";
  if (q.includes("оршин суугаа сум") || q.includes("оршин суугаа дүүрэг"))
    return answers.personalInfo?.currentAddress?.soum ?? "";
  if (q.includes("гэрийн хаяг"))
    return answers.personalInfo?.currentAddress?.homeAddress ?? "";
  if (q.includes("утасны дугаар"))
    return answers.personalInfo?.currentAddress?.phone ?? "";
  if (q.includes("үүрэн утасны дугаар"))
    return answers.personalInfo?.currentAddress?.mobile ?? "";
  if (q.includes("и-мэйл хаяг"))
    return answers.personalInfo?.currentAddress?.email ?? "";

  // Education
  const edu0 = answers.education?.generalEducation?.[0];
  if (q.includes("сургуулийн нэр")) return edu0?.schoolName ?? "";
  if (q.includes("эзэмшсэн боловсрол") || q.includes("мэргэжил"))
    return edu0?.degree ?? "";
  if (q.includes("төгссөн он") || q.includes("төгссөн сар"))
    return edu0?.endDate ?? "";

  // Skills
  if (q.includes("өөрийгөө танин мэдэх"))
    return (answers.skills?.individualSkills?.selfAwareness?.values ?? []).toString();
  if (q.includes("стрессээ тайлах"))
    return (answers.skills?.individualSkills?.stressManagement?.reduceStress ?? []).toString();
  if (q.includes("асуудлыг бүтээлчээр шийдвэрлэх"))
    return (answers.skills?.individualSkills?.problemSolving?.appropriateApproaches ?? []).toString();

  // Foreign Languages
  if (q.includes("гадаад хэлний мэдлэг")) {
    const languages = answers.foreignLanguages ?? [];
    return languages
      .map(
        (lang) =>
          `${lang.language}: ${lang.listening ?? ""}, ${lang.speaking ?? ""}, ${lang.reading ?? ""}, ${lang.writing ?? ""}`
      )
      .join("; ");
  }

  // Computer Skills
  if (q.includes("эзэмшсэн программын нэр")) {
    const software = answers.computerSkills?.software ?? [];
    return software.map((s) => `${s.name}: ${s.level ?? ""}`).join("; ");
  }
  if (q.includes("компьютерийн ур чадварын түвшин")) {
    return answers.computerSkills?.officeEquipment?.internet ?? "";
  }

  // Work Experience
  const work0 = answers.workExperience?.[0];
  if (q.includes("ажилласан байгууллагын нэр")) return work0?.organization ?? "";
  if (q.includes("албан тушаал")) return work0?.position ?? "";
  if (q.includes("ажилд орсон он") || q.includes("ажилд орсон сар"))
    return work0?.startDate ?? "";
  if (q.includes("ажлаас гарсан он") || q.includes("ажлаас гарсан сар"))
    return work0?.endDate ?? "";

  // Default fallback
  return "";
}
