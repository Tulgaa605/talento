import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Нэвтрээгүй байна" },
        { status: 401 }
      );
    }

    const jobId = params.id;
    const body = await request.json();
    const { title, description, location, salary, status } = body;

    // Check if the job exists and belongs to the employer
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        company: {
          users: {
            some: {
              id: session.user.id
            }
          }
        }
      }
    });

    if (!job) {
      return NextResponse.json(
        { error: "Ажлын байр олдсонгүй" },
        { status: 404 }
      );
    }

    // Update the job
    const updatedJob = await prisma.job.update({
      where: {
        id: jobId
      },
      data: {
        title,
        description,
        location,
        salary,
        status: status as "ACTIVE" | "CLOSED" | "DRAFT"
      }
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Алдаа гарлаа" },
      { status: 500 }
    );
  }
} 