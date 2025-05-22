import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Check if we have any jobs
    const jobs = await prisma.job.findMany({
      include: {
        company: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // If no jobs exist, create sample jobs
    if (jobs.length === 0) {
      // First create a default company
      const company = await prisma.company.create({
        data: {
          name: "Tech Corp",
          description: "A leading tech company",
          location: "Улаанбаатар",
        },
      });

      // Create sample jobs with company relation
      const job = await prisma.job.create({
        data: {
          title: "Маркетингийн Менежер",
          description:
            "Маркетингийн менежер ажилд авна. Бид таныг манай багт нэгдэхийг хүсч байна.",
          requirements:
            "3-5 жилийн маркетингийн туршлага, сошиал медиа, цахим маркетинг мэдлэгтэй, бүтээлч сэтгэлгээ, багийн ажил, баг удирдах чадвар, англи хэл мэдлэг (туслах), судалгаа хийх, хэрэглэгчийн зан төлөв ойлгох чадвартай байх",
          location: "Улаанбаатар",
          salary: "₮3,000,000 - ₮5,000,000",
          type: "FULL_TIME",
          status: "ACTIVE",
          company: {
            connect: { id: company.id },
          },
        },
        include: {
          company: true,
        },
      });

      return NextResponse.json([job]);
    }

    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
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

    return NextResponse.json(job);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
