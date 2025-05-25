"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ApplyJobModal from "./ApplyJobModal";
import Link from "next/link";

interface CV {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
  status: string;
  matchScore?: number;
}

interface Job {
  id: string;
  title: string;
  company: {
    name: string;
    logoUrl?: string;
    url?: string;
    description?: string;
    id: string;
  };
  description: string;
  requirements: string;
  location: string;
  salary?: string;
  createdAt: string;
  type: string;
  contactPhone?: string;
  skills?: string;
}

interface JobDetailsProps {
  job: Job | null;
}

export default function JobDetails({ job }: JobDetailsProps) {
  const { data: session } = useSession();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [cvs, setCVs] = useState<CV[]>([]);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchCVs = async () => {
    try {
      const response = await fetch("/api/user/cvs");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch CVs");
      }
      const data = await response.json();
      setCVs(data);
    } catch (error) {
      console.error("Error fetching CVs:", error);
    }
  };

  const handleApply = async (cvId: string, message: string) => {
    if (!job) return;
    setSending(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/jobs/${job.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvId, message }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        // Check if it's a duplicate application
        if (data.isDuplicate) {
          setMessageType("error");
          setMessage("Та энэ ажлын байрт өргөдөл гаргасан байна");
        } else {
          throw new Error(data.error || "Илгээхэд алдаа гарлаа");
        }
      } else {
        setMessageType("success");
        setMessage(data.message || "CV амжилттай илгээгдлээ!");
        setIsApplyModalOpen(false);
      }
    } catch (e: any) {
      setMessageType("error");
      setMessage(e.message || "Алдаа гарлаа");
    } finally {
      setSending(false);
    }
  };

  const handleApplyClick = async () => {
    await fetchCVs();
    setIsApplyModalOpen(true);
  };

  if (!job) {
    return (
      <div className="bg-white shadow rounded-lg p-8 min-h-[500px] flex items-center justify-center text-gray-400">
        Ажлын байр сонгогдоогүй байна
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 sm:p-6 md:p-8 min-h-[500px]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
          {job.company.logoUrl ? (
            <img
              src={job.company.logoUrl}
              alt={`${job.company.name} logo`}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/default-company-logo.svg";
              }}
            />
          ) : (
            <img
              src="/images/default-company-logo.svg"
              alt="Default company logo"
              className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0C213A] mb-1">
            {job.title}
          </h2>
          <Link
            href={`/company/${job.company.id}`}
            className="text-blue-600 hover:underline text-sm sm:text-base font-medium block mb-1"
          >
            {job.company.name}
          </Link>
          <div className="flex flex-wrap gap-4 sm:gap-8 text-xs sm:text-sm text-[#0C213A] mb-2">
            <div>
              <span className="font-semibold">Үнэлгээ</span>{" "}
              <span className="ml-1">{job.salary || "Тохиролцоно"}</span>
            </div>
            <div>
              <span className="font-semibold">Ажлын цаг</span>{" "}
              <span className="ml-1">
                {job.type === "FULL_TIME"
                  ? "БҮТЭН ЦАГ"
                  : job.type === "PART_TIME"
                  ? "ХАГАС ЦАГ"
                  : job.type === "CONTRACT"
                  ? "ГЭРЭЭТ"
                  : job.type === "INTERNSHIP"
                  ? "ДАДЛАГА"
                  : job.type}
              </span>
            </div>
          </div>
        </div>
        {session?.user ? (
          <button
            onClick={handleApplyClick}
            className="w-full sm:w-auto bg-[#0C213A] text-white border-2 border-[#0C213A] py-2 px-4 sm:px-6 rounded-lg hover:bg-[#0C213A]/80 transition-colors disabled:opacity-50 text-sm sm:text-base"
            disabled={sending}
          >
            {sending ? "Илгээж байна..." : "Анкет илгээх"}
          </button>
        ) : (
          <div className="text-sm sm:text-base text-gray-500">
            Анкет илгээхийн тулд нэвтэрсэн байх шаардлагатай
          </div>
        )}
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-[#0C213A] mb-2">Байршил</h3>
          <p className="text-sm sm:text-base text-[#0C213A]">{job.location}</p>
        </div>

        {job.skills && (
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-[#0C213A] mb-2">
              Шаардлагатай ур чадварууд
            </h3>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(job.skills)
                ? job.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 bg-indigo-50 text-indigo-700 rounded-md text-xs sm:text-sm"
                    >
                      {skill}
                    </span>
                  ))
                : typeof job.skills === "string"
                ? JSON.parse(job.skills).map((skill: string) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 bg-indigo-50 text-indigo-700 rounded-md text-xs sm:text-sm"
                    >
                      {skill}
                    </span>
                  ))
                : null}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-base sm:text-lg font-semibold text-[#0C213A] mb-2">Тайлбар</h3>
          <p className="text-sm sm:text-base text-[#0C213A] whitespace-pre-wrap">
            {job.description}
          </p>
        </div>

        {job.requirements && (
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-[#0C213A] mb-2">
              Шаардлага
            </h3>
            <p className="text-sm sm:text-base text-[#0C213A] whitespace-pre-wrap">
              {job.requirements}
            </p>
          </div>
        )}

        {job.company.description && (
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-[#0C213A] mb-2">
              Байгууллагын тухай
            </h3>
            <p className="text-sm sm:text-base text-[#0C213A] whitespace-pre-wrap">
              {job.company.description}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mt-6">
          <div className="flex-1">
            <div className="font-semibold text-[#0C213A] mb-1 text-sm sm:text-base">Утас</div>
            <div className="text-[#0C213A] text-xs sm:text-sm">
              {job.contactPhone || "Утас оруулаагүй"}
            </div>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-[#0C213A] mb-1 text-sm sm:text-base">
              Байгууллагын линк
            </div>
            {job.company.url ? (
              <a
                href={job.company.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-xs sm:text-sm"
              >
                {job.company.url}
              </a>
            ) : (
              <span className="text-[#0C213A] text-xs sm:text-sm">Линк оруулаагүй</span>
            )}
          </div>
        </div>
      </div>

      <ApplyJobModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onApply={handleApply}
        cvs={cvs}
        jobTitle={job.title}
      />

      {message && (
        <div
          className={`fixed bottom-4 right-4 shadow-lg rounded-lg p-3 sm:p-4 max-w-md transform transition-all duration-300 ease-in-out ${
            messageType === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {messageType === "success" ? (
                <svg
                  className="h-5 w-5 sm:h-6 sm:w-6 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 sm:h-6 sm:w-6 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-xs sm:text-sm font-medium">{message}</p>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
            >
              <span className="sr-only">Close</span>
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
