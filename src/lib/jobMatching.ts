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
  service: {
    mainTitles: [
      "service",
      "үйлчилгээ",
      "customer service",
      "үйлчлэгч",
      "cashier",
      "касс",
      "waiter",
      "офицант",
      "hostess",
      "хостэс",
      "staff",
      "ажилтан",
    ],
    subTitles: [
      "service staff",
      "үйлчилгээний ажилтан",
      "customer service representative",
      "үйлчилгээний төлөөлөгч",
      "front desk",
      "урд талбайн ажилтан",
      "service assistant",
      "үйлчилгээний туслах",
    ],
    requiredSkills: [
      "communication",
      "харилцаа",
      "customer service",
      "үйлчилгээ",
      "teamwork",
      "багаар ажиллах",
      "responsible",
      "хариуцлагатай",
      "clean",
      "цэвэр",
      "fast",
      "түргэн",
      "friendly",
      "найрсаг",
      "polite",
      "эелдэг",
      "organized",
      "нямбай",
      "efficient",
      "шуурхай",
    ],
    relatedKeywords: [
      "hospitality",
      "зочид үйлчилгээ",
      "retail",
      "жижиглэн",
      "food service",
      "хоолны үйлчилгээ",
      "customer care",
      "үйлчлүүлэгчийн үйлчилгээ",
      "service quality",
      "үйлчилгээний чанар",
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

          // Only include matches with overall score >= 50%
          if (matchDetails.overall < 50) {
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
    console.log("Valid matches with score >= 50%:", validMatches.length);

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

function calculateDetailedMatchScore(
  cvContent: string,
  jobRequirements: string,
  jobTitle: string
) {
  try {
    console.log("Calculating match score...");

    const cvLower = cvContent.toLowerCase();
    const reqLower = jobRequirements.toLowerCase();
    const jobTitleLower = jobTitle.toLowerCase();

    // Simplified matching logic
    let matchScore = {
      requirements: 0,
      skills: 0,
      experience: 0,
      overall: 0,
    };

    // Requirements matching (50% of total)
    const requirements = reqLower.split(/[.,]/).map((r) => r.trim());
    let matchedRequirements = 0;
    let totalRequirements = 0;

    requirements.forEach((req) => {
      if (req.length > 3) {
        // Ignore very short requirements
        totalRequirements++;
        if (cvLower.includes(req)) {
          matchedRequirements++;
        } else {
          // Check for partial matches
          const words = req.split(/\s+/);
          const matchedWords = words.filter(
            (word) => word.length > 3 && cvLower.includes(word)
          );
          if (matchedWords.length >= words.length * 0.5) {
            matchedRequirements += 0.5;
          }
        }
      }
    });

    matchScore.requirements =
      totalRequirements > 0
        ? (matchedRequirements / totalRequirements) * 100
        : 80; // Default score if no specific requirements

    // Skills matching (30% of total)
    const skills = [
      "communication",
      "харилцаа",
      "харилцааны соёл",
      "teamwork",
      "багаар ажиллах",
      "хамтран ажиллах",
      "responsible",
      "хариуцлагатай",
      "хариуцлага",
      "clean",
      "цэвэр",
      "цэвэрч",
      "fast",
      "түргэн",
      "шуурхай",
      "friendly",
      "найрсаг",
      "эелдэг",
      "polite",
      "эелдэг",
      "соёлтой",
      "organized",
      "нямбай",
      "зохион байгуулалт",
      "efficient",
      "шуурхай",
      "үр дүнтэй",
      "customer service",
      "үйлчилгээ",
      "үйлчлэгч",
      "service",
      "үйлчилгээ",
      "үйлчлэл",
      "cashier",
      "касс",
      "кассир",
      "sales",
      "борлуулалт",
      "зар",
      "retail",
      "жижиглэн",
      "худалдаа",
    ];

    let matchedSkills = 0;
    let requiredSkills = 0;

    skills.forEach((skill) => {
      if (reqLower.includes(skill)) {
        requiredSkills++;
        if (cvLower.includes(skill)) {
          matchedSkills++;
        } else {
          // Check for partial matches
          const words = skill.split(/\s+/);
          const matchedWords = words.filter(
            (word) => word.length > 3 && cvLower.includes(word)
          );
          if (matchedWords.length >= words.length * 0.5) {
            matchedSkills += 0.5;
          }
        }
      }
    });

    matchScore.skills =
      requiredSkills > 0 ? (matchedSkills / requiredSkills) * 100 : 70; // Default score if no specific skills required

    // Experience matching (20% of total)
    const noExperienceRequired =
      reqLower.includes("туршлага шаардахгүй") ||
      reqLower.includes("no experience required") ||
      reqLower.includes("сургалт хийнэ");

    if (noExperienceRequired) {
      matchScore.experience = 100;
    } else {
      const yearsPattern =
        /(\d+)\s*(?:жил|year|years?)\s*(?:туршлага|experience)/i;
      const cvYears = parseInt(cvLower.match(yearsPattern)?.[1] || "0");
      const reqYears = parseInt(reqLower.match(yearsPattern)?.[1] || "0");

      if (reqYears === 0) {
        matchScore.experience = 80;
      } else if (cvYears >= reqYears) {
        matchScore.experience = 100;
      } else {
        matchScore.experience = (cvYears / reqYears) * 100;
      }
    }

    // Calculate overall score
    matchScore.overall = Math.round(
      matchScore.requirements * 0.5 +
        matchScore.skills * 0.3 +
        matchScore.experience * 0.2
    );

    // Ensure minimum score for good matches
    if (matchScore.requirements > 70 && matchScore.skills > 70) {
      matchScore.overall = Math.max(matchScore.overall, 80);
    }

    return {
      experience: Math.round(matchScore.experience),
      skills: Math.round(matchScore.skills),
      education: Math.round(matchScore.requirements),
      overall: matchScore.overall,
    };
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

    // Calculate experience score - More lenient scoring
    let experienceScore = calculateExperienceScore(
      cvLower,
      requirementsLower,
      criteria
    );

    // Calculate skills score - More lenient matching
    let skillsScore = calculateSkillsScore(
      cvLower,
      requirementsLower,
      criteria
    );

    // Calculate education score - More lenient education matching
    let educationScore = calculateEducationScore(cvLower, requirementsLower);

    // Calculate overall score with adjusted weights
    const overallScore =
      experienceScore * 0.3 + skillsScore * 0.4 + educationScore * 0.3;

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

  // Check if experience is required
  const noExperienceRequired =
    requirements.toLowerCase().includes("туршлага шаардахгүй") ||
    requirements.toLowerCase().includes("no experience required") ||
    requirements.toLowerCase().includes("сургалт хийнэ");

  if (noExperienceRequired) {
    score += 80; // High base score when no experience required
  } else {
    // More lenient years of experience matching
    const yearsPattern =
      /(\d+)\s*(?:жил|year|years?)\s*(?:туршлага|experience)/i;
    const cvYears = parseInt(cv.match(yearsPattern)?.[1] || "0");
    const reqYears = parseInt(requirements.match(yearsPattern)?.[1] || "0");

    if (reqYears === 0) {
      score += 70;
    } else if (cvYears >= reqYears) {
      score += 70;
    } else {
      score += (cvYears / reqYears) * 70;
    }
  }

  // Check for relevant experience keywords - More lenient matching
  for (const title of [...criteria.mainTitles, ...criteria.subTitles]) {
    if (cv.toLowerCase().includes(title.toLowerCase())) score += 15;
  }

  // Check for project experience - More lenient
  if (
    cv.toLowerCase().includes("project") ||
    cv.toLowerCase().includes("төсөл") ||
    cv.toLowerCase().includes("experience") ||
    cv.toLowerCase().includes("туршлага") ||
    cv.toLowerCase().includes("сургалт")
  ) {
    score += 15;
  }

  return Math.min(score, 100);
}

function calculateSkillsScore(
  cv: string,
  requirements: string,
  criteria: ProfessionCriteria
): number {
  let score = 0;
  let reqSkillsFound = 0;
  let matchedSkills = 0;

  // Check for soft skills first
  const softSkills = [
    "communication",
    "харилцаа",
    "харилцааны соёл",
    "teamwork",
    "багаар ажиллах",
    "хамтран ажиллах",
    "responsible",
    "хариуцлагатай",
    "хариуцлага",
    "clean",
    "цэвэр",
    "цэвэрч",
    "fast",
    "түргэн",
    "шуурхай",
    "friendly",
    "найрсаг",
    "эелдэг",
    "polite",
    "эелдэг",
    "соёлтой",
    "organized",
    "нямбай",
    "зохион байгуулалт",
    "efficient",
    "шуурхай",
    "үр дүнтэй",
  ];

  // Count matching soft skills
  softSkills.forEach((skill) => {
    if (requirements.toLowerCase().includes(skill.toLowerCase())) {
      reqSkillsFound++;
      if (cv.toLowerCase().includes(skill.toLowerCase())) {
        score += 15;
        matchedSkills++;
      }
    }
  });

  // Check required skills - More lenient matching
  for (const skill of criteria.requiredSkills) {
    if (requirements.toLowerCase().includes(skill.toLowerCase())) {
      reqSkillsFound++;
      // Check for exact match or partial match
      if (cv.toLowerCase().includes(skill.toLowerCase())) {
        score += 20;
        matchedSkills++;
      } else {
        // Check for partial matches
        const skillWords = skill.split(/\s+/);
        if (
          skillWords.some((word) =>
            cv.toLowerCase().includes(word.toLowerCase())
          )
        ) {
          score += 10;
          matchedSkills++;
        }
      }
    }
  }

  // Add bonus for additional relevant skills
  for (const keyword of criteria.relatedKeywords) {
    if (cv.toLowerCase().includes(keyword.toLowerCase())) score += 10;
  }

  // If no required skills found, give a base score
  if (reqSkillsFound === 0) {
    score = 70; // Higher base score when no specific skills required
  } else {
    // Normalize score based on matched skills
    score = Math.max(score, (matchedSkills / reqSkillsFound) * 80);
  }

  // Additional bonus for matching all soft skills
  if (matchedSkills >= reqSkillsFound * 0.8) {
    score += 20;
  }

  return Math.min(score, 100);
}

function calculateEducationScore(cv: string, requirements: string): number {
  let score = 0;

  // More lenient education level matching
  if (
    cv.includes("master") ||
    cv.includes("магистр") ||
    cv.includes("masters")
  ) {
    score += 50;
  } else if (
    cv.includes("bachelor") ||
    cv.includes("бакалавр") ||
    cv.includes("bachelors")
  ) {
    score += 40;
  } else if (
    cv.includes("degree") ||
    cv.includes("зэрэг") ||
    cv.includes("diploma")
  ) {
    score += 30;
  } else {
    score += 20; // Base score for any education
  }

  // More lenient certification matching
  if (
    cv.includes("certification") ||
    cv.includes("гэрчилгээ") ||
    cv.includes("certificate")
  ) {
    score += 30;
  }

  // More lenient training matching
  if (
    cv.includes("training") ||
    cv.includes("сургалт") ||
    cv.includes("course")
  ) {
    score += 20;
  }

  // More lenient portfolio matching
  if (
    cv.includes("portfolio") ||
    cv.includes("портфолио") ||
    cv.includes("projects")
  ) {
    score += 20;
  }

  return Math.min(score, 100);
}
