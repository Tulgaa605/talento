'use client';

import React from 'react';

type Level = '' | 'average' | 'good' | 'excellent';

interface GovernmentEmployeeForm {
  skills: {
    individualSkills: {
      selfAwareness: { values: 1 | 2 | 3; learningStyle: 1 | 2 | 3; acceptChange: 1 | 2 | 3 };
      stressManagement: { reduceStress: 1 | 2 | 3; timeManagement: 1 | 2 | 3; delegate: 1 | 2 | 3 };
      problemSolving: { appropriateApproaches: 1 | 2 | 3; creativeApproaches: 1 | 2 | 3; supportInitiatives: 1 | 2 | 3 };
    };
    interpersonalSkills: {
      supportiveRelationships: { care: 1 | 2 | 3; offerHelp: 1 | 2 | 3; listen: 1 | 2 | 3 };
      influence: { exerciseAuthority: 1 | 2 | 3; influenceOthers: 1 | 2 | 3; empower: 1 | 2 | 3 };
      inspire: { identifyIneffective: 1 | 2 | 3; createEnvironment: 1 | 2 | 3; rewardAchievements: 1 | 2 | 3 };
      conflictResolution: { identifyCauses: 1 | 2 | 3; chooseStrategies: 1 | 2 | 3; resolveConflicts: 1 | 2 | 3 };
    };
    teamworkSkills: { formTeam: 1 | 2 | 3; respectAuthority: 1 | 2 | 3; shareKnowledge: 1 | 2 | 3 };
    otherSkills: {
      takeResponsibility: 1 | 2 | 3;
      beAccountable: 1 | 2 | 3;
      consistentGoals: 1 | 2 | 3;
      developSelf: 1 | 2 | 3;
      formulateProblems: 1 | 2 | 3;
      makeDecisions: 1 | 2 | 3;
      otherSkills: string;
    };
  };
  foreignLanguages: Array<{
    language?: string;
    listening?: Level;
    speaking?: Level;
    reading?: Level;
    writing?: Level;
  }>;
  computerSkills: {
    software: Array<{ name?: string; level?: Level | '' }>;
    officeEquipment: {
      internet: Level;
      internalNetwork: Level;
      scanner: Level;
      printer: Level;
      copier: Level;
      fax: Level;
      photoVideo: Level;
    };
  };
  workExperience: Array<{
    organization?: string;
    position?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

interface SkillsSectionProps {
  formData: GovernmentEmployeeForm;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateField: (path: string[], value: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addArrayItem: (path: string[], newItem: any) => void;
  removeArrayItem: (path: string[], index: number) => void;
}

export default function GovernmentEmployeeQuestionnaireSkills({
  formData,
  updateField,
  addArrayItem,
  removeArrayItem,
}: SkillsSectionProps) {
  const updateSkillLevel = (path: string[], value: 1 | 2 | 3) => {
    updateField(path, value);
  };

  const updateEquipmentLevel = (field: keyof typeof formData.computerSkills.officeEquipment, value: Level) => {
    updateField(['computerSkills', 'officeEquipment', field], value);
  };

  const updateLanguageLevel = (index: number, field: 'listening' | 'speaking' | 'reading' | 'writing', value: Level) => {
    const newLanguages = [...formData.foreignLanguages];
    if (!newLanguages[index]) newLanguages[index] = {};
    newLanguages[index][field] = value;
    updateField(['foreignLanguages'], newLanguages);
  };

  const updateSoftwareLevel = (index: number, value: Level | '') => {
    const newSoftware = [...formData.computerSkills.software];
    if (!newSoftware[index]) newSoftware[index] = {};
    newSoftware[index].level = value;
    updateField(['computerSkills', 'software'], newSoftware);
  };

  return (
    <>
      {/* Section 4: Skills Information */}
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
              <div className="mb-6">
                <h5 className="font-medium mb-3">Өөрийгөө танин мэдэх</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Өөрийн эрхэмлэн дээдлэх зүйлс ба тэргүүлэх чиглэлээ тодорхойлох</span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={`w-8 h-8 rounded border ${
                            formData.skills.individualSkills.selfAwareness.values === level
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300'
                          }`}
                          onClick={() => updateSkillLevel(['skills', 'individualSkills', 'selfAwareness', 'values'], level as 1 | 2 | 3)}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Танин мэдэж хэв маягаа тогтоох</span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={`w-8 h-8 rounded border ${
                            formData.skills.individualSkills.selfAwareness.learningStyle === level
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300'
                          }`}
                          onClick={() => updateSkillLevel(['skills', 'individualSkills', 'selfAwareness', 'learningStyle'], level as 1 | 2 | 3)}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Өөрчлөлтийг хүлээн авах</span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={`w-8 h-8 rounded border ${
                            formData.skills.individualSkills.selfAwareness.acceptChange === level
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300'
                          }`}
                          onClick={() => updateSkillLevel(['skills', 'individualSkills', 'selfAwareness', 'acceptChange'], level as 1 | 2 | 3)}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stress Management */}
              <div className="mb-6">
                <h5 className="font-medium mb-3">Стрессээ тайлах</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Стрессийн хүчин зүйлсийг намжаах</span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={`w-8 h-8 rounded border ${
                            formData.skills.individualSkills.stressManagement.reduceStress === level
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300'
                          }`}
                          onClick={() => updateSkillLevel(['skills', 'individualSkills', 'stressManagement', 'reduceStress'], level as 1 | 2 | 3)}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Цагийг зүй зохистой ашиглах</span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={`w-8 h-8 rounded border ${
                            formData.skills.individualSkills.stressManagement.timeManagement === level
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300'
                          }`}
                          onClick={() => updateSkillLevel(['skills', 'individualSkills', 'stressManagement', 'timeManagement'], level as 1 | 2 | 3)}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Эрх мэдлээ төлөөлүүлэх</span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={`w-8 h-8 rounded border ${
                            formData.skills.individualSkills.stressManagement.delegate === level
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300'
                          }`}
                          onClick={() => updateSkillLevel(['skills', 'individualSkills', 'stressManagement', 'delegate'], level as 1 | 2 | 3)}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h5 className="font-medium mb-3">Асуудлыг бүтээлчээр шийдвэрлэх</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Зүй зохистой хандлагыг хэрэглэх</span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={`w-8 h-8 rounded border ${
                            formData.skills.individualSkills.problemSolving.appropriateApproaches === level
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300'
                          }`}
                          onClick={() => updateSkillLevel(['skills', 'individualSkills', 'problemSolving', 'appropriateApproaches'], level as 1 | 2 | 3)}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Бүтээлч хандлагыг ашиглах</span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={`w-8 h-8 rounded border ${
                            formData.skills.individualSkills.problemSolving.creativeApproaches === level
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300'
                          }`}
                          onClick={() => updateSkillLevel(['skills', 'individualSkills', 'problemSolving', 'creativeApproaches'], level as 1 | 2 | 3)}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Шинэ санаачлагыг дэмжих</span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={`w-8 h-8 rounded border ${
                            formData.skills.individualSkills.problemSolving.supportInitiatives === level
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300'
                          }`}
                          onClick={() => updateSkillLevel(['skills', 'individualSkills', 'problemSolving', 'supportInitiatives'], level as 1 | 2 | 3)}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Бүлгээр ажиллах ур чадвар</h4>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Үр нөлөөтэй баг бүрдүүлэх</span>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((level) => (
                      <button
                        key={level}
                        type="button"
                        className={`w-8 h-8 rounded border ${
                          formData.skills.teamworkSkills.formTeam === level
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-300'
                        }`}
                        onClick={() => updateSkillLevel(['skills', 'teamworkSkills', 'formTeam'], level as 1 | 2 | 3)}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Бусдын эрх мэдэл, бүрэн эрхийг хүндэтгэж, дэмжлэг үзүүлэх</span>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((level) => (
                      <button
                        key={level}
                        type="button"
                        className={`w-8 h-8 rounded border ${
                          formData.skills.teamworkSkills.respectAuthority === level
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-300'
                        }`}
                        onClick={() => updateSkillLevel(['skills', 'teamworkSkills', 'respectAuthority'], level as 1 | 2 | 3)}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Мэдлэг, мэдээллээ бусадтай хуваалцах</span>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((level) => (
                      <button
                        key={level}
                        type="button"
                        className={`w-8 h-8 rounded border ${
                          formData.skills.teamworkSkills.shareKnowledge === level
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-300'
                        }`}
                        onClick={() => updateSkillLevel(['skills', 'teamworkSkills', 'shareKnowledge'], level as 1 | 2 | 3)}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <h4 className="font-semibold mb-4">Бусад ур чадвар</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Үүрэг хүлээх</span>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((level) => (
                      <button
                        key={level}
                        type="button"
                        className={`w-8 h-8 rounded border ${
                          formData.skills.otherSkills.takeResponsibility === level
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-300'
                        }`}
                        onClick={() => updateSkillLevel(['skills', 'otherSkills', 'takeResponsibility'], level as 1 | 2 | 3)}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Хариуцлага хүлээх</span>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((level) => (
                      <button
                        key={level}
                        type="button"
                        className={`w-8 h-8 rounded border ${
                          formData.skills.otherSkills.beAccountable === level
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-300'
                        }`}
                        onClick={() => updateSkillLevel(['skills', 'otherSkills', 'beAccountable'], level as 1 | 2 | 3)}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Нийтийн зорилгод тууштай байх</span>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((level) => (
                      <button
                        key={level}
                        type="button"
                        className={`w-8 h-8 rounded border ${
                          formData.skills.otherSkills.consistentGoals === level
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-300'
                        }`}
                        onClick={() => updateSkillLevel(['skills', 'otherSkills', 'consistentGoals'], level as 1 | 2 | 3)}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Өөрийгөө хөгжүүлэх</span>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((level) => (
                      <button
                        key={level}
                        type="button"
                        className={`w-8 h-8 rounded border ${
                          formData.skills.otherSkills.developSelf === level
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-300'
                        }`}
                        onClick={() => updateSkillLevel(['skills', 'otherSkills', 'developSelf'], level as 1 | 2 | 3)}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Асуудал боловсруулах</span>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((level) => (
                      <button
                        key={level}
                        type="button"
                        className={`w-8 h-8 rounded border ${
                          formData.skills.otherSkills.formulateProblems === level
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-300'
                        }`}
                        onClick={() => updateSkillLevel(['skills', 'otherSkills', 'formulateProblems'], level as 1 | 2 | 3)}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Оновчтой шийдвэр гаргах</span>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((level) => (
                      <button
                        key={level}
                        type="button"
                        className={`w-8 h-8 rounded border ${
                          formData.skills.otherSkills.makeDecisions === level
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-300'
                        }`}
                        onClick={() => updateSkillLevel(['skills', 'otherSkills', 'makeDecisions'], level as 1 | 2 | 3)}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Дээр дурдсанаас бусад ур чадвараасаа заримыг нэрлэнэ үү</label>
                <input
                  type="text"
                  className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                  value={formData.skills.otherSkills.otherSkills}
                  onChange={(e) => updateField(['skills', 'otherSkills', 'otherSkills'], e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="mt-8">
            <h4 className="font-semibold mb-4">Хүмүүс хоорондын харилцааны ур чадвар</h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h5 className="font-medium mb-3">Бусадтай бие биенийгээ дэмжсэн харилцаа холбоо тогтоох</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Халамжлах</span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={`w-8 h-8 rounded border ${
                            formData.skills.interpersonalSkills.supportiveRelationships.care === level
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300'
                          }`}
                          onClick={() => updateSkillLevel(['skills', 'interpersonalSkills', 'supportiveRelationships', 'care'], level as 1 | 2 | 3)}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Зөвлөгөө өгөх</span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={`w-8 h-8 rounded border ${
                            formData.skills.interpersonalSkills.supportiveRelationships.offerHelp === level
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300'
                          }`}
                          onClick={() => updateSkillLevel(['skills', 'interpersonalSkills', 'supportiveRelationships', 'offerHelp'], level as 1 | 2 | 3)}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Бусдыг сонсох</span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={`w-8 h-8 rounded border ${
                            formData.skills.interpersonalSkills.supportiveRelationships.listen === level
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300'
                          }`}
                          onClick={() => updateSkillLevel(['skills', 'interpersonalSkills', 'supportiveRelationships', 'listen'], level as 1 | 2 | 3)}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-medium mb-3">Эрх мэдлийнхээ хүрээнд бусдад нөлөөлөх</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Эрх мэдлээ хэрэгжүүлэх</span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={`w-8 h-8 rounded border ${
                            formData.skills.interpersonalSkills.influence.exerciseAuthority === level
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300'
                          }`}
                          onClick={() => updateSkillLevel(['skills', 'interpersonalSkills', 'influence', 'exerciseAuthority'], level as 1 | 2 | 3)}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Бусдад нөлөөлөх</span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={`w-8 h-8 rounded border ${
                            formData.skills.interpersonalSkills.influence.influenceOthers === level
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300'
                          }`}
                          onClick={() => updateSkillLevel(['skills', 'interpersonalSkills', 'influence', 'influenceOthers'], level as 1 | 2 | 3)}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Бусдад бүрэн эрх олгох</span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={`w-8 h-8 rounded border ${
                            formData.skills.interpersonalSkills.influence.empower === level
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300'
                          }`}
                          onClick={() => updateSkillLevel(['skills', 'interpersonalSkills', 'influence', 'empower'], level as 1 | 2 | 3)}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-medium mb-3">Бусдад урам хайрлах</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Үр нөлөөгүй үйл ажиллагааг илрүүлэх</span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={`w-8 h-8 rounded border ${
                            formData.skills.interpersonalSkills.inspire.identifyIneffective === level
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300'
                          }`}
                          onClick={() => updateSkillLevel(['skills', 'interpersonalSkills', 'inspire', 'identifyIneffective'], level as 1 | 2 | 3)}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Урам зориг оруулах орчин бий болгох</span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={`w-8 h-8 rounded border ${
                            formData.skills.interpersonalSkills.inspire.createEnvironment === level
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300'
                          }`}
                          onClick={() => updateSkillLevel(['skills', 'interpersonalSkills', 'inspire', 'createEnvironment'], level as 1 | 2 | 3)}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Амжилтыг урамшуулах</span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={`w-8 h-8 rounded border ${
                            formData.skills.interpersonalSkills.inspire.rewardAchievements === level
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300'
                          }`}
                          onClick={() => updateSkillLevel(['skills', 'interpersonalSkills', 'inspire', 'rewardAchievements'], level as 1 | 2 | 3)}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-medium mb-3">Зөрчлийг зохицуулах</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Шалтгааныг тогтоох</span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={`w-8 h-8 rounded border ${
                            formData.skills.interpersonalSkills.conflictResolution.identifyCauses === level
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300'
                          }`}
                          onClick={() => updateSkillLevel(['skills', 'interpersonalSkills', 'conflictResolution', 'identifyCauses'], level as 1 | 2 | 3)}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Тохирох стратегийг сонгох</span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={`w-8 h-8 rounded border ${
                            formData.skills.interpersonalSkills.conflictResolution.chooseStrategies === level
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300'
                          }`}
                          onClick={() => updateSkillLevel(['skills', 'interpersonalSkills', 'conflictResolution', 'chooseStrategies'], level as 1 | 2 | 3)}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Сөргөлдөх явдлыг арилгах</span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={`w-8 h-8 rounded border ${
                            formData.skills.interpersonalSkills.conflictResolution.resolveConflicts === level
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300'
                          }`}
                          onClick={() => updateSkillLevel(['skills', 'interpersonalSkills', 'conflictResolution', 'resolveConflicts'], level as 1 | 2 | 3)}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">4.2. Гадаад хэлний мэдлэг (түвшинг &quot;+&quot; гэж тэмдэглэнэ)</h3>
            <button
              type="button"
              onClick={() => addArrayItem(['foreignLanguages'], {})}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              + Нэмэх
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-2 text-left">Гадаад хэлний нэр</th>
                  <th className="border border-gray-300 p-2 text-center" colSpan={3}>сонсож ойлгох</th>
                  <th className="border border-gray-300 p-2 text-center" colSpan={3}>ярих</th>
                  <th className="border border-gray-300 p-2 text-center" colSpan={3}>унших</th>
                  <th className="border border-gray-300 p-2 text-center" colSpan={3}>бичих</th>
                  <th className="border border-gray-300 p-2 text-center">Үйлдэл</th>
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
                  <th className="border border-gray-300 p-2 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {formData.foreignLanguages.map((language, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        className="w-full border-none focus:outline-none"
                        value={language?.language || ''}
                        onChange={(e) => {
                          const newLanguages = [...formData.foreignLanguages];
                          if (!newLanguages[index]) newLanguages[index] = {};
                          newLanguages[index].language = e.target.value;
                          updateField(['foreignLanguages'], newLanguages);
                        }}
                      />
                    </td>
                    {['listening'].map((skill) => (
                      ['average', 'good', 'excellent'].map((level) => (
                        <td key={`${skill}-${level}`} className="border border-gray-300 p-2 text-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={language?.[skill as keyof typeof language] === level}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateLanguageLevel(index, skill as 'listening' | 'speaking' | 'reading' | 'writing', level as Level);
                              } else {
                                updateLanguageLevel(index, skill as 'listening' | 'speaking' | 'reading' | 'writing', '');
                              }
                            }}
                          />
                        </td>
                      ))
                    ))}
                    {['speaking'].map((skill) => (
                      ['average', 'good', 'excellent'].map((level) => (
                        <td key={`${skill}-${level}`} className="border border-gray-300 p-2 text-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={language?.[skill as keyof typeof language] === level}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateLanguageLevel(index, skill as 'listening' | 'speaking' | 'reading' | 'writing', level as Level);
                              } else {
                                updateLanguageLevel(index, skill as 'listening' | 'speaking' | 'reading' | 'writing', '');
                              }
                            }}
                          />
                        </td>
                      ))
                    ))}
                    {['reading'].map((skill) => (
                      ['average', 'good', 'excellent'].map((level) => (
                        <td key={`${skill}-${level}`} className="border border-gray-300 p-2 text-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={language?.[skill as keyof typeof language] === level}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateLanguageLevel(index, skill as 'listening' | 'speaking' | 'reading' | 'writing', level as Level);
                              } else {
                                updateLanguageLevel(index, skill as 'listening' | 'speaking' | 'reading' | 'writing', '');
                              }
                            }}
                          />
                        </td>
                      ))
                    ))}
                    {['writing'].map((skill) => (
                      ['average', 'good', 'excellent'].map((level) => (
                        <td key={`${skill}-${level}`} className="border border-gray-300 p-2 text-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={language?.[skill as keyof typeof language] === level}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateLanguageLevel(index, skill as 'listening' | 'speaking' | 'reading' | 'writing', level as Level);
                              } else {
                                updateLanguageLevel(index, skill as 'listening' | 'speaking' | 'reading' | 'writing', '');
                              }
                            }}
                          />
                        </td>
                      ))
                    ))}
                    <td className="border border-gray-300 p-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeArrayItem(['foreignLanguages'], index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Устгах
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">4.3. Компьютерийн болон оффисийн тоног төхөөрөмж, технологи эзэмшсэн байдал (түвшинг &quot;+&quot; гэж тэмдэглэнэ)</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Эзэмшсэн программын нэр</h4>
                <button
                  type="button"
                  onClick={() => addArrayItem(['computerSkills', 'software'], {})}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  + Нэмэх
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2 text-left">Программын нэр</th>
                      <th className="border border-gray-300 p-2 text-center">Дунд</th>
                      <th className="border border-gray-300 p-2 text-center">Сайн</th>
                      <th className="border border-gray-300 p-2 text-center">Онц</th>
                      <th className="border border-gray-300 p-2 text-center">Үйлдэл</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.computerSkills.software.map((software, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="text"
                            className="w-full border-none focus:outline-none"
                            value={software?.name || ''}
                            onChange={(e) => {
                              const newSoftware = [...formData.computerSkills.software];
                              if (!newSoftware[index]) newSoftware[index] = {};
                              newSoftware[index].name = e.target.value;
                              updateField(['computerSkills', 'software'], newSoftware);
                            }}
                          />
                        </td>
                        {['average', 'good', 'excellent'].map((level) => (
                          <td key={level} className="border border-gray-300 p-2 text-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4"
                              checked={software?.level === level}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  updateSoftwareLevel(index, level as Level | '');
                                } else {
                                  updateSoftwareLevel(index, '');
                                }
                              }}
                            />
                          </td>
                        ))}
                        <td className="border border-gray-300 p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeArrayItem(['computerSkills', 'software'], index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Устгах
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={formData.computerSkills.officeEquipment.internet === level}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateEquipmentLevel('internet', level as Level);
                              } else {
                                updateEquipmentLevel('internet', '');
                              }
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Дотоод сүлжээ ашиглах</td>
                      {['average', 'good', 'excellent'].map((level) => (
                        <td key={level} className="border border-gray-300 p-2 text-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={formData.computerSkills.officeEquipment.internalNetwork === level}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateEquipmentLevel('internalNetwork', level as Level);
                              } else {
                                updateEquipmentLevel('internalNetwork', '');
                              }
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Оффисийн тоног төхөөрөмж ашиглах - скайнер</td>
                      {['average', 'good', 'excellent'].map((level) => (
                        <td key={level} className="border border-gray-300 p-2 text-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={formData.computerSkills.officeEquipment.scanner === level}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateEquipmentLevel('scanner', level as Level);
                              } else {
                                updateEquipmentLevel('scanner', '');
                              }
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">принтер</td>
                      {['average', 'good', 'excellent'].map((level) => (
                        <td key={level} className="border border-gray-300 p-2 text-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={formData.computerSkills.officeEquipment.printer === level}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateEquipmentLevel('printer', level as Level);
                              } else {
                                updateEquipmentLevel('printer', '');
                              }
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">хувилагч</td>
                      {['average', 'good', 'excellent'].map((level) => (
                        <td key={level} className="border border-gray-300 p-2 text-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={formData.computerSkills.officeEquipment.copier === level}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateEquipmentLevel('copier', level as Level);
                              } else {
                                updateEquipmentLevel('copier', '');
                              }
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">факс</td>
                      {['average', 'good', 'excellent'].map((level) => (
                        <td key={level} className="border border-gray-300 p-2 text-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={formData.computerSkills.officeEquipment.fax === level}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateEquipmentLevel('fax', level as Level);
                              } else {
                                updateEquipmentLevel('fax', '');
                              }
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">гэрэл зургийн болон видео бичлэгийн аппарат г.м</td>
                      {['average', 'good', 'excellent'].map((level) => (
                        <td key={level} className="border border-gray-300 p-2 text-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={formData.computerSkills.officeEquipment.photoVideo === level}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateEquipmentLevel('photoVideo', level as Level);
                              } else {
                                updateEquipmentLevel('photoVideo', '');
                              }
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-gray-300 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-6">5. ТУРШЛАГЫН ТАЛААРХ МЭДЭЭЛЭЛ</h2>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">5.1. Хөдөлмөр эрхлэлтийн байдал</h3>
            <button
              type="button"
              onClick={() => addArrayItem(['workExperience'], {})}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              + Нэмэх
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-2 text-left">Ажилласан байгууллага, газар, түүний хэлтэс, алба</th>
                  <th className="border border-gray-300 p-2 text-left">Албан тушаал</th>
                  <th className="border border-gray-300 p-2 text-left">Ажилд орсон он, сар</th>
                  <th className="border border-gray-300 p-2 text-left">Ажлаас гарсан он, сар</th>
                  <th className="border border-gray-300 p-2 text-center">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {formData.workExperience.map((experience, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        className="w-full border-none focus:outline-none"
                        value={experience?.organization || ''}
                        onChange={(e) => {
                          const newExperience = [...formData.workExperience];
                          if (!newExperience[index]) newExperience[index] = {};
                          newExperience[index].organization = e.target.value;
                          updateField(['workExperience'], newExperience);
                        }}
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        className="w-full border-none focus:outline-none"
                        value={experience?.position || ''}
                        onChange={(e) => {
                          const newExperience = [...formData.workExperience];
                          if (!newExperience[index]) newExperience[index] = {};
                          newExperience[index].position = e.target.value;
                          updateField(['workExperience'], newExperience);
                        }}
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        className="w-full border-none focus:outline-none"
                        value={experience?.startDate || ''}
                        onChange={(e) => {
                          const newExperience = [...formData.workExperience];
                          if (!newExperience[index]) newExperience[index] = {};
                          newExperience[index].startDate = e.target.value;
                          updateField(['workExperience'], newExperience);
                        }}
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        className="w-full border-none focus:outline-none"
                        value={experience?.endDate || ''}
                        onChange={(e) => {
                          const newExperience = [...formData.workExperience];
                          if (!newExperience[index]) newExperience[index] = {};
                          newExperience[index].endDate = e.target.value;
                          updateField(['workExperience'], newExperience);
                        }}
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeArrayItem(['workExperience'], index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Устгах
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
