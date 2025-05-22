import { prisma } from "./prisma";
import { Job } from "@prisma/client";

interface JobMatch {
  job: {
    id: string;
    title: string;
    company: {
      name: string;
    };
    location: string;
    salary?: string;
    requirements: string;
  };
  matchScore: number;
  matchDetails: {
    experience: number;
    skills: number;
    education: number;
    overall: number;
  };
}

interface SkillWithAlternatives {
  skill: string;
  weight: number;
  alternatives: string[];
}

interface SkillWithoutAlternatives {
  skill: string;
  weight: number;
}

type Skill = SkillWithAlternatives | SkillWithoutAlternatives;

interface ProfessionCriteria {
  mainTitles: string[];
  subTitles: string[];
  requiredSkills: string[];
  relatedKeywords: string[];
}

interface Professions {
  [key: string]: ProfessionCriteria;
}

const professions: Professions = {
  design: {
    mainTitles: ["designer", "дизайнер", "art director", "арт директор"],
    subTitles: [
      "graphic designer",
      "график дизайнер",
      "ui designer",
      "ui дизайнер",
      "ux designer",
      "ux дизайнер",
      "web designer",
      "веб дизайнер",
      "product designer",
      "бүтээгдэхүүний дизайнер",
      "senior designer",
      "ахлах дизайнер",
      "creative designer",
      "бүтээлч дизайнер",
    ],
    requiredSkills: [
      "adobe",
      "photoshop",
      "illustrator",
      "figma",
      "sketch",
      "design",
      "дизайн",
      "creative",
      "бүтээлч",
      "ui/ux",
      "typography",
      "layout",
      "graphic",
      "график",
    ],
    relatedKeywords: [
      "visual",
      "визуал",
      "creative",
      "бүтээлч",
      "artwork",
      "уран бүтээл",
      "composition",
      "композишн",
      "color theory",
      "өнгөний онол",
    ],
  },
  development: {
    mainTitles: [
      "developer",
      "хөгжүүлэгч",
      "engineer",
      "инженер",
      "programmer",
      "программист",
    ],
    subTitles: [
      "software engineer",
      "программ хангамжийн инженер",
      "web developer",
      "веб хөгжүүлэгч",
      "frontend developer",
      "frontend хөгжүүлэгч",
      "backend developer",
      "backend хөгжүүлэгч",
      "full stack developer",
      "full stack хөгжүүлэгч",
      "mobile developer",
      "мобайл хөгжүүлэгч",
    ],
    requiredSkills: [
      "programming",
      "програмчлал",
      "coding",
      "кодинг",
      "javascript",
      "python",
      "java",
      "c++",
      "php",
      "react",
      "angular",
      "vue",
      "node",
      "database",
    ],
    relatedKeywords: [
      "software",
      "программ хангамж",
      "development",
      "хөгжүүлэлт",
      "git",
      "api",
      "backend",
      "frontend",
      "full stack",
    ],
  },
  marketing: {
    mainTitles: ["marketing", "маркетинг", "marketer", "маркетер"],
    subTitles: [
      "marketing manager",
      "маркетингийн менежер",
      "digital marketing",
      "дижитал маркетинг",
      "marketing specialist",
      "маркетингийн мэргэжилтэн",
      "brand manager",
      "брэнд менежер",
      "marketing coordinator",
      "маркетингийн зохицуулагч",
    ],
    requiredSkills: [
      "marketing strategy",
      "маркетингийн стратеги",
      "digital marketing",
      "дижитал маркетинг",
      "social media",
      "сошиал медиа",
      "seo",
      "content marketing",
      "контент маркетинг",
    ],
    relatedKeywords: [
      "campaign",
      "кампайн",
      "analytics",
      "аналитик",
      "market research",
      "зах зээлийн судалгаа",
      "brand awareness",
      "брэндийн мэдрэмж",
    ],
  },
};

