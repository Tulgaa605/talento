import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Нэвтэрсэн байх шаардлагатай" },
        { status: 401 }
      );
    }

    const { id: jobId } = await params;
    const { cvId, message } = await request.json();
    if (!cvId) {
      return NextResponse.json({ error: "CV сонгоно уу" }, { status: 400 });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Ажлын байр олдсонгүй" },
        { status: 404 }
      );
    }

    const cv = await prisma.cV.findFirst({
      where: {
        id: cvId,
        userId: session.user.id,
      },
    });

    if (!cv) {
      return NextResponse.json({ error: "CV олдсонгүй" }, { status: 404 });
    }

    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        jobId: jobId,
        userId: session.user.id,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { 
          error: "Та энэ ажлын байрт өргөдөл гаргасан байна",
          isDuplicate: true 
        },
        { status: 400 }
      );
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId: jobId,
        userId: session.user.id,
        cvId: cvId,
        message: message || "",
        status: "PENDING",
      },
    });

    await prisma.notification.create({
      data: {
        userId: job.companyId,
        title: "Шинэ өргөдөл ирлээ",
        message: `${job.title} ажлын байрт шинэ өргөдөл ирлээ`,
        type: "APPLICATION",
        link: `/employer/applications/${job.id}`,
      },
    });

    return NextResponse.json({
      ...application,
      success: true,
      message: "Өргөдөл амжилттай илгээгдлээ"
    });
  } catch (error) {
    console.error("Error applying for job:", error);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}
