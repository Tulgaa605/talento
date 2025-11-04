import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const rows = await prisma.trainingParticipant.findMany({ orderBy: { createdAt: 'desc' } });
  const data = rows.map((p) => ({
    employeeId: p.employeeId,
    name: p.name,
    position: p.position ?? '',
    training: p.trainingName,
    duration: p.duration ?? '',
    status: p.status,
    score: p.score,
    certificate: p.certificate ?? '',
    trainingId: p.trainingLegacyId,
  }));
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const created = await prisma.trainingParticipant.create({
      data: {
        employeeId: body.employeeId,
        name: body.name,
        position: body.position ?? '',
        trainingName: body.training,
        duration: body.duration ?? '',
        status: body.status,
        score: Number(body.score ?? 0),
        certificate: body.certificate ?? '',
        trainingLegacyId: Number(body.trainingId),
      },
    });
    const response = {
      employeeId: created.employeeId,
      name: created.name,
      position: created.position ?? '',
      training: created.trainingName,
      duration: created.duration ?? '',
      status: created.status,
      score: created.score,
      certificate: created.certificate ?? '',
      trainingId: created.trainingLegacyId,
    };
    return NextResponse.json(response, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Find the participant by employeeId and trainingId
    const participant = await prisma.trainingParticipant.findFirst({
      where: {
        employeeId: body.employeeId,
        trainingLegacyId: Number(body.trainingId),
      },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    const updated = await prisma.trainingParticipant.update({
      where: { id: participant.id },
      data: {
        name: body.name,
        position: body.position ?? '',
        trainingName: body.training,
        duration: body.duration ?? '',
        status: body.status,
        score: Number(body.score ?? 0),
        certificate: body.certificate ?? '',
        trainingLegacyId: Number(body.trainingId),
      },
    });

    const response = {
      employeeId: updated.employeeId,
      name: updated.name,
      position: updated.position ?? '',
      training: updated.trainingName,
      duration: updated.duration ?? '',
      status: updated.status,
      score: updated.score,
      certificate: updated.certificate ?? '',
      trainingId: updated.trainingLegacyId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating participant:', error);
    return NextResponse.json({ error: 'Failed to update participant' }, { status: 500 });
  }
}


