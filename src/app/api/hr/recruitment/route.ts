import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'EMPLOYER') {
      return NextResponse.json(
        { message: 'Нэвтрэх эрхгүй байна' },
        { status: 401 }
      );
    }

    // Get recruitment statistics
    const [
      totalApplications,
      newApplications,
      interviewApplications,
      successfulApplications,
      applications,
      jobs,
      departments
    ] = await Promise.all([
      prisma.jobApplication.count(),
      prisma.jobApplication.count({
        where: {
          status: 'PENDING',
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      prisma.jobApplication.count({
        where: { status: 'EMPLOYER_APPROVED' }
      }),
      prisma.jobApplication.count({
        where: { status: 'APPROVED' }
      }),
      prisma.jobApplication.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          job: {
            include: {
              company: true
            }
          },
          user: true,
          cv: {
            select: {
              id: true,
              matchScore: true
            }
          }
        },
      }),
      prisma.job.findMany({
        where: { status: 'ACTIVE' },
        include: {
          company: true,
          applications: {
            select: {
              id: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.department.findMany({
        select: {
          id: true,
          name: true,
          code: true
        }
      })
    ]);

    const stats = {
      totalApplications,
      newApplications,
      interviewApplications,
      successfulApplications
    };

    const processedApplications = applications.map((app) => ({
      id: app.id,
      cvId: app.cv?.id || null,
      name: app.user?.name || 'Unknown',
      position: app.job?.title || 'N/A',
      department: app.job?.company?.name || 'N/A',
      status: app.status,
      date: app.createdAt.toISOString().slice(0, 10),
      score: app.cv?.matchScore ? Math.round(app.cv.matchScore * 100) : Math.floor(Math.random() * 40) + 60
    }));

    const processedJobs = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      department: job.company?.name || 'N/A',
      applicants: job.applications.length,
      status: job.status === 'ACTIVE' ? 'Идэвхтэй' : 'Дууссан',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) // 30 days from now
    }));

    return NextResponse.json({
      stats,
      applications: processedApplications,
      jobs: processedJobs,
      departments
    });
  } catch (error) {
    console.error('Recruitment data fetch error:', error);
    return NextResponse.json(
      { error: 'Серверийн алдаа гарлаа' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recruitment
 * Шинэ ажлын өргөдөл үүсгэх
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const created = await prisma.jobApplication.create({
      data: {
        jobId: body.jobId,
        userId: body.userId,
        status: body.status ?? 'PENDING',
        message: body.message ?? '',
        cvId: body.cvId ?? null,
      },
      include: {
        job: true,
        user: true,
      },
    });

    const response = {
      id: created.id,
      jobTitle: created.job?.title || 'N/A',
      jobId: created.jobId,
      applicantName: created.user?.name || 'Unknown',
      applicantEmail: created.user?.email || '',
      status: created.status,
      message: created.message ?? '',
      createdAt: created.createdAt.toISOString().slice(0, 10),
      updatedAt: created.updatedAt.toISOString().slice(0, 10),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Recruitment POST error:', error);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
