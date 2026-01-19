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

    // Get departments by companyId directly
    // Also include departments with null companyId (for backward compatibility)
    // Note: If companyId field doesn't exist in database yet, this will return all departments
    let departments;
    try {
      departments = await prisma.department.findMany({
        where: {
          OR: [
            { companyId: companyId },
            { companyId: null }, // Include old departments without companyId
          ],
        },
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
            take: 50,
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
        orderBy: { name: 'asc' },
        take: 100,
      });
    } catch (error: any) {
      // If companyId field doesn't exist yet, get all departments
      // This handles the case when schema is updated but database migration hasn't run
      if (error?.message?.includes('companyId') || error?.code === 'P2009') {
        console.warn('companyId field not found, fetching all departments');
        departments = await prisma.department.findMany({
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
              take: 50,
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
          orderBy: { name: 'asc' },
          take: 100,
        });
      } else {
        throw error;
      }
    }

    return NextResponse.json(departments);
  } catch (error: any) {
    console.error('Хэлтсүүдийг авахад алдаа гарлаа:', error);
    // Return more detailed error message for debugging
    return NextResponse.json(
      { 
        error: 'Хэлтсүүдийг авахад алдаа гарлаа',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
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
      return NextResponse.json(
        { error: 'Компанийн мэдээлэл олдсонгүй' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, code } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: 'Нэр болон код заавал оруулах шаардлагатай' },
        { status: 400 }
      );
    }

    // Check if code exists in this company only
    const existingDepartment = await prisma.department.findFirst({
      where: {
        code,
        companyId: companyId,
      },
    });

    if (existingDepartment) {
      return NextResponse.json(
        { error: 'Энэ ашиглагдсан код байна' },
        { status: 400 }
      );
    }

    // Try to create with companyId, if field doesn't exist, create without it
    let department;
    try {
      department = await prisma.department.create({
        data: {
          name,
          description,
          code,
          companyId: companyId, // Link department to company
        },
        include: {
          positions: true,
          employees: true,
        },
      });
    } catch (error: any) {
      console.error('Department create error:', error);
      
      // Handle unique constraint errors specifically
      if (error?.code === 'P2002' || error?.message?.includes('Unique constraint') || error?.message?.includes('Department_code_key') || error?.message?.includes('code_companyId') || error?.message?.includes('code')) {
        // Check if it's a company-specific conflict
        const conflictCheck = await prisma.department.findFirst({
          where: {
            code,
            companyId: companyId,
          },
        });

        if (conflictCheck) {
          return NextResponse.json(
            { 
              error: 'Энэ ашиглагдсан код байна',
              details: `Код "${code}" танай компанид бүртгэгдсэн байна. Өөр код ашиглана уу.`
            },
            { status: 400 }
          );
        } else {
          // Check if code exists globally (old unique index might still exist)
          const globalCheck = await prisma.department.findFirst({
            where: { code },
          });
          
          if (globalCheck) {
            // Code exists but in different company - this should be allowed
            // But if old unique index exists, it will fail
            return NextResponse.json(
            { 
              error: 'Database index асуудал байна',
              details: 'Энэ код өөр компанид байгаа ч database-д хуучин index байгаа тул алдаа гарч байна. MongoDB-д хуучин index-ийг устгах хэрэгтэй.'
            },
            { status: 500 }
          );
          }
          
          // This shouldn't happen with proper composite unique, but handle it anyway
          return NextResponse.json(
            { 
              error: 'Энэ код аль хэдийн ашиглагдсан байна',
              details: 'Өөр код ашиглана уу эсвэл database index-ийг шалгана уу.'
            },
            { status: 400 }
          );
        }
      }
      
      // If companyId field doesn't exist yet, create without it
      if (error?.message?.includes('companyId') || error?.code === 'P2009') {
        console.warn('companyId field not found, creating department without companyId');
        department = await prisma.department.create({
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
      } else {
        throw error;
      }
    }

    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error('Хэлтэс нэмэхэд алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Хэлтэс нэмэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}
