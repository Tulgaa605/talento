import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma, DecisionType, DecisionStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCompanyId } from '@/lib/hr-utils';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
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
      select: { id: true },
    });
    const companyEmployeeIds = companyEmployees.map(e => e.id);

    // If no employees, return empty array
    if (companyEmployeeIds.length === 0) {
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');
    const typeParam = searchParams.get('type');

    const where: Prisma.DecisionWhereInput = {
      // Filter decisions by employee IDs from this company
      employeeId: { in: companyEmployeeIds },
    };

    if (statusParam && Object.values(DecisionStatus).includes(statusParam as DecisionStatus)) {
      where.status = statusParam as DecisionStatus;
    }

    if (employeeId) {
      // Also check if the requested employeeId belongs to this company
      if (!companyEmployeeIds.includes(employeeId)) {
        return NextResponse.json(
          { error: 'Энэ ажилтны шийдвэр олдсонгүй' },
          { status: 404 }
        );
      }
      where.employeeId = employeeId;
    }

    if (typeParam && Object.values(DecisionType).includes(typeParam as DecisionType)) {
      where.type = typeParam as DecisionType;
    }

    const decisions = await prisma.decision.findMany({
      where,
      select: {
        id: true,
        decisionNumber: true,
        title: true,
        description: true,
        type: true,
        decisionDate: true,
        effectiveDate: true,
        status: true,
        createdAt: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            employeeId: true,
          },
        },
      },
      orderBy: {
        decisionDate: 'desc',
      },
      take: 100,
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

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true, companyId: true }
    });
    if (!employee) {
      return NextResponse.json(
        { error: 'Ажилтны олдсонгүй' },
        { status: 404 }
      );
    }
    
    // Check if employee belongs to this company
    if (employee.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Энэ ажилтан танай компанид хамаарахгүй байна' },
        { status: 403 }
      );
    }

    // Check if decisionNumber exists for this company's employees
    const existingDecision = await prisma.decision.findFirst({
      where: {
        decisionNumber,
        employee: {
          companyId: companyId,
        },
      },
    });
    if (existingDecision) {
      return NextResponse.json(
        { error: 'Энэ шийдвэрийн дугаар танай компанид аль хэдийн ашиглагдсан байна' },
        { status: 400 }
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
