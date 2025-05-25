"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import ProfileCVUpload from "@/components/ProfileCVUpload";
import CVList from "@/components/CVList";
import SavedJobs from "@/components/SavedJobs";
import { FiEdit, FiSave, FiX } from "react-icons/fi";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user.name || "",
    phoneNumber: user.phoneNumber || "",
    facebookUrl: user.facebookUrl || "",
  });

  const handleSave = async () => {
    try {
      const response = await fetch("/api/jobseeker/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedUser),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      alert("Профайл амжилттай шинэчлэгдлээ");
      setIsEditing(false);
      // Refresh the page or update the user data
      window.location.reload();
    } catch (error) {
      alert("Профайл шинэчлэхэд алдаа гарлаа");
    }
  };

  // Convert Date objects to strings for CVList
  const formattedCVs = user.cvs.map((cv) => ({
    ...cv,
    createdAt: cv.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen mt-16 bg-white px-0 sm:px-6 md:px-8 lg:px-32 text-[#0C213A] font-poppins">
      {/* Cover Image/Header */}
      <div className="relative w-full h-32 sm:h-40 md:h-48 lg:h-64">
        <img
          src="/images/cover.jpeg"
          alt="Profile cover"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute left-0 bottom-0 flex items-center gap-3 md:gap-6 lg:gap-8 2xl:gap-5 px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 w-full bg-gradient-to-t from-black/60 to-transparent">
          <div className="relative group">
            <div className="w-10 h-10 md:w-20 md:h-20 lg:w-20 lg:h-20 2xl:w-20 2xl:h-20 bg-white rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
              {user.profileImageUrl ? (
                <Image
                  src={user.profileImageUrl}
                  alt="Profile Picture"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircleIcon className="w-10 h-10 md:w-20 md:h-20 lg:w-20 lg:h-20 2xl:w-15 2xl:h-15 text-gray-400" />
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
              <ProfileImageUpload
                userId={user.id}
                currentImageUrl={user.profileImageUrl}
              />
            </div>
          </div>
          <div>
            <h1 className="text-sm md:text-2xl lg:text-2xl 2xl:text-2xl font-bold text-white">
              {user.name}
            </h1>
            <div className="text-xs sm:text-base text-white/80">
              CV: {user.cvs.length}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex justify-start gap-0 overflow-x-auto">
          <button
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-none border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === "profile"
                ? "border-[#0C213A] text-[#0C213A]"
                : "border-transparent text-[#0C213A]/60 hover:text-[#0C213A] hover:bg-[#0C213A]/5"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            Хувийн мэдээлэл
          </button>
          <button
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-none border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === "cvs"
                ? "border-[#0C213A] text-[#0C213A]"
                : "border-transparent text-[#0C213A]/60 hover:text-[#0C213A] hover:bg-[#0C213A]/5"
            }`}
            onClick={() => setActiveTab("cvs")}
          >
            CV жагсаалт
          </button>
          <button
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-none border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === "saved"
                ? "border-[#0C213A] text-[#0C213A]"
                : "border-transparent text-[#0C213A]/60 hover:text-[#0C213A] hover:bg-[#0C213A]/5"
            }`}
            onClick={() => setActiveTab("saved")}
          >
            Таалагдсан
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="py-4 sm:py-6 md:py-8">
        {activeTab === "profile" && (
          <div className="w-full bg-white rounded-none shadow-none p-0 mb-8 border-0">
            <div className="w-full px-4 sm:px-6 md:px-8 lg:px-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#0C213A]">
                  Хувийн мэдээлэл
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:w-auto bg-[#0C213A] text-white font-medium px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 inline-flex items-center justify-center gap-2"
                  >
                    <FiEdit className="w-4 h-4" />
                    Засах
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleSave}
                      className="w-full sm:w-auto bg-green-50 hover:bg-green-100 text-green-700 font-medium px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 inline-flex items-center justify-center gap-2"
                    >
                      <FiSave className="w-4 h-4" />
                      Хадгалах
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedUser({
                          name: user.name || "",
                          phoneNumber: user.phoneNumber || "",
                          facebookUrl: user.facebookUrl || "",
                        });
                      }}
                      className="w-full sm:w-auto bg-red-50 hover:bg-red-100 text-red-700 font-medium px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 inline-flex items-center justify-center gap-2"
                    >
                      <FiX className="w-4 h-4" />
                      Цуцлах
                    </button>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  <div className="mb-4 sm:mb-6">
                    <span className="block text-sm text-gray-500 font-medium mb-2">
                      Нэр
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.name}
                        onChange={(e) =>
                          setEditedUser({ ...editedUser, name: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base sm:text-lg text-[#0C213A] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <span className="text-base sm:text-lg text-[#0C213A] font-medium">
                        {user.name}
                      </span>
                    )}
                  </div>
                  <div className="mb-4 sm:mb-6">
                    <span className="block text-sm text-gray-500 font-medium mb-2">
                      И-мэйл
                    </span>
                    <span className="text-base sm:text-lg text-[#0C213A] font-medium">
                      {user.email}
                    </span>
                  </div>
                  <div className="mb-4 sm:mb-6">
                    <span className="block text-sm text-gray-500 font-medium mb-2">
                      Утас
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.phoneNumber}
                        onChange={(e) =>
                          setEditedUser({
                            ...editedUser,
                            phoneNumber: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base sm:text-lg text-[#0C213A] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <span className="text-base sm:text-lg text-[#0C213A] font-medium">
                        {user.phoneNumber || "Тодорхойгүй"}
                      </span>
                    )}
                  </div>
                  <div className="mb-4 sm:mb-6">
                    <span className="block text-sm text-gray-500 font-medium mb-2">
                      Facebook
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.facebookUrl}
                        onChange={(e) =>
                          setEditedUser({
                            ...editedUser,
                            facebookUrl: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base sm:text-lg text-[#0C213A] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <a
                        href={user.facebookUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 hover:underline text-base sm:text-lg"
                      >
                        {user.facebookUrl || "Тодорхойгүй"}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "cvs" && (
          <div className="w-full px-4 sm:px-6 md:px-8 lg:px-0">
            <CVList cvs={formattedCVs} />
            <div className="mt-4 sm:mt-6">
              <ProfileCVUpload />
            </div>
          </div>
        )}

        {activeTab === "saved" && (
          <div className="w-full px-4 sm:px-6 md:px-8 lg:px-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 text-[#0C213A]">
              Таалагдсан ажлын байр
            </h2>
            <SavedJobs jobs={user.savedJobs} />
          </div>
        )}
      </main>
    </div>
  );
}
