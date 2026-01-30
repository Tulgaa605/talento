"use client";
import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Cropper from "react-easy-crop";
import { Area } from "react-easy-crop";
import { useNotification } from "@/providers/NotificationProvider";

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
  level: "basic" | "conversational" | "fluent" | "native";
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
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

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

      // 3x4 ratio: 300x400 pixels
      const targetWidth = 300;
      const targetHeight = 400;
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        targetWidth,
        targetHeight
      );

      const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPersonalInfo({ ...personalInfo, photo: croppedImageUrl });
      setShowCropModal(false);
      setImageToCrop("");
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      if (errors.photo) {
        setErrors({ ...errors, photo: "" });
      }
    } catch (error) {
      console.error('Error creating cropped image:', error);
      setErrors({ ...errors, photo: "Зураг crop хийхэд алдаа гарлаа" });
    }
  }, [imageToCrop, croppedAreaPixels, personalInfo, errors]);

  const cancelCrop = () => {
    setShowCropModal(false);
    setImageToCrop("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    const input = document.getElementById("photo-upload") as HTMLInputElement;
    if (input) input.value = "";
  };

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
  });

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
    { id: "1", name: "", level: "fluent" },
  ]);
  const [certificates, setCertificates] = useState<Certificate[]>([
    { id: "1", name: "", issuer: "", date: "", url: "" },
  ]);
  const [projects, setProjects] = useState<Project[]>([
    { id: "1", name: "", description: "", technologies: "", url: "" },
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
      if (personalInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) {
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
        id: Date.now().toString(),
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
    setExperiences(experiences.filter((exp) => exp.id !== id));
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setExperiences(
      experiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const addEducation = () => {
    setEducations([
      ...educations,
      {
        id: Date.now().toString(),
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
    setEducations(educations.filter((edu) => edu.id !== id));
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    setEducations(
      educations.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
    );
  };

  const addSkill = () => {
    setSkills([...skills, { id: Date.now().toString(), name: "", level: "intermediate" }]);
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter((skill) => skill.id !== id));
  };

  const updateSkill = (id: string, field: keyof Skill, value: any) => {
    setSkills(skills.map((skill) => (skill.id === id ? { ...skill, [field]: value } : skill)));
  };

  const addLanguage = () => {
    setLanguages([...languages, { id: Date.now().toString(), name: "", level: "fluent" }]);
  };

  const removeLanguage = (id: string) => {
    setLanguages(languages.filter((lang) => lang.id !== id));
  };

  const updateLanguage = (id: string, field: keyof Language, value: any) => {
    setLanguages(
      languages.map((lang) => (lang.id === id ? { ...lang, [field]: value } : lang))
    );
  };

  const addCertificate = () => {
    setCertificates([
      ...certificates,
      { id: Date.now().toString(), name: "", issuer: "", date: "", url: "" },
    ]);
  };

  const removeCertificate = (id: string) => {
    setCertificates(certificates.filter((cert) => cert.id !== id));
  };

  const updateCertificate = (id: string, field: keyof Certificate, value: any) => {
    setCertificates(
      certificates.map((cert) => (cert.id === id ? { ...cert, [field]: value } : cert))
    );
  };

  const addProject = () => {
    setProjects([
      ...projects,
      { id: Date.now().toString(), name: "", description: "", technologies: "", url: "" },
    ]);
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter((proj) => proj.id !== id));
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    setProjects(projects.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj)));
  };

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

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      console.log("Image dimensions:", imgWidth, imgHeight);

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;

      // Add additional pages if needed
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
        className="bg-white p-0 mx-auto shadow-lg"
        style={{ 
          fontFamily: "Arial, sans-serif", 
          fontSize: "10pt",
          width: "210mm",
          maxWidth: "210mm",
          minHeight: "297mm"
        }}
      >
        <div className="flex">
          {/* Left Column - Dark Blue Background */}
          <div className="w-1/3" style={{ backgroundColor: "#1e3a5f", minHeight: "100%" }}>
            <div className="p-5 pb-4">
              {personalInfo.photo && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={personalInfo.photo}
                    alt="Profile"
                    className="w-24 h-32 object-cover rounded border-2 border-white"
                    style={{ aspectRatio: "3/4" }}
                  />
                </div>
              )}
              <h1 className="text-xl font-bold leading-tight text-white" style={{ fontSize: "18px", lineHeight: "1.2" }}>
                {personalInfo.firstName || "Нэр"} {personalInfo.lastName || "Овог"}
              </h1>
            </div>
            <div className="px-5 pb-4">
              <h2 className="text-sm font-bold mb-3 uppercase tracking-wide" style={{ color: "#d0d0d0", fontSize: "12px" }}>Personal details</h2>
              <div className="space-y-2 text-white" style={{ fontSize: "10px", lineHeight: "1.5" }}>
                {personalInfo.email && (
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0" style={{ fontSize: "11px" }}>📧</span>
                    <span className="break-words">{personalInfo.email}</span>
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0" style={{ fontSize: "11px" }}>📞</span>
                    <span>{personalInfo.phone}</span>
                  </div>
                )}
                {personalInfo.address && (
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0" style={{ fontSize: "11px" }}>🏠</span>
                    <span className="break-words">{personalInfo.address}</span>
                  </div>
                )}
                {personalInfo.linkedin && (
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0" style={{ fontSize: "11px" }}>💼</span>
                    <span className="break-words">{personalInfo.linkedin}</span>
                  </div>
                )}
              </div>
            </div>
            {skills.some((skill) => skill.name) && (
              <div className="px-5 pt-0 pb-5">
                <h2 className="text-sm font-bold mb-3 uppercase tracking-wide" style={{ color: "#d0d0d0", fontSize: "12px" }}>Skills</h2>
                <div className="space-y-1.5 text-white" style={{ fontSize: "10px", lineHeight: "1.5" }}>
                  {skills.filter((skill) => skill.name).map((skill) => (
                    <div key={skill.id}>{skill.name}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="w-2/3 bg-white p-5">
            {personalInfo.summary && (
              <div className="mb-5">
                <h2 className="text-base font-bold mb-2 uppercase tracking-wide" style={{ color: "#2d3748", fontSize: "13px" }}>Profile</h2>
                <p className="leading-relaxed" style={{ color: "#4a5568", fontSize: "10px", lineHeight: "1.6" }}>{personalInfo.summary}</p>
              </div>
            )}
            {educations.some((edu) => edu.school || edu.degree) && (
              <div className="mb-5">
                <h2 className="text-base font-bold mb-3 uppercase tracking-wide border-b-2 border-gray-300 pb-1" style={{ color: "#2d3748", fontSize: "13px" }}>Education</h2>
                <div className="space-y-2.5">
                  {educations.filter((edu) => edu.school || edu.degree).map((edu) => (
                    <div key={edu.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1" style={{ color: "#2d3748", fontSize: "11px" }}>{edu.degree}</h3>
                        <p className="mb-0.5" style={{ color: "#4a5568", fontSize: "10px" }}>{edu.school}</p>
                        {edu.field && (
                          <p style={{ color: "#718096", fontSize: "9px" }}>{edu.field}</p>
                        )}
                      </div>
                      <p className="ml-3 whitespace-nowrap" style={{ color: "#718096", fontSize: "10px" }}>
                        {formatDate(edu.startDate)} - {edu.current ? "Present" : formatDate(edu.endDate) || ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {experiences.some((exp) => exp.company || exp.position) && (
              <div className="mb-5">
                <h2 className="text-base font-bold mb-3 uppercase tracking-wide border-b-2 border-gray-300 pb-1" style={{ color: "#2d3748", fontSize: "13px" }}>Employment</h2>
                <div className="space-y-3">
                  {experiences.filter((exp) => exp.company || exp.position).map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-start mb-1.5">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-0.5" style={{ color: "#2d3748", fontSize: "11px" }}>{exp.position}</h3>
                          <p className="mb-0.5" style={{ color: "#4a5568", fontSize: "10px" }}>{exp.company}</p>
                          {exp.location && (
                            <p style={{ color: "#718096", fontSize: "9px" }}>{exp.location}</p>
                          )}
                        </div>
                        <p className="ml-3 whitespace-nowrap" style={{ color: "#718096", fontSize: "10px" }}>
                          {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate) || ""}
                        </p>
                      </div>
                      {exp.description && (
                        <ul className="list-disc list-inside ml-1 space-y-0.5 mt-1" style={{ color: "#4a5568", fontSize: "10px", lineHeight: "1.5" }}>
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
            {(languages.some((lang) => lang.name) || certificates.some((cert) => cert.name) || projects.some((proj) => proj.name)) && (
              <div className="mb-5">
                <h2 className="text-base font-bold mb-3 uppercase tracking-wide border-b-2 border-gray-300 pb-1" style={{ color: "#2d3748", fontSize: "13px" }}>Additional Information</h2>
                {languages.some((lang) => lang.name) && (
                  <div className="mb-3">
                    <h3 className="font-semibold mb-1.5" style={{ color: "#2d3748", fontSize: "11px" }}>Languages</h3>
                    <div className="space-y-1" style={{ fontSize: "10px", color: "#4a5568" }}>
                      {languages.filter((lang) => lang.name).map((lang) => (
                        <div key={lang.id}>
                          {lang.name} - {lang.level === "basic" && "Энгийн"}
                          {lang.level === "conversational" && "Ярилцлага"}
                          {lang.level === "fluent" && "Чөлөөтэй"}
                          {lang.level === "native" && "Эх хэл"}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {certificates.some((cert) => cert.name) && (
                  <div className="mb-3">
                    <h3 className="font-semibold mb-1.5" style={{ color: "#2d3748", fontSize: "11px" }}>Certificates</h3>
                    <div className="space-y-1" style={{ fontSize: "10px", color: "#4a5568" }}>
                      {certificates.filter((cert) => cert.name).map((cert) => (
                        <div key={cert.id}>
                          <span className="font-medium">{cert.name}</span> - {cert.issuer} {cert.date && `(${formatDate(cert.date)})`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {projects.some((proj) => proj.name) && (
                  <div>
                    <h3 className="font-semibold mb-1.5" style={{ color: "#2d3748", fontSize: "11px" }}>Projects</h3>
                    <div className="space-y-2" style={{ fontSize: "10px", color: "#4a5568" }}>
                      {projects.filter((proj) => proj.name).map((proj) => (
                        <div key={proj.id}>
                          <span className="font-medium">{proj.name}</span>
                          {proj.description && <p className="mt-0.5" style={{ fontSize: "9px" }}>{proj.description}</p>}
                          {proj.technologies && <p className="mt-0.5" style={{ fontSize: "9px", color: "#718096" }}>Tech: {proj.technologies}</p>}
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
          <div className="w-1/4 bg-gray-200 p-5">
            <div className="text-center mb-5">
              {personalInfo.photo && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={personalInfo.photo}
                    alt="Profile"
                    className="w-20 h-28 object-cover rounded border-2 border-gray-400"
                    style={{ aspectRatio: "3/4" }}
                  />
                </div>
              )}
              <h1 className="text-xl font-bold text-gray-900 mb-2" style={{ fontSize: "18px", lineHeight: "1.2" }}>
                {personalInfo.firstName || "Нэр"} {personalInfo.lastName || "Овог"}
              </h1>
            </div>
            <div className="space-y-4">
              <div>
                <h2 className="text-xs font-bold text-gray-800 mb-2 uppercase tracking-wide border-b border-gray-600 pb-1" style={{ fontSize: "11px" }}>Contact</h2>
                <div className="text-gray-700 space-y-1.5" style={{ fontSize: "10px", lineHeight: "1.5" }}>
                  {personalInfo.email && <div className="break-words">📧 {personalInfo.email}</div>}
                  {personalInfo.phone && <div>📞 {personalInfo.phone}</div>}
                  {personalInfo.address && <div className="break-words">🏠 {personalInfo.address}</div>}
                  {personalInfo.linkedin && <div className="break-words">💼 {personalInfo.linkedin}</div>}
                </div>
              </div>
              {skills.some((skill) => skill.name) && (
                <div>
                  <h2 className="text-xs font-bold text-gray-800 mb-2 uppercase tracking-wide border-b border-gray-600 pb-1" style={{ fontSize: "11px" }}>Skills</h2>
                  <div className="text-gray-700 space-y-1" style={{ fontSize: "10px", lineHeight: "1.5" }}>
                    {skills.filter((skill) => skill.name).map((skill) => (
                      <div key={skill.id}>• {skill.name}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Right Column - White Background */}
          <div className="w-3/4 bg-white p-6">
            {personalInfo.summary && (
              <div className="mb-5">
                <h2 className="text-base font-bold text-gray-900 mb-2 border-b-2 border-gray-800 pb-1" style={{ fontSize: "13px" }}>Profile</h2>
                <p className="text-gray-700 leading-relaxed" style={{ fontSize: "10px", lineHeight: "1.6" }}>{personalInfo.summary}</p>
              </div>
            )}
            {educations.some((edu) => edu.school || edu.degree) && (
              <div className="mb-5">
                <h2 className="text-base font-bold text-gray-900 mb-2 border-b-2 border-gray-800 pb-1" style={{ fontSize: "13px" }}>Education</h2>
                {educations.filter((edu) => edu.school || edu.degree).map((edu) => (
                  <div key={edu.id} className="mb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-0.5" style={{ fontSize: "11px" }}>{edu.degree}</h3>
                        <p className="text-gray-700 mb-0.5" style={{ fontSize: "10px" }}>{edu.school}</p>
                        {edu.field && (
                          <p className="text-gray-600" style={{ fontSize: "9px" }}>{edu.field}</p>
                        )}
                      </div>
                      <p className="text-gray-600 whitespace-nowrap ml-3" style={{ fontSize: "10px" }}>
                        {formatDate(edu.startDate)} - {edu.current ? "Present" : formatDate(edu.endDate) || ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {experiences.some((exp) => exp.company || exp.position) && (
              <div className="mb-5">
                <h2 className="text-base font-bold text-gray-900 mb-2 border-b-2 border-gray-800 pb-1" style={{ fontSize: "13px" }}>Employment</h2>
                {experiences.filter((exp) => exp.company || exp.position).map((exp) => (
                  <div key={exp.id} className="mb-3">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-0.5" style={{ fontSize: "11px" }}>{exp.position}</h3>
                        <p className="text-gray-700 mb-0.5" style={{ fontSize: "10px" }}>{exp.company}</p>
                        {exp.location && (
                          <p className="text-gray-600" style={{ fontSize: "9px" }}>{exp.location}</p>
                        )}
                      </div>
                      <p className="text-gray-600 whitespace-nowrap ml-3" style={{ fontSize: "10px" }}>
                        {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate) || ""}
                      </p>
                    </div>
                    {exp.description && (
                      <ul className="text-gray-700 list-disc list-inside ml-4 space-y-0.5" style={{ fontSize: "10px", lineHeight: "1.5" }}>
                        {exp.description.split('\n').filter(line => line.trim()).map((line, idx) => (
                          <li key={idx}>{line.trim()}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
            {(languages.some((lang) => lang.name) || certificates.some((cert) => cert.name) || projects.some((proj) => proj.name)) && (
              <div className="mb-5">
                <h2 className="text-base font-bold text-gray-900 mb-2 border-b-2 border-gray-800 pb-1" style={{ fontSize: "13px" }}>Additional Information</h2>
                {languages.some((lang) => lang.name) && (
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1.5" style={{ fontSize: "11px" }}>Languages</h3>
                    <div className="space-y-1" style={{ fontSize: "10px", color: "#4a5568" }}>
                      {languages.filter((lang) => lang.name).map((lang) => (
                        <div key={lang.id}>
                          {lang.name} - {lang.level === "basic" && "Энгийн"}
                          {lang.level === "conversational" && "Ярилцлага"}
                          {lang.level === "fluent" && "Чөлөөтэй"}
                          {lang.level === "native" && "Эх хэл"}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {certificates.some((cert) => cert.name) && (
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1.5" style={{ fontSize: "11px" }}>Certificates</h3>
                    <div className="space-y-1" style={{ fontSize: "10px", color: "#4a5568" }}>
                      {certificates.filter((cert) => cert.name).map((cert) => (
                        <div key={cert.id}>
                          <span className="font-medium">{cert.name}</span> - {cert.issuer} {cert.date && `(${formatDate(cert.date)})`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {projects.some((proj) => proj.name) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1.5" style={{ fontSize: "11px" }}>Projects</h3>
                    <div className="space-y-2" style={{ fontSize: "10px", color: "#4a5568" }}>
                      {projects.filter((proj) => proj.name).map((proj) => (
                        <div key={proj.id}>
                          <span className="font-medium">{proj.name}</span>
                          {proj.description && <p className="mt-0.5" style={{ fontSize: "9px" }}>{proj.description}</p>}
                          {proj.technologies && <p className="mt-0.5" style={{ fontSize: "9px", color: "#718096" }}>Tech: {proj.technologies}</p>}
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
        {/* Header - Dark gray background spanning full width */}
        <div className="p-5" style={{ backgroundColor: "#4a5568" }}>
          <div className="flex items-center gap-4 mb-2">
            {personalInfo.photo && (
              <img
                src={personalInfo.photo}
                alt="Profile"
                className="w-20 h-28 object-cover rounded border-2 border-white"
                style={{ aspectRatio: "3/4" }}
              />
            )}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white" style={{ fontSize: "20px", lineHeight: "1.2" }}>
                {personalInfo.firstName || "Нэр"} {personalInfo.lastName || "Овог"}
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-white" style={{ fontSize: "10px", lineHeight: "1.5" }}>
            {personalInfo.email && <span className="break-words">{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.address && <span className="break-words">{personalInfo.address}</span>}
            {personalInfo.linkedin && <span className="break-words">💼 {personalInfo.linkedin}</span>}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex">
          {/* Left Column - Main content */}
          <div className="w-2/3 bg-white p-5">
          {personalInfo.summary && (
              <div className="mb-5">
                <h2 className="text-base font-bold mb-2 uppercase tracking-wide" style={{ color: "#2d3748", fontSize: "13px" }}>Profile</h2>
                <p className="leading-relaxed" style={{ color: "#4a5568", fontSize: "10px", lineHeight: "1.6" }}>{personalInfo.summary}</p>
            </div>
          )}
            
              {educations.some((edu) => edu.school || edu.degree) && (
              <div className="mb-5">
                <h2 className="text-base font-bold mb-3 uppercase tracking-wide border-b-2 border-gray-300 pb-1" style={{ color: "#2d3748", fontSize: "13px" }}>Education</h2>
                <div className="space-y-2.5">
                  {educations.filter((edu) => edu.school || edu.degree).map((edu) => (
                    <div key={edu.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-0.5" style={{ color: "#2d3748", fontSize: "11px" }}>{edu.degree}</h3>
                        <p className="mb-0.5" style={{ color: "#4a5568", fontSize: "10px" }}>{edu.school}</p>
                        {edu.field && (
                          <p style={{ color: "#718096", fontSize: "9px" }}>{edu.field}</p>
                        )}
                      </div>
                      <p className="ml-3 whitespace-nowrap" style={{ color: "#718096", fontSize: "10px" }}>
                        {formatDate(edu.startDate)} - {edu.current ? "Present" : formatDate(edu.endDate) || ""}
                      </p>
                    </div>
                    ))}
                  </div>
                </div>
              )}

              {experiences.some((exp) => exp.company || exp.position) && (
              <div className="mb-5">
                <h2 className="text-base font-bold mb-3 uppercase tracking-wide border-b-2 border-gray-300 pb-1" style={{ color: "#2d3748", fontSize: "13px" }}>Employment</h2>
                <div className="space-y-3">
                  {experiences.filter((exp) => exp.company || exp.position).map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-start mb-1.5">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-0.5" style={{ color: "#2d3748", fontSize: "11px" }}>{exp.position}</h3>
                          <p className="mb-0.5" style={{ color: "#4a5568", fontSize: "10px" }}>{exp.company}</p>
                          {exp.location && (
                            <p style={{ color: "#718096", fontSize: "9px" }}>{exp.location}</p>
                          )}
                        </div>
                        <p className="ml-3 whitespace-nowrap" style={{ color: "#718096", fontSize: "10px" }}>
                        {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate) || ""}
                      </p>
                      </div>
                      {exp.description && (
                        <ul className="list-disc list-inside ml-1 space-y-0.5 mt-1" style={{ color: "#4a5568", fontSize: "10px", lineHeight: "1.5" }}>
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

            {(languages.some((lang) => lang.name) || certificates.some((cert) => cert.name) || projects.some((proj) => proj.name)) && (
              <div className="mb-5">
                <h2 className="text-base font-bold mb-3 uppercase tracking-wide border-b-2 border-gray-300 pb-1" style={{ color: "#2d3748", fontSize: "13px" }}>Additional Information</h2>
                {languages.some((lang) => lang.name) && (
                  <div className="mb-3">
                    <h3 className="font-semibold mb-1.5" style={{ color: "#2d3748", fontSize: "11px" }}>Languages</h3>
                    <div className="space-y-1" style={{ fontSize: "10px", color: "#4a5568" }}>
                      {languages.filter((lang) => lang.name).map((lang) => (
                        <div key={lang.id}>
                          {lang.name} - {lang.level === "basic" && "Энгийн"}
                          {lang.level === "conversational" && "Ярилцлага"}
                          {lang.level === "fluent" && "Чөлөөтэй"}
                          {lang.level === "native" && "Эх хэл"}
            </div>
                      ))}
                    </div>
                  </div>
                )}
                {certificates.some((cert) => cert.name) && (
                  <div className="mb-3">
                    <h3 className="font-semibold mb-1.5" style={{ color: "#2d3748", fontSize: "11px" }}>Certificates</h3>
                    <div className="space-y-1" style={{ fontSize: "10px", color: "#4a5568" }}>
                      {certificates.filter((cert) => cert.name).map((cert) => (
                        <div key={cert.id}>
                          <span className="font-medium">{cert.name}</span> - {cert.issuer} {cert.date && `(${formatDate(cert.date)})`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {projects.some((proj) => proj.name) && (
                  <div>
                    <h3 className="font-semibold mb-1.5" style={{ color: "#2d3748", fontSize: "11px" }}>Projects</h3>
                    <div className="space-y-2" style={{ fontSize: "10px", color: "#4a5568" }}>
                      {projects.filter((proj) => proj.name).map((proj) => (
                        <div key={proj.id}>
                          <span className="font-medium">{proj.name}</span>
                          {proj.description && <p className="mt-0.5" style={{ fontSize: "9px" }}>{proj.description}</p>}
                          {proj.technologies && <p className="mt-0.5" style={{ fontSize: "9px", color: "#718096" }}>Tech: {proj.technologies}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="w-1/3 bg-white p-5" style={{ backgroundColor: "#f7fafc" }}>
            <div className="mb-5">
              <h2 className="text-sm font-bold mb-3 uppercase tracking-wide" style={{ color: "#2d3748", fontSize: "12px" }}>Personal details</h2>
              <div className="space-y-2 text-xs" style={{ color: "#4a5568", fontSize: "10px", lineHeight: "1.5" }}>
                {personalInfo.address && (
                  <div>
                    <span className="font-semibold">Үндэс угсаа:</span> {personalInfo.address}
                  </div>
                )}
                {!personalInfo.address && (
                  <div>
                    <span className="font-semibold">Үндэс угсаа:</span> Монгол Улс
                  </div>
                )}
              </div>
            </div>

            {skills.some((skill) => skill.name) && (
              <div>
                <h2 className="text-sm font-bold mb-3 uppercase tracking-wide" style={{ color: "#2d3748", fontSize: "12px" }}>Skills</h2>
                <div className="space-y-1.5 text-xs leading-relaxed" style={{ color: "#4a5568", fontSize: "10px", lineHeight: "1.5" }}>
                  {skills.filter((skill) => skill.name).map((skill) => (
                    <div key={skill.id}>{skill.name}</div>
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
    // Mystical, elegant design with dark theme - A4 optimized
    return (
      <div
        id="cv-preview"
        className="p-0 mx-auto shadow-2xl"
        style={{ 
          fontFamily: "Georgia, serif", 
          fontSize: "10pt",
          width: "210mm",
          maxWidth: "210mm",
          minHeight: "297mm",
          background: "linear-gradient(to bottom right, #1a202c, #4c1d95, #1a202c)"
        }}
      >
        <div className="p-5 border-b-2 border-purple-500">
          <div className="flex items-center gap-4 mb-2">
            {personalInfo.photo && (
              <img
                src={personalInfo.photo}
                alt="Profile"
                className="w-20 h-28 object-cover rounded border-2 border-purple-400"
                style={{ aspectRatio: "3/4" }}
              />
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white" style={{ fontSize: "20px", color: "#a78bfa", lineHeight: "1.2" }}>
                {personalInfo.firstName || "Нэр"} {personalInfo.lastName || "Овог"}
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-purple-200" style={{ fontSize: "10px", lineHeight: "1.5" }}>
            {personalInfo.email && <span className="break-words">✨ {personalInfo.email}</span>}
            {personalInfo.phone && <span>✨ {personalInfo.phone}</span>}
            {personalInfo.address && <span className="break-words">✨ {personalInfo.address}</span>}
            {personalInfo.linkedin && <span className="break-words">✨ {personalInfo.linkedin}</span>}
          </div>
        </div>
        <div className="p-5 text-purple-100">
          {personalInfo.summary && (
            <div className="mb-5 p-4 rounded-lg border border-purple-500/30" style={{ backgroundColor: "rgba(88, 28, 135, 0.5)" }}>
              <h2 className="text-base font-bold text-purple-300 mb-2" style={{ fontSize: "13px" }}>Profile</h2>
              <p className="leading-relaxed" style={{ fontSize: "10px", lineHeight: "1.6" }}>{personalInfo.summary}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-5">
            <div>
              {educations.some((edu) => edu.school || edu.degree) && (
                <div className="mb-5">
                  <h2 className="text-sm font-bold text-purple-300 mb-3 border-l-4 border-purple-400 pl-2" style={{ fontSize: "12px" }}>Education</h2>
                  {educations.filter((edu) => edu.school || edu.degree).map((edu) => (
                    <div key={edu.id} className="mb-3 p-3 rounded border border-purple-500/20" style={{ backgroundColor: "rgba(88, 28, 135, 0.3)" }}>
                      <h3 className="text-xs font-semibold text-purple-200 mb-0.5" style={{ fontSize: "11px" }}>{edu.degree}</h3>
                      <p className="text-xs text-purple-300 mb-0.5" style={{ fontSize: "10px" }}>{edu.school}</p>
                      {edu.field && (
                        <p className="text-xs text-purple-400 mb-0.5" style={{ fontSize: "9px" }}>{edu.field}</p>
                      )}
                      <p className="text-xs text-purple-400 mt-1" style={{ fontSize: "10px" }}>
                        {formatDate(edu.startDate)} - {edu.current ? "Present" : formatDate(edu.endDate) || ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {skills.some((skill) => skill.name) && (
                <div className="mb-5">
                  <h2 className="text-sm font-bold text-purple-300 mb-3 border-l-4 border-purple-400 pl-2" style={{ fontSize: "12px" }}>Skills</h2>
                  <div className="space-y-1.5" style={{ fontSize: "10px", lineHeight: "1.5" }}>
                    {skills.filter((skill) => skill.name).map((skill) => (
                      <div key={skill.id} className="text-purple-200">🔮 {skill.name}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              {experiences.some((exp) => exp.company || exp.position) && (
                <div className="mb-5">
                  <h2 className="text-sm font-bold text-purple-300 mb-3 border-l-4 border-purple-400 pl-2" style={{ fontSize: "12px" }}>Employment</h2>
                  {experiences.filter((exp) => exp.company || exp.position).map((exp) => (
                    <div key={exp.id} className="mb-3 p-3 rounded border border-purple-500/20" style={{ backgroundColor: "rgba(88, 28, 135, 0.3)" }}>
                      <h3 className="text-xs font-semibold text-purple-200 mb-0.5" style={{ fontSize: "11px" }}>{exp.position}</h3>
                      <p className="text-xs text-purple-300 mb-0.5" style={{ fontSize: "10px" }}>{exp.company}</p>
                      {exp.location && (
                        <p className="text-xs text-purple-400 mb-0.5" style={{ fontSize: "9px" }}>{exp.location}</p>
                      )}
                      <p className="text-xs text-purple-400 mt-1" style={{ fontSize: "10px" }}>
                        {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate) || ""}
                      </p>
                      {exp.description && (
                        <ul className="text-xs text-purple-200 list-disc list-inside ml-2 mt-1.5 space-y-0.5" style={{ fontSize: "10px", lineHeight: "1.5" }}>
                          {exp.description.split('\n').filter(line => line.trim()).map((line, idx) => (
                            <li key={idx}>{line.trim()}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {(languages.some((lang) => lang.name) || certificates.some((cert) => cert.name) || projects.some((proj) => proj.name)) && (
                <div className="mb-5">
                  <h2 className="text-sm font-bold text-purple-300 mb-3 border-l-4 border-purple-400 pl-2" style={{ fontSize: "12px" }}>Additional</h2>
                  {languages.some((lang) => lang.name) && (
                    <div className="mb-3">
                      <h3 className="text-xs font-semibold text-purple-200 mb-1.5" style={{ fontSize: "11px" }}>Languages</h3>
                      <div className="space-y-1" style={{ fontSize: "10px", color: "#c084fc" }}>
                        {languages.filter((lang) => lang.name).map((lang) => (
                          <div key={lang.id}>
                            {lang.name} - {lang.level === "basic" && "Энгийн"}
                            {lang.level === "conversational" && "Ярилцлага"}
                            {lang.level === "fluent" && "Чөлөөтэй"}
                            {lang.level === "native" && "Эх хэл"}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {certificates.some((cert) => cert.name) && (
                    <div className="mb-3">
                      <h3 className="text-xs font-semibold text-purple-200 mb-1.5" style={{ fontSize: "11px" }}>Certificates</h3>
                      <div className="space-y-1" style={{ fontSize: "10px", color: "#c084fc" }}>
                        {certificates.filter((cert) => cert.name).map((cert) => (
                          <div key={cert.id}>
                            <span className="font-medium">{cert.name}</span> - {cert.issuer} {cert.date && `(${formatDate(cert.date)})`}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {projects.some((proj) => proj.name) && (
                    <div>
                      <h3 className="text-xs font-semibold text-purple-200 mb-1.5" style={{ fontSize: "11px" }}>Projects</h3>
                      <div className="space-y-2" style={{ fontSize: "10px", color: "#c084fc" }}>
                        {projects.filter((proj) => proj.name).map((proj) => (
                          <div key={proj.id}>
                            <span className="font-medium">{proj.name}</span>
                            {proj.description && <p className="mt-0.5" style={{ fontSize: "9px" }}>{proj.description}</p>}
                            {proj.technologies && <p className="mt-0.5" style={{ fontSize: "9px", color: "#a78bfa" }}>Tech: {proj.technologies}</p>}
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
                            setErrors({ ...errors, photo: "Зургийн хэмжээ 5MB-ээс хэтэрч байна" });
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
                        onClick={() => removeLanguage(lang.id)}
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
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-gradient-to-r from-white to-gray-50 border-b-2 border-gray-300 px-6 py-5 z-10 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">CV</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">CV Builder</h2>
                <p className="text-xs text-gray-500">Мэргэжлийн CV үүсгэх хэрэгсэл</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!previewMode && (
                <button
                  onClick={() => setShowSidebarPreview(!showSidebarPreview)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all transform hover:scale-105 ${
                    showSidebarPreview
                      ? "text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md"
                      : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <EyeIcon className="w-4 h-4" />
                  {showSidebarPreview ? "Preview хаах" : "Preview нээх"}
                </button>
              )}
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-md"
              >
                <EyeIcon className="w-4 h-4" />
                {previewMode ? "Засах" : "Бүрэн харах"}
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

          {/* Progress Steps */}
          {!previewMode && (
            <div className="flex items-center justify-between px-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1 group">
                  <div className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 transform ${
                          currentStep === step.id
                            ? "bg-blue-600 border-blue-600 text-white scale-110 shadow-lg ring-4 ring-blue-200"
                            : currentStep > step.id
                            ? "bg-green-500 border-green-500 text-white scale-105"
                            : "bg-white border-gray-300 text-gray-500 hover:border-gray-400"
                        }`}
                      >
                        {currentStep > step.id ? (
                          <CheckCircleIcon className="w-6 h-6" />
                        ) : (
                          <span className="font-bold">{step.id}</span>
                        )}
                      </div>
                      <span
                        className={`text-xs mt-2 font-medium transition-colors ${
                          currentStep === step.id
                            ? "text-blue-600"
                            : currentStep > step.id
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {step.name}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex-1 mx-2 relative">
                        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              currentStep > step.id ? "bg-green-500" : "bg-gray-300"
                            }`}
                            style={{
                              width: currentStep > step.id ? "100%" : "0%",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`p-6 ${showSidebarPreview && !previewMode ? "pr-80" : ""} transition-all duration-300`}>
          {previewMode ? (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">CV бэлэн боллоо! 🎉</h3>
                    <p className="text-sm text-gray-600">
                      Урьдчилан хараад, хэрэв таалагдвал PDF татаж авна уу
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewMode(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-all border border-gray-300 hover:shadow-md"
                    >
                      Засах
                    </button>
                    <button
                      onClick={generatePDF}
                      disabled={generating}
                      className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all transform hover:scale-105 disabled:transform-none flex items-center gap-2 shadow-lg"
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
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex justify-center overflow-auto">
                <div style={{ 
                  transform: "scale(0.8)",
                  transformOrigin: "top center"
                }}>
                {renderCVPreview()}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="mb-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {steps.find((s) => s.id === currentStep)?.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {currentStep === 1 && "CV-ийн харагдах байдлыг сонгоно уу"}
                      {currentStep === 2 && "Хувийн мэдээллийг бүрэн оруулна уу"}
                      {currentStep === 3 && "Ажлын туршлагаа дэлгэрэнгүй бичнэ үү"}
                      {currentStep === 4 && "Боловсролын мэдээллийг оруулна уу"}
                      {currentStep === 5 && "Ур чадваруудыг нэмнэ үү"}
                      {currentStep === 6 && "Нэмэлт мэдээллийг оруулна уу"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 rounded-full shadow-md">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    Алхам {currentStep} / {totalSteps}
                  </div>
                </div>
                {Object.keys(errors).length > 0 && (
                  <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-800 mb-2">Алдаа засах:</p>
                        <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                          {Object.values(errors).map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                {renderStepContent()}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:transform-none shadow-sm"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                  Өмнөх
                </button>
                {currentStep < totalSteps ? (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Дараагийн
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setPreviewMode(true)}
                    className="flex items-center gap-2 px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <EyeIcon className="w-5 h-5" />
                    Урьдчилан харах
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Preview */}
        {showSidebarPreview && !previewMode && (
          <div className="absolute top-0 right-0 w-96 h-full bg-white border-l-2 border-gray-300 overflow-y-auto z-20 shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="sticky top-0 bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-300 px-4 py-4 flex justify-between items-center shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Урьдчилан харах</h3>
                <p className="text-xs text-gray-500 mt-1">Real-time шинэчлэлт</p>
              </div>
              <button
                onClick={() => setShowSidebarPreview(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 transform scale-[0.35] origin-top-left" style={{ width: "285%" }}>
              <div className="bg-white shadow-lg">
                {renderCVPreview()}
              </div>
            </div>
          </div>
        )}
      </div>

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
  );
}
