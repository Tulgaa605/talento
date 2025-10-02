"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import NotificationBell from "./NotificationBell";


export const Header = () => {
  const { data: session, status } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname?.startsWith(href);
  
  const isEmployer = session?.user?.role === 'EMPLOYER';
  const isAdmin = session?.user?.role === 'ADMIN';
  const canAccessHR = !!session && (isEmployer || isAdmin);
  

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
          <div className="hidden lg:flex gap-8 items-center text-sm font-medium">
            <Link href="/employer/hr/employees" className="hover:text-[#0C213A]/80 cursor-pointer relative group text-[#0C213A] ml-20">
              <span className="group-hover:text-[#0C213A]/80 transition-colors font-poppins font-medium">Ажилтны мэдээллийн сан</span>
              <div className={`absolute bottom-0 left-0 h-0.5 bg-[#0C213A] transition-all duration-300 transform translate-y-[6px] ${isActive('/employer/hr/employees') ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </Link>
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
                    <Link href="/employer/hr/employees" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setShowMobileMenu(false)}>
                      Ажилтны мэдээллийн сан
                    </Link>
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

          <div className="flex gap-4 text-sm">
            {!isEmployer && status !== "authenticated" && (
              <Link
                href="/employer/login"
                className="hidden lg:flex gap-2.5 self-stretch px-4 py-2 my-auto font-bold rounded-lg border border-solid border-slate-200 text-slate-300 hover:bg-[#0C213A] hover:text-white font-bold transition-all duration-300 hover:scale-105"
              >
                Ажил олгогч
              </Link>
            )}

            {status === "authenticated" && session && (
              <div className="hidden lg:block">
                <NotificationBell />
              </div>
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

