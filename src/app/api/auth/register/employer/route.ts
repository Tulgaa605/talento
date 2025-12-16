import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      companyName,
      companyDescription = "",
      location = "",
      website = "",
    } = body;

    if (!email || !password || !companyName) {
      return NextResponse.json(
        { message: "Имэйл, нууц үг, компанийн нэр шаардлагатай." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Энэ имэйл хаяг бүртгэлтэй байна." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const company = await prisma.company.create({
      data: {
        name: companyName,
        description: companyDescription,
        location,
        website,
      },
    });

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "EMPLOYER",
        companyId: company.id,
        companyName,
        companyDescription,
        location,
        website,
        status: "APPROVED",
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
