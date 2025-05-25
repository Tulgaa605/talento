"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

const EmployerMenu = ({
  newApplicationsCount,
}: {
  newApplicationsCount: number;
}) => (
  <>
    <Link
      href="/employer/profile"
      className="font-medium h-12 relative hover:bg-zinc-100 flex items-center px-3 gap-3 rounded-lg transition-colors text-[#0C213A]"
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
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      </div>
      Миний профайл
    </Link>
    <Link
      href="/employer/post-job"
      className="font-medium h-12 relative hover:bg-zinc-100 flex items-center px-3 gap-3 rounded-lg transition-colors text-[#0C213A]"
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
            d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      Ажлын байр нийтлэх
    </Link>
    <Link
      href="/employer/applications"
      className="font-medium h-12 relative hover:bg-zinc-100 flex items-center px-3 gap-3 rounded-lg transition-colors text-[#0C213A]"
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
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
          />
        </svg>
      </div>
      Анкетууд
      {newApplicationsCount > 0 && (
        <span className="absolute right-4 inline-flex items-center justify-center min-w-[18px] h-5 px-1 bg-red-500 text-white text-xs rounded-full">
          {newApplicationsCount > 99 ? "99+" : newApplicationsCount}
        </span>
      )}
    </Link>
  </>
);

const UserMenu = ({
  newApplicationsCount,
}: {
  newApplicationsCount: number;
}) => (
  <>
    <Link
      href="/jobseeker/profile"
      className="font-medium h-12 relative hover:bg-zinc-100 flex items-center px-3 gap-3 rounded-lg transition-colors text-[#0C213A]"
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
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      </div>
      Миний профайл
    </Link>
    <Link
      href="/jobseeker/applications"
      className="font-medium h-12 relative hover:bg-zinc-100 flex items-center px-3 gap-3 rounded-lg transition-colors text-[#0C213A]"
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
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
          />
        </svg>
      </div>
      Миний өргөдлүүд
      {newApplicationsCount > 0 && (
        <span className="absolute right-4 inline-flex items-center justify-center min-w-[18px] h-5 px-1 bg-red-500 text-white text-xs rounded-full">
          {newApplicationsCount > 99 ? "99+" : newApplicationsCount}
        </span>
      )}
    </Link>
  </>
);

export const Header = () => {
  const { data: session, status } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [newApplicationsCount, setNewApplicationsCount] = useState(0);

  useEffect(() => {
    const fetchNewApplicationsCount = async () => {
      if (session?.user) {
        try {
          const endpoint =
            session.user.role === "EMPLOYER"
              ? "/api/employer/applications/new-count"
              : "/api/jobseeker/applications/new-count";

          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            setNewApplicationsCount(data.count || 0);
          }
        } catch (error) {
          // Алдаа гарвал энд боловсруулна
        }
      }
    };

    fetchNewApplicationsCount();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchNewApplicationsCount, 30000);

    return () => clearInterval(interval);
  }, [session]);

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  const closeMenu = () => {
    setShowProfileMenu(false);
  };

  const isEmployer = session?.user?.role === "EMPLOYER";

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
          <div className="hidden lg:flex gap-8 items-center text-sm font-medium ml-28">
            <Link
              href="/"
              className="hover:text-[#0C213A]/80 cursor-pointer relative group text-[#0C213A]"
            >
              <span className="group-hover:text-[#0C213A]/80 transition-colors font-poppins font-medium">
                Нүүр
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0C213A] transition-all duration-300 group-hover:w-full"></div>
            </Link>
            <Link
              href="/jobs"
              className="hover:text-[#0C213A]/80 cursor-pointer relative group text-[#0C213A]"
            >
              <span className="group-hover:text-[#0C213A]/80 transition-colors font-poppins font-medium">
                Ажлын байр
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0C213A] transition-all duration-300 group-hover:w-full"></div>
            </Link>
            <Link
              href="/about"
              className="hover:text-[#0C213A]/80 cursor-pointer relative group text-[#0C213A]"
            >
              <span className="group-hover:text-[#0C213A]/80 transition-colors font-poppins font-medium">
                Таленто гэж юу вэ?
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0C213A] transition-all duration-300 group-hover:w-full"></div>
            </Link>
          </div>
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

          {/* Navigation Menu Button */}
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

          {/* Navigation Menu Dropdown */}
          {showMobileMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg lg:hidden">
              <div className="py-2">
                <Link
                  href="/"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Нүүр
                </Link>
                <Link
                  href="/jobs"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Ажлын байр
                </Link>
                <Link
                  href="/about"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Таленто гэж юу вэ?
                </Link>
                {status === "authenticated" && session ? (
                  <>
                    <div className="border-t border-gray-100 my-2"></div>
                    <div className="px-4 py-2 text-sm text-gray-500">
                      {session.user?.email}
                    </div>
                    <Link
                      href={
                        isEmployer ? "/employer/profile" : "/jobseeker/profile"
                      }
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Миний профайл
                    </Link>
                    <Link
                      href={
                        isEmployer
                          ? "/employer/applications"
                          : "/jobseeker/applications"
                      }
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {isEmployer ? "Анкетууд" : "Миний өргөдлүүд"}
                    </Link>
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
                    <Link
                      href="/jobseeker/login"
                      className="block px-4 py-2 text-sm text-white bg-[#0C213A] hover:bg-[#0C213A]/90"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Нэвтрэх
                    </Link>
                    <Link
                      href="/employer/register"
                      className="block px-4 py-2 text-sm text-[#0C213A] border border-[#0C213A] hover:bg-gray-50"
                      onClick={() => setShowMobileMenu(false)}
                    >
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
                  {isEmployer && (
                    <span className="text-xs px-2 py-1 bg-[#0C213A]/10 text-[#0C213A] rounded-full">
                      Ажил олгогч
                    </span>
                  )}
                </button>

                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={closeMenu} />
                    <div className="absolute right-0 mt-2 w-[250px] px-3 py-4 bg-white flex flex-col gap-2 rounded-md shadow-[0px_0px_15px_rgba(0,0,0,0.09)] z-20">
                      <div className="text-sm text-[#0C213A]/60 border-b border-gray-100 pb-2">
                        {session.user?.email}
                      </div>
                      <div className="flex flex-col gap-1">
                        {isEmployer ? (
                          <EmployerMenu
                            newApplicationsCount={newApplicationsCount}
                          />
                        ) : (
                          <UserMenu
                            newApplicationsCount={newApplicationsCount}
                          />
                        )}
                      </div>
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
