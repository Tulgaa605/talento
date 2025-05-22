"use client";

import { useState, useEffect } from "react";
import { JobCard } from "./JobCard";
import { JobListing } from "./types";

export default function JobListingSection() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs");
        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }
        const data = await response.json();
        console.log("API Response:", data);

        // Transform the API data to match JobListing type
        const transformedJobs: JobListing[] = data.map((job: any) => {
          console.log("Job type from API:", job.type);
          return {
            title: job.title,
            type: job.type === 'FULL_TIME' ? 'БҮТЭН ЦАГ' :
                  job.type === 'PART_TIME' ? 'ЦАГИЙН' :
                  job.type === 'CONTRACT' ? 'ГЭРЭЭТ' :
                  job.type === 'INTERNSHIP' ? 'ДАДЛАГА' : 'БҮТЭН ЦАГ',
            salary: job.salary || "Цалин: Хэлэлцээрээр",
            company: {
              name: job.company.name,
              logo: job.company.logoUrl || "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/23813725c8b2f39dd1d36d4e94e16d8ab78110aa?placeholderIfAbsent=true",
              location: job.location,
            },
          };
        });

        setJobs(transformedJobs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="pb-24 w-full">
        <div className="mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Ажлын байруудыг ачааллаж байна...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white">
        <div className="max-w-7xl text-center">
          <p className="text-red-600">Алдаа гарлаа: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <section className="pb-15 w-full px-4 md:px-10 lg:px-32 2xl:px-32">
      <div className="">
        <div className="text-center mb-10 md:mb-16 lg:mb-20">
          <h2 className="text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent mb-3 md:mb-4">
            Онцлох компаниуд
          </h2>
          <p className="text-base md:text-lg lg:text-xl 2xl:text-2xl text-gray-600 max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
            Монгол улсын тэргүүний компаниудын санал болгож буй ажлын байр
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-between gap-4 md:gap-5 lg:gap-6">
          {jobs
            .slice() // clone array
            .sort((a, b) => {
              // Extract numeric salary, treat non-numeric as 0
              const getSalary = (s: string) => {
                const num = parseInt(s.replace(/[^\d]/g, ""));
                return isNaN(num) ? 0 : num;
              };
              return getSalary(b.salary) - getSalary(a.salary);
            })
            .slice(0, 6)
            .map((job, index) => (
              <AnimatedJobCard key={index} job={job} index={index} />
            ))}
        </div>

        <div className="mt-10 md:mt-14 lg:mt-16 text-center">
          <button className="px-6 md:px-8 py-3 md:py-4 text-sm md:text-base lg:text-lg bg-gradient-to-r from-gray-800 to-gray-900 text-white font-medium rounded-lg shadow-lg hover:from-gray-900 hover:to-black transition-all duration-300 transform hover:scale-105">
            Бүх ажлын байрыг харах
          </button>
        </div>
      </div>
    </section>
  );
}

// Animated JobCard wrapper component
const AnimatedJobCard = ({
  job,
  index,
}: {
  job: JobListing;
  index: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100 + index * 100);

    return () => clearTimeout(timer);
  }, [index]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <JobCard {...job} />
    </div>
  );
};
