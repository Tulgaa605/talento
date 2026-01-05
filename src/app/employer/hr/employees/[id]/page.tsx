'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { validateLettersOnly, validateNumbersOnly, capitalizeFirstLetter } from '@/utils/validations';
import { fetchDepartments, fetchPositions, fetchEmployees } from '@/utils/hrDataFetchers';
import { DetailPageSkeleton } from '@/components/Skeletons';
import { 
  ArrowLeftIcon, 
  PencilIcon,
  UserIcon,
  CalendarIcon,
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
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
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
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  contracts: Array<{
    id: string;
    contractNumber: string;
    contractType: string;
    startDate: string;
    endDate?: string;
    salary: number;
    currency: string;
    status: string;
  }>;
}

const SESSION_STORAGE_KEY = 'employee_form_data';

// Local timezone-д огноо string хөрвүүлэх функц
const formatDateToLocalString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function EmployeePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const isNew = id === 'new';
  
  const [mode, setMode] = useState<'view' | 'edit' | 'create'>(isNew ? 'create' : 'view');
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [submitting, setSubmitting] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [, setManagers] = useState<Array<{ id: string; firstName: string; lastName: string }>>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [applicationInfo, setApplicationInfo] = useState<{
    jobTitle?: string;
    userName?: string;
    userEmail?: string;
  } | null>(null);
  
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
    bankName: '',
    bankAccountNumber: '',
  });

  // SessionStorage-аас form data ачаалах
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (isNew) {
      const savedData = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData(prev => ({ ...prev, ...parsed }));
          if (parsed.departmentId) {
            setSelectedDepartment(parsed.departmentId);
          }
        } catch (error) {
          console.error('Error loading form data from session:', error);
        }
      }
    }
  }, [isNew]);

  // Form data-г sessionStorage-д хадгалах
  useEffect(() => {
    if (typeof window === 'undefined' || !isNew || mode !== 'create') return;
    
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(formData));
    } catch (error) {
      console.error('Error saving form data to session:', error);
    }
  }, [formData, isNew, mode]);

  useEffect(() => {
    setCurrentDate(new Date().toLocaleString('mn-MN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
  }, []);

  const parseCVAnalysis = (analysis: string) => {
    const parsedData: {
      middleName?: string;
      birthDate?: string;
      gender?: string;
      address?: string;
      emergencyContact?: string;
      emergencyPhone?: string;
    } = {};
    
    try {
      const birthDateMatch = analysis.match(/(?:төрсөн|birth|born).*?(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4})/i);
      if (birthDateMatch) {
        const dateStr = birthDateMatch[1];
        const parts = dateStr.split(/[-/]/);
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            parsedData.birthDate = `${parts[1]}/${parts[2]}/${parts[0]}`;
          } else {
            parsedData.birthDate = `${parts[0]}/${parts[1]}/${parts[2]}`;
          }
        }
      }
      
      const genderMatch = analysis.match(/(?:хүйс|gender|sex).*?(эр|эм|male|female|м|ж)/i);
      if (genderMatch) {
        const gender = genderMatch[1].toLowerCase();
        if (gender.includes('эр') || gender.includes('male') || gender.includes('м')) {
          parsedData.gender = 'male';
        } else if (gender.includes('эм') || gender.includes('female') || gender.includes('ж')) {
          parsedData.gender = 'female';
        }
      }
      
      const addressMatch = analysis.match(/(?:хаяг|address|location).*?([^.\n]{10,100})/i);
      if (addressMatch) {
        parsedData.address = addressMatch[1].trim();
      }
      
      const emergencyMatch = analysis.match(/(?:яаралтай|emergency|urgent).*?(?:холбоо|contact).*?([^.\n]{5,50})/i);
      if (emergencyMatch) {
        parsedData.emergencyContact = emergencyMatch[1].trim();
      }
      
      const emergencyPhoneMatch = analysis.match(/(?:яаралтай|emergency).*?(?:утас|phone).*?(\d{8,})/i);
      if (emergencyPhoneMatch) {
        parsedData.emergencyPhone = emergencyPhoneMatch[1];
      }
      
      const middleNameMatch = analysis.match(/(?:эцэг|эх|father|mother).*?(?:нэр|name).*?([А-Яа-яЁёӨөҮү\s]{2,20})/i);
      if (middleNameMatch) {
        parsedData.middleName = middleNameMatch[1].trim();
      }
    } catch (error) {
      console.error('Error parsing CV analysis:', error);
    }
    
    return parsedData;
  };

  const fetchApplicationData = useCallback(async (applicationId: string) => {
    try {
      const response = await fetch(`/api/employer/applications/${applicationId}`);
      if (response.ok) {
        const application = await response.json();
        
        setApplicationInfo({
          jobTitle: application.job?.title,
          userName: application.user?.name,
          userEmail: application.user?.email,
        });

        if (application.user) {
          const user = application.user;
          const nameParts = user.name?.split(' ') || [];
          
          let cvData: {
            middleName?: string;
            birthDate?: string;
            gender?: string;
            address?: string;
            emergencyContact?: string;
            emergencyPhone?: string;
          } = {};
          if (application.cv?.analysis) {
            cvData = parseCVAnalysis(application.cv.analysis);
          }
          
          setFormData(prev => ({
            ...prev,
            firstName: nameParts.length > 1 ? nameParts[1] : nameParts[0] || '',
            lastName: nameParts.length > 1 ? nameParts[0] : '',
            middleName: cvData?.middleName || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            birthDate: cvData?.birthDate || '',
            gender: cvData?.gender || '',
            address: cvData?.address || '',
            emergencyContact: cvData?.emergencyContact || '',
            emergencyPhone: cvData?.emergencyPhone || '',
            hireDate: new Date().toISOString().split('T')[0],
          }));
          
          if (application.job) {
            const jobDepartment = departments.find(dept => 
              dept.name.toLowerCase().includes(application.job.title.toLowerCase()) ||
              application.job.title.toLowerCase().includes(dept.name.toLowerCase())
            );
            
            if (jobDepartment) {
              setSelectedDepartment(jobDepartment.id);
              setFormData(prev => ({
                ...prev,
                departmentId: jobDepartment.id,
              }));
            }
          }
        }
      }
    } catch (error) {
      console.error('Application мэдээлэл авахад алдаа гарлаа:', error);
    }
  }, [departments]);

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/hr/users/${userId}`);
      if (response.ok) {
        const user = await response.json();
        
        if (user) {
          const nameParts = user.name?.split(' ') || [];
          
          setFormData(prev => ({
            ...prev,
            middleName: nameParts.length > 1 ? nameParts[1] : nameParts[0] || '',
            firstName: nameParts.length > 1 ? nameParts[0] : '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            hireDate: new Date().toISOString().split('T')[0],
          }));
          
          setApplicationInfo({
            jobTitle: user.position || '',
            userName: user.name,
            userEmail: user.email,
          });
        }
      }
    } catch (error) {
      console.error('User мэдээлэл авахад алдаа гарлаа:', error);
    }
  }, []);

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`/api/hr/employees/${id}`);
      if (response.ok) {
        const data = await response.json();
        setEmployee(data);
      } else {
        console.error('Failed to fetch employee');
        router.push('/employer/hr/employees');
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      router.push('/employer/hr/employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
    loadManagers();
    if (!isNew && id) {
      fetchEmployee();
    }
  }, []);

  useEffect(() => {
    const applicationId = searchParams.get('applicationId');
    if (applicationId) {
      fetchApplicationData(applicationId);
    }
    
    const userId = searchParams.get('userId');
    if (userId) {
      fetchUserData(userId);
    }
  }, [searchParams, fetchApplicationData, fetchUserData]);

  useEffect(() => {
    if (selectedDepartment) {
      loadPositions(selectedDepartment);
    } else {
      setPositions([]);
    }
  }, [selectedDepartment]);

  const loadDepartments = async () => {
    const data = await fetchDepartments();
    setDepartments(data as Department[]);
  };

  const loadPositions = async (departmentId: string) => {
    const data = await fetchPositions(departmentId);
    setPositions(data as Position[]);
  };

  const loadManagers = async () => {
    const data = await fetchEmployees('ACTIVE');
    setManagers(data.map(emp => ({
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName
    })));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (name === 'employeeId' && value) {
      const upperValue = value.toUpperCase();
      
      if (upperValue.length <= 2) {
        if (/^[A-ZА-ЯЁӨҮ]*$/.test(upperValue)) {
          processedValue = upperValue;
        } else {
          return;
        }
      } else {
        const letters = upperValue.slice(0, 2);
        const numbers = upperValue.slice(2);
        
        if (/^[A-ZА-ЯЁӨҮ]{2}$/.test(letters) && /^[0-9]*$/.test(numbers)) {
          processedValue = letters + numbers;
        } else {
          return;
        }
      }
    }
    
    if ((name === 'lastName' || name === 'firstName' || name === 'middleName' || name === 'emergencyContact') && value) {
      if (!validateLettersOnly(value)) {
        return;
      }
      processedValue = capitalizeFirstLetter(value);
    }
    
    if ((name === 'phoneNumber' || name === 'emergencyPhone' || name === 'bankAccountNumber') && value) {
      if (!validateNumbersOnly(value)) {
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    if (name === 'departmentId') {
      setSelectedDepartment(value);
      setFormData(prev => ({
        ...prev,
        positionId: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === 'create') {
        // lastName-ийг middleName-ээс авна (UI-д lastName талбар байхгүй)
        const submitData = {
          ...formData,
          lastName: formData.middleName || '',
        };
        
        const response = await fetch('/api/hr/employees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        });

        if (response.ok) {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
          }
          alert('Ажилтны бүртгэл амжилттай нэмэгдлээ!');
          router.push('/employer/hr/employees');
        } else {
          const error = await response.json();
          alert(error.error || 'Алдаа гарлаа');
        }
      } else if (mode === 'edit' && employee) {
        // lastName-ийг middleName-ээс авна (UI-д lastName талбар байхгүй)
        const submitData = {
          ...formData,
          lastName: formData.middleName || '',
        };
        
        const response = await fetch(`/api/hr/employees/${employee.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        });

        if (response.ok) {
          alert('Ажилтны мэдээлэл амжилттай шинэчлэгдлээ!');
          await fetchEmployee();
          setMode('view');
        } else {
          const error = await response.json();
          alert(error.error || 'Алдаа гарлаа');
        }
      }
    } catch (error) {
      console.error('Алдаа гарлаа:', error);
      alert('Алдаа гарлаа');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('mn-MN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      case 'ON_LEAVE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Идэвхтэй';
      case 'INACTIVE':
        return 'Идэвхгүй';
      case 'ON_LEAVE':
        return 'Чөлөөтэй';
      default:
        return status;
    }
  };

  const getContractTypeLabel = (type: string) => {
    switch (type) {
      case 'FULL_TIME':
        return 'Үндсэн ажилтан';
      case 'PART_TIME':
        return 'Цагийн ажилтан';
      case 'INTERNSHIP':
        return 'Дадлага ажилтан';
      case 'PROBATION':
        return 'Туршилтын ажилтан';
      default:
        return type;
    }
  };

  const handleEdit = () => {
    if (employee) {
      setFormData({
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: '', // UI-д харагдахгүй, middleName-ээс авна
        middleName: employee.middleName || employee.lastName || '',
        email: employee.email,
        phoneNumber: employee.phoneNumber,
        dateOfBirth: employee.dateOfBirth || '',
        gender: '',
        address: employee.address || '',
        emergencyContact: employee.emergencyContact || '',
        emergencyPhone: employee.emergencyPhone || '',
        hireDate: employee.hireDate,
        positionId: employee.position?.id || '',
        departmentId: employee.department?.id || '',
        managerId: employee.manager?.id || '',
        bankName: '',
        bankAccountNumber: '',
      });
      setSelectedDepartment(employee.department?.id || '');
      setMode('edit');
    }
  };

  const handleCancel = () => {
    if (isNew) {
      router.push('/employer/hr/employees');
    } else {
      setMode('view');
      if (employee) {
        fetchEmployee();
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <DetailPageSkeleton />
      </div>
    );
  }

  // Create/Edit mode - Show form
  if (mode === 'create' || mode === 'edit') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/employer/hr/employees"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Буцах
            </Link>
          </div> 
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === 'create' ? 'Шинэ ажилтны бүртгэл' : 'Ажилтны мэдээлэл засах'}
          </h1>
          <p className="mt-2 text-gray-600">
            {mode === 'create' 
              ? (searchParams.get('applicationId') 
                  ? 'CV-г зөвшөөрсөн хэрэглэгчийн мэдээллийг бөглөнө үү' 
                  : searchParams.get('userId')
                  ? 'Сонгосон хэрэглэгчийн мэдээллийг бөглөнө үү'
                  : 'Ажилтны үндсэн мэдээллийг оруулна уу')
              : 'Ажилтны мэдээллийг засварлана уу'}
          </p>
          {currentDate && (
            <div className="hidden-on-screen mt-2 text-sm text-gray-500">
              Хэвлэсэн огноо: {currentDate}
            </div>
          )}
          {(mode === 'create' && (searchParams.get('applicationId') || searchParams.get('userId'))) && (
            <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">💡</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-900">
                    {searchParams.get('applicationId') 
                      ? 'CV-г зөвшөөрсөн хэрэглэгчийн мэдээлэл'
                      : 'Сонгосон хэрэглэгчийн мэдээлэл'
                    }
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Хэрэглэгчийн үндсэн мэдээлэл автоматаар бөглөгдсөн байна. 
                    Шаардлагатай талбаруудыг нэмж бөглөнө үү.
                  </p>
                  {applicationInfo && (
                    <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Хэрэглэгч:</span>
                          <span className="ml-2 text-gray-900">{applicationInfo.userName}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Имэйл:</span>
                          <span className="ml-2 text-gray-900">{applicationInfo.userEmail}</span>
                        </div>
                        {applicationInfo.jobTitle && (
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-700">Ажлын байр:</span>
                            <span className="ml-2 text-gray-900">{applicationInfo.jobTitle}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            <div>
              <div className="flex items-center mb-4">
                <UserIcon className="h-6 w-6 text-blue-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Үндсэн мэдээлэл</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {mode === 'create' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Регистерийн дугаар *</label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      maxLength={10}
                      placeholder="AA12345678"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Эцэг/эхийн нэр *</label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    pattern="[A-Za-zА-Яа-яЁёӨөҮү\s]+"
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
                    pattern="[A-Za-zА-Яа-яЁёӨөҮү\s]+"
                    required
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
                    pattern="[0-9]+"
                    maxLength={8}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                  />
                </div>

                {mode === 'create' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Төрсөн огноо *</label>
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
                          required
                          isClearable
                          allowSameDay={false}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                          wrapperClassName="w-full"
                          calendarClassName="react-datepicker-custom"
                        />
                      </div>
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
                  </>
                )}
              </div>

              <div className="mt-1">
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
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Ажлын мэдээлэл</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ажилд орсон огноо *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Хэлтэс *</label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                  >
                    <option value="">Сонгоно уу</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Албан тушаал *</label>
                  <select
                    name="positionId"
                    value={formData.positionId}
                    onChange={handleInputChange}
                    required
                    disabled={!selectedDepartment}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 disabled:bg-gray-100"
                  >
                    <option value="">Сонгоно уу</option>
                    {positions.map((pos) => (
                      <option key={pos.id} value={pos.id}>
                        {pos.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {mode === 'create' && (
              <>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Санхүүгийн мэдээлэл</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Банк *</label>
                      <select
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                      >
                        <option value="">Сонгоно уу</option>
                        <option value="Хаан банк">Хаан банк</option>
                        <option value="Голомт банк">Голомт банк</option>
                        <option value="Худалдаа хөгжлийн банк">Худалдаа хөгжлийн банк</option>
                        <option value="Хас банк">Хас банк</option>
                        <option value="Төрийн банк">Төрийн банк</option>
                        <option value="Капитрон банк">Капитрон банк</option>
                        <option value="Арилжааны банк бусад">Бусад</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Дансны дугаар *</label>
                      <input
                        type="text"
                        name="bankAccountNumber"
                        value={formData.bankAccountNumber}
                        onChange={handleInputChange}
                        required
                        inputMode="numeric"
                        pattern="[0-9]{6,20}"
                        maxLength={20}
                        placeholder="Дугаар"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Яаралтай холбоо барих</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Таны хэн болох</label>
                      <input
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Утасны дугаар</label>
                      <input
                        type="tel"
                        name="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={handleInputChange}
                        pattern="[0-9]+"
                        maxLength={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {mode === 'edit' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Яаралтай холбоо барих</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Таны хэн болох</label>
                    <input
                      type="text"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Утасны дугаар</label>
                    <input
                      type="tel"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleInputChange}
                      pattern="[0-9]+"
                      maxLength={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Цуцлах
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // View mode - Show details
  if (!employee) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">Ажилтан олдсонгүй</p>
          <Link
            href="/employer/hr/employees"
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Буцах
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/employer/hr/employees"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Буцах
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="mt-2 text-gray-600">{employee.position.title}</p>
          </div>
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Засах
          </button>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Хувийн мэдээлэл</h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Ажилтны ID
              </label>
              <p className="text-gray-900 font-medium">{employee.employeeId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Төлөв
              </label>
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                  employee.status
                )}`}
              >
                {getStatusLabel(employee.status)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Овог нэр
              </label>
              <p className="text-gray-900">
                {employee.lastName} {employee.firstName}
                {employee.middleName && ` ${employee.middleName}`}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Имэйл хаяг
              </label>
              <p className="text-gray-900">{employee.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Утасны дугаар
              </label>
              <p className="text-gray-900">{employee.phoneNumber}</p>
            </div>
            {employee.dateOfBirth && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Төрсөн өдөр
                </label>
                <p className="text-gray-900">{formatDate(employee.dateOfBirth)}</p>
              </div>
            )}
            {employee.address && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Хаяг
                </label>
                <p className="text-gray-900">{employee.address}</p>
              </div>
            )}
            {employee.emergencyContact && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Яаралтай холбогдох утас
                </label>
                <p className="text-gray-900">{employee.emergencyContact}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Employment Information */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Ажлын мэдээлэл</h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Ажилд орсон огноо
              </label>
              <p className="text-gray-900">{formatDate(employee.hireDate)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Албан тушаал
              </label>
              <p className="text-gray-900">{employee.position.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Хэлтэс
              </label>
              <p className="text-gray-900">{employee.department.name}</p>
            </div>
            {employee.manager && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Менежер
                </label>
                <p className="text-gray-900">
                  {employee.manager.firstName} {employee.manager.lastName}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contracts */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Гэрээнүүд</h2>
            <Link
              href={`/employer/hr/contracts/new?employeeId=${employee.id}`}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Шинэ гэрээ
            </Link>
          </div>
        </div>
        {employee.contracts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Гэрээний дугаар
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Төрөл
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Эхлэх огноо
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Дуусах огноо
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Цалин
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Төлөв
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Үйлдэл
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employee.contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {contract.contractNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getContractTypeLabel(contract.contractType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(contract.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contract.endDate ? formatDate(contract.endDate) : 'Тодорхойгүй'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contract.salary.toLocaleString()} {contract.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          contract.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {contract.status === 'ACTIVE' ? 'Идэвхтэй' : contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/employer/hr/contracts/${contract.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Харах
                      </Link>
                      <Link
                        href={`/employer/hr/contracts/${contract.id}/edit`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Засах
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">
            Гэрээ байхгүй байна
          </div>
        )}
      </div>
    </div>
  );
}
