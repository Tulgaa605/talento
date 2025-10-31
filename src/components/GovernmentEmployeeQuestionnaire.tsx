'use client';

import React, { useState, useEffect } from 'react';
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
  initialData?: unknown;
  onSubmit: (data: GovernmentEmployeeForm) => void;
  onCancel: () => void;
}


export default function GovernmentEmployeeQuestionnaire({
  initialData,
  onSubmit,
  onCancel,
}: GovernmentEmployeeQuestionnaireProps) {
  
  // Validation functions
  const validateLettersOnly = (value: string) => {
    return /^[A-Za-zА-Яа-яЁёӨөҮү\s]*$/.test(value);
  };

  const validateNumbersOnly = (value: string) => {
    return /^[0-9]*$/.test(value);
  };

  const validateNumbersWithDots = (value: string) => {
    return /^[0-9.]*$/.test(value);
  };

  const validateLettersAndPunctuation = (value: string) => {
    return /^[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]*$/.test(value);
  };

  const validateRegistrationNumber = (value: string) => {
    const upperValue = value.toUpperCase();
    if (upperValue.length <= 2) {
      return /^[A-ZА-ЯЁӨҮү]*$/.test(upperValue);
    } else {
      const letters = upperValue.slice(0, 2);
      const numbers = upperValue.slice(2);
      return /^[A-ZА-ЯЁӨҮү]{2}$/.test(letters) && /^[0-9]*$/.test(numbers);
    }
  };

  const capitalizeFirstLetter = (value: string) => {
    if (value.length > 0) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    return value;
  };

  const handleInputChange = (field: string[], value: string, validationType?: 'letters' | 'numbers' | 'lettersAndPunctuation' | 'registration' | 'phone', maxLength?: number) => {
    let processedValue = value;
    
    if (validationType === 'letters' && value) {
      if (!validateLettersOnly(value)) return;
      processedValue = capitalizeFirstLetter(value);
    } else if (validationType === 'numbers' && value) {
      if (!validateNumbersOnly(value)) return;
    } else if (validationType === 'lettersAndPunctuation' && value) {
      if (!validateLettersAndPunctuation(value)) return;
      processedValue = capitalizeFirstLetter(value);
    } else if (validationType === 'registration' && value) {
      if (!validateRegistrationNumber(value)) return;
      processedValue = value.toUpperCase();
    } else if (validationType === 'phone' && value) {
      if (!validateNumbersOnly(value)) return;
    }
    
    if (maxLength && processedValue.length > maxLength) return;
    
    updateField(field, processedValue);
  };
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

  // Load initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData(initialData as GovernmentEmployeeForm);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Find government questionnaire ID
      const response = await fetch('/api/questionnaires');
      if (!response.ok) throw new Error('Questionnaires fetch failed');
      
      const questionnaires = await response.json();
      const governmentQuestionnaire = questionnaires.find((q: { type: string }) => q.type === 'GOVERNMENT_EMPLOYEE');
      
      if (!governmentQuestionnaire) {
        alert('Төрийн анкет олдсонгүй. Админд хандана уу.');
        return;
      }

      // Submit the questionnaire
      const submitResponse = await fetch(`/api/questionnaires/${governmentQuestionnaire.id}/submit-government`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: formData,
        }),
      });

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json();
        throw new Error(errorData.error || 'Анкет илгээхэд алдаа гарлаа');
      }

      // Success - call parent callback (parent will show success message)
      onSubmit(formData);
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      alert(error instanceof Error ? error.message : 'Анкет илгээхэд алдаа гарлаа');
    }
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
              <input
                type="text"
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                value={formData.identification.registrationNumber}
                onChange={(e) => handleInputChange(['identification', 'registrationNumber'], e.target.value, 'registration', 10)}
                pattern="[A-ZА-ЯЁӨҮү]{2}[0-9]{8}"
                maxLength={10}
                placeholder="AA12345678"
                title="Эхний 2 үсэг, дараа нь 8 тоо (жишээ: AA12345678)"
              />
        </div>

            <div>
              <label className="block text-sm font-medium mb-2">Иргэний үнэмлэхийн дугаар</label>
              <input
                type="text"
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                value={formData.identification.citizenIdNumber}
                onChange={(e) => handleInputChange(['identification', 'citizenIdNumber'], e.target.value, 'numbers', 10)}
                pattern="[0-9]+"
                maxLength={10}
                placeholder="1234567890"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">1.1. Эцэг/эх/-ийн нэр</label>
              <input
                type="text"
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                value={formData.personalInfo.fatherName}
                onChange={(e) => handleInputChange(['personalInfo', 'fatherName'], e.target.value, 'letters')}
                pattern="[A-Za-zА-Яа-яЁёӨөҮү\s]+"
                placeholder="Эцэг/эхийн нэр"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Нэр</label>
              <input
                type="text"
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                value={formData.personalInfo.name}
                onChange={(e) => handleInputChange(['personalInfo', 'name'], e.target.value, 'letters')}
                pattern="[A-Za-zА-Яа-яЁёӨөҮү\s]+"
                placeholder="Нэр"
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
                  onChange={(e) => handleInputChange(['personalInfo', 'birthYear'], e.target.value, 'numbers', 4)}
                  pattern="[0-9]+"
                  maxLength={4}
                />
                <input
                  type="text"
                  placeholder="сар"
                  className="w-16 border-b border-gray-300 py-2 text-center focus:outline-none focus:border-blue-500"
                  value={formData.personalInfo.birthMonth}
                  onChange={(e) => handleInputChange(['personalInfo', 'birthMonth'], e.target.value, 'numbers', 2)}
                  pattern="[0-9]+"
                  maxLength={2}
                />
                <input
                  type="text"
                  placeholder="өдөр"
                  className="w-16 border-b border-gray-300 py-2 text-center focus:outline-none focus:border-blue-500"
                  value={formData.personalInfo.birthDay}
                  onChange={(e) => handleInputChange(['personalInfo', 'birthDay'], e.target.value, 'numbers', 2)}
                  pattern="[0-9]+"
                  maxLength={2}
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
              <label className="block text-sm font-medium mb-2">Төрсөн газар, овог</label>
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
                            const value = e.target.value;
                            if (!validateLettersAndPunctuation(value)) return;
                            const capitalizedValue = capitalizeFirstLetter(value);
                            const newMembers = [...formData.personalInfo.familyMembers];
                            if (!newMembers[index]) newMembers[index] = {};
                            newMembers[index].relationship = capitalizedValue;
                            updateField(['personalInfo', 'familyMembers'], newMembers);
                          }}
                          pattern="[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]+"
                          placeholder="Таны юу болох"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={member?.name || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!validateLettersOnly(value)) return;
                            const capitalizedValue = capitalizeFirstLetter(value);
                            const newMembers = [...formData.personalInfo.familyMembers];
                            if (!newMembers[index]) newMembers[index] = {};
                            newMembers[index].name = capitalizedValue;
                            updateField(['personalInfo', 'familyMembers'], newMembers);
                          }}
                          pattern="[A-Za-zА-Яа-яЁёӨөҮү\s]+"
                          placeholder="Нэр"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={member?.birthYear || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!validateNumbersOnly(value)) return;
                            if (value.length > 4) return;
                            const newMembers = [...formData.personalInfo.familyMembers];
                            if (!newMembers[index]) newMembers[index] = {};
                            newMembers[index].birthYear = value;
                            updateField(['personalInfo', 'familyMembers'], newMembers);
                          }}
                          pattern="[0-9]+"
                          maxLength={4}
                          placeholder="Он"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={member?.birthPlace || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!validateLettersAndPunctuation(value)) return;
                            const capitalizedValue = capitalizeFirstLetter(value);
                            const newMembers = [...formData.personalInfo.familyMembers];
                            if (!newMembers[index]) newMembers[index] = {};
                            newMembers[index].birthPlace = capitalizedValue;
                            updateField(['personalInfo', 'familyMembers'], newMembers);
                          }}
                          pattern="[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]+"
                          placeholder="Төрсөн аймаг, хот, сум, дүүрэг"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={member?.occupation || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!validateLettersAndPunctuation(value)) return;
                            const capitalizedValue = capitalizeFirstLetter(value);
                            const newMembers = [...formData.personalInfo.familyMembers];
                            if (!newMembers[index]) newMembers[index] = {};
                            newMembers[index].occupation = capitalizedValue;
                            updateField(['personalInfo', 'familyMembers'], newMembers);
                          }}
                          pattern="[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]+"
                          placeholder="Одоо эрхэлж буй ажил"
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
                            const value = e.target.value;
                            if (!validateLettersAndPunctuation(value)) return;
                            const capitalizedValue = capitalizeFirstLetter(value);
                            const newRelatives = [...formData.personalInfo.relatives];
                            if (!newRelatives[index]) newRelatives[index] = {};
                            newRelatives[index].relationship = capitalizedValue;
                            updateField(['personalInfo', 'relatives'], newRelatives);
                          }}
                          pattern="[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]+"
                          placeholder="Таны юу болох"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={relative?.name || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!validateLettersOnly(value)) return;
                            const capitalizedValue = capitalizeFirstLetter(value);
                            const newRelatives = [...formData.personalInfo.relatives];
                            if (!newRelatives[index]) newRelatives[index] = {};
                            newRelatives[index].name = capitalizedValue;
                            updateField(['personalInfo', 'relatives'], newRelatives);
                          }}
                          pattern="[A-Za-zА-Яа-яЁёӨөҮү\s]+"
                          placeholder="Нэр"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={relative?.birthYear || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!validateNumbersOnly(value)) return;
                            if (value.length > 4) return;
                            const newRelatives = [...formData.personalInfo.relatives];
                            if (!newRelatives[index]) newRelatives[index] = {};
                            newRelatives[index].birthYear = value;
                            updateField(['personalInfo', 'relatives'], newRelatives);
                          }}
                          pattern="[0-9]+"
                          maxLength={4}
                          placeholder="Он"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={relative?.birthPlace || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!validateLettersAndPunctuation(value)) return;
                            const capitalizedValue = capitalizeFirstLetter(value);
                            const newRelatives = [...formData.personalInfo.relatives];
                            if (!newRelatives[index]) newRelatives[index] = {};
                            newRelatives[index].birthPlace = capitalizedValue;
                            updateField(['personalInfo', 'relatives'], newRelatives);
                          }}
                          pattern="[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]+"
                          placeholder="Төрсөн аймаг, хот, сум, дүүрэг"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={relative?.occupation || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!validateLettersAndPunctuation(value)) return;
                            const capitalizedValue = capitalizeFirstLetter(value);
                            const newRelatives = [...formData.personalInfo.relatives];
                            if (!newRelatives[index]) newRelatives[index] = {};
                            newRelatives[index].occupation = capitalizedValue;
                            updateField(['personalInfo', 'relatives'], newRelatives);
                          }}
                          pattern="[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]+"
                          placeholder="Одоо эрхэлж буй ажил"
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
                  onChange={(e) => handleInputChange(['personalInfo', 'currentAddress', 'phone'], e.target.value, 'phone', 8)}
                  pattern="[0-9]+"
                  maxLength={8}
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
                  onChange={(e) => handleInputChange(['personalInfo', 'emergencyContact'], e.target.value, 'letters')}
                  pattern="[A-Za-zА-Яа-яЁёӨөҮү\s]+"
                  placeholder="Яаралтай холбоо барих хүний нэр"
                />
                <input
                  type="text"
                  placeholder="түүний утас"
                  className="w-32 border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                  value={formData.personalInfo.emergencyPhone}
                  onChange={(e) => handleInputChange(['personalInfo', 'emergencyPhone'], e.target.value, 'phone', 8)}
                  pattern="[0-9]+"
                  maxLength={8}
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
                            const value = e.target.value;
                            if (!validateLettersAndPunctuation(value)) return;
                            const capitalizedValue = capitalizeFirstLetter(value);
                            const newEducation = [...formData.education.generalEducation];
                            if (!newEducation[index]) newEducation[index] = {};
                            newEducation[index].schoolName = capitalizedValue;
                            updateField(['education', 'generalEducation'], newEducation);
                          }}
                          pattern="[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]+"
                          placeholder="Сургуулийн нэр"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={education?.startDate || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!validateNumbersWithDots(value)) return;
                            
                            let formattedValue = value;
                            
                            // Эхний 4 орон бичигдсэн бол автоматаар цэг тавих
                            if (value.length === 4 && !value.includes('.')) {
                              formattedValue = value + '.';
                            }
                            // 7 тэмдэгтээс хэтэрвэл зогсоох
                            if (formattedValue.length > 7) return;
                            
                            const newEducation = [...formData.education.generalEducation];
                            if (!newEducation[index]) newEducation[index] = {};
                            newEducation[index].startDate = formattedValue;
                            updateField(['education', 'generalEducation'], newEducation);
                          }}
                          pattern="[0-9.]+"
                          maxLength={7}
                          placeholder="YYYY.MM"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={education?.endDate || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!validateNumbersWithDots(value)) return;
                            
                            let formattedValue = value;
                            
                            // Эхний 4 орон бичигдсэн бол автоматаар цэг тавих
                            if (value.length === 4 && !value.includes('.')) {
                              formattedValue = value + '.';
                            }
                            // 7 тэмдэгтээс хэтэрвэл зогсоох
                            if (formattedValue.length > 7) return;
                            
                            const newEducation = [...formData.education.generalEducation];
                            if (!newEducation[index]) newEducation[index] = {};
                            newEducation[index].endDate = formattedValue;
                            updateField(['education', 'generalEducation'], newEducation);
                          }}
                          pattern="[0-9.]+"
                          maxLength={7}
                          placeholder="YYYY.MM"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={education?.degree || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!validateLettersAndPunctuation(value)) return;
                            const capitalizedValue = capitalizeFirstLetter(value);
                            const newEducation = [...formData.education.generalEducation];
                            if (!newEducation[index]) newEducation[index] = {};
                            newEducation[index].degree = capitalizedValue;
                            updateField(['education', 'generalEducation'], newEducation);
                          }}
                          pattern="[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]+"
                          placeholder="Эзэмшсэн боловсрол, мэргэжил"
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
                            const value = e.target.value;
                            if (!validateLettersAndPunctuation(value)) return;
                            const capitalizedValue = capitalizeFirstLetter(value);
                            const newDegrees = [...formData.education.doctoralDegrees];
                            if (!newDegrees[index]) newDegrees[index] = {};
                            newDegrees[index].degree = capitalizedValue;
                            updateField(['education', 'doctoralDegrees'], newDegrees);
                          }}
                          pattern="[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]+"
                          placeholder="Зэрэг"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={degree?.defendedAt || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!validateLettersAndPunctuation(value)) return;
                            const capitalizedValue = capitalizeFirstLetter(value);
                            const newDegrees = [...formData.education.doctoralDegrees];
                            if (!newDegrees[index]) newDegrees[index] = {};
                            newDegrees[index].defendedAt = capitalizedValue;
                            updateField(['education', 'doctoralDegrees'], newDegrees);
                          }}
                          pattern="[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]+"
                          placeholder="Хамгаалсан газар"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={degree?.year || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!validateNumbersWithDots(value)) return;
                            
                            let formattedValue = value;
                            
                            // Эхний 4 орон бичигдсэн бол автоматаар цэг тавих
                            if (value.length === 4 && !value.includes('.')) {
                              formattedValue = value + '.';
                            }
                            // 7 тэмдэгтээс хэтэрвэл зогсоох
                            if (formattedValue.length > 7) return;
                            
                            const newDegrees = [...formData.education.doctoralDegrees];
                            if (!newDegrees[index]) newDegrees[index] = {};
                            newDegrees[index].year = formattedValue;
                            updateField(['education', 'doctoralDegrees'], newDegrees);
                          }}
                          pattern="[0-9.]+"
                          maxLength={7}
                          placeholder="YYYY.MM"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={degree?.certificateNumber || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!validateNumbersOnly(value)) return;
                            if (value.length > 20) return;
                            const newDegrees = [...formData.education.doctoralDegrees];
                            if (!newDegrees[index]) newDegrees[index] = {};
                            newDegrees[index].certificateNumber = value;
                            updateField(['education', 'doctoralDegrees'], newDegrees);
                          }}
                          pattern="[0-9]+"
                          maxLength={20}
                          placeholder="Гэрчилгээ, дипломын дугаар"
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
                onChange={(e) => {
                  const value = e.target.value;
                  if (!validateLettersAndPunctuation(value)) return;
                  const capitalizedValue = capitalizeFirstLetter(value);
                  updateField(['education', 'educationDoctorateTopic'], capitalizedValue);
                }}
                pattern="[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]+"
                placeholder="Боловсролын докторын зэрэг хамгаалсан сэдэв"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Шинжлэх ухааны доктор хамгаалсан сэдэв</label>
              <input
                type="text"
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500"
                value={formData.education.scienceDoctorateTopic}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!validateLettersAndPunctuation(value)) return;
                  const capitalizedValue = capitalizeFirstLetter(value);
                  updateField(['education', 'scienceDoctorateTopic'], capitalizedValue);
                }}
                pattern="[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]+"
                placeholder="Шинжлэх ухааны доктор хамгаалсан сэдэв"
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
                            const value = e.target.value;
                            if (!validateLettersAndPunctuation(value)) return;
                            const capitalizedValue = capitalizeFirstLetter(value);
                            const newTraining = [...formData.professionalTraining.training];
                            if (!newTraining[index]) newTraining[index] = {};
                            newTraining[index].organization = capitalizedValue;
                            updateField(['professionalTraining', 'training'], newTraining);
                          }}
                          pattern="[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]+"
                          placeholder="Хаана, ямар байгууллагад"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={training?.startDate || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!validateNumbersWithDots(value)) return;
                            
                            let formattedValue = value;
                            
                            // Эхний 4 орон бичигдсэн бол автоматаар цэг тавих
                            if (value.length === 4 && !value.includes('.')) {
                              formattedValue = value + '.';
                            }
                            // 7 орон бичигдсэн бол (YYYY.MM) дахин цэг тавих
                            else if (value.length === 7 && value.split('.').length === 2) {
                              formattedValue = value + '.';
                            }
                            // 10 тэмдэгтээс хэтэрвэл зогсоох
                            if (formattedValue.length > 10) return;
                            
                            const newTraining = [...formData.professionalTraining.training];
                            if (!newTraining[index]) newTraining[index] = {};
                            newTraining[index].startDate = formattedValue;
                            updateField(['professionalTraining', 'training'], newTraining);
                          }}
                          pattern="[0-9.]+"
                          maxLength={10}
                          placeholder="YYYY.MM.DD"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={training?.duration || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!validateNumbersOnly(value)) return;
                            if (value.length > 5) return; // Max 99999 days
                            const newTraining = [...formData.professionalTraining.training];
                            if (!newTraining[index]) newTraining[index] = {};
                            newTraining[index].duration = value;
                            updateField(['professionalTraining', 'training'], newTraining);
                          }}
                          pattern="[0-9]+"
                          maxLength={5}
                          placeholder="Хугацаа (хоногоор)"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={training?.field || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!validateLettersAndPunctuation(value)) return;
                            const capitalizedValue = capitalizeFirstLetter(value);
                            const newTraining = [...formData.professionalTraining.training];
                            if (!newTraining[index]) newTraining[index] = {};
                            newTraining[index].field = capitalizedValue;
                            updateField(['professionalTraining', 'training'], newTraining);
                          }}
                          pattern="[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]+"
                          placeholder="Ямар чиглэлээр"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={training?.certificateNumber || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!validateNumbersOnly(value)) return;
                            if (value.length > 20) return;
                            const newTraining = [...formData.professionalTraining.training];
                            if (!newTraining[index]) newTraining[index] = {};
                            newTraining[index].certificateNumber = value;
                            updateField(['professionalTraining', 'training'], newTraining);
                          }}
                          pattern="[0-9]+"
                          maxLength={20}
                          placeholder="Үнэмлэх, гэрчилгээний дугаар"
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
                            const value = e.target.value;
                            if (!validateLettersAndPunctuation(value)) return;
                            const capitalizedValue = capitalizeFirstLetter(value);
                            const newRanks = [...formData.professionalTraining.officialRanks];
                            if (!newRanks[index]) newRanks[index] = {};
                            newRanks[index].category = capitalizedValue;
                            updateField(['professionalTraining', 'officialRanks'], newRanks);
                          }}
                          pattern="[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]+"
                          placeholder="Албан тушаалын ангилал, зэрэглэл"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={rank?.rank || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!validateLettersAndPunctuation(value)) return;
                            const capitalizedValue = capitalizeFirstLetter(value);
                            const newRanks = [...formData.professionalTraining.officialRanks];
                            if (!newRanks[index]) newRanks[index] = {};
                            newRanks[index].rank = capitalizedValue;
                            updateField(['professionalTraining', 'officialRanks'], newRanks);
                          }}
                          pattern="[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]+"
                          placeholder="Зэрэг дэв, цолны нэр"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={rank?.decree || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!validateLettersAndPunctuation(value)) return;
                            const capitalizedValue = capitalizeFirstLetter(value);
                            const newRanks = [...formData.professionalTraining.officialRanks];
                            if (!newRanks[index]) newRanks[index] = {};
                            newRanks[index].decree = capitalizedValue;
                            updateField(['professionalTraining', 'officialRanks'], newRanks);
                          }}
                          pattern="[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]+"
                          placeholder="Зарлиг, захирамж, тушаалын нэр"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={rank?.certificateNumber || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!validateNumbersOnly(value)) return;
                            if (value.length > 20) return;
                            const newRanks = [...formData.professionalTraining.officialRanks];
                            if (!newRanks[index]) newRanks[index] = {};
                            newRanks[index].certificateNumber = value;
                            updateField(['professionalTraining', 'officialRanks'], newRanks);
                          }}
                          pattern="[0-9]+"
                          maxLength={20}
                          placeholder="Үнэмлэхний дугаар"
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
                            const value = e.target.value;
                            if (!validateLettersAndPunctuation(value)) return;
                            const capitalizedValue = capitalizeFirstLetter(value);
                            const newTitles = [...formData.professionalTraining.academicTitles];
                            if (!newTitles[index]) newTitles[index] = {};
                            newTitles[index].title = capitalizedValue;
                            updateField(['professionalTraining', 'academicTitles'], newTitles);
                          }}
                          pattern="[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]+"
                          placeholder="Цол"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={title?.issuingOrganization || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!validateLettersAndPunctuation(value)) return;
                            const capitalizedValue = capitalizeFirstLetter(value);
                            const newTitles = [...formData.professionalTraining.academicTitles];
                            if (!newTitles[index]) newTitles[index] = {};
                            newTitles[index].issuingOrganization = capitalizedValue;
                            updateField(['professionalTraining', 'academicTitles'], newTitles);
                          }}
                          pattern="[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]+"
                          placeholder="Цол олгосон байгууллага"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={title?.year || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!validateNumbersWithDots(value)) return;
                            
                            let formattedValue = value;
                            
                            // Эхний 4 орон бичигдсэн бол автоматаар цэг тавих
                            if (value.length === 4 && !value.includes('.')) {
                              formattedValue = value + '.';
                            }
                            // 7 тэмдэгтээс хэтэрвэл зогсоох
                            if (formattedValue.length > 7) return;
                            
                            const newTitles = [...formData.professionalTraining.academicTitles];
                            if (!newTitles[index]) newTitles[index] = {};
                            newTitles[index].year = formattedValue;
                            updateField(['professionalTraining', 'academicTitles'], newTitles);
                          }}
                          pattern="[0-9.]+"
                          maxLength={7}
                          placeholder="YYYY.MM"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="w-full border-none focus:outline-none"
                          value={title?.certificateNumber || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!validateNumbersOnly(value)) return;
                            if (value.length > 20) return;
                            const newTitles = [...formData.professionalTraining.academicTitles];
                            if (!newTitles[index]) newTitles[index] = {};
                            newTitles[index].certificateNumber = value;
                            updateField(['professionalTraining', 'academicTitles'], newTitles);
                          }}
                          pattern="[0-9]+"
                          maxLength={20}
                          placeholder="Гэрчилгээ, дипломын дугаар"
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
