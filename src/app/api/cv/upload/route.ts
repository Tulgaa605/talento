import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Файлыг base64 болгож база дээр хадгална (serverless-friendly)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Content = buffer.toString('base64');
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

    // Файлыг database дээр хадгална
    const cv = await prisma.cV.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        fileUrl: filename, // filename-г fileUrl-д хадгална
        content: base64Content, // base64 content-ыг хадгална
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
