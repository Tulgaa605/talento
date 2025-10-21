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
    
    let response;
    if (existingResponse) {
      // Update existing response
      response = await prisma.questionnaireResponse.update({
        where: { id: existingResponse.id },
        data: {
          attachmentFile,
          attachmentUrl,
          formData: JSON.stringify(formData),
        },
        include: {
          user: { select: { name: true, email: true } },
        },
      });
    } else {
      // Create new response
      response = await prisma.questionnaireResponse.create({
        data: {
          questionnaireId,
          userId: session.user.id,
          attachmentFile,
          attachmentUrl,
          formData: JSON.stringify(formData),
        },
        include: {
          user: { select: { name: true, email: true } },
        },
      });
    }

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
