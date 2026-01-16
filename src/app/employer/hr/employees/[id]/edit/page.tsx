'use client';  
                    


import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ArrowLeftIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';
import { validateLettersOnly, validateNumbersOnly, capitalizeFirstLetter } from '@/utils/validations';
import { fetchDepartments, fetchPositions } from '@/utils/hrDataFetchers';

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
  dateOfBirth?: string;
  gender?: string;
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
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

const formatDateToLocalString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
    dateOfBirth: '',
    gender: '',
    hireDate: '',
    positionId: '',
    departmentId: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    bankName: '',
    bankAccountNumber: '',
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const loadDepartments = useCallback(async () => {
    const data = await fetchDepartments();
    setDepartments(data as Department[]);
  }, []);

  const loadPositions = useCallback(async (departmentId: string) => {
    const data = await fetchPositions(departmentId);
    setPositions(data as Position[]);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Try as employee first
      const employeeResponse = await fetch(`/api/hr/employees/${id}`);
      if (employeeResponse.ok) {
        const employeeData: Employee = await employeeResponse.json();
        
        // Check if employee is terminated
        if (employeeData.status === 'TERMINATED') {
          alert('Халагдсан ажилтны мэдээллийг засварлах боломжгүй!');
          router.push('/employer/hr/employees');
          return;
        }
        
        setEmployee(employeeData);
        setIsEmployee(true);
        
        let dateOfBirthStr = '';
        if (employeeData.dateOfBirth) {
          const date = new Date(employeeData.dateOfBirth);
          if (!isNaN(date.getTime())) {
            dateOfBirthStr = formatDateToLocalString(date);
          }
        }
        
        let hireDateStr = '';
        if (employeeData.hireDate) {
          const date = new Date(employeeData.hireDate);
          if (!isNaN(date.getTime())) {
            hireDateStr = formatDateToLocalString(date);
          }
        }
        
        setFormData({
          firstName: employeeData.firstName || '',
          lastName: employeeData.lastName || '',
          middleName: employeeData.middleName || '',
          email: employeeData.email || '',
          phoneNumber: employeeData.phoneNumber || '',
          dateOfBirth: dateOfBirthStr,
          gender: employeeData.gender || '',
          hireDate: hireDateStr,
          positionId: employeeData.position?.id || '',
          departmentId: employeeData.department?.id || '',
          address: employeeData.address || '',
          emergencyContact: employeeData.emergencyContact || '',
          emergencyPhone: employeeData.emergencyPhone || '',
          bankName: '',
          bankAccountNumber: '',
        });
        setSelectedDepartment(employeeData.department?.id || '');
        return;
      }

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
          dateOfBirth: '',
          gender: '',
          hireDate: '',
          positionId: '',
          departmentId: '',
          address: '',
          emergencyContact: '',
          emergencyPhone: '',
          bankName: '',
          bankAccountNumber: '',
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
    loadDepartments();
  }, [fetchData, loadDepartments]);

  useEffect(() => {
    if (selectedDepartment) {
      loadPositions(selectedDepartment);
    } else {
      setPositions([]);
    }
  }, [selectedDepartment, loadPositions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);

      if (isEmployee) {
        // Validate department and position are selected
        if (!formData.departmentId || !formData.positionId) {
          alert('Хэлтэс болон албан тушаалыг заавал сонгоно уу!');
          setSaving(false);
          return;
        }

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Овог, нэр, эцэг/эхийн нэр, яаралтай холбоо барих нэрт зөвхөн үсэг
    if ((name === 'lastName' || name === 'firstName' || name === 'middleName' || name === 'emergencyContact') && value) {
      if (!validateLettersOnly(value)) {
        return;
      }
      processedValue = capitalizeFirstLetter(value);
    }
    
    // Утасны дугаарт зөвхөн тоо
    if ((name === 'phoneNumber' || name === 'emergencyPhone') && value) {
      if (!validateNumbersOnly(value)) {
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));

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

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            <div>
              <div className="flex items-center mb-4">
                <UserIcon className="h-6 w-6 text-blue-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Үндсэн мэдээлэл</h2>
              </div>
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

              {isEmployee && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ургийн овог *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Ургийн овог"
                      required
                      className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Эцэг/эхийн нэр *
                    </label>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      placeholder="Эцэг/эхийн нэр"
                      required
                      className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Төрсөн огноо
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <DatePicker
                        selected={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
                        onChange={(date: Date | null) => {
                          setFormData(prev => ({
                            ...prev,
                            dateOfBirth: date ? formatDateToLocalString(date) : ''
                          }));
                        }}
                        dateFormat="yyyy-MM-dd"
                        maxDate={new Date()}
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={100}
                        showMonthDropdown
                        dropdownMode="select"
                        placeholderText="(YYYY-MM-DD)"
                        isClearable
                        allowSameDay={false}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                        wrapperClassName="w-full"
                        calendarClassName="react-datepicker-custom"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Хүйс
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Сонгоно уу</option>
                      <option value="male">Эрэгтэй</option>
                      <option value="female">Эмэгтэй</option>
                    </select>
                  </div>
                </>
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
            </div>
            </div>
            {isEmployee && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Ажлын мэдээлэл</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ажилд орсон огноо *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <DatePicker
                        selected={formData.hireDate ? new Date(formData.hireDate) : null}
                        onChange={(date: Date | null) => {
                          setFormData(prev => ({
                            ...prev,
                            hireDate: date ? formatDateToLocalString(date) : ''
                          }));
                        }}
                        dateFormat="yyyy-MM-dd"
                        maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={20}
                        showMonthDropdown
                        dropdownMode="select"
                        placeholderText="(YYYY-MM-DD)"
                        required
                        isClearable
                        allowSameDay={true}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                        wrapperClassName="w-full"
                        calendarClassName="react-datepicker-custom"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Хэлтэс *
                    </label>
                    <select
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleChange}
                      required
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
                      Албан тушаал *
                    </label>
                    <select
                      name="positionId"
                      value={formData.positionId}
                      onChange={handleChange}
                      required
                      disabled={!selectedDepartment}
                      className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Албан тушаал сонгох</option>
                      {positions.map((pos) => (
                        <option key={pos.id} value={pos.id}>
                          {pos.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {isEmployee && (
              <div>
                <div className="mt-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Хаяг
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {isEmployee && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Яаралтай холбоо барих</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Таны хэн болох
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Утасны дугаар
                    </label>
                    <input
                      type="tel"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                      pattern="[0-9]+"
                      maxLength={8}
                      className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

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
