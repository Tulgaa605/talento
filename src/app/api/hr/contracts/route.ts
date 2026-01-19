import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma, EmploymentContractStatus, ContractType } from '@prisma/client';
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

    // Get employees directly by companyId
    const companyEmployees = await prisma.employee.findMany({
      where: {
        companyId: companyId,
      },
      select: { id: true },
    });
    const companyEmployeeIds = companyEmployees.map(e => e.id);

    // If no employees, return empty array
    if (companyEmployeeIds.length === 0) {
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');
    const contractType = searchParams.get('contractType');

    const where: Prisma.EmploymentContractWhereInput = {
      // Filter contracts by employee IDs from this company
      employeeId: { in: companyEmployeeIds },
    };

    if (status) {
      where.status = status as EmploymentContractStatus;
    }

    if (employeeId) {
      // Also check if the requested employeeId belongs to this company
      if (!companyEmployeeIds.includes(employeeId)) {
        return NextResponse.json(
          { error: 'Энэ ажилтны гэрээ олдсонгүй' },
          { status: 404 }
        );
      }
      where.employeeId = employeeId;
    }

    if (contractType) {
      where.contractType = contractType as ContractType;
    }

    const contracts = await prisma.employmentContract.findMany({
      where,
      select: {
        id: true,
        contractNumber: true,
        contractType: true,
        startDate: true,
        endDate: true,
        salary: true,
        currency: true,
        status: true,
        createdAt: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            employeeId: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
      take: 100,
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
    const {
      contractNumber,
      employeeId: originalEmployeeId,
      contractType,
      workConditions,
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

    let employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true, companyId: true }
    });

    // Check if employee belongs to this company
    if (employee && employee.companyId && employee.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Энэ ажилтан танай компанид хамаарахгүй байна' },
        { status: 403 }
      );
    }

    // Check if contractNumber exists for this company's employees
    const existingContract = await prisma.employmentContract.findFirst({
      where: {
        contractNumber,
        employee: {
          companyId: companyId,
        },
      },
    });

    if (existingContract) {
      return NextResponse.json(
        { error: 'Энэ гэрээний дугаар танай компанид аль хэдийн ашиглагдсан байна' },
        { status: 400 }
      );
    }

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

      const nameParts = (user.name || 'Хэрэглэгч').split(' ');
      const firstName = nameParts[0] || 'Хэрэглэгч';
      const middleName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

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
        where: { 
          name: 'Системийн хэрэглэгч',
          companyId: companyId,
        },
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

      let defaultPosition = await prisma.position.findFirst({
        where: { 
          title: 'Хэрэглэгч',
          departmentId: defaultDepartment.id,
        },
      });

      if (!defaultPosition) {
        defaultPosition = await prisma.position.create({
          data: { 
            title: 'Хэрэглэгч', 
            code: 'USER', 
            departmentId: defaultDepartment.id,
          },
        });
      }

      employee = await prisma.employee.create({
        data: {
          employeeId: newEmployeeId,
          firstName,
          lastName: middleName || '', // lastName is required in schema, use middleName or empty string
          middleName,
          email: employeeEmail,
          phoneNumber: user.phoneNumber || '',
          status: 'ACTIVE',
          hireDate: new Date(),
          dateOfBirth: new Date('1990-01-01'),
          gender: 'OTHER',
          address: '',
          positionId: defaultPosition.id,
          departmentId: defaultDepartment.id,
          companyId: companyId,
        },
        include: { department: { select: { companyId: true } } }
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
        workConditions,
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
