"use client";

import type { StatCard } from "./types";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useNotification } from "@/providers/NotificationProvider";

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

const stats: StatCard[] = [
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/07d690b7a11fb6e9a72dafc120bf10db5aed2658?placeholderIfAbsent=true",
    value: "1,234",
    label: "Ажлын байр",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/881d9c0c8ae8302d4f91f76ca0f7f67975fbeb6e?placeholderIfAbsent=true",
    value: "567",
    label: "Байгууллага",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/6e1ae373b63cb8985cbb0338d0521a27bd9d3d7b?placeholderIfAbsent=true",
    value: "8,901",
    label: "Ажил хайж буй хүмүүс",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/0530adb336adca5f8501fed8e0b22af603d45a6d?placeholderIfAbsent=true",
    value: "234",
    label: "Шинэ ажлын байр",
  },
];

const StatCard = ({ icon, value, label, className }: StatCard & { className?: string }) => (
  <article className={`flex gap-[20px] items-center bg-white rounded-[10px] w-[320px] h-[90px] px-6 py-4 shadow-[4px_4px_8px_rgba(189,195,199,0.75)] ${className}`}>
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

export const HeroSection = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { addNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [showHeroNotif, setShowHeroNotif] = useState(false);
  const [lastCount, setLastCount] = useState(0);
  const notifTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownNotification = useRef(false);

  useEffect(() => {
    const checkNewApplications = async () => {
      try {
        console.log('Checking for new applications...');
        const response = await fetch("/api/employer/applications");
        if (!response.ok) {
          console.log('Failed to fetch applications');
          return;
        }
        
        const data = await response.json();
        console.log('Fetched applications:', data);
        
        const pendingApps = data.filter((app: Application) => app.status === "PENDING" && !app.viewedAt);
        console.log('Pending applications:', pendingApps);
        
        if (pendingApps.length > 0 && window.location.pathname === '/employer/dashboard') {
          console.log('Showing notification for', pendingApps.length, 'new applications');
          addNotification(`${pendingApps.length} шинэ анкет ирлээ!`, "info", "applications");
        } else {
          console.log('No new applications or not on dashboard');
        }
      } catch (error) {
        console.error('Error checking applications:', error);
      }
    };

    console.log('Setting up application checker...');
    checkNewApplications();
    const interval = setInterval(checkNewApplications, 4000);
    return () => clearInterval(interval);
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
      <div className="container relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-[80vh]">
          {/* Left side - Text content */}
          <div className="flex flex-col w-full lg:w-[45%] relative z-10 pt-25 md:pt-35 lg:pt-30">
            <div className="w-full font-semibold text-[#0C213A]">
              <h2 className="text-[43px] md:text-6xl lg:text-[58px] xl:text-[58px] 2xl:text-6xl leading-[45px] md:leading-[56px] lg:leading-[60px] 2xl:leading-[70px] 3xl:leading-[80px] font-poppins font-bold">
                <span className="block mb-4 md:mb-6">Your Dream Job</span>
                <span className="block mb-4 md:mb-6">is Waiting Browse</span>
                <span className="block">Our Open Roles!</span>
              </h2>
              <p className="text-sm md:text-base leading-6 pt-4 md:pt-6 font-poppins font-medium">
                Амжилттай карьерын эхлэлийг тавих шилдэг ажлыг хайж байна уу?
              </p>
              <p className="text-sm md:text-base font-poppins font-medium">Энд олон боломж бий !!!</p>
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
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-slate-400 hover:border-slate-900 focus:border-slate-900 font-medium text-gray-500 text-[16px] md:text-[16px] appearance-none"
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
                  <img src="/icons/sum.svg" alt="Dropdown" className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
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
};
