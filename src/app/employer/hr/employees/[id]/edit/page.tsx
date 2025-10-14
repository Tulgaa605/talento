'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  image?: string;
  hasContract: boolean;
  employerApproved?: boolean;
  adminApproved?: boolean;
  approved?: boolean;
  position?: string;
  department?: string;
}

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phoneNumber: string;
  status: string;
  hireDate: string;
  position: {
    id: string;
    title: string;
    department: {
      id: string;
      name: string;
    };
  };
  department: {
    id: string;
    name: string;
  };
  // Optional fields used in formData population
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

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

export default function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [, setUser] = useState<User | null>(null);
  const [, setEmployee] = useState<Employee | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phoneNumber: '',
    positionId: '',
    departmentId: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await fetch('/api/hr/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Хэлтсүүдийг авахад алдаа гарлаа:', error);
    }
  }, []);

  const fetchPositions = useCallback(async (departmentId: string) => {
    try {
      const response = await fetch(`/api/hr/positions?departmentId=${departmentId}`);
      if (response.ok) {
        const data = await response.json();
        setPositions(data);
      }
    } catch (error) {
      console.error('Албан тушаалуудыг авахад алдаа гарлаа:', error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Try as employee first
      const employeeResponse = await fetch(`/api/hr/employees/${id}`);
      if (employeeResponse.ok) {
        const employeeData: Employee = await employeeResponse.json();
        setEmployee(employeeData);
        setIsEmployee(true);
        setFormData({
          firstName: employeeData.firstName || '',
          lastName: employeeData.lastName || '',
          middleName: employeeData.middleName || '',
          email: employeeData.email || '',
          phoneNumber: employeeData.phoneNumber || '',
          positionId: employeeData.position?.id || '',
          departmentId: employeeData.department?.id || '',
          address: employeeData.address || '',
          emergencyContact: employeeData.emergencyContact || '',
          emergencyPhone: employeeData.emergencyPhone || '',
        });
        setSelectedDepartment(employeeData.department?.id || '');
        return;
      }

      // Else fetch as user
      const userResponse = await fetch(`/api/hr/users/${id}`);
      if (userResponse.ok) {
        const userData: User = await userResponse.json();
        setUser(userData);
        setIsEmployee(false);
        const [first = '', ...rest] = (userData.name || '').split(' ');
        setFormData({
          firstName: first,
          lastName: rest.join(' '),
          middleName: '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          positionId: '',
          departmentId: '',
          address: '',
          emergencyContact: '',
          emergencyPhone: '',
        });
        return;
      }

      console.error('Ажилтан эсвэл хэрэглэгчийг олсонгүй');
      router.push('/employer/hr/employees');
    } catch (error) {
      console.error('Мэдээлэл авахад алдаа гарлаа:', error);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchData();
    fetchDepartments();
  }, [fetchData, fetchDepartments]);

  useEffect(() => {
    if (selectedDepartment) {
      fetchPositions(selectedDepartment);
    } else {
      setPositions([]);
    }
  }, [selectedDepartment, fetchPositions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);

      if (isEmployee) {
        // Update employee
        const response = await fetch(`/api/hr/employees/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          router.push('/employer/hr/employees');
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Ажилтныг шинэчлэхэд алдаа гарлаа');
        }
      } else {
        // Update user
        const userData = {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          position: '',
          department: '',
        };

        const response = await fetch(`/api/hr/users/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });

        if (response.ok) {
          router.push('/employer/hr/employees');
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Хэрэглэгчийг шинэчлэхэд алдаа гарлаа');
        }
      }
    } catch (error) {
      console.error('Мэдээлэл шинэчлэхэд алдаа гарлаа:', error);
      alert('Мэдээлэл шинэчлэхэд алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'departmentId') {
      setSelectedDepartment(value);
      setFormData(prev => ({ ...prev, positionId: '' }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Буцах
          </button>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEmployee ? 'Ажилтны мэдээлэл засах' : 'Хэрэглэгчийн мэдээлэл засах'}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Нэр *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Овог *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {isEmployee && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Төрсөн огноо
                  </label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    placeholder="Төрсөн огноо"
                    className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Имэйл *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Утасны дугаар
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {isEmployee && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Хэлтэс
                    </label>
                    <select
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Хэлтэс сонгох</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Албан тушаал
                    </label>
                    <select
                      name="positionId"
                      value={formData.positionId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Албан тушаал сонгох</option>
                      {positions.map((pos) => (
                        <option key={pos.id} value={pos.id}>
                          {pos.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Хаяг
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Яаралтын холбоо барих
                    </label>
                    <input
                      type="text"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm fontmedium text-gray-700 mb-2">
                      Яаралтын утас
                    </label>
                    <input
                      type="tel"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Цуцлах
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
