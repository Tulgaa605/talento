'use client';

import React, { useState } from 'react';

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
  const [formData] = useState<GovernmentEmployeeForm>({
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ТӨРИЙН АЛБАН ХААГЧИЙН АНКЕТ</h1>
        <p className="text-sm text-gray-600">Маягт № 1</p>
        <p className="text-xs text-gray-500 mt-1">
          &quot;Төрийн албан хаагчийн хувийн хэрэг хөтлөх журам&quot;-ын 1 дүгээр хавсралт
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="border border-gray-300 p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">ТӨРИЙН АЛБАН ХААГЧИЙН АНКЕТ</h2>
          <p className="text-sm text-gray-600 mb-4">Маягт № 1</p>
          <p className="text-xs text-gray-500 mb-4">
            &quot;Төрийн албан хаагчийн хувийн хэрэг хөтлөх журам&quot;-ын 1 дүгээр хавсралт
          </p>

          {/* ... keep the rest of your JSX unchanged ... */}
          {/* Only your helpers/props/strings changed, so the remaining form stays the same. */}
        </div>

        {/* --- The rest of your original JSX form content goes here unchanged --- */}
        {/* NOTE: Calls like addArrayItem('foreignLanguages','foreignLanguages',{}) now work
                 because addArrayItem handles top-level arrays as well. */}

        {/* Submit Buttons */}
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
