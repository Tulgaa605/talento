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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id: applicationId } = await params;

    const application = await prisma.jobApplication.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        user: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }
    const updatedApplication = await prisma.jobApplication.update({
      where: {
        id: applicationId,
      },
      data: {
        status: "ADMIN_APPROVED",
      },
      include: {
        user: true,
      },
    });

    await prisma.notification.create({
      data: {
        userId: application.userId,
        title: "Таны CV зөвшөөрөгдлөө",
        message: `${application.job.title} ажлын байрны CV таны хүсэлтийн дагуу зөвшөөрөгдлөө.`,
        type: "CV_APPROVED",
        link: `/jobs/${application.jobId}`,
      },
    });
    const userEmail = updatedApplication.user?.email ?? application.user.email ?? "";
    if (userEmail) {
      const existingEmployee = await prisma.employee.findUnique({ where: { email: userEmail }, select: { id: true } });
      if (!existingEmployee) {
        const department = await prisma.department.upsert({
          where: { code: 'UNASSIGNED' },
          update: {},
          create: { name: 'Тодорхойгүй', description: 'Анхны автоматаар үүсгэсэн хэлтэс', code: 'UNASSIGNED' },
        });
        const position = await prisma.position.upsert({
          where: { code: 'UNASSIGNED' },
          update: {},
          create: { title: 'Тодорхойгүй', description: 'Анхны автоматаар үүсгэсэн албан тушаал', code: 'UNASSIGNED', departmentId: department.id },
        });

        const fullName = application.user.name ?? '';
        const parts = fullName.trim().split(/\s+/).filter(Boolean);
        const firstName = parts[0] || 'Нэргүй';
        const lastName = parts.length > 1 ? parts.slice(1).join(' ') : 'Овоггүй';

        await prisma.employee.create({
          data: {
            employeeId: `EMP-${Date.now()}`,
            firstName,
            lastName,
            email: userEmail,
            phoneNumber: application.user.phoneNumber ?? '00000000',
            dateOfBirth: new Date('1990-01-01T00:00:00Z'),
            gender: 'UNKNOWN',
            address: 'Тодорхойлоогүй',
            hireDate: new Date(),
            positionId: position.id,
            departmentId: department.id,
            status: 'ACTIVE',
          },
        });
      }
    }

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("Error approving application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 