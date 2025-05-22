import { notFound } from "next/navigation";

interface PageProps {
  params: {
    jobId: string;
  };
}

export default function JobApplicationsPage({ params }: PageProps) {
  const { jobId } = params;

  if (!jobId) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Job Applications</h1>
      {/* Add your job applications content here */}
    </div>
  );
}
