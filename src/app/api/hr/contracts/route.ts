import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma, EmploymentContractStatus, ContractType } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');
    const contractType = searchParams.get('contractType');

    const where: Prisma.EmploymentContractWhereInput = {};

    if (status) {
      where.status = status as EmploymentContractStatus;
    }

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (contractType) {
      where.contractType = contractType as ContractType;
    }

    const contracts = await prisma.employmentContract.findMany({
      where,
      include: {
        employee: {
          include: {
            position: { include: { department: true } },
            department: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json(contracts);
  } catch (error) {
    console.error('Хөдөлмөрийн гэрээг авахад алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Хөдөлмөрийн гэрээг авахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      contractNumber,
      employeeId: originalEmployeeId,
      contractType,
      startDate,
      endDate,
      salary,
      currency,
      probationPeriod,
      workSchedule,
      benefits,
      terms,
      documentUrl,
    } = body;

    let employeeId = originalEmployeeId;

    if (!contractNumber || !employeeId || !contractType || !startDate || !salary) {
      return NextResponse.json(
        { error: 'Заавал оруулах талбаруудыг бүгд бөглөнө үү' },
        { status: 400 }
      );
    }

    const existingContract = await prisma.employmentContract.findUnique({
      where: { contractNumber },
    });

    if (existingContract) {
      return NextResponse.json(
        { error: 'Энэ гэрээний дугаар өмнө нь ашиглагдсан байна' },
        { status: 400 }
      );
    }

    let employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      const user = await prisma.user.findUnique({
        where: { id: employeeId },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Ажилтны эсвэл хэрэглэгчийн олдсонгүй' },
          { status: 404 }
        );
      }

      const [firstName, ...lastNameParts] = (user.name || 'Хэрэглэгч').split(' ');
      const lastName = lastNameParts.join(' ') || '';

      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const newEmployeeId = `EMP-${year}${month}-${random}`;

      let employeeEmail = user.email || '';
      if (employeeEmail) {
        const existingEmployeeWithEmail = await prisma.employee.findUnique({
          where: { email: employeeEmail },
        });

        if (existingEmployeeWithEmail) {
          const timestamp = Date.now();
          employeeEmail = `employee.${timestamp}@company.com`;
        }
      }

      let defaultDepartment = await prisma.department.findFirst({
        where: { name: 'Системийн хэрэглэгч' },
      });

      if (!defaultDepartment) {
        defaultDepartment = await prisma.department.create({
          data: { name: 'Системийн хэрэглэгч', code: 'SYS' },
        });
      }

      let defaultPosition = await prisma.position.findFirst({
        where: { title: 'Хэрэглэгч' },
      });

      if (!defaultPosition) {
        defaultPosition = await prisma.position.create({
          data: { title: 'Хэрэглэгч', code: 'USER', departmentId: defaultDepartment.id },
        });
      }

      employee = await prisma.employee.create({
        data: {
          employeeId: newEmployeeId,
          firstName,
          lastName,
          email: employeeEmail,
          phoneNumber: user.phoneNumber || '',
          status: 'ACTIVE',
          hireDate: new Date(),
          dateOfBirth: new Date('1990-01-01'),
          gender: 'OTHER',
          address: '',
          positionId: defaultPosition.id,
          departmentId: defaultDepartment.id,
        },
      });

      employeeId = employee.id;
    }

    await prisma.employmentContract.updateMany({
      where: { employeeId, status: 'ACTIVE' },
      data: { status: 'EXPIRED' },
    });

    const contract = await prisma.employmentContract.create({
      data: {
        contractNumber,
        employeeId,
        contractType,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        salary: parseFloat(salary),
        currency: currency || 'MNT',
        probationPeriod: probationPeriod ? parseInt(probationPeriod) : null,
        workSchedule,
        benefits,
        terms,
        documentUrl,
      },
      include: {
        employee: {
          include: {
            position: { include: { department: true } },
            department: true,
          },
        },
      },
    });

    return NextResponse.json(contract, { status: 201 });
  } catch (error) {
    console.error('Хөдөлмөрийн гэрээ нэмэхэд алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Хөдөлмөрийн гэрээ нэмэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}
