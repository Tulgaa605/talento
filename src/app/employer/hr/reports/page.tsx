"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { useReactToPrint } from 'react-to-print';
import { PrinterIcon } from '@heroicons/react/24/outline';
import { StatsSkeleton, PageHeaderSkeleton, CardSkeleton } from "@/components/Skeletons";

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
  createdAt: string;
  lastModified: string;
  format: "PDF" | "Excel" | "Word" | string;
  department: "HR" | "Санхүү" | "IT" | "Маркетинг" | string;
}

interface ReportTemplate {
  name: string;
  description: string;
  icon: string;
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
  const [loading, setLoading] = useState(true);
  const componentRef = useRef<HTMLDivElement>(null);

  const [showStatisticsModal, setShowStatisticsModal] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [loadingStatistics, setLoadingStatistics] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

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

  // const now = new Date();
  // const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  // const totalReports = reports.length;
  // const thisMonthReports = reports.filter((r) => String(r.createdAt).startsWith(monthKey)).length;
  // const doneReports = reports.filter((r) => r.status === "Дууссан").length;
  // const pendingReports = reports.filter((r) => r.status === "Хүлээгдэж буй").length;

  // const reportStats = [
  //   { label: "Нийт тайлан", value: String(totalReports), change: "", color: "text-blue-600", icon: "📊" },
  //   { label: "Энэ сар тайлан", value: String(thisMonthReports), change: "", color: "text-green-600", icon: "📈" },
  //   { label: "Экспорт хийсэн", value: String(doneReports), change: "", color: "text-purple-600", icon: "💾" },
  //   { label: "Хүлээгдэж буй", value: String(pendingReports), change: "", color: "text-orange-600", icon: "⏳" },
  // ] as const;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/hr/reports");
        if (!res.ok) return;
        const data: unknown = await res.json();
        if (Array.isArray(data)) {
          setReports(data as Report[]);
        }
      } catch {
      } finally {
        setLoading(false);
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

  const handleDownload = async (report: Report) => {
    try {
      // Generate report based on report type - more specific matching
      let type = 'all';
      const reportTypeLower = report.type?.toLowerCase() || '';
      
      if (reportTypeLower.includes('ажилтны') || reportTypeLower.includes('ажилтан') || reportTypeLower === 'ажилтны') {
        type = 'employees';
      } else if (reportTypeLower.includes('цалин') || reportTypeLower.includes('гэрээ') || reportTypeLower === 'цалин') {
        type = 'contracts';
      } else if (reportTypeLower.includes('хэлтэс') || reportTypeLower === 'хэлтэс') {
        type = 'departments';
      } else {
        // Default to summary report if type doesn't match
        type = 'all';
      }

      const format = report.format?.toLowerCase() === 'excel' || report.format?.toLowerCase() === 'csv' ? 'excel' : 
                     report.format?.toLowerCase() === 'json' ? 'json' : 'excel';
      
      const url = `/api/hr/reports/download?type=${type}&format=${format}&reportName=${encodeURIComponent(report.name)}&period=${encodeURIComponent(report.period || '')}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      
      // Use report name and period for filename
      const fileExtension = format === 'excel' ? 'csv' : format;
      const safeReportName = report.name.replace(/[^a-zA-Z0-9а-яА-ЯёЁ\s]/g, '_').replace(/\s+/g, '_');
      const filename = `${safeReportName}_${report.period || new Date().toISOString().split('T')[0]}.${fileExtension}`;
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Тайлан татахад алдаа гарлаа');
    }
  };

  const handleDownloadReportDetails = async (report: Report) => {
    try {
      console.log('Downloading report details for:', report.name);
      
      // Download as Word document
      const response = await fetch(`/api/hr/reports/${report.id}/download-word`);
      
      if (!response.ok) {
        throw new Error('Word файл татахад алдаа гарлаа');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      
      const safeReportName = (report.name || 'Тайлан')
        .replace(/[^a-zA-Z0-9а-яА-ЯёЁ\s]/g, '_')
        .replace(/\s+/g, '_')
        .substring(0, 50);
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `${safeReportName}_дэлгэрэнгүй_${dateStr}.docx`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      
      console.log('Report details downloaded successfully');
    } catch (error) {
      console.error('Error downloading report details:', error);
      alert('Тайлангийн дэлгэрэнгүй татахад алдаа гарлаа');
    }
  };

  const handleDownloadAllReportsDetails = () => {
    try {
      if (reports.length === 0) {
        alert('Татах тайлан байхгүй байна');
        return;
      }

      const csvRows = [
        'Тайлангийн нэр,Төрөл,Хугацаа,Төлөв,Хэмжээ,Формат,Хэлтэс,Үүсгэсэн,Үүсгэсэн огноо,Сүүлд засварласан,Тайлбар'
      ];

      reports.forEach((report) => {
        const row = [
          report.name,
          report.type,
          report.period,
          report.status,
          report.size,
          report.format,
          report.department,
          report.createdBy,
          report.createdAt,
          report.lastModified,
          `"${(report.description || '').replace(/"/g, '""')}"`
        ].join(',');
        csvRows.push(row);
      });

      const csvContent = csvRows.join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      
      const filename = `Бүх_тайлангийн_дэлгэрэнгүй_${new Date().toISOString().split('T')[0]}.csv`;
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading all reports details:', error);
      alert('Бүх тайлангийн дэлгэрэнгүй татахад алдаа гарлаа');
    }
  };

  const openStatisticsModal = async () => {
    setShowStatisticsModal(true);
    setLoadingStatistics(true);
    try {
      const res = await fetch('/api/hr/reports/statistics');
      if (res.ok) {
        const data = await res.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoadingStatistics(false);
    }
  };

  const closeStatisticsModal = () => {
    setShowStatisticsModal(false);
    setStatistics(null);
  };

  const openDownloadModal = () => {
    setShowDownloadModal(true);
  };

  const closeDownloadModal = () => {
    setShowDownloadModal(false);
  };

  const handleDownloadReport = async (type: string, format: string) => {
    try {
      const url = `/api/hr/reports/download?type=${type}&format=${format}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = response.headers.get('Content-Disposition')?.split("filename*=UTF-8''")[1] || `report.${format === 'excel' ? 'csv' : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      closeDownloadModal();
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Тайлан татахад алдаа гарлаа');
    }
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
    // Modal алга болохгүй, зөвхөн form хоосордох
    e.currentTarget.reset();
    try {
      void fetch("/api/hr/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReport),
      });
    // closeAddModal(); - Modal нээлттэй үлдэнэ
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

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
          </div>
        </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      </div> */}

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", name: "Хянах самбар" },
              { id: "reports", name: "Тайланууд" },
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
              <button 
                onClick={() => setActiveTab("reports")}
                className="text-sm text-[#0C213A] hover:text-[#0C213A]/80 cursor-pointer"
              >
                Бүгдийг харах
              </button>
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
                <button 
                  onClick={openStatisticsModal}
                  className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
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
                <button 
                  onClick={openDownloadModal}
                  className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
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
                      <button onClick={() => handleDownloadReportDetails(report)} className="text-blue-500 hover:text-blue-700" title="Тайлангийн дэлгэрэнгүй татах">
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
                <button 
                  onClick={() => selectedReport && handleDownloadReportDetails(selectedReport)}
                  className="px-4 py-2 bg-[#0C213A] text-white rounded-lg hover:bg-[#0C213A]/90 transition-colors"
                >
                  Татах
                </button>
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
                  <input name="name" defaultValue={selectedReport.name} className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Төрөл</label>
                  <select name="type" defaultValue={selectedReport.type} className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" required>
                    <option value="Ажилтны">Ажилтны</option>
                    <option value="Цалин">Цалин</option>
                    <option value="Гүйцэтгэл">Гүйцэтгэл</option>
                    <option value="Сургалт">Сургалт</option>
                    <option value="Шагнал">Шагнал</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Хугацаа</label>
                  <input name="period" defaultValue={selectedReport.period} className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Төлөв</label>
                  <select name="status" defaultValue={selectedReport.status} className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" required>
                    <option value="Дууссан">Дууссан</option>
                    <option value="Хүлээгдэж буй">Хүлээгдэж буй</option>
                    <option value="Эхлээгүй">Эхлээгүй</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Формат</label>
                  <select name="format" defaultValue={selectedReport.format} className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" required>
                    <option value="PDF">PDF</option>
                    <option value="Excel">Excel</option>
                    <option value="Word">Word</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Хэлтэс</label>
                  <select name="department" defaultValue={selectedReport.department} className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" required>
                    <option value="HR">HR</option>
                    <option value="Санхүү">Санхүү</option>
                    <option value="IT">IT</option>
                    <option value="Маркетинг">Маркетинг</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тайлбар</label>
                <textarea name="description" defaultValue={selectedReport.description} rows={3} className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" required />
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

      {showStatisticsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-[#0C213A]">Статистик мэдээлэл</h3>
              <button onClick={closeStatisticsModal} className="p-2 rounded-md hover:bg-gray-100">
                ✕
              </button>
            </div>
            <div className="p-6">
              {loadingStatistics ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0C213A]"></div>
                </div>
              ) : statistics ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-sm text-gray-600 mb-1">Нийт ажилтан</p>
                      <p className="text-2xl font-bold text-[#0C213A]">{statistics.overview?.totalEmployees || 0}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-sm text-gray-600 mb-1">Идэвхтэй</p>
                      <p className="text-2xl font-bold text-[#0C213A]">{statistics.overview?.activeEmployees || 0}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="text-sm text-gray-600 mb-1">Идэвхгүй</p>
                      <p className="text-2xl font-bold text-[#0C213A]">{statistics.overview?.inactiveEmployees || 0}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <p className="text-sm text-gray-600 mb-1">Хэлтэс</p>
                      <p className="text-2xl font-bold text-[#0C213A]">{statistics.overview?.totalDepartments || 0}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-[#0C213A] mb-3">Гэрээний статистик</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Идэвхтэй:</span>
                          <span className="font-medium text-gray-900">{statistics.contracts?.active || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Хугацаа дууссан:</span>
                          <span className="font-medium text-gray-900">{statistics.contracts?.expired || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Цуцлагдсан:</span>
                          <span className="font-medium text-gray-900">{statistics.contracts?.terminated || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-[#0C213A] mb-3">Шидвэрийн статистик</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ноорог:</span>
                          <span className="font-medium text-gray-900">{statistics.decisions?.draft || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Идэвхтэй:</span>
                          <span className="font-medium text-gray-900">{statistics.decisions?.active || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Цуцлагдсан:</span>
                          <span className="font-medium text-gray-900">{statistics.decisions?.revoked || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {statistics.employeesByDepartment && statistics.employeesByDepartment.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-[#0C213A] mb-3">Хэлтэсээр ажилтнууд</h4>
                      <div className="space-y-2">
                        {statistics.employeesByDepartment.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-gray-600">{item.departmentName}</span>
                            <span className="font-medium text-gray-900">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {statistics.recentHires && statistics.recentHires.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-[#0C213A] mb-3">Сүүлийн 3 сард ажилд орсон</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {statistics.recentHires.map((emp: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">{emp.name} ({emp.employeeId})</span>
                            <span className="text-gray-500">{emp.hireDate}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">Статистик мэдээлэл олдсонгүй</div>
              )}
              <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  onClick={closeStatisticsModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Хаах
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-[#0C213A]">Тайлан татах</h3>
              <button onClick={closeDownloadModal} className="p-2 rounded-md hover:bg-gray-100">
                ✕
              </button>
            </div>
            <div className="p-6">
              {reports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Үүсгэсэн тайлан байхгүй байна</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">Татах тайлангаа сонгоно уу:</p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-[#0C213A]">{report.name}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span>{report.type}</span>
                            <span>•</span>
                            <span>{report.period}</span>
                            <span>•</span>
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                report.status === "Дууссан" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {report.status}
                            </span>
                          </div>
                          {report.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{report.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            handleDownloadReportDetails(report);
                            closeDownloadModal();
                          }}
                          className="ml-4 px-4 py-2 bg-[#0C213A] text-white rounded-lg hover:bg-[#0C213A]/90 transition-colors text-sm whitespace-nowrap"
                        >
                          Татах
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  onClick={closeDownloadModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Хаах
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </main>
    </>
  );
}
