"use client";

import { useState, useRef } from "react";
import { PhotoIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

interface ProfileImageUploadProps {
  userId: string;
  currentImageUrl: string | null;
}

export default function ProfileImageUpload({
  userId
}: ProfileImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Зөвхөн зураг файл байршуулна уу");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Зургийн хэмжээ 5MB-ээс хэтрэхгүй байх ёстой");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    try {
      const response = await fetch("/api/user/upload-profile-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Зураг хуулж чадсангүй.");
      }


      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ямар нэг алдаа гарлаа.");
      console.error("Upload error:", err);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/gif"
        style={{ display: "none" }}
        disabled={isLoading}
      />
      <button
        onClick={triggerFileInput}
        disabled={isLoading}
        className={`p-2 rounded-full text-white transition duration-150 ease-in-out ${
          isLoading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-[#0C213A] hover:bg-[#0C213A]/90"
        }`}
        title="Профайл зураг солих"
      >
        {isLoading ? (
          <ArrowPathIcon className="h-5 w-5 animate-spin" />
        ) : (
          <PhotoIcon className="h-5 w-5" />
        )}
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-1 absolute bottom-[-20px] w-max">
          {error}
        </p>
      )}
    </div>
  );
}
