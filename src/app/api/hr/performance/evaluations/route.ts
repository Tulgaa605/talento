import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCompanyId } from '@/lib/hr-utils';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Нэвтрээгүй байна' },
        { status: 401 }
      );
    }

    // Get current user's companyId
    const companyId = await getCompanyId(session.user.id);
    
    if (!companyId) {
      return NextResponse.json([]);
    }

    // Get employees directly by companyId
    const companyEmployees = await prisma.employee.findMany({
      where: {
        companyId: companyId,
      },
      select: { employeeId: true },
    });
    const companyEmployeeIds = companyEmployees.map(e => e.employeeId);

    // Get performance evaluations for employees from this company
    // Note: employeeRefId in PerformanceEvaluation matches employeeId (string) from Employee
    const rows = await prisma.performanceEvaluation.findMany({ 
      where: {
        employeeRefId: {
          in: companyEmployeeIds,
        },
      },
      orderBy: { evaluationDate: 'desc' },
      take: 100
    });
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
  } catch (error) {
    console.error('Гүйцэтгэлийн үнэлгээг авахад алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Гүйцэтгэлийн үнэлгээг авахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Нэвтрээгүй байна' },
        { status: 401 }
      );
    }

    // Get current user's companyId
    const companyId = await getCompanyId(session.user.id);
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Компанийн мэдээлэл олдсонгүй' },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Validate employee belongs to this company
    if (body.employeeId) {
      const employee = await prisma.employee.findFirst({
        where: {
          employeeId: body.employeeId,
          companyId: companyId,
        },
        select: { companyId: true },
      });
      
      if (!employee) {
        return NextResponse.json(
          { error: 'Ажилтан олдсонгүй эсвэл танай компанид хамаарахгүй байна' },
          { status: 404 }
        );
      }
    }
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


