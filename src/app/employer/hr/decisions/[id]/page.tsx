'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Decision {
  id: string;
  decisionNumber: string;
  title: string;
  type: string;
  decisionDate: string;
  effectiveDate?: string;
  description: string;
  status: string;
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
  };
  createdAt: string;
  updatedAt: string;
}

export default function ViewDecisionPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [decision, setDecision] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDecision = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/hr/decisions/${id}`);
      if (response.ok) {
        const data: Decision = await response.json();
        setDecision(data);
      } else {
        alert('Шийдвэр олдсонгүй');
        router.push('/employer/hr/decisions');
      }
    } catch (error) {
      console.error('Мэдээлэл авахад алдаа гарлаа:', error);
      alert('Мэдээлэл авахад алдаа гарлаа');
      router.push('/employer/hr/decisions');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchDecision();
  }, [fetchDecision]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Идэвхтэй';
      case 'PENDING':
        return 'Хүлээгдэж буй';
      case 'CANCELLED':
        return 'Цуцлагдсан';
      default:
        return status;
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Шийдвэр олдсонгүй</h2>
          <button
            onClick={() => router.push('/employer/hr/decisions')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Буцах
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">{decision.title}</h1>
            <p className="text-gray-600 mt-1">Шийдвэрийн дугаар: {decision.decisionNumber}</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Ерөнхий мэдээлэл */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Шийдвэрийн төрөл
                </label>
                <p className="text-base font-medium text-gray-900">
                  {getDecisionTypeLabel(decision.type)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Төлөв</label>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                    decision.status
                  )}`}
                >
                  {getStatusLabel(decision.status)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Шийдвэр гарсан огноо
                </label>
                <p className="text-base font-medium text-gray-900">
                  {formatDate(decision.decisionDate)}
                </p>
              </div>

              {decision.effectiveDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Хэрэгжих огноо
                  </label>
                  <p className="text-base font-medium text-gray-900">
                    {formatDate(decision.effectiveDate)}
                  </p>
                </div>
              )}
            </div>

            {/* Ажилтны мэдээлэл */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ажилтны мэдээлэл</h2>
              <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Нэр</label>
                  <p className="text-base font-medium text-gray-900">
                    {decision.employee.firstName} {decision.employee.lastName}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Ажилтны дугаар
                  </label>
                  <p className="text-base font-medium text-gray-900">
                    {decision.employee.employeeId}
                  </p>
                </div>

                {decision.employee.position && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Албан тушаал
                    </label>
                    <p className="text-base font-medium text-gray-900">
                      {decision.employee.position.title}
                    </p>
                  </div>
                )}

                {decision.employee.position?.department && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Хэлтэс</label>
                    <p className="text-base font-medium text-gray-900">
                      {decision.employee.position.department.name}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Тайлбар */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Тайлбар</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{decision.description}</p>
              </div>
            </div>

            {/* Систем мэдээлэл */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Систем мэдээлэл</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Үүсгэсэн огноо
                  </label>
                  <p className="text-gray-700">
                    {new Date(decision.createdAt).toLocaleString('mn-MN')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Сүүлд шинэчилсэн
                  </label>
                  <p className="text-gray-700">
                    {new Date(decision.updatedAt).toLocaleString('mn-MN')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons at bottom */}
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Буцах
          </button>
          <Link
            href={`/employer/hr/decisions/${decision.id}/edit`}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Засах
          </Link>
        </div>
      </div>
    </div>
  );
}

