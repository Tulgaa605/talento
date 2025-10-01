"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";

type EvaluatorType = "Manager" | "Peer" | "HR" | "Self" | "Employer" | string;
type EvaluationStatus = "Дууссан" | "Хүлээгдэж буй" | "Илгээгдсэн" | string;

interface Evaluation {
  id: number | string;
  employee: string;
  employeeId: string;
  evaluator: string;
  evaluatorType: EvaluatorType;
  score: number;
  period: string;
  status: EvaluationStatus;
  evaluationDate: string;
  comment: string;
  strengths: string;
  improvements: string;
  averageScore: number;
  evaluationType: string;
  employerName?: string;
  employerEmail?: string;
}

export default function JobseekerPerformancePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("2024");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSubmitToEmployerModal, setShowSubmitToEmployerModal] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);

  const openDetailModal = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedEvaluation(null);
  };

  const performanceStats = [
    { label: "Нийт үнэлгээ", value: "156", change: "+12%", color: "text-blue-600", icon: "📊" },
    { label: "Дундаж оноо", value: "4.2", change: "+0.3", color: "text-green-600", icon: "⭐" },
    { label: "Шилдэг ажилтнууд", value: "24", change: "+5", color: "text-purple-600", icon: "🏆" },
    { label: "Хөгжүүлэх шаардлагатай", value: "8", change: "-3", color: "text-orange-600", icon: "📈" }
  ];

  const topPerformers = [
    { name: "Батбаяр", position: "Менежер", score: 4.8, department: "Маркетинг", trend: "up" },
    { name: "Сайханбаяр", position: "Программист", score: 4.7, department: "IT", trend: "up" },
    { name: "Оюунчимэг", position: "HR мэргэжилтэн", score: 4.6, department: "HR", trend: "up" },
    { name: "Энхтуяа", position: "Нягтлан бодогч", score: 4.5, department: "Санхүү", trend: "stable" }
  ];

  const userEvaluations: Evaluation[] = [
    { 
      id: 1, 
      employee: session?.user?.name || "Таны нэр", 
      employeeId: (session?.user?.id as string) || "USER001",
      evaluator: "Д.Сайханбаяр", 
      evaluatorType: "Manager",
      score: 4.8, 
      period: "2024 Q1", 
      status: "Дууссан",
      evaluationDate: "2024-03-15",
      comment: "Ажлын бүтээмж маш сайн, багтай хамтран ажиллах чадвар өндөр",
      strengths: "Ажлын хурд, чанар, хариуцлага",
      improvements: "Илтгэх ур чадварыг сайжруулах",
      averageScore: 4.8,
      evaluationType: "Улирлын үнэлгээ"
    },
    { 
      id: 2, 
      employee: session?.user?.name || "Таны нэр", 
      employeeId: (session?.user?.id as string) || "USER001",
      evaluator: "Б.Оюунчимэг", 
      evaluatorType: "Peer",
      score: 4.7, 
      period: "2024 Q2", 
      status: "Дууссан",
      evaluationDate: "2024-06-20",
      comment: "Техникийн мэдлэг өндөр, шинэ технологийг хурдан сурдаг",
      strengths: "Техникийн мэдлэг, сурах чадвар",
      improvements: "Харилцааны ур чадвар",
      averageScore: 4.7,
      evaluationType: "Улирлын үнэлгээ"
    },
    { 
      id: 3, 
      employee: session?.user?.name || "Таны нэр", 
      employeeId: (session?.user?.id as string) || "USER001",
      evaluator: "Э.Энхтуяа", 
      evaluatorType: "HR",
      score: 4.6, 
      period: "2024 Q3", 
      status: "Хүлээгдэж буй",
      evaluationDate: "2024-09-25",
      comment: "HR үйл ажиллагаа сайн, ажилтнуудтай харилцаа сайхан",
      strengths: "Харилцааны ур чадвар, багийн ажиллагаа",
      improvements: "Ажлын хурд",
      averageScore: 4.6,
      evaluationType: "Улирлын үнэлгээ"
    }
  ];

  const [evaluations, setEvaluations] = useState<Evaluation[]>(userEvaluations);

  const openSubmitToEmployerModal = () => setShowSubmitToEmployerModal(true);
  const closeSubmitToEmployerModal = () => setShowSubmitToEmployerModal(false);

  const handleSubmitToEmployer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const employerEvaluation: Evaluation = {
      id: Date.now(),
      employee: session?.user?.name || "Таны нэр",
      employeeId: (session?.user?.id as string) || "USER001",
      evaluator: "Ажил олгогч",
      evaluatorType: "Employer",
      score: Number(fd.get('score') || 0),
      period: String(fd.get('period') || `${new Date().getFullYear()} Q1`),
      status: "Илгээгдсэн",
      evaluationDate: String(fd.get('evaluationDate') || new Date().toISOString().slice(0,10)),
      comment: String(fd.get('comment') || ""),
      strengths: String(fd.get('strengths') || ""),
      improvements: String(fd.get('improvements') || ""),
      averageScore: Number(fd.get('score') || 0),
      evaluationType: String(fd.get('evaluationType') || "Ажил олгогчд илгээсэн үнэлгээ"),
      employerName: String(fd.get('employerName') || ""),
      employerEmail: String(fd.get('employerEmail') || ""),
    };
    setEvaluations((prev) => [employerEvaluation, ...prev]);
    closeSubmitToEmployerModal();
    setActiveTab('evaluations');
    alert('Ажил олгогчд үнэлгээ амжилттай илгээгдлээ!');
  };

  const evaluationCriteria = [
    { 
      category: "Ажлын чанар", 
      weight: "30%", 
      description: "Ажлын бүтээмж, чанар",
      subCriteria: [
        "Ажлын бүтээмж",
        "Ажлын чанар",
        "Хугацаанд гүйцэтгэх",
        "Алдааны түвшин"
      ]
    },
    { 
      category: "Ажлын хурд ба цаг баримтлалт", 
      weight: "20%", 
      description: "Цаг баримтлалт, хурд",
      subCriteria: [
        "Цаг баримтлалт",
        "Ажлын хурд",
        "Хугацааны удирдлага",
        "Хуваарь дагах"
      ]
    },
    { 
      category: "Харилцаа, багийн ажиллагаа", 
      weight: "25%", 
      description: "Багтай хамтран ажиллах",
      subCriteria: [
        "Багтай хамтран ажиллах",
        "Харилцааны ур чадвар",
        "Сонсгол",
        "Илтгэх ур чадвар"
      ]
    },
    { 
      category: "Бүтээлч сэтгэлгээ", 
      weight: "15%", 
      description: "Шинэ санаа, шийдэл",
      subCriteria: [
        "Шинэ санаа",
        "Шийдэл олох",
        "Шинэчлэл",
        "Бүтээлч байдал"
      ]
    },
    { 
      category: "Хариуцлага ба сахилга бат", 
      weight: "10%", 
      description: "Ажлын хариуцлага",
      subCriteria: [
        "Ажлын хариуцлага",
        "Сахилга бат",
        "Дүрэм дагах",
        "Хариуцлагатай байдал"
      ]
    }
  ];

  return (
    <div className="w-full min-h-screen bg-white">
    <main className="max-w-7xl mt-10 mx-auto px-4 py-8 bg-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0C213A] mb-2">Миний гүйцэтгэлийн үнэлгээ</h1>
        <p className="text-gray-600">Таны ажлын гүйцэтгэлийн үнэлгээний мэдээлэл</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {performanceStats.map((stat, index) => (
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
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", name: "Хянах самбар" },
              { id: "evaluations", name: "Үнэлгээ" },
              { id: "criteria", name: "Шалгуур" },
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-[#0C213A]">Шилдэг ажилтнууд</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#0C213A] text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-[#0C213A]">{performer.name}</h4>
                        <p className="text-sm text-gray-600">{performer.position} • {performer.department}</p>
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

          {/* Recent Evaluations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#0C213A]">Сүүлийн үнэлгээ</h3>
              <Link href="#" className="text-sm text-[#0C213A] hover:text-[#0C213A]/80">Бүгдийг харах</Link>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {evaluations.slice(0, 3).map((evaluation) => (
                  <div key={evaluation.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-[#0C213A]">{evaluation.employee}</h4>
                      <p className="text-sm text-gray-600">Үнэлэгч: {evaluation.evaluator}</p>
                      <p className="text-xs text-gray-500">{evaluation.period}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-[#0C213A]">{evaluation.score}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          evaluation.status === "Дууссан" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
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
            <div className="flex space-x-3 text-gray-700">
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C213A]"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
              <button onClick={openSubmitToEmployerModal} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Ажил олгогчд илгээх
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ажилтан</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Үнэлэгч</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Оноо</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Хугацаа</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Төлөв</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {evaluations.map((evaluation) => (
                  <tr key={evaluation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0C213A]">{evaluation.employee}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{evaluation.evaluator}</td>
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
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        evaluation.status === "Дууссан" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {evaluation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => openDetailModal(evaluation)} className="text-[#0C213A] hover:text-[#0C213A]/80">Үзэх</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "criteria" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                      <div className="grid grid-cols-2 gap-2">
                        {criteria.subCriteria.map((sub, subIndex) => (
                          <div key={subIndex} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                            • {sub}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#0C213A] h-2 rounded-full" 
                        style={{ width: criteria.weight }}
                      ></div>
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
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                <div className="flex justify_between items-center p-4 bg-gray-50 rounded-lg">
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-gray-600">Excel файл татах</span>
                </button>
                <button className="w-full flex items_center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0C213A] hover:bg-[#0C213A]/5 transition-colors">
                  <svg className="w-6 h-6 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <span className="text-gray-600">PDF тайлан татах</span>
                </button>
              </div>
            </div>
          </div>
      </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedEvaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-[#0C213A]">Үнэлгээний дэлгэрэнгүй</h3>
              <button onClick={closeDetailModal} className="p-2 rounded-md hover:bg-gray-100">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedEvaluation.status === "Дууссан" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
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

      {/* Submit to Employer Modal */}
      {showSubmitToEmployerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-[#0C213A]">Ажил олгогчд үнэлгээ илгээх</h3>
              <button onClick={closeSubmitToEmployerModal} className="p-2 rounded-md hover:bg-gray-100">✕</button>
            </div>
            <form onSubmit={handleSubmitToEmployer} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ажил олгогчийн нэр</label>
                  <input name="employerName" type="text" className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" placeholder="Ажил олгогчийн нэр" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Имэйл хаяг</label>
                  <input name="employerEmail" type="email" className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" placeholder="employer@company.com" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Хугацаа</label>
                  <input name="period" defaultValue={`${new Date().getFullYear()} Q1`} className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Огноо</label>
                  <input name="evaluationDate" type="date" defaultValue={new Date().toISOString().slice(0,10)} className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Үнэлгээний төрөл</label>
                  <select name="evaluationType" defaultValue="Ажил олгогчд илгээсэн үнэлгээ" className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" required>
                    <option>Ажил олгогчд илгээсэн үнэлгээ</option>
                    <option>Ажлын байрны үнэлгээ</option>
                    <option>Компанийн үнэлгээ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Оноо (1-5)</label>
                  <input name="score" type="number" min={1} max={5} step={0.1} defaultValue={4} className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Коммент</label>
                <textarea name="comment" rows={3} className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" placeholder="Ажил олгогчийн талаарх сэтгэгдэл..." required></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Давуу талууд</label>
                  <textarea name="strengths" rows={2} className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" placeholder="Ажил олгогчийн давуу талууд..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Сайжруулах талууд</label>
                  <textarea name="improvements" rows={2} className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm" placeholder="Сайжруулах талууд..."></textarea>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={closeSubmitToEmployerModal} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Цуцлах
                </button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Илгээх
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
    </div>
  );
}
