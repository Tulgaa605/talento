"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useNotification } from "@/providers/NotificationProvider";

interface JobApplication {
  id: string;
  createdAt: string;
  status: string;
  message: string;
  viewedAt?: string | null;
  job: {
    id: string;
    title: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  cv: {
    id: string;
    fileName: string;
    fileUrl: string;
  } | null;
}

interface JobApplications {
  [jobId: string]: {
    title: string;
    count: number;
  };
}

export default function EmployerApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();
  const hasShownNotification = useRef(false);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/employer/applications");
      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error || "Өргөдлүүдийг ачаалахад алдаа гарлаа");
      }

      const data = (await response.json()) as unknown;

      if (Array.isArray(data)) {
        const typed = data as JobApplication[];
        setApplications(typed);
        try {
          await fetch("/api/employer/applications/mark-viewed", {
            method: "POST",
          });
        } catch (err) {
          console.error("Error marking applications as viewed:", err);
        }
        const newApplications = typed.filter(
          (app) => app.status === "PENDING" && !app.viewedAt
        );

        if (newApplications.length > 0 && !hasShownNotification.current) {
          const applicationsByJob = newApplications.reduce<JobApplications>((acc, app) => {
            if (!acc[app.job.id]) {
              acc[app.job.id] = { title: app.job.title, count: 0 };
            }
            acc[app.job.id].count += 1;
            return acc;
          }, {});
          Object.values(applicationsByJob).forEach(({ title, count }) => {
            addNotification(
              `${title} ажлын байрт ${count} шинэ өргөдөл ирлээ`,
              "info",
              "applications"
            );
          });
          hasShownNotification.current = true;
        }
      } else {
        throw new Error("Буруу өгөгдөл ирлээ");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Алдаа гарлаа";
      console.error("Error in fetchApplications:", message);
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/employer/login");
      return;
    }
    if (status === "authenticated" && session?.user) {
      fetchApplications();
    }
  }, [status, session, router, fetchApplications]);
  const jobs = useMemo(() => {
    const jobsMap: {
      [jobId: string]: { title: string; applications: JobApplication[] };
    } = {};
    applications.forEach((app) => {
      if (!jobsMap[app.job.id]) {
        jobsMap[app.job.id] = { title: app.job.title, applications: [] };
      }
      jobsMap[app.job.id].applications.push(app);
    });
    return Object.entries(jobsMap);
  }, [applications]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="w-full h-screen relative bg-white overflow-hidden">
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0C213A]"></div>
            <p className="mt-4 text-[#0C213A] text-[16px] font-poppins">
              Ачааллаж байна...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 pt-[130px]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-6 mb-12">
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-[#0C213A]/5">
            <Image
              src="/icons/application.svg"
              alt="Application"
              width={48}
              height={48}
              className="p-2"
            />
          </div>
          <div>
            <h1 className="text-[#0C213A] text-3xl font-bold font-poppins">
              Нээлттэй ажлын байрууд
            </h1>
            <p className="mt-2 text-[#0C213A]/60 text-[16px] font-poppins">
              Нийт {jobs.length} ажлын байр
            </p>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-[#0C213A]/5 mb-6">
              <svg
                className="h-10 w-10 text-[#0C213A]/30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-[#0C213A] text-xl font-semibold font-poppins mb-2">
              Ажлын байр байхгүй байна
            </h3>
            <p className="text-[#0C213A]/60 text-base font-poppins">
              Одоогоор нээлттэй ажлын байр байхгүй байна.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(([jobId, { title }]) => (
              <div
                key={jobId}
                className="bg-white rounded-2xl border border-gray-100 hover:border-[#0C213A]/20 transition-all duration-200 cursor-pointer"
                onClick={() => router.push(`/employer/applications/${jobId}`)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#0C213A]/5">
                        <Image
                          src="/icons/application.svg"
                          alt="Application"
                          width={24}
                          height={24}
                          className="p-1"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#0C213A]">
                          {title}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-[#0C213A]/60">
                          <span>Нээлттэй</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#0C213A]/60">
                        Дэлгэрэнгүй
                      </span>
                      <svg
                        className="w-5 h-5 text-[#0C213A]/40"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
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