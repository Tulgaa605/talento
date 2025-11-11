'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Building2 } from 'lucide-react';

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

  const generateCode = useCallback(async () => {
    try {
      const response = await fetch('/api/hr/departments');
      if (response.ok) {
        const departments = await response.json();
        
        const ddCodes = departments
          .map((d: { code: string }) => d.code)
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

  useEffect(() => {
    generateCode();
    setCurrentDate(new Date().toLocaleString('mn-MN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
  }, [generateCode]);

  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   const { name, value } = e.target;
  //   let processedValue = value;
    
  //   if (name === 'name' && value) {
  //     const lettersOnly = /^[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-()]*$/;
  //     if (!lettersOnly.test(value)) {
  //       return;
  //     }

  //     if (value.length > 0) {
  //       processedValue = value.charAt(0).toUpperCase() + value.slice(1);
  //     }
  //   }
    
  //   if (name === 'description' && value) {
  //     const lettersOnly = /^[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]*$/;
  //     if (!lettersOnly.test(value)) {
  //       return;
  //     }
      
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
            </div>
          </div>

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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тайлбар
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => {
                    const value = e.target.value;
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
