"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Questionnaire {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
}

interface QuestionnaireDropdownProps {
  applicationId: string;
  questionnaires: Questionnaire[];
}

export default function QuestionnaireDropdown({
  applicationId,
  questionnaires,
}: QuestionnaireDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentQuestionnaire, setSentQuestionnaire] = useState<string | null>(
    null
  );
  const router = useRouter();

  const handleSubmit = async (
    questionnaireId: string,
    questionnaireTitle: string
  ) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("questionnaireId", questionnaireId);

      const response = await fetch(
        `/api/employer/applications/${applicationId}/send-questionnaire`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send questionnaire");
      }

      setSentQuestionnaire(questionnaireTitle);
      setIsOpen(false);
      alert(`"${questionnaireTitle}" асуулга амжилттай илгээгдлээ`);
      router.refresh();
    } catch (error) {
      console.error("Error sending questionnaire:", error);
      alert("Асуулга илгээхэд алдаа гарлаа. Дараа дахин оролдоно уу.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendGovernmentQuestionnaire = async () => {
    try {
      setIsSubmitting(true);

      const response = await fetch(
        `/api/employer/applications/${applicationId}/send-government-questionnaire`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send government questionnaire");
      }

      setSentQuestionnaire("Төрийн албан хаагчийн анкет");
      setIsOpen(false);
      alert("Төрийн албан хаагчийн анкет амжилттай илгээгдлээ");
      router.refresh();
    } catch (error) {
      console.error("Error sending government questionnaire:", error);
      alert("Анкет илгээхэд алдаа гарлаа. Дараа дахин оролдоно уу.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSubmitting}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        {isSubmitting
          ? "Илгээж байна..."
          : sentQuestionnaire
          ? `Илгээсэн: ${sentQuestionnaire}`
          : "Анкет илгээх"}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-10 border border-gray-200">
          <h4 className="font-medium mb-3 text-gray-800">Анкет сонгох</h4>
          <div className="space-y-2">
            <button
              onClick={handleSendGovernmentQuestionnaire}
              disabled={isSubmitting}
              className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium border border-blue-200"
            >
              📋 Төрийн албан хаагчийн анкет
            </button> 
            {questionnaires.length > 0 && (
              <div className="border-t border-gray-200 my-2"></div>
            )}
            {questionnaires.map((q) => (
              <button
                key={q.id}
                onClick={() => handleSubmit(q.id, q.title)}
                disabled={isSubmitting}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {q.title}
              </button>
            ))}
            
            {questionnaires.length === 0 && (
              <p className="text-xs text-gray-500 px-3 py-2">
                Бусад асуулга байхгүй байна
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
