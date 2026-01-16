import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCompanyId } from '@/lib/hr-utils';

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

    // Get current user's companyId
    const companyId = await getCompanyId(session.user.id);
    
    if (!companyId) {
      return NextResponse.json({
        stats: {
          totalApplications: 0,
          newApplications: 0,
          interviewApplications: 0,
          successfulApplications: 0
        },
        applications: [],
        jobs: [],
        departments: [],
        governmentQuestionnaires: [],
        governmentResponses: []
      });
    }

    // Fetch government responses separately to handle potential errors
    let governmentResponses: Array<{
      id: string;
      questionnaireId: string;
      formData: any;
      createdAt: Date;
      userId: string;
      user: {
        id: string;
        name: string | null;
        email: string | null;
      } | null;
      questionnaire: {
        title: string;
        type: string;
      } | null;
    }> = [];
    try {
      governmentResponses = await prisma.questionnaireResponse.findMany({
        where: {
          questionnaire: { 
            type: 'GOVERNMENT_EMPLOYEE',
            companyId: companyId,
          },
        },
        select: {
          id: true,
          questionnaireId: true,
          formData: true,
          createdAt: true,
          userId: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          questionnaire: {
            select: {
              title: true,
              type: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      });
    } catch (govResponseError) {
      console.error('Error fetching government responses:', govResponseError);
      // Continue with empty array
      governmentResponses = [];
    }

    let totalApplications = 0;
    let newApplications = 0;
    let interviewApplications = 0;
    let successfulApplications = 0;
    let applications: any[] = [];
    let jobs: any[] = [];
    let departments: any[] = [];
    let governmentQuestionnaires: any[] = [];

    try {
      [
        totalApplications,
        newApplications,
        interviewApplications,
        successfulApplications,
        applications,
        jobs,
        departments,
        governmentQuestionnaires
      ] = await Promise.all([
        prisma.jobApplication.count({
          where: {
            job: {
              companyId: companyId,
            },
          },
        }),
        prisma.jobApplication.count({
          where: {
            status: 'PENDING',
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            },
            job: {
              companyId: companyId,
            },
          }
        }),
        prisma.jobApplication.count({
          where: { 
            status: 'EMPLOYER_APPROVED',
            job: {
              companyId: companyId,
            },
          }
        }),
        prisma.jobApplication.count({
          where: { 
            status: 'APPROVED',
            job: {
              companyId: companyId,
            },
          }
        }),
        prisma.jobApplication.findMany({
          where: {
            job: {
              companyId: companyId,
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            job: {
              select: {
                id: true,
                title: true,
                company: {
                  select: {
                    name: true
                  }
                }
              }
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            cv: {
              select: {
                id: true,
                matchScore: true
              }
            }
          },
        }),
        prisma.job.findMany({
          where: { 
            status: 'ACTIVE',
            companyId: companyId,
          },
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            company: {
              select: {
                name: true
              }
            },
            _count: {
              select: {
                applications: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }),
        prisma.department.findMany({
          where: {
            companyId: companyId,
          },
          select: {
            id: true,
            name: true,
            code: true
          },
          take: 50
        }),
        prisma.questionnaire.findMany({
          where: { 
            type: 'GOVERNMENT_EMPLOYEE',
            companyId: companyId,
          },
          select: {
            id: true,
            title: true,
            type: true,
            _count: {
              select: {
                responses: true
              }
            }
          },
          take: 5
        })
      ]);
    } catch (queryError) {
      console.error('Error in Promise.all queries:', queryError);
      const queryErrorMessage = queryError instanceof Error ? queryError.message : 'Unknown query error';
      const queryErrorStack = queryError instanceof Error ? queryError.stack : undefined;
      console.error('Query error details:', { message: queryErrorMessage, stack: queryErrorStack });
      // Continue with default values
    }

    const stats = {
      totalApplications,
      newApplications,
      interviewApplications,
      successfulApplications
    };

    const processedApplications = applications
      .filter(app => app.user)
      .map((app) => ({
        id: app.id,
        jobId: app.jobId,
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
      applicants: job._count?.applications || 0,
      status: job.status === 'ACTIVE' ? 'Идэвхтэй' : 'Дууссан',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) // 30 days from now
    }));

    const processedGovernmentResponses = governmentResponses
      .filter(response => response.user && response.userId) // Ensure both user and userId exist
      .map((response) => {
        let formData = null;
        try {
          formData = response.formData ? JSON.parse(response.formData as string) : null;
        } catch {
          // Silent error handling
        }

        const displayName = formData?.personalInfo?.name || response.user?.name || 'Unknown';

        return {
          id: response.id,
          cvId: null,
          name: displayName,
          position: 'Төрийн албан хаагч',
          department: 'Төрийн байгууллага',
          status: 'GOVERNMENT_QUESTIONNAIRE',
          date: response.createdAt.toISOString().slice(0, 10),
          score: 95,
          type: 'government',
          responseId: response.id,
          questionnaireId: response.questionnaireId,
          formData: formData
        };
      });

    const allApplications = [...processedApplications, ...processedGovernmentResponses];

    return NextResponse.json({
      stats,
      applications: allApplications,
      jobs: processedJobs,
      departments,
      governmentQuestionnaires,
      governmentResponses: processedGovernmentResponses
    });
  } catch (error) {
    console.error('Recruitment data fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : 'Error';
    console.error('Error details:', { 
      name: errorName,
      message: errorMessage, 
      stack: errorStack,
      error: error
    });
    return NextResponse.json(
      { 
        error: 'Серверийн алдаа гарлаа', 
        details: errorMessage,
        name: errorName
      },
      { status: 500 }
    );
  }
}

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