export async function calculateJobMatches(
  cvContent: string
): Promise<JobMatch[]> {
  try {
    console.log("Starting job matching process...");

    // Get all jobs from the database
    const jobs = await prisma.job.findMany({
      include: {
        company: true,
      },
    });
    console.log("Found jobs:", jobs.length);

    if (jobs.length === 0) {
      console.log("No jobs found in database");
      return [];
    }

    // Calculate matches for each job
    const matches = await Promise.all(
      jobs.map(async (job: Job & { company: { name: string } }) => {
        try {
          console.log("Processing job:", job.title);
          const matchDetails = await calculateDetailedMatchScore(
            cvContent,
            job.requirements || "",
            job.title
          );
          console.log("Match details for", job.title, ":", matchDetails);

          // Only include matches with overall score >= 60%
          if (matchDetails.overall < 60) {
            console.log(
              "Match score too low for",
              job.title,
              ":",
              matchDetails.overall
            );
            return null;
          }

          return {
            job: {
              id: job.id,
              title: job.title,
              company: {
                name: job.company.name,
              },
              location: job.location,
              salary: job.salary || undefined,
              requirements: job.requirements,
            },
            matchScore: matchDetails.overall,
            matchDetails,
          };
        } catch (error) {
          console.error("Error processing job:", job.title, error);
          return null;
        }
      })
    );

    // Filter out null matches and sort by score
    const validMatches = matches.filter(
      (match) => match !== null
    ) as JobMatch[];
    console.log("Valid matches with score >= 60%:", validMatches.length);

    const sortedMatches = validMatches.sort(
      (a, b) => b.matchScore - a.matchScore
    );
    console.log("Sorted matches:", sortedMatches.length);

    return sortedMatches;
  } catch (error) {
    console.error("Error calculating job matches:", error);
    return [];
  }
}

