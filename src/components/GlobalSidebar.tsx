'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  UsersIcon, 
  BuildingOfficeIcon, 
  BriefcaseIcon, 
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Нүүр', href: '/', icon: HomeIcon },
  { name: 'Ажилтны мэдээллийн сан', href: '/employer/hr/employees', icon: UsersIcon },
  { name: 'Хэлтэс', href: '/employer/hr/departments', icon: BuildingOfficeIcon },
  { name: 'Албан тушаал', href: '/employer/hr/positions', icon: BriefcaseIcon },
  { name: 'Гэрээ', href: '/employer/hr/contracts', icon: ClipboardDocumentListIcon },
  { name: 'Удирдлагын шийдвэр', href: '/employer/hr/decisions', icon: DocumentTextIcon },
];

export default function GlobalSidebar() {
  const pathname = usePathname();
  const [isHovering, setIsHovering] = useState(false);

  return (
    <>
      {/* Hover trigger area for desktop */}
      <div 
        className="hidden lg:block fixed inset-y-0 left-0 z-40 w-4 hover:w-8 transition-all duration-300"
        onMouseEnter={() => setIsHovering(true)}
      />

      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          // Desktop: show only when hovering
          isHovering ? 'lg:translate-x-0' : 'lg:-translate-x-full'
        }`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">HR систем</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 bg-gray-50'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <Link
              href="/"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="mr-3 h-5 w-5 flex-shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              <span className="truncate">Үндсэн хуудас руу буцах</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
