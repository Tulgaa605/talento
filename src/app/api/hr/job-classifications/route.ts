import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Нэвтрээгүй байна' },
        { status: 401 }
      );
    }

    const items = await prisma.jobClassification.findMany({
      orderBy: { code: 'asc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Ажил мэргэжлийн ангилал авахад алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Ажил мэргэжлийн ангилал авахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Нэвтрээгүй байна' },
        { status: 401 }
      );
    }

    const data = await req.json();
    
    // JobClassification is global (shared across companies), so code uniqueness is global
    const existing = await prisma.jobClassification.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Энэ код аль хэдийн ашиглагдсан байна' },
        { status: 400 }
      );
    }

    const created = await prisma.jobClassification.create({ data });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Ажил мэргэжлийн ангилал нэмэхэд алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Ажил мэргэжлийн ангилал нэмэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}
