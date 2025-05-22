import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Define a schema for validation using Zod
const updateProfileSchema = z.object({
  name: z.string().min(1, "Нэр хоосон байж болохгүй").optional(),
  phoneNumber: z.string().optional().nullable(), // Allow empty string or null
  facebookUrl: z.string().url("Facebook холбоос буруу байна").or(z.literal('')).optional().nullable(), // Allow empty string, valid URL or null
});

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate the request body
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.errors }, { status: 400 });
    }

    const { name, phoneNumber, facebookUrl } = validation.data;

    // Prepare data for update (only include fields that were actually provided)
    const dataToUpdate: { name?: string; phoneNumber?: string | null; facebookUrl?: string | null } = {};
    if (name !== undefined) dataToUpdate.name = name;
    // Handle empty strings explicitly if you want them stored as null or empty
    if (phoneNumber !== undefined) dataToUpdate.phoneNumber = phoneNumber === '' ? null : phoneNumber;
    if (facebookUrl !== undefined) dataToUpdate.facebookUrl = facebookUrl === '' ? null : facebookUrl;

    // Ensure at least one field is being updated
    if (Object.keys(dataToUpdate).length === 0) {
         return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    // Update the user in the database
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