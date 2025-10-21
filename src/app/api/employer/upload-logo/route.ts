import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    // Зургийг base64 data URL болгоно (serverless-friendly)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const imageUrl = `data:${file.type};base64,${base64}`;

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
