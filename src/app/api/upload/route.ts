import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mammoth from "mammoth";
import { prisma } from "@/lib/prisma";
import { spawn } from "child_process";
import { promisify } from "util";
import { writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { calculateJobMatches } from "@/lib/jobMatching";

interface PythonResult {
  success: boolean;
  text?: string;
  error?: string;
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Create a temporary file
    const tempFile = join(tmpdir(), `pdf-${Date.now()}.pdf`);
    await writeFile(tempFile, buffer);

    // Run Python script
    const pythonProcess = spawn("python", ["scripts/pdf_parser.py"]);

    // Send PDF data to Python script
    pythonProcess.stdin.write(buffer.toString("base64"));
    pythonProcess.stdin.end();

    // Get result from Python script
    const result = await new Promise<PythonResult>((resolve, reject) => {
      let output = "";
      pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
      });
      pythonProcess.stderr.on("data", (data) => {
        console.error("Python error:", data.toString());
      });
      pythonProcess.on("close", (code) => {
        if (code === 0) {
          try {
            resolve(JSON.parse(output));
          } catch (e) {
            reject(new Error("Failed to parse Python output"));
          }
        } else {
          reject(new Error(`Python process exited with code ${code}`));
        }
      });
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to parse PDF");
    }

    return result.text || "";
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw error;
  }
}

async function analyzeCV(content: string) {
  try {
    console.log("Starting CV analysis...");

    // First try with OpenRouter API
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const response: Response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "HTTP-Referer":
                process.env.NEXTAUTH_URL || "http://localhost:3000",
              "X-Title": "CV Analyzer",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "deepseek/deepseek-v3-base:free",
              max_tokens: 2000,
              temperature: 0.7,
              messages: [
                {
                  role: "system",
                  content: `You are a CV analyzer. Analyze the following CV content and provide detailed feedback in Mongolian language.

CV Content: ${content}

Provide a comprehensive analysis in this exact format:

CV Шинжилгээ:

- Хүч талууд:
  * Тодорхой бичнэ үү
  * Жишээгээр дэмжнэ үү

- Сул талууд:
  * Тодорхой бичнэ үү
  * Жишээгээр дэмжнэ үү

Сайжруулах Хэсгүүд:
- Хэсэг бүрийг тодорхойлно уу
- Яагаад сайжруулах шаардлагатайг тайлбарлана уу
- Жишээгээр дэмжнэ үү

Тодорхой Зөвлөмж:
- Хэсэг бүрт тодорхой зөвлөмж өгнө үү
- Хэрэгжүүлэх боломжтой байх ёстой
- Жишээгээр дэмжнэ үү

Жишээ болон Хувилбарууд:
- Хэсэг бүрт жишээ өгнө үү
- Хувилбаруудыг тодорхойлно уу
- Яагаад эдгээр нь сайн гэдгийг тайлбарлана уу

Алхам Алхмаар Зааварчилгаа:
- Хэсэг бүрийг хэрхэн сайжруулах вэ
- Тодорхой алхмуудыг бичнэ үү
- Жишээгээр дэмжнэ үү

Хариултаа дэлгэрэнгүй, тодорхой, ойлгомжтой байлгана уу.`,
                },
                {
                  role: "user",
                  content: `Дараах CV-г дээрх алхмуудыг дагаж шинжилж, дэлгэрэнгүй санал болгож өгнө үү: ${content}`,
                },
              ],
            }),
          }
        );

        if (response.ok) {
          const data: any = await response.json();
          if (data?.choices?.[0]?.message?.content) {
            const analysis = data.choices[0].message.content;
            // Validate that the analysis contains the expected sections
            if (
              analysis.includes("CV Шинжилгээ:") &&
              analysis.includes("Хүч талууд:") &&
              analysis.includes("Сул талууд:")
            ) {
              return analysis;
            }
          }
        }
      } catch (error) {
        console.error("OpenRouter API error:", error);
      }
    }

    // Fallback to local analysis if API fails or rate limited
    console.log("Using fallback analysis...");
    return generateFallbackAnalysis(content);
  } catch (error) {
    console.error("CV analysis error:", error);
    return generateFallbackAnalysis(content);
  }
}

