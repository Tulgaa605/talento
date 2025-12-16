"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useNotification } from "@/providers/NotificationProvider";


export const Header = () => {
  const { data: session, status } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname?.startsWith(href);
  
  const isEmployer = session?.user?.role === 'EMPLOYER';
  const isAdmin = session?.user?.role === 'ADMIN';
  const canAccessHR = !!session && (isEmployer || isAdmin);
  
  const { databaseNotifications, fetchNotifications, markNotificationAsRead } = useNotification();
  
  useEffect(() => {
    if (session) {
      fetchNotifications();
    }
  }, [session, fetchNotifications]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showNotifications && !target.closest('.notification-dropdown') && !target.closest('.notification-button')) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);
  

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  const closeMenu = () => {
    setShowProfileMenu(false);
  };



  return (
    <header className="flex flex-col justify-center px-4 md:px-10 lg:px-32 py-4 w-full bg-white min-h-[70px] shadow-[0_2px_8px_rgba(12,33,58,0.10)] fixed top-0 z-50 text-lg">
      <nav className="flex justify-between items-center w-full max-w-[1600px] mx-auto">
        <div className="flex items-center gap-4 text-[#0C213A]">
          <Link
            href="/"
            className="text-2xl 2xl:text-3xl font-bold tracking-tight text-[#0C213A]"
          >
            Talento
          </Link>
          {status === "authenticated" && canAccessHR && (
          <div className="hidden lg:flex gap-8 items-center text-sm font-medium ml-20">
            <Link href="/employer/hr/recruitment" className="hover:text-[#0C213A]/80 cursor-pointer relative group text-[#0C213A]">
              <span className="group-hover:text-[#0C213A]/80 transition-colors font-poppins font-medium">Ажилд авах процесс</span>
              <div className={`absolute bottom-0 left-0 h-0.5 bg-[#0C213A] transition-all duration-300 transform translate-y-[6px] ${isActive('/employer/hr/recruitment') ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </Link>
            <Link href="/employer/hr/training" className="hover:text-[#0C213A]/80 cursor-pointer relative group text-[#0C213A]">
              <span className="group-hover:text-[#0C213A]/80 transition-colors font-poppins font-medium">Сургалт хөгжлийн бүртгэл</span>
              <div className={`absolute bottom-0 left-0 h-0.5 bg-[#0C213A] transition-all duration-300 transform translate-y-[6px] ${isActive('/employer/hr/training') ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </Link>
            <Link href="/employer/hr/performance" className="hover:text-[#0C213A]/80 cursor-pointer relative group text-[#0C213A]">
              <span className="group-hover:text-[#0C213A]/80 transition-colors font-poppins font-medium">Ажлын гүйцэтгэл үнэлгээ</span>
              <div className={`absolute bottom-0 left-0 h-0.5 bg-[#0C213A] transition-all duration-300 transform translate-y-[6px] ${isActive('/employer/hr/performance') ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </Link>
            <Link href="/employer/hr/rewards-penalties" className="hover:text-[#0C213A]/80 cursor-pointer relative group text-[#0C213A]">
              <span className="group-hover:text-[#0C213A]/80 transition-colors font-poppins font-medium">Шагнал, шийтгэлийн бүртгэл</span>
              <div className={`absolute bottom-0 left-0 h-0.5 bg-[#0C213A] transition-all duration-300 transform translate-y-[6px] ${isActive('/employer/hr/rewards-penalties') ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </Link>
            <Link href="/employer/hr/reports" className="hover:text-[#0C213A]/80 cursor-pointer relative group text-[#0C213A]">
              <span className="group-hover:text-[#0C213A]/80 transition-colors font-poppins font-medium">Тайлан, статистик</span>
              <div className={`absolute bottom-0 left-0 h-0.5 bg-[#0C213A] transition-all duration-300 transform translate-y-[6px] ${isActive('/employer/hr/reports') ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </Link>
          </div>
          )}
        </div>
        <div className="flex items-center gap-4 pr-0">
          <Link
            href="/aij"
            className="cursor-pointer hover:opacity-80 transition-all duration-300 hover:scale-120"
          >
            <Image
              src="/icons/AI.png"
              alt="logo"
              width={40}
              height={40}
              className="rounded-lg mt-2"
            />
          </Link>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden rounded-lg hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>

          {showMobileMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg lg:hidden">
              <div className="py-2">
                {status === "authenticated" && canAccessHR && (
                  <>
                    <Link href="/employer/hr/recruitment" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setShowMobileMenu(false)}>
                      Ажилд авах процесс
                    </Link>
                    <Link href="/employer/hr/training" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setShowMobileMenu(false)}>
                      Сургалт хөгжлийн бүртгэл
                    </Link>
                    <Link href="/employer/hr/performance" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setShowMobileMenu(false)}>
                      Ажлын гүйцэтгэл үнэлгээ
                    </Link>
                    <Link href="/employer/hr/rewards-penalties" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setShowMobileMenu(false)}>
                      Шагнал, шийтгэлийн бүртгэл
                    </Link>
                    <Link href="/employer/hr/reports" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setShowMobileMenu(false)}>
                      Тайлан, статистик
                    </Link>
                  </>
                )}
                {status === "authenticated" && session ? (
                  <>
                    <div className="border-t border-gray-100 my-2"></div>
                    <div className="px-4 py-2 text-sm text-gray-500">
                      {session.user?.email}
                    </div>
                    <Link href={isEmployer ? "/employer/profile" : "/jobseeker/profile"} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setShowMobileMenu(false)}>
                      Миний профайл
                    </Link>
                    {session?.user?.role === 'USER' && (
                      <Link href="/jobseeker/performance" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setShowMobileMenu(false)}>
                        Миний гүйцэтгэл
                      </Link>
                    )}
                    <div className="border-t border-gray-100 my-2"></div>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setShowMobileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Гарах
                    </button>
                  </>
                ) : (
                  <>
                    <div className="border-t border-gray-100 my-2"></div>
                    <Link href="/jobseeker/login" className="block px-4 py-2 text-sm text-white bg-[#0C213A] hover:bg-[#0C213A]/90" onClick={() => setShowMobileMenu(false)}>
                      Нэвтрэх
                    </Link>
                    <Link href="/employer/register" className="block px-4 py-2 text-sm text-[#0C213A] border border-[#0C213A] hover:bg-gray-50" onClick={() => setShowMobileMenu(false)}>
                      Ажил олгогч
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-4 text-sm items-center">
            {/* Notification Bell */}
            {status === "authenticated" && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none notification-button"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {databaseNotifications.length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {databaseNotifications.length}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 notification-dropdown">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Мэдэгдэл</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {databaseNotifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          Шинэ мэдэгдэл байхгүй
                        </div>
                      ) : (
                        databaseNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              if (notification.link) {
                                window.location.href = notification.link;
                              }
                              markNotificationAsRead(notification.id);
                              setShowNotifications(false);
                            }}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                {notification.type === 'GOVERNMENT_QUESTIONNAIRE' ? (
                                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                ) : (
                                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                              </div>
                              <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notification.createdAt).toLocaleDateString('mn-MN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!isEmployer && status !== "authenticated" && (
              <Link
                href="/employer/login"
                className="hidden lg:flex gap-2.5 self-stretch px-4 py-2 my-auto font-bold rounded-lg border border-solid border-slate-200 text-slate-300 hover:bg-[#0C213A] hover:text-white font-bold transition-all duration-300 hover:scale-105"
              >
                Ажил олгогч
              </Link>
            )}

            
            {status === "authenticated" && session ? (
              <div className="hidden lg:block relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#0C213A]/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#0C213A] text-white flex items-center justify-center">
                    {session.user?.name?.[0]?.toUpperCase() ||
                      session.user?.email?.[0]?.toUpperCase() ||
                      "U"}
                  </div>
                </button>

                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={closeMenu} />
                    <div className="absolute right-0 mt-2 w-[250px] px-3 py-4 bg-white flex flex-col gap-2 rounded-md shadow-[0px_0px_15px_rgba(0,0,0,0.09)] z-20">
                      <div className="text-sm text-[#0C213A]/60 border-b border-gray-100 pb-2">
                        {session.user?.email}
                      </div>
                      {canAccessHR && (
                        <Link href="/employer/post-job" className="font-medium h-12 relative hover:bg-zinc-100 flex items-center px-3 gap-3 rounded-lg transition-colors text-[#0C213A]" onClick={closeMenu}>
                          <div className="w-5">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                          </div>
                          Ажлын байр нийтлэх
                        </Link>
                      )}
                      <Link href={isEmployer ? "/employer/profile" : "/jobseeker/profile"} className="font-medium h-12 relative hover:bg-zinc-100 flex items-center px-3 gap-3 rounded-lg transition-colors text-[#0C213A]" onClick={closeMenu}>
                        <div className="w-5">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        </div>
                        Миний профайл
                      </Link>
                      {session?.user?.role === 'USER' && (
                        <Link href="/jobseeker/performance" className="font-medium h-12 relative hover:bg-zinc-100 flex items-center px-3 gap-3 rounded-lg transition-colors text-[#0C213A]" onClick={closeMenu}>
                          <div className="w-5">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                            </svg>
                          </div>
                          Гүйцэтгэлийн үнэлгээ
                        </Link>
                      )}
                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full font-medium h-12 relative hover:bg-zinc-100 flex items-center px-3 gap-3 rounded-lg text-red-600 hover:text-red-700 transition-colors"
                        >
                          <div className="w-5">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                              />
                            </svg>
                          </div>
                          Гарах
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : status === "loading" ? (
              <div className="hidden lg:block w-8 h-8 rounded-full bg-[#0C213A]/20 animate-pulse" />
            ) : (
              <Link
                href="/jobseeker/login"
                className="hidden lg:flex gap-2.5 self-stretch px-4 py-2 my-auto font-bold text-white whitespace-nowrap rounded-lg bg-[#0C213A] transition-all duration-300 hover:scale-105"
              >
                Нэвтрэх
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};