"use client";

import { CV } from "@prisma/client";
import { useState } from "react";

interface CvDownloadButtonProps {
  cv: CV;
}

export default function CvDownloadButton({ cv }: CvDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/cv/download?cvId=${cv.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = cv.fileName || 'CV.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('CV download error:', error);
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          alert('Эрх байхгүй байна. Нэвтрэх эрхээ шалгана уу.');
        } else if (error.message.includes('404')) {
          alert('CV файл олдсонгүй байна.');
        } else {
          alert('CV татахад алдаа гарлаа. Дахин оролдоно уу.');
        }
      } else {
        alert('CV татахад алдаа гарлаа.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="flex items-center justify-center gap-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      title={`${cv.fileName || 'CV'} татах`}
    >
      {isDownloading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
      ) : (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      )}
      {isDownloading ? 'Татаж байна...' : 'CV Татах'}
    </button>
  );
}
