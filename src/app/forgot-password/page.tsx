"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase().trim();
      
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
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
                  Имэйл илгээгдлээ
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
                      <h3 className="text-green-800 font-medium">Амжилттай!</h3>
                      <p className="text-green-700 text-sm mt-1">
                        Баталгаажуулах код {email} хаягт илгээгдлээ. Имэйлээ шалгаад кодыг оруулна уу.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 w-full lg:w-[564px]">
                <button
                  onClick={() => router.push("/reset-password")}
                  className="w-full py-[10px] sm:py-[13px] bg-[#0C213A] rounded-[10px] flex items-center justify-center"
                >
                  <span className="text-white text-[16px] sm:text-[20px] font-bold font-poppins">
                    Код оруулах
                  </span>
                </button>
                
                <button
                  onClick={() => router.push("/jobseeker/login")}
                  className="w-full py-[10px] sm:py-[13px] border border-[#0C213A] rounded-[10px] flex items-center justify-center"
                >
                  <span className="text-[#0C213A] text-[16px] sm:text-[20px] font-bold font-poppins">
                    Нэвтрэх хуудас руу буцах
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
                    Нууц үг мартсан уу?
                  </div>
                </div>

                <div className="flex flex-col gap-[15px] w-full lg:w-[564px] mb-[40px]">
                  <div>
                    <span className="text-[#0C213A] text-[16px] sm:text-[18px] lg:text-[20px] font-poppins">
                      Таны бүртгэлтэй имэйл хаягаа оруулна уу. 
                    </span>
                    <span className="text-[#0C213A] text-[16px] sm:text-[18px] lg:text-[20px] font-semibold font-poppins">
                      Баталгаажуулах код
                    </span>
                    <span className="text-[#0C213A] text-[16px] sm:text-[18px] lg:text-[20px] font-poppins">
                      {" "}илгээх болно.
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
                      {loading ? "Илгээж байна..." : "Код илгээх"}
                    </span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => router.push("/jobseeker/login")}
                    className="w-full py-[10px] sm:py-[13px] border border-[#0C213A] rounded-[10px] flex items-center justify-center"
                  >
                    <span className="text-[#0C213A] text-[16px] sm:text-[20px] font-bold font-poppins">
                      Нэвтрэх хуудас руу буцах
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
