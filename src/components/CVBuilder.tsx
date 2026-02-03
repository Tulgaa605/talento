"use client";
import React, { useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  DocumentArrowUpIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Cropper from "react-easy-crop";
import { Area } from "react-easy-crop";
import { useNotification } from "@/providers/NotificationProvider";

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const TARGET_PHOTO_WIDTH = 300;
const TARGET_PHOTO_HEIGHT = 400;

// Helper function to generate unique IDs
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

// Helper function for confirmation dialogs
const confirmDelete = (itemName: string): boolean => {
  return window.confirm(`Та энэ ${itemName}-ийг устгахдаа итгэлтэй байна уу?`);
};

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  linkedin?: string;
  website?: string;
  photo?: string; // Base64 image data
  dateOfBirth?: string;
  nationality?: string;
  github?: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  current: boolean;
  location?: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa?: string;
}

interface Skill {
  id: string;
  name: string;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
}

interface Language {
  id: string;
  name: string;
  level: "Уншдаг" | "Бичдэг" | "Ярьдаг" | "";
}

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string;
  url?: string;
}

interface Hobby {
  id: string;
  name: string;
}

type Template = "modern" | "classic" | "creative" | "wizard";

interface CVBuilderProps {
  onCVGenerated?: (file: File) => void;
  onClose?: () => void;
}

