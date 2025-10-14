"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { signIn } from "next-auth/react";

export default function JobseekerRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pageRef.current && formRef.current && imageRef.current) {
      gsap.fromTo(
        pageRef.current,
        { opacity: 0, scale: 0.99 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: "power1.out",
        }
      );

      gsap.fromTo(
        formRef.current.children,
        { opacity: 0, y: 5 },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.03,
          ease: "power1.out",
          delay: 0.1,
        }
      );

      gsap.fromTo(
        imageRef.current,
        { opacity: 0, x: -10 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          ease: "power1.out",
          delay: 0.1,
        }
      );
    }
  }, []);

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/jobseeker/login");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password || !firstName || !lastName) {
      setError("Бүх талбарыг бөглөнө үү");
      setIsLoading(false);
      return;
    }

    const data = {
      email,
      password,
      name: `${firstName} ${lastName}`.trim(),
      role: "USER",
    };

    try {
      console.log("Sending registration data:", {
        ...data,
        password: "[REDACTED]",
      });
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Бүртгэл амжилтгүй боллоо");
      }

      router.push(
        "/jobseeker/login?message=Бүртгэл амжилттай! Та нэвтэрнэ үү."
      );
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        error instanceof Error ? error.message : "Ямар нэг зүйл буруу боллоо"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center px-4 sm:px-8 md:px-10 lg:px-32 mt-10">
      <div className="flex w-full max-w-[1900px] items-center justify-between flex-col lg:flex-row">
        {/* Зүүн талын illustration */}
        <div className="hidden lg:block w-[58%]">
          <div className="flex items-center justify-start pt-10">
            <Image
              ref={imageRef}
              src="/icons/job7.svg"
              alt="Job Icon"
              width={700}
              height={700}
              className="object-contain w-[90%] h-auto"
              priority
            />
          </div>
        </div>
        {/* Баруун тал: Форм */}
        <div className="w-full lg:w-[38.5%] flex flex-col pt-12">
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col">
            <div className="flex flex-col">
              <div className="flex flex-col">
                <div className="flex flex-col mb-[5px]">
                  <div className="text-[#0C213A] text-[28px] sm:text-[32px] lg:text-[36px] font-bold font-poppins">
                    Ажил хайгч бүртгүүлэх
                  </div>
                </div>
                <div className="flex flex-col gap-[15px] w-full lg:w-[500px] mb-[20px]">
                  <div>
                    <span className="text-[#0C213A] text-[16px] sm:text-[18px] lg:text-[20px] font-poppins">
                      Та өөрийн{" "}
                    </span>
                    <span className="text-[#0C213A] text-[16px] sm:text-[18px] lg:text-[20px] font-semibold font-poppins">
                      мэдээллээ
                    </span>
                    <span className="text-[#0C213A] text-[16px] sm:text-[18px] lg:text-[20px] font-poppins">
                      {" "}
                      оруулна уу
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-[25px] w-full lg:w-[500px] mb-[20px]">
                  <div className="flex flex-col gap-[5px]">
                    <div className="flex flex-col gap-[4px]">
                      <div className="h-[27px] text-[#0C213A] text-[14px] sm:text-[16px] lg:text-[18px] font-poppins">
                        Имэйл хаяг
                      </div>
                    </div>
                    <input
                      name="email"
                      type="email"
                      required
                      className="h-[50px] sm:h-[55px] rounded-xl bg-white border border-[#0C213A]/20 outline-none px-4 w-full text-[#0C213A] text-[14px] sm:text-[16px] lg:text-[18px]"
                    />
                  </div>
                  <div className="flex flex-col gap-[5px]">
                    <div className="flex flex-col gap-[4px]">
                      <div className="h-[27px] text-[#0C213A] text-[14px] sm:text-[16px] lg:text-[18px] font-poppins">
                        Нууц үг
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        className="h-[50px] sm:h-[55px] rounded-xl bg-white border border-[#0C213A]/20 outline-none px-4 w-full text-[#0C213A] text-[14px] sm:text-[16px] lg:text-[18px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <svg
                            width="20"
                            height="20"
                            className="sm:w-6 sm:h-6 lg:w-7 lg:h-7"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
                              fill="#0C213A"
                              fillOpacity="0.4"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="20"
                            height="20"
                            className="sm:w-6 sm:h-6 lg:w-7 lg:h-7"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 7C14.76 7 17 9.24 17 12C17 12.65 16.87 13.26 16.64 13.83L19.56 16.75C21.07 15.49 22.26 13.86 22.99 12C21.26 7.61 16.99 4.5 11.99 4.5C10.59 4.5 9.25 4.75 8.01 5.2L10.17 7.36C10.74 7.13 11.35 7 12 7ZM2 4.27L4.28 6.55L4.74 7.01C3.08 8.3 1.78 10.02 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.8 19.08L19.73 22L21 20.73L3.27 3L2 4.27ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.78 9 12C9 13.66 10.34 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C9.24 17 7 14.76 7 12C7 11.21 7.2 10.47 7.53 9.8ZM11.84 9.02L14.99 12.17L15.01 12.01C15.01 10.35 13.67 9.01 12.01 9.01L11.84 9.02Z"
                              fill="#0C213A"
                              fillOpacity="0.4"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-[5px] flex-1">
                      <div className="flex flex-col gap-[4px]">
                        <div className="h-[27px] text-[#0C213A] text-[14px] sm:text-[16px] lg:text-[18px] font-poppins">
                          Овог
                        </div>
                      </div>
                      <input
                        name="lastName"
                        type="text"
                        required
                        className="h-[50px] sm:h-[55px] rounded-xl bg-white border border-[#0C213A]/20 outline-none px-4 w-full text-[#0C213A] text-[14px] sm:text-[16px] lg:text-[18px]"
                      />
                    </div>
                    <div className="flex flex-col gap-[5px] flex-1">
                      <div className="flex flex-col gap-[4px]">
                        <div className="h-[27px] text-[#0C213A] text-[14px] sm:text-[16px] lg:text-[18px] font-poppins">
                          Нэр
                        </div>
                      </div>
                      <input
                        name="firstName"
                        type="text"
                        required
                        className="h-[50px] sm:h-[55px] rounded-xl bg-white border border-[#0C213A]/20 outline-none px-4 w-full text-[#0C213A] text-[14px] sm:text-[16px] lg:text-[18px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-6 w-full lg:w-[500px]">
                <div className="flex items-center justify-between w-full">
                  <button
                    type="button"
                    className="flex items-center gap-2"
                    onClick={() =>
                      signIn("google", {
                        callbackUrl: "/",
                        expectedRole: "USER",
                      })
                    }
                  >
                    <Image
                      src="/icons/google1.svg"
                      alt="Google Icon"
                      width={18}
                      height={18}
                      className="sm:w-6 sm:h-6 lg:w-7 lg:h-7"
                    />
                    <span className="text-[#0C213A] text-[12px] sm:text-[14px] lg:text-[16px] font-poppins">
                      Google-ээр бүртгүүлэх
                    </span>
                  </button>
                  <Link
                    href="/employer/register"
                    className="text-[#0C213A] text-[12px] sm:text-[14px] lg:text-[16px] font-light font-poppins"
                  >
                    Ажил олгогчоор бүртгүүлэх?
                  </Link>
                </div>
                <div className="flex flex-col gap-4 w-full">
                  <div className="flex items-center justify-end gap-2 pt-5">
                    <span className="text-[#0C213A] text-[12px] sm:text-[14px] lg:text-[16px] font-normal font-poppins">
                      Та аль хэдийн бүртгүүлсэн үү?
                    </span>
                    <button
                      onClick={handleLoginClick}
                      className="text-[#0C213A] text-[12px] sm:text-[14px] lg:text-[16px] font-bold font-poppins hover:underline"
                    >
                      Нэвтрэх
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-[10px] sm:py-[13px] lg:py-[15px] bg-[#0C213A] rounded-[10px] flex items-center justify-center"
                  >
                    <span className="text-white text-[16px] sm:text-[18px] lg:text-[22px] font-bold font-poppins">
                      {isLoading ? "Бүртгэж байна..." : "Бүртгүүлэх"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-white opacity-0 pointer-events-none z-50"
      />
      {/* Error Alert */}
      {error && (
        <div className="fixed top-[100px] left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg">
            <p className="text-red-600 text-[14px] sm:text-[16px] font-poppins">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
