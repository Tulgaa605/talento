"use client";

import { TrashIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

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
  const [cvs, setCVs] = useState(initialCvs);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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

      // Remove the deleted CV from the list
      setCVs(cvs.filter((cv) => cv.id !== cvId));
    } catch (error) {
      console.error("Error deleting CV:", error);
      alert(
        error instanceof Error ? error.message : "CV устгахад алдаа гарлаа"
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
            {cv.fileUrl ? (
              <a
                href={cv.fileUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2 bg-[#0a1931] text-white rounded-lg font-semibold shadow hover:bg-[#185adb] transition text-black text-center flex items-center justify-center gap-2 text-sm sm:text-base"
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
                Татах
              </a>
            ) : (
              <button
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2 bg-gray-300 text-white rounded-lg font-semibold shadow cursor-not-allowed text-black text-sm sm:text-base"
                disabled
              >
                Татах
              </button>
            )}
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
