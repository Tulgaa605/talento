import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Нэвтрэх эрхгүй байна' },
        { status: 401 }
      );
    }

    const [
      totalUsers,
      totalJobs,
      totalApplications,
      totalCompanies,
      pendingApplications,
      approvedApplications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.jobApplication.count(),
      prisma.company.count(),
      prisma.jobApplication.count({
        where: {
          status: 'PENDING',
        },
      }),
      prisma.jobApplication.count({
        where: {
          status: 'ADMIN_APPROVED',
        },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalJobs,
      totalApplications,
      totalCompanies,
      pendingApplications,
      approvedApplications,
    });
  } catch (error) {
    console.error('Статистик авах үед алдаа гарлаа:', error);
    return NextResponse.json(
      { message: 'Серверийн алдаа гарлаа' },
      { status: 500 }
    );
  }
}
