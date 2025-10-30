"use client";

import { useState } from "react";

// Helper functions for translation
const translateLevel = (level: string): string => {
  const translations: { [key: string]: string } = {
    'average': 'Дунд',
    'good': 'Сайн',
    'excellent': 'Онц'
  };
  return translations[level] || level;
};

const translateEquipmentKey = (key: string): string => {
  const translations: { [key: string]: string } = {
    'internet': 'Интернетийн орчинд ажиллах',
    'internalNetwork': 'Дотоод сүлжээ ашиглах',
    'scanner': 'Скайнер',
    'printer': 'Принтер',
    'copier': 'Хувилагч',
    'fax': 'Факс',
    'photoVideo': 'Гэрэл зургийн болон видео бичлэгийн аппарат'
  };
  return translations[key] || key;
};

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
}

interface QuestionnaireResponseViewProps {
  response: QuestionnaireResponse;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function QuestionnaireResponseView({
  response,
  onClose,
  onUpdate,
}: QuestionnaireResponseViewProps) {
  // Try to parse formData if it exists (for government employee questionnaires)
  const initialFormData = response.formData ? JSON.parse(response.formData) : null;
  
  // If formData exists and no answers, start with "form" tab
  const [activeTab, setActiveTab] = useState(
    initialFormData && response.answers.length === 0 ? "form" : "answers"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [editedFormData, setEditedFormData] = useState(initialFormData);

  const formatValue = (value: string, type: string) => {
    if (type === "MULTIPLE_CHOICE" && value.includes(",")) {
      return value.split(",").map((v, i) => (
        <span key={i} className="inline-block bg-blue-100 text-blue-800 p-2 rounded-full text-sm mr-2 mb-1">
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

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch(`/api/employer/questionnaires/responses/${response.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: editedFormData }),
      });

      if (!res.ok) {
        throw new Error("Failed to update response");
      }

      alert("Амжилттай шинэчлэгдлээ!");
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error updating response:", error);
      alert("Хадгалахад алдаа гарлаа.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const res = await fetch(`/api/employer/questionnaires/responses/${response.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Failed to approve questionnaire");
      }

      alert("Анкет амжилттай зөвшөөрөгдлөө! Хэрэглэгч одоо ажилтны бүртгэлд орж болно.");
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error("Error approving questionnaire:", error);
      alert("Зөвшөөрөхөд алдаа гарлаа");
    } finally {
      setIsApproving(false);
    }
  };

  const handleCancel = () => {
    setEditedFormData(initialFormData);
    setIsEditing(false);
  };

  return (
    <div className="printable-modal fixed inset-0 bg-white text-gray-700 bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto print:bg-white print:p-0">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full my-8 print:max-w-none print:shadow-none print:rounded-none print:my-0 print:w-[210mm] print:min-h-[297mm]">
        <style jsx global>{`
          @media print {
            body { margin: 0; padding: 0; }
            .fixed { position: relative !important; }
            @page { 
              size: A4;
              margin: 15mm;
            }
            table { 
              page-break-inside: avoid;
              font-size: 10px !important;
            }
            th, td {
              padding: 2px 4px !important;
              font-size: 9px !important;
            }
            h2 {
              font-size: 18px !important;
            }
            h3 {
              font-size: 12px !important;
            }
            .space-y-4 > * + * {
              margin-top: 8px !important;
            }
          }
        `}</style>
        {/* Header - Hidden on Print */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 print:hidden">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Анкет {isEditing && <span className="text-blue-600">(Засварлаж байна)</span>}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {response.user.name} • {new Date(response.createdAt).toLocaleDateString("mn-MN")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {initialFormData && activeTab === "form" && !isEditing && (
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Хэвлэх
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs - Hidden on Print */}
        <div className="border-b border-gray-200 print:hidden">
          <nav className="flex space-x-8 px-6">
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
        <div className="p-6 overflow-y-auto print:overflow-visible print:p-0 print:max-h-none" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          {activeTab === "answers" && (
            <div className="space-y-6">
              {response.answers.length > 0 ? (
                response.answers.map((answer, index) => (
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
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Энэ анкетад асуулт хариулт байхгүй байна.
                    {initialFormData && " Төрийн албан хаагчийн анкет хэсгээс дэлгэрэнгүй мэдээллийг үзнэ үү."}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "form" && editedFormData && (
            <div className="space-y-8 bg-white">
              {/* Header - Copy from GovernmentEmployeeQuestionnaire */}
              <div className="mb-8 border-b pb-6">
                <div className="flex justify-center items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">ТӨРИЙН АЛБАН ХААГЧИЙН АНКЕТ</h1>
                    <p className="text-center text-lg text-gray-600">Маягт № 1</p>
                    <p className="text-center text-sm text-gray-500 mt-2">
                      &quot;Төрийн албан хаагчийн хувийн хэрэг хөтлөх журам&quot;-ын 1 дүгээр хавсралт
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              {editedFormData.personalInfo && (
                <div className="border border-gray-300 p-6 rounded-lg">
                  <h2 className="text-xl font-bold mb-6">1. ХУВЬ ХҮНИЙ ТАЛААРХ МЭДЭЭЛЭЛ</h2>
                  
                  {/* ID numbers - grid layout like the original */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Регистрийн дугаар</label>
                      <div className="w-full border-b border-gray-300 py-2">
                        {editedFormData.identification?.registrationNumber || '-'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Иргэний үнэмлэхийн дугаар</label>
                      <div className="w-full border-b border-gray-300 py-2">
                        {editedFormData.identification?.citizenIdNumber || '-'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Нийгмийн даатгалын дэвтрийн дугаар</label>
                      <div className="w-full border-b border-gray-300 py-2">
                        {editedFormData.identification?.socialInsuranceNumber || '-'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Эрүүл мэндийн даатгалын гэрчилгээний дугаар</label>
                      <div className="w-full border-b border-gray-300 py-2">
                        {editedFormData.identification?.healthInsuranceNumber || '-'}
                      </div>
                    </div>
                  </div>

                  {/* Personal details - grid layout */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">1.1. Эцэг /эх/-ийн нэр</label>
                      <div className="w-full border-b border-gray-300 py-2">
                        {editedFormData.personalInfo.fatherName || '-'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Нэр</label>
                      <div className="w-full border-b border-gray-300 py-2">
                        {editedFormData.personalInfo.name || '-'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">1.2. Хүйс</label>
                      <div className="w-full border-b border-gray-300 py-2">
                        {editedFormData.personalInfo.gender || '-'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">1.3. Төрсөн</label>
                      <div className="w-full border-b border-gray-300 py-2">
                        {editedFormData.personalInfo.birthYear || '-'} 
                        {editedFormData.personalInfo.birthMonth && ` / ${editedFormData.personalInfo.birthMonth}`}
                        {editedFormData.personalInfo.birthDay && ` / ${editedFormData.personalInfo.birthDay}`}
                      </div>
                    </div>
                  </div>

                  {/* Birth place */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">1.4. Төрсөн аймаг, хот, сум, дүүрэг</label>
                      <div className="w-full border-b border-gray-300 py-2">
                        {editedFormData.personalInfo.birthAimag || '-'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">төрсөн газар, овог</label>
                      <div className="w-full border-b border-gray-300 py-2">
                        {editedFormData.personalInfo.birthPlace || '-'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">1.5. Үндэс, угсаа</label>
                      <div className="w-full border-b border-gray-300 py-2">
                        {editedFormData.personalInfo.ethnicity || '-'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">1.6. Нийгмийн гарал</label>
                      <div className="w-full border-b border-gray-300 py-2">
                        {editedFormData.personalInfo.socialOrigin || '-'}
                      </div>
                    </div>
                  </div>

                  {/* Family Members Table */}
                  {editedFormData.personalInfo.familyMembers && editedFormData.personalInfo.familyMembers.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4">1.7. Гэр бүлийн байдал (зөвхөн гэр бүлийн бүртгэлд байгаа хүмүүсийг бичнэ)</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-300">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-300 p-2 text-left">Таны юу болох</th>
                              <th className="border border-gray-300 p-2 text-left">Гэр бүлийн гишүүдийн эцэг /эх/-ийн нь болон өөрийн нь нэр</th>
                              <th className="border border-gray-300 p-2 text-left">Төрсөн он</th>
                              <th className="border border-gray-300 p-2 text-left">Төрсөн аймаг, хот, сум, дүүрэг</th>
                              <th className="border border-gray-300 p-2 text-left">Одоо эрхэлж буй ажил</th>
                            </tr>
                          </thead>
                          <tbody>
                            {editedFormData.personalInfo.familyMembers.map((member: { relationship?: string; name?: string; birthYear?: string; birthPlace?: string; occupation?: string }, index: number) => (
                              <tr key={index}>
                                <td className="border border-gray-300 p-2">{member.relationship || '-'}</td>
                                <td className="border border-gray-300 p-2">{member.name || '-'}</td>
                                <td className="border border-gray-300 p-2">{member.birthYear || '-'}</td>
                                <td className="border border-gray-300 p-2">{member.birthPlace || '-'}</td>
                                <td className="border border-gray-300 p-2">{member.occupation || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Relatives Table */}
                  {editedFormData.personalInfo.relatives && editedFormData.personalInfo.relatives.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4">1.8. Садан төрлийн байдал</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-300">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-300 p-2 text-left">Таны юу болох</th>
                              <th className="border border-gray-300 p-2 text-left">Садан төрлийн хүмүүсийн эцэг /эх/-ийн нь болон өөрийн нь нэр</th>
                              <th className="border border-gray-300 p-2 text-left">Төрсөн он</th>
                              <th className="border border-gray-300 p-2 text-left">Төрсөн аймаг, хот, сум, дүүрэг</th>
                              <th className="border border-gray-300 p-2 text-left">Одоо эрхэлж буй ажил</th>
                            </tr>
                          </thead>
                          <tbody>
                            {editedFormData.personalInfo.relatives.map((relative: { relationship?: string; name?: string; birthYear?: string; birthPlace?: string; occupation?: string }, index: number) => (
                              <tr key={index}>
                                <td className="border border-gray-300 p-2">{relative.relationship || '-'}</td>
                                <td className="border border-gray-300 p-2">{relative.name || '-'}</td>
                                <td className="border border-gray-300 p-2">{relative.birthYear || '-'}</td>
                                <td className="border border-gray-300 p-2">{relative.birthPlace || '-'}</td>
                                <td className="border border-gray-300 p-2">{relative.occupation || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Current Address - grid layout */}
                  {editedFormData.personalInfo.currentAddress && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Одоо оршин суугаа хаяг</h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">Аймаг, хот</label>
                          <div className="w-full border-b border-gray-300 py-2">
                            {editedFormData.personalInfo.currentAddress.aimag || editedFormData.personalInfo.currentAddress.city || '-'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Сум, дүүрэг</label>
                          <div className="w-full border-b border-gray-300 py-2">
                            {editedFormData.personalInfo.currentAddress.soum || editedFormData.personalInfo.currentAddress.district || '-'}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-2">Гэрийн хаяг</label>
                          <div className="w-full border-b border-gray-300 py-2">
                            {editedFormData.personalInfo.currentAddress.homeAddress || '-'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Утас</label>
                          <div className="w-full border-b border-gray-300 py-2">
                            {editedFormData.personalInfo.currentAddress.phone || '-'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Гар утас</label>
                          <div className="w-full border-b border-gray-300 py-2">
                            {editedFormData.personalInfo.currentAddress.mobile || '-'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Факс</label>
                          <div className="w-full border-b border-gray-300 py-2">
                            {editedFormData.personalInfo.currentAddress.fax || '-'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">И-мэйл</label>
                          <div className="w-full border-b border-gray-300 py-2">
                            {editedFormData.personalInfo.currentAddress.email || '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Education Information */}
              {editedFormData.education && editedFormData.education.generalEducation && editedFormData.education.generalEducation.length > 0 && (
                <div className="border border-gray-300 p-6 rounded-lg">
                  <h2 className="text-xl font-bold mb-6">2. БОЛОВСРОЛЫН МЭДЭЭЛЭЛ</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 p-2 text-left">№</th>
                          <th className="border border-gray-300 p-2 text-left">Сургуулийн нэр, хаяг</th>
                          <th className="border border-gray-300 p-2 text-left">Элссэн огноо</th>
                          <th className="border border-gray-300 p-2 text-left">Төгссөн огноо</th>
                          <th className="border border-gray-300 p-2 text-left">Эзэмшсэн боловсрол</th>
                        </tr>
                      </thead>
                      <tbody>
                  {editedFormData.education.generalEducation.map(
                          (edu: { schoolName?: string; startDate?: string; endDate?: string; degree?: string }, index: number) => (
                            <tr key={index}>
                              <td className="border border-gray-300 p-2">{index + 1}</td>
                              <td className="border border-gray-300 p-2">{edu.schoolName || '-'}</td>
                              <td className="border border-gray-300 p-2">{edu.startDate || '-'}</td>
                              <td className="border border-gray-300 p-2">{edu.endDate || '-'}</td>
                              <td className="border border-gray-300 p-2">{edu.degree || '-'}</td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {editedFormData.workExperience && editedFormData.workExperience.length > 0 && (
                <div className="border border-gray-300 p-6 rounded-lg">
                  <h2 className="text-xl font-bold mb-6">3. АЖЛЫН ТУРШЛАГА</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 p-2 text-left">№</th>
                          <th className="border border-gray-300 p-2 text-left">Байгууллагын нэр, хаяг</th>
                          <th className="border border-gray-300 p-2 text-left">Ажилласан албан тушаал</th>
                          <th className="border border-gray-300 p-2 text-left">Ажилд орсон огноо</th>
                          <th className="border border-gray-300 p-2 text-left">Ажлаас гарсан огноо</th>
                        </tr>
                      </thead>
                      <tbody>
                  {editedFormData.workExperience.map(
                          (work: { organization?: string; position?: string; startDate?: string; endDate?: string }, index: number) => (
                            <tr key={index}>
                              <td className="border border-gray-300 p-2">{index + 1}</td>
                              <td className="border border-gray-300 p-2">{work.organization || '-'}</td>
                              <td className="border border-gray-300 p-2">{work.position || '-'}</td>
                              <td className="border border-gray-300 p-2">{work.startDate || '-'}</td>
                              <td className="border border-gray-300 p-2">{work.endDate || '-'}</td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Skills - Matching GovernmentEmployeeQuestionnaireSkills */}
              {editedFormData.skills && (
                <div className="border border-gray-300 p-6 rounded-lg">
                  <h2 className="text-xl font-bold mb-6">4. УР ЧАДВАРЫН ТАЛААРХ МЭДЭЭЛЭЛ</h2>
                  
                  {/* Skills Assessment */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">4.1. Ур чадвар (1-3 оноо /1-муу, 2-дунд, 3-сайн/)</h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Personal Skills */}
                      <div>
                        <h4 className="font-semibold mb-4">Хувь хүний ур чадвар</h4>
                        
                        {/* Self-awareness */}
                        {editedFormData.skills.individualSkills?.selfAwareness && (
                          <div className="mb-6">
                            <h5 className="font-medium mb-3">Өөрийгөө танин мэдэх</h5>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Өөрийн эрхэмлэн дээдлэх зүйлс ба тэргүүлэх чиглэлээ тодорхойлох</span>
                                <span className="font-semibold">{editedFormData.skills.individualSkills.selfAwareness.values}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Танин мэдэж хэв маягаа тогтоох</span>
                                <span className="font-semibold">{editedFormData.skills.individualSkills.selfAwareness.learningStyle}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Өөрчлөлтийг хүлээн авах</span>
                                <span className="font-semibold">{editedFormData.skills.individualSkills.selfAwareness.acceptChange}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Stress Management */}
                        {editedFormData.skills.individualSkills?.stressManagement && (
                          <div className="mb-6">
                            <h5 className="font-medium mb-3">Стрессээ тайлах</h5>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Стрессийн хүчин зүйлсийг намжаах</span>
                                <span className="font-semibold">{editedFormData.skills.individualSkills.stressManagement.reduceStress}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Цагийг зүй зохистой ашиглах</span>
                                <span className="font-semibold">{editedFormData.skills.individualSkills.stressManagement.timeManagement}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Эрх мэдлээ төлөөлүүлэх</span>
                                <span className="font-semibold">{editedFormData.skills.individualSkills.stressManagement.delegate}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Problem Solving */}
                        {editedFormData.skills.individualSkills?.problemSolving && (
                          <div className="mb-6">
                            <h5 className="font-medium mb-3">Асуудлыг бүтээлчээр шийдвэрлэх</h5>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Зүй зохистой хандлагыг хэрэглэх</span>
                                <span className="font-semibold">{editedFormData.skills.individualSkills.problemSolving.appropriateApproaches}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Бүтээлч хандлагыг ашиглах</span>
                                <span className="font-semibold">{editedFormData.skills.individualSkills.problemSolving.creativeApproaches}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Шинэ санаачлагыг дэмжих</span>
                                <span className="font-semibold">{editedFormData.skills.individualSkills.problemSolving.supportInitiatives}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        {/* Teamwork Skills */}
                        {editedFormData.skills.teamworkSkills && (
                          <>
                            <h4 className="font-semibold mb-4">Бүлгээр ажиллах ур чадвар</h4>
                            <div className="space-y-2 mb-6">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Үр нөлөөтэй баг бүрдүүлэх</span>
                                <span className="font-semibold">{editedFormData.skills.teamworkSkills.formTeam}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Бусдын эрх мэдэл, бүрэн эрхийг хүндэтгэж, дэмжлэг үзүүлэх</span>
                                <span className="font-semibold">{editedFormData.skills.teamworkSkills.respectAuthority}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Мэдлэг, мэдээллээ бусадтай хуваалцах</span>
                                <span className="font-semibold">{editedFormData.skills.teamworkSkills.shareKnowledge}</span>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Other Skills */}
                        {editedFormData.skills.otherSkills && (
                          <>
                            <h4 className="font-semibold mb-4">Бусад ур чадвар</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Үүрэг хүлээх</span>
                                <span className="font-semibold">{editedFormData.skills.otherSkills.takeResponsibility}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Хариуцлага хүлээх</span>
                                <span className="font-semibold">{editedFormData.skills.otherSkills.beAccountable}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Нийтийн зорилгод тууштай байх</span>
                                <span className="font-semibold">{editedFormData.skills.otherSkills.consistentGoals}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Өөрийгөө хөгжүүлэх</span>
                                <span className="font-semibold">{editedFormData.skills.otherSkills.developSelf}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Асуудал боловсруулах</span>
                                <span className="font-semibold">{editedFormData.skills.otherSkills.formulateProblems}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Оновчтой шийдвэр гаргах</span>
                                <span className="font-semibold">{editedFormData.skills.otherSkills.makeDecisions}</span>
                              </div>
                              {editedFormData.skills.otherSkills.otherSkills && (
                                <div className="mt-4">
                                  <label className="block text-sm font-medium mb-2">Дээр дурдсанаас бусад ур чадвараасаа заримыг нэрлэнэ үү</label>
                                  <div className="w-full border-b border-gray-300 py-2">
                                    {editedFormData.skills.otherSkills.otherSkills}
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Interpersonal Skills */}
                    {editedFormData.skills.interpersonalSkills && (
                      <div className="mt-8">
                        <h4 className="font-semibold mb-4">Хүмүүс хоорондын харилцааны ур чадвар</h4>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Supportive Relationships */}
                          {editedFormData.skills.interpersonalSkills.supportiveRelationships && (
                            <div>
                              <h5 className="font-medium mb-3">Бусадтай бие биенийгээ дэмжсэн харилцаа холбоо тогтоох</h5>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Халамжлах</span>
                                  <span className="font-semibold">{editedFormData.skills.interpersonalSkills.supportiveRelationships.care}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Зөвлөгөө өгөх</span>
                                  <span className="font-semibold">{editedFormData.skills.interpersonalSkills.supportiveRelationships.offerHelp}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Бусдыг сонсох</span>
                                  <span className="font-semibold">{editedFormData.skills.interpersonalSkills.supportiveRelationships.listen}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Influence */}
                          {editedFormData.skills.interpersonalSkills.influence && (
                            <div>
                              <h5 className="font-medium mb-3">Эрх мэдлийнхээ хүрээнд бусдад нөлөөлөх</h5>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Эрх мэдлээ хэрэгжүүлэх</span>
                                  <span className="font-semibold">{editedFormData.skills.interpersonalSkills.influence.exerciseAuthority}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Бусдад нөлөөлөх</span>
                                  <span className="font-semibold">{editedFormData.skills.interpersonalSkills.influence.influenceOthers}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Бусдад бүрэн эрх олгох</span>
                                  <span className="font-semibold">{editedFormData.skills.interpersonalSkills.influence.empower}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Inspire */}
                          {editedFormData.skills.interpersonalSkills.inspire && (
                            <div>
                              <h5 className="font-medium mb-3">Бусдад урам хайрлах</h5>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Үр нөлөөгүй үйл ажиллагааг илрүүлэх</span>
                                  <span className="font-semibold">{editedFormData.skills.interpersonalSkills.inspire.identifyIneffective}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Урам зориг оруулах орчин бий болгох</span>
                                  <span className="font-semibold">{editedFormData.skills.interpersonalSkills.inspire.createEnvironment}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Амжилтыг урамшуулах</span>
                                  <span className="font-semibold">{editedFormData.skills.interpersonalSkills.inspire.rewardAchievements}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Conflict Resolution */}
                          {editedFormData.skills.interpersonalSkills.conflictResolution && (
                            <div>
                              <h5 className="font-medium mb-3">Зөрчлийг зохицуулах</h5>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Шалтгааныг тогтоох</span>
                                  <span className="font-semibold">{editedFormData.skills.interpersonalSkills.conflictResolution.identifyCauses}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Тохирох стратегийг сонгох</span>
                                  <span className="font-semibold">{editedFormData.skills.interpersonalSkills.conflictResolution.chooseStrategies}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Сөргөлдөх явдлыг арилгах</span>
                                  <span className="font-semibold">{editedFormData.skills.interpersonalSkills.conflictResolution.resolveConflicts}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Foreign Languages */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">4.2. Гадаад хэлний мэдлэг (түвшинг &quot;+&quot; гэж тэмдэглэнэ)</h3>
                    {editedFormData.foreignLanguages && editedFormData.foreignLanguages.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-300">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-300 p-2 text-left">Гадаад хэлний нэр</th>
                              <th className="border border-gray-300 p-2 text-center" colSpan={3}>сонсож ойлгох</th>
                              <th className="border border-gray-300 p-2 text-center" colSpan={3}>ярих</th>
                              <th className="border border-gray-300 p-2 text-center" colSpan={3}>унших</th>
                              <th className="border border-gray-300 p-2 text-center" colSpan={3}>бичих</th>
                            </tr>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-300 p-2 text-left"></th>
                              <th className="border border-gray-300 p-2 text-center">Дунд</th>
                              <th className="border border-gray-300 p-2 text-center">Сайн</th>
                              <th className="border border-gray-300 p-2 text-center">Онц</th>
                              <th className="border border-gray-300 p-2 text-center">Дунд</th>
                              <th className="border border-gray-300 p-2 text-center">Сайн</th>
                              <th className="border border-gray-300 p-2 text-center">Онц</th>
                              <th className="border border-gray-300 p-2 text-center">Дунд</th>
                              <th className="border border-gray-300 p-2 text-center">Сайн</th>
                              <th className="border border-gray-300 p-2 text-center">Онц</th>
                              <th className="border border-gray-300 p-2 text-center">Дунд</th>
                              <th className="border border-gray-300 p-2 text-center">Сайн</th>
                              <th className="border border-gray-300 p-2 text-center">Онц</th>
                            </tr>
                          </thead>
                          <tbody>
                            {editedFormData.foreignLanguages.map(
                              (lang: { language?: string; listening?: string; speaking?: string; reading?: string; writing?: string }, index: number) => (
                                <tr key={index}>
                                  <td className="border border-gray-300 p-2">{lang.language || '-'}</td>
                                  {['average', 'good', 'excellent'].map((level) => (
                                    <td key={`listening-${level}`} className="border border-gray-300 p-2 text-center">
                                      {lang.listening === level ? '+' : ''}
                                    </td>
                                  ))}
                                  {['average', 'good', 'excellent'].map((level) => (
                                    <td key={`speaking-${level}`} className="border border-gray-300 p-2 text-center">
                                      {lang.speaking === level ? '+' : ''}
                                    </td>
                                  ))}
                                  {['average', 'good', 'excellent'].map((level) => (
                                    <td key={`reading-${level}`} className="border border-gray-300 p-2 text-center">
                                      {lang.reading === level ? '+' : ''}
                                    </td>
                                  ))}
                                  {['average', 'good', 'excellent'].map((level) => (
                                    <td key={`writing-${level}`} className="border border-gray-300 p-2 text-center">
                                      {lang.writing === level ? '+' : ''}
                                    </td>
                                  ))}
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">4.3. Компьютерийн болон оффисийн тоног төхөөрөмж, технологи эзэмшсэн байдал (түвшинг &quot;+&quot; гэж тэмдэглэнэ)</h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {editedFormData.computerSkills?.software && editedFormData.computerSkills.software.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-4">Эзэмшсэн программын нэр</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full border border-gray-300">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="border border-gray-300 p-2 text-left">Программын нэр</th>
                                  <th className="border border-gray-300 p-2 text-center">Дунд</th>
                                  <th className="border border-gray-300 p-2 text-center">Сайн</th>
                                  <th className="border border-gray-300 p-2 text-center">Онц</th>
                                </tr>
                              </thead>
                              <tbody>
                                {editedFormData.computerSkills.software.map(
                                  (sw: { name?: string; level?: string }, index: number) => (
                                    <tr key={index}>
                                      <td className="border border-gray-300 p-2">{sw.name || '-'}</td>
                                      {['average', 'good', 'excellent'].map((level) => (
                                        <td key={level} className="border border-gray-300 p-2 text-center">
                                          {sw.level === level ? '+' : ''}
                                        </td>
                                      ))}
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {editedFormData.computerSkills?.officeEquipment && (
                        <div>
                          <h4 className="font-semibold mb-4">Эзэмшсэн оффисийн тоног төхөөрөмж, технологийн нэр</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full border border-gray-300">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="border border-gray-300 p-2 text-left">Тоног төхөөрөмжийн нэр</th>
                                  <th className="border border-gray-300 p-2 text-center">Дунд</th>
                                  <th className="border border-gray-300 p-2 text-center">Сайн</th>
                                  <th className="border border-gray-300 p-2 text-center">Онц</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border border-gray-300 p-2">Интернетийн орчинд ажиллах</td>
                                  {['average', 'good', 'excellent'].map((level) => (
                                    <td key={level} className="border border-gray-300 p-2 text-center">
                                      {editedFormData.computerSkills.officeEquipment.internet === level ? '+' : ''}
                                    </td>
                                  ))}
                                </tr>
                                <tr>
                                  <td className="border border-gray-300 p-2">Дотоод сүлжээ ашиглах</td>
                                  {['average', 'good', 'excellent'].map((level) => (
                                    <td key={level} className="border border-gray-300 p-2 text-center">
                                      {editedFormData.computerSkills.officeEquipment.internalNetwork === level ? '+' : ''}
                                    </td>
                                  ))}
                                </tr>
                                <tr>
                                  <td className="border border-gray-300 p-2">Оффисын тоног төхөөрөмж ашиглах - скайнер</td>
                                  {['average', 'good', 'excellent'].map((level) => (
                                    <td key={level} className="border border-gray-300 p-2 text-center">
                                      {editedFormData.computerSkills.officeEquipment.scanner === level ? '+' : ''}
                                    </td>
                                  ))}
                                </tr>
                                <tr>
                                  <td className="border border-gray-300 p-2">принтер</td>
                                  {['average', 'good', 'excellent'].map((level) => (
                                    <td key={level} className="border border-gray-300 p-2 text-center">
                                      {editedFormData.computerSkills.officeEquipment.printer === level ? '+' : ''}
                                    </td>
                                  ))}
                                </tr>
                                <tr>
                                  <td className="border border-gray-300 p-2">хувилагч</td>
                                  {['average', 'good', 'excellent'].map((level) => (
                                    <td key={level} className="border border-gray-300 p-2 text-center">
                                      {editedFormData.computerSkills.officeEquipment.copier === level ? '+' : ''}
                                    </td>
                                  ))}
                                </tr>
                                <tr>
                                  <td className="border border-gray-300 p-2">факс</td>
                                  {['average', 'good', 'excellent'].map((level) => (
                                    <td key={level} className="border border-gray-300 p-2 text-center">
                                      {editedFormData.computerSkills.officeEquipment.fax === level ? '+' : ''}
                                    </td>
                                  ))}
                                </tr>
                                <tr>
                                  <td className="border border-gray-300 p-2">гэрэл зургийн болон видео бичлэгийн аппарат г.м</td>
                                  {['average', 'good', 'excellent'].map((level) => (
                                    <td key={level} className="border border-gray-300 p-2 text-center">
                                      {editedFormData.computerSkills.officeEquipment.photoVideo === level ? '+' : ''}
                                    </td>
                                  ))}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {editedFormData.foreignLanguages && editedFormData.foreignLanguages.length > 0 && (
                <div className="border border-gray-300 p-6 rounded-lg">
                  <h2 className="text-xl font-bold mb-6">5. ГАДААД ХЭЛНИЙ МЭДЛЭГ</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 p-2 text-left">Хэл</th>
                          <th className="border border-gray-300 p-2 text-left">Сонсох</th>
                          <th className="border border-gray-300 p-2 text-left">Ярих</th>
                          <th className="border border-gray-300 p-2 text-left">Унших</th>
                          <th className="border border-gray-300 p-2 text-left">Бичих</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editedFormData.foreignLanguages.map(
                          (lang: { language?: string; listening?: string; speaking?: string; reading?: string; writing?: string }, index: number) => (
                            <tr key={index}>
                              <td className="border border-gray-300 p-2">{lang.language || '-'}</td>
                              <td className="border border-gray-300 p-2">{lang.listening ? translateLevel(lang.listening) : '-'}</td>
                              <td className="border border-gray-300 p-2">{lang.speaking ? translateLevel(lang.speaking) : '-'}</td>
                              <td className="border border-gray-300 p-2">{lang.reading ? translateLevel(lang.reading) : '-'}</td>
                              <td className="border border-gray-300 p-2">{lang.writing ? translateLevel(lang.writing) : '-'}</td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {editedFormData.computerSkills && (
                <div className="border border-gray-300 p-6 rounded-lg">
                  <h2 className="text-xl font-bold mb-6">6. КОМПЬЮТЕРИЙН МЭДЛЭГ</h2>
                  
                  {editedFormData.computerSkills.software && editedFormData.computerSkills.software.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4">Программ хангамж</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-300">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-300 p-2 text-left">Программын нэр</th>
                              <th className="border border-gray-300 p-2 text-left">Мэдлэгийн түвшин</th>
                            </tr>
                          </thead>
                          <tbody>
                            {editedFormData.computerSkills.software.map(
                              (sw: { name?: string; level?: string }, index: number) => (
                                <tr key={index}>
                                  <td className="border border-gray-300 p-2">{sw.name || '-'}</td>
                                  <td className="border border-gray-300 p-2">{sw.level ? translateLevel(sw.level) : '-'}</td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {editedFormData.computerSkills.officeEquipment && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Оффисын тоног төхөөрөмж</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(editedFormData.computerSkills.officeEquipment).map(([key, value]) => (
                          <div key={key} className="flex justify-between border-b pb-2">
                            <span className="font-medium">{translateEquipmentKey(key)}:</span>
                            <span>{typeof value === 'string' ? translateLevel(value) : String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

        {/* Footer - Hidden on Print */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 print:hidden">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Цуцлах
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSaving ? "Хадгалж байна..." : "Хадгалах"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isApproving ? "Зөвшөөрч байна..." : "Зөвшөөрөх"}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Хаах
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}