'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { CardSkeleton, PageHeaderSkeleton, SearchBarSkeleton } from '@/components/Skeletons';
import DepartmentModal from '@/components/DepartmentModal';
import { useNotification } from '@/providers/NotificationProvider';

interface DepartmentEmployee {
  id: string;
  firstName: string;
  lastName?: string;
  middleName?: string;
  employeeId: string;
  position?: {
    title: string;
  };
}

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  positions: Array<{
    id: string;
    title: string;
    code: string;
  }>;
  employees: DepartmentEmployee[];
}

export default function DepartmentsPage() {
  const { addNotification } = useNotification();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadDepartments = async () => {
    try {
      const response = await fetch('/api/hr/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      } else {
        console.error('Failed to load departments:', response.status, response.statusText);
        setDepartments([]);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const filteredDepartments = departments.filter(department =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    department.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (department.description && department.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (departmentId: string) => {
    if (confirm('Энэ хэлтсийн бүх албан тушаал болон ажилтнуудыг устгахдаа итгэлтэй байна уу?')) {
      try {
        const response = await fetch(`/api/hr/departments/${departmentId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          addNotification('Хэлтэс амжилттай устгагдлаа', 'success');
          loadDepartments();
        } else {
          const error = await response.json();
          addNotification(error.error || 'Алдаа гарлаа', 'error');
        }
      } catch (error) {
        console.error('Хэлтэс устгахад алдаа гарлаа:', error);
        addNotification('Алдаа гарлаа', 'error');
      }
    }
  };

  const handleOpenNewModal = () => {
    setEditingDepartmentId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (departmentId: string) => {
    setEditingDepartmentId(departmentId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDepartmentId(null);
  };

  const handleModalSuccess = async () => {
    // Small delay to ensure database transaction is committed
    await new Promise(resolve => setTimeout(resolve, 300));
    await loadDepartments();
  };

  const handleOpenDetailModal = async (departmentId: string) => {
    setLoadingDetail(true);
    setShowDetailModal(true);
    try {
      const response = await fetch(`/api/hr/departments/${departmentId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedDepartment(data);
      } else {
        addNotification('Хэлтсийн мэдээлэл авахад алдаа гарлаа', 'error');
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Error fetching department:', error);
      addNotification('Хэлтсийн мэдээлэл авахад алдаа гарлаа', 'error');
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedDepartment(null);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <PageHeaderSkeleton />
        <SearchBarSkeleton />
        <CardSkeleton count={6} />
      </div>
    );
  }

  return (
   <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="mb-6 sm:mb-8 sm:mt-10">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Хэлтсүүд</h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600">
                  Хэлтсүүдийн жагсаалт болон удирдлага
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
              <div className="flex gap-2 print:hidden">
                <button
                  onClick={handleOpenNewModal}
                  className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                >
                  <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Шинэ хэлтэс</span>
                  <span className="sm:hidden">Шинэ</span>
                </button>
              </div>
            </div>
          </div>

        <div className="bg-white rounded-lg shadow mb-6 p-4 sm:p-6">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Хайх
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
              <input
                type="text"
                placeholder="Хэлтсийн нэр, код..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 text-gray-700 focus:border-blue-500 w-full text-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredDepartments.map((department) => (
            <div key={department.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center min-w-0 flex-1">
                    <BuildingOfficeIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mr-2 sm:mr-3 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {department.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Код: {department.code}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1 sm:space-x-2 ml-2">
                    <button
                      onClick={() => handleOpenDetailModal(department.id)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Үзэх"
                    >
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(department.id)}
                      className="text-green-600 hover:text-green-900 p-1"
                      title="Засах"
                    >
                      <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(department.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Устгах"
                    >
                      <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>

                {department.description && (
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                    {department.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center">
                      <UsersIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-1 sm:mr-2 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {department.employees?.length || 0}
                        </p>
                        <p className="text-xs text-gray-500">Ажилтны</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-1 sm:mr-2 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {department.positions?.length || 0}
                        </p>
                        <p className="text-xs text-gray-500">Тушаал</p>
                      </div>
                    </div>
                  </div>
                </div>

                {department.positions && department.positions.length > 0 && (
                  <div className="mb-3 sm:mb-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Албан тушаалууд:</h4>
                    <div className="space-y-1">
                      {department.positions.slice(0, 3).map((position: { id: string; title: string; code: string }) => (
                        <div key={position.id} className="text-xs sm:text-sm text-gray-600 truncate">
                          • {position.title} ({position.code})
                        </div>
                      ))}
                      {department.positions.length > 3 && (
                        <div className="text-xs sm:text-sm text-gray-500">
                          +{department.positions.length - 3} нэмэгдэл
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {department.employees && department.employees.length > 0 && (
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Ажилтнууд:</h4>
                    <div className="space-y-1">
                      {department.employees.slice(0, 3).map((employee) => (
                        <div key={employee.id} className="text-xs sm:text-sm text-gray-600 truncate">
                          • {employee.firstName} {employee.middleName || employee.lastName || ''} ({employee.employeeId})
                        </div>
                      ))}
                      {department.employees.length > 3 && (
                        <div className="text-xs sm:text-sm text-gray-500">
                          +{department.employees.length - 3} нэмэгдэл
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Үүсгэсэн: {new Date(department.createdAt).toLocaleDateString('mn-MN')}
                    </span>
                    <button
                      onClick={() => handleOpenDetailModal(department.id)}
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Дэлгэрэнгүй харах →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDepartments.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <BuildingOfficeIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <div className="text-sm sm:text-base text-gray-500">
              {searchTerm ? 'Хайлтын үр дүн олдсонгүй' : 'Хэлтэс олдсонгүй'}
            </div>
          </div>
        )}
    </div>

    <DepartmentModal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      onSuccess={handleModalSuccess}
      departmentId={editingDepartmentId}
    />

    {showDetailModal && selectedDepartment && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <h3 className="text-lg font-semibold text-[#0C213A]">
              {selectedDepartment.name}
            </h3>
            <button
              onClick={handleCloseDetailModal}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="overflow-y-auto flex-1 p-6">
            {loadingDetail ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <UsersIcon className="h-5 w-5 text-gray-600" />
                      <span className="text-gray-600 text-sm">Ажилтнууд</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{selectedDepartment.employees?.length || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-600" />
                      <span className="text-gray-600 text-sm">Албан тушаал</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{selectedDepartment.positions?.length || 0}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Үндсэн мэдээлэл</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Хэлтсийн нэр</p>
                      <p className="text-lg font-medium text-gray-900">{selectedDepartment.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Код</p>
                      <p className="text-lg font-mono font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg inline-block">{selectedDepartment.code}</p>
                    </div>
                    {selectedDepartment.description && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Тайлбар</p>
                        <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">{selectedDepartment.description}</p>
                      </div>
                    )}
                    {selectedDepartment.createdAt && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Үүсгэсэн огноо</p>
                        <p className="text-gray-900 font-medium">
                          {new Date(selectedDepartment.createdAt).toLocaleDateString('mn-MN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedDepartment.positions && selectedDepartment.positions.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Албан тушаалууд ({selectedDepartment.positions.length})</h4>
                    <div className="space-y-2">
                      {selectedDepartment.positions.map((position) => (
                        <div key={position.id} className="p-4 border border-gray-200 rounded-lg">
                          <p className="font-semibold text-gray-900">{position.title}</p>
                          <p className="text-sm text-gray-500 font-mono">{position.code}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDepartment.employees && selectedDepartment.employees.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Ажилтнууд ({selectedDepartment.employees.length})</h4>
                    <div className="space-y-2">
                      {selectedDepartment.employees.map((employee) => (
                        <div key={employee.id} className="p-4 border border-gray-200 rounded-lg">
                          <p className="font-semibold text-gray-900">
                            {employee.firstName} {employee.middleName || employee.lastName || ''}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{employee.employeeId}</span>
                            {employee.position && (
                              <>
                                <span className="text-xs text-gray-500">•</span>
                                <span className="text-xs text-gray-600">{employee.position.title}</span>
                              </>
                            )}
                          </div>
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
              onClick={handleCloseDetailModal}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              Хаах
            </button>
            {selectedDepartment && (
              <button
                onClick={() => {
                  handleCloseDetailModal();
                  handleOpenEditModal(selectedDepartment.id);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Засах
              </button>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
