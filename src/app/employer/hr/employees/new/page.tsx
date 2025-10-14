'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Position {
  id: string;
  title: string;
  code: string;
  departmentId: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
}

export default function NewEmployeePage() {
  const router = useRouter();
  const [, setLoading] = useState(false);
  const [, setDepartments] = useState<Department[]>([]);
  const [, setPositions] = useState<Position[]>([]);
  const [, setManagers] = useState<Employee[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    hireDate: '',
    positionId: '',
    departmentId: '',
    managerId: '',
  });

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      fetchPositions(selectedDepartment);
    } else {
      setPositions([]);
    }
  }, [selectedDepartment]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/hr/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Хэлтсүүдийг авахад алдаа гарлаа:', error);
    }
  };

  const fetchPositions = async (departmentId: string) => {
    try {
      const response = await fetch(`/api/hr/positions?departmentId=${departmentId}`);
      if (response.ok) {
        const data = await response.json();
        setPositions(data);
      }
    } catch (error) {
      console.error('Албан тушаалуудыг авахад алдаа гарлаа:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/hr/employees?status=ACTIVE');
      if (response.ok) {
        const data = await response.json();
        setManagers(data);
      }
    } catch (error) {
      console.error('Ажилтнуудыг авахад алдаа гарлаа:', error);
    }
  };

  // ✅ textarea-г нэмсэн
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'departmentId') {
      setSelectedDepartment(value);
      setFormData(prev => ({
        ...prev,
        positionId: '' // Хэлтэс солигдоход албан тушаалыг цэвэрлэнэ
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/hr/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Ажилтны бүртгэл амжилттай нэмэгдлээ!');
        router.push('/employer/hr/employees');
      } else {
        const error = await response.json();
        alert(error.error || 'Алдаа гарлаа');
      }
    } catch (error) {
      console.error('Ажилтны бүртгэл нэмэхэд алдаа гарлаа:', error);
      alert('Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Гарчиг */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link
            href="/employer/hr/employees"
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Буцах
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Шинэ ажилтны бүртгэл</h1>
        <p className="mt-2 text-gray-600">Ажилтны үндсэн мэдээллийг оруулна уу</p>
      </div>

      {/* Форм */}
      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div>
            <div className="flex items-center mb-4">
              <UserIcon className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Үндсэн мэдээлэл</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Регистерийн дугаар *</label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Овог *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Нэр *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Эцэг/эхийн нэр</label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Имэйл *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Утасны дугаар *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Төрсөн огноо *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Хүйс *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                >
                  <option value="">Сонгоно уу</option>
                  <option value="male">Эрэгтэй</option>
                  <option value="female">Эмэгтэй</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Хаяг *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
              />
            </div>
          </div>

          {/* ... бусад хэсгүүд өөрчлөгдөөгүй ... */}
        </form>
      </div>
    </div>
  );
}
