'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phoneNumber: string;
  status: string;
  hireDate: string;
  position: {
    title: string;
    department: {
      name: string;
    };
  };
  department: {
    name: string;
  };
  manager?: {
    firstName: string;
    lastName: string;
  };
  contracts: Array<{
    contractNumber: string;
    contractType: string;
    salary: number;
    currency: string;
  }>;
  isUser?: boolean;
  userData?: UserItem;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  image?: string;
  role?: 'ADMIN' | 'EMPLOYER';
  hasContract: boolean;
  employerApproved?: boolean;
  adminApproved?: boolean;
  approved?: boolean;
  position?: string;
  department?: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'EMPLOYEES' | 'USERS'>('EMPLOYEES');

  // --- Fetchers wrapped in useCallback to satisfy exhaustive-deps ---
  const fetchEmployees = useCallback(async () => {
    try {
      const response = await fetch('/api/hr/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }

      const usersResponse = await fetch('/api/hr/users?approval=ADMIN');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Ажилтнуудыг авахад алдаа гарлаа:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const response = await fetch('/api/hr/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Хэрэглэгчдийг авахад алдаа гарлаа:', error);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Mount: load all reference data once
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Refresh employees when tab regains focus / visibility
  useEffect(() => {
    const handleFocus = () => {
      if (viewMode === 'EMPLOYEES') {
        fetchEmployees();
      }
    };
    const handleVisibilityChange = () => {
      if (!document.hidden && viewMode === 'EMPLOYEES') {
        fetchEmployees();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [viewMode, fetchEmployees]);

  // If USERS view is opened first time or list is empty -> fetch
  useEffect(() => {
    if (viewMode === 'USERS' && users.length === 0 && !usersLoading) {
      fetchUsers();
    }
  }, [viewMode, users.length, usersLoading, fetchUsers]);

  // Merge employees with admin-approved users
  const mergedEmployees = useMemo(() => {
    const adminApprovedUsers = users.map((u) => ({
      id: u.id,
      employeeId: `USER-${u.id.slice(-6)}`,
      firstName: u.name?.split(' ')[0] || 'Хэрэглэгч',
      lastName: u.name?.split(' ').slice(1).join(' ') || '',
      middleName: undefined,
      email: u.email,
      phoneNumber: u.phoneNumber || '',
      status: 'ACTIVE',
      hireDate: new Date().toISOString().split('T')[0],
      position: {
        title: u.position || 'Хэрэглэгч',
        department: {
          name: u.department || 'Системийн хэрэглэгч',
        },
      },
      department: {
        name: u.department || 'Системийн хэрэглэгч',
      },
      manager: undefined,
      contracts: u.hasContract
        ? [
            {
              contractNumber: 'USER-CONTRACT',
              contractType: 'Хэрэглэгчийн гэрээ',
              salary: 0,
              currency: 'MNT',
            },
          ]
        : [],
      isUser: true,
      userData: u,
    }));

    return [...employees, ...adminApprovedUsers];
  }, [employees, users]);

  const filteredEmployees = mergedEmployees.filter((employee) => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      employee.firstName.toLowerCase().includes(search) ||
      employee.lastName.toLowerCase().includes(search) ||
      employee.employeeId.toLowerCase().includes(search) ||
      employee.email.toLowerCase().includes(search) ||
      employee.phoneNumber?.toLowerCase().includes(search) ||
      employee.position.title.toLowerCase().includes(search) ||
      employee.department.name.toLowerCase().includes(search)
    );
  });

  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      (user.name || '').toLowerCase().includes(search) ||
      (user.email || '').toLowerCase().includes(search) ||
      (user.phoneNumber || '').toLowerCase().includes(search)
    );
  });

  if (loading && viewMode === 'EMPLOYEES') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div>
        {/* Гарчиг */}
        <div className="mb-6 sm:mb-8 sm:mt-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Ажилтны бүртгэл
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Компанийн ажилтнуудын бүртгэл, мэдээлэл
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  onClick={() => setViewMode('EMPLOYEES')}
                  className={`px-3 sm:px-4 py-2 text-sm font-medium border ${
                    viewMode === 'EMPLOYEES'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  } rounded-l-md`}
                >
                  Ажилтан
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('USERS')}
                  className={`px-3 sm:px-4 py-2 text-sm font-medium border -ml-px ${
                    viewMode === 'USERS'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  } rounded-r-md`}
                >
                  Хэрэглэгч
                </button>
              </div>
              {viewMode === 'EMPLOYEES' && (
                <Link
                  href="/employer/hr/employees/new"
                  className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                >
                  <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Шинэ ажилтны бүртгэл</span>
                  <span className="sm:hidden">Шинэ</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Хайлт */}
        <div className="bg-white rounded-lg shadow mb-6 p-4 sm:p-6">
          <div className="relative max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Хайх
            </label>
            <MagnifyingGlassIcon className="absolute left-3 top-11 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Нэр, дугаар, имэйл, албан тушаал, хэлтэс..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:ring-blue-500 focus:border-blue-500 w-full text-sm"
            />
          </div>
        </div>

        {/* Жагсаалт */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            {viewMode === 'EMPLOYEES' ? (
              <div>
                <h2 className="text-base sm:text-lg font-medium text-gray-900">
                  Ажилтны бүртгэл
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Ажилтнууд ({filteredEmployees.length})
                </p>
              </div>
            ) : (
              <h2 className="text-base sm:text-lg font-medium text-gray-900">
                Хэрэглэгчид ({filteredUsers.length})
              </h2>
            )}
          </div>

          <div className="overflow-x-auto">
            {viewMode === 'EMPLOYEES' ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider w-3/4">
                      Ажилтны мэдээлэл
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider w-1/4">
                      Үйлдэл
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className={`hover:bg-gray-50 transition-colors ${employee.isUser ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-6 py-5">
                        <div className="space-y-3">
                          {/* Нэр */}
                          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                            <div className="text-lg font-bold text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </div>
                            {employee.isUser && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                Хэрэглэгч
                              </span>
                            )}
                          </div>
                          
                          {/* Мэдээлэл */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
                            <div className="flex flex-col space-y-0.5">
                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ID дугаар</span>
                              <span className="text-sm font-medium text-gray-900">{employee.employeeId}</span>
                            </div>
                            
                            <div className="flex flex-col space-y-0.5">
                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Имэйл хаяг</span>
                              <span className="text-sm font-medium text-gray-900 break-all">{employee.email}</span>
                            </div>
                            
                            {employee.phoneNumber && (
                              <div className="flex flex-col space-y-0.5">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Утасны дугаар</span>
                                <span className="text-sm font-medium text-gray-900">{employee.phoneNumber}</span>
                              </div>
                            )}
                            
                            <div className="flex flex-col space-y-0.5">
                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Албан тушаал</span>
                              <span className="text-sm font-medium text-gray-900">{employee.position.title}</span>
                            </div>
                            
                            <div className="flex flex-col space-y-0.5 md:col-span-2">
                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Хэлтэс</span>
                              <span className="text-sm font-medium text-gray-900">{employee.department.name}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-3">
                          {!employee.isUser ? (
                            <>
                              <Link
                                href={`/employer/hr/employees/${employee.id}`}
                                className="inline-flex items-center justify-center p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-colors border border-blue-600"
                                title="Харах"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </Link>
                              <Link
                                href={`/employer/hr/employees/${employee.id}/edit`}
                                className="inline-flex items-center justify-center p-2 text-green-600 hover:text-white hover:bg-green-600 rounded-lg transition-colors border border-green-600"
                                title="Засах"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </Link>
                              <button
                                onClick={async () => {
                                  if (confirm('Энэ ажилтныг устгахдаа итгэлтэй байна уу?')) {
                                    try {
                                      const response = await fetch(
                                        `/api/hr/employees/${employee.id}`,
                                        { method: 'DELETE' }
                                      );
                                      if (response.ok) {
                                        alert('Ажилтныг амжилттай устгалаа');
                                        fetchEmployees();
                                      } else {
                                        const error = await response.json();
                                        alert(error.error || 'Алдаа гарлаа');
                                      }
                                    } catch (error) {
                                      console.error('Ажилтныг устгахад алдаа гарлаа:', error);
                                      alert('Алдаа гарлаа');
                                    }
                                  }
                                }}
                                className="inline-flex items-center justify-center p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-colors border border-red-600"
                                title="Устгах"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <Link
                                href={`/employer/hr/employees/${employee.id}/edit`}
                                className="inline-flex items-center justify-center p-2 text-green-600 hover:text-white hover:bg-green-600 rounded-lg transition-colors border border-green-600"
                                title="Засах"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </Link>
                              <button
                                onClick={async () => {
                                  if (confirm('Энэ хэрэглэгчийг устгахдаа итгэлтэй байна уу?')) {
                                    try {
                                      const response = await fetch(
                                        `/api/hr/users/${employee.userData?.id}`,
                                        { method: 'DELETE' }
                                      );
                                      if (response.ok) {
                                        alert('Хэрэглэгчийг амжилттай устгалаа');
                                        fetchEmployees();
                                      } else {
                                        const error = await response.json();
                                        alert(error.error || 'Алдаа гарлаа');
                                      }
                                    } catch (error) {
                                      console.error('Хэрэглэгчийг устгахад алдаа гарлаа:', error);
                                      alert('Алдаа гарлаа');
                                    }
                                  }
                                }}
                                className="inline-flex items-center justify-center p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-colors border border-red-600"
                                title="Устгах"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div>
                {usersLoading ? (
                  <div className="p-8 text-center text-gray-500">
                    Ачааллаж байна...
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Хэрэглэгчийн мэдээлэл
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider w-48">
                          Гэрээ
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider w-56">
                          Зөвшөөрөлт
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="space-y-3">
                              {/* Нэр */}
                              <div className="pb-2 border-b border-gray-100">
                                <div className="text-lg font-bold text-gray-900">
                                  {u.name || 'Нэргүй хэрэглэгч'}
                                </div>
                              </div>
                              
                              {/* Мэдээлэл */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
                                <div className="flex flex-col space-y-0.5">
                                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Имэйл хаяг</span>
                                  <span className="text-sm font-medium text-gray-900 break-all">{u.email}</span>
                                </div>
                                
                                {u.phoneNumber && (
                                  <div className="flex flex-col space-y-0.5">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Утасны дугаар</span>
                                    <span className="text-sm font-medium text-gray-900">{u.phoneNumber}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            {u.hasContract ? (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                ✓ Гэрээтэй
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
                                ✗ Гэрээгүй
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-2 justify-center">
                              {u.employerApproved && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                  Ажил олгогч
                                </span>
                              )}
                              {u.adminApproved && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                  Админ
                                </span>
                              )}
                              {u.approved && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                  Бүрэн зөвшөөрсөн
                                </span>
                              )}
                              {!u.employerApproved && !u.adminApproved && !u.approved && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                  Хүлээгдэж байна
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

          {viewMode === 'EMPLOYEES'
            ? filteredEmployees.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500">Ажилтны олдсонгүй</div>
                </div>
              )
            : filteredUsers.length === 0 &&
              !usersLoading && (
                <div className="text-center py-12">
                  <div className="text-gray-500">Хэрэглэгч олдсонгүй</div>
                </div>
              )}
        </div>
      </div>
    </div>
  );
}
