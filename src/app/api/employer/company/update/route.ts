import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { name, location, logoUrl, description, website, coverImageUrl } =
      data;

    // First get the user to find their companyId
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true },
    });

    if (!user?.companyId) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Update company profile
    const updatedCompany = await prisma.company.update({
      where: {
        id: user.companyId,
      },
      data: {
        name,
        location,
        logoUrl,
        description,
        website,
        coverImageUrl,
      },
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error("Error updating company profile:", error);
    return NextResponse.json(
      { error: "Error updating company profile" },
      { status: 500 }
    );
  }
}
