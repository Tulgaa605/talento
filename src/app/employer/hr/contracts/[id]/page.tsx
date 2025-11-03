'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Contract {
  id: string;
  contractNumber: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    position?: {
      title: string;
      department?: {
        name: string;
      };
    };
    department?: {
      name: string;
    };
  };
  contractType: string;
  startDate: string;
  endDate: string | null;
  salary: number;
  currency: string;
  status: string;
  workSchedule?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [contractId, setContractId] = useState<string | null>(null);

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params;
      setContractId(resolvedParams.id);
    };
    initParams();
  }, [params]);

  useEffect(() => {
    if (!contractId) return;

    const fetchContract = async () => {
      try {
        const response = await fetch(`/api/hr/contracts/${contractId}`);
        if (!response.ok) {
          throw new Error('Гэрээ олдсонгүй');
        }
        const data = await response.json();
        setContract(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Алдаа гарлаа');
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId]);

  const handleGenerateWord = async () => {
    if (!contract) return;
    
    setDownloading(true);
    try {
      const response = await fetch(`/api/hr/contracts/${contract.id}/generate-word`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Word файл үүсгэхэд алдаа гарлаа');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contract.contractNumber}_Хөдөлмөрийн_гэрээ.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Word хэвлэхэд алдаа:', err);
      alert(err instanceof Error ? err.message : 'Word хэвлэхэд алдаа гарлаа');
    } finally {
      setDownloading(false);
    }
  };

  const getContractTypeName = (type: string) => {
    const types: Record<string, string> = {
      'FULL_TIME': 'Бүтэн цагийн',
      'PART_TIME': 'Хагас цагийн',
      'CONTRACT': 'Гэрээт',
      'TEMPORARY': 'Түр',
      'SEASONAL': 'Улирлын',
    };
    return types[type] || type;
  };

  const getStatusName = (status: string) => {
    const statuses: Record<string, string> = {
      'ACTIVE': 'Идэвхтэй',
      'TERMINATED': 'Цуцлагдсан',
      'EXPIRED': 'Дууссан',
      'PENDING': 'Хүлээгдэж буй',
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'TERMINATED': 'bg-red-100 text-red-800',
      'EXPIRED': 'bg-gray-100 text-gray-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ачааллаж байна...</p>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Алдаа гарлаа</h2>
          <p className="text-gray-600 mb-4">{error || 'Гэрээ олдсонгүй'}</p>
          <Link
            href="/employer/hr/contracts"
            className="text-indigo-600 hover:text-indigo-800 underline"
          >
            Буцах
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/employer/hr/contracts"
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 mb-4"
          >
            ← Буцах
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Гэрээний дэлгэрэнгүй
              </h1>
              <p className="text-gray-600 mt-1">
                Гэрээний дугаар: {contract.contractNumber}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
              {getStatusName(contract.status)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/employer/hr/contracts/${contract.id}/edit`}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Засах
            </Link>
            <button
              onClick={handleGenerateWord}
              disabled={downloading}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {downloading ? 'Үүсгэж байна...' : 'Word хэвлэх'}
            </button>
          </div>
        </div>

        {/* Contract Details */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ажилчны мэдээлэл</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Овог</label>
              <p className="mt-1 text-gray-900">{contract.employee.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Нэр</label>
              <p className="mt-1 text-gray-900">{contract.employee.firstName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ажилчны дугаар</label>
              <p className="mt-1 text-gray-900">{contract.employee.employeeId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Албан тушаал</label>
              <p className="mt-1 text-gray-900">
                {contract.employee.position?.title || 'Тодорхойгүй'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Хэлтэс</label>
              <p className="mt-1 text-gray-900">
                {contract.employee.department?.name || 
                 contract.employee.position?.department?.name || 
                 'Тодорхойгүй'}
              </p>
            </div>
          </div>
        </div>

        {/* Contract Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Гэрээний мэдээлэл</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Гэрээний төрөл</label>
              <p className="mt-1 text-gray-900">{getContractTypeName(contract.contractType)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Цалин</label>
              <p className="mt-1 text-gray-900">
                {contract.salary.toLocaleString()} {contract.currency}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Эхлэх огноо</label>
              <p className="mt-1 text-gray-900">
                {new Date(contract.startDate).toLocaleDateString('mn-MN')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Дуусах огноо</label>
              <p className="mt-1 text-gray-900">
                {contract.endDate 
                  ? new Date(contract.endDate).toLocaleDateString('mn-MN')
                  : 'Тодорхой хугацаагүй'
                }
              </p>
            </div>
            {contract.workSchedule && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Ажлын цагийн хуваарь</label>
                <p className="mt-1 text-gray-900">{contract.workSchedule}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Үүсгэсэн огноо</label>
              <p className="mt-1 text-gray-900">
                {new Date(contract.createdAt).toLocaleString('mn-MN')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Сүүлд засварласан</label>
              <p className="mt-1 text-gray-900">
                {new Date(contract.updatedAt).toLocaleString('mn-MN')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

