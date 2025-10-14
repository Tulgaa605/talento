"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/24/solid";
import { FiEdit, FiMapPin } from "react-icons/fi";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useNotification } from "@/providers/NotificationProvider";
import GovernmentEmployeeQuestionnaire from "@/components/GovernmentEmployeeQuestionnaire";

interface Company {
  id: string;
  name: string;
  description: string;
  location: string;
  website: string;
  logoUrl?: string;
  coverImageUrl?: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  type: string;
  status: string;
  createdAt: string;
  requirements?: string;
}

interface Question {
  id: string;
  text: string;
  type: "TEXT" | "MULTIPLE_CHOICE" | "SINGLE_CHOICE";
  required: boolean;
  options: string[];
  order: number;
}

interface Questionnaire {
  id: string;
  title: string;
  description?: string;
  attachmentFile?: string;
  attachmentUrl?: string;
  questions: Question[];
  createdAt: string;
}

interface QuestionnaireResponse {
  id: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  answers: {
    question: {
      text: string;
      type: string;
    };
    value: string;
  }[];
}

interface CV {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
  status?: "PENDING" | "ACCEPTED" | "REJECTED";
  user: {
    id: string;
    name: string;
    email: string;
  };
}

type ApplicationStatus =
  | "PENDING"
  | "EMPLOYER_APPROVED"
  | "ADMIN_APPROVED"
  | "REJECTED";

interface EmployerApplication {
  id: string;
  createdAt: string;
  status?: ApplicationStatus;
  user: { name: string; email: string };
  cv: { fileUrl: string };
}

type QuestionField = "text" | "type" | "required" | "options";
type QuestionFieldValue =
  | string
  | boolean
  | string[]
  | "TEXT"
  | "MULTIPLE_CHOICE"
  | "SINGLE_CHOICE";

