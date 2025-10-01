import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const rows = await prisma.penalty.findMany({ orderBy: { date: 'desc' } });
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
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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


