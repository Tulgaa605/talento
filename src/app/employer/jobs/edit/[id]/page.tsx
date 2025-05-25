"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { use } from "react";
import Link from "next/link";
import { MapPinIcon } from "@heroicons/react/24/outline";

const SKILLS_LIST = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "C#",
  "C++",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
  "Go",
  "Rust",
  "SQL",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "AWS",
  "Azure",
  "GCP",
  "Docker",
  "Kubernetes",
  "Linux",
  "Git",
  "HTML",
  "CSS",
  "SASS",
  "Redux",
  "Vue.js",
  "Angular",
  "Next.js",
  "GraphQL",
  "REST API",
  "Microservices",
  "DevOps",
  "CI/CD",
  "Testing",
  "Agile",
  "Scrum",
  "UI/UX Design",
  "Figma",
  "Adobe XD",
  "Photoshop",
  "Illustrator",
  "Project Management",
  "Technical Writing",
  "Documentation",
  "Communication",
  "Leadership",
  "Problem Solving",
];

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary: string;
  type: string;
  status: string;
  companyUrl?: string;
  contactPhone?: string;
  otherInfo?: string;
  skills?: string[];
}

export default function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentSkill, setCurrentSkill] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const resolvedParams = use(params);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (session?.user?.role !== "EMPLOYER") {
      router.push("/login");
      return;
    }
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/employer/jobs/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error("Ажлын байрны мэдээлэл олдсонгүй");
        }
        const data = await response.json();
        setJob({
          ...data,
          skills: Array.isArray(data.skills)
            ? data.skills
            : typeof data.skills === "string" && data.skills.length > 0
            ? data.skills.split(",").map((s: string) => s.trim())
            : [],
          companyUrl: data.companyUrl || "",
          contactPhone: data.contactPhone || "",
          otherInfo: data.otherInfo || "",
        });
      } catch (error) {
        setError("Ажлын байрны мэдээлэл ачаалахад алдаа гарлаа");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [resolvedParams.id, session]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setJob((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleAddSkill = () => {
    if (
      currentSkill.trim() &&
      job &&
      !job.skills?.includes(currentSkill.trim())
    ) {
      setJob({ ...job, skills: [...(job.skills || []), currentSkill.trim()] });
      setCurrentSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (job) {
      setJob({
        ...job,
        skills: (job.skills || []).filter((skill) => skill !== skillToRemove),
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!job) return;
    setSaving(true);
    setError("");
    setSuccessMessage("");
    try {
      const jobToSend = {
        ...job,
        skills: Array.isArray(job.skills)
          ? job.skills.join(",")
          : job.skills || "",
      };
      const response = await fetch(`/api/employer/jobs/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobToSend),
      });
      if (!response.ok) {
        throw new Error("Ажлын байрны мэдээлэл шинэчлэхэд алдаа гарлаа");
      }
      setSuccessMessage("Ажлын байр амжилттай шинэчлэгдлээ!");
      router.push("/employer/profile");
    } catch (error) {
      setError("Ажлын байрны мэдээлэл шинэчлэхэд алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Ачаалж байна...</div>
      </div>
    );
  }
  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">
          Ажлын байрны мэдээлэл олдсонгүй
        </div>
      </div>
    );
  }

  const inputBaseClass =
    "w-full text-sm text-slate-700 border border-slate-300 placeholder-slate-400  rounded-md focus:outline-none  focus:ring-gray-500 focus:border-gray-500";
  const inputPadding = "px-4 py-2.5";

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
              <div className="w-[201px] h-[201px] border border-slate-300 rounded-lg flex flex-col items-center justify-center p-4 flex-shrink-0 bg-slate-50">
                {/* Лого байрлуулах боломжтой хэсэг (optional) */}
              </div>
              {/* Input Fields Next to Logo */}
              <div className="flex-grow grid grid-cols-1 gap-y-4 content-start">
                <div>
                  <input
                    type="text"
                    name="title"
                    required
                    className={`${inputBaseClass} ${inputPadding}`}
                    placeholder="Албан тушаал..."
                    value={job.title}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <input
                    type="url"
                    name="companyUrl"
                    className={`${inputBaseClass} ${inputPadding}`}
                    placeholder="Байгууллагын линк URL"
                    value={job.companyUrl || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            {/* Job Details Area (Spans 4 columns) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="tel"
                    name="contactPhone"
                    className={`${inputBaseClass} ${inputPadding}`}
                    placeholder="Утас"
                    value={job.contactPhone || ""}
                    onChange={handleInputChange}
                  />
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
                      className={`${inputBaseClass} ${inputPadding} pl-10 appearance-none`}
                      value={job.location}
                      onChange={handleInputChange}
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
                  <input
                    type="text"
                    name="salary"
                    className={`${inputBaseClass} ${inputPadding}`}
                    placeholder="Үнэлгээ"
                    value={job.salary}
                    onChange={handleInputChange}
                  />
                </div>
                <select
                  name="type"
                  className={`${inputBaseClass} ${inputPadding}`}
                  value={job.type}
                  onChange={handleInputChange}
                >
                  <option value="">Ажлын цаг</option>
                  <option value="FULL_TIME">Бүтэн цагийн</option>
                  <option value="PART_TIME">Цагийн</option>
                  <option value="CONTRACT">Гэрээт</option>
                  <option value="INTERNSHIP">Дадлага</option>
                </select>
              </div>
            </div>
          </div>
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
            {/* Middle Section: Requirements Card */}
            <div className="rounded-lg mt-2">
              <textarea
                id="requirements"
                name="requirements"
                rows={10}
                required
                className={`${inputBaseClass} ${inputPadding}`}
                placeholder="Үндсэн тавигдах шаардлага: Ажилтанд тавигдах гол шаардлагууд, туршлага, боловсрол, ур чадварууд, гэрчилгээ зэргийг дэлгэрэнгүй бичнэ үү..."
                value={job.requirements}
                onChange={handleInputChange}
              />
            </div>
            <div className="rounded-lg">
              <textarea
                id="otherInfo"
                name="otherInfo"
                rows={10}
                className={`${inputBaseClass} ${inputPadding}`}
                placeholder="Бусад (Нэмэлт мэдээлэл): Ажлын байрны онцлог, компанийн соёл, ажиллах орчин, нөхцөл, хангамж, боломжууд болон бусад нэмэлт мэдээллийг энд оруулна уу..."
                value={job.otherInfo || ""}
                onChange={handleInputChange}
              />
            </div>
            {/* Skills Input */}

            <div className="flex flex-wrap gap-2 mt-2">
              {Array.isArray(job.skills) &&
                job.skills.map((skill) => (
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
          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3">
            <Link
              href="/employer/profile"
              className="px-5 py-2.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Буцах
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-70 transition-colors"
            >
              {saving ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
