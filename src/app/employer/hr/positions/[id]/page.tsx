'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DetailPageSkeleton } from '@/components/Skeletons';
import { ArrowLeftIcon, PencilIcon, UsersIcon } from '@heroicons/react/24/outline';

interface Position {
  id: string;
  title: string;
  code: string;
  description: string;
  requirements: string;
  salaryRange: string;
  department: {
    id: string;
    name: string;
    code: string;
  };
  employees: {
    id: string;
    firstName: string;
    middleName: string;
    employeeId: string;
    email: string;
    phoneNumber: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export default function PositionDetailPage() {
  const params = useParams();
  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchPosition(params.id as string);
    }
  }, [params.id]);

  const fetchPosition = async (id: string) => {
    try {
      const response = await fetch(`/api/hr/positions/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPosition(data);
      } else {
        console.error('Failed to fetch position');
      }
    } catch (error) {
      console.error('Error fetching position:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <DetailPageSkeleton />
      </div>
    );
  }

  if (!position) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Албан тушаал олдсонгүй</p>
          <Link
            href="/employer/hr/positions"
            className="text-blue-600 hover:text-blue-800"
          >
            Буцах
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/employer/hr/positions"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Буцах
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {position.title}
              </h1>
              <p className="mt-2 text-gray-600">
                Код: {position.code} | {position.department.name}
              </p>
            </div>
            <Link
              href={`/employer/hr/positions/${position.id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              Засах
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Албан тушаалын мэдээлэл</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Албан тушаалын код
                </label>
                <p className="text-gray-900 font-medium">{position.code}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Албан тушаалын нэр
                </label>
                <p className="text-gray-900 font-medium">{position.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Хэлтэс
                </label>
                <p className="text-gray-900">
                  {position.department.name} ({position.department.code})
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Цалингийн хязгаар
                </label>
                <p className="text-gray-900">{position.salaryRange || 'Тодорхойгүй'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Тайлбар
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">{position.description}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Шаардлага
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">{position.requirements || 'Тодорхойгүй'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Үүсгэсэн огноо
                </label>
                <p className="text-gray-900">{formatDate(position.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Сүүлд засварласан
                </label>
                <p className="text-gray-900">{formatDate(position.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Employees */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <UsersIcon className="h-6 w-6 mr-2" />
                Энэ тушаалд ажиллаж буй ажилтнууд
              </h2>
              <span className="text-sm text-gray-500">
                Нийт: {position.employees.length}
              </span>
            </div>
          </div>
          {position.employees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ажилтны код
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Нэр
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Имэйл
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Утас
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Үйлдэл
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {position.employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employee.employeeId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.firstName} {employee.middleName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.phoneNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/employer/hr/employees/${employee.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Харах
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              Энэ тушаалд ажиллаж буй ажилтан байхгүй байна
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

