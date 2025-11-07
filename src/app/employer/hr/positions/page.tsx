'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrashIcon } from '@heroicons/react/24/outline';

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
    lastName: string;
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

  useEffect(() => {
    fetchPositions();
    fetchDepartments();
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/hr/positions');
      if (response.ok) {
        const data = await response.json();
        setPositions(data);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/hr/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

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
          fetchPositions();
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl px-1 mx-auto sm:py-6 lg:py-8">
        <div className="flex justify-between items-center sm:mt-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Албан тушаалууд</h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600">Бүх албан тушаалуудын жагсаалт</p>
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
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Шинэ тушаал үүсгэх</span>
              <span className="sm:hidden">Шинэ тушаал</span>
            </Link>
          </div>
        </div>

      <div className="bg-white rounded-lg shadow mt-5">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Хайх
              </label>
              <input
                type="text"
                placeholder="Тушаалын нэр, код, тайлбар..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
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

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Тушаалын код
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Тушаалын нэр
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Хэлтэс
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Цалин хязгаар
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ажилтны тоо
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Үүсгэсэн огноо
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Үйлдэл
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPositions.map((position) => (
                <tr key={position.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                    {position.code}
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="text-xs sm:text-sm font-medium text-gray-900">
                      {position.title}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate max-w-xs">
                      {position.description}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        {position.department.name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {position.department.code}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {position.salaryRange || '-'}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm text-gray-900">
                      {position.employees.length} ажилтан
                    </div>
                    {position.employees.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {position.employees.slice(0, 2).map(emp => `${emp.firstName} ${emp.lastName}`).join(', ')}
                        {position.employees.length > 2 && ` +${position.employees.length - 2}`}
                      </div>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {formatDate(position.createdAt)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                    <div className="flex space-x-1 sm:space-x-2">
                      <Link
                        href={`/employer/hr/positions/${position.id}`}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <span className="hidden sm:inline">Харах</span>
                        <span className="sm:hidden">👁️</span>
                      </Link>
                      <Link
                        href={`/employer/hr/positions/${position.id}/edit`}
                        className="text-green-600 hover:text-green-900 p-1"
                      >
                        <span className="hidden sm:inline">Засах</span>
                        <span className="sm:hidden">✏️</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(position.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPositions.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <svg className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
            <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900">Тушаал олдсонгүй</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              {searchTerm || departmentFilter 
                ? 'Хайлтын нөхцөлд тохирох тушаал байхгүй байна.' 
                : 'Одоогоор бүртгэгдсэн тушаал байхгүй байна.'}
            </p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
