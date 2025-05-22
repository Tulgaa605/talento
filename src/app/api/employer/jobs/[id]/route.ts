import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "EMPLOYER") {
      return NextResponse.json(
        { error: "Нэвтрээгүй байна" },
        { status: 401 }
      );
    }

    const jobId = context.params.id;

    // Check if the job exists and belongs to the employer
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        company: {
          users: {
            some: {
              id: session.user.id,
            },
          },
        },
      },
      include: {
        company: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Ажлын байр олдсонгүй" },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Ажлын байр ачаалахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "EMPLOYER") {
      return NextResponse.json(
        { error: "Нэвтрээгүй байна" },
        { status: 401 }
      );
    }

    const jobId = context.params.id;
    const data = await request.json();

    // Check if the job exists and belongs to the employer
    const existingJob = await prisma.job.findFirst({
      where: {
        id: jobId,
        company: {
          users: {
            some: {
              id: session.user.id,
            },
          },
        },
      },
    });

    if (!existingJob) {
      return NextResponse.json(
        { error: "Ажлын байр олдсонгүй" },
        { status: 404 }
      );
    }

    // Update the job
    const updatedJob = await prisma.job.update({
      where: {
        id: jobId,
      },
      data: {
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        salary: data.salary,
        location: data.location,
        type: data.type,
        skills: data.skills,
        status: data.status,
      },
      include: {
        company: true,
      },
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Ажлын байр шинэчлэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  const jobId = context.params?.id;
  try {
    // 1. Delete all job applications related to this job
    await prisma.jobApplication.deleteMany({
      where: { jobId },
    });

    // 2. Delete the job itself
    await prisma.job.delete({
      where: { id: jobId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