export default function CVBuilder({ onCVGenerated, onClose }: CVBuilderProps) {
  const { data: session } = useSession();
  const { addNotification } = useNotification();
  const [currentStep, setCurrentStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showSidebarPreview, setShowSidebarPreview] = useState(false);
  const [template, setTemplate] = useState<Template>("modern");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    personalDetails: true,
    profile: true,
    education: true,
    experience: true,
    skills: true,
    languages: true,
    certificates: true,
    projects: true,
    hobbies: true,
  });
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    "personalDetails",
    "profile",
    "education",
    "experience",
    "skills",
    "languages",
    "certificates",
    "projects",
    "hobbies",
  ]);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    summary: "",
    linkedin: "",
    website: "",
    photo: "",
    dateOfBirth: "",
    nationality: "",
    github: "",
  });

  // Helper function to create image from URL
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  // Handle crop complete
  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Create cropped image in 3x4 ratio
  const createCroppedImage = useCallback(async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    try {
      const image = await createImage(imageToCrop);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // 3x4 ratio
      canvas.width = TARGET_PHOTO_WIDTH;
      canvas.height = TARGET_PHOTO_HEIGHT;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        TARGET_PHOTO_WIDTH,
        TARGET_PHOTO_HEIGHT
      );

      const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPersonalInfo((prev) => ({ ...prev, photo: croppedImageUrl }));
      setShowCropModal(false);
      setImageToCrop("");
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setErrors((prev) => {
        if (prev.photo) {
          return { ...prev, photo: "" };
      }
        return prev;
      });
    } catch (error) {
      console.error('Error creating cropped image:', error);
      setErrors((prev) => ({ ...prev, photo: "Зураг crop хийхэд алдаа гарлаа" }));
    }
  }, [imageToCrop, croppedAreaPixels]);

  const cancelCrop = () => {
    setShowCropModal(false);
    setImageToCrop("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    const input = document.getElementById("photo-upload") as HTMLInputElement;
    if (input) input.value = "";
  };

  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: "1",
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
      current: false,
      location: "",
    },
  ]);

  const [educations, setEducations] = useState<Education[]>([
    {
      id: "1",
      school: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      current: false,
      gpa: "",
    },
  ]);

  const [skills, setSkills] = useState<Skill[]>([{ id: "1", name: "", level: "intermediate" }]);
  const [languages, setLanguages] = useState<Language[]>([
    { id: "1", name: "", level: "" },
  ]);
  const [suggestedLanguages, setSuggestedLanguages] = useState<string[]>([
    "English",
    "Spanish",
    "Mandarin",
    "French",
    "German"
  ]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([
    { id: "1", name: "", issuer: "", date: "", url: "" },
  ]);
  const [projects, setProjects] = useState<Project[]>([
    { id: "1", name: "", description: "", technologies: "", url: "" },
  ]);
  const [hobbies, setHobbies] = useState<Hobby[]>([
    { id: "1", name: "" },
  ]);

  const steps = [
    { id: 1, name: "Template", title: "Template сонгох" },
    { id: 2, name: "Personal", title: "Хувийн мэдээлэл" },
    { id: 3, name: "Experience", title: "Ажлын туршлага" },
    { id: 4, name: "Education", title: "Боловсрол" },
    { id: 5, name: "Skills", title: "Ур чадвар" },
    { id: 6, name: "Additional", title: "Нэмэлт мэдээлэл" },
  ];

  const totalSteps = steps.length;

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 2) {
      if (!personalInfo.firstName.trim()) {
        newErrors.firstName = "Нэр оруулах шаардлагатай";
      }
      if (!personalInfo.lastName.trim()) {
        newErrors.lastName = "Овог оруулах шаардлагатай";
      }
      if (personalInfo.email && !EMAIL_REGEX.test(personalInfo.email)) {
        newErrors.email = "Зөв имэйл хаяг оруулна уу";
      }
    }
    
    if (step === 3) {
      const hasValidExperience = experiences.some(
        (exp) => exp.company.trim() && exp.position.trim()
      );
      if (!hasValidExperience && experiences.length > 0) {
        newErrors.experience = "Хамгийн багадаа нэг ажлын туршлага оруулах шаардлагатай";
      }
    }
    
    if (step === 4) {
      const hasValidEducation = educations.some(
        (edu) => edu.school.trim() && edu.degree.trim()
      );
      if (!hasValidEducation && educations.length > 0) {
        newErrors.education = "Хамгийн багадаа нэг боловсрол оруулах шаардлагатай";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        setErrors({});
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: generateId(),
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        description: "",
        current: false,
        location: "",
      },
    ]);
  };

  const removeExperience = (id: string) => {
    if (confirmDelete("ажлын туршлага")) {
      setExperiences(experiences.filter((exp) => exp.id !== id));
    }
  };

  const updateExperience = <K extends keyof Experience>(id: string, field: K, value: Experience[K]) => {
    setExperiences(
      experiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const addEducation = () => {
    setEducations([
      ...educations,
      {
        id: generateId(),
        school: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        current: false,
        gpa: "",
      },
    ]);
  };

  const removeEducation = (id: string) => {
    if (confirmDelete("боловсрол")) {
      setEducations(educations.filter((edu) => edu.id !== id));
    }
  };

  const updateEducation = <K extends keyof Education>(id: string, field: K, value: Education[K]) => {
    setEducations(
      educations.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
    );
  };

  const addSkill = () => {
    setSkills([...skills, { id: generateId(), name: "", level: "intermediate" }]);
  };

  const removeSkill = (id: string) => {
    if (confirmDelete("ур чадвар")) {
      setSkills(skills.filter((skill) => skill.id !== id));
    }
  };

  const updateSkill = <K extends keyof Skill>(id: string, field: K, value: Skill[K]) => {
    setSkills(skills.map((skill) => (skill.id === id ? { ...skill, [field]: value } : skill)));
  };

  const addLanguage = () => {
    setLanguages([{ id: generateId(), name: "", level: "" }, ...languages]);
  };

  const removeLanguage = (id: string, event?: React.MouseEvent<HTMLButtonElement>) => {
    if (confirmDelete("хэлний мэдлэг")) {
      // Prevent focus from moving to other inputs
      if (event) {
        event.preventDefault();
        event.currentTarget.blur();
      }
      const removedLang = languages.find(lang => lang.id === id);
      setLanguages(languages.filter((lang) => lang.id !== id));
      
      // If a language was removed, add it back to suggested languages if it's in the default list
      if (removedLang && removedLang.name) {
        const defaultLanguages = ["English", "Spanish", "Mandarin", "French", "German"];
        if (defaultLanguages.some(defLang => defLang.toLowerCase() === removedLang.name.toLowerCase())) {
          setSuggestedLanguages(prev => {
            // Only add if not already in the list
            if (!prev.some(lang => lang.toLowerCase() === removedLang.name.toLowerCase())) {
              return [...prev, removedLang.name];
            }
            return prev;
          });
        }
      }
    }
  };

  const updateLanguage = <K extends keyof Language>(id: string, field: K, value: Language[K]) => {
    setLanguages(
      languages.map((lang) => (lang.id === id ? { ...lang, [field]: value } : lang))
    );
  };

  const fetchLanguageSuggestions = useCallback(async () => {
    setLoadingSuggestions(true);
    try {
      // Get current CV data to provide context
      const cvContext = {
        skills: skills.map(s => s.name).join(", ") || "None",
        experiences: experiences.map(e => `${e.position} at ${e.company}`).join(", ") || "None",
        educations: educations.map(e => e.degree).join(", ") || "None",
      };

      // Try to fetch from API, but use fallback if it fails
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `Suggest 5-8 relevant languages for a CV with these details:\nSkills: ${cvContext.skills}\nExperience: ${cvContext.experiences}\nEducation: ${cvContext.educations}\n\nReturn only a comma-separated list of language names in English (e.g., Chinese, Turkish, Swahili, Bengali, Thai). Do not include any explanations.`
          })
        });

        if (response.ok) {
          const data = await response.json();
          const suggestions = data.response?.trim() || "";
          const langList = suggestions
            .split(",")
            .map((lang: string) => lang.trim())
            .filter((lang: string) => lang.length > 0 && lang.length < 30)
            .slice(0, 8);
          
          if (langList.length > 0) {
            setSuggestedLanguages(langList);
            return;
          }
        }
      } catch (apiError) {
        console.log("API call failed, using fallback suggestions");
      }

      // Fallback suggestions
      const fallbackLanguages = ["Chinese", "Turkish", "Swahili", "Bengali", "Thai", "Japanese", "Korean", "Arabic"];
      setSuggestedLanguages(fallbackLanguages);
    } catch (error) {
      console.error("Error fetching language suggestions:", error);
      // Fallback suggestions
      setSuggestedLanguages(["Chinese", "Turkish", "Swahili", "Bengali", "Thai", "Japanese", "Korean", "Arabic"]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [skills, experiences, educations]);

  const addSuggestedLanguage = (langName: string) => {
    // Check if language already exists
    if (languages.some(lang => lang.name.toLowerCase() === langName.toLowerCase())) {
      addNotification("Энэ хэл аль хэдийн нэмэгдсэн байна.", "info");
      return;
    }
    
    // Add new language at the top
    const newLang: Language = {
      id: generateId(),
      name: langName,
      level: "",
    };
    setLanguages([newLang, ...languages]);
    
    // Remove only the added language from suggested languages, keep others
    setSuggestedLanguages(prev => prev.filter(lang => lang.toLowerCase() !== langName.toLowerCase()));
    
    addNotification(`${langName} хэл нэмэгдлээ.`, "success");
  };

  const addCertificate = () => {
    setCertificates([
      ...certificates,
      { id: generateId(), name: "", issuer: "", date: "", url: "" },
    ]);
  };

  const removeCertificate = (id: string) => {
    if (confirmDelete("сертификат")) {
      setCertificates(certificates.filter((cert) => cert.id !== id));
    }
  };

  const updateCertificate = <K extends keyof Certificate>(id: string, field: K, value: Certificate[K]) => {
    setCertificates(
      certificates.map((cert) => (cert.id === id ? { ...cert, [field]: value } : cert))
    );
  };

  const addProject = () => {
    setProjects([
      ...projects,
      { id: generateId(), name: "", description: "", technologies: "", url: "" },
    ]);
  };

  const removeProject = (id: string) => {
    if (confirmDelete("төсөл")) {
      setProjects(projects.filter((proj) => proj.id !== id));
    }
  };

  const updateProject = <K extends keyof Project>(id: string, field: K, value: Project[K]) => {
    setProjects(projects.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj)));
  };

  const addHobby = () => {
    setHobbies([{ id: generateId(), name: "" }, ...hobbies]);
  };

  const removeHobby = (id: string) => {
    if (confirmDelete("хобби")) {
      setHobbies(hobbies.filter((hobby) => hobby.id !== id));
    }
  };

  const updateHobby = <K extends keyof Hobby>(id: string, field: K, value: Hobby[K]) => {
    setHobbies(hobbies.map((hobby) => (hobby.id === id ? { ...hobby, [field]: value } : hobby)));
  };

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => {
      const wasCollapsed = prev[section];
      // If section is being expanded, close all others
      if (wasCollapsed) {
        // Close all sections first
        const allCollapsed = Object.keys(prev).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {} as Record<string, boolean>);
        // Then expand only the clicked section
        return { ...allCollapsed, [section]: false };
      } else {
        // If section is being collapsed, just close it
        return { ...prev, [section]: true };
      }
    });
  };

  const renderCollapsibleSection = (
    sectionKey: string,
    title: string,
    content: React.ReactNode,
    icon?: string
  ) => {
    const isCollapsed = collapsedSections[sectionKey];
    return (
      <div key={sectionKey} className="border-b border-gray-200">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {icon && <span className="text-lg">{icon}</span>}
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
            {isCollapsed ? (
              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronUpIcon className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </button>
        {!isCollapsed && <div className="p-4">{content}</div>}
      </div>
    );
  };

  // Helper function to parse CV text and extract information
  const parseCVText = useCallback((text: string) => {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.log("parseCVText: Empty or invalid text");
      return;
    }
    
    console.log("parseCVText: Starting to parse, text length:", text.length);
    console.log("parseCVText: First 200 chars:", text.substring(0, 200));
    
    // Extract name - more precise patterns
    let nameFound = false;
    
    // Pattern 1: "Овог, Нэр: Бат-Эрдэнэ Мөнх-Оргил" format
    const ovoogNerMatch = text.match(/(?:Овог|Last Name)[\s,]*Нэр|Name[:\s]+([А-Яа-яA-Za-z\s-]+?)(?:\n|Утас|Phone|Имэйл|Email|$)/i);
    if (ovoogNerMatch && ovoogNerMatch[1]) {
      const nameText = ovoogNerMatch[1].trim();
      // Remove common prefixes/suffixes
      const cleanName = nameText.replace(/^(Овог|Нэр|Name|Full Name)[:\s]*/i, '').trim();
      const nameParts = cleanName.split(/\s+/).filter((p: string) => p.length > 1 && !p.match(/^(Овог|Нэр|Name)$/i));
      
      if (nameParts.length >= 2) {
        console.log("parseCVText: Found name (Овог, Нэр format):", nameParts);
        setPersonalInfo(prev => {
          const newInfo = {
            ...prev,
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(" ")
          };
          console.log("parseCVText: Updated personalInfo with name:", newInfo.firstName, newInfo.lastName);
          return newInfo;
        });
        nameFound = true;
      }
    }
    
    // Pattern 2: "Нэр: ..." or "Name: ..."
    if (!nameFound) {
      const nameMatch = text.match(/(?:^|\n)(?:Нэр|Name|Full Name)[:\s]+([А-Яа-яA-Za-z\s-]+?)(?:\n|Утас|Phone|Имэйл|Email|$)/i);
      if (nameMatch && nameMatch[1]) {
        const nameText = nameMatch[1].trim();
        const nameParts = nameText.split(/\s+/).filter((p: string) => p.length > 1);
        if (nameParts.length >= 2) {
          console.log("parseCVText: Found name (Name format):", nameParts);
          setPersonalInfo(prev => {
            const newInfo = {
              ...prev,
              firstName: nameParts[0],
              lastName: nameParts.slice(1).join(" ")
            };
            return newInfo;
          });
          nameFound = true;
        }
      }
    }
    
    // Pattern 3: First line if it looks like a name (2-4 words, all caps or title case)
    if (!nameFound) {
      const firstLine = text.split('\n')[0].trim();
      const namePattern = /^([А-ЯA-Z][а-яa-z]+(?:\s+[А-ЯA-Z][а-яa-z]+){1,3})$/;
      if (namePattern.test(firstLine) && !firstLine.match(/(?:Овог|Нэр|Name|Утас|Phone|Имэйл|Email|Хаяг|Address)/i)) {
        const nameParts = firstLine.split(/\s+/);
        if (nameParts.length >= 2 && nameParts.length <= 4) {
          console.log("parseCVText: Found name (first line):", nameParts);
          setPersonalInfo(prev => {
            const newInfo = {
              ...prev,
              firstName: nameParts[0],
              lastName: nameParts.slice(1).join(" ")
            };
            return newInfo;
          });
          nameFound = true;
        }
      }
    }
    
    // Extract email - more precise
    const emailPatterns = [
      /(?:Имэйл|Email|E-mail)[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
    ];
    
    for (const pattern of emailPatterns) {
      const emailMatch = text.match(pattern);
      if (emailMatch && emailMatch[1]) {
        const email = emailMatch[1].trim();
        // Validate it's a real email format
        if (email.includes('@') && email.includes('.') && !email.includes(' ')) {
          console.log("parseCVText: Found email:", email);
          setPersonalInfo(prev => {
            const newInfo = { ...prev, email: email };
            return newInfo;
          });
          break;
        }
      }
    }
    
    // Extract phone - more precise patterns
    const phonePatterns = [
      /(?:Утас|Phone|Tel)[:\s]+([\d\s+-]{8,})/i,
      /(?:Утас|Phone|Tel)[:\s]*(\d{8,})/i,
    ];
    
    let phoneFound = false;
    for (const pattern of phonePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const phone = match[1].trim().replace(/\s+/g, '').replace(/[^\d+]/g, '');
        if (phone.length >= 8 && phone.length <= 12) {
          console.log("parseCVText: Found phone:", phone);
          setPersonalInfo(prev => {
            const newInfo = { ...prev, phone: phone };
            return newInfo;
          });
          phoneFound = true;
          break;
        }
      }
    }
    
    // Fallback: look for 8-10 digit numbers that aren't dates or other numbers
    if (!phoneFound) {
      const phoneMatch = text.match(/\b(\d{8,10})\b/);
      if (phoneMatch && phoneMatch[1]) {
        const phone = phoneMatch[1];
        // Make sure it's not a year (1900-2100) or other common numbers
        const year = parseInt(phone);
        if (year < 1900 || year > 2100) {
          console.log("parseCVText: Found phone (fallback):", phone);
          setPersonalInfo(prev => {
            const newInfo = { ...prev, phone: phone };
            return newInfo;
          });
        }
      }
    }
    
    // Extract address - more precise
    const addressPatterns = [
      /(?:Хаяг|Address|Location)[:\s]+([^\n]+?)(?:\n|Утас|Phone|Имэйл|Email|Боловсрол|Education|$)/i,
    ];
    
    for (const pattern of addressPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const address = match[1].trim();
        // Validate it's not too short or too long, and doesn't contain other field labels
        if (address.length > 5 && address.length < 100 && 
            !address.match(/(?:Утас|Phone|Имэйл|Email|Нэр|Name|Боловсрол|Education)/i)) {
          console.log("parseCVText: Found address:", address);
          setPersonalInfo(prev => {
            const newInfo = { ...prev, address: address };
            return newInfo;
          });
          break;
        }
      }
    }
    
    // Extract summary
    const summaryPatterns = [
      new RegExp("(?:Profile|Товч танилцуулга|Summary|About)[:\\s]+([^\\n]+(?:\\n(?!\\n)[^\\n]+)*?)(?=\\n\\n|\\n(?:Education|Боловсрол|Experience|Ажил|Skills|Ур чадвар)|$)", "is"),
      new RegExp("(?:Profile|Товч танилцуулга|Summary)[:\\s]+(.{50,500})", "is"),
    ];
    
    for (const pattern of summaryPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].trim().length > 20) {
        console.log("parseCVText: Found summary, length:", match[1].trim().length);
        setPersonalInfo(prev => {
          const newInfo = { ...prev, summary: match[1].trim().substring(0, 500) };
          console.log("parseCVText: Updated summary:", newInfo.summary.substring(0, 50));
          return newInfo;
        });
        break;
      }
    }
    
    // Extract Education
    const educationSection = text.match(/(?:Боловсрол|Education|Боловсролын)[:\s]*([\s\S]*?)(?=\n\n|\n(?:Ажил|Employment|Experience|Туршлага|Skills|Ур чадвар|Languages|Хэл|Certificates|Гэрчилгээ|Projects|Төсөл)|$)/i);
    if (educationSection && educationSection[1]) {
      const eduText = educationSection[1].trim();
      const eduLines = eduText.split('\n').filter(line => line.trim().length > 0);
      
      const newEducations: Education[] = [];
      let currentEdu: Partial<Education> = {};
      
      for (const line of eduLines) {
        // Look for degree/school patterns
        const degreeMatch = line.match(/(?:Баклавр|Бакалавр|Магистр|Доктор|Bachelor|Master|PhD|Doctor|Боловсрол)[:\s]*([А-Яа-яA-Za-z\s-]+)/i);
        const schoolMatch = line.match(/(?:Сургууль|University|College|Институт|School)[:\s]*([А-Яа-яA-Za-z\s-]+)/i);
        const yearMatch = line.match(/(\d{4})\s*[-–]\s*(\d{4}|одоо|Present|Current)/i);
        
        if (degreeMatch) {
          if (currentEdu.degree) {
            newEducations.push(currentEdu as Education);
          }
          currentEdu = { degree: degreeMatch[1].trim() };
        } else if (schoolMatch) {
          currentEdu.school = schoolMatch[1].trim();
        } else if (yearMatch) {
          currentEdu.startDate = yearMatch[1];
          currentEdu.endDate = yearMatch[2].toLowerCase().includes('одоо') || yearMatch[2].toLowerCase().includes('present') ? '' : yearMatch[2];
          currentEdu.current = yearMatch[2].toLowerCase().includes('одоо') || yearMatch[2].toLowerCase().includes('present');
        } else if (line.trim().length > 5 && !currentEdu.school) {
          currentEdu.school = line.trim();
        }
      }
      
      if (currentEdu.degree || currentEdu.school) {
        newEducations.push(currentEdu as Education);
      }
      
      if (newEducations.length > 0) {
        console.log("parseCVText: Found educations:", newEducations.length);
        setEducations(newEducations.map((edu, idx) => ({
          id: String(idx + 1),
          school: edu.school || "",
          degree: edu.degree || "",
          field: edu.field || "",
          startDate: edu.startDate || "",
          endDate: edu.endDate || "",
          current: edu.current || false,
        })));
      }
    }
    
    // Extract Employment/Experience
    const experienceSection = text.match(/(?:Ажил|Employment|Experience|Туршлага|Ажлын туршлага)[:\s]*([\s\S]*?)(?=\n\n|\n(?:Боловсрол|Education|Skills|Ур чадвар|Languages|Хэл|Certificates|Гэрчилгээ|Projects|Төсөл)|$)/i);
    if (experienceSection && experienceSection[1]) {
      const expText = experienceSection[1].trim();
      const expLines = expText.split('\n').filter(line => line.trim().length > 0);
      
      const newExperiences: Experience[] = [];
      let currentExp: Partial<Experience> = {};
      
      for (const line of expLines) {
        const positionMatch = line.match(/(?:Албан тушаал|Position|Job Title|Ажил)[:\s]*([А-Яа-яA-Za-z\s-]+)/i);
        const companyMatch = line.match(/(?:Компани|Company|Байгууллага|Organization)[:\s]*([А-Яа-яA-Za-z\s-]+)/i);
        const yearMatch = line.match(/(\d{4})\s*[-–]\s*(\d{4}|одоо|Present|Current)/i);
        
        if (positionMatch) {
          if (currentExp.position) {
            newExperiences.push(currentExp as Experience);
          }
          currentExp = { position: positionMatch[1].trim() };
        } else if (companyMatch) {
          currentExp.company = companyMatch[1].trim();
        } else if (yearMatch) {
          currentExp.startDate = yearMatch[1];
          currentExp.endDate = yearMatch[2].toLowerCase().includes('одоо') || yearMatch[2].toLowerCase().includes('present') ? '' : yearMatch[2];
          currentExp.current = yearMatch[2].toLowerCase().includes('одоо') || yearMatch[2].toLowerCase().includes('present');
        } else if (line.trim().length > 5 && !currentExp.company && !currentExp.position) {
          if (!currentExp.position) {
            currentExp.position = line.trim();
          } else if (!currentExp.company) {
            currentExp.company = line.trim();
          }
        }
      }
      
      if (currentExp.position || currentExp.company) {
        newExperiences.push(currentExp as Experience);
      }
      
      if (newExperiences.length > 0) {
        console.log("parseCVText: Found experiences:", newExperiences.length);
        setExperiences(newExperiences.map((exp, idx) => ({
          id: String(idx + 1),
          company: exp.company || "",
          position: exp.position || "",
          location: exp.location || "",
          startDate: exp.startDate || "",
          endDate: exp.endDate || "",
          current: exp.current || false,
          description: exp.description || "",
        })));
      }
    }
    
    // Extract Skills - more precise
    const skillsSection = text.match(/(?:Ур чадвар|Skills|Чадвар)[:\s]*([\s\S]*?)(?=\n\n|\n(?:Боловсрол|Education|Ажил|Employment|Experience|Languages|Хэл|Certificates|Гэрчилгээ|Projects|Төсөл)|$)/i);
    if (skillsSection && skillsSection[1]) {
      const skillsText = skillsSection[1].trim();
      // Split by common delimiters, but filter out invalid entries
      const skillItems = skillsText
        .split(/[,;\n•\-\*]/)
        .map(s => s.trim())
        .filter(s => {
          // Filter out invalid skills
          return s.length > 2 && 
                 s.length < 50 && 
                 !s.match(/^(Ур чадвар|Skills|Чадвар|Боловсрол|Education|Ажил|Employment)$/i) &&
                 !s.match(/^\d+$/); // Not just numbers
        });
      
      if (skillItems.length > 0) {
        console.log("parseCVText: Found skills:", skillItems.length);
        setSkills(skillItems.slice(0, 10).map((skill, idx) => ({
          id: String(idx + 1),
          name: skill,
          level: "intermediate" as const,
        })));
      }
    }
    
    // Extract Languages
    const languagesSection = text.match(/(?:Хэл|Languages|Хэлний)[:\s]*([\s\S]*?)(?=\n\n|\n(?:Боловсрол|Education|Ажил|Employment|Experience|Skills|Ур чадвар|Certificates|Гэрчилгээ|Projects|Төсөл)|$)/i);
    if (languagesSection && languagesSection[1]) {
      const langText = languagesSection[1].trim();
      const langLines = langText.split('\n').filter(line => line.trim().length > 0);
      
      const newLanguages: Language[] = [];
      for (const line of langLines) {
        const langMatch = line.match(/([А-Яа-яA-Za-z]+)[\s:]*[-–]?\s*(Энгийн|Ярилцлага|Чөлөөтэй|Эх хэл|basic|conversational|fluent|native)/i);
        if (langMatch) {
          const levelMap: Record<string, "Уншдаг" | "Бичдэг" | "Ярьдаг" | ""> = {
            "энгийн": "Уншдаг",
            "ярилцлага": "Ярьдаг",
            "дунд": "Бичдэг",
            "сайн": "Ярьдаг",
            "чөлөөтэй": "Ярьдаг",
            "эх хэл": "Ярьдаг",
            "basic": "Уншдаг",
            "beginner": "Уншдаг",
            "moderate": "Бичдэг",
            "good": "Бичдэг",
            "very good": "Ярьдаг",
            "very-good": "Ярьдаг",
            "fluent": "Ярьдаг",
            "a1": "Уншдаг",
            "a2": "Уншдаг",
            "b1": "Бичдэг",
            "b2": "Бичдэг",
            "c1": "Ярьдаг",
            "c2": "Ярьдаг",
            "эхлэгч": "Уншдаг",
            "дэвшилтэт": "Ярьдаг",
            "уншдаг": "Уншдаг",
            "бичдэг": "Бичдэг",
            "ярьдаг": "Ярьдаг",
          };
          newLanguages.push({
            id: String(newLanguages.length + 1),
            name: langMatch[1].trim(),
            level: levelMap[langMatch[2].toLowerCase()] || "",
          });
        } else {
          // Just the language name
          const langName = line.split(/[-:]/)[0].trim();
          if (langName.length > 0) {
            newLanguages.push({
              id: String(newLanguages.length + 1),
              name: langName,
              level: "",
            });
          }
        }
      }
      
      if (newLanguages.length > 0) {
        console.log("parseCVText: Found languages:", newLanguages.length);
        setLanguages(newLanguages);
      }
    }
    
    console.log("parseCVText: Finished parsing");
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString + "-01");
    return date.toLocaleDateString("mn-MN", { year: "numeric", month: "long" });
  };

  // Helper function to convert lab() color to rgb using browser's color conversion
  const getRgbFromLab = (labColor: string): string | null => {
    if (!labColor || !labColor.includes("lab")) {
      return null;
    }
    
    try {
      // Use browser's built-in color conversion by creating a temporary element
      const tempEl = document.createElement("div");
      tempEl.style.color = labColor;
      tempEl.style.position = "absolute";
      tempEl.style.visibility = "hidden";
      document.body.appendChild(tempEl);
      
      const computedColor = window.getComputedStyle(tempEl).color;
      document.body.removeChild(tempEl);
      
      // If conversion worked, return rgb value
      if (computedColor && computedColor !== labColor && !computedColor.includes("lab")) {
        return computedColor;
      }
      
      // Fallback: try to parse and convert manually
      const match = labColor.match(/lab\(([^)]+)\)/);
      if (!match) return null;
      
      // For now, return a safe fallback color
      return "#000000";
    } catch (e) {
      console.warn("Failed to convert lab color:", labColor, e);
      return "#000000";
    }
  };

  const generatePDF = async () => {
    setGenerating(true);
    try {
      // Scroll to top to ensure full content is visible
      window.scrollTo(0, 0);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const cvElement = document.getElementById("cv-preview");
      if (!cvElement) {
        throw new Error("CV preview element not found. Урьдчилан харах хэсгийг нээгээд дахин оролдоно уу.");
      }

      // Ensure element is visible
      cvElement.style.display = "block";
      cvElement.style.visibility = "visible";

      // Add CSS override to convert lab() colors to rgb/hex
      // This polyfill converts lab() colors to rgb before html2canvas processes them
      const styleId = "cv-pdf-color-fix";
      let colorFixStyle = document.getElementById(styleId);
      if (colorFixStyle) {
        colorFixStyle.remove();
      }
      
      // Inject CSS that will be processed by html2canvas
      colorFixStyle = document.createElement("style");
      colorFixStyle.id = styleId;
      // Add CSS rules that override common Tailwind gradient classes with rgb equivalents
      colorFixStyle.textContent = `
        #cv-preview * {
          /* Force rgb colors for common Tailwind colors */
        }
        #cv-preview .bg-gradient-to-r {
          background-image: none !important;
        }
        #cv-preview [class*="from-blue"] {
          background-color: rgb(59, 130, 246) !important;
        }
        #cv-preview [class*="from-indigo"] {
          background-color: rgb(99, 102, 241) !important;
        }
        #cv-preview [class*="from-purple"] {
          background-color: rgb(168, 85, 247) !important;
        }
        #cv-preview [class*="from-pink"] {
          background-color: rgb(236, 72, 153) !important;
        }
        #cv-preview [class*="from-gray"] {
          background-color: rgb(107, 114, 128) !important;
        }
        #cv-preview [class*="text-blue"] {
          color: rgb(59, 130, 246) !important;
        }
        #cv-preview [class*="text-indigo"] {
          color: rgb(99, 102, 241) !important;
        }
        #cv-preview [class*="text-purple"] {
          color: rgb(168, 85, 247) !important;
        }
        #cv-preview [class*="text-pink"] {
          color: rgb(236, 72, 153) !important;
        }
        #cv-preview [class*="text-gray"] {
          color: rgb(107, 114, 128) !important;
        }
        #cv-preview [class*="text-white"] {
          color: rgb(255, 255, 255) !important;
        }
        #cv-preview [class*="bg-white"] {
          background-color: rgb(255, 255, 255) !important;
        }
        #cv-preview [class*="bg-gray"] {
          background-color: rgb(243, 244, 246) !important;
        }
      `;
      document.head.appendChild(colorFixStyle);
      
      // Wait for styles to apply
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log("Starting PDF generation...");
      
      // Wrap html2canvas in try-catch to handle lab() color errors
      let canvas;
      try {
        canvas = await html2canvas(cvElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: cvElement.scrollWidth,
        height: cvElement.scrollHeight,
        windowWidth: cvElement.scrollWidth,
        windowHeight: cvElement.scrollHeight,
        allowTaint: false,
        removeContainer: false,
          onclone: (clonedDoc) => {
            // Remove all gradient classes that might contain lab() colors
            const allElements = clonedDoc.querySelectorAll("*");
            allElements.forEach((el: Element) => {
              const htmlEl = el as HTMLElement;
              
              // Remove gradient classes
              if (htmlEl.className && typeof htmlEl.className === 'string') {
                const classes = htmlEl.className.split(' ');
                const filteredClasses = classes.filter(cls => 
                  !cls.includes('gradient') && 
                  !cls.includes('from-') && 
                  !cls.includes('to-') &&
                  !cls.includes('via-')
                );
                if (filteredClasses.length !== classes.length) {
                  htmlEl.className = filteredClasses.join(' ');
                }
              }
              
              // Get computed styles and convert any lab() colors
              const computedStyle = clonedDoc.defaultView?.getComputedStyle(htmlEl);
              if (computedStyle) {
                // Fix background colors
                try {
                  const bgColor = computedStyle.backgroundColor;
                  if (bgColor && (bgColor.includes('lab') || bgColor === 'rgba(0, 0, 0, 0)')) {
                    // If transparent or lab, set a fallback
                    if (htmlEl.classList.toString().includes('bg-white') || 
                        htmlEl.classList.toString().includes('bg-gray-50') ||
                        htmlEl.classList.toString().includes('bg-gray-100')) {
                      htmlEl.style.backgroundColor = '#ffffff';
                    } else if (htmlEl.classList.toString().includes('bg-blue')) {
                      htmlEl.style.backgroundColor = '#3b82f6';
                    } else if (htmlEl.classList.toString().includes('bg-indigo')) {
                      htmlEl.style.backgroundColor = '#6366f1';
                    } else if (htmlEl.classList.toString().includes('bg-purple')) {
                      htmlEl.style.backgroundColor = '#a855f7';
                    } else if (htmlEl.classList.toString().includes('bg-pink')) {
                      htmlEl.style.backgroundColor = '#ec4899';
                    } else if (htmlEl.classList.toString().includes('bg-gray')) {
                      htmlEl.style.backgroundColor = '#6b7280';
                    } else {
                      htmlEl.style.backgroundColor = '#ffffff';
                    }
                  }
                } catch (e) {
                  // Ignore
                }
                
                // Fix text colors
                try {
                  const textColor = computedStyle.color;
                  if (textColor && textColor.includes('lab')) {
                    if (htmlEl.classList.toString().includes('text-white')) {
                      htmlEl.style.color = '#ffffff';
                    } else if (htmlEl.classList.toString().includes('text-blue')) {
                      htmlEl.style.color = '#3b82f6';
                    } else if (htmlEl.classList.toString().includes('text-indigo')) {
                      htmlEl.style.color = '#6366f1';
                    } else if (htmlEl.classList.toString().includes('text-purple')) {
                      htmlEl.style.color = '#a855f7';
                    } else if (htmlEl.classList.toString().includes('text-pink')) {
                      htmlEl.style.color = '#ec4899';
                    } else if (htmlEl.classList.toString().includes('text-gray')) {
                      htmlEl.style.color = '#6b7280';
                    } else {
                      htmlEl.style.color = '#000000';
                    }
                  }
                } catch (e) {
                  // Ignore
                }
              }
            });
          },
        });
      } catch (error: any) {
        // If error is related to lab() colors, try again with more aggressive fixes
        if (error?.message?.includes('lab') || error?.message?.includes('color')) {
          console.warn("Retrying PDF generation with color fixes...");
          
          // Remove the previous style fix
          if (colorFixStyle) {
            colorFixStyle.remove();
          }
          
          // Add more aggressive CSS fixes
          colorFixStyle = document.createElement("style");
          colorFixStyle.id = styleId;
          colorFixStyle.textContent = `
            #cv-preview * {
              background-image: none !important;
            }
            #cv-preview .bg-gradient-to-r,
            #cv-preview .bg-gradient-to-br,
            #cv-preview .bg-gradient-to-l {
              background: linear-gradient(to right, #3b82f6, #6366f1) !important;
            }
          `;
          document.head.appendChild(colorFixStyle);
          await new Promise((resolve) => setTimeout(resolve, 100));
          
          // Retry
          canvas = await html2canvas(cvElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            width: cvElement.scrollWidth,
            height: cvElement.scrollHeight,
            windowWidth: cvElement.scrollWidth,
            windowHeight: cvElement.scrollHeight,
            allowTaint: false,
            removeContainer: false,
          });
        } else {
          throw error;
        }
      } finally {
        // Clean up the style fix
        if (colorFixStyle) {
          colorFixStyle.remove();
        }
      }

      console.log("Canvas created:", canvas.width, canvas.height);

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("Canvas үүсгэхэд алдаа гарлаа");
      }

      const imgData = canvas.toDataURL("image/png", 1.0);
      
      if (!imgData || imgData === "data:,") {
        throw new Error("Зургийн өгөгдөл үүсгэхэд алдаа гарлаа");
      }

      console.log("Creating PDF...");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = A4_WIDTH_MM;
      const pageHeight = A4_HEIGHT_MM;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      console.log("Image dimensions:", imgWidth, imgHeight);

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pageHeight;
      }

      console.log("PDF created, generating file...");

      // Generate file name
      const name = personalInfo.firstName && personalInfo.lastName
        ? `${personalInfo.firstName}_${personalInfo.lastName}`
        : "CV";
      const fileName = `CV_${name}_${Date.now()}.pdf`;

      // Save PDF
      pdf.save(fileName);
      console.log("PDF saved:", fileName);

      // Generate blob for callback
      const pdfBlob = pdf.output("blob");
      const file = new File([pdfBlob], fileName, { type: "application/pdf" });

      if (onCVGenerated) {
        onCVGenerated(file);
      }

      setGenerating(false);
      
      // Show success message
      addNotification(`PDF амжилттай татагдлаа: ${fileName}`, 'success');
    } catch (error) {
      console.error("PDF generation error:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "PDF үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.";
      addNotification(`Алдаа: ${errorMessage}`, 'error');
      setGenerating(false);
    }
  };

  const renderCVPreview = () => {
    // Render different templates based on selected template
    switch (template) {
      case "modern":
        return renderModernTemplate();
      case "classic":
        return renderClassicTemplate();
      case "creative":
        return renderCreativeTemplate();
      case "wizard":
        return renderWizardTemplate();
      default:
        return renderModernTemplate();
    }
  };

  const renderModernTemplate = () => {
    // Two-column layout with dark blue left sidebar - A4 optimized
    return (
      <div
        id="cv-preview"
        className="bg-white p-0 mx-auto shadow-2xl"
        style={{ 
          fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif", 
          fontSize: "10pt",
          width: "210mm",
          maxWidth: "210mm",
          minHeight: "297mm",
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
        }}
      >
        <div className="flex">
          {/* Left Column - Dark Blue Background with gradient */}
          <div className="w-1/3" style={{ 
            background: "linear-gradient(180deg, #1e3a5f 0%, #2d4a6f 100%)",
            minHeight: "100%",
            position: "relative"
          }}>
            <div className="p-6 pb-5">
              {personalInfo.photo && (
                <div className="mb-5 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg"></div>
                    <img
                      src={personalInfo.photo}
                      alt="Profile"
                      className="w-28 h-36 object-cover rounded-lg border-3 border-white shadow-xl"
                      style={{ aspectRatio: "3/4", borderWidth: "3px" }}
                    />
                  </div>
                </div>
              )}
              <h1 className="text-xl font-bold leading-tight text-white mb-2" style={{ 
                fontSize: "20px", 
                lineHeight: "1.3",
                letterSpacing: "0.5px",
                textShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }}>
                {personalInfo.firstName || "Нэр"} {personalInfo.lastName || "Овог"}
              </h1>
            </div>
            <div className="px-6 pb-5">
              <h2 className="text-sm font-bold mb-4 uppercase tracking-wide border-b border-white/20 pb-2" style={{ 
                color: "#e8e8e8", 
                fontSize: "12px",
                letterSpacing: "0.8px",
                fontWeight: "700"
              }}>Personal details</h2>
              <div className="space-y-3 text-white" style={{ fontSize: "10px", lineHeight: "1.7" }}>
                {(personalInfo.firstName || personalInfo.lastName) && (
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex-shrink-0 text-white/80" style={{ fontSize: "13px" }}>👤</span>
                    <span className="break-words text-white/95 font-medium">{personalInfo.firstName || ""} {personalInfo.lastName || ""}</span>
                  </div>
                )}
                {personalInfo.email && (
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex-shrink-0 text-white/80" style={{ fontSize: "13px" }}>📧</span>
                    <span className="break-words text-white/95">{personalInfo.email}</span>
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex-shrink-0 text-white/80" style={{ fontSize: "13px" }}>📞</span>
                    <span className="text-white/95">{personalInfo.phone}</span>
                  </div>
                )}
                {personalInfo.address && (
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex-shrink-0 text-white/80" style={{ fontSize: "13px" }}>🏠</span>
                    <span className="break-words text-white/95">{personalInfo.address}</span>
                  </div>
                )}
                {personalInfo.linkedin && (
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex-shrink-0 text-white/80" style={{ fontSize: "13px" }}>💼</span>
                    <span className="break-words text-white/95">{personalInfo.linkedin}</span>
                  </div>
                )}
              </div>
            </div>
            {skills.some((skill) => skill.name) && (
              <div className="px-6 pt-0 pb-6">
                <h2 className="text-sm font-bold mb-4 uppercase tracking-wide border-b border-white/20 pb-2" style={{ 
                  color: "#e8e8e8", 
                  fontSize: "12px",
                  letterSpacing: "0.8px",
                  fontWeight: "700"
                }}>Skills</h2>
                <div className="space-y-2.5 text-white" style={{ fontSize: "10px", lineHeight: "1.7" }}>
                  {skills.filter((skill) => skill.name).map((skill) => (
                    <div key={skill.id} className="text-white/95 flex items-center gap-2.5">
                      <span className="text-white/60 text-xs">▸</span>
                      <span className="font-medium">{skill.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="w-2/3 bg-white p-7" style={{ backgroundColor: "#fafafa" }}>
            {personalInfo.summary && (
              <div className="mb-7">
                <h2 className="text-base font-bold mb-4 uppercase tracking-wide border-b-3 border-blue-600 pb-2.5" style={{ 
                  color: "#1e3a5f", 
                  fontSize: "14px",
                  letterSpacing: "1px",
                  fontWeight: "700",
                  borderBottomWidth: "3px"
                }}>Profile</h2>
                <p className="leading-relaxed text-gray-700 pl-2" style={{ 
                  fontSize: "10.5px", 
                  lineHeight: "1.9",
                  textAlign: "justify"
                }}>{personalInfo.summary}</p>
              </div>
            )}
            {educations.some((edu) => edu.school || edu.degree) && (
              <div className="mb-7">
                <h2 className="text-base font-bold mb-4 uppercase tracking-wide border-b-3 border-blue-600 pb-2.5" style={{ 
                  color: "#1e3a5f", 
                  fontSize: "14px",
                  letterSpacing: "1px",
                  fontWeight: "700",
                  borderBottomWidth: "3px"
                }}>Education</h2>
                <div className="space-y-4">
                  {educations.filter((edu) => edu.school || edu.degree).map((edu) => (
                    <div key={edu.id} className="flex justify-between items-start pb-3 border-b border-gray-200 last:border-0">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1.5 text-gray-900" style={{ fontSize: "11.5px", fontWeight: "600" }}>{edu.degree}</h3>
                        <p className="mb-1 text-gray-700" style={{ fontSize: "10.5px" }}>{edu.school}</p>
                        {edu.field && (
                          <p className="text-gray-600 italic" style={{ fontSize: "9.5px" }}>{edu.field}</p>
                        )}
                      </div>
                      <p className="ml-4 whitespace-nowrap text-gray-600 font-semibold" style={{ fontSize: "10px" }}>
                        {formatDate(edu.startDate)} - {edu.current ? "Present" : formatDate(edu.endDate) || ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {experiences.some((exp) => exp.company || exp.position) && (
              <div className="mb-7">
                <h2 className="text-base font-bold mb-4 uppercase tracking-wide border-b-3 border-blue-600 pb-2.5" style={{ 
                  color: "#1e3a5f", 
                  fontSize: "14px",
                  letterSpacing: "1px",
                  fontWeight: "700",
                  borderBottomWidth: "3px"
                }}>Employment</h2>
                <div className="space-y-5">
                  {experiences.filter((exp) => exp.company || exp.position).map((exp) => (
                    <div key={exp.id} className="pb-4 border-b border-gray-200 last:border-0">
                      <div className="flex justify-between items-start mb-2.5">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1 text-gray-900" style={{ fontSize: "11.5px", fontWeight: "600" }}>{exp.position}</h3>
                          <p className="mb-1 text-gray-700" style={{ fontSize: "10.5px" }}>{exp.company}</p>
                          {exp.location && (
                            <p className="text-gray-600 italic" style={{ fontSize: "9.5px" }}>{exp.location}</p>
                          )}
                        </div>
                        <p className="ml-4 whitespace-nowrap text-gray-600 font-semibold" style={{ fontSize: "10px" }}>
                          {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate) || ""}
                        </p>
                      </div>
                      {exp.description && (
                        <ul className="list-disc list-inside ml-3 space-y-0.5 mt-2 text-gray-700" style={{ fontSize: "10px", lineHeight: "1.7" }}>
                          {exp.description.split('\n').filter(line => line.trim()).map((line, idx) => (
                            <li key={idx}>{line.trim()}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(languages.some((lang) => lang.name) || certificates.some((cert) => cert.name) || projects.some((proj) => proj.name) || hobbies.some((hobby) => hobby.name)) && (
              <div className="mb-7">
                <h2 className="text-base font-bold mb-5 uppercase tracking-wide border-b-3 border-gray-400 pb-3" style={{ 
                  color: "#1e3a5f", 
                  fontSize: "15px", 
                  letterSpacing: "1px", 
                  fontWeight: "700",
                  borderBottomWidth: "3px"
                }}>Additional Information</h2>
                {languages.some((lang) => lang.name) && (
                  <div className="mb-4 pl-3" style={{ borderLeft: "3px solid #1e3a5f" }}>
                    <h3 className="font-bold mb-2 text-gray-900" style={{ fontSize: "12px", fontWeight: "700" }}>Languages</h3>
                    <div className="space-y-1.5" style={{ fontSize: "10.5px", color: "#4a5568" }}>
                      {languages.filter((lang) => lang.name).map((lang) => (
                        <div key={lang.id} className="flex items-center gap-2">
                          <span className="text-gray-400">•</span>
                          <span className="font-semibold text-gray-700">{lang.name}</span>
                          {lang.level && (
                            <>
                              <span className="text-gray-500">-</span>
                              <span className="text-gray-600">{lang.level}</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {hobbies.some((hobby) => hobby.name) && (
                  <div className="mb-4 pl-3" style={{ borderLeft: "3px solid #1e3a5f" }}>
                    <h3 className="font-bold mb-2 text-gray-900" style={{ fontSize: "12px", fontWeight: "700" }}>Hobbies</h3>
                    <div className="space-y-1.5" style={{ fontSize: "10.5px", color: "#4a5568" }}>
                      {hobbies.filter((hobby) => hobby.name).map((hobby) => (
                        <div key={hobby.id} className="flex items-center gap-2">
                          <span className="text-gray-400">•</span>
                          <span className="font-semibold text-gray-700">{hobby.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {certificates.some((cert) => cert.name) && (
                  <div className="mb-4 pl-3" style={{ borderLeft: "3px solid #1e3a5f" }}>
                    <h3 className="font-bold mb-2 text-gray-900" style={{ fontSize: "12px", fontWeight: "700" }}>Certificates</h3>
                    <div className="space-y-2" style={{ fontSize: "10.5px", color: "#4a5568" }}>
                      {certificates.filter((cert) => cert.name).map((cert) => (
                        <div key={cert.id} className="flex items-start gap-2">
                          <span className="text-gray-400 mt-0.5">▸</span>
                          <div>
                            <span className="font-semibold text-gray-700">{cert.name}</span>
                            <span className="text-gray-600"> - {cert.issuer}</span>
                            {cert.date && <span className="text-gray-500"> ({formatDate(cert.date)})</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {projects.some((proj) => proj.name) && (
                  <div className="pl-3" style={{ borderLeft: "3px solid #1e3a5f" }}>
                    <h3 className="font-bold mb-2 text-gray-900" style={{ fontSize: "12px", fontWeight: "700" }}>Projects</h3>
                    <div className="space-y-3" style={{ fontSize: "10.5px", color: "#4a5568" }}>
                      {projects.filter((proj) => proj.name).map((proj) => (
                        <div key={proj.id} className="pb-2 border-b border-gray-100 last:border-0">
                          <div className="flex items-start gap-2 mb-1">
                            <span className="text-gray-400 mt-0.5">▸</span>
                            <span className="font-semibold text-gray-700">{proj.name}</span>
                          </div>
                          {proj.description && (
                            <p className="mt-1 ml-4 text-gray-600 italic" style={{ fontSize: "10px", lineHeight: "1.6" }}>{proj.description}</p>
                          )}
                          {proj.technologies && (
                            <p className="mt-1 ml-4 text-gray-500" style={{ fontSize: "9.5px" }}>
                              <span className="font-medium">Tech:</span> {proj.technologies}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderClassicTemplate = () => {
    // Single column, clean and simple design with gray sidebar - A4 optimized
    return (
      <div
        id="cv-preview"
        className="bg-white p-0 mx-auto shadow-lg"
        style={{ 
          fontFamily: "Times New Roman, serif", 
          fontSize: "10pt",
          width: "210mm",
          maxWidth: "210mm",
          minHeight: "297mm"
        }}
      >
        <div className="flex">
          {/* Left Column - Gray Background */}
          <div className="w-1/4 bg-gradient-to-b from-gray-100 to-gray-200 p-6">
            <div className="text-center mb-6">
              {personalInfo.photo && (
                <div className="mb-5 flex justify-center">
                  <img
                    src={personalInfo.photo}
                    alt="Profile"
                    className="w-24 h-32 object-cover rounded-lg border-3 border-gray-500 shadow-lg"
                    style={{ aspectRatio: "3/4", borderWidth: "3px" }}
                  />
                </div>
              )}
              <h1 className="text-xl font-bold text-gray-900 mb-2" style={{ fontSize: "19px", lineHeight: "1.3", letterSpacing: "0.3px" }}>
                {personalInfo.firstName || "Нэр"} {personalInfo.lastName || "Овог"}
              </h1>
            </div>
            <div className="space-y-5">
              <div>
                <h2 className="text-xs font-bold text-gray-800 mb-3 uppercase tracking-wide border-b-2 border-gray-600 pb-2" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Contact</h2>
                <div className="text-gray-700 space-y-2" style={{ fontSize: "10px", lineHeight: "1.6" }}>
                  {personalInfo.email && <div className="break-words flex items-start gap-2"><span>📧</span><span>{personalInfo.email}</span></div>}
                  {personalInfo.phone && <div className="flex items-start gap-2"><span>📞</span><span>{personalInfo.phone}</span></div>}
                  {personalInfo.address && <div className="break-words flex items-start gap-2"><span>🏠</span><span>{personalInfo.address}</span></div>}
                  {personalInfo.linkedin && <div className="break-words flex items-start gap-2"><span>💼</span><span>{personalInfo.linkedin}</span></div>}
                </div>
              </div>
              {skills.some((skill) => skill.name) && (
                <div>
                  <h2 className="text-xs font-bold text-gray-800 mb-3 uppercase tracking-wide border-b-2 border-gray-600 pb-2" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Skills</h2>
                  <div className="text-gray-700 space-y-1.5" style={{ fontSize: "10px", lineHeight: "1.6" }}>
                    {skills.filter((skill) => skill.name).map((skill) => (
                      <div key={skill.id} className="flex items-center gap-2">
                        <span className="text-gray-500">▸</span>
                        <span className="font-medium">{skill.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Right Column - White Background */}
          <div className="w-3/4 bg-white p-7">
            {personalInfo.summary && (
              <div className="mb-6">
                <h2 className="text-base font-bold text-gray-900 mb-3 border-b-3 border-gray-800 pb-2" style={{ fontSize: "14px", letterSpacing: "0.5px", borderBottomWidth: "3px" }}>Profile</h2>
                <p className="text-gray-700 leading-relaxed pl-1" style={{ fontSize: "10.5px", lineHeight: "1.8", textAlign: "justify" }}>{personalInfo.summary}</p>
              </div>
            )}
            {educations.some((edu) => edu.school || edu.degree) && (
              <div className="mb-6">
                <h2 className="text-base font-bold text-gray-900 mb-3 border-b-3 border-gray-800 pb-2" style={{ fontSize: "14px", letterSpacing: "0.5px", borderBottomWidth: "3px" }}>Education</h2>
                {educations.filter((edu) => edu.school || edu.degree).map((edu) => (
                  <div key={edu.id} className="mb-4 pb-3 border-b border-gray-200 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1" style={{ fontSize: "11.5px", fontWeight: "600" }}>{edu.degree}</h3>
                        <p className="text-gray-700 mb-1" style={{ fontSize: "10.5px" }}>{edu.school}</p>
                        {edu.field && (
                          <p className="text-gray-600 italic" style={{ fontSize: "9.5px" }}>{edu.field}</p>
                        )}
                      </div>
                      <p className="text-gray-600 whitespace-nowrap ml-4 font-semibold" style={{ fontSize: "10px" }}>
                        {formatDate(edu.startDate)} - {edu.current ? "Present" : formatDate(edu.endDate) || ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {experiences.some((exp) => exp.company || exp.position) && (
              <div className="mb-6">
                <h2 className="text-base font-bold text-gray-900 mb-3 border-b-3 border-gray-800 pb-2" style={{ fontSize: "14px", letterSpacing: "0.5px", borderBottomWidth: "3px" }}>Employment</h2>
                {experiences.filter((exp) => exp.company || exp.position).map((exp) => (
                  <div key={exp.id} className="mb-4 pb-3 border-b border-gray-200 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1" style={{ fontSize: "11.5px", fontWeight: "600" }}>{exp.position}</h3>
                        <p className="text-gray-700 mb-1" style={{ fontSize: "10.5px" }}>{exp.company}</p>
                        {exp.location && (
                          <p className="text-gray-600 italic" style={{ fontSize: "9.5px" }}>{exp.location}</p>
                        )}
                      </div>
                      <p className="text-gray-600 whitespace-nowrap ml-4 font-semibold" style={{ fontSize: "10px" }}>
                        {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate) || ""}
                      </p>
                    </div>
                    {exp.description && (
                      <ul className="text-gray-700 list-disc list-inside ml-4 space-y-0.5 mt-2" style={{ fontSize: "10px", lineHeight: "1.7" }}>
                        {exp.description.split('\n').filter(line => line.trim()).map((line, idx) => (
                          <li key={idx}>{line.trim()}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
            {(languages.some((lang) => lang.name) || certificates.some((cert) => cert.name) || projects.some((proj) => proj.name) || hobbies.some((hobby) => hobby.name)) && (
              <div className="mb-6">
                <h2 className="text-base font-bold text-gray-900 mb-3 border-b-3 border-gray-800 pb-2" style={{ fontSize: "14px", letterSpacing: "0.5px", borderBottomWidth: "3px" }}>Additional Information</h2>
                {languages.some((lang) => lang.name) && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2" style={{ fontSize: "11.5px", fontWeight: "600" }}>Languages</h3>
                    <div className="space-y-1.5" style={{ fontSize: "10.5px", color: "#4a5568" }}>
                      {languages.filter((lang) => lang.name).map((lang) => (
                        <div key={lang.id} className="flex items-center gap-2">
                          <span className="text-gray-400">•</span>
                          <span className="font-medium">{lang.name}</span>
                          {lang.level && <span className="text-gray-500">- {lang.level}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {hobbies.some((hobby) => hobby.name) && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2" style={{ fontSize: "11.5px", fontWeight: "600" }}>Hobbies</h3>
                    <div className="space-y-1.5" style={{ fontSize: "10.5px", color: "#4a5568" }}>
                      {hobbies.filter((hobby) => hobby.name).map((hobby) => (
                        <div key={hobby.id} className="flex items-center gap-2">
                          <span className="text-gray-400">•</span>
                          <span className="font-medium">{hobby.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {certificates.some((cert) => cert.name) && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2" style={{ fontSize: "11.5px", fontWeight: "600" }}>Certificates</h3>
                    <div className="space-y-1.5" style={{ fontSize: "10.5px", color: "#4a5568" }}>
                      {certificates.filter((cert) => cert.name).map((cert) => (
                        <div key={cert.id} className="flex items-start gap-2">
                          <span className="text-gray-400 mt-0.5">▸</span>
                          <div>
                            <span className="font-medium">{cert.name}</span> - {cert.issuer} {cert.date && <span className="text-gray-500">({formatDate(cert.date)})</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {projects.some((proj) => proj.name) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2" style={{ fontSize: "11.5px", fontWeight: "600" }}>Projects</h3>
                    <div className="space-y-2.5" style={{ fontSize: "10.5px", color: "#4a5568" }}>
                      {projects.filter((proj) => proj.name).map((proj) => (
                        <div key={proj.id} className="pb-2 border-b border-gray-200 last:border-0">
                          <div className="flex items-start gap-2 mb-1">
                            <span className="text-gray-400 mt-0.5">▸</span>
                            <span className="font-semibold">{proj.name}</span>
                          </div>
                          {proj.description && <p className="mt-1 ml-4 text-gray-600 italic" style={{ fontSize: "10px", lineHeight: "1.6" }}>{proj.description}</p>}
                          {proj.technologies && <p className="mt-1 ml-4 text-gray-500" style={{ fontSize: "9.5px" }}><span className="font-medium">Tech:</span> {proj.technologies}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCreativeTemplate = () => {
    // Two-column layout with dark gray header spanning both columns - A4 optimized
    return (
      <div
        id="cv-preview"
        className="bg-white p-0 mx-auto shadow-lg"
        style={{ 
          fontFamily: "Arial, sans-serif", 
          fontSize: "10pt",
          width: "210mm",
          maxWidth: "210mm",
          minHeight: "297mm"
        }}
      >
        {/* Header - Dark gray background with gradient spanning full width */}
        <div className="p-6" style={{ background: "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)" }}>
          <div className="flex items-center gap-5 mb-3">
            {personalInfo.photo && (
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 rounded-lg blur-sm"></div>
                <img
                  src={personalInfo.photo}
                  alt="Profile"
                  className="w-24 h-32 object-cover rounded-lg border-3 border-white shadow-xl relative"
                  style={{ aspectRatio: "3/4", borderWidth: "3px" }}
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white mb-1" style={{ fontSize: "22px", lineHeight: "1.3", letterSpacing: "0.5px", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                {personalInfo.firstName || "Нэр"} {personalInfo.lastName || "Овог"}
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-white/95" style={{ fontSize: "10.5px", lineHeight: "1.6" }}>
            {personalInfo.email && <span className="break-words flex items-center gap-1.5"><span>📧</span><span>{personalInfo.email}</span></span>}
            {personalInfo.phone && <span className="flex items-center gap-1.5"><span>📞</span><span>{personalInfo.phone}</span></span>}
            {personalInfo.address && <span className="break-words flex items-center gap-1.5"><span>🏠</span><span>{personalInfo.address}</span></span>}
            {personalInfo.linkedin && <span className="break-words flex items-center gap-1.5"><span>💼</span><span>{personalInfo.linkedin}</span></span>}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex">
          {/* Left Column - Main content */}
          <div className="w-2/3 bg-white p-6">
          {personalInfo.summary && (
              <div className="mb-6">
                <h2 className="text-base font-bold mb-3 uppercase tracking-wide border-b-2 border-gray-400 pb-2" style={{ color: "#2d3748", fontSize: "14px", letterSpacing: "0.8px", fontWeight: "700" }}>Profile</h2>
                <p className="leading-relaxed pl-1" style={{ color: "#4a5568", fontSize: "10.5px", lineHeight: "1.8", textAlign: "justify" }}>{personalInfo.summary}</p>
            </div>
          )}
            
              {educations.some((edu) => edu.school || edu.degree) && (
              <div className="mb-6">
                <h2 className="text-base font-bold mb-4 uppercase tracking-wide border-b-2 border-gray-400 pb-2" style={{ color: "#2d3748", fontSize: "14px", letterSpacing: "0.8px", fontWeight: "700" }}>Education</h2>
                <div className="space-y-3">
                  {educations.filter((edu) => edu.school || edu.degree).map((edu) => (
                    <div key={edu.id} className="flex justify-between items-start pb-3 border-b border-gray-200 last:border-0">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1" style={{ color: "#2d3748", fontSize: "11.5px", fontWeight: "600" }}>{edu.degree}</h3>
                        <p className="mb-1" style={{ color: "#4a5568", fontSize: "10.5px" }}>{edu.school}</p>
                        {edu.field && (
                          <p style={{ color: "#718096", fontSize: "9.5px", fontStyle: "italic" }}>{edu.field}</p>
                        )}
                      </div>
                      <p className="ml-4 whitespace-nowrap font-semibold" style={{ color: "#718096", fontSize: "10px" }}>
                        {formatDate(edu.startDate)} - {edu.current ? "Present" : formatDate(edu.endDate) || ""}
                      </p>
                    </div>
                    ))}
                  </div>
                </div>
              )}

              {experiences.some((exp) => exp.company || exp.position) && (
              <div className="mb-6">
                <h2 className="text-base font-bold mb-4 uppercase tracking-wide border-b-2 border-gray-400 pb-2" style={{ color: "#2d3748", fontSize: "14px", letterSpacing: "0.8px", fontWeight: "700" }}>Employment</h2>
                <div className="space-y-4">
                  {experiences.filter((exp) => exp.company || exp.position).map((exp) => (
                    <div key={exp.id} className="pb-4 border-b border-gray-200 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1" style={{ color: "#2d3748", fontSize: "11.5px", fontWeight: "600" }}>{exp.position}</h3>
                          <p className="mb-1" style={{ color: "#4a5568", fontSize: "10.5px" }}>{exp.company}</p>
                          {exp.location && (
                            <p style={{ color: "#718096", fontSize: "9.5px", fontStyle: "italic" }}>{exp.location}</p>
                          )}
                        </div>
                        <p className="ml-4 whitespace-nowrap font-semibold" style={{ color: "#718096", fontSize: "10px" }}>
                        {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate) || ""}
                      </p>
                      </div>
                      {exp.description && (
                        <ul className="list-disc list-inside ml-2 space-y-0.5 mt-2" style={{ color: "#4a5568", fontSize: "10px", lineHeight: "1.7" }}>
                          {exp.description.split('\n').filter(line => line.trim()).map((line, idx) => (
                            <li key={idx}>{line.trim()}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
                </div>
              )}

            {(languages.some((lang) => lang.name) || certificates.some((cert) => cert.name) || projects.some((proj) => proj.name) || hobbies.some((hobby) => hobby.name)) && (
              <div className="mb-6">
                <h2 className="text-base font-bold mb-4 uppercase tracking-wide border-b-2 border-gray-400 pb-2" style={{ color: "#2d3748", fontSize: "14px", letterSpacing: "0.8px", fontWeight: "700" }}>Additional Information</h2>
                {languages.some((lang) => lang.name) && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2" style={{ color: "#2d3748", fontSize: "11.5px", fontWeight: "600" }}>Languages</h3>
                    <div className="space-y-1.5" style={{ fontSize: "10.5px", color: "#4a5568" }}>
                      {languages.filter((lang) => lang.name).map((lang) => (
                        <div key={lang.id} className="flex items-center gap-2">
                          <span className="text-gray-400">•</span>
                          <span className="font-medium">{lang.name}</span>
                          {lang.level && <span className="text-gray-500">- {lang.level}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {hobbies.some((hobby) => hobby.name) && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2" style={{ color: "#2d3748", fontSize: "11.5px", fontWeight: "600" }}>Hobbies</h3>
                    <div className="space-y-1.5" style={{ fontSize: "10.5px", color: "#4a5568" }}>
                      {hobbies.filter((hobby) => hobby.name).map((hobby) => (
                        <div key={hobby.id} className="flex items-center gap-2">
                          <span className="text-gray-400">•</span>
                          <span className="font-medium">{hobby.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {certificates.some((cert) => cert.name) && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2" style={{ color: "#2d3748", fontSize: "11.5px", fontWeight: "600" }}>Certificates</h3>
                    <div className="space-y-1.5" style={{ fontSize: "10.5px", color: "#4a5568" }}>
                      {certificates.filter((cert) => cert.name).map((cert) => (
                        <div key={cert.id} className="flex items-start gap-2">
                          <span className="text-gray-400 mt-0.5">▸</span>
                          <div>
                            <span className="font-medium">{cert.name}</span> - {cert.issuer} {cert.date && <span className="text-gray-500">({formatDate(cert.date)})</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {projects.some((proj) => proj.name) && (
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: "#2d3748", fontSize: "11.5px", fontWeight: "600" }}>Projects</h3>
                    <div className="space-y-2.5" style={{ fontSize: "10.5px", color: "#4a5568" }}>
                      {projects.filter((proj) => proj.name).map((proj) => (
                        <div key={proj.id} className="pb-2 border-b border-gray-200 last:border-0">
                          <div className="flex items-start gap-2 mb-1">
                            <span className="text-gray-400 mt-0.5">▸</span>
                            <span className="font-semibold">{proj.name}</span>
                          </div>
                          {proj.description && <p className="mt-1 ml-4 text-gray-600 italic" style={{ fontSize: "10px", lineHeight: "1.6" }}>{proj.description}</p>}
                          {proj.technologies && <p className="mt-1 ml-4 text-gray-500" style={{ fontSize: "9.5px" }}><span className="font-medium">Tech:</span> {proj.technologies}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="w-1/3 bg-white p-6" style={{ backgroundColor: "#f7fafc" }}>
            <div className="mb-6">
              <h2 className="text-sm font-bold mb-4 uppercase tracking-wide border-b-2 border-gray-300 pb-2" style={{ color: "#2d3748", fontSize: "12px", letterSpacing: "0.5px", fontWeight: "700" }}>Personal details</h2>
              <div className="space-y-2.5 text-xs" style={{ color: "#4a5568", fontSize: "10.5px", lineHeight: "1.6" }}>
                {personalInfo.address && (
                  <div>
                    <span className="font-semibold text-gray-800">Үндэс угсаа:</span> <span className="text-gray-700">{personalInfo.address}</span>
                  </div>
                )}
                {!personalInfo.address && (
                  <div>
                    <span className="font-semibold text-gray-800">Үндэс угсаа:</span> <span className="text-gray-700">Монгол Улс</span>
                  </div>
                )}
              </div>
            </div>

            {skills.some((skill) => skill.name) && (
              <div>
                <h2 className="text-sm font-bold mb-4 uppercase tracking-wide border-b-2 border-gray-300 pb-2" style={{ color: "#2d3748", fontSize: "12px", letterSpacing: "0.5px", fontWeight: "700" }}>Skills</h2>
                <div className="space-y-2 text-xs leading-relaxed" style={{ color: "#4a5568", fontSize: "10.5px", lineHeight: "1.6" }}>
                  {skills.filter((skill) => skill.name).map((skill) => (
                    <div key={skill.id} className="flex items-center gap-2">
                      <span className="text-gray-400">▸</span>
                      <span className="font-medium">{skill.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderWizardTemplate = () => {
    // Beautiful two-column layout matching the image - A4 optimized
    return (
      <div
        id="cv-preview"
        className="bg-white p-0 mx-auto shadow-2xl"
        style={{ 
          fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif", 
          fontSize: "10pt",
          width: "210mm",
          maxWidth: "210mm",
          minHeight: "297mm",
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
        }}
      >
        <div className="flex">
          {/* Left Column */}
          <div className="w-2/5" style={{ backgroundColor: "#f8f9fa" }}>
            {/* Blue Header with gradient */}
            <div className="p-6" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)" }}>
              {personalInfo.photo && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={personalInfo.photo}
                    alt="Profile"
                    className="w-20 h-28 object-cover rounded-lg border-3 border-white shadow-xl"
                    style={{ aspectRatio: "3/4", borderWidth: "3px" }}
                  />
                </div>
              )}
              <h1 className="text-xl font-bold text-white text-center" style={{ 
                fontSize: "20px", 
                lineHeight: "1.3",
                letterSpacing: "0.5px",
                textShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }}>
                {personalInfo.firstName || "Нэр"} {personalInfo.lastName || "Овог"}
              </h1>
            </div>
            
            <div className="p-6 bg-white">
              <h2 className="text-sm font-bold mb-4 uppercase tracking-wide border-b-2 border-gray-300 pb-2" style={{ 
                color: "#2d3748", 
                fontSize: "12px",
                letterSpacing: "0.8px",
                fontWeight: "700"
              }}>Personal details</h2>
              
              <div className="space-y-3 text-gray-700" style={{ fontSize: "10.5px", lineHeight: "1.7" }}>
                {(personalInfo.firstName || personalInfo.lastName) && (
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0" style={{ fontSize: "12px" }}>👤</span>
                    <span className="break-words">{personalInfo.firstName || ""} {personalInfo.lastName || ""}</span>
                  </div>
                )}
                {personalInfo.email && (
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0" style={{ fontSize: "12px" }}>📧</span>
                    <span className="break-words">{personalInfo.email}</span>
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0" style={{ fontSize: "12px" }}>📞</span>
                    <span>{personalInfo.phone}</span>
                  </div>
                )}
                {personalInfo.address && (
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0" style={{ fontSize: "12px" }}>🏠</span>
                    <span className="break-words">{personalInfo.address}</span>
                  </div>
                )}
                {personalInfo.dateOfBirth && (
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0" style={{ fontSize: "12px" }}>📅</span>
                    <span>{personalInfo.dateOfBirth}</span>
                  </div>
                )}
                {personalInfo.nationality && (
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0" style={{ fontSize: "12px" }}>🏳️</span>
                    <span>{personalInfo.nationality}</span>
                  </div>
                )}
                {personalInfo.github && (
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0" style={{ fontSize: "12px" }}>🌐</span>
                    <span className="break-words">{personalInfo.github}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Skills Section */}
            {skills.some((skill) => skill.name) && (
              <div className="px-6 pt-0 pb-6 bg-white">
                <h2 className="text-sm font-bold mb-4 uppercase tracking-wide border-b-2 border-gray-300 pb-2" style={{ 
                  color: "#2d3748", 
                  fontSize: "12px",
                  letterSpacing: "0.8px",
                  fontWeight: "700"
                }}>Skills</h2>
                <div className="space-y-2 text-gray-700" style={{ fontSize: "10.5px", lineHeight: "1.6" }}>
                  {skills.filter((skill) => skill.name).map((skill) => (
                    <div key={skill.id} className="flex items-center gap-2">
                      <span className="text-gray-400">▸</span>
                      <span className="font-medium">{skill.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Languages Section */}
            {languages.some((lang) => lang.name) && (
              <div className="px-6 pt-0 pb-6 bg-white">
                <h2 className="text-sm font-bold mb-4 uppercase tracking-wide border-b-2 border-gray-300 pb-2" style={{ 
                  color: "#2d3748", 
                  fontSize: "12px",
                  letterSpacing: "0.8px",
                  fontWeight: "700"
                }}>Languages</h2>
                <div className="space-y-3 text-gray-700" style={{ fontSize: "10.5px", lineHeight: "1.6" }}>
                  {languages.filter((lang) => lang.name).map((lang) => {
                    // Map language levels to visual indicators
                    const levelMap: Record<string, number> = {
                      "Уншдаг": 2,
                      "Бичдэг": 3,
                      "Ярьдаг": 5,
                      "": 0
                    };
                    const filledCircles = levelMap[lang.level] || 0;
                    return (
                      <div key={lang.id} className="flex items-center gap-3">
                        <span className="font-semibold text-gray-800">{lang.name}:</span>
                        {filledCircles > 0 ? (
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div
                                key={i}
                                style={{
                                  width: "9px",
                                  height: "9px",
                                  borderRadius: "50%",
                                  backgroundColor: i <= filledCircles ? "#1e3a5f" : "#e2e8f0"
                                }}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">{lang.level || ""}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Decorative Blue Footer */}
            <div className="h-8" style={{ 
              backgroundColor: "#1e3a5f",
              borderTopLeftRadius: "50px",
              borderTopRightRadius: "50px"
            }}></div>
          </div>
          
          {/* Right Column */}
          <div className="w-3/5 bg-white p-7">
            {/* Profile Section */}
            {personalInfo.summary && (
              <div className="mb-7">
                <h2 className="text-base font-bold mb-4 uppercase tracking-wide border-b-3 border-blue-600 pb-2.5" style={{ 
                  color: "#1e3a5f", 
                  fontSize: "14px",
                  letterSpacing: "1px",
                  fontWeight: "700",
                  borderBottomWidth: "3px"
                }}>Profile</h2>
                <p className="leading-relaxed text-gray-700 pl-2" style={{ 
                  fontSize: "10.5px", 
                  lineHeight: "1.9",
                  textAlign: "justify"
                }}>{personalInfo.summary}</p>
              </div>
            )}
            
            {/* Education Section */}
            {educations.some((edu) => edu.school || edu.degree) && (
              <div className="mb-7">
                <h2 className="text-base font-bold mb-4 uppercase tracking-wide border-b-3 border-blue-600 pb-2.5" style={{ 
                  color: "#1e3a5f", 
                  fontSize: "14px",
                  letterSpacing: "1px",
                  fontWeight: "700",
                  borderBottomWidth: "3px"
                }}>Education</h2>
                <div className="space-y-4">
                  {educations.filter((edu) => edu.school || edu.degree).map((edu) => (
                    <div key={edu.id} className="pb-3 border-b border-gray-200 last:border-0">
                      <h3 className="font-semibold mb-1.5 text-gray-900" style={{ fontSize: "11.5px", fontWeight: "600" }}>{edu.degree}</h3>
                      <p className="mb-1 text-gray-700" style={{ fontSize: "10.5px" }}>{edu.school}</p>
                      {edu.gpa && (
                        <p className="text-gray-600 italic mb-1.5" style={{ fontSize: "9.5px" }}>Голч дүн: {edu.gpa}</p>
                      )}
                      <p className="text-gray-600 font-semibold" style={{ fontSize: "10px" }}>
                        {formatDate(edu.startDate)} - {edu.current ? "Present" : formatDate(edu.endDate) || ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Employment Section */}
            {experiences.some((exp) => exp.company || exp.position) && (
              <div className="mb-7">
                <h2 className="text-base font-bold mb-4 uppercase tracking-wide border-b-3 border-blue-600 pb-2.5" style={{ 
                  color: "#1e3a5f", 
                  fontSize: "14px",
                  letterSpacing: "1px",
                  fontWeight: "700",
                  borderBottomWidth: "3px"
                }}>Employment</h2>
                <div className="space-y-5">
                  {experiences.filter((exp) => exp.company || exp.position).map((exp) => (
                    <div key={exp.id} className="pb-4 border-b border-gray-200 last:border-0">
                      <div className="flex justify-between items-start mb-2.5">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1 text-gray-900" style={{ fontSize: "11.5px", fontWeight: "600" }}>{exp.position}</h3>
                          <p className="mb-1 text-gray-700" style={{ fontSize: "10.5px" }}>{exp.company}</p>
                        </div>
                        <p className="ml-4 whitespace-nowrap text-gray-600 font-semibold" style={{ fontSize: "10px" }}>
                          {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate) || ""}
                        </p>
                      </div>
                      {exp.description && (
                        <ul className="list-disc list-inside ml-3 space-y-0.5 mt-2 text-gray-700" style={{ fontSize: "10px", lineHeight: "1.7" }}>
                          {exp.description.split('\n').filter(line => line.trim()).map((line, idx) => (
                            <li key={idx}>{line.trim()}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Additional Information Section */}
            {(languages.some((lang) => lang.name) || certificates.some((cert) => cert.name) || projects.some((proj) => proj.name) || hobbies.some((hobby) => hobby.name)) && (
              <div className="mb-7">
                <h2 className="text-base font-bold mb-4 uppercase tracking-wide border-b-3 border-blue-600 pb-2.5" style={{ 
                  color: "#1e3a5f", 
                  fontSize: "14px",
                  letterSpacing: "1px",
                  fontWeight: "700",
                  borderBottomWidth: "3px"
                }}>Additional Information</h2>
                {languages.some((lang) => lang.name) && (
                  <div className="mb-4 pl-3" style={{ borderLeft: "3px solid #1e3a5f" }}>
                    <h3 className="font-bold mb-2 text-gray-900" style={{ fontSize: "12px", fontWeight: "700" }}>Languages</h3>
                    <div className="space-y-1.5" style={{ fontSize: "10.5px", color: "#4a5568" }}>
                      {languages.filter((lang) => lang.name).map((lang) => (
                        <div key={lang.id} className="flex items-center gap-2">
                          <span className="text-gray-400">•</span>
                          <span className="font-semibold text-gray-700">{lang.name}</span>
                          {lang.level && (
                            <>
                              <span className="text-gray-500">-</span>
                              <span className="text-gray-600">{lang.level}</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {hobbies.some((hobby) => hobby.name) && (
                  <div className="mb-4 pl-3" style={{ borderLeft: "3px solid #1e3a5f" }}>
                    <h3 className="font-bold mb-2 text-gray-900" style={{ fontSize: "12px", fontWeight: "700" }}>Hobbies</h3>
                    <div className="space-y-1.5" style={{ fontSize: "10.5px", color: "#4a5568" }}>
                      {hobbies.filter((hobby) => hobby.name).map((hobby) => (
                        <div key={hobby.id} className="flex items-center gap-2">
                          <span className="text-gray-400">•</span>
                          <span className="font-semibold text-gray-700">{hobby.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {certificates.some((cert) => cert.name) && (
                  <div className="mb-4 pl-3" style={{ borderLeft: "3px solid #1e3a5f" }}>
                    <h3 className="font-bold mb-2 text-gray-900" style={{ fontSize: "12px", fontWeight: "700" }}>Certificates</h3>
                    <div className="space-y-2" style={{ fontSize: "10.5px", color: "#4a5568" }}>
                      {certificates.filter((cert) => cert.name).map((cert) => (
                        <div key={cert.id} className="flex items-start gap-2">
                          <span className="text-gray-400 mt-0.5">▸</span>
                          <div>
                            <span className="font-semibold text-gray-700">{cert.name}</span>
                            <span className="text-gray-600"> - {cert.issuer}</span>
                            {cert.date && <span className="text-gray-500"> ({formatDate(cert.date)})</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {projects.some((proj) => proj.name) && (
                  <div className="pl-3" style={{ borderLeft: "3px solid #1e3a5f" }}>
                    <h3 className="font-bold mb-2 text-gray-900" style={{ fontSize: "12px", fontWeight: "700" }}>Projects</h3>
                    <div className="space-y-3" style={{ fontSize: "10.5px", color: "#4a5568" }}>
                      {projects.filter((proj) => proj.name).map((proj) => (
                        <div key={proj.id} className="pb-2 border-b border-gray-100 last:border-0">
                          <div className="flex items-start gap-2 mb-1">
                            <span className="text-gray-400 mt-0.5">▸</span>
                            <span className="font-semibold text-gray-700">{proj.name}</span>
                          </div>
                          {proj.description && (
                            <p className="mt-1 ml-4 text-gray-600 italic" style={{ fontSize: "10px", lineHeight: "1.6" }}>{proj.description}</p>
                          )}
                          {proj.technologies && (
                            <p className="mt-1 ml-4 text-gray-500" style={{ fontSize: "9.5px" }}>
                              <span className="font-medium">Tech:</span> {proj.technologies}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Template сонгох
              </h3>
              <p className="text-sm text-gray-600">
                CV-ийн харагдах байдлыг сонгоно уу. Дараа нь өөрчлөх боломжтой.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  id: "modern", 
                  name: "Modern", 
                  desc: "Орчин үеийн, мэргэжлийн дизайн",
                  color: "blue",
                  icon: "✨",
                  gradient: "from-blue-500 to-indigo-600"
                },
                { 
                  id: "classic", 
                  name: "Classic", 
                  desc: "Сонгодог, энгийн харагдах байдал",
                  color: "gray",
                  icon: "📄",
                  gradient: "from-gray-600 to-gray-800"
                },
                { 
                  id: "creative", 
                  name: "Creative", 
                  desc: "Бүтээлч, онцгой дизайн",
                  color: "indigo",
                  icon: "🎨",
                  gradient: "from-indigo-500 to-purple-600"
                },
                { 
                  id: "wizard", 
                  name: "Wizard", 
                  desc: "Магийн, онцгой дизайн",
                  color: "purple",
                  icon: "🪄",
                  gradient: "from-purple-500 to-pink-600"
                },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id as Template)}
                  className={`relative p-8 border-2 rounded-2xl transition-all transform hover:scale-105 hover:shadow-xl ${
                    template === t.id
                      ? `border-${t.color}-600 bg-gradient-to-br ${t.gradient} text-white shadow-2xl ring-4 ring-${t.color}-200`
                      : "border-gray-200 hover:border-gray-300 hover:shadow-lg bg-white"
                  }`}
                >
                  <div className={`text-5xl mb-4 ${template === t.id ? "" : "opacity-80"}`}>
                    {t.icon}
                  </div>
                  <h4 className={`text-xl font-bold mb-2 ${template === t.id ? "text-white" : "text-gray-900"}`}>
                    {t.name}
                  </h4>
                  <p className={`text-sm mb-4 ${template === t.id ? "text-white/90" : "text-gray-600"}`}>
                    {t.desc}
                  </p>
                  {template === t.id && (
                    <div className="mt-4 flex items-center gap-2 text-sm font-semibold bg-white/20 px-4 py-2 rounded-full">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>Сонгогдсон</span>
                    </div>
                  )}
                  {template !== t.id && (
                    <div className="mt-4 text-xs text-gray-500 font-medium">
                      Сонгох →
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-xl p-5 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <InformationCircleIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm text-blue-900">
                <p className="font-bold mb-2 text-base">💡 Зөвлөмж</p>
                <p className="leading-relaxed">Ажлын байрны төрлөөс хамаарч template сонгоно уу. Ихэнх тохиолдолд Modern template-ийг зөвлөж байна.</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Хувийн мэдээлэл</h3>
              <p className="text-sm text-gray-600">
                CV-ийн эхэнд харагдах үндсэн мэдээллийг оруулна уу
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Нэр *
                    </label>
                    <input
                      type="text"
                      value={personalInfo.firstName}
                      onChange={(e) => {
                        setPersonalInfo({ ...personalInfo, firstName: e.target.value });
                        if (errors.firstName) {
                          setErrors({ ...errors, firstName: "" });
                        }
                      }}
                      className={`w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md ${
                        errors.firstName ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder="Нэр"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Овог *
                    </label>
                    <input
                      type="text"
                      value={personalInfo.lastName}
                      onChange={(e) => {
                        setPersonalInfo({ ...personalInfo, lastName: e.target.value });
                        if (errors.lastName) {
                          setErrors({ ...errors, lastName: "" });
                        }
                      }}
                      className={`w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md ${
                        errors.lastName ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder="Овог"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Имэйл</label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => {
                        setPersonalInfo({ ...personalInfo, email: e.target.value });
                        if (errors.email) {
                          setErrors({ ...errors, email: "" });
                        }
                      }}
                      className={`w-full px-4 py-3 border-2 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md ${
                        errors.email ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder="email@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Утас</label>
                <input
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400"
                  placeholder="99112233"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Хаяг</label>
                <input
                  type="text"
                  value={personalInfo.address}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, address: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400"
                  placeholder="Хаяг"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={personalInfo.linkedin}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, linkedin: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400"
                  placeholder="linkedin.com/in/username"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Товч танилцуулга
                </label>
                <textarea
                  value={personalInfo.summary}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, summary: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border-2 text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400 resize-none"
                  placeholder="Өөрийн талаар товч танилцуулга..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  3x4 Зураг
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Validate file size (max 5MB)
                          if (file.size > 5 * 1024 * 1024) {
                            setErrors((prev) => ({ ...prev, photo: "Зургийн хэмжээ 5MB-ээс хэтэрч байна" }));
                            return;
                          }
                          // Open crop modal
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setImageToCrop(event.target?.result as string);
                            setShowCropModal(true);
                            setCrop({ x: 0, y: 0 });
                            setZoom(1);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors"
                    >
                      {personalInfo.photo ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img
                            src={personalInfo.photo}
                            alt="Profile"
                            className="max-w-full max-h-full object-contain rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPersonalInfo({ ...personalInfo, photo: "" });
                              const input = document.getElementById("photo-upload") as HTMLInputElement;
                              if (input) input.value = "";
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <svg
                            className="w-10 h-10 text-gray-400 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-sm text-gray-600">Зураг оруулах</span>
                          <span className="text-xs text-gray-500">3x4 харьцаа (JPG, PNG)</span>
                        </>
                      )}
                    </label>
                    {errors.photo && (
                      <p className="mt-1 text-xs text-red-600">{errors.photo}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Ажлын туршлага</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Ажлын туршлагаа хамгийн сүүлчийн ажлаасаа эхлэн оруулна уу
                </p>
              </div>
              <button
                onClick={addExperience}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-md"
              >
                <PlusIcon className="w-4 h-4" />
                Нэмэх
              </button>
            </div>
            {experiences.length === 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 rounded-xl p-5 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                <InformationCircleIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm text-yellow-900">
                <p className="font-bold mb-2 text-base">💡 Зөвлөмж</p>
                <p className="leading-relaxed">Хамгийн багадаа нэг ажлын туршлага оруулахыг зөвлөж байна. Хэрэв ажлын туршлагагүй бол боловсрол, төсөл, сертификатуудыг онцолно уу.</p>
              </div>
            </div>
            )}
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border-2 border-gray-200 shadow-md hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">
                      Ажлын байр #{experiences.indexOf(exp) + 1}
                    </h4>
                    {experiences.length > 1 && (
                      <button
                        onClick={() => removeExperience(exp.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Албан тушаал *
                      </label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                        className="w-full px-4 py-3 border-2 text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400"
                        placeholder="Албан тушаал"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Компани *
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                        className="w-full px-4 py-3 border-2 text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400"
                        placeholder="Компани"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Байршил
                      </label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                        className="w-full px-4 py-3 border-2 text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400"
                        placeholder="Байршил"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Эхлэх огноо
                      </label>
                      <input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                        className="w-full px-4 py-3 border-2 text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Дуусах огноо
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="month"
                          value={exp.endDate}
                          onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                          disabled={exp.current}
                          className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) =>
                              updateExperience(exp.id, "current", e.target.checked)
                            }
                            className="rounded"
                          />
                          Одоо
                        </label>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Тайлбар
                      </label>
                      <textarea
                        value={exp.description}
                        onChange={(e) =>
                          updateExperience(exp.id, "description", e.target.value)
                        }
                        rows={3}
                        className="w-full px-4 py-3 border-2 text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400 resize-none"
                        placeholder="Ажлын тайлбар..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Боловсрол</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Боловсролын мэдээллийг хамгийн дээд зэргээс эхлэн оруулна уу
                </p>
              </div>
              <button
                onClick={addEducation}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-md"
              >
                <PlusIcon className="w-4 h-4" />
                Нэмэх
              </button>
            </div>
            <div className="space-y-4">
              {educations.map((edu) => (
                <div key={edu.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border-2 border-gray-200 shadow-md hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">
                      Боловсрол #{educations.indexOf(edu) + 1}
                    </h4>
                    {educations.length > 1 && (
                      <button
                        onClick={() => removeEducation(edu.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Боловсролын зэрэг *
                      </label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                        className="w-full px-4 py-3 border-2 text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400"
                        placeholder="Жишээ: Бакалавр"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Сургууль *
                      </label>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                        className="w-full px-4 py-3 border-2 text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400"
                        placeholder="Сургуулийн нэр"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Мэргэжил
                      </label>
                      <input
                        type="text"
                        value={edu.field}
                        onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                        className="w-full px-4 py-3 border-2 text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400"
                        placeholder="Мэргэжлийн чиглэл"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                      <input
                        type="text"
                        value={edu.gpa}
                        onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                        className="w-full px-4 py-3 border-2 text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400"
                        placeholder="3.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Эхлэх огноо
                      </label>
                      <input
                        type="month"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                        className="w-full px-4 py-3 border-2 text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Дуусах огноо
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="month"
                          value={edu.endDate}
                          onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                          disabled={edu.current}
                          className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={edu.current}
                            onChange={(e) => updateEducation(edu.id, "current", e.target.checked)}
                            className="rounded"
                          />
                          Одоо
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Ур чадвар</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Ажлын байрны шаардлагатай ур чадваруудыг онцолно уу
                </p>
              </div>
              <button
                onClick={addSkill}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-md"
              >
                <PlusIcon className="w-4 h-4" />
                Нэмэх
              </button>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-xl p-5 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <InformationCircleIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm text-blue-900">
                <p className="font-bold mb-2 text-base">💡 Зөвлөмж</p>
                <p className="leading-relaxed">Ажлын байрны тайлбарт дурдсан ур чадваруудыг онцолж, түвшинг зөв сонгоно уу.</p>
              </div>
            </div>
            <div className="space-y-3">
              {skills.map((skill) => (
                <div key={skill.id} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => updateSkill(skill.id, "name", e.target.value)}
                    className="flex-1 px-4 py-3 border-2 text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400"
                    placeholder="Ур чадварын нэр"
                  />
                  <select
                    value={skill.level}
                    onChange={(e) =>
                      updateSkill(skill.id, "level", e.target.value as Skill["level"])
                    }
                    className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400"
                  >
                    <option value="beginner">Эхлэгч</option>
                    <option value="intermediate">Дунд</option>
                    <option value="advanced">Дэвшилтэт</option>
                    <option value="expert">Мэргэжилтэн</option>
                  </select>
                  {skills.length > 1 && (
                    <button
                      onClick={() => removeSkill(skill.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            {/* Languages */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Хэл</h3>
                <button
                  onClick={addLanguage}
                  className="flex items-center gap-2 text-gray-700 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-md"
                >
                  <PlusIcon className="w-4 h-4" />
                  Нэмэх
                </button>
              </div>
              <div className="space-y-3">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={lang.name}
                      onChange={(e) => updateLanguage(lang.id, "name", e.target.value)}
                      className="flex-1 px-4 py-3 border-2 text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400"
                      placeholder="Хэл"
                    />
                    <select
                      value={lang.level}
                      onChange={(e) =>
                        updateLanguage(lang.id, "level", e.target.value as Language["level"])
                      }
                      className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400"
                    >
                      <option value="basic">Энгийн</option>
                      <option value="conversational">Ярилцлага</option>
                      <option value="fluent">Чөлөөтэй</option>
                      <option value="native">Эх хэл</option>
                    </select>
                    {languages.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removeLanguage(lang.id, e);
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Certificates */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Сертификат</h3>
                <button
                  onClick={addCertificate}
                  className="flex items-center gap-2 text-gray-700 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-md"
                >
                  <PlusIcon className="w-4 h-4" />
                  Нэмэх
                </button>
              </div>
              <div className="space-y-4">
                {certificates.map((cert) => (
                  <div key={cert.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border-2 border-gray-200 shadow-md hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">
                        Сертификат #{certificates.indexOf(cert) + 1}
                      </h4>
                      {certificates.length > 1 && (
                        <button
                          onClick={() => removeCertificate(cert.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Нэр *
                        </label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => updateCertificate(cert.id, "name", e.target.value)}
                          className="w-full px-4 py-3 border-2 text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400"
                          placeholder="Сертификатын нэр"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Олгосон байгууллага *
                        </label>
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) => updateCertificate(cert.id, "issuer", e.target.value)}
                          className="w-full px-4 py-3 border-2 text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400"
                          placeholder="Байгууллага"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Огноо
                        </label>
                        <input
                          type="month"
                          value={cert.date}
                          onChange={(e) => updateCertificate(cert.id, "date", e.target.value)}
                          className="w-full px-4 py-3 border-2 text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          URL (сонголттой)
                        </label>
                        <input
                          type="url"
                          value={cert.url}
                          onChange={(e) => updateCertificate(cert.id, "url", e.target.value)}
                          className="w-full px-4 py-3 border-2 text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Төсөл</h3>
                <button
                  onClick={addProject}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-md"
                >
                  <PlusIcon className="w-4 h-4" />
                  Нэмэх
                </button>
              </div>
              <div className="space-y-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border-2 border-gray-200 shadow-md hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">
                        Төсөл #{projects.indexOf(proj) + 1}
                      </h4>
                      {projects.length > 1 && (
                        <button
                          onClick={() => removeProject(proj.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Төслийн нэр *
                        </label>
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => updateProject(proj.id, "name", e.target.value)}
                          className="w-full px-4 py-3 border-2 text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400"
                          placeholder="Төслийн нэр"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Тайлбар
                        </label>
                        <textarea
                          value={proj.description}
                          onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 border-2 text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400"
                          placeholder="Төслийн тайлбар..."
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Технологи
                          </label>
                          <input
                            type="text"
                            value={proj.technologies}
                            onChange={(e) =>
                              updateProject(proj.id, "technologies", e.target.value)
                            }
                            className="w-full px-4 py-3 border-2 text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400"
                            placeholder="React, Node.js, MongoDB"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            URL (сонголттой)
                          </label>
                          <input
                            type="url"
                            value={proj.url}
                            onChange={(e) => updateProject(proj.id, "url", e.target.value)}
                            className="w-full px-4 py-3 border-2 text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-400"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10 shadow-sm">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">CV</span>
              </div>
              <div>
              <h2 className="text-xl font-bold text-gray-900">CV Builder</h2>
                <p className="text-xs text-gray-500">Мэргэжлийн CV үүсгэх хэрэгсэл</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <button
              onClick={generatePDF}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-md disabled:opacity-50"
            >
              {generating ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  PDF үүсгэж байна...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  PDF татах
                </>
              )}
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              )}
          </div>
            </div>
          </div>

      {/* Two Panel Layout */}
      <div className="flex flex-row flex-1 overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Left Panel - Input Forms */}
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto bg-gray-50 flex-shrink-0" style={{ maxHeight: '100%' }}>
          <div className="p-6 space-y-4">
            {/* Preview Toggle */}
            <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">CV Preview</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSidebarPreview}
                    onChange={(e) => setShowSidebarPreview(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {showSidebarPreview && (
                <span className="text-xs text-gray-500">Preview идэвхтэй</span>
              )}
            </div>

            {/* Hidden file input for future use */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > MAX_FILE_SIZE) {
                      addNotification("Файлын хэмжээ 5MB-ээс хэтэрч байна", "error");
                      // Reset input
                      if (e.target) {
                        e.target.value = '';
                      }
                      return;
                    }
                    
                    addNotification("Файл уншиж байна...", "info");
                    
                    try {
                      const formData = new FormData();
                      formData.append("file", file);
                      
                      const response = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                      });
                      
                      if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error || "Файл уншихад алдаа гарлаа");
                      }
                      
                      const data = await response.json();
                      
                      console.log("API Response:", data); // Debug log
                      
                      // Try to get content from analysis or use raw content if available
                      // The API returns the extracted text in the content variable before analysis
                      let contentToParse = "";
                      
                      // First, try to get the raw extracted content (before AI analysis)
                      // This is usually in the response but might be in different places
                      if (data.content && typeof data.content === 'string') {
                        contentToParse = data.content;
                      } else if (data.analysis && typeof data.analysis === 'string') {
                        // Use analysis if it contains the actual CV text
                        contentToParse = data.analysis;
                      } else if (data.cv?.analysis) {
                        contentToParse = data.cv.analysis;
                      }
                      
                      // If we still don't have content, try to extract from the file directly
                      if (!contentToParse || contentToParse.trim().length === 0) {
                        console.log("No content from API response, will try direct file parsing");
                      }
                      
                      console.log("Content to parse length:", contentToParse?.length || 0);
                      if (contentToParse) {
                        console.log("Content to parse (first 200):", contentToParse.substring(0, 200));
                      }
                      
                      // Always try direct file parsing first for better results
                      let extractedText = "";
                      
                      try {
                        // For Word files, extract text directly from file
                        if (file.type.includes("word") || file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
                          console.log("Extracting text directly from Word file...");
                          const mammoth = await import("mammoth");
                          const arrayBuffer = await file.arrayBuffer();
                          const result = await mammoth.extractRawText({ arrayBuffer });
                          extractedText = result.value;
                          console.log("Direct extracted text length:", extractedText.length);
                          console.log("Direct extracted text (first 300):", extractedText.substring(0, 300));
                        } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
                          // For PDF, use content from API if available, otherwise show message
                          if (contentToParse && contentToParse.trim().length > 0) {
                            extractedText = contentToParse;
                          } else {
                            addNotification("PDF файлыг уншихад API-аас мэдээлэл ирээгүй. Дахин оролдоно уу.", "info");
                          }
                        }
                      } catch (parseError) {
                        console.error("Direct file parsing error:", parseError);
                        // Fall back to API content if direct parsing fails
                        if (contentToParse && contentToParse.trim().length > 0) {
                          extractedText = contentToParse;
                        }
                      }
                      
                      // Use API content if direct extraction didn't work
                      if (!extractedText && contentToParse && contentToParse.trim().length > 0) {
                        extractedText = contentToParse;
                      }
                      
                      // Parse the extracted text
                      if (extractedText && extractedText.trim().length > 0) {
                        console.log("Calling parseCVText with extracted text...");
                        parseCVText(extractedText);
                        // Small delay to ensure state updates
                        setTimeout(() => {
                          addNotification("Файл амжилттай уншлаа. Мэдээлэл бөглөгдлөө.", "success");
                        }, 300);
                      } else {
                        console.error("No text extracted from file or API");
                        addNotification("Файл уншсан боловч мэдээлэл олдсонгүй. Файлын формат шалгана уу.", "info");
                      }
                    } catch (error) {
                      console.error("File upload error:", error);
                      const errorMessage = error instanceof Error ? error.message : "Файл уншихад алдаа гарлаа. Дахин оролдоно уу.";
                      addNotification(`Алдаа: ${errorMessage}`, "error");
                    } finally {
                      // Reset input value to allow selecting the same file again
                      if (e.target) {
                        e.target.value = '';
                      }
                    }
                  }
                }}
              />

            {/* Collapsible Sections */}
            <div className="bg-white rounded-lg shadow-sm">
              {sectionOrder.map((sectionKey) => {
                if (sectionKey === "personalDetails") {
                  return renderCollapsibleSection(
                    "personalDetails",
                    "Хувийн мэдээлэл",
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Нэр *</label>
                    <input
                      type="text"
                      value={personalInfo.firstName}
                      onChange={(e) => {
                        setPersonalInfo({ ...personalInfo, firstName: e.target.value });
                        if (errors.firstName) {
                          setErrors({ ...errors, firstName: "" });
                        }
                      }}
                      className={`w-full px-3 py-2 text-gray-700 border rounded-lg ${errors.firstName ? "border-red-400" : "border-gray-300"}`}
                      placeholder="Нэр"
                          />
                        </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Овог *</label>
                    <input
                      type="text"
                      value={personalInfo.lastName}
                      onChange={(e) => {
                        setPersonalInfo({ ...personalInfo, lastName: e.target.value });
                        if (errors.lastName) {
                          setErrors({ ...errors, lastName: "" });
                        }
                      }}
                      className={`w-full px-3 py-2 text-gray-700 border rounded-lg ${errors.lastName ? "border-red-400" : "border-gray-300"}`}
                      placeholder="Овог"
                    />
                      </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Имэйл</label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                      className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Утас</label>
                    <input
                      type="tel"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                      className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg"
                      placeholder="99112233"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Хаяг</label>
                    <input
                      type="text"
                      value={personalInfo.address}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                      className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg"
                      placeholder="Хаяг"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">3x4 Зураг</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > MAX_FILE_SIZE) {
                            setErrors((prev) => ({ ...prev, photo: "Зургийн хэмжээ 5MB-ээс хэтэрч байна" }));
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setImageToCrop(event.target?.result as string);
                            setShowCropModal(true);
                            setCrop({ x: 0, y: 0 });
                            setZoom(1);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      {personalInfo.photo ? (
                        <img src={personalInfo.photo} alt="Profile" className="max-w-full max-h-full object-contain rounded-lg" />
                      ) : (
                        <>
                          <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-gray-600">Зураг оруулах</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
                  );
                }
                if (sectionKey === "profile") {
                  return renderCollapsibleSection(
                    "profile",
                    "Танилцуулга",
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Товч танилцуулга</label>
                      <textarea
                        value={personalInfo.summary}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg"
                        placeholder="Өөрийн талаар товч танилцуулга..."
                      />
              </div>
                  );
                }
                if (sectionKey === "education") {
                  return renderCollapsibleSection(
                    "education",
                        "Боловсрол",
                <div className="space-y-4">
                  {educations.map((edu) => (
                    <div key={edu.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Боловсролын зэрэг *</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg"
                            placeholder="Бакалавр"
                          />
                </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Сургууль *</label>
                          <input
                            type="text"
                            value={edu.school}
                            onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg"
                            placeholder="Сургуулийн нэр"
                          />
              </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Эхлэх огноо</label>
                          <input
                            type="month"
                            value={edu.startDate}
                            onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg"
                          />
            </div>
                  <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Дуусах огноо</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="month"
                              value={edu.endDate}
                              onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                              disabled={edu.current}
                              className="flex-1 px-3 py-2 text-gray-700 border border-gray-300 rounded-lg disabled:bg-gray-100"
                            />
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={edu.current}
                                onChange={(e) => updateEducation(edu.id, "current", e.target.checked)}
                                className="rounded"
                              />
                              Одоо
                            </label>
                  </div>
                  </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Тайлбар</label>
                          <textarea
                            value={edu.field}
                            onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg"
                            placeholder="Мэргэжлийн чиглэл"
                          />
                </div>
                      </div>
                      {educations.length > 1 && (
                        <button
                          onClick={() => removeEducation(edu.id)}
                          className="mt-2 text-red-600 hover:text-red-800 text-sm"
                        >
                          Устгах
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addEducation}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <PlusIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">+ Add education</span>
                  </button>
                      </div>
                  );
                }
                if (sectionKey === "experience") {
                  return renderCollapsibleSection(
                    "experience",
                    "Ажлын туршлага",
                <div className="space-y-4">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Албан тушаал *</label>
                          <input
                            type="text"
                            value={exp.position}
                            onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg"
                            placeholder="Албан тушаал"
                          />
                    </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Компани *</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg"
                            placeholder="Компани"
                          />
                  </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Эхлэх огноо</label>
                          <input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg"
                          />
              </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Дуусах огноо</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="month"
                              value={exp.endDate}
                              onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                              disabled={exp.current}
                              className="flex-1 px-3 py-2 text-gray-700 border border-gray-300 rounded-lg disabled:bg-gray-100"
                            />
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={exp.current}
                                onChange={(e) => updateExperience(exp.id, "current", e.target.checked)}
                                className="rounded"
                              />
                              Одоо
                            </label>
              </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Тайлбар</label>
                          <textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg"
                            placeholder="Ажлын тайлбар..."
                          />
                        </div>
                      </div>
                      {experiences.length > 1 && (
                <button
                          onClick={() => removeExperience(exp.id)}
                          className="mt-2 text-red-600 hover:text-red-800 text-sm"
                >
                          Устгах
                </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addExperience}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <PlusIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">+ Add employment</span>
                  </button>
                </div>
                  );
                }
                if (sectionKey === "skills") {
                  return renderCollapsibleSection(
                    "skills",
                    "Ур чадвар",
                <div className="space-y-3">
                  {skills.map((skill) => (
                    <div key={skill.id} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => updateSkill(skill.id, "name", e.target.value)}
                        className="flex-1 px-3 py-2 text-gray-700 border border-gray-300 rounded-lg"
                        placeholder="Ур чадварын нэр"
                      />
                      <select
                        value={skill.level}
                        onChange={(e) => updateSkill(skill.id, "level", e.target.value as Skill["level"])}
                        className="px-3 py-2 text-gray-700 border border-gray-300 rounded-lg"
                      >
                        <option value="beginner">Эхлэгч</option>
                        <option value="intermediate">Дунд</option>
                        <option value="advanced">Дэвшилтэт</option>
                        <option value="expert">Мэргэжилтэн</option>
                      </select>
                      {skills.length > 1 && (
                  <button
                          onClick={() => removeSkill(skill.id)}
                          className="text-red-600 hover:text-red-800"
                  >
                          <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
                  ))}
                  <button
                    onClick={addSkill}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <PlusIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">+ Add skill</span>
                  </button>
            </div>
                  );
                }
                if (sectionKey === "languages") {
                  return renderCollapsibleSection(
                    "languages",
                    "Хэлний мэдлэг",
                    <div className="space-y-4">
                      {/* AI Suggestions Header */}
                      <div className="flex items-center justify-end gap-2 mb-3">
                        <button
                          onClick={fetchLanguageSuggestions}
                          disabled={loadingSuggestions}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                          AI Suggestions
                        </button>
                        {suggestedLanguages.length > 0 && (
                          <button
                            onClick={fetchLanguageSuggestions}
                            disabled={loadingSuggestions}
                            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Refresh suggestions"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        )}
                      </div>

                        {(() => {
                         const sortedLangs = [...languages].sort((a, b) => {
                           // Filled languages go to top, empty ones to bottom
                           const aFilled = a.name.trim().length > 0 ? 1 : 0;
                           const bFilled = b.name.trim().length > 0 ? 1 : 0;
                           return bFilled - aFilled;
                         });
                        const emptyLangs = sortedLangs.filter(l => !l.name.trim());
                        const lastEmptyId = emptyLangs.length > 0 ? emptyLangs[emptyLangs.length - 1].id : null;
                        
                        return sortedLangs.map((lang) => {
                          const isEmpty = !lang.name.trim();
                          // Check if this is the last empty language field
                          const isLastEmpty = isEmpty && lastEmptyId === lang.id;
                          
                          return (
                            <div key={lang.id} className="space-y-3">
                              <div className="flex items-end gap-4">
                                <div className="flex-1">
                                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Хэл</label>
                                  <input
                                    type="text"
                                    value={lang.name}
                                    onChange={(e) => updateLanguage(lang.id, "name", e.target.value)}
                                    className="w-full px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    placeholder="Хэл"
                                  />
                                </div>
                                <div className="flex-1">
                                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Түвшин</label>
                                  <select
                                    value={lang.level}
                                    onChange={(e) => updateLanguage(lang.id, "level", e.target.value as Language["level"])}
                                    className="w-full px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                  >
                                    <option value="">Сонгох</option>
                                    <option value="Уншдаг">Уншдаг</option>
                                    <option value="Бичдэг">Бичдэг</option>
                                    <option value="Ярьдаг">Ярьдаг</option>
                                  </select>
                                </div>
                                {languages.length > 1 && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      removeLanguage(lang.id, e);
                                    }}
                                    onMouseDown={(e) => e.preventDefault()}
                                    className="text-red-600 hover:text-red-800 transition-colors mb-1.5"
                                    title="Устгах"
                                  >
                                    <TrashIcon className="w-5 h-5" />
                                  </button>
                                )}
                              </div>
                              
                              {/* Suggested Languages below input - only show for the last empty language field */}
                              {isEmpty && isLastEmpty && suggestedLanguages.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {suggestedLanguages
                                    .filter(suggestedLang => !languages.some(l => l.name.toLowerCase() === suggestedLang.toLowerCase()))
                                    .map((suggestedLang, index) => (
                                    <button
                                      key={index}
                                      onClick={() => addSuggestedLanguage(suggestedLang)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-full text-sm font-medium transition-colors border border-gray-200 hover:border-blue-300"
                                    >
                                      <span className="text-blue-600">+</span>
                                      {suggestedLang}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}

                      {/* Add Language Button */}
                      <button
                        onClick={addLanguage}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <PlusIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">+ Add language</span>
                      </button>
                    </div>
                  );
                }
                if (sectionKey === "hobbies") {
                  return renderCollapsibleSection(
                    "hobbies",
                    "Хобби",
                    <div className="space-y-3">
                      {[...hobbies]
                        .sort((a, b) => {
                          const aFilled = a.name.trim().length > 0 ? 1 : 0;
                          const bFilled = b.name.trim().length > 0 ? 1 : 0;
                          return bFilled - aFilled;
                        })
                        .map((hobby) => (
                          <div key={hobby.id} className="flex items-center gap-3">
                            <input
                              type="text"
                              value={hobby.name}
                              onChange={(e) => updateHobby(hobby.id, "name", e.target.value)}
                              className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              placeholder="Хобби"
                            />
                            {hobbies.length > 1 && (
                              <button
                                onClick={() => removeHobby(hobby.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        ))}
                      <button
                        onClick={addHobby}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <PlusIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">+ Add hobby</span>
                      </button>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        {showSidebarPreview && (
          <div className="w-1/2 overflow-y-auto bg-gray-50 border-l border-gray-200 flex-shrink-0" style={{ maxHeight: '100%' }}>
          {/* Sticky Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">CV Preview</h2>
                <p className="text-xs text-gray-500 mt-1">Real-time preview</p>
              </div>
              <div className="flex items-center gap-2">
              <button
                  onClick={() => setTemplate("modern")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    template === "modern"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Modern
                </button>
                <button
                  onClick={() => setTemplate("classic")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    template === "classic"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Classic
              </button>
            </div>
            </div>
          </div>

          {/* Preview Content */}
          <div className="p-6">
            <div className="w-full max-w-4xl mx-auto">
              {/* Main Preview Card */}
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                {/* CV Content */}
                <div className="bg-white overflow-auto">
                  <div className="transform scale-[0.9] origin-top" style={{ transformOrigin: 'top center' }}>
                    {renderCVPreview()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">3x4 Зураг Crop хийх</h3>
              <button
                onClick={cancelCrop}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="relative w-full" style={{ height: "400px", backgroundColor: "#333" }}>
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={3 / 4}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="rect"
              />
            </div>

            <div className="mt-4 flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Zoom:</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-600">{zoom.toFixed(1)}x</span>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={cancelCrop}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Цуцлах
              </button>
              <button
                onClick={createCroppedImage}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Хадгалах
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
