import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      name,
      companyName,
      companyDescription,
      location,
      website,
    } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Энэ имэйл хаяг бүртгэлтэй байна" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create company
    const company = await prisma.company.create({
      data: {
        name: companyName,
        description: companyDescription,
        location,
        website,
      },
    });

    // Create user with EMPLOYER role
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "EMPLOYER",
        companyId: company.id,
      },
    });

    return NextResponse.json(
      { message: "Амжилттай бүртгэгдлээ" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Бүртгэл амжилтгүй боллоо" },
      { status: 500 }
    );
  }
}
