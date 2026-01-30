'use client';

import { useState, useEffect, Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNotification } from '@/providers/NotificationProvider';

interface Employee {
  id: string;
  firstName: string;
  middleName?: string;
  lastName?: string;
  employeeId: string;
  position?: {
    title: string;
  };
  department?: {
    name: string;
  };
}

interface Decision {
  id: string;
  decisionNumber: string;
  title: string;
  type: string;
  decisionDate: string;
  effectiveDate?: string;
  description: string;
  reason?: string;
  status: string;
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
}

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  decisionId?: string | null;
}

export default function DecisionModal({ isOpen, onClose, onSuccess, decisionId }: DecisionModalProps) {
  const { addNotification } = useNotification();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [currentDecision, setCurrentDecision] = useState<Decision | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    decisionNumber: '',
    title: '',
    type: '',
    employeeId: '',
    decisionDate: '',
    effectiveDate: '',
    description: '',
    reason: '',
    status: 'ACTIVE',
  });

  const isEditMode = !!decisionId;

  const decisionTypes = [
    { value: 'HIRING', label: 'Ажилд авах' },
    { value: 'PROMOTION', label: 'Дэвшүүлэх' },
    { value: 'TRANSFER', label: 'Шилжүүлэх' },
    { value: 'TERMINATION', label: 'Ажлаас хасах' },
    { value: 'SALARY_CHANGE', label: 'Цалин өөрчлөх' },
    { value: 'OTHER', label: 'Бусад' },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      if (isEditMode && decisionId) {
        fetchDecision(decisionId);
      } else {
        resetForm();
      }
    }
  }, [isOpen, decisionId, isEditMode]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/hr/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchDecision = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/hr/decisions/${id}`);
      if (response.ok) {
        const data: Decision = await response.json();
        setCurrentDecision(data);
        setFormData({
          decisionNumber: data.decisionNumber || '',
          title: data.title || '',
          type: data.type || '',
          employeeId: data.employee.id || '',
          decisionDate: data.decisionDate ? new Date(data.decisionDate).toISOString().split('T')[0] : '',
          effectiveDate: data.effectiveDate ? new Date(data.effectiveDate).toISOString().split('T')[0] : '',
          description: data.description || '',
          reason: data.reason || '',
          status: data.status || 'ACTIVE',
        });
      }
    } catch (error) {
      console.error('Error fetching decision:', error);
      addNotification('Шийдвэрийн мэдээлэл авахад алдаа гарлаа', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      decisionNumber: '',
      title: '',
      type: '',
      employeeId: '',
      decisionDate: '',
      effectiveDate: '',
      description: '',
      reason: '',
      status: 'ACTIVE',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (name === 'title' && value) {
      const lettersAndPunctuation = /^[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-()]*$/;
      if (!lettersAndPunctuation.test(value)) {
        return;
      }
      if (value.length > 0) {
        processedValue = value.charAt(0).toUpperCase() + value.slice(1);
      }
    }
    
    if ((name === 'description' || name === 'reason') && value) {
      const lettersAndPunctuation = /^[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]*$/;
      if (!lettersAndPunctuation.test(value)) {
        return;
      }
      if (value.length > 0) {
        processedValue = value.charAt(0).toUpperCase() + value.slice(1);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const generateDecisionNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const decisionNumber = `DEC-${year}${month}${day}-${random}`;
    setFormData(prev => ({ ...prev, decisionNumber }));
  };

  const getDecisionTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'HIRING': 'Ажилд авах',
      'PROMOTION': 'Дэвшүүлэх',
      'TRANSFER': 'Шилжүүлэх',
      'TERMINATION': 'Ажлаас хасах',
      'SALARY_CHANGE': 'Цалин өөрчлөх',
      'OTHER': 'Бусад',
    };
    return typeMap[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadPDF = async () => {
    if (!currentDecision) return;
    
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

      const employeeName = currentDecision.employee.middleName 
        ? `${currentDecision.employee.firstName} ${currentDecision.employee.middleName}`
        : currentDecision.employee.firstName;

      const employeePosition = currentDecision.employee.position?.title || 'Ажилтан';
      const employeeDepartment = currentDecision.employee.position?.department?.name || '';

      pdfContainer.innerHTML = `
        <div style="padding: 20mm 25mm; background-color: rgb(255, 255, 255); min-height: 257mm; box-sizing: border-box;">
          <!-- Official Document Header -->
          <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid rgb(0, 0, 0); padding-bottom: 15px;">
            <h1 style="font-size: 20px; font-weight: bold; margin: 0 0 5px 0; color: rgb(0, 0, 0); letter-spacing: 1px;">
              УДИРДЛАГЫН ШИЙДВЭР
            </h1>
            <p style="font-size: 11px; margin: 0; color: rgb(80, 80, 80);">№ ${currentDecision.decisionNumber}</p>
          </div>
          
          <!-- Main Information Section -->
          <div style="margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
              <tr>
                <td style="width: 35%; padding: 8px 10px 8px 0; font-weight: 600; color: rgb(0, 0, 0); font-size: 12px; vertical-align: top; border-bottom: 1px solid rgb(220, 220, 220);">
                  Шийдвэрийн төрөл:
                </td>
                <td style="width: 65%; padding: 8px 0; color: rgb(0, 0, 0); font-size: 12px; border-bottom: 1px solid rgb(220, 220, 220);">
                  ${getDecisionTypeLabel(currentDecision.type)}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 10px 8px 0; font-weight: 600; color: rgb(0, 0, 0); font-size: 12px; vertical-align: top; border-bottom: 1px solid rgb(220, 220, 220);">
                  Гарчиг:
                </td>
                <td style="padding: 8px 0; color: rgb(0, 0, 0); font-size: 12px; border-bottom: 1px solid rgb(220, 220, 220);">
                  ${currentDecision.title}
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
                  ${currentDecision.employee.employeeId}
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
                  ${formatDate(currentDecision.decisionDate)}
                </td>
              </tr>
              ${currentDecision.effectiveDate ? `
              <tr>
                <td style="padding: 8px 10px 8px 0; font-weight: 600; color: rgb(0, 0, 0); font-size: 12px; vertical-align: top; border-bottom: 1px solid rgb(220, 220, 220);">
                  Хэрэгжих огноо:
                </td>
                <td style="padding: 8px 0; color: rgb(0, 0, 0); font-size: 12px; border-bottom: 1px solid rgb(220, 220, 220);">
                  ${formatDate(currentDecision.effectiveDate)}
                </td>
              </tr>
              ` : ''}
            </table>
          </div>

          <!-- Description Section -->
          <div style="margin-bottom: 20px;">
            <p style="font-weight: 700; color: rgb(0, 0, 0); margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase;">Тайлбар:</p>
            <div style="padding: 15px; min-height: 80px; background-color: rgb(250, 250, 250); border: 1px solid rgb(220, 220, 220); border-radius: 4px;">
              <p style="margin: 0; color: rgb(0, 0, 0); font-size: 12px; line-height: 1.8; white-space: pre-wrap; text-align: justify;">${currentDecision.description}</p>
            </div>
          </div>

          ${currentDecision.reason ? `
          <!-- Reason Section -->
          <div style="margin-bottom: 25px;">
            <p style="font-weight: 700; color: rgb(0, 0, 0); margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase;">Шалтгаан:</p>
            <div style="padding: 15px; min-height: 60px; background-color: rgb(250, 250, 250); border: 1px solid rgb(220, 220, 220); border-radius: 4px;">
              <p style="margin: 0; color: rgb(0, 0, 0); font-size: 12px; line-height: 1.8; white-space: pre-wrap; text-align: justify;">${currentDecision.reason}</p>
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

      const fileName = `Шийдвэр_${currentDecision.decisionNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF generation error:', error);
      addNotification('PDF үүсгэхэд алдаа гарлаа', 'error');
    } finally {
      setGeneratingPDF(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = isEditMode 
        ? `/api/hr/decisions/${decisionId}`
        : '/api/hr/decisions';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Edit mode-д modal хаагдах, create mode-д modal нээлттэй үлдэх
        if (isEditMode) {
          onSuccess();
          onClose();
        } else {
          // Create mode-д зөвхөн form хоосордох, modal нээлттэй үлдэнэ
          onSuccess(); // List шинэчлэх
          resetForm();
          // Modal нээлттэй үлдэнэ - onClose() дуудахгүй
        }
      } else {
        const error = await response.json();
        addNotification(`Алдаа: ${error.message || error.error || 'Алдаа гарлаа'}`, 'error');
      }
    } catch (error) {
      console.error('Error saving decision:', error);
      addNotification(isEditMode ? 'Шийдвэр засахдаа алдаа гарлаа' : 'Шийдвэр үүсгэхэд алдаа гарлаа', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={isEditMode ? onClose : () => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6 max-h-[90vh] overflow-y-auto">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Хаах</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-4">
                      <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900">
                        {isEditMode ? 'Шийдвэрийн мэдээлэл засах' : 'Шинэ удирдлагын шийдвэр үүсгэх'}
                      </Dialog.Title>
                      {isEditMode && currentDecision && (
                        <button
                          type="button"
                          onClick={handleDownloadPDF}
                          disabled={generatingPDF}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="PDF татах"
                        >
                          {generatingPDF ? 'PDF үүсгэж байна...' : 'PDF татах'}
                        </button>
                      )}
                    </div>

                    {loading ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Шийдвэрийн дугаар *
                            </label>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                name="decisionNumber"
                                value={formData.decisionNumber}
                                onChange={handleInputChange}
                                required
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="DEC-20241201-001"
                                disabled={isEditMode}
                              />
                              {!isEditMode && (
                                <button
                                  type="button"
                                  onClick={generateDecisionNumber}
                                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                  Авто
                                </button>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Шийдвэрийн төрөл *
                            </label>
                            <select
                              name="type"
                              value={formData.type}
                              onChange={handleInputChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              <option value="">Төрөл сонгох</option>
                              {decisionTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Гарчиг *
                            </label>
                            <input
                              type="text"
                              name="title"
                              value={formData.title}
                              onChange={handleInputChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Шийдвэрийн гарчиг..."
                            />
                          </div>

                          {!isEditMode && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ажилтан *
                              </label>
                              <select
                                name="employeeId"
                                value={formData.employeeId}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                <option value="">Ажилтан сонгох</option>
                                {employees.map((employee) => {
                                  const fullName = employee.middleName 
                                    ? `${employee.firstName} ${employee.middleName}`
                                    : employee.firstName;
                                  return (
                                    <option key={employee.id} value={employee.id}>
                                      {fullName} ({employee.employeeId}) - {employee.position?.title || 'Ажилтан'}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Шийдвэр гарсан огноо *
                            </label>
                            <input
                              type="date"
                              name="decisionDate"
                              value={formData.decisionDate}
                              onChange={handleInputChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Хэрэгжих огноо
                            </label>
                            <input
                              type="date"
                              name="effectiveDate"
                              value={formData.effectiveDate}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>

                          {isEditMode && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Төлөв
                              </label>
                              <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                <option value="PENDING">Хүлээгдэж буй</option>
                                <option value="ACTIVE">Идэвхтэй</option>
                                <option value="CANCELLED">Цуцлагдсан</option>
                              </select>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Тайлбар *
                          </label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Шийдвэрийн дэлгэрэнгүй тайлбар..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Шалтгаан
                          </label>
                          <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Шийдвэр гаргасан шалтгаан..."
                          />
                        </div>

                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm"
                          >
                            Цуцлах
                          </button>
                          <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {submitting 
                              ? (isEditMode ? 'Хадгалж байна...' : 'Үүсгэж байна...') 
                              : (isEditMode ? 'Хадгалах' : 'Шийдвэр үүсгэх')}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

