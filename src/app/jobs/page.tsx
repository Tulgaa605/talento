'use client';

import { useState, useEffect, Suspense } from 'react';
import JobsList from '@/components/JobsList';
import JobDetails from '@/components/JobDetails';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
  const [, setJobs] = useState<Job[]>([]); // keep setter only to avoid unused var

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs');
        if (!response.ok) throw new Error('Failed to fetch jobs');
        const data = await response.json();
        setJobs(data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen pt-16 bg-white px-4 sm:px-8 md:px-16 lg:px-32">
      <main className="py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
          {/* Left: Filters, Search, Job List */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto">
            <Suspense
              fallback={
                <div className="bg-white rounded-lg shadow p-4 sm:p-6 md:p-8 text-center">
                  <p className="text-sm text-gray-500">Ажлын зарууд ачаалж байна…</p>
                </div>
              }
            >
              <JobsList onJobSelect={setSelectedJob} />
            </Suspense>
          </div> 
          <div className="hidden lg:block lg:col-span-3">
            <Suspense
              fallback={
                <div className="bg-white rounded-lg shadow p-4 sm:p-6 md:p-8 text-center">
                  <p className="text-sm text-gray-500">Дэлгэрэнгүй мэдээлэл ачаалж байна…</p>
                </div>
              }
            >
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
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
