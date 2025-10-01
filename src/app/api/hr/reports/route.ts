import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const rows = await prisma.hRReport.findMany({ orderBy: { createdAt: 'desc' } });
  const data = rows.map((r) => ({
    id: r.legacyId,
    name: r.name,
    type: r.type,
    period: r.period,
    status: r.status,
    size: r.size,
    description: r.description ?? '',
    createdBy: r.createdBy,
    createdAt: r.createdAt.toISOString().slice(0,10),
    lastModified: r.lastModified.toISOString().slice(0,10),
    format: r.format,
    department: r.department,
  }));
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const created = await prisma.hRReport.create({
      data: {
        legacyId: Date.now(),
        name: body.name,
        type: body.type,
        period: body.period,
        status: body.status,
        size: '-',
        description: body.description ?? '',
        createdBy: 'Систем',
        createdAt: new Date(),
        lastModified: new Date(),
        format: body.format,
        department: body.department,
      },
    });
    const response = {
      id: created.legacyId,
      name: created.name,
      type: created.type,
      period: created.period,
      status: created.status,
      size: created.size,
      description: created.description ?? '',
      createdBy: created.createdBy,
      createdAt: created.createdAt.toISOString().slice(0,10),
      lastModified: created.lastModified.toISOString().slice(0,10),
      format: created.format,
      department: created.department,
    };
    return NextResponse.json(response, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}


