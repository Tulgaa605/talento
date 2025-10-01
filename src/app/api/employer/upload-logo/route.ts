// app/api/upload-logo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Node.js орчинд fs ашиглах тул (Edge runtime биш)
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Нэвтрээгүй байна' }, { status: 401 });
  }

  try {
    // ---- 1) FormData-аас файл авах, шалгах
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'Файл олдсонгүй' }, { status: 400 });
    }

    // Хэмжээ/төрлийг хүсвэл энд нэмж шалгаж болно (жишээ нь 5MB-аас их биш, зураг эсэх г.м)
    // if (file.size > 5 * 1024 * 1024) { ... }
    // if (!file.type.startsWith('image/')) { ... }

    // ---- 2) Аюулгүй файл нэр бэлтгэх
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Файлын нэрийг цэвэрлэх (замын тусгай тэмдэгтүүдийг арилгах)
    const originalName = path.basename(file.name).replace(/\s+/g, '_');
    const filename = `${Date.now()}-${originalName}`;

    // ---- 3) Хадгалах хавтсаа бэлтгэх
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

    // ---- 4) Файлыг бичих
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Клиент талд харагдах зам
    const imageUrl = `/uploads/logos/${filename}`;

    // ---- 5) Хэрэглэгч ба компани холболт
    // Хэрэглэгчийг имэйлээр нь унших
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

    // Хэрэв компани байхгүй бол шинээр үүсгээд хэрэглэгчтэй нь холбоно
    if (!user.company) {
      const company = await prisma.company.create({
        data: {
          name: 'New Company',
          description: 'Company created during logo upload',
        },
      });

      // ⚠️ Ихэнх төслүүдэд User талдаа companyId (nullable) талбар байдаг.
      // Тийм тохиолдолд хэрэглэгчийг шинэ компанитай холбоно:
      await prisma.user.update({
        where: { id: user.id },
        data: { companyId: company.id },
      });

      // Хэрэв та many-to-many/one-to-many өөр загвартай бол дээрх мөрийг
      // өөрийн schema-д тааруулан өөрчилнө үү (жишээ нь company.users.connect).
    }

    // ---- 6) Логоны URL-ыг буцаах
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
