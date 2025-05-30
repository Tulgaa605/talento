"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { mn } from "date-fns/locale";
import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import JobDetails from "./JobDetails";

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
  type: string;
  createdAt: string;
  contactPhone?: string;
  skills?: string;
  isSaved?: boolean;
}

const MONGOLIA_PROVINCES = [
  "Улаанбаатар",
  "Архангай аймаг",
  "Баян-Өлгий аймаг",
  "Баянхонгор аймаг",
  "Булган аймаг",
  "Говь-Алтай аймаг",
  "Говьсүмбэр аймаг",
  "Дархан-Уул аймаг",
  "Дорноговь аймаг",
  "Дорнод аймаг",
  "Дундговь аймаг",
  "Завхан аймаг",
  "Орхон аймаг",
  "Өвөрхангай аймаг",
  "Өмнөговь аймаг",
  "Сүхбаатар аймаг",
  "Сэлэнгэ аймаг",
  "Төв аймаг",
  "Увс аймаг",
  "Ховд аймаг",
  "Хөвсгөл аймаг",
  "Хэнтий аймаг",
];

const FILTERS = [
  { label: "Бүтэн цаг", icon: "⏰", type: "FULL_TIME" },
  { label: "Хагас цаг", icon: "⏰", type: "PART_TIME" },
  { label: "Гэрээт", icon: "📝", type: "CONTRACT" },
  { label: "Дадлага", icon: "🎓", type: "INTERNSHIP" },
];
interface JobsListProps {
  onJobSelect: (job: Job) => void;
}

