import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Please log in to view saved jobs" },
        { status: 401 }
      );
    }

    const savedJobs = await prisma.savedJob.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        jobId: true,
      },
    });

    return NextResponse.json(savedJobs);
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