async function calculateDetailedMatchScore(
  cvContent: string,
  jobRequirements: string,
  jobTitle: string
) {
  try {
    console.log("Calculating match score...");
    console.log("CV Content length:", cvContent.length);
    console.log("Job Requirements:", jobRequirements);
    console.log("Job Title:", jobTitle);

    // First, determine the profession category
    const cvLower = cvContent.toLowerCase();
    const reqLower = jobRequirements.toLowerCase();
    const jobTitleLower = jobTitle.toLowerCase();

    // Find profession match
    let professionMatch = null;
    let professionScore = 0;
    let maxScore = 0;

    for (const [profession, criteria] of Object.entries(professions)) {
      let score = 0;

      // Check main titles (highest weight)
      for (const title of criteria.mainTitles) {
        if (cvLower.includes(title)) score += 10;
        if (jobTitleLower.includes(title)) score += 10;
      }

      // Check sub titles (high weight)
      for (const title of criteria.subTitles) {
        if (cvLower.includes(title)) score += 8;
        if (jobTitleLower.includes(title)) score += 8;
      }

      // Check required skills (medium weight)
      for (const skill of criteria.requiredSkills) {
        if (cvLower.includes(skill)) score += 5;
        if (reqLower.includes(skill)) score += 5;
      }

      // Check related keywords (low weight)
      for (const keyword of criteria.relatedKeywords) {
        if (cvLower.includes(keyword)) score += 3;
        if (reqLower.includes(keyword)) score += 3;
      }

      if (score > maxScore) {
        maxScore = score;
        professionMatch = profession;
        professionScore = score;
      }
    }

    // If no strong profession match or professions don't match
    if (!professionMatch || professionScore < 20) {
      console.log("No strong profession match found");
      return {
        experience: 0,
        skills: 0,
        education: 0,
        overall: 0,
      };
    }

    // If CV profession and job profession don't match
    const cvProfession = getProfessionFromContent(cvLower, professions);
    const jobProfession = getProfessionFromContent(
      jobTitleLower + " " + reqLower,
      professions
    );

    if (cvProfession !== jobProfession) {
      console.log("Profession mismatch:", cvProfession, "vs", jobProfession);
      return {
        experience: 0,
        skills: 0,
        education: 0,
        overall: 0,
      };
    }

    // Continue with normal scoring only if professions match
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
            "X-Title": "Job Matcher",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "mistralai/mistral-7b-instruct:free",
            max_tokens: 500,
            temperature: 0.3,
            messages: [
              {
                role: "system",
                content: `You are a job matching expert for ${professionMatch} roles. Analyze the CV content and job requirements, then provide ONLY a JSON object with match scores. The CV and job are already confirmed to be in the same profession category. Do not include any explanatory text.

The response must be a valid JSON object in this exact format:
{
  "experience": number,
  "skills": number,
  "education": number,
  "overall": number
}

Calculate the scores based on:

1. Experience Match (35% of total):
   - Years of experience
   - Relevant experience
   - Project experience
   - Industry experience

2. Skills Match (45% of total):
   - Core skills for ${professionMatch}
   - Technical skills
   - Software proficiency
   - Industry knowledge

3. Education Match (20% of total):
   - Relevant degree
   - Certifications
   - Training
   - Portfolio (if applicable)

Each score should be between 0 and 100.
The overall score should be: (experience * 0.35) + (skills * 0.45) + (education * 0.20)

Return ONLY the JSON object, no other text.`,
              },
              {
                role: "user",
                content: `CV Content: ${cvContent}\n\nJob Requirements: ${jobRequirements}\n\nReturn match scores as JSON:`,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to parse error response" }));
        console.error("OpenRouter error:", errorData);

        // Check if it's a rate limit error
        if (errorData.error?.code === 429) {
          console.log("Rate limit exceeded, using fallback matching");
          return calculateFallbackMatchScore(
            cvContent,
            jobRequirements,
            professionMatch
          );
        }

        throw new Error("Failed to calculate match score");
      }

      const data = await response.json();
      console.log("OpenRouter response:", data);

      if (!data?.choices?.[0]?.message?.content) {
        console.error("Invalid response format:", data);
        return calculateFallbackMatchScore(
          cvContent,
          jobRequirements,
          professionMatch
        );
      }

      let scores;
      try {
        const content = data.choices[0].message.content.trim();
        // Try to extract JSON if it's wrapped in other text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : content;
        scores = JSON.parse(jsonStr);

        // Validate the scores object has all required fields
        if (
          !scores.experience ||
          !scores.skills ||
          !scores.education ||
          !scores.overall
        ) {
          console.error("Invalid scores object:", scores);
          return calculateFallbackMatchScore(
            cvContent,
            jobRequirements,
            professionMatch
          );
        }
      } catch (error) {
        console.error("Error parsing match scores:", error);
        return calculateFallbackMatchScore(
          cvContent,
          jobRequirements,
          professionMatch
        );
      }

      // Ensure all scores are between 0 and 100
      return {
        experience: Math.min(Math.max(scores.experience, 0), 100),
        skills: Math.min(Math.max(scores.skills, 0), 100),
        education: Math.min(Math.max(scores.education, 0), 100),
        overall: Math.min(Math.max(scores.overall, 0), 100),
      };
    } catch (error) {
      console.error("Error calculating match score:", error);
      return calculateFallbackMatchScore(
        cvContent,
        jobRequirements,
        professionMatch
      );
    }
  } catch (error) {
    console.error("Error in match calculation:", error);
    return {
      experience: 0,
      skills: 0,
      education: 0,
      overall: 0,
    };
  }
}

function getProfessionFromContent(
  content: string,
  professions: Professions
): string | null {
  let bestMatch = null;
  let maxScore = 0;

  for (const [profession, criteria] of Object.entries(professions)) {
    let score = 0;

    // Main titles are most important
    for (const title of criteria.mainTitles) {
      if (content.includes(title)) score += 10;
    }

    // Sub titles are next most important
    for (const title of criteria.subTitles) {
      if (content.includes(title)) score += 8;
    }

    // Required skills add some weight
    for (const skill of criteria.requiredSkills) {
      if (content.includes(skill)) score += 5;
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = profession;
    }
  }

  // Only return a profession if we have a strong match
  return maxScore >= 15 ? bestMatch : null;
}

