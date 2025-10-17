import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        createdAt: true,
        positions: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error('Хэлтсүүдийг авахад алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Хэлтсүүдийг авахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, code } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: 'Нэр болон код заавал оруулах шаардлагатай' },
        { status: 400 }
      );
    }

    const existingDepartment = await prisma.department.findUnique({
      where: { code },
    });

    if (existingDepartment) {
      return NextResponse.json(
        { error: 'Энэ код өмнө нь ашиглагдсан байна' },
        { status: 400 }
      );
    }

    const department = await prisma.department.create({
      data: {
        name,
        description,
        code,
      },
      include: {
        positions: true,
        employees: true,
      },
    });

    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error('Хэлтэс нэмэхэд алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Хэлтэс нэмэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}
