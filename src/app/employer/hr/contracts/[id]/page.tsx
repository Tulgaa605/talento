'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
  probationPeriod: number | null;
  workSchedule: string | null;
  benefits: string | null;
  terms: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function ContractDetailPage() {
  const params = useParams();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchContract(params.id as string);
    }
  }, [params.id]);

  const fetchContract = async (id: string) => {
    try {
      const response = await fetch(`/api/hr/contracts?employeeId=${id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setContract(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadWord = async () => {
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
    } catch (error) {
      console.error('Word татахад алдаа:', error);
      alert(error instanceof Error ? error.message : 'Word файл татахад алдаа гарлаа');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Уншиж байна...</div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Гэрээ олдсонгүй</p>
          <Link href="/employer/hr/contracts" className="text-blue-600 hover:text-blue-800">
            Буцах
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/employer/hr/contracts" className="text-blue-600 hover:text-blue-800">
            ← Буцах
          </Link>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadWord}
              disabled={downloading}
              className={`px-4 py-2 rounded-md text-white ${
                downloading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {downloading ? 'Татаж байна...' : 'Word татах'}
            </button>
            <Link
              href={`/employer/hr/contracts/${contract.id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Засах
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Хөдөлмөрийн гэрээ: {contract.contractNumber}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ажилтны мэдээлэл</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Нэр</p>
                  <p className="text-sm font-medium text-gray-900">
                    {contract.employee.lastName} {contract.employee.firstName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ажилтны код</p>
                  <p className="text-sm font-medium text-gray-900">{contract.employee.employeeId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Албан тушаал</p>
                  <p className="text-sm font-medium text-gray-900">
                    {contract.employee.position?.title || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Хэлтэс</p>
                  <p className="text-sm font-medium text-gray-900">
                    {contract.employee.department?.name || contract.employee.position?.department?.name || '-'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Гэрээний мэдээлэл</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Гэрээний төрөл</p>
                  <p className="text-sm font-medium text-gray-900">{contract.contractType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Эхлэх огноо</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(contract.startDate).toLocaleDateString('mn-MN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Дуусах огноо</p>
                  <p className="text-sm font-medium text-gray-900">
                    {contract.endDate ? new Date(contract.endDate).toLocaleDateString('mn-MN') : 'Тодорхойгүй'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Цалин</p>
                  <p className="text-sm font-medium text-gray-900">
                    {contract.salary.toLocaleString()} {contract.currency}
                  </p>
                </div>
                {contract.probationPeriod && (
                  <div>
                    <p className="text-sm text-gray-500">Туршилтын хугацаа</p>
                    <p className="text-sm font-medium text-gray-900">{contract.probationPeriod} сар</p>
                  </div>
                )}
                {contract.workSchedule && (
                  <div>
                    <p className="text-sm text-gray-500">Ажлын цагийн хуваарь</p>
                    <p className="text-sm font-medium text-gray-900">{contract.workSchedule}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Төлөв</p>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      contract.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : contract.status === 'EXPIRED'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {contract.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {contract.benefits && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Хангамж</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{contract.benefits}</p>
            </div>
          )}

          {contract.terms && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Нөхцөл</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{contract.terms}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

