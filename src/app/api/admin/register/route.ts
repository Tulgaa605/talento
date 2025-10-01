import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
  role?: string; // comes as string from client
};

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role }: RegisterBody = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Бүх талбаруудыг бөглөх шаардлагатай' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Имэйл хаяг буруу форматтай байна' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Энэ имэйл хаяг аль хэдийн бүртгэгдсэн байна' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Map raw string -> Prisma enum
    const roleStr = (role ?? 'ADMIN').toUpperCase();
    const userRole: UserRole = Object.values(UserRole).includes(roleStr as UserRole)
      ? (roleStr as UserRole)
      : UserRole.ADMIN;

    // Use `select` to avoid returning password (no unused var warning)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      { message: 'Амжилттай бүртгэгдлээ', user },
      { status: 201 }
    );
  } catch (error) {
    console.error('Админ бүртгүүлэх үед алдаа гарлаа:', error);
    return NextResponse.json(
      { message: 'Серверийн алдаа гарлаа' },
      { status: 500 }
    );
  }
}
