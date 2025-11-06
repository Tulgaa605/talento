'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';

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

export default function EmployeeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEmployee = useCallback(async () => {
    try {
      const response = await fetch(`/api/hr/employees/${params.id}`);
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
  }, [params.id, router]);

  useEffect(() => {
    if (params.id) {
      fetchEmployee();
    }
  }, [params.id, fetchEmployee]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
          <Link
            href={`/employer/hr/employees/${employee.id}/edit`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Засах
          </Link>
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

