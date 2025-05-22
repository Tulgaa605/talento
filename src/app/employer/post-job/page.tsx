"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  LinkIcon as UrlIcon, // Renamed for clarity
  PhoneIcon,
  ClockIcon, 
  BuildingOfficeIcon, 
  PhotoIcon,
  PlusCircleIcon,
  PaperAirplaneIcon,
  ArrowUturnLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TagIcon, 
  ListBulletIcon,
  PlusIcon,
  ServerStackIcon, // Placeholder for Talento Logo in Nav
  UserCircleIcon, // Placeholder for User Icon in Nav
  ComputerDesktopIcon, // Placeholder for AI icon
} from '@heroicons/react/24/outline';
import { JobType } from "@prisma/client";

// Helper component for Skill Tags
const SkillTag = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block text-slate-700 text-sm font-medium px-4 py-1.5 border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer">
    {children}
  </span>
);

// Placeholder for actual icons in the Nav
const AiIconPlaceholder = () => <ComputerDesktopIcon className="w-6 h-6 text-slate-700" />;
const UserIconPlaceholder = () => <UserCircleIcon className="w-7 h-7 text-slate-700" />;
const TalentoLogoNav = () => <ServerStackIcon className="w-7 h-7 text-slate-700" />;

// Add predefined skills list
const SKILLS_LIST = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "C#", "C++",
  "PHP", "Ruby", "Swift", "Kotlin", "Go", "Rust", "SQL", "MongoDB", "PostgreSQL",
  "MySQL", "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Linux", "Git",
  "HTML", "CSS", "SASS", "Redux", "Vue.js", "Angular", "Next.js", "GraphQL",
  "REST API", "Microservices", "DevOps", "CI/CD", "Testing", "Agile", "Scrum",
  "UI/UX Design", "Figma", "Adobe XD", "Photoshop", "Illustrator", "Project Management",
  "Technical Writing", "Documentation", "Communication", "Leadership", "Problem Solving"
];

