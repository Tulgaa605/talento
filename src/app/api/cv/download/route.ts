import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function GET(request: Request) {
  try {
    console.log("Download request received");
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log("No session found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cvId = searchParams.get("cvId");
    console.log("CV ID:", cvId);

    if (!cvId) {
      return new NextResponse("CV ID is required", { status: 400 });
    }

    const cv = await prisma.cV.findUnique({
      where: { id: cvId },
      include: {
        user: true,
      },
    });

    console.log("CV from database:", cv);

    if (!cv || !cv.fileUrl) {
      console.log("CV not found in database or no fileUrl");
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

    console.log("Job application found:", jobApplication);

    if (!jobApplication) {
      console.log("No job application found for this CV");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("Original fileUrl:", cv.fileUrl);
    const filePath = path.join(process.cwd(), "public", cv.fileUrl);
    console.log("Attempting to read file from:", filePath);

    if (!existsSync(filePath)) {
      console.log("File not found at primary path, trying alternative paths");
      const possiblePaths = [
        path.join(process.cwd(), "public", "uploads", "cvs", path.basename(cv.fileUrl.replace(/^\/uploads\/cvs\//, ''))),
      ];

      console.log("Checking possible paths:");
      for (const altPath of possiblePaths) {
        console.log("Trying path:", altPath);
        if (existsSync(altPath)) {
          console.log("File found at:", altPath);
          const fileBuffer = await readFile(altPath);
          return sendFileResponse(fileBuffer, cv.fileName);
        }
      }
      
      console.log("File not found in any location");
      return new NextResponse("File not found", { status: 404 });
    }

    try {
      console.log("Reading file from primary path");
      const fileBuffer = await readFile(filePath);
      return sendFileResponse(fileBuffer, cv.fileName);
    } catch (error) {
      console.error("Error reading file:", error);
      return new NextResponse("Error reading file", { status: 500 });
    }
  } catch (error) {
    console.error("Error downloading CV:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function sendFileResponse(fileBuffer: Buffer, fileName: string) {
  console.log("Sending file response for:", fileName);
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

  return new NextResponse(fileBuffer, {
    status: 200,
    headers,
  });
}
