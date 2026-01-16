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

    // Get positions by filtering through department's companyId
    const positions = await prisma.position.findMany({
      where: {
        department: {
          companyId: companyId,
        },
      },
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
            middleName: true,
            employeeId: true,
          },
          take: 50,
        },
      },
      orderBy: { title: 'asc' },
      take: 100,
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
    const { title, description, code, departmentId, salaryRange, requirements, jobProfessionCode, jobProfessionName } = body as {
      title: string;
      description?: string | null;
      code?: string;
      departmentId?: string;
      salaryRange?: string | null;
      requirements?: string | null;
      jobProfessionCode?: string;
      jobProfessionName?: string;
    };

    if (!title) {
      return NextResponse.json(
        { error: 'Гарчиг заавал оруулах шаардлагатай' },
        { status: 400 }
      );
    }

    // Auto-generate code if not provided
    let finalCode = code;
    if (!finalCode || finalCode.trim() === '') {
      const positions = await prisma.position.findMany({
        where: {
          department: {
            companyId: companyId,
          },
        },
        select: { code: true },
      });
      
      const ddCodes = positions
        .map((p) => p.code)
        .filter((c) => /^DD\d{5}$/.test(c))
        .map((c) => parseInt(c.substring(2), 10))
        .sort((a, b) => b - a);
      
      const maxNumber = ddCodes.length > 0 ? ddCodes[0] : 0;
      const nextNumber = maxNumber + 1;
      finalCode = `DD${String(nextNumber).padStart(5, '0')}`;
    }

    // Check if code already exists
    const existingPosition = await prisma.position.findUnique({ where: { code: finalCode } });
    if (existingPosition) {
      return NextResponse.json(
        { error: 'Энэ код өмнө нь ашиглагдсан байна' },
        { status: 400 }
      );
    }

    // Get default department if not provided
    let finalDepartmentId = departmentId;
    if (!finalDepartmentId || finalDepartmentId.trim() === '') {
      // Find or create a default department
      let defaultDepartment = await prisma.department.findFirst({
        where: { name: 'Системийн хэрэглэгч' },
      });

      if (!defaultDepartment) {
        defaultDepartment = await prisma.department.create({
          data: {
            name: 'Системийн хэрэглэгч',
            code: 'SYS',
            companyId: companyId,
          },
        });
      }
      finalDepartmentId = defaultDepartment.id;
    } else {
      // Validate department exists and belongs to this company
      const department = await prisma.department.findUnique({ 
        where: { id: finalDepartmentId },
        select: { companyId: true },
      });
      if (!department) {
        return NextResponse.json({ error: 'Хэлтэс олдсонгүй' }, { status: 404 });
      }
      if (department.companyId && department.companyId !== companyId) {
        return NextResponse.json(
          { error: 'Энэ хэлтэс танай компанид хамаарахгүй байна' },
          { status: 403 }
        );
      }
    }

    const position = await prisma.position.create({
      data: {
        title,
        description: description ?? null,
        code: finalCode,
        departmentId: finalDepartmentId,
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
