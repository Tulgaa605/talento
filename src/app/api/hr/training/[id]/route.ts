import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Params = { id: string };

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const legacyId = Number(id);

    const training = await prisma.training.findFirst({
      where: { legacyId }
    });

    if (!training) {
      return NextResponse.json({ error: 'Training not found' }, { status: 404 });
    }

    const response = {
      id: training.legacyId,
      name: training.name,
      type: training.type,
      objective: training.objective ?? '',
      content: training.content ?? '',
      startDate: training.startDate.toISOString().slice(0, 10),
      endDate: training.endDate.toISOString().slice(0, 10),
      location: training.location ?? '',
      instructor: training.instructor ?? '',
      participants: training.participants,
      status: training.status,
      progress: training.progress,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching training:', error);
    return NextResponse.json({ error: 'Failed to fetch training' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const legacyId = Number(id);
    const body = await request.json();

    const updated = await prisma.training.updateMany({
      where: { legacyId },
      data: {
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

    if (updated.count === 0) {
      return NextResponse.json({ error: 'Training not found' }, { status: 404 });
    }

    const response = {
      id: legacyId,
      name: body.name,
      type: body.type,
      objective: body.objective ?? '',
      content: body.content ?? '',
      startDate: body.startDate,
      endDate: body.endDate,
      location: body.location ?? '',
      instructor: body.instructor ?? '',
      participants: Number(body.participants ?? 0),
      status: body.status,
      progress: Number(body.progress ?? 0),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating training:', error);
    return NextResponse.json({ error: 'Failed to update training' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const legacyId = Number(id);

    const deleted = await prisma.training.deleteMany({
      where: { legacyId }
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Training not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Training deleted successfully' });
  } catch (error) {
    console.error('Error deleting training:', error);
    return NextResponse.json({ error: 'Failed to delete training' }, { status: 500 });
  }
}

