'use client';


import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Briefcase, Search } from 'lucide-react';
import { PrinterIcon } from '@heroicons/react/24/outline';
import { useReactToPrint } from 'react-to-print';
import { fetchDepartments } from '@/utils/hrDataFetchers';

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Occupation {
  code: string;
  titleMn: string;
  majorGroup: string;
  subMajor: string;
  minorGroup: string;
  unitGroup: string;
  version: string;
}

export default function NewPositionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [occupations, setOccupations] = useState<Occupation[]>([]);
  const [occupationSearch, setOccupationSearch] = useState('');
  const [showOccupationDropdown, setShowOccupationDropdown] = useState(false);
  const [selectedOccupation, setSelectedOccupation] = useState<Occupation | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    departmentId: '',
    description: '',
    requirements: '',
    salaryRange: '',
    jobProfessionCode: '',
    jobProfessionName: '',
  });
  const componentRef = useRef<HTMLDivElement>(null);

  const generateCode = useCallback(async () => {
    try {
      const response = await fetch('/api/hr/positions');
      if (response.ok) {
        const positions = await response.json();
        
        const ddCodes = positions
          .map((p: { code: string }) => p.code)
          .filter((code: string) => /^DD\d{5}$/.test(code))
          .map((code: string) => parseInt(code.substring(2), 10))
          .sort((a: number, b: number) => b - a);
        const maxNumber = ddCodes.length > 0 ? ddCodes[0] : 0;
        const nextNumber = maxNumber + 1;
        const code = `DD${String(nextNumber).padStart(5, '0')}`;
        
        setFormData(prev => ({ ...prev, code }));
      }
    } catch (error) {
      console.error('Код үүсгэхэд алдаа гарлаа:', error);
      setFormData(prev => ({ ...prev, code: 'DD00001' }));
    }
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Шинэ_албан_тушаал_${new Date().getTime()}`,
  });

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchDepartments();
      setDepartments(data);
    };
    loadData();
    setCurrentDate(new Date().toLocaleString('mn-MN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
  }, []);

  useEffect(() => {
    if (occupationSearch.trim()) {
      searchOccupations(occupationSearch);
    } else {
      setOccupations([]);
    }
  }, [occupationSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.occupation-dropdown')) {
        setShowOccupationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchOccupations = async (search: string) => {
    try {
      const response = await fetch(`/api/hr/occupations?search=${encodeURIComponent(search)}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setOccupations(data.occupations || []);
      }
    } catch (error) {
      console.error('Ажил мэргэжлийн жагсаалт авахад алдаа гарлаа:', error);
    }
  };

  const handleOccupationSelect = (occupation: Occupation) => {
    setSelectedOccupation(occupation);
    setOccupationSearch(occupation.titleMn);
    setFormData(prev => ({
      ...prev,
      title: occupation.titleMn,
      code: occupation.code,
      jobProfessionCode: occupation.code,
      jobProfessionName: occupation.titleMn,
    }));
    setShowOccupationDropdown(false);
  };

  const handleOccupationSearchChange = (value: string) => {
    setOccupationSearch(value);
    setShowOccupationDropdown(true);
    setFormData(prev => ({
      ...prev,
      title: value,
    }));
    if (!value.trim()) {
      setSelectedOccupation(null);
      setFormData(prev => ({
        ...prev,
        title: '',
        jobProfessionCode: '',
        jobProfessionName: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Ажил мэргэжил оруулна уу');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/hr/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.details || errorData.error || `Алдаа гарлаа (${response.status})`;
        throw new Error(errorMessage);
      }
      router.push('/employer/hr/positions');
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
                  <Briefcase className="w-8 h-8 text-blue-600 mr-3" />
                  <h1 className="text-3xl font-bold text-gray-900">
                    Шинэ албан тушаал нэмэх
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

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ажил мэргэжил *
                </label>
                <div className="relative occupation-dropdown">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={occupationSearch}
                    onChange={(e) => handleOccupationSearchChange(e.target.value)}
                    onFocus={() => setShowOccupationDropdown(true)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ажил мэргэжлийн нэрээр хайх..."
                  />
                  {showOccupationDropdown && occupations.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {occupations.map((occupation) => (
                        <div
                          key={occupation.code}
                          onClick={() => handleOccupationSelect(occupation)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {occupation.titleMn}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Код: {occupation.code} | Ангилал: {occupation.majorGroup}-{occupation.subMajor}-{occupation.minorGroup}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedOccupation && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="text-sm text-blue-800">
                      <strong>Сонгосон:</strong> {selectedOccupation.titleMn} ({selectedOccupation.code})
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Хэлтэс *
                </label>
                <select
                  required
                  value={formData.departmentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Хэлтэс сонгох...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Код
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    if (/^[A-Z0-9]*$/.test(value)) {
                      setFormData(prev => ({ ...prev, code: value }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Код оруулах (хоосон үлдээвэл автоматаар үүсгэнэ)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Код хоосон үлдээвэл автоматаар санамсаргүй код үүсгэнэ
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цалин хязгаар
                </label>
                <input
                  type="text"
                  value={formData.salaryRange}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[0-9,\-\s]*$/.test(value)) {
                      setFormData(prev => ({ ...prev, salaryRange: value }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Жишээ: 2,000,000 - 3,500,000"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Шаардлага
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => {
                    const value = e.target.value;
                    const lettersAndPunctuation = /^[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]*$/;
                    if (!lettersAndPunctuation.test(value)) {
                      return;
                    }
                    const processedValue = value.length > 0 
                      ? value.charAt(0).toUpperCase() + value.slice(1)
                      : value;
                    setFormData(prev => ({ ...prev, requirements: processedValue }));
                  }}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Тушаалын шаардлага..."
                />
              </div>
            </div>
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
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