export default function PostJobPageWithNewDesign() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
    requirements: "",
    otherInfo: "",
    companyUrl: "",
    contactPhone: "",
    workHours: "",
    type: "FULL_TIME" as JobType,
    skills: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSkill, setCurrentSkill] = useState("");

  const filteredSkills = SKILLS_LIST.filter(skill =>
    skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSkillSelect = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSkillRemove = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    const formDataObj = new FormData(e.currentTarget);
    const requirements = formDataObj.get("requirements") as string;
    const data = {
      title: formDataObj.get("title") as string,
      description: requirements,
      location: formDataObj.get("location") as string,
      requirements: requirements,
      salary: formDataObj.get("salary") as string,
      workHours: formDataObj.get("workHours") as string,
      type: formDataObj.get("type") as string,
      companyUrl: formDataObj.get("companyUrl") as string,
      contactPhone: formDataObj.get("contactPhone") as string,
      otherInfo: formDataObj.get("otherInfo") as string,
      skills: formData.skills,
    };

    // Validate required fields
    if (!data.title || !data.description || !data.location || !data.requirements) {
      setError("Бүх шаардлагатай талбаруудыг бөглөнө үү");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/employer/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(errorData.message || "Ажлын байр нийтлэхэд алдаа гарлаа.");
      }
      setSuccessMessage("Ажлын байр амжилттай нийтлэгдлээ!");
      if (formRef.current) {
        formRef.current.reset();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Тодорхойгүй алдаа гарлаа.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputBaseClass = "w-full text-sm text-slate-700 border border-slate-300 placeholder-slate-400  rounded-md focus:outline-none  focus:ring-gray-500 focus:border-gray-500";
  const inputPadding = "px-4 py-2.5"; 
  const labelBaseClass = "text-sm font-poppins text-slate-700";

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <main className="max-w-[1420px] mx-auto px-21 py-10 sm:py-12 mt-15">
        {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-3 rounded-md shadow">
                <p className="text-sm text-red-700">{error}</p>
            </div>
        )}
        {successMessage && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-3 rounded-md shadow">
                <p className="text-sm text-green-700">{successMessage}</p>
            </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {/* Top Section: Core Info + Skills */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            {/* Logo and Small Fields Area (Spans 3 columns) */}
            <div className="lg:col-span-3 flex gap-6">
                {/* Logo Area */} 
                <div 
                    className="w-[201px] h-[201px] border border-slate-300 rounded-lg flex flex-col items-center justify-center p-4 flex-shrink-0 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                </div>
                {/* Input Fields Next to Logo */} 
                <div className="flex-grow grid grid-cols-1 gap-y-4 content-start">
                    <div>
                        <input type="text" name="title" required className={`${"w-full text-sm text-slate-700 border border-slate-300 placeholder-slate-400  rounded-md focus:outline-none  focus:ring-gray-500 focus:border-gray-500"} ${inputPadding}`} placeholder="Албан тушаал..."/>
                    </div>
                    <div>
                        <input type="url" name="companyUrl" className={`${"w-full text-sm text-slate-700 border border-slate-300 placeholder-slate-400  rounded-md focus:outline-none  focus:ring-gray-500 focus:border-gray-500"} ${inputPadding}`} placeholder="Байгууллагын линк URL"/>
                    </div>
                </div>
            </div>

            {/* Job Details Area (Spans 4 columns) */}
            <div className="lg:col-span-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <input type="tel" name="contactPhone" className={`${"w-full text-sm text-slate-700 border border-slate-300 placeholder-slate-400  rounded-md focus:outline-none  focus:ring-gray-500 focus:border-gray-500"} ${inputPadding}`} placeholder="Утас"/>
                    </div>
                    <div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPinIcon className="h-4 w-4 text-slate-400" />
                            </div>
                            <select 
                                name="location" 
                                id="location" 
                                required 
                                className={`${"w-full text-sm text-slate-700 border border-slate-300 placeholder-slate-400  rounded-md focus:outline-none  focus:ring-gray-500 focus:border-gray-500"} ${inputPadding} pl-10 appearance-none`}
                            >
                                <option value="">Байршил сонгоно уу</option>
                                <option value="Улаанбаатар">Улаанбаатар</option>
                                <option value="Алсын зайнаас">Алсын зайнаас</option>
                                <option value="Архангай аймаг">Архангай аймаг</option>
                                <option value="Баян-Өлгий аймаг">Баян-Өлгий аймаг</option>
                                <option value="Баянхонгор аймаг">Баянхонгор аймаг</option>
                                <option value="Булган аймаг">Булган аймаг</option>
                                <option value="Говь-Алтай аймаг">Говь-Алтай аймаг</option>
                                <option value="Говьсүмбэр аймаг">Говьсүмбэр аймаг</option>
                                <option value="Дархан-Уул аймаг">Дархан-Уул аймаг</option>
                                <option value="Дорноговь аймаг">Дорноговь аймаг</option>
                                <option value="Дорнод аймаг">Дорнод аймаг</option>
                                <option value="Дундговь аймаг">Дундговь аймаг</option>
                                <option value="Завхан аймаг">Завхан аймаг</option>
                                <option value="Орхон аймаг">Орхон аймаг</option>
                                <option value="Өвөрхангай аймаг">Өвөрхангай аймаг</option>
                                <option value="Өмнөговь аймаг">Өмнөговь аймаг</option>
                                <option value="Сүхбаатар аймаг">Сүхбаатар аймаг</option>
                                <option value="Сэлэнгэ аймаг">Сэлэнгэ аймаг</option>
                                <option value="Төв аймаг">Төв аймаг</option>
                                <option value="Увс аймаг">Увс аймаг</option>
                                <option value="Ховд аймаг">Ховд аймаг</option>
                                <option value="Хөвсгөл аймаг">Хөвсгөл аймаг</option>
                                <option value="Хэнтий аймаг">Хэнтий аймаг</option>
                                <option value="Дархан">Дархан (хот)</option>
                                <option value="Эрдэнэт">Эрдэнэт (хот)</option>
                                <option value="Чойбалсан">Чойбалсан (хот)</option>
                                <option value="Мөрөн">Мөрөн (хот)</option>
                                <option value="Ховд">Ховд (хот)</option>
                                <option value="Улаангом">Улаангом (хот)</option>
                                <option value="Баянхонгор">Баянхонгор (хот)</option>
                                <option value="Арвайхээр">Арвайхээр (хот)</option>
                                <option value="Сүхбаатар">Сүхбаатар (хот)</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <input type="text" name="salary" className={`${"w-full text-sm text-slate-700 border border-slate-300 placeholder-slate-400  rounded-md focus:outline-none  focus:ring-gray-500 focus:border-gray-500"} ${inputPadding}`} placeholder="Үнэлгээ"/>
                    </div>
                    <select name="type" className={`${"w-full text-sm text-slate-700 border border-slate-300 placeholder-slate-400 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500"} ${inputPadding}`}>
                        <option value="">Ажлын цаг</option>
                        <option value="FULL_TIME">Бүтэн цагийн</option>
                        <option value="PART_TIME">Цагийн</option>
                        <option value="CONTRACT">Гэрээт</option>
                        <option value="INTERNSHIP">Дадлага</option>
                    </select>
                </div>
            </div>
          </div>

          {/* Middle Section: Requirements Card */}
          <div className=" rounded-lg mt-2">
            {/* <label htmlFor="requirements" className={`${labelBaseClass} font-medium mb-2 block`}>Үндсэн тавигдах шаардлага <span className="text-red-500">*</span></label> */}
            <textarea 
              id="requirements" 
              name="requirements" 
              rows={10} 
              required 
              className={`${inputBaseClass} ${inputPadding}`}
              placeholder="Үндсэн тавигдах шаардлага: Ажилтанд тавигдах гол шаардлагууд, туршлага, боловсрол, ур чадварууд, гэрчилгээ зэргийг дэлгэрэнгүй бичнэ үү..."
            />
          </div>
          <div className=" rounded-lg">
            <textarea 
              id="otherInfo" 
              name="otherInfo" 
              rows={10} 
              className={`${inputBaseClass} ${inputPadding}`}
              placeholder="Бусад (Нэмэлт мэдээлэл): Ажлын байрны онцлог, компанийн соёл, ажиллах орчин, нөхцөл, хангамж, боломжууд болон бусад нэмэлт мэдээллийг энд оруулна уу..."
            />
          </div>

          {/* Skills Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Шаардлагатай ур чадвар
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ур чадвар нэмэх"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Нэмэх
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-green-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

           {/* Submit Buttons - You might want to place these more prominently or differently */}
            <div className="flex justify-end space-x-3">
                <Link
                    href="/employer/profile" 
                    className="px-5 py-2.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    Буцах
                </Link>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-70 transition-colors"
                >
                    {isLoading ? "Илгээж байна..." : "Нийтлэх"}
                </button>
            </div>
        </form>
      </main>
    </div>
  );
}
