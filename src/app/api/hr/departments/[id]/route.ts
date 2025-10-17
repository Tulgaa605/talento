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

    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        positions: { select: { id: true, title: true, code: true } },
        employees: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
      },
    });

    if (!department) {
      return NextResponse.json({ error: 'Хэлтэс олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error('Хэлтсийн мэдээлэл авахад алдаа гарлаа:', error);
    return NextResponse.json({ error: 'Хэлтсийн мэдээлэл авахад алдаа гарлаа' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, code } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: 'Нэр болон код заавал оруулах шаардлагатай' },
        { status: 400 }
      );
    }

    const existingDepartment = await prisma.department.findFirst({
      where: { code, id: { not: id } },
    });

    if (existingDepartment) {
      return NextResponse.json(
        { error: 'Энэ код өөр хэлтэсэд ашиглагдсан байна' },
        { status: 400 }
      );
    }

    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: {
        name,
        description: description || null,
        code,
      },
      include: {
        positions: true,
        employees: true,
      },
    });

    return NextResponse.json(updatedDepartment);
  } catch (error) {
    console.error('Хэлтсийн мэдээлэл шинэчлэхэд алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Хэлтсийн мэдээлэл шинэчлэхэд алдаа гарлаа' },
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

    const department = await prisma.department.findUnique({
      where: { id },
      include: { employees: true, positions: true },
    });

    if (!department) {
      return NextResponse.json({ error: 'Хэлтэс олдсонгүй' }, { status: 404 });
    }

    if (department.employees.length > 0) {
      return NextResponse.json(
        { error: 'Энэ хэлтэсэд ажилтнууд байгаа тул устгах боломжгүй' },
        { status: 400 }
      );
    }

    if (department.positions.length > 0) {
      return NextResponse.json(
        { error: 'Энэ хэлтэсэд албан тушаалууд байгаа тул устгах боломжгүй' },
        { status: 400 }
      );
    }

    await prisma.department.delete({ where: { id } });

    return NextResponse.json({ message: 'Хэлтэс амжилттай устгагдлаа' }, { status: 200 });
  } catch (error) {
    console.error('Хэлтсийн устгахад алдаа гарлаа:', error);
    return NextResponse.json({ error: 'Хэлтсийн устгахад алдаа гарлаа' }, { status: 500 });
  }
}
