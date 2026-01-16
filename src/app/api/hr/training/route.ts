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

    // Get training participants with matching employeeIds
    const companyTrainingParticipants = await prisma.trainingParticipant.findMany({
      where: {
        employeeId: {
          in: companyEmployeeIds,
        },
      },
      select: { trainingLegacyId: true },
    });
    const companyTrainingIds = new Set(companyTrainingParticipants.map(tp => tp.trainingLegacyId));

    // Get trainings that have participants from this company
    const rows = await prisma.training.findMany({ 
      where: {
        legacyId: {
          in: Array.from(companyTrainingIds),
        },
      },
      orderBy: { startDate: 'desc' },
      take: 100
    });
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
  } catch (error) {
    console.error('Сургалтуудыг авахад алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Сургалтуудыг авахад алдаа гарлаа' },
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


