'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Employee {
  id: string;
  firstName: string;
  middleName: string;
  employeeId: string;
  position?: {
    title: string;
  };
  department?: {
    name: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  position?: string;
  department?: string;
  hasContract: boolean;
  employerApproved?: boolean;
  adminApproved?: boolean;
  approved?: boolean;
}

interface Contract {
  id: string;
  contractNumber: string;
  employee: {
    id: string;
    firstName: string;
    middleName: string;
    employeeId: string;
  };
  contractType: string;
  workConditions?: string;
  startDate: string;
  endDate: string | null;
  salary: number;
  currency: string;
  status: string;
  workSchedule?: string;
  probationPeriod?: number;
  benefits?: string;
  terms?: string;
}

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contractId?: string | null;
}

export default function ContractModal({ isOpen, onClose, onSuccess, contractId }: ContractModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    contractNumber: '',
    employeeId: '',
    contractType: 'FULL_TIME',
    workConditions: 'NORMAL',
    startDate: '',
    endDate: '',
    salary: '',
    currency: 'MNT',
    probationPeriod: '',
    workSchedule: '',
    terms: '',
    status: 'ACTIVE'
  });

  const isEditMode = !!contractId;

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      fetchUsers();
      if (isEditMode && contractId) {
        fetchContract(contractId);
      } else {
        resetForm();
      }
    }
  }, [isOpen, contractId, isEditMode]);

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

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/hr/users?approval=ADMIN');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchContract = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/hr/contracts/${id}`);
      if (response.ok) {
        const data: Contract = await response.json();
        setFormData({
          contractNumber: data.contractNumber || '',
          employeeId: data.employee.id || '',
          contractType: data.contractType || 'FULL_TIME',
          workConditions: data.workConditions || 'NORMAL',
          startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
          endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
          salary: data.salary?.toString() || '',
          currency: data.currency || 'MNT',
          probationPeriod: data.probationPeriod?.toString() || '',
          workSchedule: data.workSchedule || '',
          terms: data.terms || data.benefits || '',
          status: data.status || 'ACTIVE'
        });
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
      alert('Гэрээний мэдээлэл авахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      contractNumber: '',
      employeeId: '',
      contractType: 'FULL_TIME',
      workConditions: 'NORMAL',
      startDate: '',
      endDate: '',
      salary: '',
      currency: 'MNT',
      probationPeriod: '',
      workSchedule: '',
      terms: '',
      status: 'ACTIVE'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Цалин - зөвхөн тоо
    if (name === 'salary' && value) {
      const numbersOnly = /^[0-9]*$/;
      if (!numbersOnly.test(value)) {
        return;
      }
    }
    
    // Ажлын хуваарь - эхний үсэг том
    if (name === 'workSchedule' && value) {
      if (value.length > 0) {
        processedValue = value.charAt(0).toUpperCase() + value.slice(1);
      }
    }
    
    // Гэрээний нөхцөлд зөвхөн үсэг, тэмдэглэгээ
    if (name === 'terms' && value) {
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
        ? `/api/hr/contracts/${contractId}`
        : '/api/hr/contracts';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          salary: parseFloat(formData.salary),
          probationPeriod: formData.probationPeriod ? parseInt(formData.probationPeriod) : null,
          workConditions: formData.workConditions,
          benefits: formData.terms,
        }),
      });

      if (response.ok) {
        // Edit mode-д modal хаагдах, create mode-д modal нээлттэй үлдэх
        if (isEditMode) {
          onSuccess();
          onClose();
        } else {
          // Create mode-д зөвхөн form хоосордох, modal нээлттэй үлдэнэ
          onSuccess(); // List шинэчлэх
          resetForm();
          // Modal нээлттэй үлдэнэ - onClose() дуудахгүй
        }
      } else {
        const error = await response.json();
        alert(`Алдаа: ${error.message || error.error || 'Алдаа гарлаа'}`);
      }
    } catch (error) {
      console.error('Error saving contract:', error);
      alert(isEditMode ? 'Гэрээ засахдаа алдаа гарлаа' : 'Гэрээ үүсгэхэд алдаа гарлаа');
    } finally {
      setSubmitting(false);
    }
  };

  const generateContractNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const contractNumber = `CTR-${year}${month}-${random}`;
    setFormData(prev => ({ ...prev, contractNumber }));
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={isEditMode ? onClose : () => {}}>
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
                      {isEditMode ? 'Гэрээний мэдээлэл засах' : 'Шинэ хөдөлмөрийн гэрээ'}
                    </Dialog.Title>

                    {loading ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Гэрээний үндсэн мэдээлэл</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Гэрээний дугаар *
                              </label>
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  name="contractNumber"
                                  value={formData.contractNumber}
                                  onChange={handleInputChange}
                                  required
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                                  placeholder="CTR-202412-001"
                                  disabled={isEditMode}
                                />
                                {!isEditMode && (
                                  <button
                                    type="button"
                                    onClick={generateContractNumber}
                                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                  >
                                    Авто
                                  </button>
                                )}
                              </div>
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
                                  {employees.map((employee) => (
                                    <option key={employee.id} value={employee.id}>
                                      {employee.employeeId} - {employee.firstName} {employee.middleName} ({employee.position?.title || 'Ажилтан'})
                                    </option>
                                  ))}
                                  {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                      USER-{user.id.slice(-6)} - {user.name} ({user.position || 'Хэрэглэгч'})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Гэрээний төрөл *
                              </label>
                              <select
                                name="contractType"
                                value={formData.contractType}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                <option value="FULL_TIME">Үндсэн ажилтан</option>
                                <option value="PART_TIME">Цагийн ажилтан</option>
                                <option value="INTERNSHIP">Дадлага ажилтан</option>
                                <option value="PROBATION">Туршилтын ажилтан</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Хөдөлмөрийн нөхцөл *
                              </label>
                              <select
                                name="workConditions"
                                value={formData.workConditions}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                <option value="NORMAL">Ердийн</option>
                                <option value="HARMFUL">Хортой</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Огноо болон хугацаа</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Эхлэх огноо *
                              </label>
                              <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Дуусах огноо
                              </label>
                              <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                              <p className="text-xs text-gray-500 mt-1">Хоосон үлдээвэл тодорхойгүй хугацаатай</p>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Туршилтын хугацаа (өдөр)
                              </label>
                              <input
                                type="number"
                                name="probationPeriod"
                                value={formData.probationPeriod}
                                onChange={handleInputChange}
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="90"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Цалин болон нөхцөл</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Цалин *
                              </label>
                              <input
                                type="text"
                                name="salary"
                                value={formData.salary}
                                onChange={handleInputChange}
                                required
                                pattern="[0-9]+"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="1000000"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Валют *
                              </label>
                              <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                <option value="MNT">MNT</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ажлын хуваарь
                              </label>
                              <input
                                type="text"
                                name="workSchedule"
                                value={formData.workSchedule}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Даваа-Баасан 09:00-18:00"
                              />
                            </div>
                          </div>
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
                              <option value="ACTIVE">Идэвхтэй</option>
                              <option value="EXPIRED">Дууссан</option>
                              <option value="TERMINATED">Цуцалсан</option>
                            </select>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Бусад хангамж
                          </label>
                          <textarea
                            name="terms"
                            value={formData.terms}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Гэрээний тусгай нөхцөл, заалтууд..."
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
                              : (isEditMode ? 'Хадгалах' : 'Гэрээ үүсгэх')}
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

