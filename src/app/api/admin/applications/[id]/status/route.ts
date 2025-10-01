import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Тохирохоор нь enum/union-оо өөрийн схемтэй тааруулна уу
type Params = { id: string };
type Status =
  | 'PENDING'
  | 'EMPLOYER_APPROVED'
  | 'ADMIN_APPROVED'
  | 'APPROVED'
  | 'REJECTED';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Params> }  // ← Promise болголоо
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Нэвтрэх эрхгүй байна' }, { status: 401 });
    }

    const { status }: { status: Status } = await request.json();
    const { id: applicationId } = await params; // ← await хийж задлаж авна

    const currentApplication = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      select: { status: true },
    });
    if (!currentApplication) {
      return NextResponse.json({ message: 'Өргөдөл олдсонгүй' }, { status: 404 });
    }

    const allowedTransitions: Record<Status, Status[]> = {
      PENDING: ['EMPLOYER_APPROVED', 'REJECTED'],
      EMPLOYER_APPROVED: ['ADMIN_APPROVED', 'REJECTED'],
      ADMIN_APPROVED: ['APPROVED', 'REJECTED'],
      APPROVED: [],
      REJECTED: [],
    };

    const allowed = allowedTransitions[currentApplication.status as Status] ?? [];
    if (!allowed.includes(status)) {
      return NextResponse.json({ message: 'Энэ статус руу шилжих боломжгүй' }, { status: 400 });
    }

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true, phoneNumber: true } },
        job: { include: { company: { select: { name: true } } } },
      },
    });

    if (status === 'APPROVED' || status === 'ADMIN_APPROVED') {
      await prisma.notification.create({
        data: {
          userId: updatedApplication.userId,
          title: status === 'APPROVED' ? 'Өргөдөл зөвшөөрөгдлөө!' : 'Админ зөвшөөрлөө',
          message:
            status === 'APPROVED'
              ? `Таны ${updatedApplication.job.title} ажлын байрны өргөдөл бүрэн зөвшөөрөгдлөө.`
              : `Таны ${updatedApplication.job.title} ажлын байрны өргөдөл админд зөвшөөрөгдлөө.`,
          type: 'SUCCESS',
        },
      });

      const userEmail = updatedApplication.user.email ?? '';
      if (userEmail) {
        // Employee.email талбар unique биш бол findFirst ашиглаарай
        const existingEmployee = await prisma.employee.findUnique({ where: { email: userEmail } }).catch(() => null);

        if (!existingEmployee) {
          const department = await prisma.department.upsert({
            where: { code: 'UNASSIGNED' }, // code нь unique байх ёстой
            update: {},
            create: { name: 'Тодорхойгүй', description: 'Анхны автоматаар үүсгэсэн хэлтэс', code: 'UNASSIGNED' },
          });

          const position = await prisma.position.upsert({
            where: { code: 'UNASSIGNED' }, // code нь unique байх ёстой
            update: {},
            create: {
              title: 'Тодорхойгүй',
              description: 'Анхны автоматаар үүсгэсэн албан тушаал',
              code: 'UNASSIGNED',
              departmentId: department.id,
            },
          });

          const fullName = updatedApplication.user.name ?? '';
          const [firstName = 'Нэргүй', ...rest] = fullName.trim().split(/\s+/).filter(Boolean);
          const lastName = rest.join(' ') || 'Овоггүй';

          await prisma.employee.create({
            data: {
              employeeId: `EMP-${Date.now()}`,
              firstName,
              lastName,
              email: userEmail,
              phoneNumber: updatedApplication.user.phoneNumber ?? '00000000',
              dateOfBirth: new Date('1990-01-01T00:00:00Z'),
              gender: 'UNKNOWN',
              address: 'Тодорхойлоогүй',
              hireDate: new Date(),
              positionId: position.id,
              departmentId: department.id,
              status: 'ACTIVE',
            },
          });
        }
      }
    } else if (status === 'REJECTED') {
      await prisma.notification.create({
        data: {
          userId: updatedApplication.userId,
          title: 'Өргөдөл татгалзгагдлаа',
          message: `Уучлаарай, таны ${updatedApplication.job.title} ажлын байрны өргөдөл татгалзгагдлаа.`,
          type: 'ERROR',
        },
      });
    }

    return NextResponse.json({ message: 'Статус амжилттай шинэчлэгдлээ', application: updatedApplication });
  } catch (error) {
    console.error('Статус шинэчлэх үед алдаа гарлаа:', error);
    return NextResponse.json({ message: 'Серверийн алдаа гарлаа' }, { status: 500 });
  }
}
