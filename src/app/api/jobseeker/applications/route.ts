import {  NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET () {
  try {
    // Хэрэглэгчийн session-г шалгах
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'USER') {
      return NextResponse.json(
        { message: 'Нэвтрэх эрхгүй байна' },
        { status: 401 }
      );
    }

    // Хэрэглэгчийн өргөдлүүдийг авах
    const applications = await prisma.jobApplication.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true,
              },
            },
          },
        },
        cv: true,
        questionnaire: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Өргөдлүүд авах үед алдаа гарлаа:', error);
    return NextResponse.json(
      { message: 'Серверийн алдаа гарлаа' },
      { status: 500 }
    );
  }
}
