import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // Create sample companies first
    const companies = [
      {
        name: "Tech Corp",
        description: "Leading technology company",
        location: "Улаанбаатар",
      },
      {
        name: "Digital Solutions",
        description: "Digital marketing agency",
        location: "Улаанбаатар",
      },
      {
        name: "Marketing Pro",
        description: "Professional marketing services",
        location: "Улаанбаатар",
      },
    ];

    const createdCompanies = await Promise.all(
      companies.map((company) => prisma.company.create({ data: company }))
    );

    // Create sample jobs with company references
    const jobs = [
      {
        title: "Маркетингийн Менежер",
        description:
          "Маркетингийн менежер ажилд авна. Бид таныг манай багт нэгдэхийг хүсч байна.",
        requirements:
          "3-5 жилийн маркетингийн туршлага, сошиал медиа, цахим маркетинг мэдлэгтэй, бүтээлч сэтгэлгээ, багийн ажил, баг удирдах чадвар, англи хэл мэдлэг (туслах), судалгаа хийх, хэрэглэгчийн зан төлөв ойлгох чадвартай байх",
        location: "Улаанбаатар",
        salary: "₮3,000,000 - ₮5,000,000",
        companyId: createdCompanies[0].id,
      },
      {
        title: "Сошиал Медиа Менежер",
        description:
          "Сошиал медиа менежер ажилд авна. Бид таныг манай багт нэгдэхийг хүсч байна.",
        requirements:
          "2-3 жилийн сошиал медиа туршлага, контент бүтээх, кампанит ажил зохион байгуулах, аналитик, хэрэглэгчийн зан төлөв ойлгох чадвартай байх",
        location: "Улаанбаатар",
        salary: "₮2,500,000 - ₮4,000,000",
        companyId: createdCompanies[1].id,
      },
      {
        title: "Маркетингийн Специалист",
        description:
          "Маркетингийн специалист ажилд авна. Бид таныг манай багт нэгдэхийг хүсч байна.",
        requirements:
          "1-2 жилийн маркетингийн туршлага, сошиал медиа, цахим маркетинг мэдлэгтэй, бүтээлч сэтгэлгээ, багийн ажил, англи хэл мэдлэг (туслах)",
        location: "Улаанбаатар",
        salary: "₮2,000,000 - ₮3,500,000",
        companyId: createdCompanies[2].id,
      },
    ];

    for (const job of jobs) {
      await prisma.job.create({
        data: job,
      });
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
