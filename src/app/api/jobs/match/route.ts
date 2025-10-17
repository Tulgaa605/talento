import { NextResponse } from "next/server";
import { calculateJobMatches } from "@/lib/jobMatching";

interface JobCategory {
  titles: string[];
  keywords: string[];
}

interface JobCategories {
  marketing: JobCategory;
  design: JobCategory;
  technology: JobCategory;
  finance: JobCategory;
  sales: JobCategory;
  hr: JobCategory;
  engineering: JobCategory;
  content: JobCategory;
}

const jobCategories: JobCategories = {
  marketing: {
    titles: [
      "marketing manager",
      "маркетингийн менежер",
      "digital marketing manager",
      "дижитал маркетингийн менежер",
      "marketing specialist",
      "маркетингийн мэргэжилтэн",
      "marketing coordinator",
      "маркетингийн зохицуулагч",
    ],
    keywords: [
      "marketing",
      "маркетинг",
      "digital marketing",
      "дижитал маркетинг",
      "brand marketing",
      "брэнд маркетинг",
      "marketing strategy",
      "маркетингийн стратеги",
    ],
  },
  design: {
    titles: [
      "designer",
      "дизайнер",
      "senior designer",
      "ахлах дизайнер",
      "graphic designer",
      "график дизайнер",
      "ui designer",
      "ui дизайнер",
      "ux designer",
      "ux дизайнер",
      "product designer",
      "бүтээгдэхүүний дизайнер",
      "web designer",
      "веб дизайнер",
      "art director",
      "арт директор",
    ],
    keywords: [
      "design",
      "дизайн",
      "graphic",
      "график",
      "ui/ux",
      "user interface",
      "user experience",
      "creative",
      "бүтээлч",
      "adobe",
      "figma",
      "sketch",
      "photoshop",
      "illustrator",
    ],
  },
  technology: {
    titles: [
      "software engineer",
      "программист",
      "developer",
      "хөгжүүлэгч",
      "web developer",
      "веб хөгжүүлэгч",
      "frontend developer",
      "frontend хөгжүүлэгч",
      "backend developer",
      "backend хөгжүүлэгч",
      "full stack developer",
      "full stack хөгжүүлэгч",
    ],
    keywords: [
      "programming",
      "програмчлал",
      "coding",
      "кодчлол",
      "software",
      "программ хангамж",
      "development",
      "хөгжүүлэлт",
      "javascript",
      "python",
      "java",
      "react",
      "node",
    ],
  },
  finance: {
    titles: [
      "accountant",
      "нягтлан",
      "financial analyst",
      "санхүүгийн шинжээч",
      "finance manager",
      "санхүүгийн менежер",
      "financial controller",
      "санхүүгийн хянагч",
    ],
    keywords: [
      "finance",
      "санхүү",
      "accounting",
      "нягтлан бодох",
      "financial",
      "санхүүгийн",
      "banking",
      "банк",
      "budget",
      "төсөв",
    ],
  },
  sales: {
    titles: [
      "sales manager",
      "борлуулалтын менежер",
      "sales representative",
      "борлуулалтын төлөөлөгч",
      "business development",
      "бизнес хөгжүүлэлт",
    ],
    keywords: [
      "sales",
      "борлуулалт",
      "selling",
      "худалдаа",
      "business development",
      "бизнес хөгжүүлэлт",
      "account management",
      "хэрэглэгчийн удирдлага",
    ],
  },
  hr: {
    titles: [
      "hr manager",
      "хүний нөөцийн менежер",
      "recruiter",
      "ажилтан сонгон шалгаруулагч",
      "hr specialist",
      "хүний нөөцийн мэргэжилтэн",
    ],
    keywords: [
      "human resources",
      "хүний нөөц",
      "recruitment",
      "ажилтан авах",
      "hiring",
      "ажилд авах",
      "hr",
      "personnel",
      "боловсон хүчин",
    ],
  },
  engineering: {
    titles: [
      "engineer",
      "инженер",
      "mechanical engineer",
      "механик инженер",
      "civil engineer",
      "иргэний инженер",
      "electrical engineer",
      "цахилгаан инженер",
    ],
    keywords: [
      "engineering",
      "инженерчлэл",
      "mechanical",
      "механик",
      "electrical",
      "цахилгаан",
      "civil",
      "иргэний",
      "construction",
      "барилга",
    ],
  },
  content: {
    titles: [
      "content writer",
      "контент зохиогч",
      "copywriter",
      "копирайтер",
      "content creator",
      "контент бүтээгч",
      "editor",
      "редактор",
    ],
    keywords: [
      "content",
      "контент",
      "writing",
      "бичих",
      "copywriting",
      "копирайтинг",
      "editing",
      "редакторлах",
      "content creation",
      "контент бүтээх",
    ],
  },
};

