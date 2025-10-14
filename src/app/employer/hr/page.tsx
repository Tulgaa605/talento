'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import {
  UsersIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  PlusIcon,
  AcademicCapIcon,
  TrophyIcon,
  DocumentChartBarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

type WithStatus = { status: string };

/** data → items массивыг аюулгүйгээр гаргаж авна (API нь шууд массив эсвэл { items: [...] } өгч болно) */
function getItemsArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const items = (data as Record<string, unknown>).items;
    if (Array.isArray(items)) return items;
  }
  return [];
}

/** Element нь status:String талбартай эсэхийг шалгах type guard */
function isWithStatus(value: unknown): value is WithStatus {
  return !!(
    value &&
    typeof value === 'object' &&
    typeof (value as Record<string, unknown>).status === 'string'
  );
}

/** Нийт тоо (array эсвэл {items}) */
function countAll(data: unknown): number {
  return getItemsArray(data).length;
}

/** Төлвөөр нь тоолох */
function countByStatus(data: unknown, status: string): number {
  return getItemsArray(data).filter(isWithStatus).filter((x) => x.status === status).length;
}

export default function HRDashboardPage() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    departments: 0,
    positions: 0,
    activeContracts: 0,
    pendingDecisions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJSON = async (url: string): Promise<unknown> => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch ${url}`);
      return res.json();
    };

    const load = async () => {
      try {
        const [employees, departments, positions, contracts, decisions] = await Promise.all([
          fetchJSON('/api/hr/employees'),
          fetchJSON('/api/hr/departments'),
          fetchJSON('/api/hr/positions'),
          fetchJSON('/api/hr/contracts'),
          fetchJSON('/api/hr/decisions'),
        ]);

        setStats({
          totalEmployees: countAll(employees),
          departments: countAll(departments),
          positions: countAll(positions),
          activeContracts: countByStatus(contracts, 'ACTIVE'),
          pendingDecisions: countByStatus(decisions, 'PENDING'),
        });
      } catch (e) {
        console.error('Failed to load HR dashboard stats', e);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const quickActions = [
    {
      title: 'Ажилтны бүртгэл',
      description: 'Шинэ ажилтны мэдээлэл оруулах',
      icon: UsersIcon,
      href: '/employer/hr/employees/new',
      color: 'bg-blue-500',
    },
    {
      title: 'Хэлтэс үүсгэх',
      description: 'Шинэ хэлтэс нэмэх',
      icon: BuildingOfficeIcon,
      href: '/employer/hr/departments/new',
      color: 'bg-green-500',
    },
    {
      title: 'Тушаал үүсгэх',
      description: 'Шинэ албан тушаал нэмэх',
      icon: DocumentTextIcon,
      href: '/employer/hr/positions/new',
      color: 'bg-purple-500',
    },
    {
      title: 'Гэрээ байгуулах',
      description: 'Хөдөлмөрийн гэрээ байгуулах',
      icon: ClipboardDocumentListIcon,
      href: '/employer/hr/contracts/new',
      color: 'bg-orange-500',
    },
  ];

  const sections = [
    {
      title: 'Ажилтны мэдээллийн сан',
      description: 'Ажилтны жагсаалт болон удирдлага',
      icon: UsersIcon,
      href: '/employer/hr/employees',
      count: stats.totalEmployees,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Ажилд авах процесс',
      description: 'Ажилд авах үйл явцын удирдлага',
      icon: UserGroupIcon,
      href: '/employer/hr/recruitment',
      count: 0,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Сургалт хөгжлийн бүртгэл',
      description: 'Сургалтын бүртгэл болон удирдлага',
      icon: AcademicCapIcon,
      href: '/employer/hr/training',
      count: 0,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Ажлын гүйцэтгэл үнэлгээ',
      description: 'Ажилтнуудын гүйцэтгэлийн үнэлгээ',
      icon: ChartBarIcon,
      href: '/employer/hr/performance',
      count: 0,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Шагнал, шийтгэлийн бүртгэл',
      description: 'Шагнал болон шийтгэлийн бүртгэл',
      icon: TrophyIcon,
      href: '/employer/hr/rewards-penalties',
      count: 0,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Тайлан, статистик',
      description: 'HR тайлан болон статистик',
      icon: DocumentChartBarIcon,
      href: '/employer/hr/reports',
      count: 0,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 sm:mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">HR Систем</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Хүний нөөцийн удирдлагын систем</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Нийт ажилтны</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {loading ? '-' : stats.totalEmployees}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Хэлтсийн тоо</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {loading ? '-' : stats.departments}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardDocumentListIcon className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Идэвхтэй гэрээ</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {loading ? '-' : stats.activeContracts}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Шуурхай үйлдлүүд</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="bg-white rounded-lg shadow p-4 sm:p-3.5 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-2 rounded-lg ${action.color}`}>
                    <action.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{action.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Системийн хэсгүүд</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {sections.map((section) => (
              <Link
                key={section.title}
                href={section.href}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className={`flex-shrink-0 p-2 sm:p-3 rounded-lg ${section.bgColor}`}>
                      <section.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${section.color}`} />
                    </div>
                    <div className="text-right">
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {loading ? '-' : section.count}
                      </p>
                      <p className="text-xs text-gray-500">тоо</p>
                    </div>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">{section.description}</p>
                  <div className="flex items-center text-xs sm:text-sm font-medium text-blue-600">
                    Харах
                    <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
