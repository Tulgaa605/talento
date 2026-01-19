import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCompanyId } from '@/lib/hr-utils';

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
        employees: { 
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
            middleName: true,
            employeeId: true,
            position: {
              select: {
                title: true
              }
            }
          } 
        },
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
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Нэвтрээгүй байна' },
        { status: 401 }
      );
    }

    const companyId = await getCompanyId(session.user.id);
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Компанийн мэдээлэл олдсонгүй' },
        { status: 404 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, code } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: 'Нэр болон код заавал оруулах шаардлагатай' },
        { status: 400 }
      );
    }

    // Check if department belongs to this company
    const currentDepartment = await prisma.department.findUnique({
      where: { id },
      select: { companyId: true },
    });

    if (!currentDepartment) {
      return NextResponse.json(
        { error: 'Хэлтэс олдсонгүй' },
        { status: 404 }
      );
    }

    if (currentDepartment.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Энэ хэлтэс танай компанид хамаарахгүй байна' },
        { status: 403 }
      );
    }

    // Check if code exists in this company (excluding current department)
    const existingDepartment = await prisma.department.findFirst({
      where: {
        code,
        companyId: companyId,
        id: { not: id },
      },
    });

    if (existingDepartment) {
      return NextResponse.json(
        { error: 'Энэ ашиглагдсан код байна' },
        { status: 400 }
      );
    }

    try {
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
    } catch (error: any) {
      // Handle unique constraint errors
      if (error?.code === 'P2002' || error?.message?.includes('Unique constraint') || error?.message?.includes('Department_code_key') || error?.message?.includes('code_companyId')) {
        // Check if it's a company-specific conflict
        const conflictCheck = await prisma.department.findFirst({
          where: {
            code,
            companyId: companyId,
            id: { not: id },
          },
        });

        if (conflictCheck) {
          return NextResponse.json(
            { error: 'Энэ ашиглагдсан код байна' },
            { status: 400 }
          );
        } else {
          return NextResponse.json(
            { error: 'Энэ код аль хэдийн ашиглагдсан байна. Өөр код ашиглана уу.' },
            { status: 400 }
          );
        }
      }
      throw error;
    }
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
