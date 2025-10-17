import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cvId = searchParams.get("cvId");

    if (!cvId) {
      return new NextResponse("CV ID is required", { status: 400 });
    }

    const cv = await prisma.cV.findUnique({
      where: { id: cvId },
      include: {
        user: true,
      },
    });

    if (!cv || !cv.fileUrl) {
      return new NextResponse("CV not found", { status: 404 });
    }

    const jobApplication = await prisma.jobApplication.findFirst({
      where: {
        cvId: cv.id,
        job: {
          company: {
            users: {
              some: {
                id: session.user.id,
              },
            },
          },
        },
      },
    });

    if (!jobApplication) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let filePath: string;
    
    if (cv.fileUrl.startsWith('/uploads/')) {
      filePath = path.join(process.cwd(), "public", cv.fileUrl);
    } else if (cv.fileUrl.startsWith('uploads/')) {
      filePath = path.join(process.cwd(), "public", "/", cv.fileUrl);
    } else {
      filePath = path.join(process.cwd(), "public", "uploads", "cvs", cv.fileUrl);
    }

    const possiblePaths = [
      filePath,
      path.join(process.cwd(), "public", "uploads", "cvs", path.basename(cv.fileUrl)),
      path.join(process.cwd(), "uploads", "cvs", path.basename(cv.fileUrl)),
      path.join(process.cwd(), "public", cv.fileUrl.replace(/^\/+/, '')),
    ];

    for (const altPath of possiblePaths) {
      if (existsSync(altPath)) {
        try {
          const fileBuffer = await readFile(altPath);
          return sendFileResponse(fileBuffer, cv.fileName);
        } catch (error) {
          console.error("Error reading file from path:", altPath, error);
          continue;
        }
      }
    }
    
    return new NextResponse("File not found", { status: 404 });
  } catch (error) {
    console.error("Error downloading CV:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
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
  headers.set("Content-Disposition", `attachment; filename*=UTF-8''${encodedFileName}`);

  return new NextResponse(new Uint8Array(fileBuffer), {
    status: 200,
    headers,
  });
}
