'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { 
  TrashIcon, 
  DocumentTextIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { TableSkeleton, PageHeaderSkeleton, SearchBarSkeleton, ListSkeleton } from '@/components/Skeletons';
import ContractModal from '@/components/ContractModal';

interface Contract {
  id: string;
  contractNumber: string;
  employee: {
    id: string;
    firstName: string;
    middleName: string;
    employeeId: string;
    position?: {
      title: string;
      department?: {
        name: string;
      };
    };
    department?: {
      name: string;
    };
  };
  contractType: string;
  startDate: string;
  endDate: string | null;
  salary: number;
  currency: string;
  status: string;
  createdAt: string;
  probationPeriod?: number | null;
  workSchedule?: string | null;
  benefits?: string | null;
  terms?: string | null;
  workConditions?: string;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [contractTypeFilter, setContractTypeFilter] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContractId, setEditingContractId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchContracts();
    setCurrentDate(new Date().toLocaleString('mn-MN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await fetch('/api/hr/contracts');
      if (response.ok) {
        const data = await response.json();
        setContracts(data);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.employee.middleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || contract.status === statusFilter;
    const matchesType = contractTypeFilter === '' || contract.contractType === contractTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDelete = async (contractId: string) => {
    if (confirm('Энэ гэрээг устгахдаа итгэлтэй байна уу?')) {
      try {
        const response = await fetch(`/api/hr/contracts/${contractId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Гэрээ амжилттай устгагдлаа');
          fetchContracts();
        } else {
          const error = await response.json();
          alert(error.error || 'Алдаа гарлаа');
        }
      } catch (error) {
        console.error('Гэрээ устгахад алдаа гарлаа:', error);
        alert('Алдаа гарлаа');
      }
    }
  };

  const handleOpenNewModal = () => {
    setEditingContractId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (contractId: string) => {
    setEditingContractId(contractId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContractId(null);
  };

  const handleModalSuccess = () => {
    fetchContracts();
  };

  const handleOpenDetailModal = async (contractId: string) => {
    setLoadingDetail(true);
    setShowDetailModal(true);
    try {
      const response = await fetch(`/api/hr/contracts/${contractId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedContract(data);
      } else {
        alert('Гэрээний мэдээлэл авахад алдаа гарлаа');
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
      alert('Гэрээний мэдээлэл авахад алдаа гарлаа');
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedContract(null);
  };

  const handleDownloadWord = async () => {
    if (!selectedContract) return;
    
    setDownloading(true);
    try {
      const response = await fetch(`/api/hr/contracts/${selectedContract.id}/generate-word`);
      if (!response.ok) {
        throw new Error('Word файл үүсгэхэд алдаа гарлаа');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedContract.contractNumber}_Хөдөлмөрийн_гэрээ.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Word татахад алдаа:', error);
      alert('Word файл татахад алдаа гарлаа');
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('mn-MN');
  };


  const getContractTypeLabel = (type: string) => {
    switch (type) {
      case 'FULL_TIME':
        return 'Үндсэн ажилтан';
      case 'PART_TIME':
        return 'Цагийн ажилтан';
      case 'INTERNSHIP':
        return 'Дадлага ажилтан';
      case 'PROBATION':
        return 'Туршилтын ажилтан';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <PageHeaderSkeleton />
        <SearchBarSkeleton />
        <ListSkeleton count={8} />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8 sm:mt-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Хөдөлмөрийн гэрээнүүд</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Хөдөлмөрийн гэрээний жагсаалт болон удирдлага
              </p>
              {currentDate && (
                <div className="hidden-on-screen mt-2 text-sm text-gray-500">
                  Хэвлэсэн огноо: {currentDate}
                </div>
              )}
            </div>
            <div className="flex gap-2 print:hidden">
              <button
                onClick={handleOpenNewModal}
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Шинэ гэрээ</span>
                <span className="sm:hidden">Шинэ</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Хайх
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Гэрээний дугаар, ажилтны нэр..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 text-gray-700 focus:border-blue-500 w-full text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Гэрээний төрөл
              </label>
              <select
                value={contractTypeFilter}
                onChange={(e) => setContractTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Бүгд</option>
                <option value="FULL_TIME">Үндсэн ажилтан</option>
                <option value="PART_TIME">Цагийн ажилтан</option>
                <option value="INTERNSHIP">Дадлага ажилтан</option>
                <option value="PROBATION">Туршилтын ажилтан</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setContractTypeFilter('');
                }}
                className="w-full px-3 sm:px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm"
              >
                Цэвэрлэх
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredContracts.map((contract) => (
            <div key={contract.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center min-w-0 flex-1">
                    <DocumentTextIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mr-2 sm:mr-3 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {contract.contractNumber}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {getContractTypeLabel(contract.contractType)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1 sm:space-x-2 ml-2">
                    <button
                      onClick={() => handleOpenDetailModal(contract.id)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Үзэх"
                    >
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(contract.id)}
                      className="text-green-600 hover:text-green-900 p-1"
                      title="Засах"
                    >
                      <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/hr/contracts/${contract.id}/generate-word`);
                          if (!response.ok) {
                            throw new Error('Word файл үүсгэхэд алдаа гарлаа');
                          }
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${contract.contractNumber}_Хөдөлмөрийн_гэрээ.docx`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                        } catch (error) {
                          console.error('Word хэвлэхэд алдаа:', error);
                          alert('Word хэвлэхэд алдаа гарлаа');
                        }
                      }}
                      className="text-purple-600 hover:text-purple-900 p-1"
                      title="Word хэвлэх"
                    >
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(contract.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Устгах"
                    >
                      <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>

                <div className="mb-3 sm:mb-4">
                  <div className="flex items-center mb-2">
                    <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contract.employee.firstName} {contract.employee.middleName}
                      </p>
                      <p className="text-xs text-gray-500">{contract.employee.employeeId}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-1 sm:mr-2 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Эхлэх</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {formatDate(contract.startDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-1 sm:mr-2 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Цалин</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {contract.salary.toLocaleString()} {contract.currency}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {contract.endDate && (
                  <div className="mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Дуусах огноо</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900">{formatDate(contract.endDate)}</p>
                  </div>
                )}

                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Үүсгэсэн: {formatDate(contract.createdAt)}
                    </span>
                    <button
                      onClick={() => handleOpenDetailModal(contract.id)}
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

        {filteredContracts.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <DocumentTextIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <div className="text-sm sm:text-base text-gray-500">
              {searchTerm || statusFilter || contractTypeFilter ? 'Хайлтын үр дүн олдсонгүй' : 'Гэрээ олдсонгүй'}
            </div>
          </div>
        )}
      </div>

    <ContractModal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      onSuccess={handleModalSuccess}
      contractId={editingContractId}
    />

    {showDetailModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <h3 className="text-lg font-semibold text-[#0C213A]">
              {selectedContract ? `Хөдөлмөрийн гэрээ: ${selectedContract.contractNumber}` : 'Гэрээний дэлгэрэнгүй'}
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
            ) : selectedContract ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-[#0C213A] mb-4">Ажилтны мэдээлэл</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Нэр</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedContract.employee.middleName} {selectedContract.employee.firstName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Ажилтны код</p>
                        <p className="text-sm font-medium text-gray-900">{selectedContract.employee.employeeId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Албан тушаал</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedContract.employee.position?.title || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Хэлтэс</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedContract.employee.department?.name || selectedContract.employee.position?.department?.name || '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-[#0C213A] mb-4">Гэрээний мэдээлэл</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Гэрээний төрөл</p>
                        <p className="text-sm font-medium text-gray-900">{getContractTypeLabel(selectedContract.contractType)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Эхлэх огноо</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(selectedContract.startDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Дуусах огноо</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedContract.endDate ? formatDate(selectedContract.endDate) : 'Тодорхойгүй'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Цалин</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedContract.salary.toLocaleString()} {selectedContract.currency}
                        </p>
                      </div>
                      {selectedContract.probationPeriod && (
                        <div>
                          <p className="text-sm text-gray-500">Туршилтын хугацаа</p>
                          <p className="text-sm font-medium text-gray-900">{selectedContract.probationPeriod} өдөр</p>
                        </div>
                      )}
                      {selectedContract.workSchedule && (
                        <div>
                          <p className="text-sm text-gray-500">Ажлын цагийн хуваарь</p>
                          <p className="text-sm font-medium text-gray-900">{selectedContract.workSchedule}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">Төлөв</p>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            selectedContract.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : selectedContract.status === 'EXPIRED'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {selectedContract.status === 'ACTIVE' ? 'Идэвхтэй' : 
                           selectedContract.status === 'EXPIRED' ? 'Дууссан' : 
                           selectedContract.status === 'TERMINATED' ? 'Цуцалсан' : selectedContract.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedContract.benefits && (
                  <div>
                    <h4 className="text-lg font-semibold text-[#0C213A] mb-2">Хангамж</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedContract.benefits}</p>
                  </div>
                )}

                {selectedContract.terms && (
                  <div>
                    <h4 className="text-lg font-semibold text-[#0C213A] mb-2">Нөхцөл</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedContract.terms}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Гэрээ олдсонгүй</p>
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
            <button
              onClick={handleDownloadWord}
              disabled={downloading}
              className={`px-4 py-2 rounded-lg text-white ${
                downloading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {downloading ? 'Татаж байна...' : 'Word татах'}
            </button>
            {selectedContract && (
              <button
                onClick={() => {
                  handleCloseDetailModal();
                  handleOpenEditModal(selectedContract.id);
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
