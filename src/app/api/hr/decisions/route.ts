import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma, DecisionType, DecisionStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');
    const typeParam = searchParams.get('type');

    const where: Prisma.DecisionWhereInput = {};

    if (statusParam && Object.values(DecisionStatus).includes(statusParam as DecisionStatus)) {
      where.status = statusParam as DecisionStatus;
    }

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (typeParam && Object.values(DecisionType).includes(typeParam as DecisionType)) {
      where.type = typeParam as DecisionType;
    }

    const decisions = await prisma.decision.findMany({
      where,
      include: {
        employee: {
          include: {
            position: {
              include: {
                department: true,
              },
            },
            department: true,
          },
        },
      },
      orderBy: {
        decisionDate: 'desc',
      },
    });

    return NextResponse.json(decisions);
  } catch (error) {
    console.error('Шийдвэрүүдийг авахад алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Шийдвэрүүдийг авахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      decisionNumber,
      title,
      description,
      type,
      employeeId,
      decisionDate,
      effectiveDate,
      reason,
      details,
      documentUrl,
      createdBy,
    } = body;

    if (!decisionNumber || !title || !description || !type || !employeeId || !decisionDate) {
      return NextResponse.json(
        { error: 'Заавал оруулах талбаруудыг бүгд бөглөнө үү' },
        { status: 400 }
      );
    }

    const existingDecision = await prisma.decision.findUnique({
      where: { decisionNumber },
    });
    if (existingDecision) {
      return NextResponse.json(
        { error: 'Энэ шийдвэрийн дугаар өмнө нь ашиглагдсан байна' },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });
    if (!employee) {
      return NextResponse.json(
        { error: 'Ажилтны олдсонгүй' },
        { status: 404 }
      );
    }

    const decision = await prisma.decision.create({
      data: {
        decisionNumber,
        title,
        description,
        type: type as DecisionType,
        employeeId,
        decisionDate: new Date(decisionDate),
        effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
        reason,
        details,
        documentUrl,
        createdBy,
      },
      include: {
        employee: {
          include: {
            position: { include: { department: true } },
            department: true,
          },
        },
      },
    });

    return NextResponse.json(decision, { status: 201 });
  } catch (error) {
    console.error('Шийдвэр нэмэхэд алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Шийдвэр нэмэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}
