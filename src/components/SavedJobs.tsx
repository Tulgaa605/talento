import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { mn } from "date-fns/locale";

interface Job {
  id: string;
  title: string;
  company: {
    name: string;
    logoUrl: string | null;
  };
  location: string;
  type: string;
  createdAt: string;
}

interface SavedJobsProps {
  jobs: Job[];
}

export default function SavedJobs({ jobs }: SavedJobsProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Талагдсан ажлын байр байхгүй байна.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {job.company.logoUrl ? (
                <img
                  src={job.company.logoUrl}
                  alt={job.company.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 text-xl font-bold">
                  {job.company.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <Link
                href={`/jobs/`}
                className="text-lg font-semibold text-[#0C213A] hover:text-blue-600 transition-colors"
              >
                {job.title}
              </Link>
              <p className="text-gray-600">{job.company.name}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>{job.location}</span>
                <span>•</span>
                <span>{job.type}</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(job.createdAt), {
                    addSuffix: true,
                    locale: mn,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
