"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/employer/hr/recruitment');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0C213A] mx-auto mb-4"></div>
        <p className="text-gray-600">Хуудас шилжүүлж байна...</p>
      </div>
    </div>
  );
}
