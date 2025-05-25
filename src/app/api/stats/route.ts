import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get total active jobs
    const totalJobs = await prisma.job.count({
      where: {
        status: "ACTIVE"
      }
    });

    // Get total companies
    const totalCompanies = await prisma.company.count();

    // Get total job seekers (users with role USER)
    const totalJobSeekers = await prisma.user.count({
      where: {
        role: "USER"
      }
    });

    // Get new jobs in the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const newJobs = await prisma.job.count({
      where: {
        createdAt: {
          gte: oneDayAgo
        }
      }
    });

    return NextResponse.json({
      totalJobs,
      totalCompanies,
      totalJobSeekers,
      newJobs
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 