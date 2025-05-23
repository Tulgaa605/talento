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

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 w-full"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSubmitting}
      >
        <svg
          className="w-5 h-5"
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
        {isSubmitting ? "Илгээж байна..." : "Асуулга Илгээх"}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-10">
          <h4 className="font-medium mb-2">Асуулга сонгох</h4>
          <div className="space-y-2">
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
          </div>
        </div>
      )}
    </div>
  );
}
