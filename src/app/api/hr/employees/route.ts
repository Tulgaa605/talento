import { NextRequest, NextResponse } from 'next/server';
import {
  PrismaClient,
  Prisma,
  EmployeeStatus,
  EmploymentContractStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

// Бүх ажилтнуудыг авах
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const departmentId = searchParams.get('departmentId');
    const positionId = searchParams.get('positionId');

    const where: Prisma.EmployeeWhereInput = {};

    if (statusParam && Object.values(EmployeeStatus).includes(statusParam as EmployeeStatus)) {
      where.status = statusParam as EmployeeStatus;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (positionId) {
      where.positionId = positionId;
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        position: { include: { department: true } },
        department: true,
        jobClassification: true,
        manager: {
          select: { id: true, firstName: true, lastName: true, employeeId: true },
        },
        subordinates: {
          select: { id: true, firstName: true, lastName: true, employeeId: true },
        },
        contracts: {
          where: { status: EmploymentContractStatus.ACTIVE },
          orderBy: { startDate: 'desc' },
          take: 1,
        },
        _count: {
          select: { subordinates: true, contracts: true, decisions: true, documents: true },
        },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Ажилтнуудыг авахад алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Ажилтнуудыг авахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

// Шинэ ажилтны бүртгэл нэмэх
export async function POST(request: NextRequest) {
  try {
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

    const department = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!department) return NextResponse.json({ error: 'Хэлтэс олдсонгүй' }, { status: 404 });

    const position = await prisma.position.findUnique({ where: { id: positionId } });
    if (!position) return NextResponse.json({ error: 'Албан тушаал олдсонгүй' }, { status: 404 });

    if (managerId) {
      const manager = await prisma.employee.findUnique({ where: { id: managerId } });
      if (!manager) return NextResponse.json({ error: 'Удирдагч олдсонгүй' }, { status: 404 });
    }

    // Prisma-ийн FK-уудыг шууд оноодог хэлбэр -> UncheckedCreateInput тохиромжтой
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
      managerId: managerId && managerId.trim() !== '' ? managerId : null,
      jobClassificationId: null, // доор нөхцөлөөр дүүргэнэ
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Ажил мэргэжлийн ангилал: id эсвэл кодоор оноох/үүсгэх
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
  } catch (error) {
    console.error('Ажилтны бүртгэл нэмэхэд алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Ажилтны бүртгэл нэмэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}
