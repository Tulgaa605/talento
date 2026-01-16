'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { TableSkeleton, PageHeaderSkeleton, SearchBarSkeleton, ListSkeleton } from '@/components/Skeletons';

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
  status?: string;
  hasContract: boolean;
  employerApproved?: boolean;
  adminApproved?: boolean;
  approved?: boolean;
  position?: string;
  department?: string;
}

export default function EmployeesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'EMPLOYEES' | 'USERS'>('EMPLOYEES');
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const hasOpenedModalRef = useRef(false);

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

  useEffect(() => {
    if (viewMode === 'USERS' && users.length === 0 && !usersLoading) {
      fetchUsers();
    }
  }, [viewMode, users.length, usersLoading, fetchUsers]);

  const handleUserClick = useCallback(async (user: UserItem) => {
    setSelectedUser(user);
    setShowUserModal(true);
    setLoadingUserDetails(true);
    
    try {
      // Fetch user details including questionnaire responses
      const [userResponse, questionnaireResponsesResponse] = await Promise.all([
        fetch(`/api/hr/users/${user.id}`),
        fetch(`/api/hr/users/${user.id}/questionnaires`).catch((err) => {
          console.error('Questionnaire responses fetch error:', err);
          return null;
        }),
      ]);
      
      if (!userResponse.ok) {
        const errorData = await userResponse.json().catch(() => ({ error: 'Unknown error' }));
        console.error('User fetch error:', errorData);
        setUserDetails(null);
        return;
      }
      
      const userData = await userResponse.json();
      const questionnaireData = questionnaireResponsesResponse?.ok 
        ? await questionnaireResponsesResponse.json() 
        : [];
      
      console.log('User data:', userData);
      console.log('Questionnaire data:', questionnaireData);
      
      setUserDetails({
        ...userData,
        questionnaireResponses: questionnaireData || [],
      });
    } catch (error) {
      console.error('Хэрэглэгчийн мэдээлэл авахад алдаа гарлаа:', error);
      setUserDetails(null);
    } finally {
      setLoadingUserDetails(false);
    }
  }, []);

  // Handle query parameters to open user modal
  useEffect(() => {
    const userId = searchParams.get('userId');
    const openModal = searchParams.get('openModal');
    const viewParam = searchParams.get('view');

    if (viewParam === 'USERS') {
      setViewMode('USERS');
    }

    if (userId && openModal === 'true' && !hasOpenedModalRef.current) {
      hasOpenedModalRef.current = true;
      
      // If users are loaded, find and open modal
      if (users.length > 0) {
        const user = users.find(u => u.id === userId);
        if (user) {
          handleUserClick(user);
          // Clean up URL
          router.replace('/employer/hr/employees?view=USERS', { scroll: false });
        }
      } else if (!usersLoading && viewParam === 'USERS') {
        // If users are not loaded yet, fetch them first
        fetchUsers();
      }
    }

    // Reset ref when userId changes
    if (!userId || !openModal) {
      hasOpenedModalRef.current = false;
    }
  }, [searchParams, users, usersLoading, fetchUsers, router, handleUserClick]);

  // Open modal after users are loaded
  useEffect(() => {
    const userId = searchParams.get('userId');
    const openModal = searchParams.get('openModal');
    
    if (userId && openModal === 'true' && users.length > 0 && hasOpenedModalRef.current && !showUserModal) {
      const user = users.find(u => u.id === userId);
      if (user) {
        handleUserClick(user);
        router.replace('/employer/hr/employees?view=USERS', { scroll: false });
      }
    }
  }, [users, searchParams, showUserModal, router, handleUserClick]);

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
      employee.middleName?.toLowerCase().includes(search) ||
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
      (user.phoneNumber || '').toLowerCase().includes(search) ||
      (user.position || '').toLowerCase().includes(search) ||
      (user.department || '').toLowerCase().includes(search)
    );
  });

  if (loading && viewMode === 'EMPLOYEES') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <PageHeaderSkeleton />
        <SearchBarSkeleton />
        <TableSkeleton rows={8} cols={7} />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div>
          <div className="mb-6 sm:mb-8 sm:mt-10">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Ажилтны бүртгэл
                </h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600">
                  Компанийн ажилтнуудын бүртгэл, мэдээлэл
                </p>
                <div className="hidden-on-screen mt-2 text-sm text-gray-500">
                  Хэвлэсэн огноо: {new Date().toLocaleString('mn-MN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 print:hidden">
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

          <div>
            {viewMode === 'EMPLOYEES' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 ${employee.isUser ? 'border-2 border-blue-200' : ''}`}
                  >
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center min-w-0 flex-1">
                          <UsersIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mr-2 sm:mr-3 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                              {employee.firstName} {employee.middleName}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {employee.employeeId}
                            </p>
                          </div>
                        </div>
                        {employee.isUser && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 ml-2">
                            Хэрэглэгч
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 mb-3 sm:mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Имэйл</p>
                          <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{employee.email}</p>
                        </div>
                        {employee.phoneNumber && (
                          <div>
                            <p className="text-xs text-gray-500">Утас</p>
                            <p className="text-xs sm:text-sm font-medium text-gray-900">{employee.phoneNumber}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-500">Албан тушаал</p>
                          <p className="text-xs sm:text-sm font-medium text-gray-900">{employee.position.title}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Хэлтэс</p>
                          <p className="text-xs sm:text-sm font-medium text-gray-900">{employee.department.name}</p>
                        </div>
                      </div>

                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-1 sm:space-x-2">
                            {!employee.isUser ? (
                              <>
                                <Link
                                  href={`/employer/hr/employees/${employee.id}`}
                                  className="text-blue-600 hover:text-blue-900 p-1"
                                  title="Үзэх"
                                >
                                  <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                </Link>
                                <Link
                                  href={`/employer/hr/employees/${employee.id}/edit`}
                                  className="text-green-600 hover:text-green-900 p-1"
                                  title="Засах"
                                >
                                  <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
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
                                  className="text-red-600 hover:text-red-900 p-1"
                                  title="Устгах"
                                >
                                  <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <Link
                                  href={`/employer/hr/employees/new?userId=${employee.userData?.id}`}
                                  className="text-green-600 hover:text-green-900 p-1"
                                  title="Ажилтан болгох"
                                >
                                  <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
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
                                  className="text-red-600 hover:text-red-900 p-1"
                                  title="Устгах"
                                >
                                  <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                              </>
                            )}
                          </div>
                          <Link
                            href={`/employer/hr/employees/${employee.id}`}
                            className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Дэлгэрэнгүй →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {usersLoading ? (
                  <div className="col-span-full p-6">
                    <ListSkeleton count={5} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
                    {filteredUsers.map((u) => (
                      <div
                        key={u.id}
                        className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                        onClick={() => handleUserClick(u)}
                      >
                        <div className="p-4 sm:p-6">
                          <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="flex items-center min-w-0 flex-1">
                              <UsersIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mr-2 sm:mr-3 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                  {u.name || 'Хэрэглэгч'}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500 truncate">{u.email}</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 mb-3 sm:mb-4">
                            {u.phoneNumber && (
                              <div>
                                <p className="text-xs text-gray-500">Утас</p>
                                <p className="text-xs sm:text-sm font-medium text-gray-900">{u.phoneNumber}</p>
                              </div>
                            )}
                            {u.position && (
                              <div>
                                <p className="text-xs text-gray-500">Албан тушаал</p>
                                <p className="text-xs sm:text-sm font-medium text-gray-900">{u.position}</p>
                              </div>
                            )}
                            {u.department && (
                              <div>
                                <p className="text-xs text-gray-500">Хэлтэс</p>
                                <p className="text-xs sm:text-sm font-medium text-gray-900">{u.department}</p>
                              </div>
                            )}
                          </div>

                          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center justify-between">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  u.hasContract ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {u.hasContract ? 'Гэрээтэй' : 'Гэрээгүй'}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {u.employerApproved && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                    Ажил олгогч
                                  </span>
                                )}
                                {u.adminApproved && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                    Админ
                                  </span>
                                )}
                                {(u.status || 'PENDING') === 'APPROVED' && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                    Зөвшөөрөгдсөн
                                  </span>
                                )}
                                {(u.status || 'PENDING') === 'EMPLOYER' && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                    Ажил олгогч
                                  </span>
                                )}
                                {(u.status || 'PENDING') !== 'APPROVED' && (u.status || 'PENDING') !== 'EMPLOYER' && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                    Хүлээгдэж байна
                                  </span>
                                )}
                              </div>
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium">
                                  Дэлгэрэнгүй харах →
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/employer/hr/employees/new?userId=${u.id}`);
                                  }}
                                  className="text-xs sm:text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                  Ажилтан болгох
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {viewMode === 'EMPLOYEES' && filteredEmployees.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <UsersIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <div className="text-sm sm:text-base text-gray-500">
                {searchTerm ? 'Хайлтын үр дүн олдсонгүй' : 'Ажилтан олдсонгүй'}
              </div>
            </div>
          )}
          {viewMode === 'USERS' && filteredUsers.length === 0 && !usersLoading && (
            <div className="text-center py-8 sm:py-12">
              <UsersIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <div className="text-sm sm:text-base text-gray-500">
                {searchTerm ? 'Хайлтын үр дүн олдсонгүй' : 'Хэрэглэгч олдсонгүй'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-semibold text-[#0C213A]">
                {selectedUser.name || 'Хэрэглэгч'} - Дэлгэрэнгүй мэдээлэл
              </h3>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                  setUserDetails(null);
                }}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">
              {loadingUserDetails ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Basic User Info */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Үндсэн мэдээлэл</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Нэр</p>
                        <p className="text-lg font-medium text-gray-900">{selectedUser.name || 'Тодорхойгүй'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Имэйл</p>
                        <p className="text-lg font-medium text-gray-900">{selectedUser.email || 'Тодорхойгүй'}</p>
                      </div>
                      {selectedUser.phoneNumber && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Утас</p>
                          <p className="text-lg font-medium text-gray-900">{selectedUser.phoneNumber}</p>
                        </div>
                      )}
                      {selectedUser.position && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Албан тушаал</p>
                          <p className="text-lg font-medium text-gray-900">{selectedUser.position}</p>
                        </div>
                      )}
                      {selectedUser.department && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Хэлтэс</p>
                          <p className="text-lg font-medium text-gray-900">{selectedUser.department}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Questionnaire Responses */}
                  {userDetails?.questionnaireResponses && userDetails.questionnaireResponses.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Албан хаагчийн анкет ({userDetails.questionnaireResponses.length})
                      </h4>
                      <div className="space-y-4">
                        {userDetails.questionnaireResponses.map((response: any) => (
                          <div key={response.id} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {response.questionnaire?.title || 'Анкет'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(response.createdAt).toLocaleDateString('mn-MN')}
                                </p>
                              </div>
                            </div>
                            {response.formData && (
                              <div className="mt-3">
                                <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40">
                                  {typeof response.formData === 'string' 
                                    ? response.formData 
                                    : JSON.stringify(response.formData, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                  setUserDetails(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                Хаах
              </button>
              {selectedUser && (
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    router.push(`/employer/hr/employees/new?userId=${selectedUser.id}`);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Ажилтан болгох
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
