import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';

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
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalName = path.basename(file.name).replace(/\s+/g, '_');
    const filename = `${Date.now()}-${originalName}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'logos');

    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (mkdirError) {
      console.error('Failed to create directory:', mkdirError);
      return NextResponse.json(
        { message: 'Хавтас үүсгэхэд алдаа гарлаа' },
        { status: 500 }
      );
    }

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const imageUrl = `/uploads/logos/${filename}`;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { company: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Хэрэглэгчийн мэдээлэл олдсонгүй' },
        { status: 404 }
      );
    }

    if (!user.company) {
      const company = await prisma.company.create({
        data: {
          name: 'New Company',
          description: 'Company created during logo upload',
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { companyId: company.id },
      });

    }

    return NextResponse.json(
      {
        message: 'Лого амжилттай хуулагдлаа',
        imageUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json(
      { message: 'Лого хуулах үед алдаа гарлаа' },
      { status: 500 }
    );
  }
}
