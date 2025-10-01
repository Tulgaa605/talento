import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
    } = body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Энэ имэйл хаяг бүртгэлтэй байна" },
        { status: 400 }
      );
    }

    // const hashedPassword = await bcrypt.hash(password, 10);

    // const company = await prisma.company.create({
    //   data: {
    //     name: companyName,
    //     description: companyDescription,
    //     location,
    //     website,
    //   },
    // });

    // const user = await prisma.user.create({
    //   data: {
    //     email,
    //     name,
    //     password: hashedPassword,
    //     role: "EMPLOYER",
    //     companyId: company.id,
    //   },
    // });

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
