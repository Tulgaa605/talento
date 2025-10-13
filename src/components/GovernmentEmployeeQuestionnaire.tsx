'use client';

import React, { useState } from 'react';
import GovernmentEmployeeQuestionnaireSkills from './GovernmentEmployeeQuestionnaireSkills';

type Level = '' | 'average' | 'good' | 'excellent';

type FamilyRelative = {
  relationship?: string;
  name?: string;
  birthYear?: string;
  birthPlace?: string;
  occupation?: string;
};

type Address = {
  aimag: string;
  city: string;
  soum: string;
  district: string;
  homeAddress: string;
  phone: string;
  mobile: string;
  fax: string;
  email: string;
};

type EducationRow = {
  schoolName?: string;
  startDate?: string;
  endDate?: string;
  degree?: string;
};

type DoctoralDegree = {
  degree?: string;
  defendedAt?: string;
  year?: string;
  certificateNumber?: string;
};

type TrainingRow = {
  organization?: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  field?: string;
  certificateNumber?: string;
};

type OfficialRank = {
  category?: string;
  rank?: string;
  decree?: string;
  certificateNumber?: string;
};

type AcademicTitle = {
  title?: string;
  issuingOrganization?: string;
  year?: string;
  certificateNumber?: string;
};

type IndividualSelfAwareness = { values: 1 | 2 | 3; learningStyle: 1 | 2 | 3; acceptChange: 1 | 2 | 3 };
type IndividualStress = { reduceStress: 1 | 2 | 3; timeManagement: 1 | 2 | 3; delegate: 1 | 2 | 3 };
type IndividualProblem = { appropriateApproaches: 1 | 2 | 3; creativeApproaches: 1 | 2 | 3; supportInitiatives: 1 | 2 | 3 };

type InterpersonalCluster = { care: 1 | 2 | 3; offerHelp: 1 | 2 | 3; listen: 1 | 2 | 3 };
type InfluenceCluster = { exerciseAuthority: 1 | 2 | 3; influenceOthers: 1 | 2 | 3; empower: 1 | 2 | 3 };
type InspireCluster = { identifyIneffective: 1 | 2 | 3; createEnvironment: 1 | 2 | 3; rewardAchievements: 1 | 2 | 3 };
type ConflictCluster = { identifyCauses: 1 | 2 | 3; chooseStrategies: 1 | 2 | 3; resolveConflicts: 1 | 2 | 3 };

