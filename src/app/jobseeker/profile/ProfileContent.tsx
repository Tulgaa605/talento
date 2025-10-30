"use client";

import React, { useState } from "react";
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

interface QuestionnaireResponse {
  id: string;
  questionnaireId: string;
  questionnaireTitle: string;
  questionnaireDescription: string;
  questionnaireType: string;
  companyName: string;
  companyLogoUrl: string | null;
  submittedAt: string;
  attachmentFile: string | null;
  attachmentUrl: string | null;
  formData: string | null;
  type: 'response' | 'created' | 'sent';
  status?: 'submitted' | 'created' | 'pending';
  responseCount?: number;
  jobTitle?: string;
  answers: Array<{
    questionId: string;
    questionText: string;
    questionType: string;
    value: string;
  }>;
}

interface ProfileContentProps {
  user: User;
}

export default function ProfileContent({ user }: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [questionnaireResponses, setQuestionnaireResponses] = useState<QuestionnaireResponse[]>([]);
  const [loadingQuestionnaires, setLoadingQuestionnaires] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch questionnaire responses when questionnaires tab is activated
  const fetchQuestionnaireResponses = async () => {
    setLoadingQuestionnaires(true);
    try {
      console.log('Fetching questionnaire responses...');
      const response = await fetch('/api/jobseeker/questionnaires');
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Received questionnaire data:', data);
        setQuestionnaireResponses(data);
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
      }
    } catch (error) {
      console.error('Анкетуудыг авахад алдаа гарлаа:', error);
    } finally {
      setLoadingQuestionnaires(false);
    }
  };

  // Fetch questionnaires when tab is clicked
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'questionnaires') {
      fetchQuestionnaireResponses();
    }
  };
  const [editedUser, setEditedUser] = useState({
    name: user.name || "",
    phoneNumber: user.phoneNumber || "",
    facebookUrl: user.facebookUrl || "",
  });

  const handleSave = async () => {
    try {
      const response = await fetch("/api/user/update-profile", {
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
    } catch{
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
        <Image
          src="/images/cover.jpeg"
          alt="Profile cover"
          width={1920}
          height={640}
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
            onClick={() => handleTabClick("profile")}
          >
            Хувийн мэдээлэл
          </button>
          <button
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-none border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === "cvs"
                ? "border-[#0C213A] text-[#0C213A]"
                : "border-transparent text-[#0C213A]/60 hover:text-[#0C213A] hover:bg-[#0C213A]/5"
            }`}
            onClick={() => handleTabClick("cvs")}
          >
            CV жагсаалт
          </button>
          <button
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-none border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === "questionnaires"
                ? "border-[#0C213A] text-[#0C213A]"
                : "border-transparent text-[#0C213A]/60 hover:text-[#0C213A] hover:bg-[#0C213A]/5"
            }`}
            onClick={() => handleTabClick("questionnaires")}
          >
            Анкетууд
          </button>
          <button
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-none border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === "saved"
                ? "border-[#0C213A] text-[#0C213A]"
                : "border-transparent text-[#0C213A]/60 hover:text-[#0C213A] hover:bg-[#0C213A]/5"
            }`}
            onClick={() => handleTabClick("saved")}
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

        {activeTab === "questionnaires" && (
          <div className="w-full px-4 sm:px-6 md:px-8 lg:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#0C213A]">
                Үүсгэсэн анкетууд
              </h2>
            </div>
            
            {loadingQuestionnaires ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0C213A]"></div>
                <span className="ml-3 text-[#0C213A]">Анкетуудыг ачааллаж байна...</span>
              </div>
            ) : questionnaireResponses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">Анкет олдсонгүй</div>
                <div className="text-gray-400">Та одоогоор анкет илгээгээгүй эсвэл анкет хүлээн аваагүй байна.</div>
              </div>
            ) : (
              <div className="grid gap-6">
                {questionnaireResponses.map((response) => (
                  <div key={response.id} className={`border rounded-lg p-6 shadow-sm ${
                    response.questionnaireType === 'GOVERNMENT_EMPLOYEE' 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {response.questionnaireType === 'GOVERNMENT_EMPLOYEE' && (
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                          <h3 className="text-xl font-semibold text-[#0C213A]">
                            {response.questionnaireTitle}
                          </h3>
                          {response.questionnaireType === 'GOVERNMENT_EMPLOYEE' && (
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                              Төрийн албан хаагчийн анкет
                            </span>
                          )}
                          {response.type === 'created' && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                              Үүсгэсэн
                            </span>
                          )}
                          {response.type === 'response' && response.questionnaireType !== 'GOVERNMENT_EMPLOYEE' && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                              Хариулсан
                            </span>
                          )}
                          {response.type === 'sent' && response.status === 'pending' && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium animate-pulse">
                              Бөглөх шаардлагатай
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">
                          {response.questionnaireDescription}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Эх үүсвэр:</span>
                            {response.companyName}
                          </span>
                          {response.jobTitle && (
                            <span className="flex items-center gap-1">
                              <span className="font-medium">Ажлын байр:</span>
                              {response.jobTitle}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Төрөл:</span>
                            {response.questionnaireType}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium">
                              {response.type === 'created' ? 'Үүсгэсэн:' : response.type === 'sent' ? 'Илгээгдсэн:' : 'Илгээсэн:'}
                            </span>
                            {new Date(response.submittedAt).toLocaleDateString('mn-MN')}
                          </span>
                          {response.type === 'created' && response.responseCount !== undefined && (
                            <span className="flex items-center gap-1">
                              <span className="font-medium">Хариулт:</span>
                              {response.responseCount}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Action button for pending sent questionnaires */}
                      {response.type === 'sent' && response.status === 'pending' && (
                        <div>
                          <a
                            href={`/government-questionnaire/${response.questionnaireId}`}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Анкет бөглөх
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Government Employee Questionnaire - Show summary */}
                    {response.type === 'response' && response.questionnaireType === 'GOVERNMENT_EMPLOYEE' && response.formData && (() => {
                      // Parse formData safely
                      let parsedData: {
                        personalInfo?: { name?: string };
                        identification?: { registrationNumber?: string };
                      } | null = null;
                      try {
                        parsedData = typeof response.formData === 'string' 
                          ? JSON.parse(response.formData)
                          : response.formData;
                      } catch (e) {
                        console.error('Error parsing formData:', e);
                      }
                      
                      return (
                        <div className="border-t pt-4">
                          <div className="bg-white p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Төрийн албан хаагчийн анкет бөглөгдсөн
                            </h4>
                            {parsedData ? (
                              <>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">Нэр:</span>
                                    <span className="ml-2 font-medium text-gray-900">
                                      {parsedData?.personalInfo?.name || 'Бөглөөгүй'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Регистр:</span>
                                    <span className="ml-2 font-medium text-gray-900">
                                      {parsedData?.identification?.registrationNumber || 'Бөглөөгүй'}
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-3 pt-3 border-t">
                                  <button
                                    onClick={() => {
                                      window.open(`/government-questionnaire/${response.questionnaireId}`, '_blank');
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Дэлгэрэнгүй харах
                                  </button>
                                </div>
                              </>
                            ) : (
                              <p className="text-gray-500 text-sm">Анкетын мэдээлэл харагдахгүй байна</p>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Regular Answers - only show for responses, not created questionnaires */}
                    {response.type === 'response' && response.questionnaireType !== 'GOVERNMENT_EMPLOYEE' && response.answers.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-800 mb-3">Таны хариултууд:</h4>
                        <div className="space-y-3">
                          {response.answers.map((answer, index) => (
                            <div key={answer.questionId} className="bg-gray-50 p-3 rounded-md">
                              <div className="font-medium text-gray-700 mb-1">
                                {index + 1}. {answer.questionText}
                              </div>
                              <div className="text-gray-600">
                                {answer.questionType === 'MULTIPLE_CHOICE' || answer.questionType === 'SINGLE_CHOICE' ? (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                    {answer.value}
                                  </span>
                                ) : (
                                  <span>{answer.value}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Show different message for created questionnaires */}
                    {response.type === 'created' && (
                      <div className="border-t pt-4">
                        <div className="bg-blue-50 p-4 rounded-md">
                          <p className="text-blue-800 font-medium mb-2">
                            Та энэ анкетыг үүсгэсэн
                          </p>
                          <p className="text-blue-600 text-sm">
                            {response.responseCount === 0 
                              ? 'Одоогоор хэн ч хариулсангүй' 
                              : `${response.responseCount} хүн хариулсан`
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Attachment */}
                    {response.attachmentUrl && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Хавсралт:</h4>
                        <a 
                          href={response.attachmentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 underline"
                        >
                          {response.attachmentFile || 'Хавсралт файл'}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
