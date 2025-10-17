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

    const contract = await prisma.employmentContract.findUnique({
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

    if (!contract) {
      return NextResponse.json({ error: 'Гэрээ олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json(contract);
  } catch (error) {
    console.error('Гэрээний мэдээлэл авахад алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Гэрээний мэдээлэл авахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      contractNumber,
      contractType,
      startDate,
      endDate,
      salary,
      currency,
      status,
    } = body;

    if (!contractNumber || !contractType || !startDate || !salary || !currency) {
      return NextResponse.json(
        {
          error:
            'Гэрээний дугаар, төрөл, эхлэх огноо, цалин, валют заавал оруулах шаардлагатай',
        },
        { status: 400 }
      );
    }

    const existingContract = await prisma.employmentContract.findFirst({
      where: { contractNumber, id: { not: id } },
    });

    if (existingContract) {
      return NextResponse.json(
        { error: 'Энэ гэрээний дугаар өөр гэрээнд ашиглагдсан байна' },
        { status: 400 }
      );
    }

    const updatedContract = await prisma.employmentContract.update({
      where: { id },
      data: {
        contractNumber,
        contractType,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        salary: typeof salary === 'number' ? salary : parseFloat(salary),
        currency,
        status: status || 'ACTIVE',
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

    return NextResponse.json(updatedContract);
  } catch (error) {
    console.error('Гэрээний мэдээлэл шинэчлэхэд алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Гэрээний мэдээлэл шинэчлэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;

    const contract = await prisma.employmentContract.findUnique({ where: { id } });
    if (!contract) {
      return NextResponse.json({ error: 'Гэрээ олдсонгүй' }, { status: 404 });
    }

    await prisma.employmentContract.delete({ where: { id } });

    return NextResponse.json({ message: 'Гэрээ амжилттай устгагдлаа' }, { status: 200 });
  } catch (error) {
    console.error('Гэрээний устгахад алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Гэрээний устгахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}
