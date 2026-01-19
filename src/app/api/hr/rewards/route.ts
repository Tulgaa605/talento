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

    // Get rewards for employees from this company
    const rows = await prisma.reward.findMany({ 
      where: {
        employeeId: {
          in: companyEmployeeIds,
        },
      },
      orderBy: { date: 'desc' },
      take: 100
    });
  const data = rows.map((r) => ({
    id: r.legacyId,
    employeeId: r.employeeId,
    employee: r.employee,
    type: r.type,
    amount: r.amount,
    reason: r.reason ?? '',
    date: r.date.toISOString().slice(0,10),
    status: r.status,
    issuedBy: r.issuedBy ?? '',
    orderNumber: r.orderNumber ?? '',
  }));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Шагналуудыг авахад алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Шагналуудыг авахад алдаа гарлаа' },
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
    const created = await prisma.reward.create({
      data: {
        legacyId: typeof body.id === 'number' ? body.id : Date.now(),
        employeeId: body.employeeId,
        employee: body.employee,
        type: body.type,
        amount: body.amount,
        reason: body.reason ?? '',
        date: new Date(body.date),
        status: body.status,
        issuedBy: body.issuedBy ?? '',
        orderNumber: body.orderNumber ?? '',
      },
    });
    const response = {
      id: created.legacyId,
      employeeId: created.employeeId,
      employee: created.employee,
      type: created.type,
      amount: created.amount,
      reason: created.reason ?? '',
      date: created.date.toISOString().slice(0,10),
      status: created.status,
      issuedBy: created.issuedBy ?? '',
      orderNumber: created.orderNumber ?? '',
    };
    return NextResponse.json(response, { status: 201 });
  } catch{
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}


