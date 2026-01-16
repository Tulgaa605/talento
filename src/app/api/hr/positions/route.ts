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

    const companyId = await getCompanyId(session.user.id);
    
    if (!companyId) {
      return NextResponse.json([]);
    }

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
    let finalCode: string = code || '';
    
    // Get all existing codes for this company only
    const existingPositions = await prisma.position.findMany({
      where: {
        department: {
          companyId: companyId,
        },
      },
      select: { code: true },
    });
    
    const existingCodesInCompany = new Set(existingPositions.map((p) => p.code));
    
    // If code is provided, check if it exists in this company
    if (finalCode && finalCode.trim() !== '') {
      if (existingCodesInCompany.has(finalCode)) {
        return NextResponse.json(
          { 
            error: 'Энэ код танай компанид аль хэдийн ашиглагдсан байна',
            details: `Код "${finalCode}" танай компанид бүртгэгдсэн байна. Өөр код оруулна уу эсвэл код хоосон үлдээвэл автоматаар үүсгэнэ.`
          },
          { status: 400 }
        );
      }
    }
    
    // Auto-generate random code if not provided
    if (!finalCode || finalCode.trim() === '') {
      // Generate random code that doesn't exist in this company
      const generateRandomCode = (): string => {
        const randomNum = Math.floor(Math.random() * 90000) + 10000; // 10000-99999
        return `DD${String(randomNum).padStart(5, '0')}`;
      };
      
      let attempts = 0;
      while (attempts < 1000) {
        finalCode = generateRandomCode();
        if (!existingCodesInCompany.has(finalCode)) {
          break;
        }
        attempts++;
      }
      
      if (attempts >= 1000) {
        // Fallback: use timestamp-based code
        const timestamp = Date.now().toString().slice(-5);
        finalCode = `DD${timestamp}`;
      }
    }
    
    // Ensure finalCode is a string
    if (!finalCode || finalCode.trim() === '') {
      return NextResponse.json(
        { error: 'Код үүсгэхэд алдаа гарлаа' },
        { status: 500 }
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
        companyId: companyId,
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
