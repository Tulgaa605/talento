'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  position?: string;
  department?: string;
  hasContract: boolean;
  employerApproved?: boolean;
  adminApproved?: boolean;
  approved?: boolean;
}

export default function NewContractPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    contractNumber: '',
    employeeId: '',
    contractType: 'FULL_TIME',
    startDate: '',
    endDate: '',
    salary: '',
    currency: 'MNT',
    probationPeriod: '',
    workSchedule: '',
    benefits: '',
    terms: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchEmployees();
    fetchUsers();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/hr/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/hr/users?approval=ADMIN');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/hr/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          salary: parseFloat(formData.salary),
          probationPeriod: formData.probationPeriod ? parseInt(formData.probationPeriod) : null,
        }),
      });

      if (response.ok) {
        router.push('/employer/hr/contracts');
      } else {
        const error = await response.json();
        alert(`Алдаа: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      alert('Гэрээ үүсгэхэд алдаа гарлаа');
    } finally {
      setSubmitting(false);
    }
  };

  const generateContractNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const contractNumber = `CTR-${year}${month}-${random}`;
    setFormData(prev => ({ ...prev, contractNumber }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-">
        <div className="flex items-center justify-between ml-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mt-7">Шинэ хөдөлмөрийн гэрээ</h1>
            <p className="text-gray-600">Ажилтны хөдөлмөрийн гэрээ үүсгэх</p>
          </div>
          <Link
            href="/employer/hr/contracts"
            className="inline-flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Буцах
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Гэрээний үндсэн мэдээлэл</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Гэрээний дугаар *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="contractNumber"
                    value={formData.contractNumber}
                    onChange={handleInputChange}
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500"
                    placeholder="CTR-202412-001"
                  />
                  <button
                    type="button"
                    onClick={generateContractNumber}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Авто
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ажилтан *
                </label>
                <select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Ажилтан сонгох</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.employeeId} - {employee.firstName} {employee.lastName} ({employee.position.title})
                    </option>
                  ))}
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      USER-{user.id.slice(-6)} - {user.name} ({user.position || 'Хэрэглэгч'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Гэрээний төрөл *
                </label>
                <select
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="FULL_TIME">Бүтэн цагийн</option>
                  <option value="PART_TIME">Хагас цагийн</option>
                  <option value="CONTRACT">Гэрээт</option>
                  <option value="INTERNSHIP">Дадлага</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Огноо болон хугацаа</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Эхлэх огноо *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дуусах огноо
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">Хоосон үлдээвэл тодорхойгүй хугацаатай</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Туршилтын хугацаа (өдөр)
                </label>
                <input
                  type="number"
                  name="probationPeriod"
                  value={formData.probationPeriod}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500"
                  placeholder="90"
                />
              </div>
            </div>
          </div>

          {/* Цалин болон нөхцөл */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Цалин болон нөхцөл</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цалин *
                </label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500"
                  placeholder="1000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Валют *
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MNT">MNT</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ажлын хуваарь
                </label>
                <input
                  type="text"
                  name="workSchedule"
                  value={formData.workSchedule}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500"
                  placeholder="Даваа-Баасан 09:00-18:00"
                />
              </div>
            </div>
          </div>

          {/* Нэмэлт мэдээлэл */}
          <div>
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Гэрээний нөхцөл, заалт
                </label>
                <textarea
                  name="terms"
                  value={formData.terms}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500"
                  placeholder="Гэрээний тусгай нөхцөл, заалтууд..."
                />
              </div>
            </div>
          </div>

          {/* Товчлуурууд */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              href="/employer/hr/contracts"
              className="px-6 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Цуцлах
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Үүсгэж байна...' : 'Гэрээ үүсгэх'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
