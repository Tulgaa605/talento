'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrashIcon } from '@heroicons/react/24/outline';

interface Decision {
  id: string;
  decisionNumber: string;
  title: string;
  description: string;
  type: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  decisionDate: string;
  effectiveDate: string;
  status: string;
  createdAt: string;
}

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchDecisions();
  }, []);

  const fetchDecisions = async () => {
    try {
      const response = await fetch('/api/hr/decisions');
      if (response.ok) {
        const data = await response.json();
        setDecisions(data);
      }
    } catch (error) {
      console.error('Error fetching decisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDecisions = decisions.filter(decision => {
    const matchesSearch = 
      decision.decisionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      decision.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      decision.employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      decision.employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      decision.employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || decision.status === statusFilter;
    const matchesType = typeFilter === '' || decision.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDelete = async (decisionId: string) => {
    if (confirm('Энэ шийдвэрийг устгахдаа итгэлтэй байна уу?')) {
      try {
        const response = await fetch(`/api/hr/decisions/${decisionId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Шийдвэр амжилттай устгагдлаа');
          fetchDecisions();
        } else {
          const error = await response.json();
          alert(error.error || 'Алдаа гарлаа');
        }
      } catch (error) {
        console.error('Шийдвэр устгахад алдаа гарлаа:', error);
        alert('Алдаа гарлаа');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('mn-MN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDecisionTypeLabel = (type: string) => {
    switch (type) {
      case 'HIRING':
        return 'Ажилд авах';
      case 'PROMOTION':
        return 'Дэвшүүлэх';
      case 'TRANSFER':
        return 'Шилжүүлэх';
      case 'TERMINATION':
        return 'Ажлаас хасах';
      case 'SALARY_CHANGE':
        return 'Цалин өөрчлөх';
      case 'OTHER':
        return 'Бусад';
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

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex justify-between items-center sm:mb-7 sm:mt-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Удирдлагын шийдвэрүүд</h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600">Бүх удирдлагын шийдвэрийн жагсаалт</p>
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
              href="/employer/hr/decisions/new"
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Шинэ шийдвэр үүсгэх</span>
              <span className="sm:hidden">Шинэ шийдвэр</span>
            </Link>
          </div>
        </div>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Хайх
              </label>
              <input
                type="text"
                placeholder="Шийдвэрийн дугаар, гарчиг, ажилтны нэр..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Төлөв
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Бүгд</option>
                <option value="ACTIVE">Идэвхтэй</option>
                <option value="PENDING">Хүлээгдэж буй</option>
                <option value="CANCELLED">Цуцлагдсан</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Шийдвэрийн төрөл
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Бүгд</option>
                <option value="HIRING">Ажилд авах</option>
                <option value="PROMOTION">Дэвшүүлэх</option>
                <option value="TRANSFER">Шилжүүлэх</option>
                <option value="TERMINATION">Ажлаас халах</option>
                <option value="SALARY_CHANGE">Цалин өөрчлөх</option>
                <option value="OTHER">Бусад</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setTypeFilter('');
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
                  Шийдвэрийн дугаар
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Гарчиг
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ажилтан
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Төрөл
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Шийдвэр гарсан огноо
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Хэрэгжих огноо
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Төлөв
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Үйлдэл
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDecisions.map((decision) => (
                <tr key={decision.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                    {decision.decisionNumber}
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="text-xs sm:text-sm font-medium text-gray-900">
                      {decision.title}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate max-w-xs">
                      {decision.description}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        {decision.employee.firstName} {decision.employee.lastName}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {decision.employee.employeeId}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {getDecisionTypeLabel(decision.type)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {formatDate(decision.decisionDate)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {formatDate(decision.effectiveDate)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(decision.status)}`}>
                      {decision.status === 'ACTIVE' ? 'Идэвхтэй' : 
                       decision.status === 'PENDING' ? 'Хүлээгдэж буй' : 
                       decision.status === 'CANCELLED' ? 'Цуцлагдсан' : decision.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                    <div className="flex space-x-1 sm:space-x-2">
                      <Link
                        href={`/employer/hr/decisions/${decision.id}`}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <span className="hidden sm:inline">Харах</span>
                        <span className="sm:hidden">👁️</span>
                      </Link>
                      <Link
                        href={`/employer/hr/decisions/${decision.id}/edit`}
                        className="text-green-600 hover:text-green-900 p-1"
                      >
                        <span className="hidden sm:inline">Засах</span>
                        <span className="sm:hidden">✏️</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(decision.id)}
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

        {filteredDecisions.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <svg className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900">Шийдвэр олдсонгүй</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              {searchTerm || statusFilter || typeFilter 
                ? 'Хайлтын нөхцөлд тохирох шийдвэр байхгүй байна.' 
                : 'Одоогоор бүртгэгдсэн шийдвэр байхгүй байна.'}
            </p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
