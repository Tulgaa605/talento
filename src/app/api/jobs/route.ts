import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // First, get all active jobs with their company IDs
    const jobs = await prisma.job.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        title: true,
        description: true,
        requirements: true,
        location: true,
        salary: true,
        type: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        companyId: true,
        companyUrl: true,
        contactPhone: true,
        workHours: true,
        skills: true,
        jobProfessionCode: true,
        jobProfessionName: true,
        otherInfo: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Then fetch companies separately to avoid relation errors
    const companyIds = [...new Set(jobs.map(job => job.companyId).filter(Boolean))];
    const companies = await prisma.company.findMany({
      where: {
        id: { in: companyIds },
      },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        url: true,
        description: true,
      },
    });

    // Create a map for quick lookup
    const companyMap = new Map(companies.map(company => [company.id, company]));

    // Combine jobs with their companies, filtering out jobs without valid companies
    const jobsWithCompanies = jobs
      .map(job => {
        const company = companyMap.get(job.companyId);
        if (!company) return null;
        
        return {
          ...job,
          company,
        };
      })
      .filter((job): job is NonNullable<typeof job> => job !== null);

    return NextResponse.json(jobsWithCompanies);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error stack:", errorStack);
    return NextResponse.json(
      { error: "Failed to fetch jobs", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { title, companyId, description, requirements, location, salary } =
      await req.json();

    if (!title || !companyId || !description || !requirements || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        requirements,
        location,
        salary,
        company: {
          connect: { id: companyId },
        },
      },
      include: {
        company: true,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