export default function JobsList({ onJobSelect }: JobsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedProvince, setSelectedProvince] = useState(
    searchParams.get("city") || ""
  );
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [savingJobId, setSavingJobId] = useState<string | null>(null);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Fetch jobs and saved jobs on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchJobs();
      if (session?.user) {
        await fetchSavedJobs();
      }
    };
    fetchInitialData();
  }, []);

  // Fetch saved jobs when session changes
  useEffect(() => {
    if (session?.user) {
      fetchSavedJobs();
    } else {
      setSavedJobs(new Set());
    }
  }, [session]);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch jobs");
      }

      setJobs(data);

      // If there's a selected job in the URL, find and select it
      const selectedJobId = searchParams.get("selectedJob");
      if (selectedJobId) {
        const job = data.find((j: Job) => j.id === selectedJobId);
        if (job) {
          setSelectedJobId(job.id);
          setSelectedJob(job);
          onJobSelect(job);
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const response = await fetch("/api/jobs/saved", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch saved jobs");
      }
      const data = await response.json();
      setSavedJobs(new Set(data.map((job: { jobId: string }) => job.jobId)));
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      setSavedJobs(new Set());
    }
  };

  const handleSave = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavingJobId(jobId);

    try {
      const response = await fetch("/api/jobs/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          alert("Та нэвтрээгүй байна. Хадгалахын тулд нэвтрэх хэрэгтэй.");
          return;
        }
        throw new Error(data.error || "Алдаа гарлаа");
      }

      const data = await response.json();
      setSavedJobs((prev) => {
        const newSet = new Set(prev);
        if (data.saved) {
          newSet.add(jobId);
        } else {
          newSet.delete(jobId);
        }
        return newSet;
      });
    } catch (error) {
      console.error("Error saving job:", error);
      alert(error instanceof Error ? error.message : "Алдаа гарлаа");
    } finally {
      setSavingJobId(null);
    }
  };

  const toggleFilter = (type: string) => {
    setActiveFilters((prev) =>
      prev.includes(type) ? prev.filter((f) => f !== type) : [...prev, type]
    );
  };

  const handleJobClick = (job: Job) => {
    setSelectedJobId(job.id);
    setSelectedJob(job);
    onJobSelect(job);

    // Mobile дээр modal харуулах
    if (window.innerWidth < 1024) {
      // lg breakpoint
      setShowMobileDetails(true);
    }
  };

  const filteredJobs = jobs
    .filter((job) => {
      // Apply job type filters
      if (activeFilters.length > 0) {
        return activeFilters.includes(job.type);
      }
      return true;
    })
    .map((job) => {
      // Calculate match percentage
      let matchScore = {
        title: 0,
        skills: 0,
        requirements: 0,
        experience: 0,
        education: 0,
        overall: 0,
      };

      const searchTerms = searchTerm
        .toLowerCase()
        .split(" ")
        .filter((term) => term.length > 0);
      const jobTitle = job.title.toLowerCase();
      const jobDescription = job.description.toLowerCase();
      const jobRequirements = job.requirements.toLowerCase();

      // Match criteria weights
      const weights = {
        title: 0.3, // 30%
        skills: 0.25, // 25%
        requirements: 0.25, // 25%
        experience: 0.1, // 10%
        education: 0.1, // 10%
      };

      // Title matching (30%)
      searchTerms.forEach((term) => {
        // Exact title match
        if (jobTitle === term) {
          matchScore.title += 100;
        }
        // Title starts with search term
        else if (jobTitle.startsWith(term)) {
          matchScore.title += 80;
        }
        // Title contains search term as a whole word
        else if (jobTitle.split(" ").some((word) => word === term)) {
          matchScore.title += 60;
        }
        // Partial match in title
        else if (jobTitle.includes(term)) {
          matchScore.title += 40;
        }
      });
      matchScore.title = Math.min(matchScore.title, 100);

      // Skills matching (25%)
      if (job.skills) {
        const jobSkills = job.skills
          .toLowerCase()
          .split(",")
          .map((s) => s.trim());
        const matchedSkills = new Set();

        searchTerms.forEach((term) => {
          jobSkills.forEach((skill) => {
            if (skill === term) {
              matchedSkills.add(skill);
              matchScore.skills += 20;
            } else if (skill.includes(term)) {
              matchedSkills.add(skill);
              matchScore.skills += 10;
            }
          });
        });

        // Calculate skills match percentage
        matchScore.skills = Math.min(matchScore.skills, 100);
      }

      // Requirements matching (25%)
      const requirements = jobRequirements.split(/[.,]/).map((r) => r.trim());
      const matchedRequirements = new Set();

      searchTerms.forEach((term) => {
        requirements.forEach((req) => {
          if (req.toLowerCase().includes(term)) {
            matchedRequirements.add(req);
            matchScore.requirements += 10;
          }
        });
      });

      matchScore.requirements = Math.min(matchScore.requirements, 100);

      // Experience matching (10%)
      if (
        jobRequirements.toLowerCase().includes("туршлага") ||
        jobRequirements.toLowerCase().includes("experience")
      ) {
        matchScore.experience = 50; // Default score if experience is mentioned
      } else {
        matchScore.experience = 100; // No experience required
      }

      // Education matching (10%)
      if (
        jobRequirements.toLowerCase().includes("боловсрол") ||
        jobRequirements.toLowerCase().includes("education")
      ) {
        matchScore.education = 50; // Default score if education is mentioned
      } else {
        matchScore.education = 100; // No education required
      }

      // Calculate overall match percentage
      matchScore.overall = Math.round(
        matchScore.title * weights.title +
          matchScore.skills * weights.skills +
          matchScore.requirements * weights.requirements +
          matchScore.experience * weights.experience +
          matchScore.education * weights.education
      );

      return {
        ...job,
        matchScore,
        relevanceScore: matchScore.overall, // Use match percentage as relevance score
      };
    })
    .filter((job) => {
      const searchTerms = searchTerm
        .toLowerCase()
        .split(" ")
        .filter((term) => term.length > 0);
      const matchesSearch =
        searchTerms.length === 0 || job.matchScore.overall > 0;
      const matchesProvince =
        !selectedProvince || job.location.includes(selectedProvince);
      const matchesType =
        activeFilters.length === 0 || job.matchScore.overall > 0;

      return matchesSearch && matchesProvince && matchesType;
    })
    .sort((a, b) => b.matchScore.overall - a.matchScore.overall);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Filter buttons */}
      <div className="flex gap-6 mb-4 overflow-x-auto pb-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.type}
            onClick={() => toggleFilter(filter.type)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
              activeFilters.includes(filter.type)
                ? "bg-[#0BA02C] text-white shadow-sm hover:bg-[#0a8c26]"
                : "bg-white text-gray-700 border border-gray-200 hover:border-[#0BA02C] hover:text-[#0BA02C]"
            }`}
          >
            <span className="text-sm">{filter.icon}</span>
            <span>{filter.label}</span>
          </button>
        ))}
      </div>
      {/* Search and select in a row */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          placeholder="Мэргэжил хайх..."
          className="flex-[2] px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 hover:border-slate-900 focus:border-slate-900 font-medium text-gray-900 text-[16px] sm:text-[16px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="relative w-full sm:w-60">
          <select
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-slate-400 hover:border-slate-900 focus:border-slate-900 font-medium text-gray-500 text-[16px] sm:text-[16px] appearance-none"
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
          >
            <option value="">Хот сонгох</option>
            {MONGOLIA_PROVINCES.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
          {/* Custom dropdown icon */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <img
              src="/icons/sum.svg"
              alt="Dropdown"
              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
            />
          </div>
        </div>
        <button className="hidden sm:flex bg-gray-900 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-gray-800 transition-colors items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 sm:w-5 sm:h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
            />
          </svg>
        </button>
      </div>
      {/* Job cards vertical list */}
      <div className="h-[calc(100vh-16rem)] sm:h-[calc(100vh-18rem)] overflow-y-auto pr-2 sm:pr-4 scrollbar-hide">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm sm:text-base text-gray-600">
              Ажлын байр олдсонгүй.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:gap-4">
            {filteredJobs.map((job) => {
              const isSelected = selectedJobId === job.id;
              const isSaved = savedJobs.has(job.id);
              return (
                <div
                  key={job.id}
                  className={`relative overflow-hidden bg-white rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer`}
                  onClick={() => handleJobClick(job)}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col">
                      <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-2">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 items-center mb-4">
                        <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold text-[#0BA02C] bg-[#E7F6EA] rounded-full">
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
                        <span className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full bg-gray-100 text-gray-900">
                          {job.salary || "Тохиролцоно"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center pt-4 border-t border-gray-100">
                      <div className="relative mr-3 sm:mr-4">
                        <img
                          src={
                            job.company.logoUrl ||
                            "/images/default-company-logo.svg"
                          }
                          alt={job.company.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg"
                        />
                      </div>

                      <div className="flex-1">
                        <h4 className="text-sm sm:text-lg font-semibold text-gray-900">
                          {job.company.name}
                        </h4>
                        <div className="flex items-center mt-1 text-xs sm:text-sm text-gray-500">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-800"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {job.location}
                        </div>
                      </div>

                      <button
                        className={`ml-3 sm:ml-4 p-1.5 sm:p-2 rounded-full transition-colors duration-300 ${
                          isSaved
                            ? "bg-[#0BA02C] text-white"
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                        aria-label="Bookmark job"
                        onClick={(e) => handleSave(job.id, e)}
                        disabled={savingJobId === job.id}
                      >
                        {savingJobId === job.id ? (
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        ) : isSaved ? (
                          <BookmarkSolid className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <BookmarkOutline className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile Job Details Modal */}
      {showMobileDetails && selectedJob && (
        <div className="fixed inset-0 bg-white z-50 lg:hidden">
          <div className="h-full overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
              <button
                onClick={() => setShowMobileDetails(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="#0C213A"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
              </button>
              <h2 className="text-lg font-semibold text-[#0C213A]">
                Ажлын дэлгэрэнгүй
              </h2>
              <div className="w-10"></div>
            </div>
            <div className="p-4">
              <JobDetails job={selectedJob} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
