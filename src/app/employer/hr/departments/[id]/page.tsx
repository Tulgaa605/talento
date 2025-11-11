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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-8 sm:mt-10">
          <Link
            href="/employer/hr/departments"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Буцах
          </Link>
          
          {/* Header Card */}
          <div className="bg-white rounded-lg shadow p-6 sm:p-8 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-start space-x-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <BuildingOfficeIcon className="h-10 w-10 text-gray-600" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-gray-900">{department.name}</h1>
                  <div className="flex items-center space-x-2">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                      {department.code}
                    </span>
                    <span className="text-gray-600 text-sm">
                      {formatDate(department.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href={`/employer/hr/departments/${department.id}/edit`}
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <PencilIcon className="h-5 w-5 mr-2" />
                Засах
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <UsersIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-600 text-sm">Ажилтнууд</span>
                </div>
                <p className="text-3xl font-bold mt-2 text-gray-900">{department.employees?.length || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600 text-sm">Албан тушаал</span>
                </div>
                <p className="text-3xl font-bold mt-2 text-gray-900">{department.positions?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Үндсэн мэдээлэл</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Хэлтсийн нэр</label>
                  <p className="text-lg font-medium text-gray-900">{department.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Код</label>
                  <p className="text-lg font-mono font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg inline-block">{department.code}</p>
                </div>
                {department.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Тайлбар</label>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">{department.description}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Үүсгэсэн огноо</label>
                  <div className="flex items-center space-x-2 text-gray-900">
                    <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">{formatDate(department.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Positions & Employees */}
          <div className="space-y-6">
            {/* Positions */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Албан тушаалууд</h2>
                <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
                  {department.positions?.length || 0}
                </span>
              </div>
              {department.positions && department.positions.length > 0 ? (
                <div className="space-y-3">
                  {department.positions.map((position) => (
                    <Link
                      key={position.id}
                      href={`/employer/hr/positions/${position.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{position.title}</p>
                            <p className="text-sm text-gray-500 font-mono">{position.code}</p>
                          </div>
                        </div>
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 mt-2">Албан тушаал байхгүй байна</p>
                </div>
              )}
            </div>

            {/* Employees */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Ажилтнууд</h2>
                <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
                  {department.employees?.length || 0}
                </span>
              </div>
              {department.employees && department.employees.length > 0 ? (
                <div className="space-y-3">
                  {department.employees.map((employee) => (
                    <Link
                      key={employee.id}
                      href={`/employer/hr/employees/${employee.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <UsersIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {employee.lastName} {employee.firstName}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{employee.employeeId}</span>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-600">{employee.position.title}</span>
                            </div>
                          </div>
                        </div>
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <UsersIcon className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="text-gray-500 mt-2">Ажилтан байхгүй байна</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

