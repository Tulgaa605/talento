import { NextRequest, NextResponse } from 'next/server';
import {
  PrismaClient,
  Prisma,
  EmployeeStatus,
  EmploymentContractStatus,
} from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCompanyId } from '@/lib/hr-utils';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const departmentId = searchParams.get('departmentId');
    const positionId = searchParams.get('positionId');

    const where: Prisma.EmployeeWhereInput = {
      // Filter employees by companyId directly
      companyId: companyId,
    };

    if (statusParam && Object.values(EmployeeStatus).includes(statusParam as EmployeeStatus)) {
      where.status = statusParam as EmployeeStatus;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (positionId) {
      where.positionId = positionId;
    }

    try {
      const employees = await prisma.employee.findMany({
        where,
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          middleName: true,
          email: true,
          phoneNumber: true,
          status: true,
          hireDate: true,
          position: {
            select: {
              title: true,
              department: {
                select: { name: true }
              }
            }
          },
          department: {
            select: { name: true }
          },
          manager: {
            select: { firstName: true, lastName: true }
          },
          contracts: {
            where: { status: EmploymentContractStatus.ACTIVE },
            select: {
              contractNumber: true,
              contractType: true,
              salary: true,
              currency: true
            },
            orderBy: { startDate: 'desc' },
            take: 1,
          },
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        take: 200,
      });

      // Filter out employees with null position or department
      const validEmployees = employees.filter(emp => emp.position && emp.department);
      
      return NextResponse.json(validEmployees);
    } catch (queryError) {
      console.error('Prisma query error:', queryError);
      // If query fails, try a simpler query without relations
      const employees = await prisma.employee.findMany({
        where,
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          middleName: true,
          email: true,
          phoneNumber: true,
          status: true,
          hireDate: true,
          positionId: true,
          departmentId: true,
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        take: 200,
      });

      // Filter employees that have both positionId and departmentId
      const validEmployees = employees
        .filter(emp => emp.positionId && emp.departmentId)
        .map(emp => ({
          ...emp,
          position: { title: 'Тодорхойгүй', department: { name: 'Тодорхойгүй' } },
          department: { name: 'Тодорхойгүй' },
          manager: null,
          contracts: [],
        }));

      return NextResponse.json(validEmployees);
    }
  } catch (error) {
    console.error('Ажилтнуудыг авахад алдаа гарлаа:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', { message: errorMessage, stack: errorStack });
    return NextResponse.json(
      { error: 'Ажилтнуудыг авахад алдаа гарлаа', details: errorMessage },
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
    const {
      employeeId,
      firstName,
      lastName,
      middleName,
      email,
      phoneNumber,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      emergencyPhone,
      hireDate,
      positionId,
      departmentId,
      managerId,
      jobClassificationId,
      jobClassificationCode,
      jobProfession,
      mainGroup,
      subGroup,
      minorGroup,
      unitGroup,
    } = body;

    if (
      !employeeId || !firstName || !lastName || !email || !phoneNumber ||
      !dateOfBirth || !gender || !address || !hireDate || !positionId || !departmentId
    ) {
      return NextResponse.json(
        { error: 'Заавал оруулах талбаруудыг бүгд бөглөнө үү' },
        { status: 400 }
      );
    }

    const existingEmployee = await prisma.employee.findUnique({ where: { employeeId } });
    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Энэ ажилтны дугаар өмнө нь ашиглагдсан байна' },
        { status: 400 }
      );
    }

    const existingEmail = await prisma.employee.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Энэ имэйл өмнө нь ашиглагдсан байна' },
        { status: 400 }
      );
    }

    const department = await prisma.department.findUnique({ 
      where: { id: departmentId },
      select: { id: true, companyId: true }
    });
    if (!department) return NextResponse.json({ error: 'Хэлтэс олдсонгүй' }, { status: 404 });

    // Check if department belongs to companyId = 1
    if (department.companyId && department.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Энэ хэлтэс танай компанид хамаарахгүй байна' },
        { status: 403 }
      );
    }

    const position = await prisma.position.findUnique({ 
      where: { id: positionId },
      include: { department: { select: { companyId: true } } }
    });
    if (!position) return NextResponse.json({ error: 'Албан тушаал олдсонгүй' }, { status: 404 });

    // Check if position's department belongs to companyId = 1
    if (position.department.companyId && position.department.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Энэ албан тушаал танай компанид хамаарахгүй байна' },
        { status: 403 }
      );
    }

    if (managerId) {
      const manager = await prisma.employee.findUnique({ where: { id: managerId } });
      if (!manager) return NextResponse.json({ error: 'Удирдагч олдсонгүй' }, { status: 404 });
    }

    const employeeData: Prisma.EmployeeUncheckedCreateInput = {
      employeeId,
      firstName,
      lastName,
      middleName: middleName ?? null,
      email,
      phoneNumber,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      address,
      emergencyContact: emergencyContact ?? null,
      emergencyPhone: emergencyPhone ?? null,
      status: EmployeeStatus.ACTIVE,
      hireDate: new Date(hireDate),
      terminationDate: null,
      positionId,
      departmentId,
      companyId: companyId,
      managerId: managerId && managerId.trim() !== '' ? managerId : null,
      jobClassificationId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (jobClassificationId && jobClassificationId.trim() !== '') {
      employeeData.jobClassificationId = jobClassificationId;
    } else if (
      (jobClassificationCode && String(jobClassificationCode).trim() !== '') ||
      (jobProfession && String(jobProfession).trim() !== '')
    ) {
      const codeValue = (jobClassificationCode || '').toString().trim();
      let classification = null;

      if (codeValue) {
        classification = await prisma.jobClassification.findUnique({ where: { code: codeValue } });
      }

      if (!classification && jobProfession) {
        classification = await prisma.jobClassification.create({
          data: {
            code: codeValue || `${Date.now()}`,
            jobProfession: jobProfession || 'Тодорхойгүй',
            mainGroup: mainGroup || 'Тодорхойгүй',
            subGroup: subGroup || 'Тодорхойгүй',
            minorGroup: minorGroup || 'Тодорхойгүй',
            unitGroup: unitGroup || codeValue || '—',
            description: jobProfession ? `${jobProfession} - ${unitGroup || ''}` : undefined,
          },
        });
      }

      if (classification) {
        employeeData.jobClassificationId = classification.id;
      }
    }

    const employee = await prisma.employee.create({
      data: employeeData,
      include: {
        position: { include: { department: true } },
        department: true,
        jobClassification: true,
        manager: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
        subordinates: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Ажилтны бүртгэл нэмэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}
