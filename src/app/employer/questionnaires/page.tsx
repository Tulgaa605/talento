'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Questionnaire {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  responses: QuestionnaireResponse[];
}

interface QuestionnaireResponse {
  id: string;
  userId: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function EmployerQuestionnaires() {
  const { data: session } = useSession();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchQuestionnaires();
    }
  }, [session]);

  const fetchQuestionnaires = async () => {
    try {
      const response = await fetch('/api/employer/questionnaires');
      if (response.ok) {
        const data = await response.json();
        setQuestionnaires(data);
      }
    } catch (error) {
      console.error('Error fetching questionnaires:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Асуулгууд</h1>
          <p className="mt-2 text-gray-600">Таны үүсгэсэн асуулгууд болон тэдгээрийн хариултууд</p>
        </div>

        {questionnaires.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Асуулга байхгүй байна</h3>
            <p className="mt-2 text-gray-500">Та одоогоор асуулга үүсгээгүй байна.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {questionnaires.map((questionnaire) => (
              <div key={questionnaire.id} className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{questionnaire.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{questionnaire.description}</p>
                      <p className="mt-2 text-xs text-gray-400">
                        Үүсгэсэн: {new Date(questionnaire.createdAt).toLocaleDateString('mn-MN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {questionnaire.responses.length} хариу
                      </span>
                    </div>
                  </div>

                  {questionnaire.responses.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Хариултууд:</h4>
                      <div className="space-y-3">
                        {questionnaire.responses.map((response) => (
                          <div key={response.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{response.user.name}</p>
                              <p className="text-xs text-gray-500">{response.user.email}</p>
                              <p className="text-xs text-gray-400">
                                Хариулсан: {new Date(response.createdAt).toLocaleDateString('mn-MN')}
                              </p>
                            </div>
                            <Link
                              href={`/employer/questionnaires/${questionnaire.id}/responses/${response.id}`}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Дэлгэрэнгүй харах
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 