'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import { PrinterIcon } from '@heroicons/react/24/outline';
import { useReactToPrint } from 'react-to-print';


export default function NewDepartmentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Шинэ_хэлтэс_${new Date().getTime()}`,
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
  const generateCode = () => {
    const current = formData.code;
    const match = current.match(/^DD(\d{5})$/);
    const nextNumber = match ? parseInt(match[1], 10) + 1 : 1;
    const code = `DD${String(nextNumber).padStart(5, '0')}`;
    setFormData(prev => ({ ...prev, code }));
  };

  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   const { name, value } = e.target;
  //   let processedValue = value;
    
  //   // Нэр талбар - зөвхөн үсэг, зай, тэмдэглэгээ, эхний үсэг том
  //   if (name === 'name' && value) {
  //     const lettersOnly = /^[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-()]*$/;
  //     if (!lettersOnly.test(value)) {
  //       return;
  //     }
      
  //     // Эхний үсгийг том үсэг болгох
  //     if (value.length > 0) {
  //       processedValue = value.charAt(0).toUpperCase() + value.slice(1);
  //     }
  //   }
    
  //   // Тайлбар талбар - зөвхөн үсэг, зай, тэмдэглэгээ, эхний үсэг том
  //   if (name === 'description' && value) {
  //     const lettersOnly = /^[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]*$/;
  //     if (!lettersOnly.test(value)) {
  //       return;
  //     }
      
  //     // Эхний үсгийг том үсэг болгох
  //     if (value.length > 0) {
  //       processedValue = value.charAt(0).toUpperCase() + value.slice(1);
  //     }
  //   }
    
  //   setFormData(prev => ({
  //     ...prev,
  //     [name]: processedValue
  //   }));
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/hr/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Алдаа гарлаа');
      }

      router.push('/employer/hr/departments');
    } catch (error) {
      console.error('Алдаа:', error);
      alert(error instanceof Error ? error.message : 'Алдаа гарлаа');
    } finally {
      setIsLoading(false);
    }
  };

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
          a, button {
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
      <div ref={componentRef} className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Буцах
            </button>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <Building2 className="w-8 h-8 text-blue-600 mr-3" />
                  <h1 className="text-3xl font-bold text-gray-900">
                    Шинэ хэлтэс нэмэх
                  </h1>
                </div>
                {currentDate && (
                  <div className="hidden-on-screen mt-2 text-sm text-gray-500">
                    Хэвлэсэн огноо: {currentDate}
                  </div>
                )}
              </div>
              <button
                onClick={handlePrint}
                className="print:hidden flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <PrinterIcon className="w-5 h-5 mr-2" />
                PDF Хэвлэх
              </button>
            </div>
          </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Хэлтсийн нэр *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Зөвхөн үсэг, тэмдэглэгээ
                    const lettersAndPunctuation = /^[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-()]*$/;
                    if (!lettersAndPunctuation.test(value)) {
                      return;
                    }
                    const capitalized = value.length > 0 
                      ? value.charAt(0).toUpperCase() + value.slice(1)
                      : value;
                    setFormData(prev => ({ ...prev, name: capitalized }));
                  }}
                  pattern="[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-()]+"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Жишээ: Хүний нөөцийн хэлтэс"
                />
              </div>

              {/* Код */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Код *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Жишээ: DD00001"
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Авто
                  </button>
                </div>
              </div>

              {/* Тайлбар */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тайлбар
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Зөвхөн үсэг, тэмдэглэгээ
                    const lettersAndPunctuation = /^[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]*$/;
                    if (!lettersAndPunctuation.test(value)) {
                      return;
                    }
                    const capitalized = value.length > 0 
                      ? value.charAt(0).toUpperCase() + value.slice(1)
                      : value;
                    setFormData(prev => ({ ...prev, description: capitalized }));
                  }}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Хэлтсийн тайлбар..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Цуцлах
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white text-gray-700 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Хадгалж байна...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Хадгалах
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>
    </>
  );
}
