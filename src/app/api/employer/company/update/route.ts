import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !["EMPLOYER", "ADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { name, location, logoUrl, description, website, coverImageUrl } = data;

    // Get user with company relation
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If company doesn't exist, create one
    if (!user.company) {
      const newCompany = await prisma.company.create({
        data: {
          name: name || "Компани",
          location: location || "",
          description: description || "",
          website: website || "",
          logoUrl: logoUrl || null,
          coverImageUrl: coverImageUrl || null,
          users: {
            connect: { id: user.id },
          },
        },
      });

      // Update user's companyId
      await prisma.user.update({
        where: { id: user.id },
        data: { companyId: newCompany.id },
      });

      return NextResponse.json(newCompany);
    }

    // Update existing company
    const updatedCompany = await prisma.company.update({
      where: {
        id: user.company.id,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(location !== undefined && { location }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(description !== undefined && { description }),
        ...(website !== undefined && { website }),
        ...(coverImageUrl !== undefined && { coverImageUrl }),
      },
    });

    return NextResponse.json(updatedCompany);
  } catch (error: any) {
    console.error("Error updating company profile:", error);
    
    // Handle Prisma P2025 error (record not found)
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: "Компанийн мэдээлэл олдсонгүй. Дахин оролдоно уу." },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Error updating company profile" },
      { status: 500 }
    );
  }
}
