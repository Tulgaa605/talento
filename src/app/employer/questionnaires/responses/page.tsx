"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import QuestionnaireResponseView from "@/components/QuestionnaireResponseView";

interface QuestionnaireResponse {
  id: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  answers: {
    id: string;
    value: string;
    question: {
      text: string;
      type: string;
    };
  }[];
  attachmentFile?: string;
  attachmentUrl?: string;
  formData?: string;
  questionnaire: {
    id: string;
    title: string;
    type: string;
  };
}

interface QuestionnaireWithResponses {
  id: string;
  title: string;
  type: string;
  description: string | null;
  createdAt: string;
  responses: QuestionnaireResponse[];
}

export default function QuestionnaireResponsesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireWithResponses[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<QuestionnaireResponse | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/employer/login");
      return;
    }
    
    fetchQuestionnaires();
  }, [session, status, router]);

  const fetchQuestionnaires = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employer/questionnaires');
      
      if (!response.ok) {
        throw new Error('Өгөгдөл авахад алдаа гарлаа');
      }
      
      const data = await response.json();
      setQuestionnaires(data);
      setError(null);
    } catch (err) {
      console.error('Questionnaires fetch error:', err);
      setError(err instanceof Error ? err.message : 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleViewResponse = (response: QuestionnaireResponse) => {
    setSelectedResponse(response);
    setShowModal(true);
  };

  const getResponseCount = (questionnaire: QuestionnaireWithResponses) => {
    return questionnaire.responses.length;
  };

  const getLatestResponseDate = (questionnaire: QuestionnaireWithResponses) => {
    if (questionnaire.responses.length === 0) return null;
    const latest = questionnaire.responses.reduce((latest, current) => 
      new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
    );
    return new Date(latest.createdAt);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0C213A]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mt-10 mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-red-400">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Алдаа гарлаа</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button 
                onClick={fetchQuestionnaires}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Дахин оролдох
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 mx-auto px-4 py-8 bg-white min-h-screen">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-[#0C213A] mb-2">Асуулгын хариултууд</h1>
            <p className="text-gray-600">Илгээсэн асуулгын хариултуудыг хянах</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {questionnaires.map((questionnaire) => (
          <div key={questionnaire.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#0C213A] mb-2">
                    {questionnaire.title}
                  </h3>
                  {questionnaire.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {questionnaire.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      questionnaire.type === "GOVERNMENT_EMPLOYEE" 
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}>
                      {questionnaire.type === "GOVERNMENT_EMPLOYEE" ? "Төрийн анкет" : "Хувийн асуулга"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Хариултын тоо:</span>
                  <span className="font-medium text-[#0C213A]">
                    {getResponseCount(questionnaire)}
                  </span>
                </div>
                
                {getLatestResponseDate(questionnaire) && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Сүүлд хариулсан:</span>
                    <span className="font-medium text-gray-900">
                      {getLatestResponseDate(questionnaire)!.toLocaleDateString("mn-MN")}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Үүсгэсэн огноо:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(questionnaire.createdAt).toLocaleDateString("mn-MN")}
                  </span>
                </div>
              </div>

              {questionnaire.responses.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Сүүлийн хариултууд:</h4>
                  <div className="space-y-2">
                    {questionnaire.responses.slice(0, 3).map((response) => (
                      <div 
                        key={response.id} 
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleViewResponse(response)}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-[#0C213A] text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {response.user.name[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{response.user.name}</p>
                            <p className="text-xs text-gray-500">{response.user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(response.createdAt).toLocaleDateString("mn-MN")}
                          </p>
                          <button className="text-xs text-[#0C213A] hover:text-[#0C213A]/80 mt-1">
                            Үзэх
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {questionnaire.responses.length > 3 && (
                    <button 
                      className="w-full mt-3 text-sm text-[#0C213A] hover:text-[#0C213A]/80 font-medium"
                      onClick={() => router.push(`/employer/questionnaires/${questionnaire.id}/responses`)}
                    >
                      Бүгдийг харах ({questionnaire.responses.length})
                    </button>
                  )}
                </div>
              )}

              {questionnaire.responses.length === 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">Одоогоор хариу ирээгүй</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {questionnaires.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Асуулга олдсонгүй</h3>
          <p className="text-gray-600 mb-6">Одоогоор үүсгэсэн асуулга байхгүй байна.</p>
          <button 
            onClick={() => router.push('/employer/questionnaires')}
            className="bg-[#0C213A] text-white px-6 py-3 rounded-lg hover:bg-[#0C213A]/90 transition-colors"
          >
            Асуулга үүсгэх
          </button>
        </div>
      )}

      {showModal && selectedResponse && (
        <QuestionnaireResponseView
          response={selectedResponse}
          onClose={() => {
            setShowModal(false);
            setSelectedResponse(null);
          }}
        />
      )}
    </div>
  );
}
