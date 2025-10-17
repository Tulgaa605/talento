import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, _ctx: RouteCtx) {
  try {
    void _ctx;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Зөвхөн Word (.doc/.docx) эсвэл PDF файл оруулна уу" },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Файлын хэмжээ 10MB-аас ихгүй байх ёстой" },
        { status: 400 }
      );
    }

    const uploadsDir = join(
      process.cwd(),
      "public",
      "uploads",
      "questionnaires"
    );
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const originalName = file.name;
    const safeOriginal = originalName.replace(/[^\w.\-()\s]/g, "");
    const fileName = `${timestamp}-${safeOriginal}`;
    const filePath = join(uploadsDir, fileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/questionnaires/${fileName}`;
    return NextResponse.json({
      success: true,
      fileName: originalName,
      fileUrl,
    });
  } catch (error) {
    console.error("Error uploading questionnaire attachment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
