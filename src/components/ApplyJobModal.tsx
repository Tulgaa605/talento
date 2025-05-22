"use client";

import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useNotification } from "@/providers/NotificationProvider";

interface CV {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
  status: string;
  matchScore?: number;
}

interface ApplyJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (cvId: string, message: string) => Promise<void>;
  cvs: CV[];
  jobTitle: string;
}

export default function ApplyJobModal({
  isOpen,
  onClose,
  onApply,
  cvs,
  jobTitle,
}: ApplyJobModalProps) {
  const [selectedCV, setSelectedCV] = useState<string>("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { addNotification } = useNotification();

  const handleSubmit = async () => {
    if (!selectedCV) {
      addNotification("CV сонгоно уу", "error");
      return;
    }
    setSending(true);
    try {
      await onApply(selectedCV, message);
      addNotification("CV амжилттай илгээгдлээ!", "success");
      onClose();
    } catch (error: any) {
      addNotification(error.message || "Алдаа гарлаа", "error");
    } finally {
      setSending(false);
    }
  };

  return (
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                    <button
                      type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0C213A] focus:ring-offset-2"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                      {jobTitle} - Өргөдөл илгээх
                      </Dialog.Title>

                    <div className="mt-6 space-y-6">
                        <div>
                          <label
                            htmlFor="cv"
                            className="block text-sm font-medium text-gray-700"
                          >
                            CV сонгох
                          </label>
                          <select
                            id="cv"
                          name="cv"
                            value={selectedCV}
                            onChange={(e) => setSelectedCV(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-[#0C213A] focus:outline-none focus:ring-[#0C213A] sm:text-sm"
                          >
                          <option value="">CV сонгох</option>
                            {cvs.map((cv) => (
                              <option key={cv.id} value={cv.id}>
                                {cv.fileName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="message"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Нэмэлт мэдээлэл
                          </label>
                          <textarea
                            id="message"
                          name="message"
                          rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0C213A] focus:ring-[#0C213A] sm:text-sm"
                          placeholder="Өөрийн тухай товч танилцуулга..."
                          />
                      </div>
                    </div>
                  </div>
                </div>

                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                    className="inline-flex w-full justify-center rounded-md bg-[#0C213A] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0C213A]/90 sm:ml-3 sm:w-auto"
                      onClick={handleSubmit}
                    disabled={sending}
                    >
                    {sending ? "Илгээж байна..." : "Илгээх"}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={onClose}
                    >
                      Буцах
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
  );
}
