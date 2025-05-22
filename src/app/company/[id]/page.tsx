import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Navigation";

export default async function CompanyProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const companyId = params.id;

  const company = await prisma.company.findUnique({
    where: {
      id: companyId,
    },
    include: {
      jobs: {
        where: {
          status: "ACTIVE",
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!company) {
    redirect("/404");
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-[70px]">
        {/* Cover Image */}
        <div className="relative h-80 bg-gradient-to-r from-blue-600 to-indigo-600">
          {company.coverImageUrl ? (
            <Image
              src={company.coverImageUrl}
              alt={`${company.name} cover`}
              fill
              className="object-cover brightness-75"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-4xl font-bold mb-2">{company.name}</h1>
                  <p className="text-lg opacity-90">Ажлын байрны платформ</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-20">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 relative">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-32 h-32 rounded-xl bg-white flex items-center justify-center overflow-hidden border-4 border-white shadow-xl -mt-16">
                {company.logoUrl ? (
                  <Image
                    src={company.logoUrl}
                    alt={`${company.name} logo`}
                    width={128}
                    height={128}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-5xl font-bold text-gray-400">
                    {company.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {company.name}
                </h1>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {company.website}
                  </a>
                )}
              </div>
            </div>

            {company.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Байгууллагын тухай
                </h2>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {company.description}
                </p>
              </div>
            )}

            {session?.user?.role === "EMPLOYER" && (
              <Link
                href="/employer/profile"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Профайл засах
              </Link>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Идэвхтэй ажлын байрууд
            </h2>
            {company.jobs.length > 0 ? (
              <div className="space-y-4">
                {company.jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Цалин:</span>{" "}
                            {job.salary || "Тохиролцоно"}
                          </div>
                          <div>
                            <span className="font-medium">Байршил:</span>{" "}
                            {job.location}
                          </div>
                          <div>
                            <span className="font-medium">Төрөл:</span>{" "}
                            {job.type === "FULL_TIME"
                              ? "Бүтэн цаг"
                              : job.type === "PART_TIME"
                              ? "Хагас цаг"
                              : job.type === "CONTRACT"
                              ? "Гэрээт"
                              : job.type === "INTERNSHIP"
                              ? "Дадлага"
                              : job.type}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Идэвхтэй ажлын байр байхгүй байна</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 