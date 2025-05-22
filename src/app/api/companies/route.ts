import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, location } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    // Check if company already exists
    const existingCompany = await prisma.company.findFirst({
      where: {
        name: name
      }
    });

    if (existingCompany) {
      return NextResponse.json(existingCompany);
    }

    // Create new company if it doesn't exist
    const company = await prisma.company.create({
      data: {
        name,
        location,
        description: `${name} - ${location}`
      }
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
} 