export async function POST(req: Request) {
  try {
    console.log("Job matching API called");

    const { content } = await req.json();
    if (!content) {
      console.log("No CV content provided");
      return NextResponse.json(
        { error: "CV content is required" },
        { status: 400 }
      );
    }

    console.log("CV content received, length:", content.length);

    const matches = await calculateJobMatches(content);
    console.log("Found matches:", matches.length);

    if (matches.length === 0) {
      console.log("No matches found");
      return NextResponse.json([]);
    }

    const filteredMatches = matches
      .filter((match) => {
        const jobTitle = match.job.title.toLowerCase();
        const jobRequirements = match.job.requirements.toLowerCase();

        const cvTitle = content.toLowerCase();

        let cvCategory: keyof JobCategories | null = null;
        let maxKeywordMatches = 0;
        let maxTitleMatches = 0;

        for (const [category, data] of Object.entries(jobCategories) as [
          keyof JobCategories,
          JobCategory
        ][]) {
          let titleMatches = 0;
          let keywordMatches = 0;

          data.titles.forEach((title) => {
            if (cvTitle.includes(title)) titleMatches += 3;
          });

          data.keywords.forEach((keyword) => {
            if (cvTitle.includes(keyword)) keywordMatches += 1;
          });

          const totalMatches = titleMatches + keywordMatches;
          if (
            totalMatches > maxKeywordMatches ||
            (totalMatches === maxKeywordMatches &&
              titleMatches > maxTitleMatches)
          ) {
            maxKeywordMatches = totalMatches;
            maxTitleMatches = titleMatches;
            cvCategory = category;
          }
        }

        if (!cvCategory || (maxTitleMatches === 0 && maxKeywordMatches < 3)) {
          return false;
        }

        let jobTitleMatches = 0;
        let jobKeywordMatches = 0;
        const jobData = jobCategories[cvCategory];

        jobData.titles.forEach((title) => {
          if (jobTitle.includes(title)) jobTitleMatches += 3;
          if (jobRequirements.includes(title)) jobTitleMatches += 2;
        });

        jobData.keywords.forEach((keyword) => {
          if (jobTitle.includes(keyword)) jobKeywordMatches += 2;
          if (jobRequirements.includes(keyword)) jobKeywordMatches += 1;
        });

        const totalJobMatches = jobTitleMatches + jobKeywordMatches;
        if (jobTitleMatches === 0 || totalJobMatches < 4) {
          return false;
        }

        const hasGoodOverallScore = match.matchScore >= 65;
        const hasGoodSkills = match.matchDetails.skills >= 60;

        return hasGoodOverallScore && hasGoodSkills;
      })
      .sort((a, b) => {
        return b.matchScore - a.matchScore;
      })
      .slice(0, 10);

    console.log("Filtered matches:", filteredMatches.length);

    if (filteredMatches.length === 0) {
      console.log("No matches found with score >= 65%");
      return NextResponse.json([]);
    }

    const response = filteredMatches.map((match) => ({
      ...match,
      matchDetails: {
        experience: match.matchDetails.experience,
        skills: match.matchDetails.skills,
        education: match.matchDetails.education,
        overall: match.matchDetails.overall,
      },
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error matching jobs:", error);
    return NextResponse.json(
      { error: "Failed to match jobs" },
      { status: 500 }
    );
  }
}
