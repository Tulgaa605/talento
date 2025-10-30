'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  UsersIcon, 
  BuildingOfficeIcon, 
  BriefcaseIcon, 
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const employerNavigation = [
  { name: 'Нүүр', href: '/', icon: HomeIcon },
  { name: 'Ажилтны мэдээллийн сан', href: '/employer/hr/employees', icon: UsersIcon },
  { name: 'Хэлтэс', href: '/employer/hr/departments', icon: BuildingOfficeIcon },
  { name: 'Албан тушаал', href: '/employer/hr/positions', icon: BriefcaseIcon },
  { name: 'Гэрээ', href: '/employer/hr/contracts', icon: ClipboardDocumentListIcon },
  { name: 'Удирдлагын шийдвэр', href: '/employer/hr/decisions', icon: DocumentTextIcon },
];


export default function GlobalSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isHovering, setIsHovering] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Hide sidebar on login/register pages
  const hideSidebarPaths = [
    '/jobseeker/login',
    '/jobseeker/register', 
    '/employer/login',
    '/employer/register',
    '/admin/login',
    '/admin/register',
    '/forgot-password',
    '/reset-password'
  ];

  if (hideSidebarPaths.some(path => pathname.startsWith(path))) {
    return null;
  }

  // Only show sidebar for logged in users
  if (!session) {
    return null;
  }

  // For jobseeker (USER role), hide sidebar completely
  const isJobseeker = session.user?.role === 'USER';

  // Hide sidebar for jobseekers
  if (isJobseeker) {
    return null;
  }

  // Select navigation based on user role
  const navigation = employerNavigation;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-md bg-white shadow-lg text-gray-700 hover:bg-gray-100"
      >
        {isMobileOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Hover trigger area for desktop with indicator */}
      <div 
        className="hidden lg:block fixed inset-y-0 left-0 z-40 w-8 transition-all duration-300"
        onMouseEnter={() => setIsHovering(true)}
      >
        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white shadow-md rounded-r-lg p-2 hover:bg-gray-50 transition-colors">
          {isHovering ? (
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      </div>

      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          // Mobile: show when menu is open
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
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
                  onClick={() => setIsMobileOpen(false)}
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
              onClick={() => setIsMobileOpen(false)}
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
