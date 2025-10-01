// File: src/app/api/hr/decisions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Params = { id: string };

// Шийдвэрийн мэдээллийг авах
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;

    const decision = await prisma.decision.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            email: true,
            position: {
              select: {
                title: true,
                department: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!decision) {
      return NextResponse.json({ error: 'Шийдвэр олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json(decision);
  } catch (error) {
    console.error('Шийдвэрийн мэдээлэл авахад алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Шийдвэрийн мэдээлэл авахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

// Шийдвэрийн мэдээллийг шинэчлэх
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      decisionNumber,
      title,
      type,
      decisionDate,
      description,
      status,
      effectiveDate,
    } = body;

    if (!decisionNumber || !type || !title || !decisionDate || !description) {
      return NextResponse.json(
        {
          error:
            'Шийдвэрийн дугаар, төрөл, гарсан огноо, гарчиг, тайлбар заавал оруулна',
        },
        { status: 400 }
      );
    }

    // Дугаарын давхцал шалгах
    const existingDecision = await prisma.decision.findFirst({
      where: { decisionNumber, id: { not: id } },
    });
    if (existingDecision) {
      return NextResponse.json(
        { error: 'Энэ шийдвэрийн дугаар өөр шийдвэрт ашиглагдсан байна' },
        { status: 400 }
      );
    }

    const updatedDecision = await prisma.decision.update({
      where: { id },
      data: {
        decisionNumber,
        title,
        type,
        decisionDate: new Date(decisionDate),
        effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
        description,
        status: status || 'PENDING',
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            email: true,
            position: {
              select: {
                title: true,
                department: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedDecision);
  } catch (error) {
    console.error('Шийдвэрийн мэдээлэл шинэчлэхэд алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Шийдвэрийн мэдээлэл шинэчлэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}

// Шийдвэр устгах
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;

    const decision = await prisma.decision.findUnique({ where: { id } });
    if (!decision) {
      return NextResponse.json({ error: 'Шийдвэр олдсонгүй' }, { status: 404 });
    }

    await prisma.decision.delete({ where: { id } });

    return NextResponse.json(
      { message: 'Шийдвэр амжилттай устгагдлаа' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Шийдвэрийн устгахад алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Шийдвэрийн устгахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}
