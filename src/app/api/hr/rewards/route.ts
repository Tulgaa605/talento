import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const rows = await prisma.reward.findMany({ orderBy: { date: 'desc' } });
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
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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


