"use client";

import type { StatCard } from "./types";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useNotification } from "@/providers/NotificationProvider";
import { TiArrowSortedUp } from "react-icons/ti";

const MONGOLIA_PROVINCES = [
  "Архангай",
  "Баян-Өлгий",
  "Баянхонгор",
  "Булган",
  "Говь-Алтай",
  "Говьсүмбэр",
  "Дархан-Уул",
  "Дорноговь",
  "Дорнод",
  "Дундговь",
  "Завхан",
  "Өвөрхангай",
  "Өмнөговь",
  "Сүхбаатар",
  "Сэлэнгэ",
  "Төв",
  "Увс",
  "Ховд",
  "Хөвсгөл",
  "Хэнтий",
  "Улаанбаатар",
];

const StatCard = ({
  icon,
  value,
  label,
  className,
}: StatCard & { className?: string }) => (
  <article
    className={`flex gap-[20px] items-center bg-white rounded-[10px] w-[320px] h-[90px] px-6 py-4 shadow-[2px_2px_6px_rgba(189,195,199,0.5)] md:shadow-[2px_2px_4px_rgba(189,195,199,0.3)] ${className}`}
  >
    <div className="flex items-center justify-center p-3 rounded bg-[#0C213A]">
      <img src={icon} className="w-8 h-8 object-contain" alt="" />
    </div>
    <div className="flex flex-col gap-[10px]">
      <p className="text-xl font-semibold leading-6 text-[#0C213A] font-poppins">
        {value}
      </p>
      <p className="text-sm font-medium leading-4 text-[#0C213A]/60 font-poppins">
        {label}
      </p>
    </div>
  </article>
);

interface Application {
  id: string;
  status: string;
  viewedAt: string | null;
}

