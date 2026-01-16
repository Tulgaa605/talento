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
      companyRegistrationNumber,
      companyDescription = "",
      location = "",
      website = "",
    } = body;

    if (!email || !password || !companyName || !companyRegistrationNumber) {
      return NextResponse.json(
        { error: "Имэйл, нууц үг, компанийн нэр, бүртгэлийн дугаар шаардлагатай." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Энэ имэйл хаяг бүртгэлтэй байна." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if company with this registration number already exists
    let company = await prisma.company.findUnique({
      where: { registrationNumber: companyRegistrationNumber.trim() },
    });

    if (!company) {
      // Create new company with registration number
      try {
        company = await prisma.company.create({
          data: {
            name: companyName,
            description: companyDescription,
            location,
            website,
            registrationNumber: companyRegistrationNumber.trim(),
          },
        });
      } catch (createError: any) {
        console.error("Company creation error:", createError);
        if (createError?.code === 'P2002') {
          return NextResponse.json(
            { error: "Энэ бүртгэлийн дугаар аль хэдийн бүртгэгдсэн байна." },
            { status: 400 }
          );
        }
        throw createError;
      }
    } else {
      // Company exists, update name if different
      if (company.name !== companyName) {
        company = await prisma.company.update({
          where: { id: company.id },
          data: { name: companyName },
        });
      }
    }

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
  } catch (error: any) {
    console.error("Registration error:", error);
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    });
    
    // Return more specific error messages
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: "Энэ бүртгэлийн дугаар эсвэл имэйл аль хэдийн бүртгэгдсэн байна." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error?.message || "Бүртгэл амжилтгүй боллоо" },
      { status: 500 }
    );
  }
}
