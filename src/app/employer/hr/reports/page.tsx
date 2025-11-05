"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useReactToPrint } from 'react-to-print';
import { PrinterIcon } from '@heroicons/react/24/outline';

// ==== Types (аль болох any-гүй болгов) ====
type ReportStatus = "Дууссан" | "Хүлээгдэж буй" | "Эхлээгүй";

interface Report {
  id: number;
  name: string;
  type: string;
  period: string;
  status: ReportStatus;
  size: string;
  description: string;
  createdBy: string;
  createdAt: string;     // YYYY-MM-DD
  lastModified: string;  // YYYY-MM-DD
  format: "PDF" | "Excel" | "Word" | string;
  department: "HR" | "Санхүү" | "IT" | "Маркетинг" | string;
}

interface ReportTemplate {
  name: string;
  description: string;
  icon: string;         // emoji
  category: string;
  fields: string[];
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "reports" | "templates" | "analytics">("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("2024");
  const [currentDate, setCurrentDate] = useState('');

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);

  const [reports, setReports] = useState<Report[]>([]);
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Тайлан_статистик_${new Date().getTime()}`,
  });

  useEffect(() => {
    setCurrentDate(new Date().toLocaleString('mn-MN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
  }, []);

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const totalReports = reports.length;
  const thisMonthReports = reports.filter((r) => String(r.createdAt).startsWith(monthKey)).length;
  const doneReports = reports.filter((r) => r.status === "Дууссан").length;
  const pendingReports = reports.filter((r) => r.status === "Хүлээгдэж буй").length;

  const reportStats = [
    { label: "Нийт тайлан", value: String(totalReports), change: "", color: "text-blue-600", icon: "📊" },
    { label: "Энэ сар тайлан", value: String(thisMonthReports), change: "", color: "text-green-600", icon: "📈" },
    { label: "Экспорт хийсэн", value: String(doneReports), change: "", color: "text-purple-600", icon: "💾" },
    { label: "Хүлээгдэж буй", value: String(pendingReports), change: "", color: "text-orange-600", icon: "⏳" },
  ] as const;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/hr/reports");
        if (!res.ok) return;
        const data: unknown = await res.json();
        if (Array.isArray(data)) {
          setReports(data as Report[]);
        }
      } catch {
      }
    };
    load();
  }, []);

  const openDetailModal = (report: Report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedReport(null);
  };

  const openEditModal = (report: Report) => {
    setSelectedReport(report);
    setShowEditModal(true);
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedReport(null);
  };

  const openAddModal = () => setShowAddModal(true);
  const closeAddModal = () => setShowAddModal(false);

  const openTemplateModal = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };
  const closeTemplateModal = () => {
    setShowTemplateModal(false);
    setSelectedTemplate(null);
  };

  const openEditTemplateModal = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setShowEditTemplateModal(true);
  };
  const closeEditTemplateModal = () => {
    setShowEditTemplateModal(false);
    setSelectedTemplate(null);
  };

  const handleEditTemplate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    closeEditTemplateModal();
  };

  const handleDownload = (report: Report) => {
    alert(`${report.name} татаж байна...`);
  };

  const handleEditReport = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedReport) return;
    const formData = new FormData(e.currentTarget);
    const updatedReport: Report = {
      ...selectedReport,
      name: String(formData.get("name") ?? ""),
      type: String(formData.get("type") ?? ""),
      period: String(formData.get("period") ?? ""),
      status: String(formData.get("status") ?? "Хүлээгдэж буй") as ReportStatus,
      description: String(formData.get("description") ?? ""),
      department: String(formData.get("department") ?? ""),
      format: String(formData.get("format") ?? "PDF"),
    };

    setReports((prev) => prev.map((r) => (r.id === selectedReport.id ? updatedReport : r)));
    closeEditModal();
  };

  const handleAddReport = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newReport: Report = {
      id: reports.length + 1,
      name: String(formData.get("name") ?? ""),
      type: String(formData.get("type") ?? ""),
      period: String(formData.get("period") ?? ""),
      status: String(formData.get("status") ?? "Хүлээгдэж буй") as ReportStatus,
      size: "-",
      description: String(formData.get("description") ?? ""),
      createdBy: "Систем",
      createdAt: new Date().toISOString().split("T")[0],
      lastModified: new Date().toISOString().split("T")[0],
      format: String(formData.get("format") ?? "PDF"),
      department: String(formData.get("department") ?? "HR"),
    };

    setReports((prev) => [...prev, newReport]);
    closeAddModal();
    try {
      void fetch("/api/hr/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReport),
      });
    } catch {
    }
  };

  const handleDeleteReport = (reportId: number) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
  };

  const handleCreateFromTemplate = (template: ReportTemplate) => {
    const newReport: Report = {
      id: reports.length + 1,
      name: template.name,
      type: template.category,
      period: "2024-01",
      status: "Хүлээгдэж буй",
      size: "-",
      description: template.description,
      createdBy: "Систем",
      createdAt: new Date().toISOString().split("T")[0],
      lastModified: new Date().toISOString().split("T")[0],
      format: "PDF",
      department: "HR",
    };

    setReports((prev) => [...prev, newReport]);
    closeTemplateModal();
    setActiveTab("reports");
    try {
      alert("Тайлан амжилттай үүсгэлээ.");
    } catch {
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const departmentStats: {
    department: string;
    employees: number;
    avgSalary: string;
    performance: number;
    trend: "up" | "down" | "stable";
  }[] = [
    { department: "IT", employees: 45, avgSalary: "2,500,000₮", performance: 4.2, trend: "up" },
    { department: "Маркетинг", employees: 32, avgSalary: "2,200,000₮", performance: 4.1, trend: "up" },
    { department: "Санхүү", employees: 28, avgSalary: "2,800,000₮", performance: 4.3, trend: "stable" },
    { department: "HR", employees: 15, avgSalary: "2,100,000₮", performance: 4.0, trend: "up" },
    { department: "Борлуулалт", employees: 38, avgSalary: "2,300,000₮", performance: 3.9, trend: "down" },
  ];

  const initialTemplates: ReportTemplate[] = [
    {
      name: "Ажилтны ерөнхий тайлан",
      description: "Нийт ажилтны тоо, хэлтсээр, бүтэц, нас, хүйс, боловсролын бүтэц",
      icon: "👥",
      category: "Ажилтны тайлан",
      fields: ["Нийт ажилтны тоо", "Хэлтэс бүрийн ажилтны тоо", "Шинээр ажилд орсон", "Чөлөөлөгдсөн", "Нас, хүйс, боловсролын бүтэц"],
    },
    {
      name: "Цалингийн дэлгэрэнгүй тайлан",
      description: "Сарын нийт цалин, хэлтэс бүрийн дундаж цалин, НДШ, татварын тайлан",
      icon: "💰",
      category: "Цалингийн тайлан",
      fields: ["Сарын нийт цалин", "Хэлтэс бүрийн дундаж цалин", "НДШ, татварын тайлан", "Нэмэгдэл, урамшууллын тайлан"],
    },
    {
      name: "Гүйцэтгэлийн тайлан",
      description: "Нэг ажилтны гүйцэтгэлийн үнэлгээний дундаж оноо, харьцуулалт",
      icon: "📊",
      category: "Ажлын гүйцэтгэлийн тайлан",
      fields: ["Нэг ажилтны гүйцэтгэлийн үнэлгээний дундаж оноо", "Хэлтэс, багийн гүйцэтгэлийн харьцуулалт", "Шилдэг 10 ажилтан", "Хамгийн сул үнэлгээтэй ажилтан"],
    },
    {
      name: "Сургалт, хөгжлийн тайлан",
      description: "Сургалтад хамрагдсан ажилтны тоо, зардлын тайлан, сертификат",
      icon: "🎓",
      category: "Сургалт, хөгжлийн тайлан",
      fields: ["Сургалтад хамрагдсан ажилтны тоо", "Сургалтын зардлын тайлан", "Сертификат авсан ажилтнуудын жагсаалт", "Хөгжлийн төлөвлөгөөний биелэлт"],
    },
    {
      name: "Шагнал, шийтгэлийн тайлан",
      description: "Шагнал авсан ажилтнуудын жагсаалт, шийтгэлийн статистик",
      icon: "🏆",
      category: "Шагнал, шийтгэлийн тайлан",
      fields: ["Шагнал авсан ажилтнуудын жагсаалт", "Шийтгэл авсан ажилтнуудын тоо, шалтгаан", "Хэлтэс тус бүрийн шагнал/шийтгэлийн харьцуулалт"],
    },
    {
      name: "Ажлын байрны тайлан",
      description: "Нээлттэй байр, анкет, сонголт, ажилд авах процесс",
      icon: "💼",
      category: "Ажлын байрны тайлан",
      fields: ["Нээлттэй ажлын байрны тоо", "Ирсэн анкетуудын тоо", "Ярилцлага хийсэн тоо", "Амжилттай сонгогдсон тоо"],
    },
  ];

  const [reportTemplates] = useState<ReportTemplate[]>(initialTemplates);

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }
          body {
            background: white !important;
          }
          nav,
          aside,
          header,
          [role="navigation"],
          [role="banner"],
          .sidebar,
          .nav-sidebar,
          header nav,
          .fixed.inset-y-0,
          [class*="fixed"][class*="inset-y-0"],
          [class*="fixed"][class*="left-0"],
          body > div > div > aside,
          body > div > aside,
          [class*="sidebar"],
          [class*="Sidebar"],
          [class*="navigation"],
          [class*="Navigation"],
          .print\\:hidden {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            width: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
          }
          .hidden-on-screen {
            display: block !important;
          }
          a, button[type="submit"], button[type="button"] {
            text-decoration: none !important;
            color: inherit !important;
          }
          * {
            background: white !important;
            background-color: white !important;
            box-shadow: none !important;
            border-color: #e5e7eb !important;
          }
          main {
            margin-left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
        @media screen {
          .hidden-on-screen {
            display: none;
          }
        }
      `}</style>
      <main ref={componentRef} className="max-w-7xl mt-10 mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#0C213A] mb-2">Тайлан, статистик</h1>
              <p className="text-gray-600">HR системийн бүх тайлан, статистик мэдээллийг удирдах</p>
              {currentDate && (
                <div className="hidden-on-screen mt-2 text-sm text-gray-500">
                  Хэвлэсэн огноо: {currentDate}
                </div>
              )}
            </div>
            <div className="flex gap-2 print:hidden">
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
              >
                <PrinterIcon className="w-5 h-5 mr-2" />
                Хэвлэх
              </button>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {reportStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-[#0C213A]">{stat.value}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{stat.icon}</span>
                <div className={`text-sm font-medium ${stat.color}`}>{stat.change}</div>
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
              { id: "reports", name: "Тайланууд" },
              { id: "templates", name: "Загварууд" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === (tab.id as typeof activeTab)
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
              <h3 className="text-lg font-semibold text-[#0C213A]">Сүүлийн тайланууд</h3>
              <Link href="#" className="text-sm text-[#0C213A] hover:text-[#0C213A]/80">
                Бүгдийг харах
              </Link>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {reports.slice(0, 4).map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#0C213A] text-white rounded-lg flex items-center justify-center">
                        <span className="text-lg">📊</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-[#0C213A]">{report.name}</h4>
                        <p className="text-sm text-gray-600">
                          {report.type} • {report.period}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            report.status === "Дууссан" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {report.status}
                        </span>
                        {report.size && report.size !== "-" && <span className="text-xs text-gray-500">{report.size}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-[#0C213A]">Хурдан үйлдэл</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={openAddModal}
                  className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#0C213A]">Шинэ тайлан үүсгэх</h4>
                    <p className="text-sm text-gray-600">Загвар сонгоод тайлан үүсгэх</p>
                  </div>
                </button>
                <button className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#0C213A]">Статистик харах</h4>
                    <p className="text-sm text-gray-600">Дэлгэрэнгүй аналитик мэдээлэл</p>
                  </div>
                </button>
                <button className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#0C213A]">Тайлан татах</h4>
                    <p className="text-sm text-gray-600">Excel, PDF форматаар татах</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[#0C213A]">Тайлангийн жагсаалт</h3>
            <div className="flex space-x-3 text-gray-700">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C213A]"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
              <button
                onClick={openAddModal}
                className="bg-[#0C213A] text-white px-4 py-2 rounded-lg hover:bg-[#0C213A]/90 transition-colors"
              >
                Шинэ тайлан үүсгэх
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тайлангийн нэр
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Төрөл</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Огноо</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Хэмжээ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-вider">Төлөв</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-вider">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0C213A]">{report.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.period}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.size}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          report.status === "Дууссан" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => openDetailModal(report)} className="text-[#0C213A] hover:text-[#0C213A]/80">
                        Үзэх
                      </button>
                      <button onClick={() => openEditModal(report)} className="text-gray-500 hover:text-gray-700">
                        Засах
                      </button>
                      <button onClick={() => handleDownload(report)} className="text-blue-500 hover:text-blue-700">
                        Татах
                      </button>
                      <button onClick={() => handleDeleteReport(report.id)} className="text-red-500 hover:text-red-700">
                        Устгах
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "templates" && (
        <div className="space-y-6">
          {reportTemplates.map((template, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-[#0C213A]/10 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">{template.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-[#0C213A]">{template.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{template.category}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {template.fields.length} талбар
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{template.description}</p>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Тайлангийн талбарууд:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {template.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-[#0C213A] rounded-full mr-2"></span>
                      {field}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 text-gray-700">
                <button
                  onClick={() => handleCreateFromTemplate(template)}
                  className="flex-1 bg-[#0C213A] text-white py-2 px-3 rounded text-sm hover:bg-[#0C213A]/90 transition-colors"
                >
                  Үүсгэх
                </button>
                <button
                  onClick={() => openTemplateModal(template)}
                  className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                >
                  Урьдчилан харах
                </button>
                <button
                  onClick={() => openEditTemplateModal(template)}
                  className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                >
                  Засах
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      

      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-[#0C213A]">Тайлангийн дэлгэрэнгүй</h3>
              <button onClick={closeDetailModal} className="p-2 rounded-md hover:bg-gray-100">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Тайлангийн нэр</label>
                  <p className="text-sm text-gray-900">{selectedReport.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Төрөл</label>
                  <p className="text-sm text-gray-900">{selectedReport.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Хугацаа</label>
                  <p className="text-sm text-gray-900">{selectedReport.period}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Төлөв</label>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedReport.status === "Дууссан" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedReport.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Хэмжээ</label>
                  <p className="text-sm text-gray-900">{selectedReport.size}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Формат</label>
                  <p className="text-sm text-gray-900">{selectedReport.format}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Хэлтэс</label>
                  <p className="text-sm text-gray-900">{selectedReport.department}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Үүсгэсэн</label>
                  <p className="text-sm text-gray-900">{selectedReport.createdBy}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Үүсгэсэн огноо</label>
                  <p className="text-sm text-gray-900">{selectedReport.createdAt}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Сүүлд засварласан</label>
                  <p className="text-sm text-gray-900">{selectedReport.lastModified}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тайлбар</label>
                <p className="text-sm text-gray-900">{selectedReport.description}</p>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button onClick={closeDetailModal} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Хаах
                </button>
                <button className="px-4 py-2 bg-[#0C213A] text-white rounded-lg hover:bg-[#0C213A]/90 transition-colors">Татах</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 maxฮ-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-[#0C213A]">Тайлан засах</h3>
              <button onClick={closeEditModal} className="p-2 rounded-md hover:bg-gray-100">✕</button>
            </div>
            <form onSubmit={handleEditReport} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Тайлангийн нэр</label>
                  <input name="name" defaultValue={selectedReport.name} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Төрөл</label>
                  <select name="type" defaultValue={selectedReport.type} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
                    <option value="Ажилтны">Ажилтны</option>
                    <option value="Цалин">Цалин</option>
                    <option value="Гүйцэтгэл">Гүйцэтгэл</option>
                    <option value="Сургалт">Сургалт</option>
                    <option value="Шагнал">Шагнал</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Хугацаа</label>
                  <input name="period" defaultValue={selectedReport.period} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Төлөв</label>
                  <select name="status" defaultValue={selectedReport.status} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
                    <option value="Дууссан">Дууссан</option>
                    <option value="Хүлээгдэж буй">Хүлээгдэж буй</option>
                    <option value="Эхлээгүй">Эхлээгүй</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Формат</label>
                  <select name="format" defaultValue={selectedReport.format} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
                    <option value="PDF">PDF</option>
                    <option value="Excel">Excel</option>
                    <option value="Word">Word</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Хэлтэс</label>
                  <select name="department" defaultValue={selectedReport.department} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
                    <option value="HR">HR</option>
                    <option value="Санхүү">Санхүү</option>
                    <option value="IT">IT</option>
                    <option value="Маркетинг">Маркетинг</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тайлбар</label>
                <textarea name="description" defaultValue={selectedReport.description} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Цуцлах
                </button>
                <button type="submit" className="px-4 py-2 bg-[#0C213A] text-white rounded-lg hover:bg-[#0C213A]/90 transition-colors">
                  Хадгалах
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-[#0C213A]">Шинэ тайлан үүсгэх</h3>
              <button onClick={closeAddModal} className="p-2 rounded-md hover:bg-gray-100">✕</button>
            </div>
            <form onSubmit={handleAddReport} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Тайлан</label>
                  <input name="name" className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Төрөл</label>
                  <select name="type" className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" required>
                    <option value="">Сонгох</option>
                    <option value="Ажилтны">Ажилтны</option>
                    <option value="Цалин">Цалин</option>
                    <option value="Гүйцэтгэл">Гүйцэтгэл</option>
                    <option value="Сургалт">Сургалт</option>
                    <option value="Шагнал">Шагнал</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Огноо</label>
                  <input name="period" className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Формат</label>
                  <select name="format" className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" required>
                    <option value="">Сонгох</option>
                    <option value="PDF">PDF</option>
                    <option value="Excel">Excel</option>
                    <option value="Word">Word</option>
                  </select>
                </div>
                
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тайлбар</label>
                <textarea name="description" rows={3} className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" required />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Цуцлах
                </button>
                <button type="submit" className="px-4 py-2 bg-[#0C213A] text-white rounded-lg hover:bg-[#0C213A]/90 transition-colors">
                  Үүсгэх
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-[#0C213A]">Загварын урьдчилан харах</h3>
              <button onClick={closeTemplateModal} className="p-2 rounded-md hover:bg-gray-100">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-[#0C213A]/10 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">{selectedTemplate.icon}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-[#0C213A]">{selectedTemplate.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{selectedTemplate.category}</p>
                  <p className="text-sm text-gray-600 mt-2">{selectedTemplate.description}</p>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Тайлангийн талбарууд:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedTemplate.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-[#0C213A] rounded-full mr-2"></span>
                      {field}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={closeTemplateModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Хаах
                </button>
                <button
                  onClick={() => handleCreateFromTemplate(selectedTemplate)}
                  className="px-4 py-2 bg-[#0C213A] text-white rounded-lg hover:bg-[#0C213A]/90 transition-colors"
                >
                  Энэ загвараар үүсгэх
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-[#0C213A]">Загвар засах</h3>
              <button onClick={closeEditTemplateModal} className="p-2 rounded-md hover:bg-gray-100">✕</button>
            </div>
            <form onSubmit={handleEditTemplate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Нэр</label>
                  <input name="name" defaultValue={selectedTemplate.name} className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ангилал</label>
                  <input name="category" defaultValue={selectedTemplate.category} className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Икон (emoji)</label>
                  <input name="icon" defaultValue={selectedTemplate.icon} className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тайлбар</label>
                <textarea name="description" defaultValue={selectedTemplate.description} rows={3} className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Талбарууд (мөр бүрт нэг)</label>
                <textarea name="fields" defaultValue={selectedTemplate.fields.join("\n")} rows={6} className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditTemplateModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Цуцлах
                </button>
                <button type="submit" className="px-4 py-2 bg-[#0C213A] text-white rounded-lg hover:bg-[#0C213A]/90 transition-colors">
                  Хадгалах
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </main>
    </>
  );
}
