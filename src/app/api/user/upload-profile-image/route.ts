import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions); // Optional: Add auth check if needed

  // Basic auth check (ensure user is logged in)
  // You might want more robust checks depending on your needs
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;

    if (!file) {
      return NextResponse.json({ message: 'Файл олдсонгүй' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ message: 'Хэрэглэгчийн ID олдсонгүй' }, { status: 400 });
    }

    // Ensure the logged-in user matches the userId being updated (security check)
    if (session.user.id !== userId) {
       return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Create a safe filename (e.g., timestamp + original name)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

    // Define the path to save the file
    // IMPORTANT: Ensure this directory exists and the server has write permissions
    // For production, use a proper file storage service (S3, Cloudinary, etc.)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'images');
    const filePath = path.join(uploadDir, filename);

    // --- Ensure directory exists (add this if needed) ---
    // import { mkdir } from 'fs/promises';
    // try {
    //   await mkdir(uploadDir, { recursive: true });
    // } catch (mkdirError) {
    //   console.error("Failed to create directory:", mkdirError);
    //   return NextResponse.json({ message: 'Серверийн дотоод алдаа (mkdir)' }, { status: 500 });
    // }
    // -----------------------------------------------------

    // Write the file to the server filesystem
    await writeFile(filePath, buffer);
    console.log(`File uploaded to: ${filePath}`);

    // Generate the URL path for the image
    const imageUrl = `/uploads/images/${filename}`;

    // Update the user's profileImageUrl in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profileImageUrl: imageUrl },
    });

    return NextResponse.json({ message: 'Зураг амжилттай хуулагдлаа', imageUrl }, { status: 200 });

  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json({ message: 'Зураг хуулах үед алдаа гарлаа' }, { status: 500 });
  }
} 