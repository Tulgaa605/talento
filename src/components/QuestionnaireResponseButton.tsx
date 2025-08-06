"use client";

import { useState } from "react";
import QuestionnaireResponseView from "./QuestionnaireResponseView";

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
}

interface QuestionnaireResponseButtonProps {
  questionnaireId: string;
  applicationId: string;
}

export default function QuestionnaireResponseButton({
  questionnaireId,
  applicationId,
}: QuestionnaireResponseButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<QuestionnaireResponse | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewResponse = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/employer/questionnaires/${questionnaireId}/responses`);
      
      if (!res.ok) {
        throw new Error("Failed to fetch responses");
      }

      const responses = await res.json();
      
      // For now, show the first response if any exist
      if (responses.length > 0) {
        setResponse(responses[0]);
        setShowModal(true);
      } else {
        alert("Энэ өргөдөлд асуулгын хариу олдсонгүй");
      }
    } catch (error) {
      console.error("Error fetching questionnaire response:", error);
      alert("Асуулгын хариу татахад алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleViewResponse}
        disabled={isLoading}
        className="flex items-center justify-center gap-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Уншиж байна...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Асуулгын хариу харах
          </>
        )}
      </button>

      {showModal && response && (
        <QuestionnaireResponseView
          response={response}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
} 