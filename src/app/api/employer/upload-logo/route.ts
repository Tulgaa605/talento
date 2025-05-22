import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Нэвтрээгүй байна' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'Файл олдсонгүй' }, { status: 400 });
    }

    // Create a safe filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

    // Define the path to save the file
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'logos');
    
    // Create directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (mkdirError) {
      console.error("Failed to create directory:", mkdirError);
      return NextResponse.json(
        { message: 'Хавтас үүсгэхэд алдаа гарлаа' },
        { status: 500 }
      );
    }

    const filePath = path.join(uploadDir, filename);

    // Write the file to the server filesystem
    await writeFile(filePath, buffer);

    // Generate the URL path for the image
    const imageUrl = `/uploads/logos/${filename}`;

    // Get or create company for the user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { company: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Хэрэглэгчийн мэдээлэл олдсонгүй' },
        { status: 404 }
      );
    }

    // If user doesn't have a company, create one
    if (!user.company) {
      const company = await prisma.company.create({
        data: {
          name: 'New Company',
          description: 'Company created during logo upload',
        },
      });
      user.company = company;
    }

    // Update the company's logo URL in the database
    const updatedCompany = await prisma.company.update({
      where: { id: user.company.id },
      data: { logoUrl: imageUrl },
    });

    return NextResponse.json({ 
      message: 'Лого амжилттай хуулагдлаа', 
      imageUrl 
    }, { status: 200 });

  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json(
      { message: 'Лого хуулах үед алдаа гарлаа' },
      { status: 500 }
    );
  }
} 