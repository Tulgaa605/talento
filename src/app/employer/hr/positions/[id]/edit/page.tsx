'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Position {
  id: string;
  title: string;
  code: string;
  description?: string;
  departmentId: string;
  department: { id: string; name: string };
}

interface Department {
  id: string;
  name: string;
  code: string;
}

export default function EditPositionPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [, setPosition] = useState<Position | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    departmentId: '',
  });

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        const [posRes, deptRes] = await Promise.all([
          fetch(`/api/hr/positions/${id}`),
          fetch('/api/hr/departments'),
        ]);

        if (!posRes.ok) {
          console.error('Албан тушаал олдсонгүй');
          router.push('/hr/positions');
          return;
        }

        const posData: Position = await posRes.json();
        setPosition(posData);
        setFormData({
          title: posData.title ?? '',
          code: posData.code ?? '',
          description: posData.description ?? '',
          departmentId: posData.departmentId ?? '',
        });

        if (deptRes.ok) {
          const deptData: Department[] = await deptRes.json();
          setDepartments(deptData);
        }
      } catch (err) {
        console.error('Мэдээлэл авахад алдаа гарлаа:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch(`/api/hr/positions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/hr/positions');
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Албан тушаалын мэдээлэл шинэчлэхэд алдаа гарлаа');
      }
    } catch (err) {
      console.error('Мэдээлэл шинэчлэхэд алдаа гарлаа:', err);
      alert('Мэдээлэл шинэчлэхэд алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">Албан тушаалын мэдээлэл засах</h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тушаалын нэр *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тушаалын код *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Хэлтэс *
                </label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Хэлтэс сонгох</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тайлбар
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Албан тушаалын тайлбар..."
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
