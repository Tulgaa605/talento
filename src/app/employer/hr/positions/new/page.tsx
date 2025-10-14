'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Briefcase, Search } from 'lucide-react';

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

  useEffect(() => {
    fetchDepartments();
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

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/hr/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      } else {
        console.error('Хэлтсүүдийн API 404/500:', await response.text());
      }
    } catch (error) {
      console.error('Хэлтсүүдийг авахад алдаа гарлаа:', error);
    }
  };

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
      jobProfessionCode: occupation.code,
      jobProfessionName: occupation.titleMn,
      code: occupation.code
    }));
    setShowOccupationDropdown(false);
  };

  const handleOccupationSearchChange = (value: string) => {
    setOccupationSearch(value);
    setShowOccupationDropdown(true);
    if (!value.trim()) {
      setSelectedOccupation(null);
      setFormData(prev => ({
        ...prev,
        jobProfessionCode: '',
        jobProfessionName: '',
      }));
    }
  };

  const generateCode = () => {
    const current = formData.code;
    const match = current.match(/^DD(\d{5})$/);
    const nextNumber = match ? parseInt(match[1], 10) + 1 : 1;
    const code = `DD${String(nextNumber).padStart(5, '0')}`;
    setFormData(prev => ({ ...prev, code }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/hr/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          jobProfessionCode: selectedOccupation?.code || '',
          jobProfessionName: selectedOccupation?.titleMn || '',
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Алдаа гарлаа (${response.status})`);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Буцах
          </button>
          <div className="flex items-center">
            <Briefcase className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Шинэ албан тушаал нэмэх
            </h1>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ажил мэргэжил
                </label>
                <div className="relative occupation-dropdown">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Хэлтэс *
                </label>
                <select
                  required
                  value={formData.departmentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Хэлтэс сонгох</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name} ({department.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цалин хязгаар
                </label>
                <input
                  type="text"
                  value={formData.salaryRange}
                  onChange={(e) => setFormData(prev => ({ ...prev, salaryRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Жишээ: 2,000,000 - 3,500,000 MNT"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тайлбар
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Тушаалын тайлбар..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Шаардлага
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
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
  );
}
