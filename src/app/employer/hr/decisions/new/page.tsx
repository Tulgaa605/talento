'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, FileText } from 'lucide-react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  position: {
    title: string;
  };
  department: {
    name: string;
  };
}

export default function NewDecisionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    decisionNumber: '',
    title: '',
    type: '',
    employeeId: '',
    decisionDate: '',
    effectiveDate: '',
    description: '',
    reason: '',
    details: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/hr/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Ажилтнуудыг авахад алдаа гарлаа:', error);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/hr/decisions', {
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

      router.push('/employer/hr/decisions');
    } catch (error) {
      console.error('Алдаа:', error);
      alert(error instanceof Error ? error.message : 'Алдаа гарлаа');
    } finally {
      setIsLoading(false);
    }
  };

  const decisionTypes = [
    { value: 'HIRING', label: 'Ажилд авах' },
    { value: 'PROMOTION', label: 'Дэвшүүлэх' },
    { value: 'TRANSFER', label: 'Шилжүүлэх' },
    { value: 'TERMINATION', label: 'Ажлаас хасах' },
    { value: 'SALARY_CHANGE', label: 'Цалин өөрчлөх' },
    { value: 'OTHER', label: 'Бусад' },
  ];

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
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Шинэ удирдлагын шийдвэр үүсгэх
            </h1>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Шидвэрийн дугаар */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Шидвэрийн дугаар *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.decisionNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, decisionNumber: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Жишээ: DEC-20241201-001"
                  />
                  <button
                    type="button"
                    onClick={generateDecisionNumber}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Авто
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Шидвэрийн төрөл *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Төрөл сонгох</option>
                  {decisionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Гарчиг */}
              <div className="">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Гарчиг *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Шидвэрийн гарчиг..."
                />
              </div>

              {/* Ажилтан */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ажилтан *
                </label>
                <select
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Ажилтан сонгох</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName} ({employee.employeeId}) - {employee.position.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Шидвэр гарсан огноо *
                </label>
                <input
                  type="date"
                  required
                  value={formData.decisionDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, decisionDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Хэрэгжих огноо
                </label>
                <input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тайлбар *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Шидвэрийн дэлгэрэнгүй тайлбар..."
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Шалтгаан
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Шидвэр гаргасан шалтгаан..."
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
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md text-gray-700 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
