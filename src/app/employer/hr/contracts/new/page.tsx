'use client';


import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PrinterIcon } from '@heroicons/react/24/outline';
import { useReactToPrint } from 'react-to-print';

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
  const [currentDate, setCurrentDate] = useState('');
  const [formData, setFormData] = useState({
    contractNumber: '',
    employeeId: '',
    contractType: 'FULL_TIME',
    workConditions: 'NORMAL',
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
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Шинэ_гэрээ_${new Date().getTime()}`,
  });

  useEffect(() => {
    fetchEmployees();
    fetchUsers();
    setCurrentDate(new Date().toLocaleString('mn-MN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
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
    let processedValue = value;
    
    // Цалин - зөвхөн тоо
    if (name === 'salary' && value) {
      const numbersOnly = /^[0-9]*$/;
      if (!numbersOnly.test(value)) {
        return;
      }
    }
    
    // Ажлын хуваарь - эхний үсэг том
    if (name === 'workSchedule' && value) {
      if (value.length > 0) {
        processedValue = value.charAt(0).toUpperCase() + value.slice(1);
      }
    }
    
    // Гэрээний нөхцөлд зөвхөн үсэг, тэмдэглэгээ
    if (name === 'terms' && value) {
      const lettersAndPunctuation = /^[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]*$/;
      if (!lettersAndPunctuation.test(value)) {
        return; // Тоо эсвэл бусад тэмдэгт орсон бол буцаах
      }
      // Эхний үсгийг том үсэг болгох
      if (value.length > 0) {
        processedValue = value.charAt(0).toUpperCase() + value.slice(1);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
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
          workConditions: formData.workConditions,
          benefits: formData.terms,
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
          /* Sidebar болон navigation бүгдийг нуух */
          nav,
          aside,
          header,
          [role="navigation"],
          [role="banner"],
          .sidebar,
          .nav-sidebar,
          header nav,
          /* Fixed position sidebar нуух */
          .fixed.inset-y-0,
          [class*="fixed"][class*="inset-y-0"],
          [class*="fixed"][class*="left-0"],
          /* Talento sidebar specific */
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
          /* Background өнгийг бүгдийг нь арилгах */
          * {
            background: white !important;
            background-color: white !important;
            box-shadow: none !important;
            border-color: #e5e7eb !important;
          }
          /* Main content-ыг бүтэн өргөнөөр харуулах */
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
      <div ref={componentRef}>
        <div className="mt-10">
          <div className="flex items-center justify-between ml-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mt-7">Шинэ хөдөлмөрийн гэрээ</h1>
              <p className="text-gray-600">Ажилтны хөдөлмөрийн гэрээ үүсгэх</p>
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
                PDF Хэвлэх
              </button>
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
                  <option value="FULL_TIME">Үндсэн ажилтан</option>
                  <option value="PART_TIME">Цагийн ажилтан</option>
                  <option value="INTERNSHIP">Дадлага ажилтан</option>
                  <option value="PROBATION">Туршилтын ажилтан</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Хөдөлмөрийн нөхцөл *
                </label>
                <select
                  name="workConditions"
                  value={formData.workConditions}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NORMAL">Ердийн</option>
                  <option value="HARMFUL">Хортой</option>
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
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]+"
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
                  Бусад хангамж
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
    </>
  );
}