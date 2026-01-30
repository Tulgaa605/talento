'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { 
  TrashIcon, 
  DocumentCheckIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UserIcon,
  CalendarIcon,
  ClipboardDocumentCheckIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { TableSkeleton, PageHeaderSkeleton, SearchBarSkeleton, ListSkeleton } from '@/components/Skeletons';
import DecisionModal from '@/components/DecisionModal';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNotification } from '@/providers/NotificationProvider';

interface Decision {
  id: string;
  decisionNumber: string;
  title: string;
  description: string;
  type: string;
  employee: {
    id: string;
    firstName: string;
    middleName?: string;
    lastName?: string;
    employeeId: string;
    position?: {
      title: string;
      department?: {
        name: string;
      };
    };
  };
  decisionDate: string;
  effectiveDate?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  reason?: string;
}

export default function DecisionsPage() {
  const { addNotification } = useNotification();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDecisionId, setEditingDecisionId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    fetchDecisions();
  }, []);

  const fetchDecisions = async () => {
    try {
      const response = await fetch('/api/hr/decisions');
      if (response.ok) {
        const data = await response.json();
        setDecisions(data);
      }
    } catch (error) {
      console.error('Error fetching decisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDecisions = decisions.filter(decision => {
    const employeeName = [
      decision.employee.firstName,
      decision.employee.middleName,
      decision.employee.lastName
    ].filter(Boolean).join(' ').toLowerCase();
    
    const matchesSearch = 
      decision.decisionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      decision.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employeeName.includes(searchTerm.toLowerCase()) ||
      decision.employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || decision.status === statusFilter;
    const matchesType = typeFilter === '' || decision.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDelete = async (decisionId: string) => {
    if (confirm('Энэ шийдвэрийг устгахдаа итгэлтэй байна уу?')) {
      try {
        const response = await fetch(`/api/hr/decisions/${decisionId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          addNotification('Шийдвэр амжилттай устгагдлаа', 'success');
          fetchDecisions();
        } else {
          const error = await response.json();
          addNotification(error.error || 'Алдаа гарлаа', 'error');
        }
      } catch (error) {
        console.error('Шийдвэр устгахад алдаа гарлаа:', error);
        addNotification('Алдаа гарлаа', 'error');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('mn-MN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDecisionTypeLabel = (type: string) => {
    switch (type) {
      case 'HIRING':
        return 'Ажилд авах';
      case 'PROMOTION':
        return 'Дэвшүүлэх';
      case 'TRANSFER':
        return 'Шилжүүлэх';
      case 'TERMINATION':
        return 'Ажлаас хасах';
      case 'SALARY_CHANGE':
        return 'Цалин өөрчлөх';
      case 'OTHER':
        return 'Бусад';
      default:
        return type;
    }
  };

  const handleOpenNewModal = () => {
    setEditingDecisionId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (decisionId: string) => {
    setEditingDecisionId(decisionId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDecisionId(null);
  };

  const handleModalSuccess = () => {
    fetchDecisions();
  };

  const handleOpenDetailModal = async (decisionId: string) => {
    setLoadingDetail(true);
    setShowDetailModal(true);
    try {
      const response = await fetch(`/api/hr/decisions/${decisionId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedDecision(data);
      } else {
        addNotification('Шийдвэрийн мэдээлэл авахад алдаа гарлаа', 'error');
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Error fetching decision:', error);
      addNotification('Шийдвэрийн мэдээлэл авахад алдаа гарлаа', 'error');
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedDecision(null);
  };

  const formatDateForPDF = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generatePDFForDecision = async (decision: Decision) => {
    setGeneratingPDF(true);
    try {
      const pdfContainer = document.createElement('div');
      pdfContainer.style.width = '210mm';
      pdfContainer.style.minHeight = '297mm';
      pdfContainer.style.backgroundColor = '#ffffff';
      pdfContainer.style.fontFamily = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.top = '0';
      pdfContainer.style.boxSizing = 'border-box';
      document.body.appendChild(pdfContainer);

      const employeeName = decision.employee.middleName 
        ? `${decision.employee.firstName} ${decision.employee.middleName}`
        : decision.employee.firstName;

      const employeePosition = decision.employee.position?.title || 'Ажилтан';
      const employeeDepartment = decision.employee.position?.department?.name || '';

      pdfContainer.innerHTML = `
        <div style="padding: 20mm 25mm; background-color: rgb(255, 255, 255); min-height: 257mm; box-sizing: border-box;">
          <!-- Official Document Header -->
          <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid rgb(0, 0, 0); padding-bottom: 15px;">
            <h1 style="font-size: 20px; font-weight: bold; margin: 0 0 5px 0; color: rgb(0, 0, 0); letter-spacing: 1px;">
              УДИРДЛАГЫН ШИЙДВЭР
            </h1>
            <p style="font-size: 11px; margin: 0; color: rgb(80, 80, 80);">№ ${decision.decisionNumber}</p>
          </div>
          
          <!-- Main Information Section -->
          <div style="margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
              <tr>
                <td style="width: 35%; padding: 8px 10px 8px 0; font-weight: 600; color: rgb(0, 0, 0); font-size: 12px; vertical-align: top; border-bottom: 1px solid rgb(220, 220, 220);">
                  Шийдвэрийн төрөл:
                </td>
                <td style="width: 65%; padding: 8px 0; color: rgb(0, 0, 0); font-size: 12px; border-bottom: 1px solid rgb(220, 220, 220);">
                  ${getDecisionTypeLabel(decision.type)}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 10px 8px 0; font-weight: 600; color: rgb(0, 0, 0); font-size: 12px; vertical-align: top; border-bottom: 1px solid rgb(220, 220, 220);">
                  Гарчиг:
                </td>
                <td style="padding: 8px 0; color: rgb(0, 0, 0); font-size: 12px; border-bottom: 1px solid rgb(220, 220, 220);">
                  ${decision.title}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 10px 8px 0; font-weight: 600; color: rgb(0, 0, 0); font-size: 12px; vertical-align: top; border-bottom: 1px solid rgb(220, 220, 220);">
                  Ажилтны нэр:
                </td>
                <td style="padding: 8px 0; color: rgb(0, 0, 0); font-size: 12px; border-bottom: 1px solid rgb(220, 220, 220);">
                  ${employeeName}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 10px 8px 0; font-weight: 600; color: rgb(0, 0, 0); font-size: 12px; vertical-align: top; border-bottom: 1px solid rgb(220, 220, 220);">
                  Ажилтны дугаар:
                </td>
                <td style="padding: 8px 0; color: rgb(0, 0, 0); font-size: 12px; border-bottom: 1px solid rgb(220, 220, 220);">
                  ${decision.employee.employeeId}
                </td>
              </tr>
              ${employeeDepartment ? `
              <tr>
                <td style="padding: 8px 10px 8px 0; font-weight: 600; color: rgb(0, 0, 0); font-size: 12px; vertical-align: top; border-bottom: 1px solid rgb(220, 220, 220);">
                  Хэлтэс/Газар:
                </td>
                <td style="padding: 8px 0; color: rgb(0, 0, 0); font-size: 12px; border-bottom: 1px solid rgb(220, 220, 220);">
                  ${employeeDepartment}
                </td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 10px 8px 0; font-weight: 600; color: rgb(0, 0, 0); font-size: 12px; vertical-align: top; border-bottom: 1px solid rgb(220, 220, 220);">
                  Албан тушаал:
                </td>
                <td style="padding: 8px 0; color: rgb(0, 0, 0); font-size: 12px; border-bottom: 1px solid rgb(220, 220, 220);">
                  ${employeePosition}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 10px 8px 0; font-weight: 600; color: rgb(0, 0, 0); font-size: 12px; vertical-align: top; border-bottom: 1px solid rgb(220, 220, 220);">
                  Шийдвэр гарсан огноо:
                </td>
                <td style="padding: 8px 0; color: rgb(0, 0, 0); font-size: 12px; border-bottom: 1px solid rgb(220, 220, 220);">
                  ${formatDateForPDF(decision.decisionDate)}
                </td>
              </tr>
              ${decision.effectiveDate ? `
              <tr>
                <td style="padding: 8px 10px 8px 0; font-weight: 600; color: rgb(0, 0, 0); font-size: 12px; vertical-align: top; border-bottom: 1px solid rgb(220, 220, 220);">
                  Хэрэгжих огноо:
                </td>
                <td style="padding: 8px 0; color: rgb(0, 0, 0); font-size: 12px; border-bottom: 1px solid rgb(220, 220, 220);">
                  ${formatDateForPDF(decision.effectiveDate)}
                </td>
              </tr>
              ` : ''}
            </table>
          </div>

          <!-- Description Section -->
          <div style="margin-bottom: 20px;">
            <p style="font-weight: 700; color: rgb(0, 0, 0); margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase;">Тайлбар:</p>
            <div style="padding: 15px; min-height: 80px; background-color: rgb(250, 250, 250); border: 1px solid rgb(220, 220, 220); border-radius: 4px;">
              <p style="margin: 0; color: rgb(0, 0, 0); font-size: 12px; line-height: 1.8; white-space: pre-wrap; text-align: justify;">${decision.description}</p>
            </div>
          </div>

          ${decision.reason ? `
          <!-- Reason Section -->
          <div style="margin-bottom: 25px;">
            <p style="font-weight: 700; color: rgb(0, 0, 0); margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase;">Шалтгаан:</p>
            <div style="padding: 15px; min-height: 60px; background-color: rgb(250, 250, 250); border: 1px solid rgb(220, 220, 220); border-radius: 4px;">
              <p style="margin: 0; color: rgb(0, 0, 0); font-size: 12px; line-height: 1.8; white-space: pre-wrap; text-align: justify;">${decision.reason}</p>
            </div>
          </div>
          ` : ''}

          <!-- Signatures Section -->
          <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid rgb(200, 200, 200);">
            <div style="display: flex; justify-content: space-between; gap: 30px; margin-bottom: 40px;">
              <!-- Director Signature -->
              <div style="flex: 1; text-align: center;">
                <div style="margin-bottom: 8px;">
                  <p style="font-weight: 600; color: rgb(0, 0, 0); margin: 0; font-size: 11px;">ГҮЙЦЭТГЭХ ЗАХИРАЛ</p>
                </div>
                <div style="min-height: 60px; margin-bottom: 5px; background-color: rgb(255, 255, 255); position: relative;">
                  <div style="position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); width: 80%; border-top: 1px dashed rgb(150, 150, 150);"></div>
                </div>
                <p style="font-size: 10px; color: rgb(100, 100, 100); margin: 0;">(Гарын үсэг)</p>
              </div>

              <!-- HR Manager Signature -->
              <div style="flex: 1; text-align: center;">
                <div style="margin-bottom: 8px;">
                  <p style="font-weight: 600; color: rgb(0, 0, 0); margin: 0; font-size: 11px;">ХҮНИЙ НӨӨЦИЙН МЕНЕЖЕР</p>
                </div>
                <div style="min-height: 60px; margin-bottom: 5px; background-color: rgb(255, 255, 255); position: relative;">
                  <div style="position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); width: 80%; border-top: 1px dashed rgb(150, 150, 150);"></div>
                </div>
                <p style="font-size: 10px; color: rgb(100, 100, 100); margin: 0;">(Гарын үсэг)</p>
              </div>
            </div>

            <!-- Employee Signature -->
            <div style="text-align: center; margin-top: 30px;">
              <div style="margin-bottom: 8px;">
                <p style="font-weight: 600; color: rgb(0, 0, 0); margin: 0; font-size: 11px;">АЖИЛТАН</p>
              </div>
              <div style="display: inline-block; width: 300px;">
                <div style="min-height: 60px; margin-bottom: 5px; background-color: rgb(255, 255, 255); position: relative;">
                  <div style="position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); width: 80%; border-top: 1px dashed rgb(150, 150, 150);"></div>
                </div>
                <p style="font-size: 10px; color: rgb(100, 100, 100); margin: 0;">(Гарын үсэг)</p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 15px; border-top: 1px solid rgb(200, 200, 200); text-align: center;">
            <p style="font-size: 10px; color: rgb(120, 120, 120); margin: 0;">
              Энэхүү шийдвэр нь албан ёсны баримт бичиг бөгөөд хуулийн хүчинтэй байна.
            </p>
            <p style="font-size: 9px; color: rgb(150, 150, 150); margin: 5px 0 0 0;">
              Хэвлэсэн огноо: ${new Date().toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      `;

      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: pdfContainer.scrollWidth,
        height: pdfContainer.scrollHeight,
        allowTaint: true,
        removeContainer: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      document.body.removeChild(pdfContainer);

      const fileName = `Шийдвэр_${decision.decisionNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF generation error:', error);
      addNotification('PDF үүсгэхэд алдаа гарлаа', 'error');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedDecision) return;
    await generatePDFForDecision(selectedDecision);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <PageHeaderSkeleton />
        <SearchBarSkeleton />
        <ListSkeleton count={8} />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8 sm:mt-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Удирдлагын шийдвэрүүд</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Удирдлагын шийдвэрийн жагсаалт болон удирдлага
              </p>
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
            <div className="flex gap-2 print:hidden">
              <button
                onClick={handleOpenNewModal}
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Шинэ шийдвэр</span>
                <span className="sm:hidden">Шинэ</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Хайх
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Шийдвэрийн дугаар, гарчиг..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 text-gray-700 focus:border-blue-500 w-full text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Төлөв
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Бүгд</option>
                <option value="ACTIVE">Идэвхтэй</option>
                <option value="PENDING">Хүлээгдэж буй</option>
                <option value="CANCELLED">Цуцлагдсан</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Шийдвэрийн төрөл
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Бүгд</option>
                <option value="HIRING">Ажилд авах</option>
                <option value="PROMOTION">Дэвшүүлэх</option>
                <option value="TRANSFER">Шилжүүлэх</option>
                <option value="TERMINATION">Ажлаас халах</option>
                <option value="SALARY_CHANGE">Цалин өөрчлөх</option>
                <option value="OTHER">Бусад</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setTypeFilter('');
                }}
                className="w-full px-3 sm:px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm"
              >
                Цэвэрлэх
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredDecisions.map((decision) => (
            <div key={decision.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center min-w-0 flex-1">
                    <ClipboardDocumentCheckIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mr-2 sm:mr-3 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {decision.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {decision.decisionNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1 sm:space-x-2 ml-2">
                    <button
                      onClick={() => handleOpenDetailModal(decision.id)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Үзэх"
                    >
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const response = await fetch(`/api/hr/decisions/${decision.id}`);
                          if (response.ok) {
                            const decisionData = await response.json();
                            await generatePDFForDecision(decisionData);
                          } else {
                            addNotification('Шийдвэрийн мэдээлэл авахад алдаа гарлаа', 'error');
                          }
                        } catch (error) {
                          console.error('Error fetching decision for PDF:', error);
                          addNotification('PDF үүсгэхэд алдаа гарлаа', 'error');
                        }
                      }}
                      className="text-purple-600 hover:text-purple-900 p-1"
                      title="PDF татах"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(decision.id)}
                      className="text-green-600 hover:text-green-900 p-1"
                      title="Засах"
                    >
                      <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(decision.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Устгах"
                    >
                      <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>

                {decision.description && (
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                    {decision.description}
                  </p>
                )}

                <div className="mb-3 sm:mb-4">
                  <div className="flex items-center mb-2">
                    <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {decision.employee.firstName && decision.employee.middleName
                          ? `${decision.employee.firstName} ${decision.employee.middleName}`
                          : decision.employee.lastName || decision.employee.firstName}
                      </p>
                      <p className="text-xs text-gray-500">{decision.employee.employeeId}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-1 sm:mr-2 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Төрөл</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getDecisionTypeLabel(decision.type)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center">
                      <DocumentCheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-1 sm:mr-2 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Төлөв</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(decision.status)}`}>
                          {decision.status === 'ACTIVE' ? 'Идэвхтэй' : 
                           decision.status === 'PENDING' ? 'Хүлээгдэж буй' : 
                           decision.status === 'CANCELLED' ? 'Цуцлагдсан' : decision.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3 sm:mb-4">
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Шийдвэр гарсан огноо</p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">{formatDate(decision.decisionDate)}</p>
                  {decision.effectiveDate && (
                    <>
                      <p className="text-xs sm:text-sm text-gray-500 mt-2 mb-1">Хэрэгжих огноо</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">{formatDate(decision.effectiveDate)}</p>
                    </>
                  )}
                </div>

                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Үүсгэсэн: {formatDate(decision.createdAt)}
                    </span>
                    <button
                      onClick={() => handleOpenDetailModal(decision.id)}
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Дэлгэрэнгүй харах →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDecisions.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <ClipboardDocumentCheckIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <div className="text-sm sm:text-base text-gray-500">
              {searchTerm || statusFilter || typeFilter ? 'Хайлтын үр дүн олдсонгүй' : 'Шийдвэр олдсонгүй'}
            </div>
          </div>
        )}
      </div>

    <DecisionModal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      onSuccess={handleModalSuccess}
      decisionId={editingDecisionId}
    />

    {showDetailModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <h3 className="text-lg font-semibold text-[#0C213A]">
              {selectedDecision ? selectedDecision.title : 'Шийдвэрийн дэлгэрэнгүй'}
            </h3>
            <button
              onClick={handleCloseDetailModal}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="overflow-y-auto flex-1 p-6">
            {loadingDetail ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : selectedDecision ? (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500">Шийдвэрийн дугаар</p>
                  <p className="text-base font-medium text-gray-900">{selectedDecision.decisionNumber}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Шийдвэрийн төрөл</p>
                    <p className="text-base font-medium text-gray-900">
                      {getDecisionTypeLabel(selectedDecision.type)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Төлөв</p>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedDecision.status)}`}>
                      {selectedDecision.status === 'ACTIVE' ? 'Идэвхтэй' : 
                       selectedDecision.status === 'PENDING' ? 'Хүлээгдэж буй' : 
                       selectedDecision.status === 'CANCELLED' ? 'Цуцлагдсан' : selectedDecision.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Шийдвэр гарсан огноо</p>
                    <p className="text-base font-medium text-gray-900">
                      {formatDate(selectedDecision.decisionDate)}
                    </p>
                  </div>

                  {selectedDecision.effectiveDate && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Хэрэгжих огноо</p>
                      <p className="text-base font-medium text-gray-900">
                        {formatDate(selectedDecision.effectiveDate)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Ажилтны мэдээлэл</h4>
                  <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Нэр</p>
                      <p className="text-base font-medium text-gray-900">
                        {selectedDecision.employee.firstName && selectedDecision.employee.middleName
                          ? `${selectedDecision.employee.firstName} ${selectedDecision.employee.middleName}`
                          : selectedDecision.employee.lastName || selectedDecision.employee.firstName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Ажилтны дугаар</p>
                      <p className="text-base font-medium text-gray-900">
                        {selectedDecision.employee.employeeId}
                      </p>
                    </div>
                    {selectedDecision.employee.position && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Албан тушаал</p>
                        <p className="text-base font-medium text-gray-900">
                          {selectedDecision.employee.position.title}
                        </p>
                      </div>
                    )}
                    {selectedDecision.employee.position?.department && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Хэлтэс</p>
                        <p className="text-base font-medium text-gray-900">
                          {selectedDecision.employee.position.department.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Тайлбар</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedDecision.description}</p>
                  </div>
                </div>

                {selectedDecision.reason && (
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Шалтгаан</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedDecision.reason}</p>
                    </div>
                  </div>
                )}

                {selectedDecision.createdAt && (
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Систем мэдээлэл</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Үүсгэсэн огноо</p>
                        <p className="text-gray-700">
                          {new Date(selectedDecision.createdAt).toLocaleString('mn-MN')}
                        </p>
                      </div>
                      {selectedDecision.updatedAt && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Сүүлд шинэчилсэн</p>
                          <p className="text-gray-700">
                            {new Date(selectedDecision.updatedAt).toLocaleString('mn-MN')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Шийдвэр олдсонгүй</p>
              </div>
            )}
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
            <button
              onClick={handleCloseDetailModal}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              Хаах
            </button>
            {selectedDecision && (
              <>
                <button
                  onClick={handleDownloadPDF}
                  disabled={generatingPDF}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  {generatingPDF ? 'PDF үүсгэж байна...' : 'PDF татах'}
                </button>
                <button
                  onClick={() => {
                    handleCloseDetailModal();
                    handleOpenEditModal(selectedDecision.id);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Засах
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
