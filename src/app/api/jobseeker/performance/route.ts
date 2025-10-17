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

    const evaluations = await prisma.performanceEvaluation.findMany({
      where: {
        employeeRefId: session.user.id
      },
      orderBy: {
        evaluationDate: "desc"
      }
    });

    const formattedEvaluations = evaluations.map((evaluation) => ({
      id: evaluation.id,
      employee: evaluation.employee,
      employeeId: evaluation.employeeRefId,
      evaluator: evaluation.evaluator,
      evaluatorType: evaluation.evaluatorType,
      score: evaluation.score,
      period: evaluation.period,
      status: evaluation.status === "PENDING" ? "Хүлээгдэж буй" : 
              evaluation.status === "APPROVED" ? "Дууссан" : "Илгээгдсэн",
      evaluationDate: evaluation.evaluationDate.toISOString().split('T')[0],
      comment: evaluation.comment || "",
      strengths: evaluation.strengths || "",
      improvements: evaluation.improvements || "",
      averageScore: evaluation.averageScore,
      evaluationType: evaluation.evaluationType
    }));

    return NextResponse.json(formattedEvaluations);
  } catch (error) {
    console.error("Error fetching performance evaluations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      evaluator,
      evaluatorType,
      score,
      period,
      comment,
      strengths,
      improvements,
      evaluationType
    } = body;

    const evaluation = await prisma.performanceEvaluation.create({
      data: {
        legacyId: Date.now(),
        employee: session.user.name || "Unknown",
        employeeRefId: session.user.id,
        evaluator: evaluator || "Ажил олгогч",
        evaluatorType: evaluatorType || "Employer",
        score: score || 0,
        period: period || `${new Date().getFullYear()} Q1`,
        status: "PENDING",
        evaluationDate: new Date(),
        comment: comment || "",
        strengths: strengths || "",
        improvements: improvements || "",
        averageScore: score || 0,
        evaluationType: evaluationType || "Ажил олгогчд илгээсэн үнэлгээ"
      }
    });

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("Error creating performance evaluation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

