import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Params = { id: string };

// Ажилтны мэдээллийг авах
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        position: { include: { department: true } },
        department: true,
        manager: { select: { id: true, firstName: true, lastName: true } },
        contracts: { where: { status: 'ACTIVE' }, orderBy: { startDate: 'desc' }, take: 1 },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Ажилтан олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Ажилтны мэдээлэл авахад алдаа гарлаа:', error);
    return NextResponse.json({ error: 'Ажилтны мэдээлэл авахад алдаа гарлаа' }, { status: 500 });
  }
}

// Ажилтны мэдээллийг шинэчлэх
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      firstName,
      lastName,
      middleName,
      email,
      phoneNumber,
      positionId,
      departmentId,
      status,
      address,
      emergencyContact,
      emergencyPhone,
    } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Нэр, овог, имэйл заавал оруулах шаардлагатай' },
        { status: 400 }
      );
    }

    const existingEmployee = await prisma.employee.findFirst({
      where: { email, id: { not: id } },
    });
    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Энэ имэйл өөр ажилтнаас ашиглагдсан байна' },
        { status: 400 }
      );
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        firstName,
        lastName,
        middleName: middleName || null,
        email,
        phoneNumber: phoneNumber || null,
        positionId: positionId || null,
        departmentId: departmentId || null,
        status: status || 'ACTIVE',
        address: address || null,
        emergencyContact: emergencyContact || null,
        emergencyPhone: emergencyPhone || null,
      },
      include: {
        position: { include: { department: true } },
        department: true,
      },
    });

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error('Ажилтны мэдээлэл шинэчлэхэд алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Ажилтны мэдээлэл шинэчлэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}

// Ажилтныг устгах
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;

    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      return NextResponse.json({ error: 'Ажилтан олдсонгүй' }, { status: 404 });
    }

    await prisma.employee.delete({ where: { id } });

    return NextResponse.json({ message: 'Ажилтан амжилттай устгагдлаа' }, { status: 200 });
  } catch (error) {
    console.error('Ажилтныг устгахад алдаа гарлаа:', error);
    return NextResponse.json({ error: 'Ажилтныг устгахад алдаа гарлаа' }, { status: 500 });
  }
}
