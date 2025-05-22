"use client";

import { useState } from "react";
import { JobListing } from "./types";

export const JobCard = ({ title, type, salary, company }: JobListing) => {
  const [isHovered, setIsHovered] = useState(false);

  // Get color scheme based on job type
  const getColorScheme = (jobType: string) => {
    const typeLower = jobType.toLowerCase();

    if (typeLower.includes("программист") || typeLower.includes("developer")) {
      return {
        gradient: "from-gray-800 to-gray-900",
        badge: "from-gray-800 to-gray-900",
        icon: "text-gray-800",
        button: "from-gray-800 to-gray-900",
        salary: "bg-gray-100 text-gray-900",
        logo: "from-gray-800 to-gray-900",
      };
    }
    if (typeLower.includes("дизайнер") || typeLower.includes("designer")) {
      return {
        gradient: "from-gray-700 to-gray-800",
        badge: "from-gray-700 to-gray-800",
        icon: "text-gray-700",
        button: "from-gray-700 to-gray-800",
        salary: "bg-gray-100 text-gray-800",
        logo: "from-gray-700 to-gray-800",
      };
    }
    if (typeLower.includes("менежер") || typeLower.includes("manager")) {
      return {
        gradient: "from-gray-600 to-gray-700",
        badge: "from-gray-600 to-gray-700",
        icon: "text-gray-600",
        button: "from-gray-600 to-gray-700",
        salary: "bg-gray-100 text-gray-700",
        logo: "from-gray-600 to-gray-700",
      };
    }
    if (typeLower.includes("инженер") || typeLower.includes("engineer")) {
      return {
        gradient: "from-gray-500 to-gray-600",
        badge: "from-gray-500 to-gray-600",
        icon: "text-gray-500",
        button: "from-gray-500 to-gray-600",
        salary: "bg-gray-100 text-gray-600",
        logo: "from-gray-500 to-gray-600",
      };
    }
    if (typeLower.includes("маркетинг") || typeLower.includes("marketing")) {
      return {
        gradient: "from-gray-400 to-gray-500",
        badge: "from-gray-400 to-gray-500",
        icon: "text-gray-400",
        button: "from-gray-400 to-gray-500",
        salary: "bg-gray-100 text-gray-500",
        logo: "from-gray-400 to-gray-500",
      };
    }
    // Default color scheme
    return {
      gradient: "from-gray-900 to-black",
      badge: "from-gray-900 to-black",
      icon: "text-gray-900",
      button: "from-gray-900 to-black",
      salary: "bg-gray-100 text-gray-900",
      logo: "from-gray-900 to-black",
    };
  };

  const colors = getColorScheme(title);

  return (
    <article
      className={`relative overflow-hidden bg-white rounded-xl shadow-md transition-all duration-300 ${
        isHovered ? "shadow-xl transform -translate-y-1" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <div className="flex flex-wrap gap-2 items-center mb-4">
            <span className="px-3 py-1 text-sm font-semibold text-[#0BA02C] bg-[#E7F6EA] rounded-full">
              {type}
            </span>
            <span className={`text-sm px-3 py-1 rounded-full ${colors.salary}`}>
              {salary}
            </span>
          </div>
        </div>

        <div className="flex items-center pt-4 border-t border-gray-100">
          <div className="relative mr-4">
            <img
              src={company.logo}
              className="w-12 h-12 object-contain rounded-lg"
              alt={company.name}
            />
          </div>

          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900">
              {company.name}
            </h4>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <svg
                className={`w-4 h-4 mr-1 ${colors.icon}`}
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
              {company.location}
            </div>
          </div>

          <button
            className={`ml-4 p-2 rounded-full transition-colors duration-300 ${
              isHovered
                ? `bg-gradient-to-r ${colors.button} text-white`
                : "text-gray-400 hover:text-gray-600"
            }`}
            aria-label="Bookmark job"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
};
