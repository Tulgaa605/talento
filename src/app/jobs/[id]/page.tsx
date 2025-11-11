'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import JobDetails from '@/components/JobDetails';

interface Job {
  id: string;
  title: string;
  company: {
    name: string;
    logoUrl?: string;
    url?: string;
    description?: string;
    id: string;
  };
  description: string;
  requirements: string;
  location: string;
  salary?: string;
  createdAt: string;
  type: string;
  contactPhone?: string;
  skills?: string;
  isSaved?: boolean;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        if (!response.ok) {
          throw new Error('Job not found');
        }
        const data = await response.json();
        setJob(data);
      } catch (error) {
        console.error('Error fetching job:', error);
        alert('Ажлын байр олдсонгүй');
        router.push('/jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, router]);

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-white px-4 sm:px-8 md:px-16 lg:px-32 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen pt-16 bg-white px-4 sm:px-8 md:px-16 lg:px-32 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ажлын байр олдсонгүй</h2>
          <button
            onClick={() => router.push('/jobs')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Буцах
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-white px-4 sm:px-8 md:px-16 lg:px-32">
      <main className="py-6 sm:py-8 md:py-12">
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Буцах
          </button>
        </div>
        <JobDetails job={job} />
      </main>
    </div>
  );
}

