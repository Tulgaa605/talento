'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

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
  };
}

export default function EditDecisionPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [decision, setDecision] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    decisionNumber: '',
    title: '',
    type: '',
    decisionDate: '',
    effectiveDate: '',
    description: '',
    status: 'PENDING',
  });

  const fetchDecision = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/hr/decisions/${id}`);
      if (response.ok) {
        const data: Decision = await response.json();
        setDecision(data);
        setFormData({
          decisionNumber: data.decisionNumber || '',
          title: data.title || '',
          type: data.type || '',
          decisionDate: data.decisionDate
            ? new Date(data.decisionDate).toISOString().split('T')[0]
            : '',
          effectiveDate: data.effectiveDate
            ? new Date(data.effectiveDate).toISOString().split('T')[0]
            : '',
          description: data.description || '',
          status: data.status || 'PENDING',
        });
      } else {
        router.push('/hr/decisions');
      }
    } catch (error) {
      console.error('Мэдээлэл авахад алдаа гарлаа:', error);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchDecision();
  }, [fetchDecision]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setSaving(true);
      const response = await fetch(`/api/hr/decisions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/hr/decisions');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Шидвэрийн мэдээлэл шинэчлэхэд алдаа гарлаа');
      }
    } catch (error) {
      console.error('Мэдээлэл шинэчлэхэд алдаа гарлаа:', error);
      alert('Мэдээлэл шинэчлэхэд алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Буцах
          </button>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Шидвэрийн мэдээлэл засах</h1>
            {decision && (
              <p className="text-sm text-gray-600 mt-1">
                Ажилтан: {decision.employee.firstName} {decision.employee.lastName} (
                {decision.employee.employeeId})
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Шидвэрийн дугаар *
                </label>
                <input
                  type="text"
                  name="decisionNumber"
                  value={formData.decisionNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Гарчиг *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Шидвэрийн гарчиг"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Шидвэрийн төрөл *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Төрөл сонгох</option>
                  <option value="HIRING">Ажилд авах</option>
                  <option value="PROMOTION">Дэвшүүлэх</option>
                  <option value="TRANSFER">Шилжүүлэх</option>
                  <option value="TERMINATION">Ажлаас хасах</option>
                  <option value="SALARY_CHANGE">Цалин өөрчлөх</option>
                  <option value="OTHER">Бусад</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Шидвэр гарсан огноо *
                </label>
                <input
                  type="date"
                  name="decisionDate"
                  value={formData.decisionDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Хэрэгжих огноо</label>
                <input
                  type="date"
                  name="effectiveDate"
                  value={formData.effectiveDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Төлөв</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">Хүлээгдэж буй</option>
                  <option value="ACTIVE">Идэвхтэй</option>
                  <option value="CANCELLED">Цуцлагдсан</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Тайлбар *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Шидвэрийн тайлбар..."
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Цуцлах
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
