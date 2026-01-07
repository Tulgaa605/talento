'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Employee {
  id: string;
  firstName: string;
  middleName?: string;
  lastName?: string;
  employeeId: string;
  position?: {
    title: string;
  };
  department?: {
    name: string;
  };
}

interface Decision {
  id: string;
  decisionNumber: string;
  title: string;
  type: string;
  decisionDate: string;
  effectiveDate?: string;
  description: string;
  reason?: string;
  status: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
}

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  decisionId?: string | null;
}

export default function DecisionModal({ isOpen, onClose, onSuccess, decisionId }: DecisionModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    decisionNumber: '',
    title: '',
    type: '',
    employeeId: '',
    decisionDate: '',
    effectiveDate: '',
    description: '',
    reason: '',
    status: 'ACTIVE',
  });

  const isEditMode = !!decisionId;

  const decisionTypes = [
    { value: 'HIRING', label: 'Ажилд авах' },
    { value: 'PROMOTION', label: 'Дэвшүүлэх' },
    { value: 'TRANSFER', label: 'Шилжүүлэх' },
    { value: 'TERMINATION', label: 'Ажлаас хасах' },
    { value: 'SALARY_CHANGE', label: 'Цалин өөрчлөх' },
    { value: 'OTHER', label: 'Бусад' },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      if (isEditMode && decisionId) {
        fetchDecision(decisionId);
      } else {
        resetForm();
      }
    }
  }, [isOpen, decisionId, isEditMode]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/hr/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchDecision = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/hr/decisions/${id}`);
      if (response.ok) {
        const data: Decision = await response.json();
        setFormData({
          decisionNumber: data.decisionNumber || '',
          title: data.title || '',
          type: data.type || '',
          employeeId: data.employee.id || '',
          decisionDate: data.decisionDate ? new Date(data.decisionDate).toISOString().split('T')[0] : '',
          effectiveDate: data.effectiveDate ? new Date(data.effectiveDate).toISOString().split('T')[0] : '',
          description: data.description || '',
          reason: data.reason || '',
          status: data.status || 'ACTIVE',
        });
      }
    } catch (error) {
      console.error('Error fetching decision:', error);
      alert('Шийдвэрийн мэдээлэл авахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      decisionNumber: '',
      title: '',
      type: '',
      employeeId: '',
      decisionDate: '',
      effectiveDate: '',
      description: '',
      reason: '',
      status: 'ACTIVE',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (name === 'title' && value) {
      const lettersAndPunctuation = /^[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-()]*$/;
      if (!lettersAndPunctuation.test(value)) {
        return;
      }
      if (value.length > 0) {
        processedValue = value.charAt(0).toUpperCase() + value.slice(1);
      }
    }
    
    if ((name === 'description' || name === 'reason') && value) {
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

  const generateDecisionNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const decisionNumber = `DEC-${year}${month}${day}-${random}`;
    setFormData(prev => ({ ...prev, decisionNumber }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = isEditMode 
        ? `/api/hr/decisions/${decisionId}`
        : '/api/hr/decisions';
      
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
      console.error('Error saving decision:', error);
      alert(isEditMode ? 'Шийдвэр засахдаа алдаа гарлаа' : 'Шийдвэр үүсгэхэд алдаа гарлаа');
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6 max-h-[90vh] overflow-y-auto">
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
                      {isEditMode ? 'Шийдвэрийн мэдээлэл засах' : 'Шинэ удирдлагын шийдвэр үүсгэх'}
                    </Dialog.Title>

                    {loading ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Шийдвэрийн дугаар *
                            </label>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                name="decisionNumber"
                                value={formData.decisionNumber}
                                onChange={handleInputChange}
                                required
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="DEC-20241201-001"
                                disabled={isEditMode}
                              />
                              {!isEditMode && (
                                <button
                                  type="button"
                                  onClick={generateDecisionNumber}
                                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                  Авто
                                </button>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Шийдвэрийн төрөл *
                            </label>
                            <select
                              name="type"
                              value={formData.type}
                              onChange={handleInputChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              <option value="">Төрөл сонгох</option>
                              {decisionTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Гарчиг *
                            </label>
                            <input
                              type="text"
                              name="title"
                              value={formData.title}
                              onChange={handleInputChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Шийдвэрийн гарчиг..."
                            />
                          </div>

                          {!isEditMode && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ажилтан *
                              </label>
                              <select
                                name="employeeId"
                                value={formData.employeeId}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                <option value="">Ажилтан сонгох</option>
                                {employees.map((employee) => {
                                  const fullName = employee.middleName 
                                    ? `${employee.firstName} ${employee.middleName}`
                                    : employee.firstName;
                                  return (
                                    <option key={employee.id} value={employee.id}>
                                      {fullName} ({employee.employeeId}) - {employee.position?.title || 'Ажилтан'}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Шийдвэр гарсан огноо *
                            </label>
                            <input
                              type="date"
                              name="decisionDate"
                              value={formData.decisionDate}
                              onChange={handleInputChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Хэрэгжих огноо
                            </label>
                            <input
                              type="date"
                              name="effectiveDate"
                              value={formData.effectiveDate}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>

                          {isEditMode && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Төлөв
                              </label>
                              <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                <option value="PENDING">Хүлээгдэж буй</option>
                                <option value="ACTIVE">Идэвхтэй</option>
                                <option value="CANCELLED">Цуцлагдсан</option>
                              </select>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Тайлбар *
                          </label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Шийдвэрийн дэлгэрэнгүй тайлбар..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Шалтгаан
                          </label>
                          <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Шийдвэр гаргасан шалтгаан..."
                          />
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
                              : (isEditMode ? 'Хадгалах' : 'Шийдвэр үүсгэх')}
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