function calculateFallbackMatchScore(
  cvContent: string,
  jobRequirements: string,
  profession: string
) {
  try {
    console.log("Using profession-specific fallback matching algorithm");

    const cvLower = cvContent.toLowerCase();
    const requirementsLower = jobRequirements.toLowerCase();

    // Get profession-specific criteria
    const criteria = professions[profession];
    if (!criteria) {
      return {
        experience: 0,
        skills: 0,
        education: 0,
        overall: 0,
      };
    }

    // Calculate experience score
    let experienceScore = calculateExperienceScore(
      cvLower,
      requirementsLower,
      criteria
    );

    // Calculate skills score
    let skillsScore = calculateSkillsScore(
      cvLower,
      requirementsLower,
      criteria
    );

    // Calculate education score
    let educationScore = calculateEducationScore(cvLower, requirementsLower);

    // Calculate overall score
    const overallScore =
      experienceScore * 0.35 + skillsScore * 0.45 + educationScore * 0.2;

    return {
      experience: Math.round(experienceScore),
      skills: Math.round(skillsScore),
      education: Math.round(educationScore),
      overall: Math.round(overallScore),
    };
  } catch (error) {
    console.error("Error in fallback matching:", error);
    return {
      experience: 0,
      skills: 0,
      education: 0,
      overall: 0,
    };
  }
}

function calculateExperienceScore(
  cv: string,
  requirements: string,
  criteria: ProfessionCriteria
): number {
  let score = 0;

  // Extract years of experience
  const yearsPattern = /(\d+)\s*(?:жил|year|years?)\s*(?:туршлага|experience)/i;
  const cvYears = parseInt(cv.match(yearsPattern)?.[1] || "0");
  const reqYears = parseInt(requirements.match(yearsPattern)?.[1] || "0");

  if (reqYears === 0 || cvYears >= reqYears) {
    score += 40;
  } else {
    score += (cvYears / reqYears) * 40;
  }

  // Check for relevant experience keywords
  for (const title of [...criteria.mainTitles, ...criteria.subTitles]) {
    if (cv.includes(title)) score += 20;
  }

  // Check for project experience
  if (cv.includes("project") || cv.includes("төсөл")) score += 20;

  return Math.min(score, 100);
}

function calculateSkillsScore(
  cv: string,
  requirements: string,
  criteria: ProfessionCriteria
): number {
  let score = 0;
  let reqSkillsFound = 0;

  // Check required skills
  for (const skill of criteria.requiredSkills) {
    if (requirements.includes(skill)) {
      reqSkillsFound++;
      if (cv.includes(skill)) score += 30;
    }
  }

  // Normalize score based on number of required skills
  if (reqSkillsFound > 0) {
    score = (score / reqSkillsFound) * 60;
  }

  // Add bonus for additional relevant skills
  for (const keyword of criteria.relatedKeywords) {
    if (cv.includes(keyword)) score += 10;
  }

  return Math.min(score, 100);
}

function calculateEducationScore(cv: string, requirements: string): number {
  let score = 0;

  // Check education level
  if (cv.includes("master") || cv.includes("магистр")) score += 40;
  else if (cv.includes("bachelor") || cv.includes("бакалавр")) score += 30;
  else if (cv.includes("degree") || cv.includes("зэрэг")) score += 20;

  // Check for relevant certifications
  if (cv.includes("certification") || cv.includes("гэрчилгээ")) score += 30;

  // Check for training
  if (cv.includes("training") || cv.includes("сургалт")) score += 20;

  // Check for portfolio
  if (cv.includes("portfolio") || cv.includes("портфолио")) score += 10;

  return Math.min(score, 100);
}
