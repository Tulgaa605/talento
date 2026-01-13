"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { StatsSkeleton, PageHeaderSkeleton, CardSkeleton } from "@/components/Skeletons";

type EvalStatus = "Дууссан" | "Хүлээгдэж буй" | "Эхлээгүй" | string;
type EvalType =
  | "Улирлын үнэлгээ"
  | "Жилийн үнэлгээ"
  | "Сарын үнэлгээ"
  | "Түр үнэлгээ"
  | string;
type EvaluatorType = "Manager" | "Peer" | "HR" | "Self" | string;

export interface Evaluation {
  id: number | string;
  employee: string;
  employeeId: string;
  evaluator: string;
  evaluatorType: EvaluatorType;
  score: number;
  period: string;
  status: EvalStatus;
  evaluationDate: string;
  comment: string;
  strengths: string;
  improvements: string;
  evaluationType: EvalType;
  averageScore?: number;
  position?: string;
  department?: string;
  trend?: "up" | "down" | "flat";
}

type TopPerformer = {
  name: string;
  position: string;
  department: string;
  score: number;
  trend: "up" | "down" | "flat";
};

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "evaluations" | "criteria" | "reports">("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("2024");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const openDetailModal = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedEvaluation(null);
  };

  const openEditModal = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedEvaluation(null);
  };

  const openAddModal = () => setShowAddModal(true);
  const closeAddModal = () => setShowAddModal(false);

  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  const handleEditEvaluation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEvaluation) return;

    const formData = new FormData(e.currentTarget);
    const score = parseFloat(String(formData.get("score") ?? "0"));

    const updatedEvaluation: Evaluation = {
      ...selectedEvaluation,
      employee: String(formData.get("employee") ?? ""),
      employeeId: String(formData.get("employeeId") ?? ""),
      evaluator: String(formData.get("evaluator") ?? ""),
      evaluatorType: String(formData.get("evaluatorType") ?? "") as EvaluatorType,
      score,
      period: String(formData.get("period") ?? ""),
      status: String(formData.get("status") ?? "") as EvalStatus,
      evaluationDate: String(formData.get("evaluationDate") ?? ""),
      comment: String(formData.get("comment") ?? ""),
      strengths: String(formData.get("strengths") ?? ""),
      improvements: String(formData.get("improvements") ?? ""),
      evaluationType: String(formData.get("evaluationType") ?? "") as EvalType,
      averageScore: score,
    };

    setEvaluations((prev) =>
      prev.map((evaluation) =>
        evaluation.id === selectedEvaluation.id ? updatedEvaluation : evaluation
      )
    );
    closeEditModal();
  };

  const handleAddEvaluation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const score = parseFloat(String(formData.get("score") ?? "0"));

    const newEvaluation: Evaluation = {
      id: evaluations.length + 1,
      employee: String(formData.get("employee") ?? ""),
      employeeId: String(formData.get("employeeId") ?? ""),
      evaluator: String(formData.get("evaluator") ?? ""),
      evaluatorType: String(formData.get("evaluatorType") ?? "") as EvaluatorType,
      score,
      period: String(formData.get("period") ?? ""),
      status: String(formData.get("status") ?? "") as EvalStatus,
      evaluationDate: String(formData.get("evaluationDate") ?? ""),
      comment: String(formData.get("comment") ?? ""),
      strengths: String(formData.get("strengths") ?? ""),
      improvements: String(formData.get("improvements") ?? ""),
      evaluationType: String(formData.get("evaluationType") ?? "") as EvalType,
      averageScore: score,
    };

    setEvaluations((prev) => [...prev, newEvaluation]);
    try {
      void fetch("/api/hr/performance/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvaluation),
      });
    } catch {
    }
    closeAddModal();
  };
  // const totalEvaluations = evaluations.length;
  // const averageScore =
  //   totalEvaluations > 0
  //     ? evaluations.reduce((s, e) => s + (e.score ?? 0), 0) / totalEvaluations
  //     : 0;

  // const needsImprovement = evaluations.filter((e) => (e.score ?? 0) < 3).length;

  const derivedTopPerformers: TopPerformer[] = [...evaluations]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 4)
    .map((e) => ({
      name: e.employee,
      position: e.position ?? "",
      department: e.department ?? "",
      score: e.score ?? 0,
      trend: e.trend ?? "up",
    }));

  // const performanceStats = [
  //   { label: "Нийт үнэлгээ", value: String(totalEvaluations), change: "", color: "text-blue-600", icon: "📊" },
  //   { label: "Дундаж оноо", value: averageScore.toFixed(1), change: "", color: "text-green-600", icon: "⭐" },
  //   { label: "Шилдэг ажилтнууд", value: String(Math.min(derivedTopPerformers.length, 24)), change: "", color: "text-purple-600", icon: "🏆" },
  //   { label: "Хөгжүүлэх шаардлагатай", value: String(needsImprovement), change: "", color: "text-orange-600", icon: "📈" },
  // ] as const;

  const evaluationCriteria = [
    {
      category: "Ажлын чанар",
      weight: "30%",
      description: "Ажлын бүтээмж, чанар",
      subCriteria: ["Ажлын бүтээмж", "Ажлын чанар", "Хугацаанд гүйцэтгэх", "Алдааны түвшин"],
    },
  ] as const;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/hr/performance/evaluations");
        if (!res.ok) return;
        const data: unknown = await res.json();
        if (Array.isArray(data)) {
          const typed = data as Evaluation[];
          setEvaluations(typed);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto mt-10 px-4 py-8">
          <PageHeaderSkeleton />
          <StatsSkeleton count={4} />
          <div className="mb-6">
            <div className="flex space-x-8 border-b border-gray-200">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 bg-gray-200 rounded w-28 mb-2 animate-pulse"></div>
              ))}
            </div>
          </div>
          <CardSkeleton count={6} />

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
            <div className="overflow-x-auto">
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto mt-10 px-4 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-[#0C213A] mb-2">Ажлын гүйцэтгэл үнэлгээ</h1>
            <p className="text-gray-600">Ажилтнуудын ажлын гүйцэтгэлийг үнэлж, хөгжүүлэх</p>
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
        </div>
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {performanceStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-[#0C213A]">{stat.value}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{stat.icon}</span>
                <div className={`text-sm font-medium ${stat.color}`}>{stat.change}</div>
              </div>
            </div>
          </div>
        ))}
      </div> */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", name: "Хянах самбар" },
              { id: "evaluations", name: "Үнэлгээ" },
              { id: "criteria", name: "Шалгуур" },
              { id: "reports", name: "Тайлан" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
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
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-[#0C213A]">Шилдэг ажилтнууд</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {derivedTopPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#0C213A] text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-[#0C213A]">{performer.name}</h4>
                        <p className="text-sm text-gray-600">
                          {performer.position || ""} {performer.department ? `• ${performer.department}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-[#0C213A]">{performer.score}</span>
                        <span className="text-green-600">
                          {performer.trend === "up" ? "📈" : performer.trend === "down" ? "📉" : "➡️"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">5-аас</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#0C213A]">Сүүлийн үнэлгээ</h3>
              <button 
                onClick={() => setActiveTab("evaluations")}
                className="text-sm text-[#0C213A] hover:text-[#0C213A]/80 cursor-pointer"
              >
                Бүгдийг харах
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {evaluations.slice(0, 4).map((evaluation) => (
                  <div key={evaluation.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-[#0C213A]">{evaluation.employee}</h4>
                      <p className="text-sm text-gray-600">Үнэлэгч: {evaluation.evaluator}</p>
                      <p className="text-xs text-gray-500">{evaluation.period}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-[#0C213A]">{evaluation.score}</span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            evaluation.status === "Дууссан"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {evaluation.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "evaluations" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[#0C213A]">Үнэлгээний жагсаалт</h3>
            <div className="flex space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C213A]"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
              <button
                onClick={openAddModal}
                className="bg-[#0C213A] text-white px-4 py-2 rounded-lg hover:bg-[#0C213A]/90 transition-colors"
              >
                Шинэ үнэлгээ нэмэх
              </button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ажилтан
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Үнэлэгч
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Оноо
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Хугацаа
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Төлөв
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Үйлдэл
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {evaluations.map((evaluation) => (
                  <tr key={evaluation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0C213A]">
                      {evaluation.employee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {evaluation.evaluator}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-[#0C213A] mr-2">{evaluation.score}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#0C213A] h-2 rounded-full"
                            style={{ width: `${(evaluation.score / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{evaluation.period}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          evaluation.status === "Дууссан"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {evaluation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openDetailModal(evaluation)}
                        className="text-[#0C213A] hover:text-[#0C213A]/80"
                      >
                        Үзэх
                      </button>
                      <button
                        onClick={() => openEditModal(evaluation)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Засах
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "criteria" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-[#0C213A]">Үнэлгээний шалгуур</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {evaluationCriteria.map((criteria, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-[#0C213A]">{criteria.category}</h4>
                      <span className="text-sm font-semibold text-[#0C213A]">{criteria.weight}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{criteria.description}</p>
                    <div className="mb-3">
                      <h5 className="text-xs font-medium text-gray-500 mb-2">Дэлгэрэнгүй шалгуур:</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {criteria.subCriteria.map((sub, subIndex) => (
                          <div key={subIndex} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                            • {sub}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#0C213A] h-2 rounded-full" style={{ width: criteria.weight }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-[#0C213A]">Үнэлгээний хэмжүүр</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm font-medium text-green-800">5 - Онцгой сайн</span>
                  <span className="text-xs text-green-600 font-medium">90-100%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-800">4 - Сайн</span>
                  <span className="text-xs text-blue-600 font-medium">80-89%</span>
                </div>
                <div className="flex justify_between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="text-sm font-medium text-yellow-800">3 - Дундаж</span>
                  <span className="text-xs text-yellow-600 font-medium">70-79%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="text-sm font-medium text-orange-800">2 - Муу</span>
                  <span className="text-xs text-orange-600 font-medium">60-69%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-sm font-medium text-red-800">1 - Маш муу</span>
                  <span className="text-xs text-red-600 font-medium">0-59%</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Үнэлгээний мэдээлэл:</h5>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Үнэлгээ хийлгэж буй ажилтан (EmployeeID)</li>
                  <li>• Үнэлэгч (Manager, Peer, HR, Self)</li>
                  <li>• Үнэлгээний хугацаа (улирал, жил, сар)</li>
                  <li>• Үнэлгээ хийсэн огноо</li>
                  <li>• Оноо (1-5 эсвэл 1-10 зэрэг хэмжүүрээр)</li>
                  <li>• Коммент (давуу тал, сайжруулах талууд)</li>
                  <li>• Дундаж оноо (нийт онооны дундаж)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-[#0C213A]">Гүйцэтгэлийн тайлан</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Дундаж үнэлгээ</span>
                  <span className="text-2xl font-bold text-[#0C213A]">4.2</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Хамгийн өндөр</span>
                  <span className="text-2xl font-bold text-green-600">4.8</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Хамгийн бага</span>
                  <span className="text-2xl font-bold text-red-600">3.1</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Нийт үнэлгээ</span>
                  <span className="text-2xl font-bold text-purple-600">156</span>
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
                <button className="w-full flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0C213A] hover:bg-[#0C213A]/5 transition-colors">
                  <svg className="w-6 h-6 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-gray-600">Excel файл татах</span>
                </button>
                <button className="w-full flex items_center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0C213A] hover:bg-[#0C213A]/5 transition-colors">
                  <svg className="w-6 h-6 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    />
                  </svg>
                  <span className="text-gray-600">PDF тайлан татах</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDetailModal && selectedEvaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-[#0C213A]">Үнэлгээний дэлгэрэнгүй</h3>
              <button onClick={closeDetailModal} className="p-2 rounded-md hover:bg-gray-100">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ажилтны нэр</label>
                  <p className="text-sm text-gray-900">{selectedEvaluation.employee}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ажилтны ID</label>
                  <p className="text-sm text-gray-900">{selectedEvaluation.employeeId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Үнэлэгч</label>
                  <p className="text-sm text-gray-900">{selectedEvaluation.evaluator}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Үнэлэгчийн төрөл</label>
                  <p className="text-sm text-gray-900">{selectedEvaluation.evaluatorType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Оноо</label>
                  <p className="text-sm text-gray-900">{selectedEvaluation.score}/5</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Хугацаа</label>
                  <p className="text-sm text-gray-900">{selectedEvaluation.period}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Төлөв</label>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedEvaluation.status === "Дууссан"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedEvaluation.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Үнэлгээний огноо</label>
                  <p className="text-sm text-gray-900">{selectedEvaluation.evaluationDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Үнэлгээний төрөл</label>
                  <p className="text-sm text-gray-900">{selectedEvaluation.evaluationType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дундаж оноо</label>
                  <p className="text-sm text-gray-900">{selectedEvaluation.averageScore}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Коммент</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedEvaluation.comment}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Давуу талууд</label>
                <p className="text-sm text-gray-900 bg-green-50 p-3 rounded-lg">{selectedEvaluation.strengths}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Сайжруулах талууд</label>
                <p className="text-sm text-gray-900 bg-yellow-50 p-3 rounded-lg">{selectedEvaluation.improvements}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button onClick={closeDetailModal} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && selectedEvaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-[#0C213A]">Үнэлгээ засах</h3>
              <button onClick={closeEditModal} className="p-2 rounded-md hover:bg-gray-100">
                ✕
              </button>
            </div>
            <form onSubmit={handleEditEvaluation} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ажилтны нэр</label>
                  <input
                    name="employee"
                    defaultValue={selectedEvaluation.employee}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ажилтны ID</label>
                  <input
                    name="employeeId"
                    defaultValue={selectedEvaluation.employeeId}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font_medium text-gray-700 mb-1">Үнэлэгч</label>
                  <input
                    name="evaluator"
                    defaultValue={selectedEvaluation.evaluator}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Үнэлэгчийн төрөл</label>
                  <select
                    name="evaluatorType"
                    defaultValue={selectedEvaluation.evaluatorType}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    required
                  >
                    <option value="Manager">Manager</option>
                    <option value="Peer">Peer</option>
                    <option value="HR">HR</option>
                    <option value="Self">Self</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Оноо</label>
                  <input
                    name="score"
                    type="number"
                    min={1}
                    max={5}
                    step={0.1}
                    defaultValue={selectedEvaluation.score.toString()}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Хугацаа</label>
                  <input
                    name="period"
                    defaultValue={selectedEvaluation.period}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Төлөв</label>
                  <select
                    name="status"
                    defaultValue={selectedEvaluation.status}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    required
                  >
                    <option value="Дууссан">Дууссан</option>
                    <option value="Хүлээгдэж буй">Хүлээгдэж буй</option>
                    <option value="Эхлээгүй">Эхлээгүй</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Үнэлгээний огноо</label>
                  <input
                    name="evaluationDate"
                    type="date"
                    defaultValue={selectedEvaluation.evaluationDate}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Үнэлгээний төрөл</label>
                  <select
                    name="evaluationType"
                    defaultValue={selectedEvaluation.evaluationType}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    required
                  >
                    <option value="Улирлын үнэлгээ">Улирлын үнэлгээ</option>
                    <option value="Жилийн үнэлгээ">Жилийн үнэлгээ</option>
                    <option value="Сарын үнэлгээ">Сарын үнэлгээ</option>
                    <option value="Түр үнэлгээ">Түр үнэлгээ</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Коммент</label>
                <textarea
                  name="comment"
                  defaultValue={selectedEvaluation.comment}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Давуу талууд</label>
                <textarea
                  name="strengths"
                  defaultValue={selectedEvaluation.strengths}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Сайжруулах талууд</label>
                <textarea
                  name="improvements"
                  defaultValue={selectedEvaluation.improvements}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Цуцлах
                </button>
                <button type="submit" className="px-4 py-2 bg-[#0C213A] text-white rounded-lg hover:bg-[#0C213A]/90 transition-colors">
                  Хадгалах
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-semibold text-[#0C213A]">Шинэ үнэлгээ нэмэх</h3>
              <button
                onClick={closeAddModal}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">
              <form onSubmit={handleAddEvaluation} className="space-y-4">
                <div className="grid grid-cols-1 text-gray-700 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Ажилтны нэр</label>
                    <input name="employee" className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Ажилтны ID</label>
                    <input name="employeeId" className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Үнэлэгч</label>
                    <input name="evaluator" className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Оноо</label>
                    <input
                      name="score"
                      type="number"
                      min={1}
                      max={5}
                      step={0.1}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Үнэлгээний огноо</label>
                    <input name="evaluationDate" type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Сайжруулах талууд</label>
                    <textarea name="improvements" rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 mt-4">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                  >
                    Цуцлах
                  </button>
                  <button type="submit" className="px-4 py-2 bg-[#0C213A] text-white rounded-lg hover:bg-[#0C213A]/90">
                    Нэмэх
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
    </>
  );
}
