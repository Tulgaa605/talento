import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import path from "path";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Нэвтрээгүй байна", { status: 401 });
    }

    const { id } = await context.params;

    if (!id) {
      return new NextResponse("CV ID шаардлагатай", { status: 400 });
    }

    const cv = await prisma.cV.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!cv) {
      return new NextResponse("CV олдсонгүй", { status: 404 });
    }

    // Хэрэглэгч зөвхөн өөрийн CV-г харж болно
    if (cv.userId !== session.user.id) {
      return new NextResponse("Эрх байхгүй", { status: 403 });
    }

    // Файлыг database-аас base64 хэлбэрээр уншина
    if (!cv.content) {
      return new NextResponse("Файлын агуулга олдсонгүй", { status: 404 });
    }

    const fileBuffer = Buffer.from(cv.content, "base64");
    return sendFileResponse(fileBuffer, cv.fileName);
  } catch (error) {
    console.error("CV харахад алдаа гарлаа:", error);
    return new NextResponse("Дотоод серверийн алдаа", { status: 500 });
  }
}

function sendFileResponse(fileBuffer: Buffer, fileName: string) {
  const headers = new Headers();
  const fileExtension = path.extname(fileName).toLowerCase();
  const contentType =
    fileExtension === ".pdf"
      ? "application/pdf"
      : fileExtension === ".docx"
      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : fileExtension === ".doc"
      ? "application/msword"
      : "application/octet-stream";

  headers.set("Content-Type", contentType);
  const encodedFileName = encodeURIComponent(fileName);
  headers.set(
    "Content-Disposition",
    `inline; filename*=UTF-8''${encodedFileName}`
  );

  return new NextResponse(new Uint8Array(fileBuffer), {
    status: 200,
    headers,
  });
}







