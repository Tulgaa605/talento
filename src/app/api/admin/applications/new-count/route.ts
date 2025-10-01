import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Хандах эрх байхгүй байна' },
        { status: 403 }
      );
    }

    const pendingCount = await prisma.jobApplication.count({
      where: {
        status: 'EMPLOYER_APPROVED',
      },
    });

    return NextResponse.json({ count: pendingCount });
  } catch (error) {
    console.error('Error fetching new applications count:', error);
    return NextResponse.json(
      { error: 'Өргөдлийн тоог авахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}