export default function EmployerProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addNotification } = useNotification();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCompany, setEditedCompany] = useState<Company | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [, setLogoPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("jobs");
  const [applications, setApplications] = useState<EmployerApplication[]>([]);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutEdit, setAboutEdit] = useState({
    name: company?.name || "",
    location: company?.location || "",
    website: company?.website || "",
    description: company?.description || "",
  });
  const [, setNewApplicationsCount] = useState(0);
  const [, setError] = useState<string | null>(null);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [isCreatingQuestionnaire, setIsCreatingQuestionnaire] = useState(false);
  const [newQuestionnaire, setNewQuestionnaire] = useState({
    title: "",
    description: "",
    questions: [] as Question[],
  });
  const [editingQuestionnaire, setEditingQuestionnaire] =
    useState<Questionnaire | null>(null);
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<
    string | null
  >(null);
  const [, setCvs] = useState<CV[]>([]);
  const [selectedCV, setSelectedCV] = useState<string | null>(null);
  const [isSendingQuestionnaire, setIsSendingQuestionnaire] = useState(false);
  const [selectedTemplateFile, setSelectedTemplateFile] =
    useState<File | null>(null);
  const [uploadedTemplateFile, setUploadedTemplateFile] = useState<{
    fileName: string;
    fileUrl: string;
  } | null>(null);
  const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);
  const [
    isCreatingGovernmentQuestionnaire,
    setIsCreatingGovernmentQuestionnaire,
  ] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && !hasLoaded) {
      if (
        ["EMPLOYER", "ADMIN"].includes(
          (session?.user as { role?: string } | undefined)?.role ?? ""
        )
      ) {
        fetchCompanyAndJobs();
        setHasLoaded(true);
      } else {
        router.push("/login");
      }
    }
  }, [status, session, hasLoaded, router]);

  useEffect(() => {
    if (company) {
      setEditedCompany(company);
    }
  }, [company]);

  useEffect(() => {
    if (activeTab === "anketuud") {
      const fetchApplications = async () => {
        try {
          const res = await fetch("/api/employer/applications");
          const text = await res.text();
          if (!text) {
            setApplications([]);
          } else {
            const data: EmployerApplication[] = JSON.parse(text);
            setApplications(data);
          }
        } catch {
          setApplications([]);
        }
      };
      fetchApplications();
    }
  }, [activeTab]);

  useEffect(() => {
    setAboutEdit({
      name: company?.name || "",
      location: company?.location || "",
      website: company?.website || "",
      description: company?.description || "",
    });
  }, [company]);

  useEffect(() => {
    const fetchNewCount = async () => {
      try {
        const res = await fetch("/api/employer/applications/new-count");
        if (res.ok) {
          const text = await res.text();
          if (!text) {
            setNewApplicationsCount(0);
          } else {
            const data = JSON.parse(text) as { count?: number };
            setNewApplicationsCount(data.count || 0);
          }
        }
      } catch {
        setNewApplicationsCount(0);
      }
    };
    fetchNewCount();
  }, []);

  const fetchQuestionnaires = useCallback(async () => {
    try {
      if (!company?.id) {
        setQuestionnaires([]);
        return;
      }
      const response = await fetch(
        `/api/employer/questionnaires?companyId=${company.id}`
      );
      const text = await response.text();

      if (!response.ok) {
        throw new Error("Асуулга татахад алдаа гарлаа");
      }
      if (!text) {
        setQuestionnaires([]);
        return;
      }
      const data: Questionnaire[] = JSON.parse(text);
      setQuestionnaires(data);
    } catch (error) {
      console.error("Error fetching questionnaires:", error);
      setQuestionnaires([]);
      setError("Асуулга татахад алдаа гарлаа. Дараа дахин оролдоно уу.");
    }
  }, [company?.id]);

  useEffect(() => {
    if (company) {
      fetchQuestionnaires();
    }
  }, [company, fetchQuestionnaires]);

  useEffect(() => {
    if (activeTab === "responses" && selectedQuestionnaire) {
      fetchResponses(selectedQuestionnaire);
    }
  }, [activeTab, selectedQuestionnaire]);

  useEffect(() => {
    if (activeTab === "anketuud") {
      fetchCVs();
    }
  }, [activeTab]);

  const fetchCompanyAndJobs = async () => {
    try {
      const companyRes = await fetch("/api/employer/company");
      const text = await companyRes.text();
      if (!text) {
        throw new Error("Хоосон хариу ирлээ");
      }
      const companyData: Company = JSON.parse(text);
      setCompany(companyData);
      const jobsRes = await fetch("/api/employer/jobs");
      const textJobs = await jobsRes.text();
      if (!textJobs) {
        setJobs([]);
      } else {
        const jobsData: Job[] = JSON.parse(textJobs);
        setJobs(jobsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      let logoUrl = company?.logoUrl;

      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);
        const uploadRes = await fetch("/api/upload/company-logo", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload logo");
        }

        const text = await uploadRes.text();
        if (!text) {
          throw new Error("Хоосон хариу ирлээ");
        }
        const uploadData = JSON.parse(text) as { url: string };
        logoUrl = uploadData.url;
      }

      const response = await fetch("/api/employer/company/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editedCompany?.name,
          location: editedCompany?.location,
          logoUrl: logoUrl,
          description: editedCompany?.description,
          website: editedCompany?.website,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update company profile");
      }

      const textUpdatedCompany = await response.text();
      if (!textUpdatedCompany) {
        throw new Error("Хоосон хариу ирлээ");
      }
      const updatedCompany: Company = JSON.parse(textUpdatedCompany);
      setCompany(updatedCompany);
      setIsEditing(false);
      setLogoFile(null);
      setLogoPreview(null);

      alert("Профайл амжилттай шинэчлэгдлээ");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Профайл шинэчлэхэд алдаа гарлаа. Дараа дахин оролдоно уу.");
    }
  };

  const handleEdit = (jobId: string) => {
    router.push(`/employer/jobs/edit/${jobId}`);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm("Энэ ажлын байрыг устгахдаа итгэлтэй байна уу?")) {
      try {
        const response = await fetch(`/api/employer/jobs/${jobId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setJobs(jobs.filter((job) => job.id !== jobId));
          alert("Ажлын байр амжилттай устгагдлаа");
        } else {
          alert("Ажлын байрыг устгахад алдаа гарлаа");
        }
      } catch (error) {
        console.error("Error deleting job:", error);
        alert("Ажлын байрыг устгахад алдаа гарлаа");
      }
    }
  };

  const handleAboutSave = async () => {
    try {
      const response = await fetch("/api/employer/company/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aboutEdit),
      });
      if (!response.ok) throw new Error("Failed to update company info");
      const textUpdated = await response.text();
      if (!textUpdated) {
        throw new Error("Хоосон хариу ирлээ");
      }
      const updated: Company = JSON.parse(textUpdated);
      setCompany(updated);
      setIsEditingAbout(false);
    } catch {
      alert("Шинэчлэхэд алдаа гарлаа");
    }
  };

  const fetchResponses = async (questionnaireId: string) => {
    try {
      const response = await fetch(
        `/api/employer/questionnaires/${questionnaireId}/responses`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch responses");
      }
      const data: QuestionnaireResponse[] = await response.json();
      setResponses(data);
    } catch (error) {
      console.error("Error fetching responses:", error);
      setError("Хариултуудыг татахад алдаа гарлаа. Дараа дахин оролдоно уу.");
      setResponses([]);
    }
  };

  const fetchCVs = async () => {
    try {
      const response = await fetch("/api/employer/cvs");
      if (!response.ok) throw new Error("Failed to fetch CVs");
      const data: CV[] = await response.json();
      setCvs(data);
    } catch (error) {
      console.error("Error fetching CVs:", error);
    }
  };

  const handleAddQuestion = () => {
    setNewQuestionnaire((prev) => (prev
      ? {
          ...prev,
          questions: [
            ...prev.questions,
            {
              id: Date.now().toString(),
              text: "",
              type: "TEXT",
              required: false,
              options: [],
              order: prev.questions.length,
            },
          ],
        }
      : prev));
  };

  const handleQuestionChange = (
    questionId: string,
    field: QuestionField,
    value: QuestionFieldValue
  ) => {
    setNewQuestionnaire((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, [field]: value as never } : q
      ),
    }));
  };

  const handleDeleteQuestion = (questionId: string) => {
    setNewQuestionnaire((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
    }));
  };

  const handleTemplateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "application/vnd.ms-word",
        "application/pdf",
      ];

      if (!validTypes.includes(file.type)) {
        setError("Зөвхөн Word файл (.doc, .docx) болон PDF файл оруулна уу");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("Файлын хэмжээ 10MB-аас их байж болохгүй");
        return;
      }

      setSelectedTemplateFile(file);
      setError(null);
    }
  };

  const handleTemplateFileUpload = async () => {
    if (!selectedTemplateFile) return;

    setIsUploadingTemplate(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedTemplateFile);

      const response = await fetch(
        "/api/employer/questionnaires/upload-attachment",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Файл хадгалахад алдаа гарлаа");
      }

      const data = await response.json();
      setUploadedTemplateFile({
        fileName: data.fileName as string,
        fileUrl: data.fileUrl as string,
      });
      setSelectedTemplateFile(null);
      addNotification("Файл амжилттай хадгалагдлаа", "success");
    } catch (error) {
      console.error("Error uploading template file:", error);
      addNotification(
        "Файл хадгалахад алдаа гарлаа. Дахин оролдоно уу.",
        "error"
      );
    } finally {
      setIsUploadingTemplate(false);
    }
  };

  const startEditingQuestionnaire = (questionnaireId: string) => {
    const questionnaire = questionnaires.find((q) => q.id === questionnaireId);
    if (!questionnaire) return;

    setEditingQuestionnaire(questionnaire);
    setNewQuestionnaire({
      title: questionnaire.title,
      description: questionnaire.description || "",
      questions: questionnaire.questions,
    });
  };

  const handleEditQuestionnaire = async () => {
    try {
      if (!editingQuestionnaire) return;

      const response = await fetch("/api/employer/questionnaires", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingQuestionnaire.id,
          title: editingQuestionnaire.title,
          description: editingQuestionnaire.description,
          attachmentFile:
            uploadedTemplateFile?.fileName ||
            editingQuestionnaire.attachmentFile,
          attachmentUrl:
            uploadedTemplateFile?.fileUrl ||
            editingQuestionnaire.attachmentUrl,
          questions: editingQuestionnaire.questions.map((q, index) => ({
            ...q,
            order: index,
          })),
        }),
      });

      const data: Questionnaire & { questions: Question[] } =
        await response.json();

      if (!response.ok) {
        throw new Error(
          (data as unknown as { error?: string; details?: string }).error ||
            (data as unknown as { error?: string; details?: string }).details ||
            "Асуулга засахад алдаа гарлаа"
        );
      }

      setQuestionnaires((prev) =>
        prev.map((q) => (q.id === editingQuestionnaire.id ? data : q))
      );
      setEditingQuestionnaire(null);
      setUploadedTemplateFile(null);
      setSelectedTemplateFile(null);
      addNotification("Асуулга амжилттай засагдлаа", "success");
    } catch (error) {
      console.error("Error updating questionnaire:", error);
      addNotification(
        error instanceof Error ? error.message : "Асуулга засахад алдаа гарлаа",
        "error"
      );
    }
  };

  const handleCreateQuestionnaire = async () => {
    try {
      if (!company?.id) {
        throw new Error("Компанийн мэдээлэл олдсонгүй");
      }

      const response = await fetch("/api/employer/questionnaires", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newQuestionnaire,
          companyId: company.id,
          attachmentFile: uploadedTemplateFile?.fileName,
          attachmentUrl: uploadedTemplateFile?.fileUrl,
          questions: newQuestionnaire.questions.map((q, index) => ({
            ...q,
            order: index,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error || "Асуулга үүсгэхэд алдаа гарлаа");
      }

      const data: Questionnaire = await response.json();
      setQuestionnaires((prev) => [...prev, data]);
      setIsCreatingQuestionnaire(false);
      setNewQuestionnaire({
        title: "",
        description: "",
        questions: [],
      });
      setUploadedTemplateFile(null);
      setSelectedTemplateFile(null);
      addNotification("Асуулга амжилттай үүслээ", "success");
    } catch (error) {
      console.error("Error creating questionnaire:", error);
      addNotification(
        error instanceof Error ? error.message : "Асуулга үүсгэхэд алдаа гарлаа",
        "error"
      );
    }
  };

  const handleCreateGovernmentQuestionnaire = async (formData: unknown) => {
    if (formData && false) { /* never runs */ }
    try {
      if (!company?.id) {
        throw new Error("Компанийн мэдээлэл олдсонгүй");
      }

      // Параметрийг ашиглах (дуудлага хэвээр, доор функц параметргүй болсон)
      const questions = convertGovernmentFormToQuestions();

      const response = await fetch("/api/employer/questionnaires", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Төрийн албан хаагчийн анкет",
          description: "Монгол улсын төрийн албан хаагчийн анкет маягт",
          type: "GOVERNMENT_EMPLOYEE",
          questions: questions,
          companyId: company.id,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(
          errorData.error || "Төрийн анкет үүсгэхэд алдаа гарлаа"
        );
      }

      const data: Questionnaire = await response.json();
      setQuestionnaires((prev) => [...prev, data]);
      setIsCreatingGovernmentQuestionnaire(false);
      addNotification("Төрийн анкет амжилттай үүсгэгдлээ", "success");
    } catch (error) {
      console.error("Error creating government questionnaire:", error);
      addNotification(
        error instanceof Error ? error.message : "Төрийн анкет үүсгэхэд алдаа гарлаа",
        "error"
      );
    }
  };

  // ⬇️ Параметргүй болгосон — ашигладаггүй байсан тул no-unused-vars зассан
  const convertGovernmentFormToQuestions = (): Question[] => {
    const questions: Question[] = [];
    let order = 1;

    questions.push({
      id: `${Date.now()}-1`,
      text: "Эцэг/эх/-ийн нэр",
      type: "TEXT",
      required: true,
      options: [],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-2`,
      text: "Нэр",
      type: "TEXT",
      required: true,
      options: [],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-3`,
      text: "Хүйс",
      type: "SINGLE_CHOICE",
      required: true,
      options: ["Эрэгтэй", "Эмэгтэй"],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-4`,
      text: "Төрсөн он",
      type: "TEXT",
      required: true,
      options: [],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-5`,
      text: "Төрсөн сар",
      type: "TEXT",
      required: true,
      options: [],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-6`,
      text: "Төрсөн аймаг, хот",
      type: "TEXT",
      required: true,
      options: [],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-7`,
      text: "Төрсөн сум, дүүрэг",
      type: "TEXT",
      required: true,
      options: [],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-8`,
      text: "Төрсөн газар",
      type: "TEXT",
      required: true,
      options: [],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-9`,
      text: "Овог",
      type: "TEXT",
      required: true,
      options: [],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-10`,
      text: "Үндэс, угсаа",
      type: "TEXT",
      required: true,
      options: [],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-11`,
      text: "Нийгмийн гарал",
      type: "TEXT",
      required: true,
      options: [],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-12`,
      text: "Оршин суугаа аймаг, хот",
      type: "TEXT",
      required: true,
      options: [],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-13`,
      text: "Оршин суугаа сум, дүүрэг",
      type: "TEXT",
      required: true,
      options: [],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-14`,
      text: "Гэрийн хаяг",
      type: "TEXT",
      required: true,
      options: [],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-15`,
      text: "Утасны дугаар",
      type: "TEXT",
      required: true,
      options: [],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-16`,
      text: "Үүрэн утасны дугаар",
      type: "TEXT",
      required: false,
      options: [],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-17`,
      text: "И-мэйл хаяг",
      type: "TEXT",
      required: false,
      options: [],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-18`,
      text: "Сургуулийн нэр (сүүлийн боловсрол)",
      type: "TEXT",
      required: true,
      options: [],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-19`,
      text: "Эзэмшсэн боловсрол, мэргэжил",
      type: "TEXT",
      required: true,
      options: [],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-20`,
      text: "Төгссөн он, сар",
      type: "TEXT",
      required: true,
      options: [],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-21`,
      text: "Өөрийгөө танин мэдэх ур чадвар (1-3 оноо)",
      type: "SINGLE_CHOICE",
      required: true,
      options: ["1 - Муу", "2 - Дунд", "3 - Сайн"],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-22`,
      text: "Стрессээ тайлах ур чадвар (1-3 оноо)",
      type: "SINGLE_CHOICE",
      required: true,
      options: ["1 - Муу", "2 - Дунд", "3 - Сайн"],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-23`,
      text: "Асуудлыг бүтээлчээр шийдвэрлэх ур чадвар (1-3 оноо)",
      type: "SINGLE_CHOICE",
      required: true,
      options: ["1 - Муу", "2 - Дунд", "3 - Сайн"],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-24`,
      text: "Гадаад хэлний мэдлэг (хэрэв байвал)",
      type: "TEXT",
      required: false,
      options: [],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-25`,
      text: "Эзэмшсэн программын нэр",
      type: "TEXT",
      required: false,
      options: [],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-26`,
      text: "Компьютерийн ур чадварын түвшин",
      type: "SINGLE_CHOICE",
      required: true,
      options: ["Дунд", "Сайн", "Онц"],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-27`,
      text: "Сүүлийн ажилласан байгууллагын нэр",
      type: "TEXT",
      required: true,
      options: [],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-28`,
      text: "Албан тушаал",
      type: "TEXT",
      required: true,
      options: [],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-29`,
      text: "Ажилд орсон он, сар",
      type: "TEXT",
      required: true,
      options: [],
      order: order++,
    });

    questions.push({
      id: `${Date.now()}-30`,
      text: "Ажлаас гарсан он, сар (хэрэв гарсан бол)",
      type: "TEXT",
      required: false,
      options: [],
      order: order++,
    });

    return questions;
  };

  const handleDeleteQuestionnaire = async (questionnaireId: string) => {
    if (!window.confirm("Энэ асуулгыг устгахдаа итгэлтэй байна уу?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/employer/questionnaires?id=${questionnaireId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = (await response.json()) as {
        error?: string;
        details?: string;
      };

      if (!response.ok) {
        throw new Error(
          data.error || data.details || "Асуулга устгахад алдаа гарлаа"
        );
      }

      setQuestionnaires((prev) => prev.filter((q) => q.id !== questionnaireId));
      addNotification("Асуулга амжилттай устгагдлаа", "success");
    } catch (error) {
      console.error("Error deleting questionnaire:", error);
      addNotification(
        error instanceof Error ? error.message : "Асуулга устгахад алдаа гарлаа",
        "error"
      );
    }
  };

  const handleApproveCV = async (cvId: string) => {
    try {
      const response = await fetch(`/api/employer/cvs/${cvId}/approve`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to approve CV");

      setCvs((prev) =>
        prev.map((cv) => (cv.id === cvId ? { ...cv, status: "ACCEPTED" } : cv))
      );
    } catch (error) {
      console.error("Error approving CV:", error);
    }
  };

  const handleRejectCV = async (cvId: string) => {
    try {
      const response = await fetch(`/api/employer/cvs/${cvId}/reject`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to reject CV");

      setCvs((prev) =>
        prev.map((cv) => (cv.id === cvId ? { ...cv, status: "REJECTED" } : cv))
      );
    } catch (error) {
      console.error("Error rejecting CV:", error);
    }
  };

  const handleSendQuestionnaire = async (applicationId: string) => {
    if (!selectedQuestionnaire) return;

    try {
      setIsSendingQuestionnaire(true);
      const response = await fetch(
        `/api/employer/applications/${applicationId}/send-questionnaire`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            questionnaireId: selectedQuestionnaire,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to send questionnaire");

      addNotification("Асуулга амжилттай илгээгдлээ", "success");
    } catch (error) {
      console.error("Error sending questionnaire:", error);
      addNotification("Асуулга илгээхэд алдаа гарлаа", "error");
    } finally {
      setIsSendingQuestionnaire(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Ачаалж байна...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-16 bg-white px-0 sm:px-6 md:px-8 lg:px-32 text-[#0C213A] font-poppins">
      {/* Cover Image/Header */}
      <div className="relative w-full h-32 sm:h-40 md:h-48 lg:h-64">
        <NextImage
          src="/images/cover.jpeg"
          alt="Company cover"
          fill
          className="w-full h-full object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute left-0 bottom-0 flex items-end gap-4 sm:gap-6 md:gap-8 px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 w-full bg-gradient-to-t from-black/60 to-transparent">
          <div className="relative group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
              <NextImage
                src={company?.logoUrl || "/images/default-company-logo.svg"}
                alt="logo"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <NextImage
                src="/icons/image.svg"
                alt="upload"
                width={32}
                height={32}
                className="w-6 h-6 sm:w-8 sm:h-8"
              />
            </div>
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editedCompany?.name || ""}
                  onChange={(e) => {
                    if (editedCompany) {
                      setEditedCompany({
                        ...editedCompany,
                        name: e.target.value,
                      });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace") {
                      e.stopPropagation();
                    }
                  }}
                  className="w-full bg-white/10 backdrop-blur-sm text-white text-lg md:text-2xl font-bold px-2 sm:px-3 py-1 rounded border border-white/20 focus:outline-none focus:border-white/40"
                  placeholder="Компанийн нэр"
                  autoComplete="off"
                  spellCheck="false"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    value={editedCompany?.location || ""}
                    onChange={(e) => {
                      if (editedCompany) {
                        setEditedCompany({
                          ...editedCompany,
                          location: e.target.value,
                        });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace") {
                        e.stopPropagation();
                      }
                    }}
                    className="bg-white/10 backdrop-blur-sm text-white/80 text-sm sm:text-base px-2 sm:px-3 py-1 rounded border border-white/20 focus:outline-none focus:border-white/40"
                    placeholder="Байршил"
                    autoComplete="off"
                    spellCheck="false"
                  />
                  <button
                    onClick={handleSaveProfile}
                    className="bg-white text-[#0C213A] px-3 sm:px-4 py-1 rounded hover:bg-white/90 transition-colors text-sm sm:text-base"
                  >
                    Хадгалах
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedCompany(company);
                    }}
                    className="bg-red-500 text-white px-3 sm:px-4 py-1 rounded hover:bg-red-600 transition-colors text-sm sm:text-base"
                  >
                    Цуцлах
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  {company?.name}
                </h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="text-sm sm:text-base text-white/80">
                    Ажлын байр: {jobs?.length || 0}
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-white/80 hover:text-white transition-colors flex items-center gap-1 text-sm sm:text-base"
                  >
                    <FiEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                    Засах
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="w-full bg-white border-b border-[#0C213A]/10">
        <nav className="flex justify-start gap-0 overflow-x-auto">
          <button
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-none border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap
              ${
                activeTab === "about"
                  ? "border-[#0C213A] text-[#0C213A]"
                  : "border-transparent text-[#0C213A]/60 hover:text-[#0C213A] hover:bg-[#0C213A]/5"
              }
            `}
            onClick={() => setActiveTab("about")}
          >
            Тухай
          </button>
          <button
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-none border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap
              ${
                activeTab === "jobs"
                  ? "border-[#0C213A] text-[#0C213A]"
                  : "border-transparent text-[#0C213A]/60 hover:text-[#0C213A] hover:bg-[#0C213A]/5"
              }
            `}
            onClick={() => setActiveTab("jobs")}
          >
            Нээлттэй ажлын байр
          </button>
          <button
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-none border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap
              ${
                activeTab === "questionnaires"
                  ? "border-[#0C213A] text-[#0C213A]"
                  : "border-transparent text-[#0C213A]/60 hover:text-[#0C213A] hover:bg-[#0C213A]/5"
              }
            `}
            onClick={() => setActiveTab("questionnaires")}
          >
            Асуулга
          </button>
          <button
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-none border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap
              ${
                activeTab === "responses"
                  ? "border-[#0C213A] text-[#0C213A]"
                  : "border-transparent text-[#0C213A]/60 hover:text-[#0C213A] hover:bg-[#0C213A]/5"
              }
            `}
            onClick={() => setActiveTab("responses")}
          >
            Хариултууд
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="mx-auto py-6 sm:py-8 px-2 sm:px-4 md:px-6 lg:px-0">
        {activeTab === "about" && (
          <div className="w-full bg-white rounded-none shadow-none p-0 mb-8 border-0">
            <div className="w-full px-0">
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <h2 className="text-lg md:text-2xl lg:text-xl 2xl:text-2xl font-bold text-[#0C213A]">
                  Компанийн мэдээлэл
                </h2>
                {!isEditingAbout && (
                  <button
                    onClick={() => setIsEditingAbout(true)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-4 sm:px-6 py-2 rounded-lg shadow transition flex items-center gap-2 text-sm sm:text-base"
                  >
                    <FiEdit className="w-4 h-4 sm:w-4 sm:h-4" />
                    Засах
                  </button>
                )}
              </div>
              {isEditingAbout ? (
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-base font-medium text-gray-700 mb-1">
                          Компанийн нэр
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-base sm:text-lg text-[#0C213A] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          value={aboutEdit.name}
                          onChange={(e) =>
                            setAboutEdit((a) => ({
                              ...a,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-base font-medium text-gray-700 mb-1">
                          Байршил
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-base sm:text-lg text-[#0C213A] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          value={aboutEdit.location}
                          onChange={(e) =>
                            setAboutEdit((a) => ({
                              ...a,
                              location: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-base font-medium text-gray-700 mb-1">
                          Вэбсайт
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-base sm:text-lg text-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          value={aboutEdit.website}
                          onChange={(e) =>
                            setAboutEdit((a) => ({
                              ...a,
                              website: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-base font-medium text-gray-700 mb-1">
                        Компанийн тухай
                      </label>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition h-[150px] sm:h-[200px] resize-none"
                        value={aboutEdit.description}
                        onChange={(e) =>
                          setAboutEdit((a) => ({
                            ...a,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleAboutSave}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg shadow transition flex items-center gap-2 text-sm sm:text-base"
                    >
                      <FiEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                      Хадгалах
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingAbout(false);
                        setAboutEdit({
                          name: company?.name || "",
                          location: company?.location || "",
                          website: company?.website || "",
                          description: company?.description || "",
                        });
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg shadow transition flex items-center gap-2 text-sm sm:text-base"
                    >
                      <FiEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                      Болих
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                  <div className="space-y-6 sm:space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                      <div>
                        <h3 className="text-base md:text-base lg:text-lg xl:text-xl 2xl:text-lg font-medium text-gray-500 mb-1">
                          Компанийн нэр
                        </h3>
                        <p className="text-lg sm:text-xl font-semibold text-[#0C213A]">
                          {company?.name}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-base md:text-base lg:text-lg xl:text-xl 2xl:text-lg font-medium text-gray-500 mb-1">
                          Байршил
                        </h3>
                        <div className="flex items-center gap-2 text-base sm:text-lg text-[#0C213A]">
                          <FiMapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                          {company?.location}
                        </div>
                      </div>
                      {company?.website && (
                        <div>
                          <h3 className="text-base md:text-base lg:text-lg xl:text-xl 2xl:text-lg font-medium text-gray-500 mb-1">
                            Вэбсайт
                          </h3>
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-2 text-base sm:text-lg"
                          >
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                              />
                            </svg>
                            {company.website}
                          </a>
                        </div>
                      )}
                    </div>
                    {company?.description && (
                      <div className="border-t pt-4 sm:pt-6">
                        <h3 className="text-base md:text-base lg:text-lg xl:text-xl 2xl:text-xl font-medium text-gray-700 mb-2 sm:mb-3 font-poppins font-bold md:font-semibold 2xl:font-bold lg:font-semibold xl:font-semibold 2xl:font-semibold">
                          Компанийн тухай
                        </h3>
                        <div className="prose prose-blue max-w-none">
                          <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line leading-relaxed">
                            {company.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "jobs" && (
          <>
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-[#0C213A]">
              Нээлттэй ажлын байрууд
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {jobs?.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 flex flex-col gap-3 relative group hover:shadow-lg transition-shadow"
                >
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(job.id)}
                      className="p-1.5 sm:p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition"
                      title="Засах"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-black"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-1.5 sm:p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition"
                      title="Устгах"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                      <span className="text-lg sm:text-xl font-bold text-[#0C213A]">
                        {job.title}
                      </span>
                      {job.type && (
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 sm:px-3 py-1 rounded-full">
                          {job.type === "FULL_TIME"
                            ? "БҮТЭН ЦАГ"
                            : job.type === "PART_TIME"
                            ? "ХАГАС ЦАГ"
                            : job.type === "CONTRACT"
                            ? "ГЭРЭЭТ"
                            : job.type === "INTERNSHIP"
                            ? "ДАДЛАГА"
                            : job.type}
                        </span>
                      )}
                      {job.salary && (
                        <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 sm:px-3 py-1 rounded-full">
                          {job.salary}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <NextImage
                      src={company?.logoUrl || "/images/default-company-logo.svg"}
                      alt="logo"
                      width={40}
                      height={40}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-[#0C213A] text-sm sm:text-base">
                        {company?.name}
                      </div>
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                        <FiMapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        {job.location}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {activeTab === "questionnaires" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-[#0C213A]">
                Асуулга
              </h2>
              {!isCreatingQuestionnaire &&
                !editingQuestionnaire &&
                !isCreatingGovernmentQuestionnaire && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsCreatingQuestionnaire(true)}
                      className="bg-[#0C213A] text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Шинэ асуулга
                    </button>
                    <button
                      onClick={() => setIsCreatingGovernmentQuestionnaire(true)}
                      className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Төрийн анкет
                    </button>
                  </div>
                )}
            </div>

            {isCreatingQuestionnaire || editingQuestionnaire ? (
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editingQuestionnaire ? "Асуулга засах" : "Шинэ асуулга"}
                  </h3>
                  <button
                    onClick={() => {
                      if (editingQuestionnaire) {
                        setEditingQuestionnaire(null);
                      } else {
                        setIsCreatingQuestionnaire(false);
                        setNewQuestionnaire({
                          title: "",
                          description: "",
                          questions: [],
                        });
                      }
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Гарчиг
                    </label>
                    <input
                      type="text"
                      value={
                        editingQuestionnaire?.title || newQuestionnaire.title
                      }
                      onChange={(e) =>
                        editingQuestionnaire
                          ? setEditingQuestionnaire((prev) =>
                              prev ? { ...prev, title: e.target.value } : null
                            )
                          : setNewQuestionnaire((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Backspace") {
                          e.stopPropagation();
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 transition focus:border-gray-200"
                      placeholder="Асуулгын гарчиг"
                      autoComplete="off"
                      spellCheck="false"
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Тайлбар
                    </label>
                    <textarea
                      value={
                        editingQuestionnaire?.description ||
                        newQuestionnaire.description
                      }
                      onChange={(e) =>
                        editingQuestionnaire
                          ? setEditingQuestionnaire((prev) =>
                              prev
                                ? { ...prev, description: e.target.value }
                                : null
                            )
                          : setNewQuestionnaire((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Backspace") {
                          e.stopPropagation();
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-0.5 focus:ring-blue-500 focus:border-emerald-950 transition duration-200"
                      rows={3}
                      placeholder="Асуулгын тайлбар"
                      autoComplete="off"
                      spellCheck="false"
                    />
                  </div>

                  {/* Template File Upload Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Word файл
                    </label>
                    <div className="space-y-3">
                      {!uploadedTemplateFile &&
                      !editingQuestionnaire?.attachmentFile ? (
                        <>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                            <input
                              type="file"
                              accept=".doc,.docx,.pdf"
                              onChange={handleTemplateFileChange}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {selectedTemplateFile && (
                              <button
                                onClick={handleTemplateFileUpload}
                                disabled={isUploadingTemplate}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                              >
                                {isUploadingTemplate
                                  ? "Хадгалж байна..."
                                  : "Хадгалах"}
                              </button>
                            )}
                          </div>
                          {selectedTemplateFile && (
                            <p className="text-sm text-gray-600">
                              Сонгосон файл: {selectedTemplateFile.name}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <svg
                              className="w-5 h-5 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="text-sm text-green-700">
                              {uploadedTemplateFile?.fileName ||
                                editingQuestionnaire?.attachmentFile}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setUploadedTemplateFile(null);
                              setSelectedTemplateFile(null);
                              if (editingQuestionnaire) {
                                setEditingQuestionnaire((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        attachmentFile: undefined,
                                        attachmentUrl: undefined,
                                      }
                                    : null
                                );
                              }
                            }}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Устгах
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Зөвхөн Word файл (.doc, .docx) оруулна уу. Хамгийн их
                        хэмжээ: 10MB
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        Асуултууд
                      </h3>
                    </div>

                    {(editingQuestionnaire?.questions ||
                      newQuestionnaire.questions
                    ).map((question, index) => (
                      <div
                        key={question.id}
                        className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Асуулт {index + 1}
                              </label>
                              <input
                                type="text"
                                value={question.text}
                                onChange={(e) =>
                                  editingQuestionnaire
                                    ? setEditingQuestionnaire((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              questions: prev.questions.map(
                                                (q, i) =>
                                                  i === index
                                                    ? {
                                                        ...q,
                                                        text: e.target.value,
                                                      }
                                                    : q
                                              ),
                                            }
                                          : null
                                      )
                                    : handleQuestionChange(
                                        question.id,
                                        "text",
                                        e.target.value
                                      )
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Backspace") {
                                    e.stopPropagation();
                                  }
                                }}
                                autoComplete="off"
                                spellCheck="false"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                placeholder="Асуултаа бичнэ үү..."
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Төрөл
                                </label>
                                <select
                                  value={question.type}
                                  onChange={(e) => {
                                    const value = e.target
                                      .value as
                                      | "TEXT"
                                      | "MULTIPLE_CHOICE"
                                      | "SINGLE_CHOICE";
                                    if (editingQuestionnaire) {
                                      setEditingQuestionnaire((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              questions: prev.questions.map(
                                                (q, i) =>
                                                  i === index
                                                    ? { ...q, type: value }
                                                    : q
                                              ),
                                            }
                                          : null
                                      );
                                    } else {
                                      handleQuestionChange(
                                        question.id,
                                        "type",
                                        value
                                      );
                                    }
                                  }}
                                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                >
                                  <option value="TEXT">Текст</option>
                                  <option value="SINGLE_CHOICE">
                                    Нэг сонголттой
                                  </option>
                                  <option value="MULTIPLE_CHOICE">
                                    Олон сонголттой
                                  </option>
                                </select>
                              </div>

                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`required-${question.id}`}
                                  checked={question.required}
                                  onChange={(e) =>
                                    editingQuestionnaire
                                      ? setEditingQuestionnaire((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                questions: prev.questions.map(
                                                  (q, i) =>
                                                    i === index
                                                      ? {
                                                          ...q,
                                                          required:
                                                            e.target.checked,
                                                        }
                                                      : q
                                                ),
                                              }
                                            : null
                                        )
                                      : handleQuestionChange(
                                          question.id,
                                          "required",
                                          e.target.checked
                                        )
                                  }
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                  htmlFor={`required-${question.id}`}
                                  className="ml-2 block text-sm text-gray-700"
                                >
                                  Заавал бөглөх
                                </label>
                              </div>
                            </div>

                            {(question.type === "SINGLE_CHOICE" ||
                              question.type === "MULTIPLE_CHOICE") && (
                              <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Сонголтууд
                                </label>
                                <div className="space-y-2">
                                  {question.options?.map(
                                    (option, optionIndex) => (
                                      <div
                                        key={optionIndex}
                                        className="flex gap-2 items-center"
                                      >
                                        <input
                                          type="text"
                                          value={option}
                                          onChange={(e) => {
                                            const newOptions = [
                                              ...question.options,
                                            ];
                                            newOptions[optionIndex] =
                                              e.target.value;
                                            if (editingQuestionnaire) {
                                              setEditingQuestionnaire((prev) =>
                                                prev
                                                  ? {
                                                      ...prev,
                                                      questions:
                                                        prev.questions.map(
                                                          (q, i) =>
                                                            i === index
                                                              ? {
                                                                  ...q,
                                                                  options:
                                                                    newOptions,
                                                                }
                                                              : q
                                                        ),
                                                    }
                                                  : null
                                              );
                                            } else {
                                              handleQuestionChange(
                                                question.id,
                                                "options",
                                                newOptions
                                              );
                                            }
                                          }}
                                          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                          placeholder={`Сонголт ${
                                            optionIndex + 1
                                          }`}
                                        />
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            const newOptions =
                                              question.options.filter(
                                                (_, i) => i !== optionIndex
                                              );
                                            if (editingQuestionnaire) {
                                              setEditingQuestionnaire((prev) =>
                                                prev
                                                  ? {
                                                      ...prev,
                                                      questions:
                                                        prev.questions.map(
                                                          (q, i) =>
                                                            i === index
                                                              ? {
                                                                  ...q,
                                                                  options:
                                                                    newOptions,
                                                                }
                                                              : q
                                                        ),
                                                    }
                                                  : null
                                              );
                                            } else {
                                              handleQuestionChange(
                                                question.id,
                                                "options",
                                                newOptions
                                              );
                                            }
                                          }}
                                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                        >
                                          <TrashIcon className="w-5 h-5" />
                                        </button>
                                      </div>
                                    )
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const newOptions = [
                                        ...question.options,
                                        "",
                                      ];
                                      if (editingQuestionnaire) {
                                        setEditingQuestionnaire((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                questions: prev.questions.map(
                                                  (q, i) =>
                                                    i === index
                                                      ? {
                                                          ...q,
                                                          options: newOptions,
                                                        }
                                                      : q
                                                ),
                                              }
                                            : null
                                        );
                                      } else {
                                        handleQuestionChange(
                                          question.id,
                                          "options",
                                          newOptions
                                        );
                                      }
                                    }}
                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                                  >
                                    <PlusIcon className="w-4 h-4 mr-1" />
                                    Сонголт нэмэх
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              // ⬇️ ternary → if/else (no-unused-expressions засвар)
                              if (editingQuestionnaire) {
                                setEditingQuestionnaire((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        questions: prev.questions.filter(
                                          (_, i) => i !== index
                                        ),
                                      }
                                    : null
                                );
                              } else {
                                handleDeleteQuestion(question.id);
                              }
                            }}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition ml-4"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4">
                      <button
                        onClick={() =>
                          editingQuestionnaire
                            ? setEditingQuestionnaire((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      questions: [
                                        ...prev.questions,
                                        {
                                          id: Date.now().toString(),
                                          text: "",
                                          type: "TEXT",
                                          required: false,
                                          options: [],
                                          order: prev.questions.length,
                                        },
                                      ],
                                    }
                                  : null
                              )
                            : handleAddQuestion()
                        }
                        className="inline-flex items-center rounded-md bg-[#0C213A] px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transform transition-transform duration-200 hover:scale-110"
                      >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Асуулт нэмэх
                      </button>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                        <button
                          onClick={() => {
                            if (editingQuestionnaire) {
                              setEditingQuestionnaire(null);
                            } else {
                              setIsCreatingQuestionnaire(false);
                              setNewQuestionnaire({
                                title: "",
                                description: "",
                                questions: [],
                              });
                            }
                          }}
                          className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                          Цуцлах
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (editingQuestionnaire) {
                              handleEditQuestionnaire();
                            } else {
                              handleCreateQuestionnaire();
                            }
                          }}
                          className="px-6 py-2.5 text-white bg-black rounded-lg hover:bg-gray-800 transition-colors font-medium"
                        >
                          Хадгалах
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : isCreatingGovernmentQuestionnaire ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Төрийн албан хаагчийн анкет үүсгэх
                  </h3>
                  <button
                    onClick={() => setIsCreatingGovernmentQuestionnaire(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <GovernmentEmployeeQuestionnaire
                  onSubmit={handleCreateGovernmentQuestionnaire}
                  onCancel={() => setIsCreatingGovernmentQuestionnaire(false)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {questionnaires?.map((questionnaire) => (
                  <div
                    key={questionnaire.id}
                    className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 flex flex-col gap-3 relative group hover:shadow-lg transition-shadow"
                  >
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const questionnaireId = questionnaire.id;
                          startEditingQuestionnaire(questionnaireId);
                        }}
                        className="p-1.5 sm:p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition"
                        title="Засах"
                      >
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 text-black"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const questionnaireId = questionnaire.id;
                          handleDeleteQuestionnaire(questionnaireId);
                        }}
                        className="p-1.5 sm:p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition"
                        title="Устгах"
                      >
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                        <span className="text-lg sm:text-xl font-bold text-[#0C213A]">
                          {questionnaire.title}
                        </span>
                        <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 sm:px-3 py-1 rounded-full">
                          {questionnaire.questions?.length ?? 0} асуулт
                        </span>
                      </div>
                      {questionnaire.description && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {questionnaire.description}
                        </p>
                      )}
                      {questionnaire.attachmentFile && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <svg
                                className="w-4 h-4 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <span className="text-sm text-blue-700 font-medium">
                                {questionnaire.attachmentFile}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                if (questionnaire.attachmentUrl) {
                                  const link =
                                    document.createElement("a");
                                  link.href = questionnaire.attachmentUrl;
                                  link.download =
                                    questionnaire.attachmentFile ||
                                    "template.docx";
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }
                              }}
                              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                              Татах
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === "responses" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-[#0C213A]">
                Асуулгын хариултууд
              </h2>
              <select
                value={selectedQuestionnaire || ""}
                onChange={(e) => {
                  setSelectedQuestionnaire(e.target.value);
                  if (e.target.value) {
                    fetchResponses(e.target.value);
                  } else {
                    setResponses([]);
                  }
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Асуулга сонгох</option>
                {questionnaires?.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedQuestionnaire ? (
              <div className="space-y-6">
                {responses?.length > 0 ? (
                  responses.map((response) => (
                    <div
                      key={response.id}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                    >
                      <Disclosure>
                        {({ open }) => (
                          <div>
                            <Disclosure.Button className="w-full p-6">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-semibold">
                                    {response.user.name.charAt(0)}
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-bold text-[#0C213A]">
                                      {response.user.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                      </svg>
                                      {response.user.email}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-sm text-gray-500">
                                    {new Date(
                                      response.createdAt
                                    ).toLocaleDateString("mn-MN", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </div>
                                  <ChevronUpIcon
                                    className={`${
                                      open ? "transform rotate-180" : ""
                                    } w-5 h-5 text-gray-500 transition-transform duration-200`}
                                  />
                                </div>
                              </div>
                            </Disclosure.Button>
                            <Disclosure.Panel className="px-6 pb-6">
                              <div className="space-y-4 pt-4 border-t border-gray-100">
                                {response.answers?.map((answer, index) => (
                                  <div
                                    key={index}
                                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
                                        {index + 1}
                                      </div>
                                      <div className="flex-1 space-y-2">
                                        <h4 className="font-medium text-[#0C213A]">
                                          {answer.question.text}
                                        </h4>
                                        {answer.question.type ===
                                        "MULTIPLE_CHOICE" ? (
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {answer.value
                                              .split(",")
                                              .map((value, i) => (
                                                <div
                                                  key={i}
                                                  className="bg-white px-4 py-2 rounded-lg border border-gray-200 flex items-center gap-2"
                                                >
                                                  <svg
                                                    className="w-5 h-5 text-green-500 flex-shrink-0"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                  >
                                                    <path
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      strokeWidth={2}
                                                      d="M5 13l4 4L19 7"
                                                    />
                                                  </svg>
                                                  <span className="text-gray-700">
                                                    {value.trim()}
                                                  </span>
                                                </div>
                                              ))}
                                          </div>
                                        ) : (
                                          <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
                                            <p className="text-gray-700 whitespace-pre-wrap">
                                              {answer.value}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </Disclosure.Panel>
                          </div>
                        )}
                      </Disclosure>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-10 h-10 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293л5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Хариулт олдсонгүй
                    </h3>
                    <p className="text-gray-500">
                      Энэ асуулгад одоогоор хариулт ирээгүй байна
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Асуулга сонгоно уу
                </h3>
                <p className="text-gray-500">
                  Хариултуудыг харахын тулд дээрх жагсаалтаас асуулга сонгоно уу
                </p>
              </div>
            )}
          </div>
        )}
        {activeTab === "anketuud" && (
          <div className="space-y-6">
            <h2 className="text-lg см:text-xl font-bold text-[#0C213A]">
              Ирсэн CV-үүд
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {applications?.map((application) => (
                <div
                  key={application.id}
                  className="bg-white rounded-xl shadow-lg p-6 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.user.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {application.user.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                      {application.status && (
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            application.status === "EMPLOYER_APPROVED"
                              ? "bg-blue-100 text-blue-800"
                              : application.status === "ADMIN_APPROVED"
                              ? "bg-green-100 text-green-800"
                              : application.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {application.status === "EMPLOYER_APPROVED"
                            ? "Ажил олгогч зөвшөөрсөн"
                            : application.status === "ADMIN_APPROVED"
                            ? "Зөвшөөрөгдсөн"
                            : application.status === "REJECTED"
                            ? "Татгалзсан"
                            : "Хүлээгдэж буй"}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={application.cv.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        CV Татах
                      </a>
                      {(!application.status ||
                        application.status === "PENDING") && (
                        <>
                          <button
                            onClick={() => handleApproveCV(application.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            Зөвшөөрөх
                          </button>
                          <button
                            onClick={() => handleRejectCV(application.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Татгалзах
                          </button>
                        </>
                      )}
                      <div className="relative">
                        <button
                          onClick={() => setSelectedCV(application.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Асуулга Илгээх
                        </button>
                        {selectedCV === application.id && (
                          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-10">
                            <h4 className="font-medium mb-2">Асуулга сонгох</h4>
                            <div className="space-y-2">
                              {questionnaires?.map((q) => (
                                <button
                                  key={q.id}
                                  onClick={() => {
                                    handleSendQuestionnaire(application.id);
                                    setSelectedCV(null);
                                  }}
                                  disabled={isSendingQuestionnaire}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                                >
                                  {q.title}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {!applications || applications.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Одоогоор ирсэн CV байхгүй байна
                </div>
              ) : null}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
