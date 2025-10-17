import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Please log in to save jobs" },
        { status: 401 }
      );
    }

    if (!session.user) {
      return NextResponse.json(
        { error: "User not found in session" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const jobId = body.jobId;

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const existingSavedJob = await prisma.savedJob.findFirst({
      where: {
        userId: session.user.id,
        jobId: jobId,
      },
    });

    if (existingSavedJob) {
      await prisma.savedJob.delete({
        where: {
          id: existingSavedJob.id,
        },
      });

      return NextResponse.json({ saved: false });
    } else {
      await prisma.savedJob.create({
        data: {
          userId: session.user.id,
          jobId: jobId,
        },
      });

      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    console.error("Error saving job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
