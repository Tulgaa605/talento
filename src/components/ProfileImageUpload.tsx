"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

interface ProfileImageUploadProps {
  userId: string;
  currentImageUrl: string | null;
}

export default function ProfileImageUpload({ userId, currentImageUrl }: ProfileImageUploadProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId); // Send userId to identify user

    try {
      const response = await fetch('/api/user/upload-profile-image', { // API route for upload
        method: 'POST',
        body: formData,
        // Note: Don't set Content-Type header when using FormData,
        // the browser will set it correctly with the boundary
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Зураг хуулж чадсангүй.');
      }

      // Refresh the page data to show the new image
      router.refresh();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ямар нэг алдаа гарлаа.');
      console.error("Upload error:", err);
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="absolute bottom-0 right-0 mb-1 mr-1">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/gif" // Accept common image types
        style={{ display: 'none' }} // Hide the default input
        disabled={isLoading}
      />
      <button
        onClick={triggerFileInput}
        disabled={isLoading}
        className={`p-2 rounded-full text-white transition duration-150 ease-in-out ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        title="Профайл зураг солих"
      >
        {isLoading ? (
          <ArrowPathIcon className="h-5 w-5 animate-spin" />
        ) : (
          <PhotoIcon className="h-5 w-5" />
        )}
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-1 absolute bottom-[-20px] w-max">{error}</p>
      )}
    </div>
  );
} 