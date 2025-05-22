"use client";

import { useState, useEffect } from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import JobsList from "@/components/JobsList";
import JobDetails from "@/components/JobDetails";
import { JSX } from "react";

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
  isSaved?: boolean;
}

export default function JobsPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs");
        if (!response.ok) throw new Error("Failed to fetch jobs");
        const data = await response.json();
        setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen pt-16 bg-white px-4 sm:px-8 md:px-16 lg:px-32">
      <main className="py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
          {/* Left: Filters, Search, Job List */}
          <div className="lg:col-span-2">
            <JobsList onJobSelect={setSelectedJob} />
          </div>
          {/* Right: Job Details */}
          <div className="hidden lg:block lg:col-span-3">
            {selectedJob ? (
              <JobDetails job={selectedJob} />
            ) : (
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 md:p-8 text-center">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  Ажлын байр сонгоно уу
                </h3>
                <p className="text-sm sm:text-base text-gray-500">
                  Дэлгэрэнгүй мэдээллийг харахын тулд ажлын байрыг сонгоно уу
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
