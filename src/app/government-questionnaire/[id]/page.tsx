"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import GovernmentEmployeeQuestionnaire from '@/components/GovernmentEmployeeQuestionnaire';

interface QuestionnaireType {
  id: string;
  title: string;
  type: string;
}

export default function GovernmentQuestionnairePage() {
  const params = useParams();
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireType | null>(null);
  const [existingResponse, setExistingResponse] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch questionnaire
        const questionnaireResponse = await fetch(`/api/questionnaires/${params.id}`);
        if (!questionnaireResponse.ok) throw new Error('Questionnaire fetch failed');
        
        const questionnaireData = await questionnaireResponse.json();
        setQuestionnaire(questionnaireData);

        // Fetch existing response for current user (jobseeker)
        try {
          const responsesResponse = await fetch('/api/jobseeker/questionnaires');
          if (responsesResponse.ok) {
            const allResponses = await responsesResponse.json();
            console.log('All questionnaire responses:', allResponses);
            
            // Find the response for this specific questionnaire
            const userResponse = allResponses.find(
              (resp: { questionnaireId: string; formData?: unknown; type?: string }) => 
                resp.questionnaireId === params.id && resp.formData
            );
            
            console.log('Found existing response:', userResponse);
            
            if (userResponse?.formData) {
              // Parse formData if it's a string
              const parsedData = typeof userResponse.formData === 'string' 
                ? JSON.parse(userResponse.formData) 
                : userResponse.formData;
              console.log('Setting existing response:', parsedData);
              setExistingResponse(parsedData);
            }
          }
        } catch (responseErr) {
          console.error('Error fetching existing response:', responseErr);
          // Don't fail the whole page if we can't fetch existing response
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Алдаа гарлаа');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0C213A]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Алдаа гарлаа</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!questionnaire || questionnaire.type !== 'GOVERNMENT_EMPLOYEE') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Анкет олдсонгүй</h3>
          <p className="text-yellow-700">Төрийн албан хаагчийн анкет олдсонгүй байна.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0C213A] mb-2">Төрийн албан хаагчийн анкет</h1>
          <p className="text-gray-600">{questionnaire.title}</p>
        </div>
        
        <GovernmentEmployeeQuestionnaire
          initialData={existingResponse}
          onSubmit={(data) => {
            console.log('Government questionnaire submitted:', data);
            alert('Анкет амжилттай илгээгдлээ!');
          }}
          onCancel={() => {
            window.history.back();
          }}
        />
      </div>
    </div>
  );
}
