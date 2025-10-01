'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/providers/NotificationProvider';
import GovernmentEmployeeQuestionnaire from '@/components/GovernmentEmployeeQuestionnaire';
import type { GovernmentEmployeeForm } from '@/components/GovernmentEmployeeQuestionnaire'; // make sure this type is exported

interface Question {
  id: string;
  text: string;
  type: string;
  required: boolean;
  options: string[];
  order: number;
}

interface Questionnaire {
  id: string;
  title: string;
  description: string;
  type: string;
  questions: Question[];
  createdAt: string;
}

type AnswersPayload = Record<string, string | string[]>;

export default function GovernmentQuestionnairePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { status } = useSession();
  const router = useRouter();
  const { addNotification } = useNotification();
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        const { id } = await params;
        const response = await fetch(`/api/questionnaires/${id}`);
        if (!response.ok) throw new Error('Асуулга олдсонгүй');
        const data: Questionnaire = await response.json();
        setQuestionnaire(data);
      } catch (error) {
        console.error('Error fetching questionnaire:', error);
        addNotification('Асуулга татахдаа алдаа гарлаа', 'error');
        router.push('/jobs');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      void fetchQuestionnaire();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, params, router, addNotification]);

  // Convert the strongly-typed form to a string/string[] map for the API
  const toAnswersPayload = (data: GovernmentEmployeeForm): AnswersPayload => {
    const entries = Object.entries(
      data as unknown as Record<string, unknown>
    );
    const normalized: AnswersPayload = {};
    for (const [key, value] of entries) {
      if (Array.isArray(value)) {
        // keep only strings, stringify non-strings just in case
        normalized[key] = value.map(v =>
          typeof v === 'string' ? v : String(v ?? '')
        );
      } else if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        normalized[key] = String(value);
      } else if (value == null) {
        normalized[key] = '';
      } else {
        // objects, dates, etc.
        normalized[key] = String(value);
      }
    }
    return normalized;
  };

  const handleSubmit = async (formData: GovernmentEmployeeForm) => {
    if (!questionnaire) return;

    setSubmitting(true);
    try {
      const payload = toAnswersPayload(formData);

      const response = await fetch(
        `/api/questionnaires/${questionnaire.id}/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: payload }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Асуулга илгээхэд алдаа гарлаа');
      }

      addNotification('Асуулга амжилттай илгээгдлээ', 'success');
      router.push('/jobseeker/applications');
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      addNotification(
        error instanceof Error ? error.message : 'Асуулга илгээхэд алдаа гарлаа',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => router.back();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Асуулга татаж байна...</p>
        </div>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Асуулга олдсонгүй</h1>
          <button
            onClick={() => router.push('/jobs')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Буцах
          </button>
        </div>
      </div>
    );
  }

  if (questionnaire.type !== 'GOVERNMENT_EMPLOYEE') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Энэ нь төрийн анкет биш байна</h1>
          <button
            onClick={() => router.push('/jobs')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Буцах
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Буцах
          </button>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {questionnaire.title}
            </h1>
            {questionnaire.description && (
              <p className="text-gray-600">{questionnaire.description}</p>
            )}
          </div>
        </div>

        <GovernmentEmployeeQuestionnaire
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