function generateFallbackAnalysis(content: string): string {
  const cvLower = content.toLowerCase();

  // Extract basic information
  const name = content.split("\n")[0] || "Нэр олдсонгүй";
  const experience = extractExperience(cvLower);
  const skills = extractSkills(cvLower);
  const education = extractEducation(cvLower);

  return `CV Шинжилгээ:

- Хүч талууд:
  * ${experience.years} жилийн ${experience.field} туршлагатай
  * ${skills.technical.join(", ")} гэсэн техникийн ур чадвартай
  * ${education.level} боловсролтой

- Сул талууд:
  * ${
    skills.missing.length > 0
      ? skills.missing.join(", ") + " гэсэн ур чадвар нэмэх шаардлагатай"
      : "Тодорхой сул тал илрээгүй"
  }
  * ${
    experience.missing.length > 0
      ? experience.missing.join(", ") + " гэсэн туршлага нэмэх шаардлагатай"
      : "Тодорхой сул тал илрээгүй"
  }

Сайжруулах Хэсгүүд:
- Ур чадварын хэсгийг тодорхойлно уу
- Ажлын туршлагыг тоон үзүүлэлтээр харуулах
- Боловсролын мэдээллийг тодорхой бичих

Тодорхой Зөвлөмж:
- Ур чадварын хэсэгт сертификатуудыг нэмэх
- Ажлын туршлагыг жишээгээр дэмжих
- Боловсролын мэдээллийг дэлгэрэнгүй бичих

Жишээ болон Хувилбарууд:
- Ур чадвар: "Python, JavaScript, React, Node.js, MongoDB"
- Туршлага: "3 жилийн веб хөгжүүлэлтийн туршлага"
- Боловсрол: "Бакалавр, Мэдээллийн технологи"

Алхам Алхмаар Зааварчилгаа:
1. Ур чадварын хэсгийг сайжруулах
2. Ажлын туршлагыг дэлгэрэнгүй бичих
3. Боловсролын мэдээллийг тодруулах`;
}

function extractExperience(text: string): {
  years: number;
  field: string;
  missing: string[];
} {
  const experiencePatterns = [
    /(\d+)\s*(?:жил|year|years?)\s*(?:туршлага|experience)/i,
    /(\d+)\s*(?:жил|year|years?)\s*(?:ажилласан|worked)/i,
  ];

  let years = 0;
  let field = "ажлын";
  const missing = [];

  for (const pattern of experiencePatterns) {
    const match = text.match(pattern);
    if (match) {
      years = parseInt(match[1]);
      break;
    }
  }

  if (text.includes("маркетинг")) field = "маркетингийн";
  else if (text.includes("программист")) field = "програмчлалын";
  else if (text.includes("дизайн")) field = "дизайны";

  if (years < 2) missing.push("2-3 жилийн туршлага");
  if (!text.includes("проект")) missing.push("төслийн туршлага");

  return { years, field, missing };
}

function extractSkills(text: string): {
  technical: string[];
  missing: string[];
} {
  const technical = [];
  const missing = [];

  if (text.includes("сошиал медиа")) technical.push("Сошиал медиа");
  if (text.includes("маркетинг")) technical.push("Маркетинг");
  if (text.includes("брэнд")) technical.push("Брэнд");
  if (text.includes("судалгаа")) technical.push("Судалгаа");
  if (text.includes("хэрэглэгч")) technical.push("Хэрэглэгчийн зан төлөв");
  if (text.includes("баг")) technical.push("Багийн ажил");
  if (text.includes("удирдлага")) technical.push("Удирдлага");
  if (text.includes("стратеги")) technical.push("Стратеги");
  if (text.includes("төсөл")) technical.push("Төслийн удирдлага");

  if (!text.includes("англи хэл")) missing.push("Англи хэл");
  if (!text.includes("компьютер")) missing.push("Компьютер");
  if (!text.includes("коммуникаци")) missing.push("Коммуникацийн ур чадвар");

  return { technical, missing };
}

function extractEducation(text: string): { level: string } {
  if (text.includes("магистр")) return { level: "Магистр" };
  if (text.includes("бакалавр")) return { level: "Бакалавр" };
  if (text.includes("доктор")) return { level: "Доктор" };
  return { level: "Дунд" };
}

export async function POST(req: Request) {
  try {
    console.log("Upload route called");

    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("File received:", file.name, file.type);

    // Process file
    console.log("Processing file...");
    let content = "";

    try {
      const buffer = Buffer.from(await file.arrayBuffer());

      if (file.type === "application/pdf") {
        console.log("Processing PDF...");
        content = await extractTextFromPDF(buffer);
      } else if (file.type.includes("word")) {
        console.log("Processing Word document...");
        const result = await mammoth.extractRawText({ buffer });
        content = result.value;
      } else {
        throw new Error("Unsupported file type");
      }

      if (!content || content.trim().length === 0) {
        throw new Error("Failed to extract content from file");
      }

      console.log("Content extracted:", content.substring(0, 100) + "...");

      // Analyze CV
      console.log("Analyzing CV...");
      const analysis = await analyzeCV(content);
      console.log("CV analysis completed");

      if (!analysis || analysis.trim().length === 0) {
        throw new Error("CV analysis failed");
      }

      console.log("Saving to database...");
      // Save CV to database
      const cv = await prisma.cV.create({
        data: {
          userId: session.user.id,
          fileName: file.name,
          content: content,
          analysis: analysis,
          status: "PENDING",
          fileUrl: `/uploads/${Date.now()}-${file.name}`,
        },
      });

      // Save file to public directory
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      await writeFile(join(uploadDir, `${Date.now()}-${file.name}`), buffer);

      // Calculate job matches
      const matches = await calculateJobMatches(content);

      return NextResponse.json({
        success: true,
        cv,
        analysis,
        matches,
      });
    } catch (error) {
      console.error("File processing error:", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Failed to process the file",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to upload file",
      },
      { status: 500 }
    );
  }
}
