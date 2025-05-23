import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Job, JobApplication, User, CV } from "@prisma/client";
import { revalidatePath } from "next/cache";

interface PageProps {
  params: {
    jobId: string;
  };
}

type JobWithApplications = Job & {
  applications: (JobApplication & {
    user: User;
    cv: CV | null;
  })[];
};

async function downloadCV(cvId: string) {
  "use server";

  const cv = await prisma.cV.findUnique({
    where: { id: cvId },
  });

  if (!cv || !cv.fileUrl) {
    throw new Error("CV not found");
  }

  return {
    url: cv.fileUrl,
    fileName: cv.fileName,
  };
}

export default async function JobApplicationsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const { jobId } = params;

  if (!jobId || !session?.user?.id) {
    notFound();
  }

  const job = (await prisma.job.findUnique({
    where: {
      id: jobId,
      company: {
        users: {
          some: {
            id: session.user.id,
          },
        },
      },
    },
    include: {
      applications: {
        include: {
          user: true,
          cv: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })) as JobWithApplications | null;

  if (!job) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                "{job.title}" ажлын анкетууд
              </h1>
              <p className="text-gray-600">
                Нийт {job.applications.length} анкет ирүүлсэн
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                {job.type}
              </div>
              <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                {job.location}
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {job.applications.map((application) => (
            <div
              key={application.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      {application.user.image ? (
                        <img
                          src={application.user.image}
                          alt={application.user.name || ""}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-semibold text-gray-500">
                          {application.user.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {application.user.name}
                      </h2>
                      <p className="text-gray-500 text-sm">
                        Ирүүлсэн:{" "}
                        {format(application.createdAt, "yyyy-MM-dd HH:mm")}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      application.status === "PENDING"
                        ? "bg-yellow-50 text-yellow-700"
                        : application.status === "ACCEPTED"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {application.status === "PENDING" && "Хүлээгдэж буй"}
                    {application.status === "ACCEPTED" && "Зөвшөөрөгдсөн"}
                    {application.status === "REJECTED" && "Татгалзсан"}
                  </div>
                </div>

                {application.message && (
                  <div className="mt-6 bg-gray-50 rounded-xl p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Мессеж</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {application.message}
                    </p>
                  </div>
                )}

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  {application.cv && (
                    <a
                      href={`/api/cv/download?cvId=${application.cv.id}`}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 w-full sm:w-auto"
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
                          strokeWidth="2"
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      CV Татах
                    </a>
                  )}
                  {application.status === "PENDING" && (
                    <>
                      <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                        Зөвшөөрөх
                      </button>
                      <button className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                        Татгалзах
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {job.applications.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Одоогоор анкет ирээгүй байна
                </h3>
                <p className="text-gray-500">
                  Ажлын зар тавихад анкет ирэх болно.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
