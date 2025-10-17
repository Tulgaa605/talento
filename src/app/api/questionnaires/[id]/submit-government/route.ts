import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GovernmentEmployeeForm } from "@/components/GovernmentEmployeeQuestionnaire";

type RouteCtx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const questionnaireId = id;

    const body = (await request.json()) as { 
      formData: GovernmentEmployeeForm;
      attachmentFile?: string;
      attachmentUrl?: string;
    };
    
    const { formData, attachmentFile, attachmentUrl } = body;
    if (!formData) {
      return NextResponse.json(
        { error: "Form data is required" },
        { status: 400 }
      );
    }

    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id: questionnaireId },
      include: { company: true },
    });
    
    if (!questionnaire) {
      return NextResponse.json(
        { error: "Questionnaire not found" },
        { status: 404 }
      );
    }

    if (questionnaire.type !== "GOVERNMENT_EMPLOYEE") {
      return NextResponse.json(
        { error: "This endpoint is only for government employee questionnaires" },
        { status: 400 }
      );
    }

    const existingResponse = await prisma.questionnaireResponse.findFirst({
      where: { questionnaireId, userId: session.user.id },
    });
    
    if (existingResponse) {
      return NextResponse.json(
        { error: "You have already submitted this questionnaire" },
        { status: 400 }
      );
    }

    const response = await prisma.questionnaireResponse.create({
      data: {
        questionnaireId,
        userId: session.user.id,
        attachmentFile,
        attachmentUrl,
        formData: JSON.stringify(formData),
        answers: {
          create: [
            {
              questionId: "personal_info",
              value: JSON.stringify({
                name: formData.personalInfo.name,
                fatherName: formData.personalInfo.fatherName,
                gender: formData.personalInfo.gender,
                birthYear: formData.personalInfo.birthYear,
                birthPlace: formData.personalInfo.birthPlace,
                ethnicity: formData.personalInfo.ethnicity,
                currentAddress: formData.personalInfo.currentAddress,
              })
            },
            {
              questionId: "education_info",
              value: JSON.stringify({
                generalEducation: formData.education.generalEducation,
                doctoralDegrees: formData.education.doctoralDegrees,
              })
            },
            {
              questionId: "work_experience",
              value: JSON.stringify(formData.workExperience)
            },
            {
              questionId: "skills_info",
              value: JSON.stringify(formData.skills)
            }
          ]
        }
      },
      include: {
        answers: true,
        user: { select: { name: true, email: true } },
      },
    });

    const companyUsers = await prisma.user.findMany({
      where: { companyId: questionnaire.companyId },
      select: { id: true },
    });

    await Promise.all(
      companyUsers.map(user =>
        prisma.notification.create({
          data: {
            userId: user.id,
            title: "Төрийн албан хаагчийн анкет ирлээ",
            message: `${session.user.name} төрийн албан хаагчийн анкет бөглөж илгээсэн байна`,
            type: "QUESTIONNAIRE_RESPONSE",
            link: `/employer/questionnaires/${questionnaireId}/responses`,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      response,
      message: "Анкет амжилттай илгээгдлээ"
    });
  } catch (error) {
    console.error("Error submitting government employee questionnaire:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
