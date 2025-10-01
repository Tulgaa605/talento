import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { JobApplicationStatus, Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'EMPLOYER') {
      return NextResponse.json(
        { message: 'Нэвтрэх эрхгүй байна' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const employerJobs = await prisma.job.findMany({
      where: {
        company: {
          users: {
            some: {
              id: session.user.id,
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    const jobIds = employerJobs.map((job) => job.id);

    const whereClause: Prisma.JobApplicationWhereInput = {
      jobId: {
        in: jobIds,
      },
    };

    if (status && status !== 'all') {
      whereClause.status = status as JobApplicationStatus; 
    }

    const applications = await prisma.jobApplication.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
