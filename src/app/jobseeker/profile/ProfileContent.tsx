"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import ProfileCVUpload from "@/components/ProfileCVUpload";
import CVList from "@/components/CVList";
import SavedJobs from "@/components/SavedJobs";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  profileImageUrl: string | null;
  phoneNumber: string | null;
  facebookUrl: string | null;
  cvs: Array<{
    id: string;
    fileName: string;
    createdAt: Date;
    status: string | null;
    fileUrl: string | null;
  }>;
  savedJobs: Array<{
    id: string;
    title: string;
    location: string;
    type: string;
    createdAt: string;
    company: {
      name: string;
      logoUrl: string | null;
    };
  }>;
}

interface ProfileContentProps {
  user: User;
}

export default function ProfileContent({ user }: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState("profile");

  // Convert Date objects to strings for CVList
  const formattedCVs = user.cvs.map((cv) => ({
    ...cv,
    createdAt: cv.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen mt-16 bg-white md:px-32 text-[#0C213A] font-poppins">
      {/* Cover Image/Header */}
      <div className="relative w-full h-48 md:h-64 group">
        <img
          src="/images/default-cover.jpg"
          alt="Profile cover"
          className="w-full h-full object-cover object-center transition-all duration-300"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-4">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Зураг сонгох
            </div>
          </div>
        </div>
        <div className="absolute left-0 bottom-0 flex items-end gap-8 px-8 pb-8 w-full bg-gradient-to-t from-black/60 to-transparent">
          <div className="w-20 h-20 bg-white rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
            {user.profileImageUrl ? (
              <Image
                src={user.profileImageUrl}
                alt="Profile Picture"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserCircleIcon className="h-16 w-16 text-gray-400" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <div className="text-base text-white/80">CV: {user.cvs.length}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex justify-start gap-0">
          <button
            className={`px-6 py-3 text-base font-medium rounded-none border-b-2 transition-all duration-200 cursor-pointer ${
              activeTab === "profile"
                ? "border-[#0C213A] text-[#0C213A]"
                : "border-transparent text-[#0C213A]/60 hover:text-[#0C213A] hover:bg-[#0C213A]/5"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            Хувийн мэдээлэл
          </button>
          <button
            className={`px-6 py-3 text-base font-medium rounded-none border-b-2 transition-all duration-200 cursor-pointer ${
              activeTab === "cvs"
                ? "border-[#0C213A] text-[#0C213A]"
                : "border-transparent text-[#0C213A]/60 hover:text-[#0C213A] hover:bg-[#0C213A]/5"
            }`}
            onClick={() => setActiveTab("cvs")}
          >
            CV жагсаалт
          </button>
          <button
            className={`px-6 py-3 text-base font-medium rounded-none border-b-2 transition-all duration-200 cursor-pointer ${
              activeTab === "saved"
                ? "border-[#0C213A] text-[#0C213A]"
                : "border-transparent text-[#0C213A]/60 hover:text-[#0C213A] hover:bg-[#0C213A]/5"
            }`}
            onClick={() => setActiveTab("saved")}
          >
            Талагдсан
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="py-8">
        {activeTab === "profile" && (
          <div className="w-full bg-white rounded-none shadow-none p-0 mb-8 border-0">
            <div className="w-full px-0 md:px-16 py-12">
              <h2 className="text-2xl font-bold mb-4 text-[#0C213A]">
                Хувийн мэдээлэл
              </h2>
              <div className="mb-4">
                <span className="block text-gray-500 font-semibold mb-1">
                  Нэр:
                </span>
                <span className="text-lg text-[#0C213A]">{user.name}</span>
              </div>
              <div className="mb-4">
                <span className="block text-gray-500 font-semibold mb-1">
                  И-мэйл:
                </span>
                <span className="text-lg text-[#0C213A]">{user.email}</span>
              </div>
              <div className="mb-4">
                <span className="block text-gray-500 font-semibold mb-1">
                  Утас:
                </span>
                <span className="text-lg text-[#0C213A]">
                  {user.phoneNumber || "Тодорхойгүй"}
                </span>
              </div>
              {user.facebookUrl && (
                <div className="mb-4">
                  <span className="block text-gray-500 font-semibold mb-1">
                    Facebook:
                  </span>
                  <a
                    href={user.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {user.facebookUrl}
                  </a>
                </div>
              )}
              <div className="mt-6">
                <Link
                  href="/jobseeker/profile/edit"
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-6 py-2 rounded-lg shadow transition"
                >
                  Засах
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === "cvs" && (
          <div className="w-full px-0 md:px-16 py-12">
            <h2 className="text-2xl font-bold mb-4 text-[#0C213A]">
              CV жагсаалт
            </h2>
            <CVList cvs={formattedCVs} />
            <div className="mt-6">
              <ProfileCVUpload />
            </div>
          </div>
        )}

        {activeTab === "saved" && (
          <div className="w-full px-0 md:px-16 py-12">
            <h2 className="text-2xl font-bold mb-4 text-[#0C213A]">
              Талагдсан ажлын байр
            </h2>
            <SavedJobs jobs={user.savedJobs} />
          </div>
        )}
      </main>
    </div>
  );
}
