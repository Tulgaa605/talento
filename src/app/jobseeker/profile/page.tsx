import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileContent from "./ProfileContent";

export const dynamic = 'force-dynamic';

export default async function JobseekerProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "USER") {
    redirect("/login?error=Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      profileImageUrl: true,
      phoneNumber: true,
      facebookUrl: true,
      cvs: {
        select: {
          id: true,
          fileName: true,
          createdAt: true,
          status: true,
          fileUrl: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      savedJobs: {
        select: {
          job: {
            select: {
              id: true,
              title: true,
              location: true,
              type: true,
              createdAt: true,
              company: {
                select: {
                  name: true,
                  logoUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p>Could not find user profile.</p>
      </div>
    );
  }

  const savedJobs = user.savedJobs.map((savedJob) => ({
    ...savedJob.job,
    createdAt: savedJob.job.createdAt.toISOString(),
  }));

  return <ProfileContent user={{ ...user, savedJobs }} />;
}
