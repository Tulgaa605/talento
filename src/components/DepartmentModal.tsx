'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
}

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  departmentId?: string | null;
}

export default function DepartmentModal({ isOpen, onClose, onSuccess, departmentId }: DepartmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });

  const isEditMode = !!departmentId;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && departmentId) {
        fetchDepartment(departmentId);
      } else {
        resetForm();
        generateCode();
      }
    }
  }, [isOpen, departmentId, isEditMode]);

  const generateCode = async () => {
    try {
      const response = await fetch('/api/hr/departments');
      if (response.ok) {
        const departments = await response.json();
        const ddCodes = departments
          .map((d: { code: string }) => d.code)
          .filter((code: string) => /^DD\d{5}$/.test(code))
          .map((code: string) => parseInt(code.substring(2), 10))
          .sort((a: number, b: number) => b - a);
        const maxNumber = ddCodes.length > 0 ? ddCodes[0] : 0;
        const nextNumber = maxNumber + 1;
        const code = `DD${String(nextNumber).padStart(5, '0')}`;
        setFormData(prev => ({ ...prev, code }));
      }
    } catch (error) {
      console.error('Код үүсгэхэд алдаа гарлаа:', error);
      setFormData(prev => ({ ...prev, code: 'DD00001' }));
    }
  };

  const fetchDepartment = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/hr/departments/${id}`);
      if (response.ok) {
        const data: Department = await response.json();
        setFormData({
          name: data.name || '',
          code: data.code || '',
          description: data.description || '',
        });
      }
    } catch (error) {
      console.error('Error fetching department:', error);
      alert('Хэлтсийн мэдээлэл авахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (name === 'name' && value) {
      const lettersAndPunctuation = /^[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-()]*$/;
      if (!lettersAndPunctuation.test(value)) {
        return;
      }
      if (value.length > 0) {
        processedValue = value.charAt(0).toUpperCase() + value.slice(1);
      }
    }
    
    if (name === 'description' && value) {
      const lettersAndPunctuation = /^[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]*$/;
      if (!lettersAndPunctuation.test(value)) {
        return;
      }
      if (value.length > 0) {
        processedValue = value.charAt(0).toUpperCase() + value.slice(1);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = isEditMode 
        ? `/api/hr/departments/${departmentId}`
        : '/api/hr/departments';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        resetForm();
      } else {
        const error = await response.json();
        alert(`Алдаа: ${error.message || error.error || 'Алдаа гарлаа'}`);
      }
    } catch (error) {
      console.error('Error saving department:', error);
      alert(isEditMode ? 'Хэлтэс засахдаа алдаа гарлаа' : 'Хэлтэс үүсгэхэд алдаа гарлаа');
    } finally {
      setSubmitting(false);
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
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Хаах</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900 mb-4">
                      {isEditMode ? 'Хэлтсийн мэдээлэл засах' : 'Шинэ хэлтэс нэмэх'}
                    </Dialog.Title>

                    {loading ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Хэлтсийн нэр *
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Жишээ: Хүний нөөцийн хэлтэс"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Код *
                            </label>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleInputChange}
                                required
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Жишээ: DD00001"
                              />
                              {!isEditMode && (
                                <button
                                  type="button"
                                  onClick={generateCode}
                                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                  Авто
                                </button>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Тайлбар
                            </label>
                            <textarea
                              name="description"
                              value={formData.description}
                              onChange={handleInputChange}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Хэлтсийн тайлбар..."
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm"
                          >
                            Цуцлах
                          </button>
                          <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {submitting 
                              ? (isEditMode ? 'Хадгалж байна...' : 'Үүсгэж байна...') 
                              : (isEditMode ? 'Хадгалах' : 'Хэлтэс үүсгэх')}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

