"use client";

import { useState } from "react";

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

interface QuestionnaireResponseViewProps {
  response: QuestionnaireResponse;
  onClose: () => void;
}

export default function QuestionnaireResponseView({
  response,
  onClose,
}: QuestionnaireResponseViewProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadAttachment = async () => {
    if (!response.attachmentUrl) return;

    try {
      setIsDownloading(true);
      const res = await fetch(response.attachmentUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.attachmentFile || 'attachment';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading attachment:", error);
      alert("Файл татахад алдаа гарлаа");
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Асуулгын хариу
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Хэрэглэгчийн мэдээлэл</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Нэр:</span> {response.user.name}</p>
              <p><span className="font-medium">И-мэйл:</span> {response.user.email}</p>
              <p><span className="font-medium">Илгээсэн огноо:</span> {formatDate(response.createdAt)}</p>
            </div>
          </div>

          {/* Answers */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Хариултууд</h3>
            {response.answers.map((answer, index) => (
              <div key={answer.id} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  {index + 1}. {answer.question.text}
                </h4>
                <div className="text-gray-700">
                  {answer.question.type === 'text' && (
                    <p className="whitespace-pre-wrap">{answer.value}</p>
                  )}
                  {answer.question.type === 'textarea' && (
                    <p className="whitespace-pre-wrap">{answer.value}</p>
                  )}
                  {answer.question.type === 'radio' && (
                    <p>{answer.value}</p>
                  )}
                  {answer.question.type === 'checkbox' && (
                    <div className="space-y-1">
                      {answer.value.split(',').map((item, i) => (
                        <div key={i} className="flex items-center">
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>{item.trim()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Attachment */}
          {response.attachmentUrl && (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Хавсралт</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="text-sm text-gray-600">
                    {response.attachmentFile || 'Хавсралт файл'}
                  </span>
                </div>
                <button
                  onClick={handleDownloadAttachment}
                  disabled={isDownloading}
                  className="flex items-center space-x-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Татаж байна...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Татах</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors duration-200"
          >
            Хаах
          </button>
        </div>
      </div>
    </div>
  );
} 