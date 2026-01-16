'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrashIcon, 
  BriefcaseIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UsersIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { ListSkeleton, PageHeaderSkeleton, SearchBarSkeleton } from '@/components/Skeletons';

interface Position {
  id: string;
  title: string;
  description: string;
  code: string;
  department: {
    id: string;
    name: string;
    code: string;
  };
  salaryRange: string;
  requirements: string;
  employees: {
    id: string;
    firstName: string;
    lastName?: string;
    middleName?: string;
    employeeId: string;
  }[];
  createdAt: string;
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string; code: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  const loadData = async () => {
    try {
      const [positionsRes, departmentsRes] = await Promise.all([
        fetch('/api/hr/positions'),
        fetch('/api/hr/departments')
      ]);
      
      if (positionsRes.ok) {
        const positionsData = await positionsRes.json();
        setPositions(positionsData);
      }
      
      if (departmentsRes.ok) {
        const departmentsData = await departmentsRes.json();
        setDepartments(departmentsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPositions = positions.filter(position => {
    const matchesSearch = 
      position.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === '' || position.department.id === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const handleDelete = async (positionId: string) => {
    if (confirm('Энэ албан тушаалыг устгахдаа итгэлтэй байна уу?')) {
      try {
        const response = await fetch(`/api/hr/positions/${positionId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Албан тушаал амжилттай устгагдлаа');
          loadData();
        } else {
          const error = await response.json();
          alert(error.error || 'Алдаа гарлаа');
        }
      } catch (error) {
        console.error('Албан тушаал устгахад алдаа гарлаа:', error);
        alert('Алдаа гарлаа');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('mn-MN');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <PageHeaderSkeleton />
        <SearchBarSkeleton />
        <ListSkeleton count={8} />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8 sm:mt-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Албан тушаалууд</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Албан тушаалуудын жагсаалт болон удирдлага
              </p>
              <div className="hidden-on-screen mt-2 text-sm text-gray-500">
                Хэвлэсэн огноо: {new Date().toLocaleString('mn-MN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            <div className="flex gap-2 print:hidden">
              <Link
                href="/employer/hr/positions/new"
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Шинэ тушаал</span>
                <span className="sm:hidden">Шинэ</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Хайх
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Тушаалын нэр, код..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 text-gray-700 focus:border-blue-500 w-full text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Хэлтэс
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Бүгд</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name} ({department.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDepartmentFilter('');
                }}
                className="w-full px-3 sm:px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm"
              >
                Цэвэрлэх
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredPositions.map((position) => (
            <div key={position.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center min-w-0 flex-1">
                    <BriefcaseIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mr-2 sm:mr-3 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {position.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Код: {position.code}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1 sm:space-x-2 ml-2">
                    <Link
                      href={`/employer/hr/positions/${position.id}`}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Үзэх"
                    >
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <Link
                      href={`/employer/hr/positions/${position.id}/edit`}
                      className="text-green-600 hover:text-green-900 p-1"
                      title="Засах"
                    >
                      <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(position.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Устгах"
                    >
                      <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>

                {position.description && (
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                    {position.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center">
                      <UsersIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-1 sm:mr-2 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {position.employees?.length || 0}
                        </p>
                        <p className="text-xs text-gray-500">Ажилтны</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-1 sm:mr-2 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {position.department?.name || '-'}
                        </p>
                        <p className="text-xs text-gray-500">Хэлтэс</p>
                      </div>
                    </div>
                  </div>
                </div>

                {position.salaryRange && (
                  <div className="mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Цалин хязгаар</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900">{position.salaryRange}</p>
                  </div>
                )}

                {position.employees && position.employees.length > 0 && (
                  <div className="mb-3 sm:mb-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Ажилтнууд:</h4>
                    <div className="space-y-1">
                      {position.employees.slice(0, 3).map((employee) => (
                        <div key={employee.id} className="text-xs sm:text-sm text-gray-600 truncate">
                          • {employee.firstName} {employee.middleName || employee.lastName || ''} ({employee.employeeId})
                        </div>
                      ))}
                      {position.employees.length > 3 && (
                        <div className="text-xs sm:text-sm text-gray-500">
                          +{position.employees.length - 3} нэмэгдэл
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Үүсгэсэн: {formatDate(position.createdAt)}
                    </span>
                    <Link
                      href={`/employer/hr/positions/${position.id}`}
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

        {filteredPositions.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <BriefcaseIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <div className="text-sm sm:text-base text-gray-500">
              {searchTerm || departmentFilter ? 'Хайлтын үр дүн олдсонгүй' : 'Тушаал олдсонгүй'}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
