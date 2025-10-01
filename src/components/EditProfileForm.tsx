"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Define the expected props, only the fields we are editing + email for display
interface EditProfileFormProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    phoneNumber: string | null;
    facebookUrl: string | null;
  };
}

export default function EditProfileForm({ user }: EditProfileFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: user.name || "",
    phoneNumber: user.phoneNumber || "",
    facebookUrl: user.facebookUrl || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Prepare only the data that needs to be sent
    const dataToSend: {
      name?: string;
      phoneNumber?: string | null;
      facebookUrl?: string | null;
    } = {};
    if (formData.name !== (user.name || "")) {
      dataToSend.name = formData.name;
    }
    if (formData.phoneNumber !== (user.phoneNumber || "")) {
      dataToSend.phoneNumber = formData.phoneNumber;
    }
    if (formData.facebookUrl !== (user.facebookUrl || "")) {
      dataToSend.facebookUrl = formData.facebookUrl;
    }

    // If no data changed, don't send request
    if (Object.keys(dataToSend).length === 0) {
      setSuccessMessage("Өөрчлөлт хийгдээгүй байна.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/user/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Профайл шинэчилж чадсангүй.");
      }

      setSuccessMessage(result.message || "Профайл амжилттай шинэчлэгдлээ!");
      // Optionally refresh data or redirect
      router.refresh(); // Refresh server components using this data
      // Consider redirecting back to profile page after a short delay
      // setTimeout(() => router.push('/jobseeker/profile'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ямар нэг алдаа гарлаа.");
      console.error("Update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-gray-50 p-6 sm:p-8 rounded-lg shadow-md"
    >
      {error && (
        <p className="text-red-600 bg-red-100 p-3 rounded-md">Алдаа: {error}</p>
      )}
      {successMessage && (
        <p className="text-green-700 bg-green-100 p-3 rounded-md">
          {successMessage}
        </p>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Нэр
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="text-gray-800 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Имэйл (Засах боломжгүй)
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={user.email} // Display email but disable editing
          disabled
          readOnly
          className="text-gray-800 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 sm:text-sm cursor-not-allowed"
        />
      </div>

      <div>
        <label
          htmlFor="phoneNumber"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Утасны дугаар
        </label>
        <input
          type="tel"
          name="phoneNumber"
          id="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="text-gray-800 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="(Заавал биш)"
        />
      </div>

      <div>
        <label
          htmlFor="facebookUrl"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Facebook холбоос
        </label>
        <input
          type="url"
          name="facebookUrl"
          id="facebookUrl"
          value={formData.facebookUrl}
          onChange={handleChange}
          className="text-gray-800 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="https://facebook.com/yourprofile (Заавал биш)"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.back()} // Go back button
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
        >
          Буцах
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Хадгалж байна..." : "Хадгалах"}
        </button>
      </div>
    </form>
  );
}
