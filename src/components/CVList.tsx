"use client";

import { TrashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useNotification } from "@/providers/NotificationProvider";

interface CV {
  id: string;
  fileName: string;
  createdAt: string;
  fileUrl: string | null;
}

interface CVListProps {
  cvs: CV[];
}

export default function CVList({ cvs: initialCvs }: CVListProps) {
  const { addNotification } = useNotification();
  const [cvs, setCVs] = useState(initialCvs);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isViewing, setIsViewing] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const handleView = async (cvId: string) => {
    if (isViewing === cvId) return;

    setIsViewing(cvId);
    try {
      const response = await fetch(`/api/user/cvs/${cvId}/view`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Clean up the URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('CV харахад алдаа гарлаа:', error);
      addNotification(
        error instanceof Error 
          ? error.message 
          : 'CV харахад алдаа гарлаа. Дахин оролдоно уу.',
        'error'
      );
    } finally {
      setIsViewing(null);
    }
  };

  const handleDownload = async (cvId: string, fileName: string) => {
    if (isDownloading === cvId) return;

    setIsDownloading(cvId);
    try {
      const response = await fetch(`/api/user/cvs/${cvId}/view`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'CV.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('CV татахад алдаа гарлаа:', error);
      addNotification(
        error instanceof Error 
          ? error.message 
          : 'CV татахад алдаа гарлаа. Дахин оролдоно уу.',
        'error'
      );
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDelete = async (cvId: string) => {
    if (!confirm("CV-гээ устгахдаа итгэлтэй байна уу?")) return;

    setIsDeleting(cvId);
    try {
      const response = await fetch(`/api/user/cvs/${cvId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "CV устгахад алдаа гарлаа");
      }

      setCVs(cvs.filter((cv) => cv.id !== cvId));
      addNotification("CV амжилттай устгагдлаа", 'success');
    } catch (error) {
      console.error("Error deleting CV:", error);
      addNotification(
        error instanceof Error ? error.message : "CV устгахад алдаа гарлаа",
        'error'
      );
    } finally {
      setIsDeleting(null);
    }
  };

  if (!cvs || cvs.length === 0) {
    return (
      <div className="bg-white rounded-lg p-5 shadow text-center text-gray-500 text-black">
        CV оруулаагүй байна.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-h-[40rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded-2xl">
      {cvs.map((cv) => (
        <div
          key={cv.id}
          className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-7 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center text-black border border-gray-100"
        >
          <div className="w-full sm:w-auto">
            <div className="font-semibold text-sm sm:text-base text-black">
              {cv.fileName}
            </div>
            <div className="text-xs text-gray-500 mt-1 text-black">
              Огноо: {new Date(cv.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-0 w-full sm:w-auto">
            <button
              onClick={() => handleView(cv.id)}
              disabled={isViewing === cv.id}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition text-center flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <EyeIcon className="w-4 h-4" />
              {isViewing === cv.id ? "Харж байна..." : "Харах"}
            </button>
            <button
              onClick={() => handleDownload(cv.id, cv.fileName)}
              disabled={isDownloading === cv.id}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-[#0a1931] text-white rounded-lg font-semibold shadow hover:bg-[#185adb] transition text-center flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {isDownloading === cv.id ? "Татаж байна..." : "Татах"}
            </button>
            <button
              onClick={() => handleDelete(cv.id)}
              disabled={isDeleting === cv.id}
              className="p-2 text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
