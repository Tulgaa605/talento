'use client';

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
  mainGroup?: string;
  subGroup?: string;
  minorGroup?: string;
  unitGroup?: string;
  jobProfession?: string;
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

const YAMAT8_CLASSIFICATIONS = [
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '01 Зэвсэгт хүчний зэрэг, цол бүхий офицер', minorGroup: '011 Зэвсэгт хүчний зэрэг, цол бүхий офицер', unitGroup: '0110 Зэвсэгт хүчний зэрэг, цол бүхий офицер', jobProfession: '0110-11 Дэслэгч-салааны' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '01 Зэвсэгт хүчний зэрэг, цол бүхий офицер', minorGroup: '011 Зэвсэгт хүчний зэрэг, цол бүхий офицер', unitGroup: '0110 Зэвсэгт хүчний зэрэг, цол бүхий офицер', jobProfession: '0110-12 Ахлах дэслэгч-салааны' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '01 Зэвсэгт хүчний зэрэг, цол бүхий офицер', minorGroup: '011 Зэвсэгт хүчний зэрэг, цол бүхий офицер', unitGroup: '0110 Зэвсэгт хүчний зэрэг, цол бүхий офицер', jobProfession: '0110-13 Хошууч рот /батарей/-ны' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '01 Зэвсэгт хүчний зэрэг, цол бүхий офицер', minorGroup: '011 Зэвсэгт хүчний зэрэг, цол бүхий офицер', unitGroup: '0110 Зэвсэгт хүчний зэрэг, цол бүхий офицер', jobProfession: '0110-14 Дэд хурандаа-батальон /дивизион/-ны' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '01 Зэвсэгт хүчний зэрэг, цол бүхий офицер', minorGroup: '011 Зэвсэгт хүчний зэрэг, цол бүхий офицер', unitGroup: '0110 Зэвсэгт хүчний зэрэг, цол бүхий офицер', jobProfession: '0110-15 Хурандаа-бригад /хороо/-ны' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '01 Зэвсэгт хүчний зэрэг, цол бүхий офицер', minorGroup: '011 Зэвсэгт хүчний зэрэг, цол бүхий офицер', unitGroup: '0110 Зэвсэгт хүчний зэрэг, цол бүхий офицер', jobProfession: '0110-22 Ахмад-батальоны сэтгэл зүйч, соёл хүмүүжлийн' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '01 Зэвсэгт хүчний зэрэг, цол бүхий офицер', minorGroup: '011 Зэвсэгт хүчний зэрэг, цол бүхий офицер', unitGroup: '0110 Зэвсэгт хүчний зэрэг, цол бүхий офицер', jobProfession: '0110-29 Генерал-зэвсэгт хүчний командлагч' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '02 Зэвсэгт хүчний ахлагч', minorGroup: '021 Зэвсэгт хүчний ахлагч', unitGroup: '0210 Зэвсэгт хүчний ахлагч', jobProfession: '0210-11 Сургагч ахлагч-рот /батарей/-ны жагсаалын дарга' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '02 Зэвсэгт хүчний ахлагч', minorGroup: '021 Зэвсэгт хүчний ахлагч', unitGroup: '0210 Зэвсэгт хүчний ахлагч', jobProfession: '0210-12 Тэргүүн ахлагч-батальон, хороо, бригад, Жанжин штабын ахлагч' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '02 Зэвсэгт хүчний ахлагч', minorGroup: '021 Зэвсэгт хүчний ахлагч', unitGroup: '0210 Зэвсэгт хүчний ахлагч', jobProfession: '0210-13 Ахлах ахлагч' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '02 Зэвсэгт хүчний ахлагч', minorGroup: '021 Зэвсэгт хүчний ахлагч', unitGroup: '0210 Зэвсэгт хүчний ахлагч', jobProfession: '0210-14 Ахлагч' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '02 Зэвсэгт хүчний ахлагч', minorGroup: '021 Зэвсэгт хүчний ахлагч', unitGroup: '0210 Зэвсэгт хүчний ахлагч', jobProfession: '0210-15 Дэд Ахлагч' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '02 Зэвсэгт хүчний ахлагч', minorGroup: '021 Зэвсэгт хүчний ахлагч', unitGroup: '0210 Зэвсэгт хүчний ахлагч', jobProfession: '0210-16 Буудагч' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '02 Зэвсэгт хүчний ахлагч', minorGroup: '021 Зэвсэгт хүчний ахлагч', unitGroup: '0210 Зэвсэгт хүчний ахлагч', jobProfession: '0210-17 Явган цэргийн байлдааны машины наводчик-операторч' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '02 Зэвсэгт хүчний ахлагч', minorGroup: '021 Зэвсэгт хүчний ахлагч', unitGroup: '0210 Зэвсэгт хүчний ахлагч', jobProfession: '0210-18 Механик жолооч' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '02 Зэвсэгт хүчний ахлагч', minorGroup: '021 Зэвсэгт хүчний ахлагч', unitGroup: '0210 Зэвсэгт хүчний ахлагч', jobProfession: '0210-19 Танкийн буудагч' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '02 Зэвсэгт хүчний ахлагч', minorGroup: '021 Зэвсэгт хүчний ахлагч', unitGroup: '0210 Зэвсэгт хүчний ахлагч', jobProfession: '0210-20 Зенитийн өөрөө явагчийн операторч' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '02 Зэвсэгт хүчний ахлагч', minorGroup: '021 Зэвсэгт хүчний ахлагч', unitGroup: '0210 Зэвсэгт хүчний ахлагч', jobProfession: '0210-21 Радиолокацын станцын операторч - планшетчин' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '02 Зэвсэгт хүчний ахлагч', minorGroup: '021 Зэвсэгт хүчний ахлагч', unitGroup: '0210 Зэвсэгт хүчний ахлагч', jobProfession: '0210-22 Пуужин чиглүүлэх станцын операторч' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '02 Зэвсэгт хүчний ахлагч', minorGroup: '021 Зэвсэгт хүчний ахлагч', unitGroup: '0210 Зэвсэгт хүчний ахлагч', jobProfession: '0210-23 Онгоц, нисдэг тэрэгний хөдөлгүүрийн механик' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '02 Зэвсэгт хүчний ахлагч', minorGroup: '021 Зэвсэгт хүчний ахлагч', unitGroup: '0210 Зэвсэгт хүчний ахлагч', jobProfession: '0210-24 Телеграфын холбооны нууцлах хэрэгслийн техникч' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '02 Зэвсэгт хүчний ахлагч', minorGroup: '021 Зэвсэгт хүчний ахлагч', unitGroup: '0210 Зэвсэгт хүчний ахлагч', jobProfession: '0210-25 Телехолбооны техникч' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '02 Зэвсэгт хүчний ахлагч', minorGroup: '021 Зэвсэгт хүчний ахлагч', unitGroup: '0210 Зэвсэгт хүчний ахлагч', jobProfession: '0210-26 Артиллерийн буудагч /миномётчин/' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '02 Зэвсэгт хүчний ахлагч', minorGroup: '021 Зэвсэгт хүчний ахлагч', unitGroup: '0210 Зэвсэгт хүчний ахлагч', jobProfession: '0210-27 БМ-ын наводчик' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '02 Зэвсэгт хүчний ахлагч', minorGroup: '021 Зэвсэгт хүчний ахлагч', unitGroup: '0210 Зэвсэгт хүчний ахлагч', jobProfession: '0210-28 Артиллерийн тооцоочин- гал засварлагч' },
  { mainGroup: '0 Зэвсэгт хүчний ажил, мэргэжил', subGroup: '02 Зэвсэгт хүчний ахлагч', minorGroup: '021 Зэвсэгт хүчний ахлагч', unitGroup: '0210 Зэвсэгт хүчний ахлагч', jobProfession: '0210-29 Артиллерийн тагнуулчин' },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [contractFilter, setContractFilter] = useState('');
  const [viewMode, setViewMode] = useState<'EMPLOYEES' | 'USERS'>('EMPLOYEES');
  const [approvalFilter, setApprovalFilter] = useState('');
  const [, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [, setPositions] = useState<Array<{ id: string; title: string; department: { id: string; name: string } }>>([]);
  const [mainGroupFilter, setMainGroupFilter] = useState('');
  const [subGroupFilter, setSubGroupFilter] = useState('');
  const [minorGroupFilter, setMinorGroupFilter] = useState('');
  const [unitGroupFilter, setUnitGroupFilter] = useState('');

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

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await fetch('/api/hr/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Хэлтсүүдийг авахад алдаа гарлаа:', error);
    }
  }, []);

  const fetchPositions = useCallback(async () => {
    try {
      const response = await fetch('/api/hr/positions');
      if (response.ok) {
        const data = await response.json();
        setPositions(data);
      }
    } catch (error) {
      console.error('Албан тушаалуудыг авахад алдаа гарлаа:', error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const query = new URLSearchParams();
      if (contractFilter) query.set('contract', contractFilter);
      if (approvalFilter) query.set('approval', approvalFilter);
      const response = await fetch(`/api/hr/users?${query.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Хэрэглэгчдийг авахад алдаа гарлаа:', error);
    } finally {
      setUsersLoading(false);
    }
  }, [contractFilter, approvalFilter]);

  const fetchUsersApprovalOnly = useCallback(async () => {
    try {
      setUsersLoading(true);
      const query = new URLSearchParams();
      if (approvalFilter) query.set('approval', approvalFilter);
      const response = await fetch(`/api/hr/users?${query.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Хэрэглэгчдийг авахад алдаа гарлаа:', error);
    } finally {
      setUsersLoading(false);
    }
  }, [approvalFilter]);

  // Mount: load all reference data once
  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchPositions();
  }, [fetchEmployees, fetchDepartments, fetchPositions]);

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

  // Refetch users when filters change while in USERS view
  useEffect(() => {
    if (viewMode === 'USERS') {
      fetchUsers();
    }
  }, [contractFilter, approvalFilter, viewMode, fetchUsers]);

  // When filtering employees by approval, pull approval list
  useEffect(() => {
    if (viewMode === 'EMPLOYEES' && approvalFilter) {
      fetchUsersApprovalOnly();
    }
  }, [viewMode, approvalFilter, fetchUsersApprovalOnly]);

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
      mainGroup: undefined,
      subGroup: undefined,
      minorGroup: undefined,
      unitGroup: undefined,
      jobProfession: undefined,
    }));

    const employeesWithClassification = employees.map((emp, index) => {
      const classification =
        YAMAT8_CLASSIFICATIONS[index % YAMAT8_CLASSIFICATIONS.length];
      return {
        ...emp,
        mainGroup: classification.mainGroup,
        subGroup: classification.subGroup,
        minorGroup: classification.minorGroup,
        unitGroup: classification.unitGroup,
        jobProfession: classification.jobProfession,
      };
    });

    return [...employeesWithClassification, ...adminApprovedUsers];
  }, [employees, users]);

  const approvalEmailSet = useMemo(
    () => new Set(users.map((u) => (u.email || '').toLowerCase())),
    [users]
  );

  const filteredEmployees = mergedEmployees.filter((employee) => {
    const matchesSearch =
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || employee.status === statusFilter;
    const matchesDepartment =
      !departmentFilter || employee.department.name === departmentFilter;
    const matchesContract =
      !contractFilter ||
      (contractFilter === 'HAS' && employee.contracts.length > 0) ||
      (contractFilter === 'NONE' && employee.contracts.length === 0);
    const matchesApproval =
      !approvalFilter ||
      approvalEmailSet.has(employee.email.toLowerCase());

    const matchesMainGroup =
      !mainGroupFilter || employee.mainGroup === mainGroupFilter;
    const matchesSubGroup =
      !subGroupFilter || employee.subGroup === subGroupFilter;
    const matchesMinorGroup =
      !minorGroupFilter || employee.minorGroup === minorGroupFilter;
    const matchesUnitGroup =
      !unitGroupFilter || employee.unitGroup === unitGroupFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDepartment &&
      matchesContract &&
      matchesApproval &&
      matchesMainGroup &&
      matchesSubGroup &&
      matchesMinorGroup &&
      matchesUnitGroup
    );
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phoneNumber || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesContract =
      !contractFilter ||
      (contractFilter === 'HAS' && user.hasContract) ||
      (contractFilter === 'NONE' && !user.hasContract);

    return matchesSearch && matchesContract;
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
                Зэвсэгт хүчний ажил, мэргэжлийн ангиллын жагсаалт
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

        {/* Шүүлтүүр */}
        <div className="bg-white rounded-lg shadow mb-6 p-4 sm:p-6">
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${
              viewMode === 'EMPLOYEES' ? 'lg:grid-cols-9' : 'lg:grid-cols-4'
            } gap-3 sm:gap-4`}
          >
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Хайх
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Нэр, дугаар, имэйл..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:ring-blue-500 focus:border-blue-500 w-full text-sm"
                />
              </div>
            </div>

            {viewMode === 'EMPLOYEES' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Төлөв
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Бүгд</option>
                  <option value="ACTIVE">Идэвхтэй</option>
                  <option value="INACTIVE">Идэвхгүй</option>
                  <option value="ON_LEAVE">Чөлөөтэй</option>
                  <option value="TERMINATED">Халагдсан</option>
                </select>
              </div>
            )}

            {viewMode === 'EMPLOYEES' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Үндсэн бүлэг
                  </label>
                  <select
                    value={mainGroupFilter}
                    onChange={(e) => setMainGroupFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Бүгд</option>
                    {Array.from(
                      new Set(YAMAT8_CLASSIFICATIONS.map((c) => c.mainGroup))
                    ).map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дэд бүлэг
                  </label>
                  <select
                    value={subGroupFilter}
                    onChange={(e) => setSubGroupFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Бүгд</option>
                    {Array.from(
                      new Set(
                        YAMAT8_CLASSIFICATIONS.filter(
                          (c) => !mainGroupFilter || c.mainGroup === mainGroupFilter
                        ).map((c) => c.subGroup)
                      )
                    ).map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Бага бүлэг
                  </label>
                  <select
                    value={minorGroupFilter}
                    onChange={(e) => setMinorGroupFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Бүгд</option>
                    {Array.from(
                      new Set(
                        YAMAT8_CLASSIFICATIONS.filter(
                          (c) =>
                            (!mainGroupFilter || c.mainGroup === mainGroupFilter) &&
                            (!subGroupFilter || c.subGroup === subGroupFilter)
                        ).map((c) => c.minorGroup)
                      )
                    ).map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Нэгж бүлэг
                  </label>
                  <select
                    value={unitGroupFilter}
                    onChange={(e) => setUnitGroupFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Бүгд</option>
                    {Array.from(
                      new Set(
                        YAMAT8_CLASSIFICATIONS.filter(
                          (c) =>
                            (!mainGroupFilter || c.mainGroup === mainGroupFilter) &&
                            (!subGroupFilter || c.subGroup === subGroupFilter) &&
                            (!minorGroupFilter || c.minorGroup === minorGroupFilter)
                        ).map((c) => c.unitGroup)
                      )
                    ).map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Хэлтэс
                  </label>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Бүгд</option>
                    {Array.from(new Set(employees.map((emp) => emp.department.name))).map(
                      (dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Гэрээ
              </label>
              <select
                value={contractFilter}
                onChange={(e) => setContractFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Бүгд</option>
                <option value="HAS">Байгаа</option>
                <option value="NONE">Байхгүй</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Баталгаажуулалт
              </label>
              <select
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Бүгд</option>
                <option value="EMPLOYER">Ажил олгогч зөвшөөрсөн</option>
                <option value="ADMIN">Админ зөвшөөрсөн</option>
                <option value="APPROVED">Бүрэн зөвшөөрсөн</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setDepartmentFilter('');
                  setContractFilter('');
                  setApprovalFilter('');
                  setMainGroupFilter('');
                  setSubGroupFilter('');
                  setMinorGroupFilter('');
                  setUnitGroupFilter('');
                }}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-sm"
              >
                Цэвэрлэх
              </button>
            </div>
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
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      N
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Үндсэн бүлэг
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дэд бүлэг
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Бага бүлэг
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Нэгж бүлэг
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ажил мэргэжил
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ажилтны мэдээлэл
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Үйлдэл
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee, index) => (
                    <tr
                      key={employee.id}
                      className={`hover:bg-gray-50 ${employee.isUser ? 'bg-white' : ''}`}
                    >
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-900">
                          {employee.mainGroup || '-'}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-900">
                          {employee.subGroup || '-'}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-900">
                          {employee.minorGroup || '-'}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-900">
                          {employee.unitGroup || '-'}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-900">
                          {employee.jobProfession || '-'}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                            {employee.isUser && (
                              <span className="text-xs text-gray-500 ml-2">
                                (Хэрэглэгч)
                              </span>
                            )}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            {employee.employeeId}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            {employee.email}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            {employee.position.title} - {employee.department.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-1 sm:space-x-2">
                          {!employee.isUser ? (
                            <>
                              <Link
                                href={`/employer/hr/employees/${employee.id}`}
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="Харах"
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
                                href={`/employer/hr/employees/${employee.id}/edit`}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Засах"
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
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Хэрэглэгч
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Имэйл
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Утас
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Гэрээ
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Зөвшөөрөлт
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm font-medium text-gray-900">
                              {u.name || '-'}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm text-gray-900">
                              {u.email}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm text-gray-900">
                              {u.phoneNumber || '-'}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            {u.hasContract ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Гэрээтэй
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Гэрээгүй
                              </span>
                            )}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col space-y-1">
                              {u.employerApproved && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  Ажил олгогч
                                </span>
                              )}
                              {u.adminApproved && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  Админ
                                </span>
                              )}
                              {u.approved && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  Бүрэн
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
