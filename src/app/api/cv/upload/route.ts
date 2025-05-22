import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Файл олдсонгүй" }, { status: 400 });
    }

    // Файлын нэрийг аюулгүй болгох
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

    // Файл хадгалах замыг тодорхойлох
    const uploadDir = path.join(process.cwd(), "public", "uploads", "cvs");

    // Хавтас байхгүй бол үүсгэх
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (mkdirError) {
      console.error("Хавтас үүсгэхэд алдаа гарлаа:", mkdirError);
      return NextResponse.json(
        { error: "Хавтас үүсгэхэд алдаа гарлаа" },
        { status: 500 }
      );
    }

    const filePath = path.join(uploadDir, filename);

    // Файлыг серверт хадгалах
    await writeFile(filePath, buffer);

    // CV-ийн URL замыг үүсгэх
    const fileUrl = `/uploads/cvs/${filename}`;

    // CV-г мэдээллийн сан руу хадгалах
    const cv = await prisma.cV.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        fileUrl: fileUrl,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      cv,
    });
  } catch (error) {
    console.error("CV байршуулахад алдаа гарлаа:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "CV байршуулахад алдаа гарлаа",
      },
      { status: 500 }
    );
  }
}
