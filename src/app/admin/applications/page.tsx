'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Image from 'next/image';

interface JobApplication {
  id: string;
  createdAt: string;
  status: string;
  message: string;
  job: {
    id: string;
    title: string;
    company: { name: string };
  };
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  cv: {
    id: string;
    fileName: string;
    fileUrl: string;
  } | null;
}

export default function AdminApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const url =
        filterStatus === 'all'
          ? '/api/admin/applications'
          : `/api/admin/applications?status=${filterStatus}`;

      const response = await fetch(url);
      if (!response.ok) {
        let errorMessage = 'Өргөдлүүдийг ачаалахад алдаа гарлаа';
        try {
          const errorData = await response.json();
          errorMessage = (errorData.message || errorData.error) ?? errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setApplications(data);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Өргөдлүүдийг ачаалахад алдаа гарлаа';
      console.error('Error fetching applications:', error);
      alert(message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }

    fetchApplications();
  }, [session, status, router, fetchApplications]);

  const handleApprove = async (applicationId: string) => {
    try {
      setProcessing(applicationId);
      const response = await fetch(
        `/api/admin/applications/${applicationId}/approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        let errorMessage = 'Зөвшөөрөх үед алдаа гарлаа';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      await fetchApplications();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Зөвшөөрөх үед алдаа гарлаа';
      console.error('Error approving application:', error);
      alert(message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      setProcessing(applicationId);
      const response = await fetch(
        `/api/admin/applications/${applicationId}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        let errorMessage = 'Татгалзах үед алдаа гарлаа';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      await fetchApplications();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Татгалзах үед алдаа гарлаа';
      console.error('Error rejecting application:', error);
      alert(message);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700';
      case 'EMPLOYER_APPROVED':
        return 'bg-blue-50 text-blue-700';
      case 'ADMIN_APPROVED':
        return 'bg-green-50 text-green-700';
      case 'REJECTED':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Хүлээгдэж буй';
      case 'EMPLOYER_APPROVED':
        return 'Ажил олгогч зөвшөөрсөн';
      case 'ADMIN_APPROVED':
        return 'Админ зөвшөөрсөн';
      case 'REJECTED':
        return 'Татгалзсан';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="w-full h-screen relative bg-white overflow-hidden">
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0C213A]" />
            <p className="mt-4 text-[#0C213A] text-[16px] font-poppins">Ачааллаж байна...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-32 bg-white">
      <div className="py-8 mt-20">
        <div className="flex items-center gap-6 mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0C213A]/5">
            <Image src="/icons/application.svg" alt="Application" width={32} height={32} className="p-1" />
          </div>
          <div>
            <h1 className="text-[#0C213A] text-2xl font-bold font-poppins">Өргөдлийн удирдлага</h1>
            <p className="mt-1 text-[#0C213A]/60 text-[14px] font-poppins">
              Нийт {applications.length} өргөдөл
            </p>
          </div>
        </div>

        <div className="mb-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Бүх статус</option>
            <option value="PENDING">Хүлээгдэж буй</option>
            <option value="EMPLOYER_APPROVED">Ажил олгогч зөвшөөрсөн</option>
            <option value="ADMIN_APPROVED">Админ зөвшөөрсөн</option>
            <option value="REJECTED">Татгалзсан</option>
          </select>
        </div>

        <div className="space-y-4">
          {applications.map((application) => (
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
                          alt={application.user.name || ''}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-gray-500">
                          {(application.user.name?.charAt(0) || '').toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {application.user.name}
                      </h2>
                      <p className="text-gray-500 text-sm">
                        {application.job.title} • {application.job.company.name}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {format(new Date(application.createdAt), 'yyyy-MM-dd HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      application.status
                    )}`}
                  >
                    {getStatusText(application.status)}
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
                    <a
                      href={application.cv.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      CV харах
                    </a>
                  )}

                  {application.status === 'EMPLOYER_APPROVED' && (
                    <>
                      <button
                        onClick={() => handleApprove(application.id)}
                        disabled={processing === application.id}
                        className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing === application.id ? 'Үйлдэж байна...' : 'Зөвшөөрөх'}
                      </button>
                      <button
                        onClick={() => handleReject(application.id)}
                        disabled={processing === application.id}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing === application.id ? 'Үйлдэж байна...' : 'Татгалзах'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {applications.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293л-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-1">Өргөдөл байхгүй байна</h3>
                <p className="text-gray-500 text-sm">
                  {filterStatus === 'all'
                    ? 'Одоогоор ямар нэгэн өргөдөл байхгүй байна.'
                    : `"${getStatusText(filterStatus)}" статустай өргөдөл байхгүй байна.`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
