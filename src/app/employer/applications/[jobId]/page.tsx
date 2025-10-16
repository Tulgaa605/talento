import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Job, JobApplication, User, CV } from "@prisma/client";
import { revalidatePath } from "next/cache";
import QuestionnaireDropdown from "./QuestionnaireDropdown";
import QuestionnaireResponseButton from "@/components/QuestionnaireResponseButton";
import Image from "next/image";

import CvDownloadButton from "./CvDownloadButton";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    jobId: string;
  }>;
}

type JobWithApplications = Job & {
  applications: (JobApplication & {
    user: User;
    cv: CV | null;
    questionnaireId?: string;
  })[];
};

export default async function JobApplicationsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const { jobId } = await params;

  if (!jobId || !session?.user?.id) {
    notFound();
  }
  const job = (await prisma.job.findFirst({
    where: {
      id: jobId,
      company: {
        users: { some: { id: session.user.id } },
      },
    },
    include: {
      applications: {
        include: { user: true, cv: true },
        orderBy: { createdAt: "desc" },
      },
    },
  })) as JobWithApplications | null;

  if (!job) {
    notFound();
  }

  const questionnaires = await prisma.questionnaire.findMany({
    where: { companyId: job.companyId },
    orderBy: { createdAt: "desc" },
  });

  async function approveApplication(applicationId: string) {
    "use server";
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });
    if (!application) throw new Error("Application not found");

    await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status: "EMPLOYER_APPROVED" },
    });
    revalidatePath(`/employer/applications/${jobId}`);
  }

  async function rejectApplication(applicationId: string) {
    "use server";
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });
    if (!application) throw new Error("Application not found");

    await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status: "REJECTED" },
    });

    await prisma.notification.create({
      data: {
        userId: application.userId,
        title: "Таны CV татгалзлаа",
        message: `${application.job.title} ажлын байрт таны CV татгалзлаа`,
        type: "APPLICATION",
        link: `/jobs/${application.jobId}`,
      },
    });

    revalidatePath(`/employer/applications/${jobId}`);
  }

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-32 bg-white">
      <div className="py-8 mt-20">
        <div className="space-y-4">
          {job.applications.map((application) => (
            <div
              key={application.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {application.user.image ? (
                        <Image
                          src={application.user.image}
                          alt={application.user.name || ""}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-gray-500">
                          {application.user.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {application.user.name}
                      </h2>
                      <p className="text-gray-500 text-sm">
                        {format(application.createdAt, "yyyy-MM-dd HH:mm")}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      application.status === "PENDING"
                        ? "bg-yellow-50 text-yellow-700"
                        : application.status === "EMPLOYER_APPROVED"
                        ? "bg-blue-50 text-blue-700"
                        : application.status === "ADMIN_APPROVED"
                        ? "bg-green-50 text-green-700"
                        : application.status === "REJECTED"
                        ? "bg-red-50 text-red-700"
                        : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    {application.status === "PENDING" && "Хүлээгдэж буй"}
                    {application.status === "EMPLOYER_APPROVED" && "Ажил олгогч зөвшөөрсөн"}
                    {application.status === "ADMIN_APPROVED" && "Админ зөвшөөрсөн"}
                    {application.status === "REJECTED" && "Татгалзсан"}
                    {!["PENDING", "EMPLOYER_APPROVED", "ADMIN_APPROVED", "REJECTED"].includes(
                      application.status
                    ) && application.status}
                  </div>
                </div>

                {application.message && (
                  <div className="mt-3 bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">
                      {application.message}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {application.cv && (
                    <CvDownloadButton cv={application.cv} />
                  )}
                  {application.status === "PENDING" && (
                    <>
                      <form action={approveApplication.bind(null, application.id)}>
                        <button
                          type="submit"
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
                        >
                          Зөвшөөрөх
                        </button>
                      </form>
                      <form action={rejectApplication.bind(null, application.id)}>
                        <button
                          type="submit"
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
                        >
                          Татгалзах
                        </button>
                      </form>
                    </>
                  )}
                  <QuestionnaireDropdown
                    applicationId={application.id}
                    questionnaires={questionnaires}
                  />
                  {application.questionnaireId && (
                    <QuestionnaireResponseButton
                      questionnaireId={application.questionnaireId}
                      applicationId={application.id}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}

          {job.applications.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-gray-400"
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
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  Одоогоор анкет ирээгүй байна
                </h3>
                <p className="text-gray-500 text-sm">
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
