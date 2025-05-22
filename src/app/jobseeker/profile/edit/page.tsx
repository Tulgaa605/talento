import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import EditProfileForm from '@/components/EditProfileForm'; // Import the client component
import BackButton from '@/components/BackButton'; // Optional: Add a back button

// Fetch data on the server
async function getUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      facebookUrl: true,
    },
  });
  return user;
}

export default async function EditProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login?error=Unauthorized');
  }

  // Fetch current user data on the server
  const userData = await getUserData(session.user.id);

  if (!userData) {
     // Handle case where user data couldn't be fetched (though unlikely if session exists)
     return <div className="container mx-auto p-4 text-red-600">Хэрэглэгчийн мэдээлэл олдсонгүй.</div>;
  }

  return (
    <div className="min-h-screen bg-white py-8 md:py-12">
        <div className="container mx-auto max-w-2xl px-4">
            <div className="flex items-center mb-6">
                 {/* <BackButton /> Optional */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 ml-3">Профайл засах</h1>
            </div>

            {/* Render the client component with initial data */}
            <EditProfileForm user={userData} />
        </div>
    </div>
  );
} 