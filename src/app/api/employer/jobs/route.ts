import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobStatus, JobType } from "@prisma/client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Нэвтрээгүй байна" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { company: true },
    });

    if (!user || !user.company) {
      return NextResponse.json(
        { message: "Компанийн мэдээлэл олдсонгүй" },
        { status: 404 }
      );
    }

    const jobs = await prisma.job.findMany({
      where: { companyId: user.company.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        salary: true,
        type: true,
        status: true,
        createdAt: true,
        skills: true,
      },
    });

    console.log("Found jobs:", jobs);
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ message: "Алдаа гарлаа" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Нэвтрээгүй байна" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { company: true },
    });

    if (!user || !user.company) {
      return NextResponse.json(
        { message: "Компанийн мэдээлэл олдсонгүй" },
        { status: 404 }
      );
    }

    const body = await req.json();

    console.log("Received job data:", body);

    const {
      title,
      description,
      location,
      salary,
      requirements,
      otherInfo,
      companyUrl,
      contactPhone,
      workHours,
      type,
      skills,
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { message: "Албан тушаалыг оруулна уу" },
        { status: 400 }
      );
    }
    if (!description) {
      return NextResponse.json(
        { message: "Тайлбарыг оруулна уу" },
        { status: 400 }
      );
    }
    if (!location) {
      return NextResponse.json(
        { message: "Байршлыг сонгоно уу" },
        { status: 400 }
      );
    }
    if (!requirements) {
      return NextResponse.json(
        { message: "Шаардлагуудыг оруулна уу" },
        { status: 400 }
      );
    }

    try {
      const job = await prisma.job.create({
        data: {
          title,
          description,
          location,
          salary,
          requirements,
          status: JobStatus.ACTIVE,
          companyId: user.company.id,
          companyUrl,
          contactPhone,
          workHours,
          type,
          skills: JSON.stringify(skills || []),
        },
      });

      return NextResponse.json(job, { status: 201 });
    } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        {
          message:
            "Ажлын байр үүсгэхэд алдаа гарлаа: " +
            (error instanceof Error ? error.message : "Тодорхойгүй алдаа"),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        message:
          "Алдаа гарлаа: " +
          (error instanceof Error ? error.message : "Тодорхойгүй алдаа"),
      },
      { status: 500 }
    );
  }
}
