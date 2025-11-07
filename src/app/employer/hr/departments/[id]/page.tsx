'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { BuildingOfficeIcon, UsersIcon, PencilIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  positions: Array<{
    id: string;
    title: string;
    code: string;
  }>;
  employees: Array<{
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    position: {
      title: string;
    };
  }>;
}

export default function DepartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const departmentId = params?.id as string;
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDepartment = useCallback(async () => {
    try {
      const response = await fetch(`/api/hr/departments/${departmentId}`);
      if (response.ok) {
        const data = await response.json();
        setDepartment(data);
      } else {
        alert('Хэлтэс олдсонгүй');
        router.push('/employer/hr/departments');
      }
    } catch (error) {
      console.error('Error fetching department:', error);
      alert('Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  }, [departmentId, router]);

  useEffect(() => {
    if (departmentId) {
      fetchDepartment();
    }
  }, [departmentId, fetchDepartment]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Хэлтэс олдсонгүй</h3>
          <Link href="/employer/hr/departments" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            Буцах
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-6 sm:mt-10">
        <Link
          href="/employer/hr/departments"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Буцах
        </Link>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <div className="flex items-center space-x-3">
              <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{department.name}</h1>
                <p className="text-sm text-gray-600">Код: {department.code}</p>
              </div>
            </div>
          </div>
          <Link
            href={`/employer/hr/departments/${department.id}/edit`}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Засах
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Үндсэн мэдээлэл</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Хэлтсийн нэр</label>
                <p className="text-gray-900">{department.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Код</label>
                <p className="text-gray-900">{department.code}</p>
              </div>
              {department.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Тайлбар</label>
                  <p className="text-gray-900">{department.description}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Үүсгэсэн огноо</label>
                <p className="text-gray-900">{formatDate(department.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Positions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Албан тушаалууд</h2>
            {department.positions && department.positions.length > 0 ? (
              <div className="space-y-3">
                {department.positions.map((position) => (
                  <Link
                    key={position.id}
                    href={`/employer/hr/positions/${position.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{position.title}</p>
                        <p className="text-sm text-gray-600">Код: {position.code}</p>
                      </div>
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Албан тушаал байхгүй байна</p>
            )}
          </div>

          {/* Employees */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ажилтнууд</h2>
            {department.employees && department.employees.length > 0 ? (
              <div className="space-y-3">
                {department.employees.map((employee) => (
                  <Link
                    key={employee.id}
                    href={`/employer/hr/employees/${employee.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {employee.employeeId} • {employee.position.title}
                        </p>
                      </div>
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Ажилтан байхгүй байна</p>
            )}
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Статистик</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <UsersIcon className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Ажилтан</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {department.employees?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Албан тушаал</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {department.positions?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Үйлдлүүд</h2>
            <div className="space-y-3">
              <Link
                href={`/employer/hr/positions/new?departmentId=${department.id}`}
                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Албан тушаал нэмэх
              </Link>
              <Link
                href={`/employer/hr/employees/new?departmentId=${department.id}`}
                className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Ажилтан нэмэх
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

