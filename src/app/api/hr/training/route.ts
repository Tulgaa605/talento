import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const rows = await prisma.training.findMany({ orderBy: { startDate: 'desc' } });
  const data = rows.map((t) => ({
    id: t.legacyId,
    name: t.name,
    type: t.type,
    objective: t.objective ?? '',
    content: t.content ?? '',
    startDate: t.startDate.toISOString().slice(0,10),
    endDate: t.endDate.toISOString().slice(0,10),
    location: t.location ?? '',
    instructor: t.instructor ?? '',
    participants: t.participants,
    status: t.status,
    progress: t.progress,
  }));
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const created = await prisma.training.create({
      data: {
        legacyId: typeof body.id === 'number' ? body.id : Date.now(),
        name: body.name,
        type: body.type,
        objective: body.objective ?? '',
        content: body.content ?? '',
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        location: body.location ?? '',
        instructor: body.instructor ?? '',
        participants: Number(body.participants ?? 0),
        status: body.status,
        progress: Number(body.progress ?? 0),
      },
    });
    const response = {
      id: created.legacyId,
      name: created.name,
      type: created.type,
      objective: created.objective ?? '',
      content: created.content ?? '',
      startDate: created.startDate.toISOString().slice(0,10),
      endDate: created.endDate.toISOString().slice(0,10),
      location: created.location ?? '',
      instructor: created.instructor ?? '',
      participants: created.participants,
      status: created.status,
      progress: created.progress,
    };
    return NextResponse.json(response, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}


