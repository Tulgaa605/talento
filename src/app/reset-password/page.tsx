"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (newPassword !== confirmPassword) {
      setError("Нууц үг таарахгүй байна");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Алдаа гарлаа");
      }
    } catch {
      setError("Сүлжээний алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center px-4 sm:px-8 md:px-10 lg:px-32 mt-10">
        <div className="flex w-full max-w-[1900px] items-center justify-between flex-col lg:flex-row">
          <div className="w-full lg:w-[45%] flex flex-col">
            <div className="flex flex-col">
              <div className="flex flex-col mb-[15px]">
                <div className="text-[#0C213A] text-[28px] sm:text-[32px] lg:text-[36px] font-bold font-poppins">
                  Амжилттай!
                </div>
              </div>

              <div className="flex flex-col gap-[15px] w-full lg:w-[564px] mb-[40px]">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center">
                    <div className="text-green-400 mr-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-green-800 font-medium">Нууц үг солигдлоо!</h3>
                      <p className="text-green-700 text-sm mt-1">
                        Таны нууц үг амжилттай солигдлоо.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 w-full lg:w-[564px]">
                <button
                  onClick={() => router.push("/jobseeker/login")}
                  className="w-full py-[10px] sm:py-[13px] bg-[#0C213A] rounded-[10px] flex items-center justify-center"
                >
                  <span className="text-white text-[16px] sm:text-[20px] font-bold font-poppins">
                    Нэвтрэх
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="hidden lg:block w-[65%]">
            <div className="w-full flex justify-end">
              <Image
                src="/icons/job7.svg"
                alt="Job Icon"
                width={900}
                height={900}
                className="object-contain w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center px-4 sm:px-8 md:px-10 lg:px-32 mt-10">
      <div className="flex w-full max-w-[1900px] items-center justify-between flex-col lg:flex-row">
        <div className="w-full lg:w-[45%] flex flex-col">
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="flex flex-col">
              <div className="flex flex-col">
                <div className="flex flex-col mb-[15px]">
                  <div className="text-[#0C213A] text-[28px] sm:text-[32px] lg:text-[36px] font-bold font-poppins">
                    Шинэ нууц үг үүсгэх
                  </div>
                </div>

                <div className="flex flex-col gap-[15px] w-full lg:w-[564px] mb-[40px]">
                  <div>
                    <span className="text-[#0C213A] text-[16px] sm:text-[18px] lg:text-[20px] font-poppins">
                      Имэйлдээ ирсэн баталгаажуулах код болон шинэ нууц үгээ оруулна уу.
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-[25px] w-full lg:w-[564px] mb-[20px]">
                  <div className="flex flex-col gap-[5px]">
                    <div className="flex flex-col gap-[4px]">
                      <div className="h-[27px] text-[#0C213A] text-[14px] sm:text-[16px] font-poppins">
                        Имэйл хаяг
                      </div>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-[50px] sm:h-[60px] rounded-xl bg-white border border-[#0C213A]/20 outline-none px-4 w-full text-[#0C213A] text-[16px] sm:text-[16px]"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div className="flex flex-col gap-[5px]">
                    <div className="flex flex-col gap-[4px]">
                      <div className="h-[27px] text-[#0C213A] text-[14px] sm:text-[16px] font-poppins">
                        Баталгаажуулах код
                      </div>
                    </div>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                      className="h-[50px] sm:h-[60px] rounded-xl bg-white border border-[#0C213A]/20 outline-none px-4 w-full text-[#0C213A] text-[16px] sm:text-[16px]"
                      placeholder="123456"
                      maxLength={6}
                    />
                  </div>

                  <div className="flex flex-col gap-[5px]">
                    <div className="flex flex-col gap-[4px]">
                      <div className="h-[27px] text-[#0C213A] text-[14px] sm:text-[16px] font-poppins">
                        Шинэ нууц үг
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="h-[50px] sm:h-[60px] rounded-xl bg-white border border-[#0C213A]/20 outline-none px-4 w-full text-[#0C213A] text-[16px] sm:text-[16px]"
                        placeholder="Хамгийн багадаа 6 тэмдэгт"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <svg width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
                              fill="#0C213A"
                              fillOpacity="0.4"
                            />
                          </svg>
                        ) : (
                          <svg width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none">
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

                  <div className="flex flex-col gap-[5px]">
                    <div className="flex flex-col gap-[4px]">
                      <div className="h-[27px] text-[#0C213A] text-[14px] sm:text-[16px] font-poppins">
                        Нууц үг давтах
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="h-[50px] sm:h-[60px] rounded-xl bg-white border border-[#0C213A]/20 outline-none px-4 w-full text-[#0C213A] text-[16px] sm:text-[16px]"
                        placeholder="Нууц үгээ дахин оруулна уу"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className = "absolute right-4 top-1/2 -translate-y-1/2"
                      >
                        {showConfirmPassword ? (
                          <svg width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
                              fill="#0C213A"
                              fillOpacity="0.4"
                            />
                          </svg>
                        ) : (
                          <svg width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none">
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
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                    <p className="text-red-600 text-[14px] sm:text-[16px] font-poppins">{error}</p>
                  </div>
                )}

                <div className="flex flex-col gap-4 w-full lg:w-[564px]">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-[10px] sm:py-[13px] bg-[#0C213A] rounded-[10px] flex items-center justify-center disabled:bg-gray-400"
                  >
                    <span className="text-white text-[16px] sm:text-[20px] font-bold font-poppins">
                      {loading ? "Хадгалж байна..." : "Нууц үг солих"}
                    </span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => router.push("/forgot-password")}
                    className="w-full py-[10px] sm:py-[13px] border border-[#0C213A] rounded-[10px] flex items-center justify-center"
                  >
                    <span className="text-[#0C213A] text-[16px] sm:text-[20px] font-bold font-poppins">
                      Буцах
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="hidden lg:block w-[65%]">
          <div className="w-full flex justify-end">
            <Image
              src="/icons/job7.svg"
              alt="Job Icon"
              width={900}
              height={900}
              className="object-contain w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
