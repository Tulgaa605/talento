'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [, setManagers] = useState<Employee[]>([]);
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
  });

  // CV analysis parsing function
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
      // Extract birth date
      const birthDateMatch = analysis.match(/(?:төрсөн|birth|born).*?(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4})/i);
      if (birthDateMatch) {
        const dateStr = birthDateMatch[1];
        // Convert to MM/DD/YYYY format
        const parts = dateStr.split(/[-/]/);
        if (parts.length === 3) {
          if (parts[0].length === 4) { // YYYY-MM-DD format
            parsedData.birthDate = `${parts[1]}/${parts[2]}/${parts[0]}`;
          } else { // MM/DD/YYYY format
            parsedData.birthDate = `${parts[0]}/${parts[1]}/${parts[2]}`;
          }
        }
      }
      
      // Extract gender
      const genderMatch = analysis.match(/(?:хүйс|gender|sex).*?(эр|эм|male|female|м|ж)/i);
      if (genderMatch) {
        const gender = genderMatch[1].toLowerCase();
        if (gender.includes('эр') || gender.includes('male') || gender.includes('м')) {
          parsedData.gender = 'male';
        } else if (gender.includes('эм') || gender.includes('female') || gender.includes('ж')) {
          parsedData.gender = 'female';
        }
      }
      
      // Extract address
      const addressMatch = analysis.match(/(?:хаяг|address|location).*?([^.\n]{10,100})/i);
      if (addressMatch) {
        parsedData.address = addressMatch[1].trim();
      }
      
      // Extract emergency contact
      const emergencyMatch = analysis.match(/(?:яаралтай|emergency|urgent).*?(?:холбоо|contact).*?([^.\n]{5,50})/i);
      if (emergencyMatch) {
        parsedData.emergencyContact = emergencyMatch[1].trim();
      }
      
      // Extract emergency phone
      const emergencyPhoneMatch = analysis.match(/(?:яаралтай|emergency).*?(?:утас|phone).*?(\d{8,})/i);
      if (emergencyPhoneMatch) {
        parsedData.emergencyPhone = emergencyPhoneMatch[1];
      }
      
      // Extract middle name (father's name)
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
        
        // Application мэдээллийг хадгалах
        setApplicationInfo({
          jobTitle: application.job?.title,
          userName: application.user?.name,
          userEmail: application.user?.email,
        });

        // Хэрэглэгчийн мэдээллийг form-д бөглөх
        if (application.user) {
          const user = application.user;
          const nameParts = user.name?.split(' ') || [];
          
          // Parse CV analysis for additional details
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
            console.log('Parsed CV data:', cvData);
          }
          
          setFormData(prev => ({
            ...prev,
            firstName: nameParts.length > 1 ? nameParts[1] : nameParts[0] || '', // Нэр
            lastName: nameParts.length > 1 ? nameParts[0] : '', // Овог
            middleName: cvData?.middleName || '', // Эцэг/эхийн нэр
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            birthDate: cvData?.birthDate || '', // Төрсөн огноо
            gender: cvData?.gender || '', // Хүйс
            address: cvData?.address || '', // Хаяг
            emergencyContact: cvData?.emergencyContact || '', // Яаралтай холбоо барих
            emergencyPhone: cvData?.emergencyPhone || '', // Яаралтай утасны дугаар
            // Ажлын байрны мэдээлэл
            hireDate: new Date().toISOString().split('T')[0], // Өнөөдөр
          }));
          
          // Ажлын байрны мэдээлэл байвал хэлтэс сонгох
          if (application.job) {
            // Ажлын байрны хэлтэс олох
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
      } else {
        console.error('Application мэдээлэл авахад алдаа:', response.statusText);
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
        
        // Хэрэглэгчийн мэдээллийг form-д бөглөх
        if (user) {
          const nameParts = user.name?.split(' ') || [];
          
          setFormData(prev => ({
            ...prev,
            middleName: nameParts.length > 1 ? nameParts[1] : nameParts[0] || '', // Нэр
            firstName: nameParts.length > 1 ? nameParts[0] : '', // Овог
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            // Ажлын байрны мэдээлэл
            hireDate: new Date().toISOString().split('T')[0], // Өнөөдөр
          }));
          
          // Application мэдээллийг хадгалах
          setApplicationInfo({
            jobTitle: user.position || '',
            userName: user.name,
            userEmail: user.email,
          });
        }
      } else {
        console.error('User мэдээлэл авахад алдаа:', response.statusText);
      }
    } catch (error) {
      console.error('User мэдээлэл авахад алдаа гарлаа:', error);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  useEffect(() => {
    // Application ID байвал тухайн хэрэглэгчийн мэдээллийг ачаалах
    const applicationId = searchParams.get('applicationId');
    if (applicationId) {
      fetchApplicationData(applicationId);
    }
    
    // User ID байвал тухайн хэрэглэгчийн мэдээллийг ачаалах
    const userId = searchParams.get('userId');
    if (userId) {
      fetchUserData(userId);
    }
  }, [searchParams, fetchApplicationData, fetchUserData]);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Регистерийн дугаар: эхний 2 үсэг (том), дараагийн 8 тоо
    if (name === 'employeeId' && value) {
      const upperValue = value.toUpperCase();
      
      // Эхний 2 тэмдэгт - зөвхөн үсэг
      if (upperValue.length <= 2) {
        if (/^[A-ZА-ЯЁӨҮ]*$/.test(upperValue)) {
          processedValue = upperValue;
        } else {
          return; // Үсэг биш бол буцаах
        }
      }
      // 3-аас эхлэн - зөвхөн тоо
      else {
        const letters = upperValue.slice(0, 2);
        const numbers = upperValue.slice(2);
        
        if (/^[A-ZА-ЯЁӨҮ]{2}$/.test(letters) && /^[0-9]*$/.test(numbers)) {
          processedValue = letters + numbers;
        } else {
          return; // Буруу формат бол буцаах
        }
      }
    }
    
    if ((name === 'lastName' || name === 'firstName' || name === 'middleName' || name === 'emergencyContact') && value) {
      const lettersOnly = /^[A-Za-zА-Яа-яЁёӨөҮү\s]*$/;
      if (!lettersOnly.test(value)) {
        return;
      }
      
      // Эхний үсгийг том үсэг болгох
      if (value.length > 0) {
        processedValue = value.charAt(0).toUpperCase() + value.slice(1);
      }
    }
    
    if ((name === 'phoneNumber' || name === 'emergencyPhone') && value) {
      const numbersOnly = /^[0-9]*$/;
      if (!numbersOnly.test(value)) {
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
        <p className="mt-2 text-gray-600">
          {searchParams.get('applicationId') 
            ? 'CV-г зөвшөөрсөн хэрэглэгчийн мэдээллийг бөглөнө үү' 
            : searchParams.get('userId')
            ? 'Сонгосон хэрэглэгчийн мэдээллийг бөглөнө үү'
            : 'Ажилтны үндсэн мэдээллийг оруулна уу'
          }
        </p>
        {(searchParams.get('applicationId') || searchParams.get('userId')) && (
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
                <div className="mt-2 text-xs text-blue-600">
                  {searchParams.get('applicationId') 
                    ? `Application ID: ${searchParams.get('applicationId')}`
                    : `User ID: ${searchParams.get('userId')}`
                  }
                </div>
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
                  maxLength={10}
                  placeholder="AA12345678"
                  title="Эхний 2 үсэг, дараа нь 8 тоо (жишээ: AA12345678)"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Эцэг/эхийн нэр</label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  pattern="[A-Za-zА-Яа-яЁёӨөҮү\s]+"
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

          {/* Яаралтай холбоо барих */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Яаралтай холбоо барих</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Ажлын мэдээлэл */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ажлын мэдээлэл</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ажилд орсон огноо *</label>
                <input
                  type="date"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                />
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

          {/* Товчнууд */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <Link
              href="/employer/hr/employees"
              className="px-6 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Цуцлах
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Хадгалж байна...' : 'Хадгалах'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
