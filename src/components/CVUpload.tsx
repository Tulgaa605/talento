"use client";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useChat } from "@/providers/ChatProvider";
import { useNotification } from "@/providers/NotificationProvider";

interface JobMatch {
  job: {
    id: string;
    title: string;
    company: {
      name: string;
    };
    location: string;
    salary?: string;
    requirements: string;
  };
  matchScore: number;
  matchDetails: {
    experience: number;
    skills: number;
    education: number;
    overall: number;
  };
}

interface CVUploadProps {
  onAnalysisStart: () => void;
  onAnalysisComplete: (analysis: string, fileUrl: string | null) => void;
}

export default function CVUpload({
  onAnalysisStart,
  onAnalysisComplete,
}: CVUploadProps) {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage } = useChat();
  const { addNotification } = useNotification();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        addNotification("Файлын хэмжээ 5MB-ээс хэтэрч байна", "error");
        return;
      }
      if (!selectedFile.type.includes("pdf")) {
        addNotification("Зөвхөн PDF файл оруулна уу", "error");
        return;
      }
      setFile(selectedFile);
      addNotification("Файл сонгогдлоо", "info");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    onAnalysisStart();

    await sendMessage("CV-г боловсруулж байна. Түр хүлээнэ үү...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload CV");
      }

      if (!data.success || !data.analysis) {
        throw new Error("CV analysis failed");
      }

      await sendMessage(`CV Шинжилгээ:\n\n${data.analysis}`);
      await sendMessage("Ажлын байруудыг хайж байна...");
      addNotification("CV амжилттай байршуулагдлаа", "success");
      onAnalysisComplete(data.analysis, data.fileUrl);
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload CV";
      addNotification(errorMessage, "error");
      await sendMessage(
        `Уучлаарай, CV-г боловсруулахад алдаа гарлаа:\n\n${errorMessage}\n\nДараах зүйлсийг хийж болно:\n1. CV-гээ шалгаад дахин оролдох\n2. Хэдэн минут хүлээгээд дахин оролдох\n3. Чат функцээр CV-гээ дэлгэрэнгүй шинжилгээ хийх`
      );
      onAnalysisComplete("", null);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!session) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
        CV байршуулахын тулд нэвтрэх шаардлагатай
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">CV байршуулах</h2>
            <button
              onClick={triggerFileInput}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0C213A] rounded-lg hover:bg-[#0C213A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C213A]"
            >
              Файл сонгох
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
            />
          </div>

          {file && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`w-full px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C213A] ${
              !file || uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#0C213A] hover:bg-[#0C213A]/90"
            }`}
          >
            {uploading ? "Байршуулж байна..." : "Байршуулах"}
          </button>
        </div>
      </div>
    </div>
  );
}
