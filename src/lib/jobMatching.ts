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

export async function calculateJobMatches(
  cvContent: string
): Promise<JobMatch[]> {
  try {
    console.log("Starting job matching process...");

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

    const matches = await Promise.all(
      jobs.map(async (job: Job & { company: { name: string } }) => {
        try {
          console.log("Processing job:", job.title);
          const matchDetails = calculateDetailedMatchScore(
            cvContent,
            job.requirements || ""
          );
          console.log("Match details for", job.title, ":", matchDetails);

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
  jobRequirements: string
) {
  try {
    console.log("Calculating match score...");

    const cvLower = cvContent.toLowerCase();
    const reqLower = jobRequirements.toLowerCase();

    const matchScore = {
      requirements: 0,
      skills: 0,
      experience: 0,
      overall: 0,
    };

    const requirements = reqLower.split(/[.,]/).map((r) => r.trim());
    let matchedRequirements = 0;
    let totalRequirements = 0;

    requirements.forEach((req) => {
      if (req.length > 3) {
        totalRequirements++;
        if (cvLower.includes(req)) {
          matchedRequirements++;
        } else {
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
        : 80;

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
      requiredSkills > 0 ? (matchedSkills / requiredSkills) * 100 : 70;

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

    matchScore.overall = Math.round(
      matchScore.requirements * 0.5 +
        matchScore.skills * 0.3 +
        matchScore.experience * 0.2
    );

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
