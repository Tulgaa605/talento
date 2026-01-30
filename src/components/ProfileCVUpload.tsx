"use client";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { DocumentArrowUpIcon, EyeIcon } from "@heroicons/react/24/outline";
import { TrashIcon } from "@heroicons/react/24/solid";
import { useNotification } from "@/providers/NotificationProvider";

interface CV {
  id: string;
  fileName: string;
  createdAt: string;
  fileUrl: string | null;
}

export default function ProfileCVUpload() {
  const { data: session } = useSession();
  const { addNotification } = useNotification();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cvs, setCVs] = useState<CV[]>([]);
  const [loadingCVs, setLoadingCVs] = useState(false);
  const [isViewing, setIsViewing] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [viewingCVId, setViewingCVId] = useState<string | null>(null);
  const [viewingCVUrl, setViewingCVUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session) {
      fetchCVs();
    }
  }, [session]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === "application/pdf" ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        selectedFile.type === "application/msword"
      ) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("PDF эсвэл Word файл байршуулна уу");
        setFile(null);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const fetchCVs = async () => {
    setLoadingCVs(true);
    try {
      const response = await fetch("/api/user/cvs");
      if (response.ok) {
        const data = await response.json();
        setCVs(data);
        // Эхний CV-г автоматаар харах (хэрэв CV харахгүй байгаа бол)
        if (data.length > 0 && !viewingCVId && !viewingCVUrl) {
          // Эхний CV-г харах
          const firstCV = data[0];
          try {
            const cvResponse = await fetch(`/api/user/cvs/${firstCV.id}/view`);
            if (cvResponse.ok) {
              const blob = await cvResponse.blob();
              const url = window.URL.createObjectURL(blob);
              setViewingCVId(firstCV.id);
              setViewingCVUrl(url);
            }
          } catch (error) {
            console.error("Эхний CV харахад алдаа:", error);
          }
        }
      }
    } catch (error) {
      console.error("CV жагсаалт авахад алдаа:", error);
    } finally {
      setLoadingCVs(false);
    }
  };

  const handleView = async (cvId: string) => {
    if (isViewing === cvId || viewingCVId === cvId) return;

    // Өмнөх CV-ийн URL-г цэвэрлэх
    if (viewingCVUrl) {
      window.URL.revokeObjectURL(viewingCVUrl);
    }

    setIsViewing(cvId);
    try {
      const response = await fetch(`/api/user/cvs/${cvId}/view`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // CV-г iframe-ээр харах
      setViewingCVId(cvId);
      setViewingCVUrl(url);
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

  const handleCloseCVView = () => {
    if (viewingCVUrl) {
      window.URL.revokeObjectURL(viewingCVUrl);
    }
    setViewingCVId(null);
    setViewingCVUrl(null);
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

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/cv/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "CV байршуулахад алдаа гарлаа");
      }

      // Refresh CV list instead of reloading page
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await fetchCVs();
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "CV байршуулахад алдаа гарлаа";
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  if (!session) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
        CV байршуулахын тулд нэвтрэх шаардлагатай
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Байршуулсан CV-уудын жагсаалт - үргэлж харагдана */}
      {loadingCVs ? (
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center text-sm text-slate-500">
          CV жагсаалт ачааллаж байна...
        </div>
      ) : cvs.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Байршуулсан CV-ууд ({cvs.length})
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {cvs.map((cv) => (
              <div
                key={cv.id}
                className={`bg-slate-50 border rounded-lg p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${
                  viewingCVId === cv.id ? "border-blue-500 bg-blue-50" : "border-slate-200"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-slate-900 truncate">
                    {cv.fileName}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {new Date(cv.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleView(cv.id)}
                    disabled={isViewing === cv.id}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    title="Харах"
                  >
                    <EyeIcon className="w-3.5 h-3.5" />
                    {isViewing === cv.id ? "..." : "Харах"}
                  </button>
                  <button
                    onClick={() => handleDownload(cv.id, cv.fileName)}
                    disabled={isDownloading === cv.id}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    title="Татах"
                  >
                    <svg
                      className="w-3.5 h-3.5"
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
                    {isDownloading === cv.id ? "..." : "Татах"}
                  </button>
                  <button
                    onClick={() => handleDelete(cv.id)}
                    disabled={isDeleting === cv.id}
                    className="p-1.5 text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Устгах"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center text-sm text-slate-500">
          CV оруулаагүй байна. Доорх хэсгээс CV-гээ байршуулна уу.
        </div>
      )}

      {/* CV харах iframe - CVWizard шиг */}
      {viewingCVUrl && viewingCVId ? (
        <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                {cvs.find(cv => cv.id === viewingCVId)?.fileName || "CV"}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {cvs.length > 1 && (
                <>
                  <button
                    onClick={() => {
                      const currentIndex = cvs.findIndex(cv => cv.id === viewingCVId);
                      if (currentIndex > 0) {
                        handleView(cvs[currentIndex - 1].id);
                      }
                    }}
                    disabled={cvs.findIndex(cv => cv.id === viewingCVId) === 0}
                    className="px-3 py-1 text-sm text-slate-700 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Өмнөх CV"
                  >
                    ← Өмнөх
                  </button>
                  <button
                    onClick={() => {
                      const currentIndex = cvs.findIndex(cv => cv.id === viewingCVId);
                      if (currentIndex < cvs.length - 1) {
                        handleView(cvs[currentIndex + 1].id);
                      }
                    }}
                    disabled={cvs.findIndex(cv => cv.id === viewingCVId) === cvs.length - 1}
                    className="px-3 py-1 text-sm text-slate-700 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Дараагийн CV"
                  >
                    Дараагийн →
                  </button>
                </>
              )}
              <button
                onClick={handleCloseCVView}
                className="text-slate-600 hover:text-slate-900 transition-colors ml-2"
                title="Хаах"
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
          </div>
          <iframe
            src={viewingCVUrl}
            className="w-full h-[600px] border-0"
            title="CV Viewer"
          />
        </div>
      ) : (
        /* CV байхгүй эсвэл харахгүй үед файл байршуулах хэсэг */
        <>
          {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          CV файл байршуулах
        </label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center w-full">
          <button
            type="button"
            onClick={triggerFileInput}
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl bg-white hover:bg-slate-50 transition-colors duration-200"
          >
            <DocumentArrowUpIcon className="w-12 h-12 text-slate-400 mb-2" />
            <span className="text-sm font-medium text-slate-600">
              {file ? file.name : "Файл сонгох"}
            </span>
            <span className="text-xs text-slate-500 mt-1">
              PDF эсвэл Word файл
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

          {file && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors duration-200 text-sm
                ${
                  uploading
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-slate-900 hover:bg-slate-800"
                }`}
            >
              {uploading ? "CV байршуулж байна..." : "CV байршуулах"}
            </button>
          )}
        </>
      )}


    </div>
  );
}
