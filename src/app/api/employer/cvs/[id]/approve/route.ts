import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: cvId } = await params;

    // Get the CV and verify ownership
    const cv = await prisma.cV.findUnique({
      where: {
        id: cvId,
      },
      include: {
        user: true,
      },
    });

    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    // Verify that the user is associated with the company
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        company: true,
      },
    });

    if (!user?.company) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update CV status
    const updatedCV = await prisma.cV.update({
      where: {
        id: cvId,
      },
      data: {
        status: "ACCEPTED",
      },
    });

    // Create notification for the applicant
    await prisma.notification.create({
      data: {
        userId: cv.userId,
        title: "Таны CV зөвшөөрөгдлөө",
        message: "Таны CV зөвшөөрөгдлөө",
        type: "CV_APPROVED",
        link: `/profile`,
      },
    });

    return NextResponse.json(updatedCV);
  } catch (error) {
    console.error("Error approving CV:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
