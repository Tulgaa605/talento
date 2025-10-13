'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrashIcon } from '@heroicons/react/24/outline';

interface Contract {
  id: string;
  contractNumber: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  contractType: string;
  startDate: string;
  endDate: string | null;
  salary: number;
  currency: string;
  status: string;
  createdAt: string;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [contractTypeFilter, setContractTypeFilter] = useState('');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await fetch('/api/hr/contracts');
      if (response.ok) {
        const data = await response.json();
        setContracts(data);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || contract.status === statusFilter;
    const matchesType = contractTypeFilter === '' || contract.contractType === contractTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDelete = async (contractId: string) => {
    if (confirm('Энэ гэрээг устгахдаа итгэлтэй байна уу?')) {
      try {
        const response = await fetch(`/api/hr/contracts/${contractId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Гэрээ амжилттай устгагдлаа');
          fetchContracts();
        } else {
          const error = await response.json();
          alert(error.error || 'Алдаа гарлаа');
        }
      } catch (error) {
        console.error('Гэрээ устгахад алдаа гарлаа:', error);
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
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getContractTypeLabel = (type: string) => {
    switch (type) {
      case 'FULL_TIME':
        return 'Бүтэн цагийн';
      case 'PART_TIME':
        return 'Хагас цагийн';
      case 'CONTRACT':
        return 'Гэрээт';
      case 'INTERNSHIP':
        return 'Дадлага';
      case 'PROBATION':
        return 'Туршилтын';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="flex justify-between items-center sm:mb-7 sm:mt-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Хөдөлмөрийн гэрээнүүд</h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600">Бүх хөдөлмөрийн гэрээний жагсаалт</p>
        </div>
        <div className="sm:flex-row gap-4">
          <Link
            href="/hr/contracts/new"
            className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Шинэ гэрээ үүсгэх</span>
            <span className="sm:hidden">Шинэ гэрээ</span>
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
                placeholder="Гэрээний дугаар, ажилтны нэр..."
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
                <option value="EXPIRED">Дууссан</option>
                <option value="PENDING">Хүлээгдэж буй</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Гэрээний төрөл
              </label>
              <select
                value={contractTypeFilter}
                onChange={(e) => setContractTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Бүгд</option>
                <option value="FULL_TIME">Бүтэн цагийн</option>
                <option value="PART_TIME">Хагас цагийн</option>
                <option value="CONTRACT">Гэрээт</option>
                <option value="INTERNSHIP">Дадлага</option>
                <option value="PROBATION">Туршилтын</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setContractTypeFilter('');
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
                  Гэрээний дугаар
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ажилтан
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Төрөл
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Эхлэх огноо
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дуусах огноо
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Цалин
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
              {filteredContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                    {contract.contractNumber}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        {contract.employee.firstName} {contract.employee.lastName}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {contract.employee.employeeId}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {getContractTypeLabel(contract.contractType)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {formatDate(contract.startDate)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {contract.endDate ? formatDate(contract.endDate) : '-'}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {contract.salary.toLocaleString()} {contract.currency}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                      {contract.status === 'ACTIVE' ? 'Идэвхтэй' : 
                       contract.status === 'EXPIRED' ? 'Дууссан' : 
                       contract.status === 'PENDING' ? 'Хүлээгдэж буй' : contract.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                    <div className="flex space-x-1 sm:space-x-2">
                      <Link
                        href={`/hr/contracts/${contract.id}`}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <span className="hidden sm:inline">Харах</span>
                        <span className="sm:hidden">👁️</span>
                      </Link>
                      <Link
                        href={`/hr/contracts/${contract.id}/edit`}
                        className="text-green-600 hover:text-green-900 p-1"
                      >
                        <span className="hidden sm:inline">Засах</span>
                        <span className="sm:hidden">✏️</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(contract.id)}
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

        {filteredContracts.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <svg className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900">Гэрээ олдсонгүй</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              {searchTerm || statusFilter || contractTypeFilter 
                ? 'Хайлтын нөхцөлд тохирох гэрээ байхгүй байна.' 
                : 'Одоогоор бүртгэгдсэн гэрээ байхгүй байна.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