export default function HeroSection() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { addNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [showHeroNotif, setShowHeroNotif] = useState(false);
  const [lastCount, setLastCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const notifTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownNotification = useRef(false);
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkNewApplications = async () => {
      try {
        console.log("Checking for new applications...");
        const response = await fetch("/api/employer/applications");
        if (response.ok) {
          const data = await response.json();
          // Only count PENDING and unviewed applications
          const newPending = data.filter(
            (app: any) => app.status === "PENDING" && !app.viewedAt
          );
          if (newPending.length > 0 && newPending.length > lastCount) {
            // Only show notification if we're on the employer dashboard
            if (window.location.pathname === "/employer/dashboard") {
              addNotification("Шинэ анкет ирлээ!", "info", "applications");
            }
          }
          setLastCount(newPending.length);
        }
      } catch (error) {
        console.error("Error checking applications:", error);
      }
    };

    console.log("Setting up application checker...");
    checkNewApplications();
    const interval = setInterval(checkNewApplications, 4000);
    return () => clearInterval(interval);
  }, [addNotification]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }
        const data = await response.json();

        setStats([
          {
            icon: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/07d690b7a11fb6e9a72dafc120bf10db5aed2658?placeholderIfAbsent=true",
            value: data.totalJobs.toString(),
            label: "Ажлын байр",
          },
          {
            icon: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/881d9c0c8ae8302d4f91f76ca0f7f67975fbeb6e?placeholderIfAbsent=true",
            value: data.totalCompanies.toString(),
            label: "Байгууллага",
          },
          {
            icon: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/6e1ae373b63cb8985cbb0338d0521a27bd9d3d7b?placeholderIfAbsent=true",
            value: data.totalJobSeekers.toString(),
            label: "Ажил хайж буй хүмүүс",
          },
          {
            icon: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/0530adb336adca5f8501fed8e0b22af603d45a6d?placeholderIfAbsent=true",
            value: data.newJobs.toString(),
            label: "Шинэ ажлын байр",
          },
        ]);
      } catch (error) {
        console.error("Error fetching stats:", error);
        addNotification("Статистик мэдээлэл ачаалахад алдаа гарлаа", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [addNotification]);

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    if (searchTerm) {
      queryParams.set("search", searchTerm);
    }
    if (selectedCity) {
      queryParams.set("city", selectedCity);
    }
    router.push(`/jobs?${queryParams.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Show notification зөвхөн employer нэвтэрсэн үед
  const isEmployer =
    status === "authenticated" && session?.user?.role === "EMPLOYER";

  return (
    <section className="px-4 lg:px-32 md:px-10">
      {isEmployer && showHeroNotif && (
        <div className="fixed top-8 right-8 z-50 flex justify-end items-start">
          <div className="bg-blue-500 text-white px-5 py-3 rounded-xl shadow-lg font-semibold text-base flex items-center gap-3 animate-fade-in-out relative min-w-[200px]">
            <span>Шинэ анкет ирлээ!</span>
            <button
              onClick={() => setShowHeroNotif(false)}
              className="ml-2 text-white/80 hover:text-white text-lg font-bold absolute top-2 right-2"
              aria-label="Хаах"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Content container */}
      <div className="container relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-[80vh]">
          {/* Left side - Text content */}
          <div className="flex flex-col w-full lg:w-[45%] relative z-10 pt-25 md:pt-35 lg:pt-30">
            <div className="w-full font-semibold text-[#0C213A]">
              <h2 className="text-[43px] md:text-6xl lg:text-[58px] xl:text-[58px] 2xl:text-6xl leading-[45px] md:leading-[56px] lg:leading-[60px] 2xl:leading-[60px] 3xl:leading-[80px] font-poppins font-bold">
                <span className="block mb-4 md:mb-6">Your Dream Job</span>
                <span className="block mb-4 md:mb-6">is Waiting Browse</span>
                <span className="block">Our Open Roles!</span>
              </h2>
              <p className="text-sm md:text-base leading-6 pt-4 md:pt-6 font-poppins font-medium">
                Амжилттай карьерын эхлэлийг тавих шилдэг ажлыг хайж байна уу?
              </p>
              <p className="text-sm md:text-base font-poppins font-medium">
                Энд олон боломж бий !!!
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-2 mb-6 pt-6 md:pt-15">
              <input
                type="text"
                placeholder="Мэргэжил хайх..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full md:flex-[2] px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 hover:border-slate-900 focus:border-slate-900 font-medium text-gray-900 text-[16px] md:text-[16px]"
              />
              <div className="relative w-full md:w-48 lg:w-60">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  onFocus={() => setIsDropdownOpen(true)}
                  onBlur={() => setIsDropdownOpen(false)}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:border-slate-400 font-medium text-gray-500 text-[16px] md:text-[16px] appearance-none"
                >
                  <option value="">Бүх хот</option>
                  {MONGOLIA_PROVINCES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {/* Custom dropdown icon */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 md:pr-3">
                  <TiArrowSortedUp
                    className={`w-4 h-4 md:w-5 md:h-5 text-[#0C213A] transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="bg-[#0C213A] text-white px-3 md:px-4 py-2.5 md:py-2 rounded-md hover:bg-[#0C213A]/90 transition-colors flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 md:w-5 md:h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                  />
                </svg>
              </button>
            </div>
          </div>
          {/* Right side - Hero icon */}
          <div className="flex items-center justify-center lg:justify-end w-full lg:w-[45%] relative z-10 pt-6 lg:pt-30">
            <img
              src="/icons/hero.svg"
              alt="Hero"
              className="w-full h-full md:w-full md:h-full lg:w-[600px] lg:h-[560px] 2xl:w-[500px] 2xl:h-[470px] object-cover"
            />
          </div>
        </div>
      </div>

      {/* Доорх статистикууд */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-10 items-center justify-between pt-6 md:pt-8 lg:pt-10">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            {...stat}
            className="w-full lg:w-[320px] font-poppins"
          />
        ))}
      </div>
    </section>
  );
}
