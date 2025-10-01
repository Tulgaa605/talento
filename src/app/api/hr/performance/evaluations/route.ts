import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const rows = await prisma.performanceEvaluation.findMany({ orderBy: { evaluationDate: 'desc' } });
  const data = rows.map((e) => ({
    id: e.legacyId,
    employee: e.employee,
    employeeId: e.employeeRefId,
    evaluator: e.evaluator,
    evaluatorType: e.evaluatorType,
    score: e.score,
    period: e.period,
    status: e.status,
    evaluationDate: e.evaluationDate.toISOString().slice(0,10),
    comment: e.comment ?? '',
    strengths: e.strengths ?? '',
    improvements: e.improvements ?? '',
    averageScore: e.averageScore,
    evaluationType: e.evaluationType,
  }));
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const created = await prisma.performanceEvaluation.create({
      data: {
        legacyId: typeof body.id === 'number' ? body.id : Date.now(),
        employee: body.employee,
        employeeRefId: body.employeeId,
        evaluator: body.evaluator,
        evaluatorType: body.evaluatorType,
        score: Number(body.score),
        period: body.period,
        status: body.status,
        evaluationDate: new Date(body.evaluationDate),
        comment: body.comment ?? '',
        strengths: body.strengths ?? '',
        improvements: body.improvements ?? '',
        averageScore: Number(body.averageScore ?? body.score),
        evaluationType: body.evaluationType,
      },
    });
    const response = {
      id: created.legacyId,
      employee: created.employee,
      employeeId: created.employeeRefId,
      evaluator: created.evaluator,
      evaluatorType: created.evaluatorType,
      score: created.score,
      period: created.period,
      status: created.status,
      evaluationDate: created.evaluationDate.toISOString().slice(0,10),
      comment: created.comment ?? '',
      strengths: created.strengths ?? '',
      improvements: created.improvements ?? '',
      averageScore: created.averageScore,
      evaluationType: created.evaluationType,
    };
    return NextResponse.json(response, { status: 201 });
  } catch{
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}


