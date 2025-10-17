import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const positions = await prisma.position.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        code: true,
        salaryRange: true,
        requirements: true,
        jobProfessionCode: true,
        jobProfessionName: true,
        createdAt: true,
        department: {
          select: {
            id: true,
            name: true,
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
      orderBy: { title: 'asc' },
    });

    return NextResponse.json(positions);
  } catch (error) {
    console.error('Албан тушаалуудыг авахад алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Албан тушаалуудыг авахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, code, departmentId, salaryRange, requirements, jobProfessionCode, jobProfessionName } = body as {
      title: string;
      description?: string | null;
      code: string;
      departmentId: string;
      salaryRange?: string | null;
      requirements?: string | null;
      jobProfessionCode?: string;
      jobProfessionName?: string;
    };

    if (!title || !code || !departmentId) {
      return NextResponse.json(
        { error: 'Гарчиг, код болон хэлтэс заавал оруулах шаардлагатай' },
        { status: 400 }
      );
    }

    const existingPosition = await prisma.position.findUnique({ where: { code } });
    if (existingPosition) {
      return NextResponse.json(
        { error: 'Энэ код өмнө нь ашиглагдсан байна' },
        { status: 400 }
      );
    }

    const department = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!department) {
      return NextResponse.json({ error: 'Хэлтэс олдсонгүй' }, { status: 404 });
    }

    const position = await prisma.position.create({
      data: {
        title,
        description: description ?? null,
        code,
        departmentId,
        salaryRange: salaryRange ?? null,
        requirements: requirements ?? null,
        jobProfessionCode: jobProfessionCode ?? null,
        jobProfessionName: jobProfessionName ?? null,
      },
      include: {
        department: true,
        employees: true,
      },
    });

    return NextResponse.json(position, { status: 201 });
  } catch (error) {
    console.error('Албан тушаал нэмэхэд алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Албан тушаал нэмэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}
