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
  formData?: string; // For government employee questionnaires
}

interface QuestionnaireResponseViewProps {
  response: QuestionnaireResponse;
  onClose: () => void;
}

export default function QuestionnaireResponseView({
  response,
  onClose,
}: QuestionnaireResponseViewProps) {
  const [activeTab, setActiveTab] = useState("answers");

  // Try to parse formData if it exists (for government employee questionnaires)
  const parsedFormData = response.formData ? JSON.parse(response.formData) : null;

  const formatValue = (value: string, type: string) => {
    if (type === "MULTIPLE_CHOICE" && value.includes(",")) {
      return value.split(",").map((v, i) => (
        <span key={i} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm mr-2 mb-1">
          {v.trim()}
        </span>
      ));
    }
    
    // Try to parse JSON values for better display
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === "object") {
        return (
          <div className="space-y-2">
            {Object.entries(parsed).map(([key, val]) => (
              <div key={key} className="flex">
                <span className="font-medium text-gray-600 w-32">{key}:</span>
                <span className="text-gray-900">
                  {Array.isArray(val) ? val.join(", ") : String(val)}
                </span>
              </div>
            ))}
          </div>
        );
      }
    } catch {
      // Not JSON, display as regular text
    }
    
    return <span className="whitespace-pre-wrap">{value}</span>;
  };

  const downloadAttachment = () => {
    if (response.attachmentUrl) {
      const link = document.createElement("a");
      link.href = response.attachmentUrl;
      link.download = response.attachmentFile || "attachment";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Асуулгын хариу
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {response.user.name} • {new Date(response.createdAt).toLocaleDateString("mn-MN")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("answers")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "answers"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Асуулгын хариулт
            </button>
            {parsedFormData && (
              <button
                onClick={() => setActiveTab("form")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "form"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Төрийн албан хаагчийн анкет
              </button>
            )}
            {response.attachmentFile && (
              <button
                onClick={() => setActiveTab("attachment")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "attachment"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Хавсралт файл
              </button>
            )}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === "answers" && (
            <div className="space-y-6">
              {response.answers.map((answer, index) => (
                <div key={answer.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-600 font-medium text-sm">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {answer.question.text}
                      </h4>
                      <div className="text-gray-700">
                        {formatValue(answer.value, answer.question.type)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "form" && parsedFormData && (
            <div className="space-y-6">
              {/* Personal Information */}
              {parsedFormData.personalInfo && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Хувь хүний мэдээлэл</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Нэр:</span>
                      <p className="font-medium">{parsedFormData.personalInfo.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Эцэг/эх/-ийн нэр:</span>
                      <p className="font-medium">{parsedFormData.personalInfo.fatherName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Хүйс:</span>
                      <p className="font-medium">{parsedFormData.personalInfo.gender}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Төрсөн он:</span>
                      <p className="font-medium">{parsedFormData.personalInfo.birthYear}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Төрсөн газар:</span>
                      <p className="font-medium">{parsedFormData.personalInfo.birthPlace}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Үндэс угсаа:</span>
                      <p className="font-medium">{parsedFormData.personalInfo.ethnicity}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Education Information */}
              {parsedFormData.education && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Боловсролын мэдээлэл</h3>
                  {parsedFormData.education.generalEducation && (
                    <div className="space-y-3">
                      {parsedFormData.education.generalEducation.map((edu: any, index: number) => (
                        <div key={index} className="bg-gray-50 p-3 rounded">
                          <p><span className="font-medium">Сургууль:</span> {edu.schoolName}</p>
                          <p><span className="font-medium">Эзэмшсэн зэрэг:</span> {edu.degree}</p>
                          <p><span className="font-medium">Төгссөн огноо:</span> {edu.endDate}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Work Experience */}
              {parsedFormData.workExperience && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Ажлын туршлага</h3>
                  <div className="space-y-3">
                    {parsedFormData.workExperience.map((work: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <p><span className="font-medium">Байгууллага:</span> {work.organization}</p>
                        <p><span className="font-medium">Албан тушаал:</span> {work.position}</p>
                        <p><span className="font-medium">Ажилласан хугацаа:</span> {work.startDate} - {work.endDate}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {parsedFormData.skills && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Ур чадвар</h3>
                  <div className="space-y-2">
                    {Object.entries(parsedFormData.skills).map(([category, skills]: [string, any]) => (
                      <div key={category}>
                        <h4 className="font-medium text-gray-700 capitalize">{category}:</h4>
                        <p className="text-gray-600 ml-4">{JSON.stringify(skills)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "attachment" && response.attachmentFile && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Хавсралт файл
              </h3>
              <p className="text-gray-600 mb-4">{response.attachmentFile}</p>
              <button
                onClick={downloadAttachment}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Файл татах
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Хаах
          </button>
        </div>
      </div>
    </div>
  );
}