"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/24/solid";
import { FiEdit, FiMapPin } from "react-icons/fi";

interface Company {
  id: string;
  name: string;
  description: string;
  location: string;
  website: string;
  logoUrl?: string;
  coverImageUrl?: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  type: string;
  status: string;
  createdAt: string;
  requirements?: string;
}

export default function EmployerProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCompany, setEditedCompany] = useState<Company | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("jobs");
  const [applications, setApplications] = useState<any[]>([]);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutEdit, setAboutEdit] = useState({
    name: company?.name || "",
    location: company?.location || "",
    website: company?.website || "",
    description: company?.description || "",
  });
  const [newApplicationsCount, setNewApplicationsCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && !hasLoaded) {
      if (session?.user?.role === "EMPLOYER") {
        fetchCompanyAndJobs();
        setHasLoaded(true);
      } else {
        router.push("/login");
      }
    }
  }, [status, session, hasLoaded]);

  useEffect(() => {
    if (company) {
      setEditedCompany(company);
    }
  }, [company]);

  useEffect(() => {
    if (activeTab === "anketuud") {
      const fetchApplications = async () => {
        try {
          const res = await fetch("/api/employer/applications");
          const text = await res.text();
          if (!text) {
            setApplications([]);
          } else {
            const data = JSON.parse(text);
            setApplications(data);
          }
        } catch (e) {
          setApplications([]);
        }
      };
      fetchApplications();
    }
  }, [activeTab]);

  useEffect(() => {
    setAboutEdit({
      name: company?.name || "",
      location: company?.location || "",
      website: company?.website || "",
      description: company?.description || "",
    });
  }, [company]);

  useEffect(() => {
    // Fetch new applications count
    const fetchNewCount = async () => {
      try {
        const res = await fetch("/api/employer/applications/new-count");
        if (res.ok) {
          const text = await res.text();
          if (!text) {
            setNewApplicationsCount(0);
          } else {
            const data = JSON.parse(text);
            setNewApplicationsCount(data.count || 0);
          }
        }
      } catch (e) {
        setNewApplicationsCount(0);
      }
    };
    fetchNewCount();
  }, []);

  const fetchCompanyAndJobs = async () => {
    try {
      const companyRes = await fetch("/api/employer/company");
      const text = await companyRes.text();
      if (!text) {
        throw new Error("Хоосон хариу ирлээ");
      }
      const companyData = JSON.parse(text);
      setCompany(companyData);
      const jobsRes = await fetch("/api/employer/jobs");
      const textJobs = await jobsRes.text();
      if (!textJobs) {
        setJobs([]);
      } else {
        const jobsData = JSON.parse(textJobs);
        setJobs(jobsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      let logoUrl = company?.logoUrl;

      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);
        const uploadRes = await fetch("/api/upload/company-logo", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload logo");
        }

        const text = await uploadRes.text();
        if (!text) {
          throw new Error("Хоосон хариу ирлээ");
        }
        const uploadData = JSON.parse(text);
        logoUrl = uploadData.url;
      }

      const response = await fetch("/api/employer/company/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editedCompany?.name,
          location: editedCompany?.location,
          logoUrl: logoUrl,
          description: editedCompany?.description,
          website: editedCompany?.website,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update company profile");
      }

      const textUpdatedCompany = await response.text();
      if (!textUpdatedCompany) {
        throw new Error("Хоосон хариу ирлээ");
      }
      const updatedCompany = JSON.parse(textUpdatedCompany);
      setCompany(updatedCompany);
      setIsEditing(false);
      setLogoFile(null);
      setLogoPreview(null);

      // Show success message
      alert("Профайл амжилттай шинэчлэгдлээ");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Профайл шинэчлэхэд алдаа гарлаа. Дараа дахин оролдоно уу.");
    }
  };

  const handleEdit = (jobId: string) => {
    router.push(`/employer/jobs/edit/${jobId}`);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm("Энэ ажлын байрыг устгахдаа итгэлтэй байна уу?")) {
      try {
        const response = await fetch(`/api/employer/jobs/${jobId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setJobs(jobs.filter((job) => job.id !== jobId));
          alert("Ажлын байр амжилттай устгагдлаа");
        } else {
          alert("Ажлын байрыг устгахад алдаа гарлаа");
        }
      } catch (error) {
        console.error("Error deleting job:", error);
        alert("Ажлын байрыг устгахад алдаа гарлаа");
      }
    }
  };

  // Helper functions for status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Хүлээгдэж буй";
      case "ACCEPTED":
        return "Зөвшөөрөгдсөн";
      case "REJECTED":
        return "Татгалзсан";
      default:
        return status;
    }
  };

  const handleStatusChange = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(
        `/api/employer/applications/${applicationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Статус шинэчлэхэд алдаа гарлаа");
      }
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAboutSave = async () => {
    try {
      const response = await fetch("/api/employer/company/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aboutEdit),
      });
      if (!response.ok) throw new Error("Failed to update company info");
      const textUpdated = await response.text();
      if (!textUpdated) {
        throw new Error("Хоосон хариу ирлээ");
      }
      const updated = JSON.parse(textUpdated);
      setCompany(updated);
      setIsEditingAbout(false);
    } catch (e) {
      alert("Шинэчлэхэд алдаа гарлаа");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Ачаалж байна...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-16 bg-white px-0 sm:px-6 md:px-8 lg:px-32 text-[#0C213A] font-poppins">
      {/* Cover Image/Header */}
      <div className="relative w-full h-32 sm:h-40 md:h-48 lg:h-64">
        <img
          src="/images/cover.jpeg"
          alt="Company cover"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute left-0 bottom-0 flex items-end gap-4 sm:gap-6 md:gap-8 px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 w-full bg-gradient-to-t from-black/60 to-transparent">
          <div className="relative group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
              <img
                src={company?.logoUrl || "/images/default-company-logo.svg"}
                alt="logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <img
                src="/icons/image.svg"
                alt="upload"
                className="w-6 h-6 sm:w-8 sm:h-8"
              />
            </div>
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editedCompany?.name || ""}
                  onChange={(e) => {
                    if (editedCompany) {
                      setEditedCompany({
                        ...editedCompany,
                        name: e.target.value,
                      });
                    }
                  }}
                  className="w-full bg-white/10 backdrop-blur-sm text-white text-lg md:text-2xl font-bold px-2 sm:px-3 py-1 rounded border border-white/20 focus:outline-none focus:border-white/40"
                  placeholder="Компанийн нэр"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    value={editedCompany?.location || ""}
                    onChange={(e) => {
                      if (editedCompany) {
                        setEditedCompany({
                          ...editedCompany,
                          location: e.target.value,
                        });
                      }
                    }}
                    className="bg-white/10 backdrop-blur-sm text-white/80 text-sm sm:text-base px-2 sm:px-3 py-1 rounded border border-white/20 focus:outline-none focus:border-white/40"
                    placeholder="Байршил"
                  />
                  <button
                    onClick={handleSaveProfile}
                    className="bg-white text-[#0C213A] px-3 sm:px-4 py-1 rounded hover:bg-white/90 transition-colors text-sm sm:text-base"
                  >
                    Хадгалах
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedCompany(company);
                    }}
                    className="bg-red-500 text-white px-3 sm:px-4 py-1 rounded hover:bg-red-600 transition-colors text-sm sm:text-base"
                  >
                    Цуцлах
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  {company?.name}
                </h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="text-sm sm:text-base text-white/80">
                    Ажлын байр: {jobs.length}
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-white/80 hover:text-white transition-colors flex items-center gap-1 text-sm sm:text-base"
                  >
                    <FiEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                    Засах
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="w-full bg-white border-b border-[#0C213A]/10">
        <nav className="flex justify-start gap-0 overflow-x-auto">
          <button
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-none border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap
              ${
                activeTab === "about"
                  ? "border-[#0C213A] text-[#0C213A]"
                  : "border-transparent text-[#0C213A]/60 hover:text-[#0C213A] hover:bg-[#0C213A]/5"
              }
            `}
            onClick={() => setActiveTab("about")}
          >
            Тухай
          </button>
          <button
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-none border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap
              ${
                activeTab === "jobs"
                  ? "border-[#0C213A] text-[#0C213A]"
                  : "border-transparent text-[#0C213A]/60 hover:text-[#0C213A] hover:bg-[#0C213A]/5"
              }
            `}
            onClick={() => setActiveTab("jobs")}
          >
            Нээлттэй ажлын байр
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="mx-auto py-6 sm:py-8 px-2 sm:px-4 md:px-6 lg:px-0">
        {activeTab === "about" && (
          <div className="w-full bg-white rounded-none shadow-none p-0 mb-8 border-0">
            <div className="w-full px-0">
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <h2 className="text-lg md:text-2xl lg:text-xl 2xl:text-2xl font-bold text-[#0C213A]">
                  Компанийн мэдээлэл
                </h2>
                {!isEditingAbout && (
                  <button
                    onClick={() => setIsEditingAbout(true)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-4 sm:px-6 py-2 rounded-lg shadow transition flex items-center gap-2 text-sm sm:text-base"
                  >
                    <FiEdit className="w-4 h-4 sm:w-4 sm:h-4" />
                    Засах
                  </button>
                )}
              </div>
              {isEditingAbout ? (
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-base font-medium text-gray-700 mb-1">
                          Компанийн нэр
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-base sm:text-lg text-[#0C213A] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          value={aboutEdit.name}
                          onChange={(e) =>
                            setAboutEdit((a) => ({ ...a, name: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-base font-medium text-gray-700 mb-1">
                          Байршил
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-base sm:text-lg text-[#0C213A] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          value={aboutEdit.location}
                          onChange={(e) =>
                            setAboutEdit((a) => ({
                              ...a,
                              location: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-base font-medium text-gray-700 mb-1">
                          Вэбсайт
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-base sm:text-lg text-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          value={aboutEdit.website}
                          onChange={(e) =>
                            setAboutEdit((a) => ({ ...a, website: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-base font-medium text-gray-700 mb-1">
                        Компанийн тухай
                      </label>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition h-[150px] sm:h-[200px] resize-none"
                        value={aboutEdit.description}
                        onChange={(e) =>
                          setAboutEdit((a) => ({
                            ...a,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleAboutSave}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg shadow transition flex items-center gap-2 text-sm sm:text-base"
                    >
                      <FiEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                      Хадгалах
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingAbout(false);
                        setAboutEdit({
                          name: company?.name || "",
                          location: company?.location || "",
                          website: company?.website || "",
                          description: company?.description || "",
                        });
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg shadow transition flex items-center gap-2 text-sm sm:text-base"
                    >
                      <FiEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                      Болих
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                  <div className="space-y-6 sm:space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                      <div>
                        <h3 className="text-base md:text-base lg:text-lg xl:text-xl 2xl:text-lg font-medium text-gray-500 mb-1">
                          Компанийн нэр
                        </h3>
                        <p className="text-lg sm:text-xl font-semibold text-[#0C213A]">
                          {company?.name}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-base md:text-base lg:text-lg xl:text-xl 2xl:text-lg font-medium text-gray-500 mb-1">
                          Байршил
                        </h3>
                        <div className="flex items-center gap-2 text-base sm:text-lg text-[#0C213A]">
                          <FiMapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                          {company?.location}
                        </div>
                      </div>
                      {company?.website && (
                        <div>
                          <h3 className="text-base md:text-base lg:text-lg xl:text-xl 2xl:text-lg font-medium text-gray-500 mb-1">
                            Вэбсайт
                          </h3>
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-2 text-base sm:text-lg"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            {company.website}
                          </a>
                        </div>
                      )}
                    </div>
                    {company?.description && (
                      <div className="border-t pt-4 sm:pt-6">
                        <h3 className="text-base md:text-base lg:text-lg xl:text-xl 2xl:text-xl font-medium text-gray-700 mb-2 sm:mb-3 font-poppins font-bold md:font-semibold 2xl:font-bold lg:font-semibold xl:font-semibold 2xl:font-semibold">
                          Компанийн тухай
                        </h3>
                        <div className="prose prose-blue max-w-none">
                          <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line leading-relaxed">
                            {company.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "jobs" && (
          <>
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-[#0C213A]">
              Нээлттэй ажлын байрууд
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 flex flex-col gap-3 relative group hover:shadow-lg transition-shadow"
                >
                  {/* Edit/Delete buttons */}
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(job.id)}
                      className="p-1.5 sm:p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition"
                      title="Засах"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M15.232 5.232l3.536 3.536M9 13l6-6M3 17.25V21h3.75l11.06-11.06a2.121 2.121 0 00-3-3L3 17.25z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-1.5 sm:p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition"
                      title="Устгах"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {/* Title & badges */}
                  <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                      <span className="text-lg sm:text-xl font-bold text-[#0C213A]">
                        {job.title}
                      </span>
                      {job.type && (
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 sm:px-3 py-1 rounded-full">
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
                      )}
                      {job.salary && (
                        <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 sm:px-3 py-1 rounded-full">
                          {job.salary}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Company info */}
                  <div className="flex items-center gap-3 mt-2">
                    <img
                      src={
                        company?.logoUrl || "/images/default-company-logo.svg"
                      }
                      alt="logo"
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-[#0C213A] text-sm sm:text-base">
                        {company?.name}
                      </div>
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                        <FiMapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        {job.location}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