type Skills = {
  individualSkills: {
    selfAwareness: IndividualSelfAwareness;
    stressManagement: IndividualStress;
    problemSolving: IndividualProblem;
  };
  interpersonalSkills: {
    supportiveRelationships: InterpersonalCluster;
    influence: InfluenceCluster;
    inspire: InspireCluster;
    conflictResolution: ConflictCluster;
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

type LanguageSkill = {
  language?: string;
  listening?: Level;
  speaking?: Level;
  reading?: Level;
  writing?: Level;
};

type SoftwareSkill = { name?: string; level?: Level | '' };

type OfficeEquipment = {
  internet: Level;
  internalNetwork: Level;
  scanner: Level;
  printer: Level;
  copier: Level;
  fax: Level;
  photoVideo: Level;
};

type WorkRow = { organization?: string; position?: string; startDate?: string; endDate?: string };

export interface GovernmentEmployeeForm {
  identification: {
    registrationNumber: string;
    citizenIdNumber: string;
    socialInsuranceNumber: string;
    healthInsuranceNumber: string;
  };
  personalInfo: {
    fatherName: string;
    name: string;
    gender: string;
    birthYear: string;
    birthMonth: string;
    birthDay: string;
    birthAimag: string;
    birthSoum: string;
    birthPlace: string;
    surname: string;
    ethnicity: string;
    socialOrigin: string;
    familyMembers: FamilyRelative[];
    relatives: FamilyRelative[];
    currentAddress: Address;
    postalAddress: string;
    postalIndex: string;
    emergencyContact: string;
    emergencyPhone: string;
  };
  education: {
    generalEducation: EducationRow[];
    doctoralDegrees: DoctoralDegree[];
    educationDoctorateTopic: string;
    scienceDoctorateTopic: string;
  };
  professionalTraining: {
    training: TrainingRow[];
    officialRanks: OfficialRank[];
    academicTitles: AcademicTitle[];
  };
  skills: Skills;
  foreignLanguages: LanguageSkill[];
  computerSkills: {
    software: SoftwareSkill[];
    officeEquipment: OfficeEquipment;
  };
  workExperience: WorkRow[];
}

interface GovernmentEmployeeQuestionnaireProps {
  onSubmit: (data: GovernmentEmployeeForm) => void;
  onCancel: () => void;
}


export default function GovernmentEmployeeQuestionnaire({
  onSubmit,
  onCancel,
}: GovernmentEmployeeQuestionnaireProps) {
  const [formData, setFormData] = useState<GovernmentEmployeeForm>({
    identification: {
      registrationNumber: '',
      citizenIdNumber: '',
      socialInsuranceNumber: '',
      healthInsuranceNumber: '',
    },

    personalInfo: {
      fatherName: '',
      name: '',
      gender: '',
      birthYear: '',
      birthMonth: '',
      birthDay: '',
      birthAimag: '',
      birthSoum: '',
      birthPlace: '',
      surname: '',
      ethnicity: '',
      socialOrigin: '',
      familyMembers: [],
      relatives: [],
      currentAddress: {
        aimag: '',
        city: '',
        soum: '',
        district: '',
        homeAddress: '',
        phone: '',
        mobile: '',
        fax: '',
        email: '',
      },
      postalAddress: '',
      postalIndex: '',
      emergencyContact: '',
      emergencyPhone: '',
    },

    education: {
      generalEducation: [],
      doctoralDegrees: [],
      educationDoctorateTopic: '',
      scienceDoctorateTopic: '',
    },

    professionalTraining: {
      training: [],
      officialRanks: [],
      academicTitles: [],
    },

    skills: {
      individualSkills: {
        selfAwareness: { values: 1, learningStyle: 1, acceptChange: 1 },
        stressManagement: { reduceStress: 1, timeManagement: 1, delegate: 1 },
        problemSolving: { appropriateApproaches: 1, creativeApproaches: 1, supportInitiatives: 1 },
      },
      interpersonalSkills: {
        supportiveRelationships: { care: 1, offerHelp: 1, listen: 1 },
        influence: { exerciseAuthority: 1, influenceOthers: 1, empower: 1 },
        inspire: { identifyIneffective: 1, createEnvironment: 1, rewardAchievements: 1 },
        conflictResolution: { identifyCauses: 1, chooseStrategies: 1, resolveConflicts: 1 },
      },
      teamworkSkills: {
        formTeam: 1,
        respectAuthority: 1,
        shareKnowledge: 1,
      },
      otherSkills: {
        takeResponsibility: 1,
        beAccountable: 1,
        consistentGoals: 1,
        developSelf: 1,
        formulateProblems: 1,
        makeDecisions: 1,
        otherSkills: '',
      },
    },

    foreignLanguages: [],
    computerSkills: {
      software: [],
      officeEquipment: {
        internet: '',
        internalNetwork: '',
        scanner: '',
        printer: '',
        copier: '',
        fax: '',
        photoVideo: '',
      },
    },

    workExperience: [],
  });

  type AnyObject = Record<string, unknown>;

  const updateField = (path: string[], value: unknown) => {
    setFormData(prev => {
      const newData = { ...prev } as AnyObject;
      let current = newData;
  
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i] as string;
        current[key] = { ...(current[key] as AnyObject) };
        current = current[key] as AnyObject;
      }
  
      current[path[path.length - 1] as string] = value;
      return newData as unknown as GovernmentEmployeeForm;
    });
  };

  const addArrayItem = (path: string[], newItem: unknown) => {
    setFormData(prev => {
      const newData = { ...prev } as AnyObject;
      let current: AnyObject = newData;
  
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        current[key] = { ...(current[key] as AnyObject) };
        current = current[key] as AnyObject;
      }
  
      const lastKey = path[path.length - 1];
      const arr = (current[lastKey] as unknown[]) || [];
      current[lastKey] = [...arr, newItem];
  
      // ✅ convert via unknown first (avoids TS2352)
      return newData as unknown as GovernmentEmployeeForm;
    });
  };
  
  const removeArrayItem = (path: string[], index: number) => {
    setFormData(prev => {
      const newData = { ...prev } as AnyObject;
      let current: AnyObject = newData;
  
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        current[key] = { ...(current[key] as AnyObject) };
        current = current[key] as AnyObject;
      }
  
      const lastKey = path[path.length - 1];
      const arr = (current[lastKey] as unknown[]) || [];
      current[lastKey] = arr.filter((_, i) => i !== index);
  
      // ✅ same here
      return newData as unknown as GovernmentEmployeeForm;
    });
  };
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white text-gray-900">
      <div className="mb-8 border-b pb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">ТӨРИЙН АЛБАН ХААГЧИЙН АНКЕТ</h1>
            <p className="text-center text-lg text-gray-600">Маягт № 1</p>
            <p className="text-center text-sm text-gray-500 mt-2">
          &quot;Төрийн албан хаагчийн хувийн хэрэг хөтлөх журам&quot;-ын 1 дүгээр хавсралт
        </p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p>Маягтыг өөрийн гараар, хар буюу хар хөх өнгийн бэхээр бөглөнө</p>
            <p>Биеийн байцаалт бичих санамок ашиглаарай</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        <div className="border border-gray-300 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-6">1. ХУВЬ ХҮНИЙ ТАЛААРХ МЭДЭЭЛЭЛ</h2>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Регистрийн дугаар</label>
              <div className="flex gap-1">
                {Array.from({ length: 10 }, (_, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    className="w-8 h-8 border border-gray-300 text-center rounded"
                    value={formData.identification.registrationNumber[i] || ''}
                    onChange={(e) => {
                      const newValue = formData.identification.registrationNumber.split('');
                      newValue[i] = e.target.value;
                      updateField(['identification', 'registrationNumber'], newValue.join(''));
                    }}
                  />
                ))}
              </div>
        </div>

            <div>
              <label className="block text-sm font-medium mb-2">Иргэний үнэмлэхийн дугаар</label>
              <div className="flex gap-1">
                {Array.from({ length: 10 }, (_, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    className="w-8 h-8 border border-gray-300 text-center rounded"
                    value={formData.identification.citizenIdNumber[i] || ''}
                    onChange={(e) => {
                      const newValue = formData.identification.citizenIdNumber.split('');
                      newValue[i] = e.target.value;
                      updateField(['identification', 'citizenIdNumber'], newValue.join(''));
                    }}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Нийгмийн даатгалын дэвтрийн дугаар</label>
              <div className="flex gap-1">
                {Array.from({ length: 10 }, (_, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    className="w-8 h-8 border border-gray-300 text-center rounded"
                    value={formData.identification.socialInsuranceNumber[i] || ''}
                    onChange={(e) => {
                      const newValue = formData.identification.socialInsuranceNumber.split('');
                      newValue[i] = e.target.value;
                      updateField(['identification', 'socialInsuranceNumber'], newValue.join(''));
                    }}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Эрүүл мэндийн даатгалын гэрчилгээний дугаар</label>
              <div className="flex gap-1">
                {Array.from({ length: 10 }, (_, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    className="w-8 h-8 border border-gray-300 text-center rounded"
                    value={formData.identification.healthInsuranceNumber[i] || ''}
                    onChange={(e) => {
                      const newValue = formData.identification.healthInsuranceNumber.split('');
                      newValue[i] = e.target.value;
                      updateField(['identification', 'healthInsuranceNumber'], newValue.join(''));
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">1.1. Эцэг/эх/-ийн нэр</label>
              <input
                type="text"
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                value={formData.personalInfo.fatherName}
                onChange={(e) => updateField(['personalInfo', 'fatherName'], e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Нэр</label>
              <input
                type="text"
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                value={formData.personalInfo.name}
                onChange={(e) => updateField(['personalInfo', 'name'], e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">1.2. Хүйс</label>
              <input
                type="text"
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                value={formData.personalInfo.gender}
                onChange={(e) => updateField(['personalInfo', 'gender'], e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">1.3. Төрсөн</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="он"
                  className="w-16 border-b border-gray-300 py-2 text-center focus:outline-none focus:border-blue-500"
                  value={formData.personalInfo.birthYear}
                  onChange={(e) => updateField(['personalInfo', 'birthYear'], e.target.value)}
                />
                <input
                  type="text"
                  placeholder="сар"
                  className="w-16 border-b border-gray-300 py-2 text-center focus:outline-none focus:border-blue-500"
                  value={formData.personalInfo.birthMonth}
                  onChange={(e) => updateField(['personalInfo', 'birthMonth'], e.target.value)}
                />
                <input
                  type="text"
                  placeholder="өдөр"
                  className="w-16 border-b border-gray-300 py-2 text-center focus:outline-none focus:border-blue-500"
                  value={formData.personalInfo.birthDay}
                  onChange={(e) => updateField(['personalInfo', 'birthDay'], e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">1.4. Төрсөн аймаг, хот, сум, дүүрэг</label>
              <input
                type="text"
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                value={formData.personalInfo.birthAimag}
                onChange={(e) => updateField(['personalInfo', 'birthAimag'], e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">төрсөн газар, овог</label>
              <input
                type="text"
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                value={formData.personalInfo.birthPlace}
                onChange={(e) => updateField(['personalInfo', 'birthPlace'], e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">1.5. Үндэс, угсаа</label>
              <input
                type="text"
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                value={formData.personalInfo.ethnicity}
                onChange={(e) => updateField(['personalInfo', 'ethnicity'], e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">1.6. Нийгмийн гарал</label>
              <input
                type="text"
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                value={formData.personalInfo.socialOrigin}
                onChange={(e) => updateField(['personalInfo', 'socialOrigin'], e.target.value)}
              />
            </div>
          </div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">1.7. Гэр бүлийн байдал (зөвхөн гэр бүлийн бүртгэлд байгаа хүмүүсийг бичнэ)</h3>
              <button
                type="button"
                onClick={() => addArrayItem(['personalInfo', 'familyMembers'], {})}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                + Нэмэх
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-left">Таны юу болох</th>
                    <th className="border border-gray-300 p-2 text-left">Гэр бүлийн гишүүдийн эцэг /эх/-ийн нь болон өөрийн нь нэр</th>
                    <th className="border border-gray-300 p-2 text-left">Төрсөн он</th>
                    <th className="border border-gray-300 p-2 text-left">Төрсөн аймаг, хот, сум, дүүрэг</th>
                    <th className="border border-gray-300 p-2 text-left">Одоо эрхэлж буй ажил</th>
                    <th className="border border-gray-300 p-2 text-center">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.personalInfo.familyMembers.map((member, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={member?.relationship || ''}
                          onChange={(e) => {
                            const newMembers = [...formData.personalInfo.familyMembers];
                            if (!newMembers[index]) newMembers[index] = {};
                            newMembers[index].relationship = e.target.value;
                            updateField(['personalInfo', 'familyMembers'], newMembers);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={member?.name || ''}
                          onChange={(e) => {
                            const newMembers = [...formData.personalInfo.familyMembers];
                            if (!newMembers[index]) newMembers[index] = {};
                            newMembers[index].name = e.target.value;
                            updateField(['personalInfo', 'familyMembers'], newMembers);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={member?.birthYear || ''}
                          onChange={(e) => {
                            const newMembers = [...formData.personalInfo.familyMembers];
                            if (!newMembers[index]) newMembers[index] = {};
                            newMembers[index].birthYear = e.target.value;
                            updateField(['personalInfo', 'familyMembers'], newMembers);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={member?.birthPlace || ''}
                          onChange={(e) => {
                            const newMembers = [...formData.personalInfo.familyMembers];
                            if (!newMembers[index]) newMembers[index] = {};
                            newMembers[index].birthPlace = e.target.value;
                            updateField(['personalInfo', 'familyMembers'], newMembers);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={member?.occupation || ''}
                          onChange={(e) => {
                            const newMembers = [...formData.personalInfo.familyMembers];
                            if (!newMembers[index]) newMembers[index] = {};
                            newMembers[index].occupation = e.target.value;
                            updateField(['personalInfo', 'familyMembers'], newMembers);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeArrayItem(['personalInfo', 'familyMembers'], index)}
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">1.8. Садан төрлийн байдал</h3>
              <button
                type="button"
                onClick={() => addArrayItem(['personalInfo', 'relatives'], {})}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                + Нэмэх
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-left">Таны юу болох</th>
                    <th className="border border-gray-300 p-2 text-left">Садан төрлийн хүмүүсийн эцэг /эх/-ийн нь болон өөрийн нь нэр</th>
                    <th className="border border-gray-300 p-2 text-left">Төрсөн он</th>
                    <th className="border border-gray-300 p-2 text-left">Төрсөн аймаг, хот, сум, дүүрэг</th>
                    <th className="border border-gray-300 p-2 text-left">Одоо эрхэлж буй ажил</th>
                    <th className="border border-gray-300 p-2 text-center">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.personalInfo.relatives.map((relative, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={relative?.relationship || ''}
                          onChange={(e) => {
                            const newRelatives = [...formData.personalInfo.relatives];
                            if (!newRelatives[index]) newRelatives[index] = {};
                            newRelatives[index].relationship = e.target.value;
                            updateField(['personalInfo', 'relatives'], newRelatives);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={relative?.name || ''}
                          onChange={(e) => {
                            const newRelatives = [...formData.personalInfo.relatives];
                            if (!newRelatives[index]) newRelatives[index] = {};
                            newRelatives[index].name = e.target.value;
                            updateField(['personalInfo', 'relatives'], newRelatives);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={relative?.birthYear || ''}
                          onChange={(e) => {
                            const newRelatives = [...formData.personalInfo.relatives];
                            if (!newRelatives[index]) newRelatives[index] = {};
                            newRelatives[index].birthYear = e.target.value;
                            updateField(['personalInfo', 'relatives'], newRelatives);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={relative?.birthPlace || ''}
                          onChange={(e) => {
                            const newRelatives = [...formData.personalInfo.relatives];
                            if (!newRelatives[index]) newRelatives[index] = {};
                            newRelatives[index].birthPlace = e.target.value;
                            updateField(['personalInfo', 'relatives'], newRelatives);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={relative?.occupation || ''}
                          onChange={(e) => {
                            const newRelatives = [...formData.personalInfo.relatives];
                            if (!newRelatives[index]) newRelatives[index] = {};
                            newRelatives[index].occupation = e.target.value;
                            updateField(['personalInfo', 'relatives'], newRelatives);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeArrayItem(['personalInfo', 'relatives'], index)}
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">1.9. Оршин суугаа хаяг</label>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <input
                  type="text"
                  placeholder="аймаг, хот"
                  className="border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                  value={formData.personalInfo.currentAddress.aimag}
                  onChange={(e) => updateField(['personalInfo', 'currentAddress', 'aimag'], e.target.value)}
                />
                <input
                  type="text"
                  placeholder="сум, дүүрэг"
                  className="border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                  value={formData.personalInfo.currentAddress.soum}
                  onChange={(e) => updateField(['personalInfo', 'currentAddress', 'soum'], e.target.value)}
                />
              </div>
              <input
                type="text"
                placeholder="гэрийн хаяг"
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                value={formData.personalInfo.currentAddress.homeAddress}
                onChange={(e) => updateField(['personalInfo', 'currentAddress', 'homeAddress'], e.target.value)}
              />
              <div className="grid grid-cols-3 gap-4 mt-2">
                <input
                  type="text"
                  placeholder="Утас, үүрэн утас"
                  className="border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                  value={formData.personalInfo.currentAddress.phone}
                  onChange={(e) => updateField(['personalInfo', 'currentAddress', 'phone'], e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Факс"
                  className="border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                  value={formData.personalInfo.currentAddress.fax}
                  onChange={(e) => updateField(['personalInfo', 'currentAddress', 'fax'], e.target.value)}
                />
                <input
                  type="text"
                  placeholder="И-мэйл хаяг"
                  className="border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                  value={formData.personalInfo.currentAddress.email}
                  onChange={(e) => updateField(['personalInfo', 'currentAddress', 'email'], e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">1.10. Шуудангийн хаяг</label>
              <div className="flex gap-4">
                <input
                  type="text"
                  className="flex-1 border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                  value={formData.personalInfo.postalAddress}
                  onChange={(e) => updateField(['personalInfo', 'postalAddress'], e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Индекс"
                  className="w-24 border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                  value={formData.personalInfo.postalIndex}
                  onChange={(e) => updateField(['personalInfo', 'postalIndex'], e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">1.11. Онцгой шаардлага гарвал харилцах хүний нэр</label>
              <div className="flex gap-4">
                <input
                  type="text"
                  className="flex-1 border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                  value={formData.personalInfo.emergencyContact}
                  onChange={(e) => updateField(['personalInfo', 'emergencyContact'], e.target.value)}
                />
                <input
                  type="text"
                  placeholder="түүний утас"
                  className="w-32 border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                  value={formData.personalInfo.emergencyPhone}
                  onChange={(e) => updateField(['personalInfo', 'emergencyPhone'], e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="border border-gray-300 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-6">2. БОЛОВСРОЛЫН ТАЛААРХ МЭДЭЭЛЭЛ</h2>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">2.1. Боловсрол (ерөнхий, тусгай дунд, дээд боловсрол, дипломын, бакалаврын болон магистрийн зэргийг оролцуулан)</h3>
              <button
                type="button"
                onClick={() => addArrayItem(['education', 'generalEducation'], {})}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                + Нэмэх
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-left">Сургуулийн нэр</th>
                    <th className="border border-gray-300 p-2 text-left">Орсон он, сар</th>
                    <th className="border border-gray-300 p-2 text-left">Төгссөн он, сар</th>
                    <th className="border border-gray-300 p-2 text-left">Эзэмшсэн боловсрол, мэргэжил, гэрчилгээ, дипломын дугаар</th>
                    <th className="border border-gray-300 p-2 text-center">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.education.generalEducation.map((education, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={education?.schoolName || ''}
                          onChange={(e) => {
                            const newEducation = [...formData.education.generalEducation];
                            if (!newEducation[index]) newEducation[index] = {};
                            newEducation[index].schoolName = e.target.value;
                            updateField(['education', 'generalEducation'], newEducation);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={education?.startDate || ''}
                          onChange={(e) => {
                            const newEducation = [...formData.education.generalEducation];
                            if (!newEducation[index]) newEducation[index] = {};
                            newEducation[index].startDate = e.target.value;
                            updateField(['education', 'generalEducation'], newEducation);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={education?.endDate || ''}
                          onChange={(e) => {
                            const newEducation = [...formData.education.generalEducation];
                            if (!newEducation[index]) newEducation[index] = {};
                            newEducation[index].endDate = e.target.value;
                            updateField(['education', 'generalEducation'], newEducation);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={education?.degree || ''}
                          onChange={(e) => {
                            const newEducation = [...formData.education.generalEducation];
                            if (!newEducation[index]) newEducation[index] = {};
                            newEducation[index].degree = e.target.value;
                            updateField(['education', 'generalEducation'], newEducation);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeArrayItem(['education', 'generalEducation'], index)}
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">2.2. Боловсролын докторын болон шинжлэх ухааны докторын зэрэг</h3>
              <button
                type="button"
                onClick={() => addArrayItem(['education', 'doctoralDegrees'], {})}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                + Нэмэх
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-left">Зэрэг</th>
                    <th className="border border-gray-300 p-2 text-left">Хамгаалсан газар</th>
                    <th className="border border-gray-300 p-2 text-left">Он, сар</th>
                    <th className="border border-gray-300 p-2 text-left">Гэрчилгээ, дипломын дугаар</th>
                    <th className="border border-gray-300 p-2 text-center">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.education.doctoralDegrees.map((degree, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={degree?.degree || ''}
                          onChange={(e) => {
                            const newDegrees = [...formData.education.doctoralDegrees];
                            if (!newDegrees[index]) newDegrees[index] = {};
                            newDegrees[index].degree = e.target.value;
                            updateField(['education', 'doctoralDegrees'], newDegrees);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={degree?.defendedAt || ''}
                          onChange={(e) => {
                            const newDegrees = [...formData.education.doctoralDegrees];
                            if (!newDegrees[index]) newDegrees[index] = {};
                            newDegrees[index].defendedAt = e.target.value;
                            updateField(['education', 'doctoralDegrees'], newDegrees);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={degree?.year || ''}
                          onChange={(e) => {
                            const newDegrees = [...formData.education.doctoralDegrees];
                            if (!newDegrees[index]) newDegrees[index] = {};
                            newDegrees[index].year = e.target.value;
                            updateField(['education', 'doctoralDegrees'], newDegrees);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={degree?.certificateNumber || ''}
                          onChange={(e) => {
                            const newDegrees = [...formData.education.doctoralDegrees];
                            if (!newDegrees[index]) newDegrees[index] = {};
                            newDegrees[index].certificateNumber = e.target.value;
                            updateField(['education', 'doctoralDegrees'], newDegrees);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeArrayItem(['education', 'doctoralDegrees'], index)}
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Боловсролын докторын зэрэг хамгаалсан сэдэв</label>
              <input
                type="text"
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                value={formData.education.educationDoctorateTopic}
                onChange={(e) => updateField(['education', 'educationDoctorateTopic'], e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Шинжлэх ухааны доктор хамгаалсан сэдэв</label>
              <input
                type="text"
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                value={formData.education.scienceDoctorateTopic}
                onChange={(e) => updateField(['education', 'scienceDoctorateTopic'], e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="border border-gray-300 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-6">3. МЭРГЭШЛИЙН БЭЛТГЭЛИЙН ТАЛААРХ МЭДЭЭЛЭЛ</h2>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">3.1. Мэргэшлийн бэлтгэл (Мэргэжлийн болон бусад чиглэлээр нарийн мэргэшүүлэх сургалтад хамрагдсан байдлыг бичнэ)</h3>
              <button
                type="button"
                onClick={() => addArrayItem(['professionalTraining', 'training'], {})}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                + Нэмэх
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-left">Хаана, ямар байгууллагад</th>
                    <th className="border border-gray-300 p-2 text-left">Эхэлсэн дууссан он, сар, өдөр</th>
                    <th className="border border-gray-300 p-2 text-left">Хугацаа (хоногоор)</th>
                    <th className="border border-gray-300 p-2 text-left">Ямар чиглэлээр</th>
                    <th className="border border-gray-300 p-2 text-left">Үнэмлэх, гэрчилгээний дугаар, олгосон он, сар, өдөр</th>
                    <th className="border border-gray-300 p-2 text-center">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.professionalTraining.training.map((training, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={training?.organization || ''}
                          onChange={(e) => {
                            const newTraining = [...formData.professionalTraining.training];
                            if (!newTraining[index]) newTraining[index] = {};
                            newTraining[index].organization = e.target.value;
                            updateField(['professionalTraining', 'training'], newTraining);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={training?.startDate || ''}
                          onChange={(e) => {
                            const newTraining = [...formData.professionalTraining.training];
                            if (!newTraining[index]) newTraining[index] = {};
                            newTraining[index].startDate = e.target.value;
                            updateField(['professionalTraining', 'training'], newTraining);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={training?.duration || ''}
                          onChange={(e) => {
                            const newTraining = [...formData.professionalTraining.training];
                            if (!newTraining[index]) newTraining[index] = {};
                            newTraining[index].duration = e.target.value;
                            updateField(['professionalTraining', 'training'], newTraining);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={training?.field || ''}
                          onChange={(e) => {
                            const newTraining = [...formData.professionalTraining.training];
                            if (!newTraining[index]) newTraining[index] = {};
                            newTraining[index].field = e.target.value;
                            updateField(['professionalTraining', 'training'], newTraining);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={training?.certificateNumber || ''}
                          onChange={(e) => {
                            const newTraining = [...formData.professionalTraining.training];
                            if (!newTraining[index]) newTraining[index] = {};
                            newTraining[index].certificateNumber = e.target.value;
                            updateField(['professionalTraining', 'training'], newTraining);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeArrayItem(['professionalTraining', 'training'], index)}
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">3.2. Албан тушаалын зэрэг дэв, цол</h3>
              <button
                type="button"
                onClick={() => addArrayItem(['professionalTraining', 'officialRanks'], {})}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                + Нэмэх
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-left">Албан тушаалын ангилал, зэрэглэл</th>
                    <th className="border border-gray-300 p-2 text-left">Зэрэг дэв, цолны нэр</th>
                    <th className="border border-gray-300 p-2 text-left">Зарлиг, захирамж, тушаалын нэр, он, сар, өдөр, дугаар</th>
                    <th className="border border-gray-300 p-2 text-left">Үнэмлэхний дугаар</th>
                    <th className="border border-gray-300 p-2 text-center">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.professionalTraining.officialRanks.map((rank, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={rank?.category || ''}
                          onChange={(e) => {
                            const newRanks = [...formData.professionalTraining.officialRanks];
                            if (!newRanks[index]) newRanks[index] = {};
                            newRanks[index].category = e.target.value;
                            updateField(['professionalTraining', 'officialRanks'], newRanks);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={rank?.rank || ''}
                          onChange={(e) => {
                            const newRanks = [...formData.professionalTraining.officialRanks];
                            if (!newRanks[index]) newRanks[index] = {};
                            newRanks[index].rank = e.target.value;
                            updateField(['professionalTraining', 'officialRanks'], newRanks);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={rank?.decree || ''}
                          onChange={(e) => {
                            const newRanks = [...formData.professionalTraining.officialRanks];
                            if (!newRanks[index]) newRanks[index] = {};
                            newRanks[index].decree = e.target.value;
                            updateField(['professionalTraining', 'officialRanks'], newRanks);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={rank?.certificateNumber || ''}
                          onChange={(e) => {
                            const newRanks = [...formData.professionalTraining.officialRanks];
                            if (!newRanks[index]) newRanks[index] = {};
                            newRanks[index].certificateNumber = e.target.value;
                            updateField(['professionalTraining', 'officialRanks'], newRanks);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeArrayItem(['professionalTraining', 'officialRanks'], index)}
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">3.3. Эрдмийн цол (дэд профессор, профессор, академийн гишүүнийг оролцуулан)</h3>
              <button
                type="button"
                onClick={() => addArrayItem(['professionalTraining', 'academicTitles'], {})}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                + Нэмэх
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-left">Цол</th>
                    <th className="border border-gray-300 p-2 text-left">Цол олгосон байгууллага</th>
                    <th className="border border-gray-300 p-2 text-left">Он, сар</th>
                    <th className="border border-gray-300 p-2 text-left">Гэрчилгээ, дипломын дугаар</th>
                    <th className="border border-gray-300 p-2 text-center">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.professionalTraining.academicTitles.map((title, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={title?.title || ''}
                          onChange={(e) => {
                            const newTitles = [...formData.professionalTraining.academicTitles];
                            if (!newTitles[index]) newTitles[index] = {};
                            newTitles[index].title = e.target.value;
                            updateField(['professionalTraining', 'academicTitles'], newTitles);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={title?.issuingOrganization || ''}
                          onChange={(e) => {
                            const newTitles = [...formData.professionalTraining.academicTitles];
                            if (!newTitles[index]) newTitles[index] = {};
                            newTitles[index].issuingOrganization = e.target.value;
                            updateField(['professionalTraining', 'academicTitles'], newTitles);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={title?.year || ''}
                          onChange={(e) => {
                            const newTitles = [...formData.professionalTraining.academicTitles];
                            if (!newTitles[index]) newTitles[index] = {};
                            newTitles[index].year = e.target.value;
                            updateField(['professionalTraining', 'academicTitles'], newTitles);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={title?.certificateNumber || ''}
                          onChange={(e) => {
                            const newTitles = [...formData.professionalTraining.academicTitles];
                            if (!newTitles[index]) newTitles[index] = {};
                            newTitles[index].certificateNumber = e.target.value;
                            updateField(['professionalTraining', 'academicTitles'], newTitles);
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeArrayItem(['professionalTraining', 'academicTitles'], index)}
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
        <GovernmentEmployeeQuestionnaireSkills
          formData={formData}
          updateField={updateField}
          addArrayItem={addArrayItem}
          removeArrayItem={removeArrayItem}
        />
        <div className="border border-gray-300 p-6 rounded-lg">
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Дээрх мэдээлэл үнэн зөв болохыг баталж /гарын үсэг/
            </p>
            <div className="border-b border-gray-300 w-64"></div>
            <p className="text-sm text-gray-700">
              201__ он __ сар __ өдөр
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Цуцлах
          </button>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Хадгалах
          </button>
        </div>
      </form>
    </div>
  );
}
