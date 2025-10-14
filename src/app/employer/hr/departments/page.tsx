'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

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
  }>;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/hr/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Хэлтсүүдийг авахад алдаа гарлаа:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter(department =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    department.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (department.description && department.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (departmentId: string) => {
    if (confirm('Энэ хэлтсийн бүх албан тушаал болон ажилтнуудыг устгахдаа итгэлтэй байна уу?')) {
      try {
        const response = await fetch(`/api/hr/departments/${departmentId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Хэлтэс амжилттай устгагдлаа');
          fetchDepartments();
        } else {
          const error = await response.json();
          alert(error.error || 'Алдаа гарлаа');
        }
      } catch (error) {
        console.error('Хэлтэс устгахад алдаа гарлаа:', error);
        alert('Алдаа гарлаа');
      }
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Гарчиг */}
        <div className="mb-6 sm:mb-8 sm:mt-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Хэлтсүүд</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Хэлтсүүдийн жагсаалт болон удирдлага
              </p>
            </div>
            <Link
              href="/employer/hr/departments/new"
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Шинэ хэлтэс</span>
              <span className="sm:hidden">Шинэ</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6 p-4 sm:p-6">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Хайх
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
              <input
                type="text"
                placeholder="Хэлтсийн нэр, код..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 text-gray-700 focus:border-blue-500 w-full text-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredDepartments.map((department) => (
            <div key={department.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center min-w-0 flex-1">
                    <BuildingOfficeIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mr-2 sm:mr-3 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {department.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Код: {department.code}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1 sm:space-x-2 ml-2">
                    <Link
                      href={`/hr/departments/${department.id}/edit`}
                      className="text-green-600 hover:text-green-900 p-1"
                    >
                      <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(department.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>

                {department.description && (
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                    {department.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center">
                      <UsersIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-1 sm:mr-2 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {department.employees?.length || 0}
                        </p>
                        <p className="text-xs text-gray-500">Ажилтны</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-1 sm:mr-2 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {department.positions?.length || 0}
                        </p>
                        <p className="text-xs text-gray-500">Тушаал</p>
                      </div>
                    </div>
                  </div>
                </div>

                {department.positions && department.positions.length > 0 && (
                  <div className="mb-3 sm:mb-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Албан тушаалууд:</h4>
                    <div className="space-y-1">
                      {department.positions.slice(0, 3).map((position) => (
                        <div key={position.id} className="text-xs sm:text-sm text-gray-600 truncate">
                          • {position.title} ({position.code})
                        </div>
                      ))}
                      {department.positions.length > 3 && (
                        <div className="text-xs sm:text-sm text-gray-500">
                          +{department.positions.length - 3} нэмэгдэл
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Ажилтнууд */}
                {department.employees && department.employees.length > 0 && (
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Ажилтнууд:</h4>
                    <div className="space-y-1">
                      {department.employees.slice(0, 3).map((employee) => (
                        <div key={employee.id} className="text-xs sm:text-sm text-gray-600 truncate">
                          • {employee.firstName} {employee.lastName} ({employee.employeeId})
                        </div>
                      ))}
                      {department.employees.length > 3 && (
                        <div className="text-xs sm:text-sm text-gray-500">
                          +{department.employees.length - 3} нэмэгдэл
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Үүсгэсэн: {new Date(department.createdAt).toLocaleDateString('mn-MN')}
                    </span>
                    <Link
                      href={`/hr/departments/${department.id}`}
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Дэлгэрэнгүй харах →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDepartments.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <BuildingOfficeIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <div className="text-sm sm:text-base text-gray-500">
              {searchTerm ? 'Хайлтын үр дүн олдсонгүй' : 'Хэлтэс олдсонгүй'}
            </div>
          </div>
        )}
    </div>
  );
}
