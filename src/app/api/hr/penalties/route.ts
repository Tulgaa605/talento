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

    // Get penalties for employees from this company
    const rows = await prisma.penalty.findMany({ 
      where: {
        employeeId: {
          in: companyEmployeeIds,
        },
      },
      orderBy: { date: 'desc' },
      take: 100
    });
  const data = rows.map((p) => ({
    id: p.legacyId,
    employeeId: p.employeeId,
    employee: p.employee,
    type: p.type,
    reason: p.reason ?? '',
    amount: p.amount,
    date: p.date.toISOString().slice(0,10),
    status: p.status,
    decidedBy: p.decidedBy ?? '',
    orderNumber: p.orderNumber ?? '',
  }));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Шийтгэлүүдийг авахад алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Шийтгэлүүдийг авахад алдаа гарлаа' },
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
    const created = await prisma.penalty.create({
      data: {
        legacyId: typeof body.id === 'number' ? body.id : Date.now(),
        employeeId: body.employeeId,
        employee: body.employee,
        type: body.type,
        reason: body.reason ?? '',
        amount: body.amount,
        date: new Date(body.date),
        status: body.status,
        decidedBy: body.decidedBy ?? '',
        orderNumber: body.orderNumber ?? '',
      },
    });
    const response = {
      id: created.legacyId,
      employeeId: created.employeeId,
      employee: created.employee,
      type: created.type,
      reason: created.reason ?? '',
      amount: created.amount,
      date: created.date.toISOString().slice(0,10),
      status: created.status,
      decidedBy: created.decidedBy ?? '',
      orderNumber: created.orderNumber ?? '',
    };
    return NextResponse.json(response, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}


