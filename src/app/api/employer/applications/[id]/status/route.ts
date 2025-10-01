// src/app/api/employer/applications/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { id: string };

export async function PATCH(
  request: NextRequest,
  // ⬇️ params-ийг Promise болгож, дотор нь await хийнэ
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'EMPLOYER') {
      return NextResponse.json({ message: 'Нэвтрэх эрхгүй байна' }, { status: 401 });
    }

    const { id: applicationId } = await params; // ⬅️ эндээс id-гаа авна
    const { status } = await request.json();

    const currentApplication = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: { include: { users: true } },
          },
        },
      },
    });

    if (!currentApplication) {
      return NextResponse.json({ message: 'Өргөдөл олдсонгүй' }, { status: 404 });
    }

    const isAuthorized = currentApplication.job.company.users.some(
      (user) => user.id === session.user.id
    );

    if (!isAuthorized) {
      return NextResponse.json(
        { message: 'Энэ өргөдлийг удирдах эрхгүй байна' },
        { status: 403 }
      );
    }

    const allowedTransitions = {
      PENDING: ['EMPLOYER_APPROVED', 'REJECTED'],
    } as const;

    const currentStatus = currentApplication.status as keyof typeof allowedTransitions;
    const allowedStatuses = allowedTransitions[currentStatus];

    if (!allowedStatuses || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { message: 'Энэ статус руу шилжих боломжгүй' },
        { status: 400 }
      );
    }

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        job: { include: { company: { select: { name: true } } } },
      },
    });

    if (status === 'EMPLOYER_APPROVED') {
      await prisma.notification.create({
        data: {
          userId: updatedApplication.userId,
          title: 'Өргөдөл эхний шатны зөвшөөрөл авлаа!',
          message: `Таны ${updatedApplication.job.title} ажлын байрны өргөдөл ажил олгогчоос зөвшөөрөгдлөө. Одоо админ зөвшөөрөл хүлээгдэж байна.`,
          type: 'INFO',
        },
      });
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

    return NextResponse.json({
      message: 'Статус амжилттай шинэчлэгдлээ',
      application: updatedApplication,
    });
  } catch (error) {
    console.error('Статус шинэчлэх үед алдаа гарлаа:', error);
    return NextResponse.json({ message: 'Серверийн алдаа гарлаа' }, { status: 500 });
  }
}
