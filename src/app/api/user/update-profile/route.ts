import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(1, "Нэр хоосон байж болохгүй").optional(),
  phoneNumber: z.string().optional().nullable(),
  facebookUrl: z.string().url("Facebook холбоос буруу байна").or(z.literal('')).optional().nullable(),
});

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.errors }, { status: 400 });
    }

    const { name, phoneNumber, facebookUrl } = validation.data;

    const dataToUpdate: { name?: string; phoneNumber?: string | null; facebookUrl?: string | null } = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (phoneNumber !== undefined) dataToUpdate.phoneNumber = phoneNumber === '' ? null : phoneNumber;
    if (facebookUrl !== undefined) dataToUpdate.facebookUrl = facebookUrl === '' ? null : facebookUrl;

    if (Object.keys(dataToUpdate).length === 0) {
         return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate,
    });

    return NextResponse.json({ message: 'Профайл амжилттай шинэчлэгдлээ', user: { name: updatedUser.name, phoneNumber: updatedUser.phoneNumber, facebookUrl: updatedUser.facebookUrl } }, { status: 200 });

  } catch (error) {
    console.error('Profile update failed:', error);
     if (error instanceof z.ZodError) {
        return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
     }
    return NextResponse.json({ message: 'Профайл шинэчлэх үед алдаа гарлаа' }, { status: 500 });
  }
} 