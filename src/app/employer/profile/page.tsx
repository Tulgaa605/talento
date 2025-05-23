"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/24/solid";
import { FiEdit, FiMapPin } from "react-icons/fi";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

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

interface Question {
  id: string;
  text: string;
  type: "TEXT" | "MULTIPLE_CHOICE" | "SINGLE_CHOICE";
  required: boolean;
  options: string[];
  order: number;
}

interface Questionnaire {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

interface QuestionnaireResponse {
  id: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  answers: {
    question: {
      text: string;
      type: string;
    };
    value: string;
  }[];
}

interface CV {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
  status?: "PENDING" | "ACCEPTED" | "REJECTED";
  user: {
    id: string;
    name: string;
    email: string;
  };
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
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [newApplicationsCount, setNewApplicationsCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [isCreatingQuestionnaire, setIsCreatingQuestionnaire] = useState(false);
  const [newQuestionnaire, setNewQuestionnaire] = useState({
    title: "",
    description: "",
    questions: [] as Question[],
  });
  const [editingQuestionnaire, setEditingQuestionnaire] =
    useState<Questionnaire | null>(null);
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<
    string | null
  >(null);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [selectedCV, setSelectedCV] = useState<string | null>(null);
  const [isSendingQuestionnaire, setIsSendingQuestionnaire] = useState(false);

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

  useEffect(() => {
    if (company) {
      fetchQuestionnaires();
    }
  }, [company]);

  useEffect(() => {
    if (activeTab === "responses" && selectedQuestionnaire) {
      fetchResponses(selectedQuestionnaire);
    }
  }, [activeTab, selectedQuestionnaire]);

  useEffect(() => {
    if (activeTab === "anketuud") {
      fetchCVs();
    }
  }, [activeTab]);

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

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = async () => {
    if (!coverFile) return;

    try {
      setIsUploadingCover(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", coverFile);

      const uploadRes = await fetch("/api/upload/company-cover", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload cover image");
      }

      const text = await uploadRes.text();
      if (!text) {
        throw new Error("Хоосон хариу ирлээ");
      }
      const uploadData = JSON.parse(text);

      // Update company with new cover image URL
      const response = await fetch("/api/employer/company/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: company?.name,
          location: company?.location,
          logoUrl: company?.logoUrl,
          description: company?.description,
          website: company?.website,
          coverImageUrl: uploadData.url,
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
      setCoverFile(null);
      setCoverPreview(null);
      setSuccessMessage("Cover image updated successfully");
    } catch (error) {
      console.error("Error uploading cover:", error);
      setError("Failed to upload cover image. Please try again.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const fetchQuestionnaires = async () => {
    try {
      const response = await fetch(
        `/api/employer/questionnaires?companyId=${company?.id}`
      );
      const data = await response.json();
      setQuestionnaires(data);
    } catch (error) {
      console.error("Error fetching questionnaires:", error);
    }
  };

  const handleCreateQuestionnaire = async () => {
    try {
      const response = await fetch("/api/employer/questionnaires", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newQuestionnaire,
          companyId: company?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create questionnaire");
      }

      await fetchQuestionnaires();
      setIsCreatingQuestionnaire(false);
      setNewQuestionnaire({
        title: "",
        description: "",
        questions: [],
      });
    } catch (error) {
      console.error("Error creating questionnaire:", error);
    }
  };

  const handleAddQuestion = () => {
    setNewQuestionnaire((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: Date.now().toString(),
          text: "",
          type: "TEXT" as const,
          required: false,
          options: [],
          order: prev.questions.length,
        },
      ],
    }));
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: string | boolean | string[]
  ) => {
    setNewQuestionnaire((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  };

  const handleDeleteQuestion = (index: number) => {
    setNewQuestionnaire((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleEditQuestionnaire = async () => {
    if (!editingQuestionnaire) return;

    try {
      const response = await fetch("/api/employer/questionnaires", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingQuestionnaire),
      });

      if (!response.ok) {
        throw new Error("Failed to update questionnaire");
      }

      await fetchQuestionnaires();
      setEditingQuestionnaire(null);
    } catch (error) {
      console.error("Error updating questionnaire:", error);
    }
  };

  const handleDeleteQuestionnaire = async (id: string) => {
    if (!confirm("Are you sure you want to delete this questionnaire?")) {
      return;
    }

    try {
      const response = await fetch(`/api/employer/questionnaires?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete questionnaire");
      }

      await fetchQuestionnaires();
    } catch (error) {
      console.error("Error deleting questionnaire:", error);
    }
  };

  const fetchResponses = async (questionnaireId: string) => {
    try {
      const response = await fetch(
        `/api/employer/questionnaires/${questionnaireId}/responses`
      );
      const data = await response.json();
      setResponses(data);
    } catch (error) {
      console.error("Error fetching responses:", error);
    }
  };

  const fetchCVs = async () => {
    try {
      const res = await fetch("/api/employer/cvs");
      const data = await res.json();
      setCvs(data);
    } catch (error) {
      console.error("Error fetching CVs:", error);
    }
  };

  const handleSendQuestionnaire = async (
    cvId: string,
    questionnaireId: string
  ) => {
    try {
      setIsSendingQuestionnaire(true);
      const response = await fetch("/api/employer/questionnaires/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvId,
          questionnaireId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send questionnaire");
      }

      alert("Асуулга амжилттай илгээгдлээ");
    } catch (error) {
      console.error("Error sending questionnaire:", error);
      alert("Асуулга илгээхэд алдаа гарлаа");
    } finally {
      setIsSendingQuestionnaire(false);
    }
  };

  const handleApproveCV = async (applicationId: string) => {
    try {
      const response = await fetch(
        `/api/employer/applications/${applicationId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to approve CV");
      }

      const updatedApplication = await response.json();

      // Update applications list
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: "ACCEPTED" } : app
        )
      );

      alert("CV амжилттай зөвшөөрөгдлөө");
    } catch (error) {
      console.error("Error approving CV:", error);
      alert("CV зөвшөөрөхөд алдаа гарлаа");
    }
  };

  const handleRejectCV = async (applicationId: string) => {
    try {
      const response = await fetch(
        `/api/employer/applications/${applicationId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reject CV");
      }

      const updatedApplication = await response.json();

      // Update applications list
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: "REJECTED" } : app
        )
      );

      alert("CV амжилттай татгалзлаа");
    } catch (error) {
      console.error("Error rejecting CV:", error);
      alert("CV татгалзах үед алдаа гарлаа");
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
      <div className="relative w-full h-32 sm:h-40 md:h-48 lg:h-64 group">
        <img
          src={
            coverPreview ||
            company?.coverImageUrl ||
            "/images/default-cover.jpg"
          }
          alt="Company cover"
          className="w-full h-full object-cover object-center transition-all duration-300"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-4">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="bg-white/90 hover:bg-white text-gray-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl text-sm sm:text-base">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
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
        {coverFile && (
          <div className="absolute bottom-4 right-4 flex gap-2 z-20">
            <button
              onClick={handleCoverUpload}
              disabled={isUploadingCover}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploadingCover ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Хадгалж байна...
                </>
              ) : (
                <>
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Хадгалах
                </>
              )}
            </button>
            <button
              onClick={() => {
                setCoverFile(null);
                setCoverPreview(null);
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Цуцлах
            </button>
          </div>
        )}
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
          <button
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-none border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap
              ${
                activeTab === "questionnaires"
                  ? "border-[#0C213A] text-[#0C213A]"
                  : "border-transparent text-[#0C213A]/60 hover:text-[#0C213A] hover:bg-[#0C213A]/5"
              }
            `}
            onClick={() => setActiveTab("questionnaires")}
          >
            Асуулга
          </button>
          <button
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-none border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap
              ${
                activeTab === "responses"
                  ? "border-[#0C213A] text-[#0C213A]"
                  : "border-transparent text-[#0C213A]/60 hover:text-[#0C213A] hover:bg-[#0C213A]/5"
              }
            `}
            onClick={() => setActiveTab("responses")}
          >
            Хариултууд
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
                            setAboutEdit((a) => ({
                              ...a,
                              name: e.target.value,
                            }))
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
                            setAboutEdit((a) => ({
                              ...a,
                              website: e.target.value,
                            }))
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
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                              />
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
        {activeTab === "questionnaires" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-[#0C213A]">
                Асуулга
              </h2>
              {!isCreatingQuestionnaire && !editingQuestionnaire && (
                <button
                  onClick={() => setIsCreatingQuestionnaire(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Шинэ асуулга
                </button>
              )}
            </div>

            {isCreatingQuestionnaire || editingQuestionnaire ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Гарчиг
                    </label>
                    <input
                      type="text"
                      value={
                        editingQuestionnaire?.title || newQuestionnaire.title
                      }
                      onChange={(e) =>
                        editingQuestionnaire
                          ? setEditingQuestionnaire((prev) =>
                              prev ? { ...prev, title: e.target.value } : null
                            )
                          : setNewQuestionnaire((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Тайлбар
                    </label>
                    <textarea
                      value={
                        editingQuestionnaire?.description ||
                        newQuestionnaire.description
                      }
                      onChange={(e) =>
                        editingQuestionnaire
                          ? setEditingQuestionnaire((prev) =>
                              prev
                                ? { ...prev, description: e.target.value }
                                : null
                            )
                          : setNewQuestionnaire((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        Асуултууд
                      </h3>
                      <button
                        onClick={() =>
                          editingQuestionnaire
                            ? setEditingQuestionnaire((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      questions: [
                                        ...prev.questions,
                                        {
                                          id: Date.now().toString(),
                                          text: "",
                                          type: "TEXT" as const,
                                          required: false,
                                          options: [],
                                          order: prev.questions.length,
                                        },
                                      ],
                                    }
                                  : null
                              )
                            : handleAddQuestion()
                        }
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <PlusIcon className="w-5 h-5" />
                        Асуулт нэмэх
                      </button>
                    </div>

                    {(
                      editingQuestionnaire?.questions ||
                      newQuestionnaire.questions
                    ).map((question, index) => (
                      <div
                        key={question.id}
                        className="border border-gray-200 rounded-lg p-4 space-y-4"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Асуулт
                              </label>
                              <input
                                type="text"
                                value={question.text}
                                onChange={(e) =>
                                  editingQuestionnaire
                                    ? setEditingQuestionnaire((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              questions: prev.questions.map(
                                                (q, i) =>
                                                  i === index
                                                    ? {
                                                        ...q,
                                                        text: e.target.value,
                                                      }
                                                    : q
                                              ),
                                            }
                                          : null
                                      )
                                    : handleQuestionChange(
                                        index,
                                        "text",
                                        e.target.value
                                      )
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Төрөл
                              </label>
                              <select
                                value={question.type}
                                onChange={(e) => {
                                  const value = e.target.value as
                                    | "TEXT"
                                    | "MULTIPLE_CHOICE"
                                    | "SINGLE_CHOICE";
                                  if (editingQuestionnaire) {
                                    setEditingQuestionnaire((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            questions: prev.questions.map(
                                              (q, i) =>
                                                i === index
                                                  ? { ...q, type: value }
                                                  : q
                                            ),
                                          }
                                        : null
                                    );
                                  } else {
                                    handleQuestionChange(index, "type", value);
                                  }
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="TEXT">Текст</option>
                                <option value="SINGLE_CHOICE">
                                  Нэг сонголттой
                                </option>
                                <option value="MULTIPLE_CHOICE">
                                  Олон сонголттой
                                </option>
                              </select>
                            </div>
                            {(question.type === "SINGLE_CHOICE" ||
                              question.type === "MULTIPLE_CHOICE") && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Сонголтууд
                                </label>
                                <div className="space-y-2">
                                  {question.options.map(
                                    (option, optionIndex) => (
                                      <div
                                        key={optionIndex}
                                        className="flex gap-2"
                                      >
                                        <input
                                          type="text"
                                          value={option}
                                          onChange={(e) => {
                                            const newOptions = [
                                              ...question.options,
                                            ];
                                            newOptions[optionIndex] =
                                              e.target.value;
                                            if (editingQuestionnaire) {
                                              setEditingQuestionnaire((prev) =>
                                                prev
                                                  ? {
                                                      ...prev,
                                                      questions:
                                                        prev.questions.map(
                                                          (q, i) =>
                                                            i === index
                                                              ? {
                                                                  ...q,
                                                                  options:
                                                                    newOptions,
                                                                }
                                                              : q
                                                        ),
                                                    }
                                                  : null
                                              );
                                            } else {
                                              handleQuestionChange(
                                                index,
                                                "options",
                                                newOptions
                                              );
                                            }
                                          }}
                                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <button
                                          onClick={() => {
                                            const newOptions =
                                              question.options.filter(
                                                (_, i) => i !== optionIndex
                                              );
                                            if (editingQuestionnaire) {
                                              setEditingQuestionnaire((prev) =>
                                                prev
                                                  ? {
                                                      ...prev,
                                                      questions:
                                                        prev.questions.map(
                                                          (q, i) =>
                                                            i === index
                                                              ? {
                                                                  ...q,
                                                                  options:
                                                                    newOptions,
                                                                }
                                                              : q
                                                        ),
                                                    }
                                                  : null
                                              );
                                            } else {
                                              handleQuestionChange(
                                                index,
                                                "options",
                                                newOptions
                                              );
                                            }
                                          }}
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <TrashIcon className="w-5 h-5" />
                                        </button>
                                      </div>
                                    )
                                  )}
                                  <button
                                    onClick={() => {
                                      const newOptions = [
                                        ...question.options,
                                        "",
                                      ];
                                      if (editingQuestionnaire) {
                                        setEditingQuestionnaire((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                questions: prev.questions.map(
                                                  (q, i) =>
                                                    i === index
                                                      ? {
                                                          ...q,
                                                          options: newOptions,
                                                        }
                                                      : q
                                                ),
                                              }
                                            : null
                                        );
                                      } else {
                                        handleQuestionChange(
                                          index,
                                          "options",
                                          newOptions
                                        );
                                      }
                                    }}
                                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                                  >
                                    <PlusIcon className="w-4 h-4" />
                                    Сонголт нэмэх
                                  </button>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`required-${question.id}`}
                                checked={question.required}
                                onChange={(e) =>
                                  editingQuestionnaire
                                    ? setEditingQuestionnaire((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              questions: prev.questions.map(
                                                (q, i) =>
                                                  i === index
                                                    ? {
                                                        ...q,
                                                        required:
                                                          e.target.checked,
                                                      }
                                                    : q
                                              ),
                                            }
                                          : null
                                      )
                                    : handleQuestionChange(
                                        index,
                                        "required",
                                        e.target.checked
                                      )
                                }
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <label
                                htmlFor={`required-${question.id}`}
                                className="text-sm text-gray-700"
                              >
                                Заавал бөглөх
                              </label>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              editingQuestionnaire
                                ? setEditingQuestionnaire((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          questions: prev.questions.filter(
                                            (_, i) => i !== index
                                          ),
                                        }
                                      : null
                                  )
                                : handleDeleteQuestion(index)
                            }
                            className="text-red-600 hover:text-red-700 ml-4"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => {
                        if (editingQuestionnaire) {
                          setEditingQuestionnaire(null);
                        } else {
                          setIsCreatingQuestionnaire(false);
                          setNewQuestionnaire({
                            title: "",
                            description: "",
                            questions: [],
                          });
                        }
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Цуцлах
                    </button>
                    <button
                      onClick={
                        editingQuestionnaire
                          ? handleEditQuestionnaire
                          : handleCreateQuestionnaire
                      }
                      className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Хадгалах
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {questionnaires.map((questionnaire) => (
                  <div
                    key={questionnaire.id}
                    className="bg-white rounded-xl shadow-lg p-6 space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      {questionnaire.title}
                    </h3>
                    {questionnaire.description && (
                      <p className="text-gray-600">
                        {questionnaire.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {questionnaire.questions.length} асуулт
                      </div>
                      <button
                        onClick={() => {
                          setSelectedQuestionnaire(questionnaire.id);
                          setActiveTab("responses");
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Хариултуудыг харах
                      </button>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingQuestionnaire(questionnaire)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Засах
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteQuestionnaire(questionnaire.id)
                        }
                        className="text-red-600 hover:text-red-700"
                      >
                        Устгах
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === "responses" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-[#0C213A]">
                Асуулгын хариултууд
              </h2>
              <select
                value={selectedQuestionnaire || ""}
                onChange={(e) => setSelectedQuestionnaire(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Асуулга сонгох</option>
                {questionnaires.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedQuestionnaire ? (
              <div className="space-y-6">
                {responses.map((response) => (
                  <div
                    key={response.id}
                    className="bg-white rounded-xl shadow-lg p-6 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {response.user.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {response.user.email}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(response.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="space-y-4">
                      {response.answers.map((answer, index) => (
                        <div key={index} className="border-t pt-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            {answer.question.text}
                          </h4>
                          {answer.question.type === "MULTIPLE_CHOICE" ? (
                            <div className="space-y-2">
                              {answer.value.split(",").map((value, i) => (
                                <div
                                  key={i}
                                  className="bg-gray-50 px-3 py-2 rounded-lg"
                                >
                                  {value.trim()}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-700">{answer.value}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {responses.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    Энэ асуулгад одоогоор хариулт ирээгүй байна
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Асуулга сонгоно уу
              </div>
            )}
          </div>
        )}
        {activeTab === "anketuud" && (
          <div className="space-y-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#0C213A]">
              Ирсэн CV-үүд
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="bg-white rounded-xl shadow-lg p-6 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.user.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {application.user.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                      {application.status && (
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            application.status === "ACCEPTED"
                              ? "bg-green-100 text-green-800"
                              : application.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {application.status === "ACCEPTED"
                            ? "Зөвшөөрөгдсөн"
                            : application.status === "REJECTED"
                            ? "Татгалзсан"
                            : "Хүлээгдэж буй"}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={application.cv.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        CV Татах
                      </a>
                      {(!application.status ||
                        application.status === "PENDING") && (
                        <>
                          <button
                            onClick={() => handleApproveCV(application.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            Зөвшөөрөх
                          </button>
                          <button
                            onClick={() => handleRejectCV(application.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Татгалзах
                          </button>
                        </>
                      )}
                      <div className="relative">
                        <button
                          onClick={() => setSelectedCV(application.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Асуулга Илгээх
                        </button>
                        {selectedCV === application.id && (
                          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-10">
                            <h4 className="font-medium mb-2">Асуулга сонгох</h4>
                            <div className="space-y-2">
                              {questionnaires.map((q) => (
                                <button
                                  key={q.id}
                                  onClick={() => {
                                    handleSendQuestionnaire(
                                      application.id,
                                      q.id
                                    );
                                    setSelectedCV(null);
                                  }}
                                  disabled={isSendingQuestionnaire}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                                >
                                  {q.title}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {applications.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  Одоогоор ирсэн CV байхгүй байна
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
