'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  UsersIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import Image from "next/image";

interface DashboardStats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  totalCompanies: number;
  pendingApplications: number;
  approvedApplications: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalCompanies: 0,
    pendingApplications: 0,
    approvedApplications: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }

    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Статистик ачаалж байх үед алдаа гарлаа:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const dashboardItems = [
    {
      title: 'Нийт хэрэглэгч',
      value: stats.totalUsers,
      icon: UsersIcon,
      color: 'bg-blue-500',
      href: '/admin/users',
    },
    {
      title: 'Нийт ажлын байр',
      value: stats.totalJobs,
      icon: BriefcaseIcon,
      color: 'bg-green-500',
      href: '/admin/jobs',
    },
    {
      title: 'Нийт өргөдөл',
      value: stats.totalApplications,
      icon: DocumentTextIcon,
      color: 'bg-yellow-500',
      href: '/admin/applications',
    },
    {
      title: 'Нийт компани',
      value: stats.totalCompanies,
      icon: BuildingOfficeIcon,
      color: 'bg-purple-500',
      href: '/admin/companies',
    },
  ];

  const quickActions = [
    {
      title: 'Өргөдлийн удирдлага',
      description: 'Ирсэн өргөдлүүдийг харах, шийдвэрлэх',
      icon: DocumentTextIcon,
      href: '/admin/applications',
    },
    {
      title: 'Хэрэглэгчдийн удирдлага',
      description: 'Бүх хэрэглэгчдийн мэдээллийг харах',
      icon: UsersIcon,
      href: '/admin/users',
    },
    {
      title: 'Ажлын байрны удирдлага',
      description: 'Нийт ажлын байрны мэдээллийг харах',
      icon: BriefcaseIcon,
      href: '/admin/jobs',
    },
    {
      title: 'Компанийн удирдлага',
      description: 'Бүх компанийн мэдээллийг харах',
      icon: BuildingOfficeIcon,
      href: '/admin/companies',
    },
  ];

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="w-full h-screen relative bg-white overflow-hidden">
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0C213A]"></div>
            <p className="mt-4 text-[#0C213A] text-[16px] font-poppins">
              Ачааллаж байна...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 pt-[130px]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-6 mb-12">
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-[#0C213A]/5">
            <Image
              src="/icons/hero.svg"
              alt="Dashboard"
              width={48}
              height={48}
              className="p-2"
            />
          </div>
          <div>
            <h1 className="text-[#0C213A] text-3xl font-bold font-poppins">
              Админ удирдлага
            </h1>
            <p className="mt-2 text-[#0C213A]/60 text-[16px] font-poppins">
              Системийн ерөнхий статистик болон удирдлага
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {dashboardItems.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-[#0C213A]/20 transition-all duration-200 cursor-pointer"
              onClick={() => router.push(item.href)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#0C213A]/60 text-sm font-medium mb-2">
                    {item.title}
                  </p>
                  <p className="text-[#0C213A] text-3xl font-bold">
                    {item.value.toLocaleString()}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-12">
          <h2 className="text-[#0C213A] text-2xl font-bold font-poppins mb-6">
            Хурдан үйлдлүүд
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action) => (
              <div
                key={action.title}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-[#0C213A]/20 transition-all duration-200 cursor-pointer group"
                onClick={() => router.push(action.href)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0C213A]/5 flex items-center justify-center group-hover:bg-[#0C213A]/10 transition-colors">
                      <action.icon className="w-6 h-6 text-[#0C213A]" />
                    </div>
                    <div>
                      <h3 className="text-[#0C213A] text-lg font-semibold font-poppins">
                        {action.title}
                      </h3>
                      <p className="text-[#0C213A]/60 text-sm font-poppins">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-[#0C213A]/40 group-hover:text-[#0C213A] transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-[#0C213A] text-2xl font-bold font-poppins mb-6">
            Сүүлийн үйл ажиллагаа
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-[#0C213A] font-medium">
                  {stats.pendingApplications} шинэ өргөдөл хүлээгдэж байна
                </p>
                <p className="text-[#0C213A]/60 text-sm">
                  Шинэ өргөдлүүдийг шалгаж үзээрэй
                </p>
              </div>
              <button
                onClick={() => router.push('/admin/applications')}
                className="bg-[#0C213A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0C213A]/90 transition-colors"
              >
                Харах
              </button>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-[#0C213A] font-medium">
                  {stats.totalUsers} хэрэглэгч бүртгэгдсэн
                </p>
                <p className="text-[#0C213A]/60 text-sm">
                  Хэрэглэгчдийн мэдээллийг харах
                </p>
              </div>
              <button
                onClick={() => router.push('/admin/users')}
                className="bg-[#0C213A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0C213A]/90 transition-colors"
              >
                Харах
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 