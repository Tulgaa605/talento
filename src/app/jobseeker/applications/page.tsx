"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface JobApplication {
  id: string;
  createdAt: string;
  status: string;
  message: string;
  questionnaireId?: string;
  questionnaireResponse?: {
    id: string;
    createdAt: string;
  };
  job: {
    id: string;
    title: string;
    company: {
      name: string;
    };
  };
  cv: {
    id: string;
    fileName: string;
    fileUrl: string;
  } | null;
  questionnaire?: {
    id: string;
    title: string;
    type: string;
  };
}

export default function JobseekerApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/jobseeker/login");
      return;
    }

    if (status === "authenticated") {
      const fetchApplications = async () => {
        try {
          const response = await fetch("/api/user/applications");
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || "Өргөдлүүдийг ачаалахад алдаа гарлаа"
            );
          }
          const data: JobApplication[] = await response.json();
          setApplications(data);
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : "Өргөдлүүдийг ачаалахад алдаа гарлаа";
          setError(message);
        } finally {
          setLoading(false);
        }
      };

      fetchApplications();
    }
  }, [session, status, router]);

  const getStatusColor = (s: string) => {
    switch (s) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "EMPLOYER_APPROVED":
        return "bg-blue-100 text-blue-800";
      case "ADMIN_APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (s: string) => {
    switch (s) {
      case "PENDING":
        return "Хүлээгдэж буй";
      case "EMPLOYER_APPROVED":
        return "Ажил олгогч зөвшөөрсөн";
      case "ADMIN_APPROVED":
        return "Админ зөвшөөрсөн";
      case "REJECTED":
        return "Татгалзсан";
      default:
        return s;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Ачааллаж байна...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Алдаа гарлаа
                </h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-10 bg-white py-8">
      <div className="px-4 md:px-6 lg:px-16 2xl:px-32 pt-13 md:pt-20 lg:pt-20 2xl:pt-20">
        <div className="md:flex md:items-center md:justify-between mb-6 md:mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold leading-7 sm:text-3xl sm:truncate text-[#0C213A]">
              Миний өргөдлүүд
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Нийт {applications.length} өргөдөл
            </p>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-12 md:py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 md:w-10 md:h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293л5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
              Өргөдөл байхгүй байна
            </h3>
            <p className="text-sm md:text-base text-gray-500 px-4 md:px-0">
              Та одоогоор ямар нэгэн ажлын байрт өргөдөл гаргаагүй байна.
            </p>
            <div className="mt-6">
              <a
                href="/jobs"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Ажлын байр хайх
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {applications.map((application) => (
              <div
                key={application.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                <div className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                        <h3 className="text-lg md:text-xl font-bold text-[#0C213A]">
                          {application.job.title}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${getStatusColor(
                            application.status
                          )}`}
                        >
                          {getStatusText(application.status)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 md:gap-4 text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 md:w-5 md:h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3м2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <span className="text-sm">
                            {application.job.company.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 md:w-5 md:h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-sm">
                            {format(
                              new Date(application.createdAt),
                              "yyyy-MM-dd HH:mm"
                            )}
                          </span>
                        </div>
                      </div>
                      {application.message && (
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 md:p-4 mb-4">
                          {application.message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 md:gap-3 md:items-end">
                      {application.cv && (
                        <a
                          href={application.cv.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 md:px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#0C213A] hover:bg-[#091C30] hover:scale-105 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg
                            className="mr-2 h-4 w-4 md:h-5 md:w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293л5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          CV харах
                        </a>
                      )}
                      <a
                        href={`/jobs/${application.job.id}`}
                        className="inline-flex items-center px-3 md:px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-[#0C213A] bg-orange-50 hover:bg-orange-100 hover:scale-105 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        <svg
                          className="mr-2 h-4 w-4 md:h-5 md:w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        Ажлын байр харах
                      </a>
                      {application.questionnaire ? (
                        <button
                          onClick={() =>
                            router.push(
                              `/questionnaires/${application.questionnaire?.id}`
                            )
                          }
                          className="inline-flex items-center px-3 md:px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-sky-950 hover:bg-sky-900 hover:scale-105 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        >
                          <svg
                            className="mr-2 h-4 w-4 md:h-5 md:w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          {application.questionnaire.title} асуулгад хариулах
                        </button>
                      ) : (
                        <div className="text-xs md:text-sm text-[#0C213A]/80 bg-gray-50 px-3 md:px-4 py-2 rounded-lg">
                          Асуулга ирээгүй байна
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
