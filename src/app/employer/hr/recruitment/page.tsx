"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useState, useEffect } from "react";
import GovernmentEmployeeQuestionnaire from "@/components/GovernmentEmployeeQuestionnaire";
import QuestionnaireResponseView from "@/components/QuestionnaireResponseView";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { StatsSkeleton, PageHeaderSkeleton, CardSkeleton } from "@/components/Skeletons";

interface RecruitmentData {
  stats: {
    totalApplications: number;
    newApplications: number;
    interviewApplications: number;
    successfulApplications: number;
  };
  applications: {
    id: string;
    jobId?: string;
    cvId: string | null;
    name: string;
    position: string;
    department: string;
    status: string;
    date: string;
    score: number;
    type?: string;
    responseId?: string;
    questionnaireId?: string;
    formData?: unknown;
  }[];
  jobs: {
    id: string;
    title: string;
    department: string;
    applicants: number;
    status: string;
    deadline: string;
  }[];
  departments: {
    id: string;
    name: string;
    code: string;
  }[];
  governmentQuestionnaires?: { id: string; title: string; type: string }[];
  governmentResponses?: { id: string; formData: unknown }[];
}

export default function RecruitmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [recruitmentData, setRecruitmentData] = useState<RecruitmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [selectedResponse, setSelectedResponse] = useState<{
    id: string;
    createdAt: string;
    user: { name: string; email: string };
    answers: { id: string; value: string; question: { text: string; type: string } }[];
    formData?: string;
  } | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/employer/login");
      return;
    }
    
    fetchRecruitmentData();
  }, [session, status, router]);

  const fetchRecruitmentData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hr/recruitment');
      
      if (!response.ok) {
        throw new Error('Өгөгдөл авахад алдаа гарлаа');
      }
      
      const data = await response.json();
      setRecruitmentData(data);
      setError(null);
    } catch (err) {
      console.error('Recruitment data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Шинэ';
      case 'EMPLOYER_APPROVED': return 'Ярилцлага';
      case 'ADMIN_APPROVED': return 'Админ баталгаажсан';
      case 'APPROVED': return 'Амжилттай';
      case 'REJECTED': return 'Татгалзсан';
      case 'GOVERNMENT_QUESTIONNAIRE': return 'Төрийн анкет';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-blue-100 text-blue-800';
      case 'EMPLOYER_APPROVED': return 'bg-purple-100 text-purple-800';
      case 'ADMIN_APPROVED': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'GOVERNMENT_QUESTIONNAIRE': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredApplications = recruitmentData?.applications.filter(app => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;
    const matchesDepartment = departmentFilter === '' || app.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  }) || [];

  const recruitmentStages = [
    { 
      stage: "1. Анкет хүлээн авах, ангилах", 
      count: recruitmentData?.stats.totalApplications || 0, 
      color: "bg-blue-500", 
      description: "Ирсэн анкетуудыг системд бүртгэнэ",
      subSteps: [
        "Ирсэн анкетуудыг системд бүртгэнэ",
        "Анкетыг ангилах:",
        "• Шаардлага хангасан",
        "• Хангаагүй", 
        "• Нөөцөнд бүртгэх"
      ]
    },
    { 
      stage: "2. Гол ярилцлагын шат", 
      count: recruitmentData?.stats.interviewApplications || 0, 
      color: "bg-purple-500", 
      description: "Хэлтсийн дарга, ХН-ийн мэргэжилтэн, удирдлагын баг оролцоно",
      subSteps: [
        "Хэлтсийн дарга, ХН-ийн мэргэжилтэн, удирдлагын баг оролцоно",
        "Асуултууд:",
        "• Ур чадвар, туршлагын талаар",
        "• Байгууллагын соёлд нийцэх эсэх",
        "• Сэтгэлгээ, харилцааны ур чадвар"
      ]
    },
    { 
      stage: "3. Шалгарсан нэр дэвшигчдийн баримт бичиг шалгах", 
      count: Math.floor((recruitmentData?.stats.totalApplications || 0) * 0.3), 
      color: "bg-yellow-500", 
      description: "Диплом, сертификат, өмнөх ажлын тодорхойлолт",
      subSteps: [
        "Диплом, сертификат, өмнөх ажлын тодорхойлолт",
        "Хувийн үнэмлэх, лавлагаа (Reference) зэргийг шалгах"
      ]
    },
    { 
      stage: "4. Гэрээ байгуулах", 
      count: recruitmentData?.stats.successfulApplications || 0, 
      color: "bg-green-500", 
      description: "Хөдөлмөрийн гэрээ байгуулах",
      subSteps: [
        "Хөдөлмөрийн гэрээ байгуулах",
        "Нууцлалын гэрээ, дотоод журам, аюулгүй ажиллагааны бичиг баримт гарын үсэг зуруулах"
      ]
    }
  ];

  if (loading) {
    return (
      <main className="max-w-7xl mt-10 mx-auto px-4 py-8">
        <PageHeaderSkeleton />
        <StatsSkeleton count={4} />
        <div className="mb-6">
          <div className="flex space-x-8 border-b border-gray-200">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
            ))}
          </div>
        </div>
        <CardSkeleton count={6} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
              </div>
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mt-10 mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-red-400">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Алдаа гарлаа</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button 
                onClick={fetchRecruitmentData}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Дахин оролдох
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!recruitmentData) {
    return (
      <div className="max-w-7xl mt-10 mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Өгөгдөл олдсонгүй</h3>
          <p className="text-gray-500 mt-1">Ажилд авах мэдээлэл олдсонгүй байна.</p>
        </div>
      </div>
    );
  }

  const recruitmentStats = [
    { label: "Нийт анкет", value: recruitmentData.stats.totalApplications.toString(), change: "+" + recruitmentData.stats.newApplications, color: "text-blue-600", icon: "📋" },
    { label: "Шинэ анкет", value: recruitmentData.stats.newApplications.toString(), change: "+" + Math.floor(recruitmentData.stats.newApplications * 0.3), color: "text-green-600", icon: "🆕" },
    { label: "Ярилцлага", value: recruitmentData.stats.interviewApplications.toString(), change: "+" + Math.floor(recruitmentData.stats.interviewApplications * 0.2), color: "text-purple-600", icon: "💬" },
    { label: "Амжилттай", value: recruitmentData.stats.successfulApplications.toString(), change: "+" + Math.floor(recruitmentData.stats.successfulApplications * 0.1), color: "text-orange-600", icon: "✅" }
  ];

  return (
    <>
      <main className="max-w-7xl mt-10 mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-[#0C213A] mb-2">Ажилд авах процесс</h1>
              <p className="text-gray-600">Ажлын байрны зарлал, анкет, ярилцлага, сонголтын процессыг удирдах</p>
              <div className="hidden-on-screen mt-2 text-sm text-gray-500">
                Хэвлэсэн огноо: {new Date().toLocaleString('mn-MN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {recruitmentStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">s
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-[#0C213A]">{stat.value}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{stat.icon}</span>
                <div className={`text-sm font-medium ${stat.color}`}>
                  {stat.change}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", name: "Хянах самбар" },
              { id: "questionnaire", name: "Анкет бөглөх" },
              { id: "applications", name: "Анкетууд" },
              { id: "positions", name: "Ажлын байр" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-[#0C213A] text-[#0C213A]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#0C213A]">Сүүлийн анкетууд</h3>
              <button 
                onClick={() => setActiveTab("applications")}
                className="text-sm text-[#0C213A] hover:text-[#0C213A]/80 cursor-pointer"
              >
                Бүгдийг харах
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recruitmentData.applications.slice(0, 4).map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#0C213A] text-white rounded-full flex items-center justify-center font-bold">
                        {application.name[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h4 className="font-medium text-[#0C213A]">{application.name}</h4>
                        <p className="text-sm text-gray-600">{application.position} • {application.department}</p>
                        <p className="text-xs text-gray-500">{application.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                        {getStatusDisplayName(application.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-[#0C213A]">Ажилд авах процесс</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {recruitmentStages.map((stage, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full ${stage.color} flex items-center justify-center text-white text-xs font-bold`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-[#0C213A]">{stage.stage}</h4>
                          <p className="text-sm text-gray-600">{stage.description}</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-[#0C213A]">{stage.count}</span>
                    </div>
                    <div className="ml-9">
                      <div className="space-y-1">
                        {stage.subSteps.map((subStep, subIndex) => (
                          <div key={subIndex} className="text-sm text-gray-600 flex items-start">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            <span>{subStep}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "applications" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <h3 className="text-lg font-semibold text-[#0C213A]">Анкетуудын жагсаалт</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Нэр, албан тушаал эсвэл хэлтэсээр хайх..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black-500"
                />
                <select 
                  value={departmentFilter} 
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black-500"
                >
                  <option value="">Бүх хэлтэс</option>
                  {recruitmentData.departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <select 
                  value={selectedStatus} 
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black-500"
                >
                  <option value="all">Бүгд</option>
                  <option value="PENDING">Шинэ</option>
                  <option value="EMPLOYER_APPROVED">Ярилцлага</option>
                  <option value="APPROVED">Амжилттай</option>
                  <option value="REJECTED">Татгалзсан</option>
                  <option value="GOVERNMENT_QUESTIONNAIRE">Төрийн анкет</option>
                </select>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setDepartmentFilter('');
                    setSelectedStatus('all');
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  Цэвэрлэх
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Нэр</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Албан тушаал</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Хэлтэс</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Төлөв</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Огноо</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0C213A]">{application.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{application.position}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{application.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                          {getStatusDisplayName(application.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{application.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {application.type === 'government' ? (
                          <>
                            <button 
                              onClick={async () => {
                                try {
                                  if (!application.responseId) {
                                    alert('Анкетын хариулт олдсонгүй.');
                                    return;
                                  }
                                  
                                  console.log('Fetching response with ID:', application.responseId);
                                  
                                  // Fetch the questionnaire response directly by ID
                                  const response = await fetch(`/api/employer/questionnaires/responses/${application.responseId}`);
                                  
                                  if (!response.ok) {
                                    const errorText = await response.text();
                                    console.error('API Error:', response.status, errorText);
                                    throw new Error(`Failed to fetch response: ${response.status}`);
                                  }
                                  
                                  const responseData = await response.json();
                                  console.log('Received response:', responseData);
                                  
                                  setSelectedResponse({
                                    id: responseData.id,
                                    createdAt: responseData.createdAt,
                                    user: responseData.user,
                                    answers: responseData.answers || [],
                                    formData: responseData.formData
                                  });
                                  setShowResponseModal(true);
                                } catch (error) {
                                  console.error('Error fetching questionnaire response:', error);
                                  alert('Анкетын хариулт татахад алдаа гарлаа: ' + (error instanceof Error ? error.message : 'Unknown error'));
                                }
                              }}
                              className="text-[#0C213A] hover:text-[#0C213A]/80"
                            >
                              Үзэх
                            </button>
                            <Link 
                              href={`/government-questionnaire/${application.questionnaireId || ''}`}
                              className="text-green-600 hover:text-green-800 hover:underline"
                            >
                              Засах
                            </Link>
                          </>
                        ) : (
                          <>
                            {application.jobId ? (
                              <Link href={`/employer/applications/${application.jobId}`} className="text-[#0C213A] hover:text-[#0C213A]/80">Үзэх</Link>
                            ) : (
                              <span className="text-gray-400">Үзэх</span>
                            )}
                            {application.cvId && (
                              <button 
                                onClick={async () => {
                                  try {
                                    const response = await fetch(`/api/cv/download?cvId=${application.cvId}`);
                                    if (response.ok) {
                                      const blob = await response.blob();
                                      const url = window.URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `${application.name}_CV.pdf`;
                                      document.body.appendChild(a);
                                      a.click();
                                      window.URL.revokeObjectURL(url);
                                      document.body.removeChild(a);
                                    } else if (response.status === 401) {
                                      alert('Эрх байхгүй байна. Нэвтрэх эрхээ шалгана уу.');
                                    } else if (response.status === 404) {
                                      alert('CV файл олдсонгүй байна.');
                                    } else {
                                      alert('CV татахад алдаа гарлаа.');
                                    }
                                  } catch (error) {
                                    console.error('CV download error:', error);
                                    alert('CV татахад алдаа гарлаа.');
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                                title={`${application.name}-ийн CV татах`}
                              >
                                CV Татах
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (application.jobId) {
                                  router.push(`/employer/applications/${application.jobId}`);
                                } else {
                                  alert('Ажлын байрны мэдээлэл олдсонгүй.');
                                }
                              }}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              Засах
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Хайлтын нөхцөлд тохирох анкет олдсонгүй
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "positions" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recruitmentData.jobs.map((position) => (
            <div key={position.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-semibold text-[#0C213A]">{position.title}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  position.status === "Идэвхтэй" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {position.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p><span className="font-medium">Хэлтэс:</span> {position.department}</p>
                <p><span className="font-medium">Анкет:</span> {position.applicants} хүн</p>
                <p><span className="font-medium">Дуусах хугацаа:</span> {position.deadline}</p>
              </div>
              <div className="flex space-x-2">
                <Link 
                  href={`/employer/applications/${position.id}`}
                  className="flex-1 bg-[#0C213A] text-white py-2 px-3 rounded text-sm hover:bg-[#0C213A]/90 transition-colors text-center"
                >
                  Анкет үзэх
                </Link>
                <Link
                  href={`/employer/jobs/edit/${position.id}`}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors"
                >
                  Засах
                </Link>
              </div>
            </div>
          ))}
          {recruitmentData.jobs.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ажлын байр олдсонгүй</h3>
              <p className="text-gray-600 mb-6">Одоогоор бүртгэгдсэн ажлын байр байхгүй байна.</p>
              <Link 
                href="/employer/post-job"
                className="bg-[#0C213A] text-white px-6 py-3 rounded-lg hover:bg-[#0C213A]/90 transition-colors"
              >
                Шинэ ажлын байр зарлах
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === "questionnaire" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <GovernmentEmployeeQuestionnaire
              onSubmit={(data) => {
                console.log('Questionnaire submitted:', data);
                setActiveTab("overview");
                fetchRecruitmentData();
              }}
              onCancel={() => {
                setActiveTab("overview");
              }}
            />
          </div>
        </div>
      )}

      {showResponseModal && selectedResponse && (
        <QuestionnaireResponseView
          response={selectedResponse}
          onClose={() => {
            setShowResponseModal(false);
            setSelectedResponse(null);
          }}
          onUpdate={() => {
            fetchRecruitmentData();
          }}
        />
      )}
    </main>
    </>
  );
}