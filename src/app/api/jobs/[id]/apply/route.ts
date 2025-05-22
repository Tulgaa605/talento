import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Нэвтэрсэн байх шаардлагатай" },
        { status: 401 }
      );
    }

    const { cvId, message } = await request.json();
    if (!cvId) {
      return NextResponse.json({ error: "CV сонгоно уу" }, { status: 400 });
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: params.id },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Ажлын байр олдсонгүй" },
        { status: 404 }
      );
    }

    // Check if CV exists and belongs to user
    const cv = await prisma.cV.findFirst({
      where: {
        id: cvId,
        userId: session.user.id,
      },
    });

    if (!cv) {
      return NextResponse.json({ error: "CV олдсонгүй" }, { status: 404 });
    }

    // Check if user has already applied
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        jobId: params.id,
        userId: session.user.id,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "Та энэ ажлын байрт өргөдөл гаргасан байна" },
        { status: 400 }
      );
    }

    // Create job application
    const application = await prisma.jobApplication.create({
      data: {
        jobId: params.id,
        userId: session.user.id,
        cvId: cvId,
        message: message || "",
        status: "PENDING",
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error applying for job:", error);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}
