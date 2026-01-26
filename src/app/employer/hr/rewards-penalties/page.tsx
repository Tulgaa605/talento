"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { StatsSkeleton, PageHeaderSkeleton, CardSkeleton } from "@/components/Skeletons";

type Reward = {
  id: number;
  employeeId: string;
  employee: string;
  type: string;
  amount: string;
  reason: string;
  date: string;
  status: string;
  issuedBy: string;
  orderNumber: string;
};

type Penalty = {
  id: number;
  employeeId: string;
  employee: string;
  type: string;
  reason: string;
  amount: string;
  date: string;
  status: string;
  decidedBy: string;
  orderNumber: string;
};

export default function RewardsPenaltiesPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentDate, setCurrentDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddPenaltyModal, setShowAddPenaltyModal] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [rewardMode, setRewardMode] = useState<"view" | "edit" | null>(null);
  const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null);
  const [penaltyMode, setPenaltyMode] = useState<"view" | "edit" | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setCurrentDate(new Date().toLocaleString('mn-MN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
  }, []);

  // Dynamic stats
  const now = new Date();
  // const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  // const monthRewards = rewards.filter((r) => String(r.date).startsWith(monthKey)).length;
  // const monthPenalties = penalties.filter((p) => String(p.date).startsWith(monthKey)).length;
  // const stats = [
  //   { label: "Нийт шагнал", value: String(rewards.length), change: "", color: "text-green-600", icon: "🏆" },
  //   { label: "Нийт шийтгэл", value: String(penalties.length), change: "", color: "text-red-600", icon: "⚠️" },
  //   { label: "Энэ сар шагнал", value: String(monthRewards), change: "", color: "text-blue-600", icon: "⭐" },
  //   { label: "Энэ сар шийтгэл", value: String(monthPenalties), change: "", color: "text-orange-600", icon: "📋" }
  // ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [r, p] = await Promise.all([
          fetch('/api/hr/rewards').then(res => res.json()),
          fetch('/api/hr/penalties').then(res => res.json()),
        ]);
        setRewards(r as Reward[]);
        setPenalties(p as Penalty[]);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openReward = (mode: "view" | "edit", r: Reward) => {
    setSelectedReward(r);
    setRewardMode(mode);
  };
  const closeReward = () => {
    setSelectedReward(null);
    setRewardMode(null);
  };

  const openPenalty = (mode: "view" | "edit", p: Penalty) => {
    setSelectedPenalty(p);
    setPenaltyMode(mode);
  };
  const closePenalty = () => {
    setSelectedPenalty(null);
    setPenaltyMode(null);
  };

  const handleAddReward = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newReward: Reward = {
      id: Date.now(),
      employeeId: String(fd.get("employeeId") || "EMP000"),
      employee: String(fd.get("employee") || "Тодорхойгүй"),
      type: String(fd.get("type") || "Урамшуулал"),
      amount: String(fd.get("amount") || "0₮"),
      reason: String(fd.get("reason") || ""),
      date: String(fd.get("date") || new Date().toISOString().slice(0,10)),
      status: String(fd.get("status") || "Олгосон"),
      issuedBy: String(fd.get("issuedBy") || ""),
      orderNumber: String(fd.get("orderNumber") || "")
    };
    setRewards((prev) => [newReward, ...prev]);
    try {
      fetch('/api/hr/rewards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newReward) });
    } catch {}
    // Modal алга болохгүй, зөвхөн form хоосордох
    e.currentTarget.reset();
    setActiveTab("rewards");
    // setShowAddModal(false); - Modal нээлттэй үлдэнэ
  };

  const handleSaveReward = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedReward) return;
    const fd = new FormData(e.currentTarget);
    const updated: Reward = {
      ...selectedReward,
      employeeId: String(fd.get("employeeId") || selectedReward.employeeId),
      employee: String(fd.get("employee") || selectedReward.employee),
      type: String(fd.get("type") || selectedReward.type),
      amount: String(fd.get("amount") || selectedReward.amount),
      reason: String(fd.get("reason") || selectedReward.reason),
      date: String(fd.get("date") || selectedReward.date),
      status: String(fd.get("status") || selectedReward.status),
      issuedBy: String(fd.get("issuedBy") || selectedReward.issuedBy),
      orderNumber: String(fd.get("orderNumber") || selectedReward.orderNumber)
    };
    setRewards((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    closeReward();
  };

  const handleSavePenalty = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPenalty) return;
    const fd = new FormData(e.currentTarget);
    const updated: Penalty = {
      ...selectedPenalty,
      employeeId: String(fd.get("employeeId") || selectedPenalty.employeeId),
      employee: String(fd.get("employee") || selectedPenalty.employee),
      type: String(fd.get("type") || selectedPenalty.type),
      reason: String(fd.get("reason") || selectedPenalty.reason),
      amount: String(fd.get("amount") || selectedPenalty.amount),
      date: String(fd.get("date") || selectedPenalty.date),
      status: String(fd.get("status") || selectedPenalty.status),
      decidedBy: String(fd.get("decidedBy") || selectedPenalty.decidedBy),
      orderNumber: String(fd.get("orderNumber") || selectedPenalty.orderNumber)
    };
    setPenalties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    closePenalty();
  };

  const handleAddPenalty = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newPenalty: Penalty = {
      id: Date.now(),
      employeeId: String(fd.get("employeeId") || "EMP000"),
      employee: String(fd.get("employee") || "Тодорхойгүй"),
      type: String(fd.get("type") || "Анхааруулга"),
      reason: String(fd.get("reason") || ""),
      amount: String(fd.get("amount") || "0₮"),
      date: String(fd.get("date") || new Date().toISOString().slice(0,10)),
      status: String(fd.get("status") || "Бүртгэгдсэн"),
      decidedBy: String(fd.get("decidedBy") || ""),
      orderNumber: String(fd.get("orderNumber") || ""),
    };
    setPenalties((prev) => [newPenalty, ...prev]);
    try {
      fetch('/api/hr/penalties', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newPenalty) });
    } catch {}
    // Modal алга болохгүй, зөвхөн form хоосордох
    e.currentTarget.reset();
    setActiveTab("penalties");
    // setShowAddPenaltyModal(false); - Modal нээлттэй үлдэнэ
  };

  const handleDownloadRewardsReport = () => {
    try {
      if (rewards.length === 0) {
        alert('Татах шагнал байхгүй байна');
        return;
      }

      // Create CSV content
      const csvRows = [
        'Ажилтны ID,Ажилтан,Шагналын төрөл,Шалтгаан,Дүн,Олгосон,Огноо,Төлөв,Дугаар'
      ];

      rewards.forEach((reward) => {
        const row = [
          reward.employeeId,
          reward.employee,
          reward.type,
          `"${(reward.reason || '').replace(/"/g, '""')}"`,
          reward.amount,
          reward.issuedBy,
          reward.date,
          reward.status,
          reward.orderNumber
        ].join(',');
        csvRows.push(row);
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `Шагналын_тайлан_${dateStr}.csv`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading rewards report:', error);
      alert('Шагналын тайлан татахад алдаа гарлаа');
    }
  };

  const handleDownloadPenaltiesReport = () => {
    try {
      if (penalties.length === 0) {
        alert('Татах шийтгэл байхгүй байна');
        return;
      }

      // Create CSV content
      const csvRows = [
        'Ажилтны ID,Ажилтан,Шийтгэлийн төрөл,Шалтгаан,Хэмжээ,Шийдвэрлэсэн,Огноо,Төлөв,Дугаар'
      ];

      penalties.forEach((penalty) => {
        const row = [
          penalty.employeeId,
          penalty.employee,
          penalty.type,
          `"${(penalty.reason || '').replace(/"/g, '""')}"`,
          penalty.amount,
          penalty.decidedBy,
          penalty.date,
          penalty.status,
          penalty.orderNumber
        ].join(',');
        csvRows.push(row);
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `Шийтгэлийн_тайлан_${dateStr}.csv`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading penalties report:', error);
      alert('Шийтгэлийн тайлан татахад алдаа гарлаа');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto mt-10 px-4 py-8">
          <PageHeaderSkeleton />
          <StatsSkeleton count={4} />
          <div className="mb-6">
            <div className="flex space-x-8 border-b border-gray-200">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-gray-200 rounded w-28 mb-2 animate-pulse"></div>
              ))}
            </div>
          </div>
          <CardSkeleton count={6} />

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <th key={i} className="px-6 py-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[1, 2, 3, 4].map((i) => (
                    <tr key={i}>
                      {[1, 2, 3, 4, 5, 6].map((j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <div ref={componentRef} className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mt-10 mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#0C213A] mb-2">Шагнал, шийтгэлийн бүртгэл</h1>
              <p className="text-gray-600">Ажилтнуудын шагнал, шийтгэлийн мэдээллийг удирдах</p>
              {currentDate && (
                <div className="hidden-on-screen mt-2 text-sm text-gray-500">
                  Хэвлэсэн огноо: {currentDate}
                </div>
              )}
            </div>
          </div>
        </div>

      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-[#0C213A]">{stat.value}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{stat.icon}</span>
                <div className={`text-sm font-medium ${stat.color}`}>
                  {stat.change}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div> */}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", name: "Хянах самбар" },
              { id: "rewards", name: "Шагналууд" },
              { id: "penalties", name: "Шийтгэлүүд" },
              { id: "reports", name: "Тайлан" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-[#0C213A] text-[#0C213A]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Recent Rewards */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#0C213A]">Сүүлийн шагналууд</h3>
              <button 
                onClick={() => setActiveTab("rewards")}
                className="text-sm text-[#0C213A] hover:text-[#0C213A]/80 cursor-pointer"
              >
                Бүгдийг харах
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {rewards.map((reward) => (
                  <div key={reward.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600">🏆</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-[#0C213A]">{reward.employee}</h4>
                        <p className="text-sm text-gray-600">{reward.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{reward.amount}</p>
                      <p className="text-xs text-gray-500">{reward.date}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        reward.status === "Олгосон" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {reward.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Penalties */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#0C213A]">Сүүлийн шийтгэлүүд</h3>
              <button 
                onClick={() => setActiveTab("penalties")}
                className="text-sm text-[#0C213A] hover:text-[#0C213A]/80 cursor-pointer"
              >
                Бүгдийг харах
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {penalties.map((penalty) => (
                  <div key={penalty.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600">⚠️</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-[#0C213A]">{penalty.employee}</h4>
                        <p className="text-sm text-gray-600">{penalty.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{penalty.reason}</p>
                      <p className="text-xs text-gray-500">{penalty.date}</p>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        {penalty.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "rewards" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[#0C213A]">Шагналын бүртгэл</h3>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Шинэ шагнал нэмэх
            </button>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ажилтны ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ажилтан</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Шагналын төрөл</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Шалтгаан</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дүн</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Олгосон</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Огноо</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Төлөв</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rewards.map((reward) => (
                  <tr key={reward.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0C213A]">{reward.employeeId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0C213A]">{reward.employee}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reward.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reward.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{reward.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reward.issuedBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reward.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        reward.status === "Олгосон" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {reward.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => openReward("view", reward)} className="text-[#0C213A] hover:text-[#0C213A]/80">Үзэх</button>
                      <button onClick={() => openReward("edit", reward)} className="text-gray-500 hover:text-gray-700">Засах</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "penalties" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[#0C213A]">Шийтгэлийн бүртгэл</h3>
            <button onClick={() => setShowAddPenaltyModal(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
              Шинэ шийтгэл нэмэх
            </button>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ажилтны ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ажилтан</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Шийтгэлийн төрөл</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Шалтгаан</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Хэмжээ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Шийдвэрлэсэн</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Огноо</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Төлөв</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {penalties.map((penalty) => (
                  <tr key={penalty.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0C213A]">{penalty.employeeId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0C213A]">{penalty.employee}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{penalty.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{penalty.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">{penalty.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{penalty.decidedBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{penalty.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        penalty.status === "Хэрэгжүүлсэн" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {penalty.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => openPenalty("view", penalty)} className="text-[#0C213A] hover:text-[#0C213A]/80">Үзэх</button>
                      <button onClick={() => openPenalty("edit", penalty)} className="text-gray-500 hover:text-gray-700">Засах</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-[#0C213A]">Статистик</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-medium text-gray-600 mb-3">Шагналын төрлөөр</h4>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Шилдэг ажилтан</span>
                      <span className="text-sm font-medium">15</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Нэмэгдэл</span>
                      <span className="text-sm font-medium">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Урамшуулал</span>
                      <span className="text-sm font-medium">10</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Тусгай шагнал</span>
                      <span className="text-sm font-medium">8</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-medium text-gray-600 mb-3">Шийтгэлийн төрлөөр</h4>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Анхааруулга</span>
                      <span className="text-sm font-medium">6</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Сануулах</span>
                      <span className="text-sm font-medium">4</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Торгууль</span>
                      <span className="text-sm font-medium">2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-[#0C213A]">Экспорт</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <button 
                  onClick={handleDownloadRewardsReport}
                  className="w-full flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0C213A] hover:bg-[#0C213A]/5 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-gray-600">Шагналын тайлан татах</span>
                </button>
                <button 
                  onClick={handleDownloadPenaltiesReport}
                  className="w-full flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0C213A] hover:bg-[#0C213A]/5 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <span className="text-gray-600">Шийтгэлийн тайлан татах</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-semibold text-[#0C213A]">Шинэ шагнал нэмэх</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">
              <form onSubmit={handleAddReward} className="space-y-4">
                <div className="grid grid-cols-1 text-gray-700 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Ажилтан</label>
                    <input name="employee" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Нэр" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Ажилтны ID</label>
                    <input name="employeeId" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Ажилтны ID" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Шагналын төрөл</label>
                    <select name="type" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0C213A]">
                      <option>Төрөл сонгох</option>
                      <option>Шилдэг ажилтан</option>
                      <option>Нэмэгдэл</option>
                      <option>Урамшуулал</option>
                      <option>Тусгай шагнал</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Дүн</label>
                    <input name="amount" type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0C213A]" placeholder="Жишээ: 500,000₮" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Огноо</label>
                    <input name="date" type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Олгосон</label>
                    <input name="issuedBy" className="w-full border border-gray-300 rounded-lg px-3 py-2"/>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Тайлбар</label>
                    <textarea name="reason" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0C213A]" rows={3} placeholder="Шагналын шалтгаан..."></textarea>
                  </div>
                </div>
                <div className="flex direction flex-end justify-end content is dsjkfnknfsd my bad i think i wanna to out in work i cant do this its so hard i "></div>
                <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 mt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Цуцлах</button>
                  <button type="submit" className="px-4 py-2 bg-[#0C213A] text-white rounded-lg hover:bg-[#0C213A]/90">Хадгалах</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showAddPenaltyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-semibold text-[#0C213A]">Шинэ шийтгэл нэмэх</h3>
              <button
                onClick={() => setShowAddPenaltyModal(false)}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">
              <form onSubmit={handleAddPenalty} className="space-y-4">
                <div className="grid grid-cols-1 text-gray-700 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Ажилтан</label>
                    <input name="employee" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Нэр" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Ажилтны ID</label>
                    <input name="employeeId" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Ажилтны ID" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Шийтгэлийн төрөл</label>
                    <select name="type" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0C213A]">
                      <option>Төрөл сонгох</option>
                      <option>Анхааруулга</option>
                      <option>Сануулах</option>
                      <option>Торгууль</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Хэмжээ</label>
                    <input name="amount" type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0C213A]" placeholder="Жишээ: 100,000₮" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Огноо</label>
                    <input name="date" type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Шийдвэрлэсэн</label>
                    <input name="decidedBy" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Шалтгаан</label>
                    <textarea name="reason" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0C213A]" rows={3} placeholder="Шийтгэлийн шалтгаан..."></textarea>
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 mt-4">
                  <button type="button" onClick={() => setShowAddPenaltyModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Цуцлах</button>
                  <button type="submit" className="px-4 py-2 bg-[#0C213A] text-white rounded-lg hover:bg-[#0C213A]/90">Хадгалах</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reward View/Edit Modal */}
      {selectedReward && rewardMode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#0C213A]">Шагнал - {rewardMode === "view" ? "Дэлгэрэнгүй" : "Засах"}</h3>
              <button onClick={closeReward} className="p-2 hover:bg-gray-100 rounded-md">✕</button>
            </div>
            {rewardMode === "view" ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p><span className="text-gray-500">Ажилтны ID:</span> <span className="font-medium text-[#0C213A]">{selectedReward.employeeId}</span></p>
                <p><span className="text-gray-500">Ажилтан:</span> <span className="font-medium text-[#0C213A]">{selectedReward.employee}</span></p>
                <p><span className="text-gray-500">Төрөл:</span> <span className="font-medium text-[#0C213A]">{selectedReward.type}</span></p>
                <p><span className="text-gray-500">Дүн:</span> <span className="font-medium text-green-700">{selectedReward.amount}</span></p>
                <p className="col-span-2"><span className="text-gray-500">Шалтгаан:</span> <span className="font-medium text-[#0C213A]">{selectedReward.reason}</span></p>
                <p><span className="text-gray-500">Огноо:</span> <span className="font-medium text-[#0C213A]">{selectedReward.date}</span></p>
                <p><span className="text-gray-500">Олгосон:</span> <span className="font-medium text-[#0C213A]">{selectedReward.issuedBy}</span></p>
                <p><span className="text-gray-500">Төлөв:</span> <span className="font-medium text-[#0C213A]">{selectedReward.status}</span></p>
                <p><span className="text-gray-500">Дугаар:</span> <span className="font-medium text-[#0C213A]">{selectedReward.orderNumber}</span></p>
            </div>
            ) : (
              <form onSubmit={handleSaveReward} className="grid grid-cols-2 gap-4 text-sm">
                <input name="employeeId" defaultValue={selectedReward.employeeId} className="border rounded-lg px-3 py-2" />
                <input name="employee" defaultValue={selectedReward.employee} className="border rounded-lg px-3 py-2" />
                <input name="type" defaultValue={selectedReward.type} className="border rounded-lg px-3 py-2" />
                <input name="amount" defaultValue={selectedReward.amount} className="border rounded-lg px-3 py-2" />
                <input name="date" defaultValue={selectedReward.date} className="border rounded-lg px-3 py-2" />
                <input name="issuedBy" defaultValue={selectedReward.issuedBy} className="border rounded-lg px-3 py-2" />
                <input name="status" defaultValue={selectedReward.status} className="border rounded-lg px-3 py-2" />
                <input name="orderNumber" defaultValue={selectedReward.orderNumber} className="border rounded-lg px-3 py-2" />
                <textarea name="reason" defaultValue={selectedReward.reason} className="border rounded-lg px-3 py-2 col-span-2" />
                <div className="col-span-2 flex justify-end gap-3 mt-2">
                  <button type="button" onClick={closeReward} className="px-4 py-2 border rounded-lg">Цуцлах</button>
                  <button type="submit" className="px-4 py-2 bg-[#0C213A] text-white rounded-lg">Хадгалах</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Penalty View/Edit Modal */}
      {selectedPenalty && penaltyMode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#0C213A]">Шийтгэл - {penaltyMode === "view" ? "Дэлгэрэнгүй" : "Засах"}</h3>
              <button onClick={closePenalty} className="p-2 hover:bg-gray-100 rounded-md">✕</button>
            </div>
            {penaltyMode === "view" ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p><span className="text-gray-500">Ажилтны ID:</span> <span className="font-medium text-[#0C213A]">{selectedPenalty.employeeId}</span></p>
                <p><span className="text-gray-500">Ажилтан:</span> <span className="font-medium text-[#0C213A]">{selectedPenalty.employee}</span></p>
                <p><span className="text-gray-500">Төрөл:</span> <span className="font-medium text-[#0C213A]">{selectedPenalty.type}</span></p>
                <p><span className="text-gray-500">Хэмжээ:</span> <span className="font-medium text-red-700">{selectedPenalty.amount}</span></p>
                <p className="col-span-2"><span className="text-gray-500">Шалтгаан:</span> <span className="font-medium text-[#0C213A]">{selectedPenalty.reason}</span></p>
                <p><span className="text-gray-500">Огноо:</span> <span className="font-medium text-[#0C213A]">{selectedPenalty.date}</span></p>
                <p><span className="text-gray-500">Шийдвэрлэсэн:</span> <span className="font-medium text-[#0C213A]">{selectedPenalty.decidedBy}</span></p>
                <p><span className="text-gray-500">Төлөв:</span> <span className="font-medium text-[#0C213A]">{selectedPenalty.status}</span></p>
                <p><span className="text-gray-500">Дугаар:</span> <span className="font-medium text-[#0C213A]">{selectedPenalty.orderNumber}</span></p>
            </div>
            ) : (
              <form onSubmit={handleSavePenalty} className="grid grid-cols-2 gap-4 text-sm">
                <input name="employeeId" defaultValue={selectedPenalty.employeeId} className="border rounded-lg px-3 py-2" />
                <input name="employee" defaultValue={selectedPenalty.employee} className="border rounded-lg px-3 py-2" />
                <input name="type" defaultValue={selectedPenalty.type} className="border rounded-lg px-3 py-2" />
                <input name="amount" defaultValue={selectedPenalty.amount} className="border rounded-lg px-3 py-2" />
                <input name="date" defaultValue={selectedPenalty.date} className="border rounded-lg px-3 py-2" />
                <input name="decidedBy" defaultValue={selectedPenalty.decidedBy} className="border rounded-lg px-3 py-2" />
                <input name="status" defaultValue={selectedPenalty.status} className="border rounded-lg px-3 py-2" />
                <input name="orderNumber" defaultValue={selectedPenalty.orderNumber} className="border rounded-lg px-3 py-2" />
                <textarea name="reason" defaultValue={selectedPenalty.reason} className="border rounded-lg px-3 py-2 col-span-2" />
                <div className="col-span-2 flex justify-end gap-3 mt-2">
                  <button type="button" onClick={closePenalty} className="px-4 py-2 border rounded-lg">Цуцлах</button>
                  <button type="submit" className="px-4 py-2 bg-[#0C213A] text-white rounded-lg">Хадгалах</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
        </main>
      </div>
    </>
  );
}




