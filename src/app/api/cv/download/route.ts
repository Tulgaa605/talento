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

    // Check if the user has permission to download this CV
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

    // Try both possible file locations
    const possiblePaths = [
      path.join(process.cwd(), "public", cv.fileUrl), // Direct upload path
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "cvs",
        path.basename(cv.fileUrl)
      ), // CV-specific path
    ];

    let fileBuffer: Buffer | null = null;
    let filePath: string | null = null;

    // Try each path until we find the file
    for (const filePath of possiblePaths) {
      if (existsSync(filePath)) {
        try {
          fileBuffer = await readFile(filePath);
          break;
        } catch (error) {
          console.error(`Error reading file at ${filePath}:`, error);
        }
      }
    }

    if (!fileBuffer) {
      return new NextResponse("File not found", { status: 404 });
    }

    // Set appropriate headers for file download
    const headers = new Headers();
    // Determine content type based on file extension
    const fileExtension = path.extname(cv.fileName).toLowerCase();
    const contentType =
      fileExtension === ".pdf"
        ? "application/pdf"
        : fileExtension === ".docx"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : fileExtension === ".doc"
        ? "application/msword"
        : "application/octet-stream";

    headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", `attachment; filename="${cv.fileName}"`);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error downloading CV:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
