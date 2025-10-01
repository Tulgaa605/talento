"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Training = {
  id: number;
  name: string;
  type: string;
  objective: string;
  content: string;
  startDate: string;
  endDate: string;
  location: string;
  instructor: string;
  participants: number;
  status: string;
  progress: number;
};

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  type Participant = {
    employeeId: string;
    name: string;
    position: string;
    training: string;
    duration: string;
    status: string;
    score: number;
    certificate: string;
    trainingId: number;
  };
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [showParticipant, setShowParticipant] = useState(false);
  const [employeeTrainings, setEmployeeTrainings] = useState<Training[]>([]);
  const [showAddParticipant, setShowAddParticipant] = useState(false);

  const openDetail = (training: Training) => {
    setSelectedTraining(training);
    setShowDetail(true);
  };
  const closeDetail = () => {
    setShowDetail(false);
    setSelectedTraining(null);
  };
  const openParticipant = (p: Participant) => {
    setSelectedParticipant(p);
    // find all trainings that this employee participated in based on participant records
    const relatedTrainingIds = participants
      .filter((pt) => pt.employeeId === p.employeeId)
      .map((pt) => pt.trainingId);
    setEmployeeTrainings(trainings.filter((t) => relatedTrainingIds.includes(t.id)));
    setShowParticipant(true);
  };
  const closeParticipant = () => {
    setShowParticipant(false);
    setSelectedParticipant(null);
  };

  const [trainings, setTrainings] = useState<Training[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/hr/training');
        const data = await res.json();
        setTrainings(data as Training[]);
      } catch {}
    };
    fetchData();
  }, []);

  const openAddTraining = () => setShowAddModal(true);
  const closeAddTraining = () => setShowAddModal(false);

  const handleCreateTraining = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newTraining: Training = {
      id: Date.now(),
      name: String(formData.get("name") || "Шинэ сургалт"),
      type: String(formData.get("type") || "Дотоод"),
      objective: String(formData.get("objective") || ""),
      content: String(formData.get("content") || ""),
      startDate: String(formData.get("startDate") || ""),
      endDate: String(formData.get("endDate") || ""),
      location: String(formData.get("location") || ""),
      instructor: String(formData.get("instructor") || ""),
      participants: Number(formData.get("participants") || 0),
      status: String(formData.get("status") || "Төлөвлөгдсөн"),
      progress: Number(formData.get("progress") || 0)
    };
    setTrainings((prev) => [newTraining, ...prev]);
    try {
      fetch('/api/hr/training', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTraining) });
    } catch {}
    setActiveTab("trainings");
    closeAddTraining();
  };

  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const res = await fetch('/api/hr/training/participants');
        const data = await res.json();
        setParticipants(data as Participant[]);
      } catch {}
    };
    fetchParticipants();
  }, []);

  // Derived dynamic stats (after trainings and participants are declared)
  const totalTrainings = trainings.length;
  const activeTrainings = trainings.filter((t) => t.status === "Идэвхтэй").length;
  const completedTrainings = trainings.filter((t) => t.status === "Дууссан").length;
  const totalParticipants = participants.length;

  const trainingStats = [
    { label: "Нийт сургалт", value: String(totalTrainings), change: "", color: "text-blue-600" },
    { label: "Идэвхтэй сургалт", value: String(activeTrainings), change: "", color: "text-green-600" },
    { label: "Дууссан сургалт", value: String(completedTrainings), change: "", color: "text-purple-600" },
    { label: "Оролцогч", value: String(totalParticipants), change: "", color: "text-orange-600" }
  ];

  const openAddParticipant = () => setShowAddParticipant(true);
  const closeAddParticipant = () => setShowAddParticipant(false);

  const handleCreateParticipant = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const trainingId = Number(fd.get("trainingId") || 0);
    const trainingRef = trainings.find((t) => t.id === trainingId);
    const newP: Participant = {
      employeeId: String(fd.get("employeeId") || ""),
      name: String(fd.get("name") || ""),
      position: String(fd.get("position") || ""),
      training: trainingRef?.name || String(fd.get("training") || ""),
      duration: String(fd.get("duration") || ""),
      status: String(fd.get("status") || "Идэвхтэй"),
      score: Number(fd.get("score") || 0),
      certificate: String(fd.get("certificate") || "Хүлээгдэж буй"),
      trainingId: trainingId || (trainingRef?.id ?? 0)
    };
    setParticipants((prev) => [newP, ...prev]);
    try {
      fetch('/api/hr/training/participants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newP) });
    } catch {}
    closeAddParticipant();
  };

  return (
    <main className="max-w-7xl mx-auto mt-10 px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0C213A] mb-2">Сургалт хөгжлийн бүртгэл</h1>
        <p className="text-gray-600">Ажилтнуудын сургалт, хөгжлийн үйл ажиллагааг удирдах</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {trainingStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-[#0C213A]">{stat.value}</p>
              </div>
              <div className={`text-sm font-medium ${stat.color}`}>
                {stat.change}
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
              { id: "trainings", name: "Сургалтууд" },
              { id: "participants", name: "Оролцогчид" },
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
          {/* Recent Trainings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-[#0C213A]">Сүүлийн сургалтууд</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {trainings.map((training: Training) => (
                  <div key={training.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-[#0C213A]">{training.name}</h4>
                      <p className="text-sm text-gray-600">{training.participants} оролцогч</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        training.status === "Идэвхтэй" ? "bg-green-100 text-green-800" :
                        training.status === "Дууссан" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {training.status}
                      </span>
                      {training.progress > 0 && (
                        <div className="mt-2 w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#0C213A] h-2 rounded-full" 
                            style={{ width: `${training.progress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-[#0C213A]">Хурдан үйлдэл</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <Link href="#" onClick={(e)=>{e.preventDefault(); openAddTraining();}} className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#0C213A]">Шинэ сургалт нэмэх</h4>
                    <p className="text-sm text-gray-600">Сургалтын мэдээлэл оруулах</p>
                  </div>
                </Link>
                <Link href="#" onClick={(e)=>{e.preventDefault(); openAddParticipant();}} className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#0C213A]">Оролцогч нэмэх</h4>
                    <p className="text-sm text-gray-600">Ажилтнуудыг сургалтад бүртгэх</p>
                  </div>
                </Link>
                <Link href="#" className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#0C213A]">Тайлан үзэх</h4>
                    <p className="text-sm text-gray-600">Сургалтын дэлгэрэнгүй тайлан</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "trainings" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[#0C213A]">Бүх сургалтууд</h3>
            <button onClick={openAddTraining} className="bg-[#0C213A] text-white px-4 py-2 rounded-lg hover:bg-[#0C213A]/90 transition-colors">
              Шинэ сургалт нэмэх
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainings.map((training) => (
                <div key={training.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-semibold text-[#0C213A]">{training.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      training.status === "Идэвхтэй" ? "bg-green-100 text-green-800" :
                      training.status === "Дууссан" ? "bg-blue-100 text-blue-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {training.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Төрөл:</span> {training.type}</p>
                    <p><span className="font-medium">Зорилго:</span> {training.objective}</p>
                    <p><span className="font-medium">Агуулга:</span> {training.content}</p>
                    <p><span className="font-medium">Огноо:</span> {training.startDate} - {training.endDate}</p>
                    <p><span className="font-medium">Байршил:</span> {training.location}</p>
                    <p><span className="font-medium">Багш:</span> {training.instructor}</p>
                    <p><span className="font-medium">Оролцогч:</span> {training.participants} хүн</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => openDetail(training)}
                      className="flex-1 bg-[#0C213A] text-white py-2 px-3 rounded text-sm hover:bg-[#0C213A]/90 transition-colors"
                    >
                      Дэлгэрэнгүй
                    </button>
                    <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors">
                      Засах
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "participants" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[#0C213A]">Оролцогчдын жагсаалт</h3>
            <button onClick={openAddParticipant} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Оролцогч нэмэх
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ажилтны ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Нэр</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Албан тушаал</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сургалт</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Оролцсон хугацаа</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Төлөв</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Үнэлгээ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {participants.map((participant, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0C213A]">{participant.employeeId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0C213A]">{participant.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{participant.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{participant.training}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{participant.duration}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        participant.status === "Дууссан" ? "bg-green-100 text-green-800" :
                        participant.status === "Идэвхтэй" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {participant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {participant.score > 0 ? `${participant.score}%` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => openParticipant(participant as unknown as Participant)} className="text-[#0C213A] hover:text-[#0C213A]/80">Үзэх</button>
                      <button className="text-gray-500 hover:text-gray-700">Засах</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showAddParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#0C213A]">Оролцогч нэмэх</h3>
              <button onClick={closeAddParticipant} className="p-2 rounded-md hover:bg-gray-100">✕</button>
            </div>
            <form onSubmit={handleCreateParticipant} className="p-6 grid grid-cols-2 text-gray-700 gap-4 text-sm">
              <input name="employeeId" placeholder="Ажилтны ID" className="border rounded-lg px-3 py-2" required />
              <input name="name" placeholder="Нэр" className="border rounded-lg px-3 py-2" required />
              <input name="position" placeholder="Албан тушаал" className="border rounded-lg px-3 py-2" />
              <select name="trainingId" className="border rounded-lg px-3 py-2">
                {trainings.map((t)=> (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <input name="duration" placeholder="Оролцсон хугацаа" className="border rounded-lg px-3 py-2" />
              <select name="status" className="border rounded-lg px-3 py-2">
                <option>Идэвхтэй</option>
                <option>Дууссан</option>
                <option>Төлөвлөгдсөн</option>
              </select>
              <input name="score" type="number" min="0" max="100" placeholder="Үнэлгээ (%)" className="border rounded-lg px-3 py-2" />
              <select name="certificate" className="border rounded-lg px-3 py-2">
                <option>Хүлээгдэж буй</option>
                <option>Тийм</option>
                <option>Үгүй</option>
              </select>
              <div className="col-span-2 flex justify-end gap-3 mt-2">
                <button type="button" onClick={closeAddParticipant} className="px-4 py-2 border rounded-lg">Цуцлах</button>
                <button type="submit" className="px-4 py-2 bg-[#0C213A] text-white rounded-lg">Хадгалах</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-[#0C213A]">Сургалтын тайлан</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Нийт сургалт</span>
                  <span className="text-2xl font-bold text-[#0C213A]">{trainings.length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Дууссан сургалт</span>
                  <span className="text-2xl font-bold text-green-600">{trainings.filter((t) => t.status === "Дууссан").length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Идэвхтэй сургалт</span>
                  <span className="text-2xl font-bold text-blue-600">{trainings.filter((t) => t.status === "Идэвхтэй").length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Нийт оролцогч</span>
                  <span className="text-2xl font-bold text-purple-600">{participants.length}</span>
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
                <button className="w-full flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0C213A] hover:bg-[#0C213A]/5 transition-colors">
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
      {showDetail && selectedTraining && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#0C213A]">{selectedTraining.name}</h3>
              <button
                onClick={closeDetail}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <p className="text-gray-500">Төрөл</p>
                  <p className="font-medium text-[#0C213A]">{selectedTraining.type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Багш</p>
                  <p className="font-medium text-[#0C213A]">{selectedTraining.instructor}</p>
                </div>
                <div>
                  <p className="text-gray-500">Огноо</p>
                  <p className="font-medium text-[#0C213A]">{selectedTraining.startDate} - {selectedTraining.endDate}</p>
                </div>
                <div>
                  <p className="text-gray-500">Байршил</p>
                  <p className="font-medium text-[#0C213A]">{selectedTraining.location}</p>
                </div>
                <div>
                  <p className="text-gray-500">Оролцогч</p>
                  <p className="font-medium text-[#0C213A]">{selectedTraining.participants} хүн</p>
                </div>
                <div>
                  <p className="text-gray-500">Төлөв</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    selectedTraining.status === "Идэвхтэй" ? "bg-green-100 text-green-800" :
                    selectedTraining.status === "Дууссан" ? "bg-blue-100 text-blue-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {selectedTraining.status}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-500">Зорилго</p>
                  <p className="font-medium text-[#0C213A]">{selectedTraining.objective}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-500">Агуулга</p>
                  <p className="font-medium text-[#0C213A]">{selectedTraining.content}</p>
                </div>
              </div>

              {selectedTraining.progress > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-gray-500 mb-2">Явц</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#0C213A] h-2 rounded-full"
                      style={{ width: `${selectedTraining.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={closeDetail} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Хаах</button>
              <button className="px-4 py-2 bg-[#0C213A] text-white rounded-lg hover:bg-[#0C213A]/90">Засварлах</button>
            </div>
          </div>
        </div>
      )}
      {/* Participant View Modal */}
      {showParticipant && selectedParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#0C213A]">Оролцогч - Дэлгэрэнгүй</h3>
              <button onClick={closeParticipant} className="p-2 rounded-md hover:bg-gray-100">✕</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4 text-sm">
              <p><span className="text-gray-500">Ажилтны ID:</span> <span className="font-medium text-[#0C213A]">{selectedParticipant.employeeId}</span></p>
              <p><span className="text-gray-500">Нэр:</span> <span className="font-medium text-[#0C213A]">{selectedParticipant.name}</span></p>
              <p><span className="text-gray-500">Албан тушаал:</span> <span className="font-medium text-[#0C213A]">{selectedParticipant.position}</span></p>
              <p><span className="text-gray-500">Сургалт:</span> <span className="font-medium text-[#0C213A]">{selectedParticipant.training}</span></p>
              <p><span className="text-gray-500">Оролцсон хугацаа:</span> <span className="font-medium text-[#0C213A]">{selectedParticipant.duration}</span></p>
              <p><span className="text-gray-500">Төлөв:</span> <span className="font-medium text-[#0C213A]">{selectedParticipant.status}</span></p>
              <p><span className="text-gray-500">Үнэлгээ:</span> <span className="font-medium text-[#0C213A]">{selectedParticipant.score > 0 ? `${selectedParticipant.score}%` : "-"}</span></p>
              <p><span className="text-gray-500">Сертификат:</span> <span className="font-medium text-[#0C213A]">{selectedParticipant.certificate}</span></p>
            </div>
            {employeeTrainings.length > 0 && (
              <div className="px-6 pb-6">
                <h4 className="text-sm font-semibold text-[#0C213A] mb-3">Тухайн ажилтны хамрагдсан сургалтууд</h4>
                <div className="space-y-3">
                  {employeeTrainings.map((t) => (
                    <div key={t.id} className="p-3 border border-gray-200 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#0C213A]">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.startDate} - {t.endDate} • {t.type}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        t.status === "Идэвхтэй" ? "bg-green-100 text-green-800" :
                        t.status === "Дууссан" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button onClick={closeParticipant} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Хаах</button>
            </div>
          </div>
        </div>
      )}
      {/* Add Training Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#0C213A]">Шинэ сургалт нэмэх</h3>
              <button
                onClick={closeAddTraining}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateTraining} className="p-6 space-y-4">
              <div className="grid grid-cols-1 text-gray-700 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Сургалтын нэр</label>
                  <input name="name" className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Төрөл</label>
                  <select name="type" className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option value="Дотоод">Дотоод</option>
                    <option value="Гадаад">Гадаад</option>
                    <option value="Онлайн">Онлайн</option>
                    <option value="Семинар">Семинар</option>
                    <option value="Воркшоп">Воркшоп</option>
                    <option value="Заавал">Заавал</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Эхлэх огноо</label>
                  <input name="startDate" type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Дуусах огноо</label>
                  <input name="endDate" type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Байршил</label>
                  <input name="location" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Багш</label>
                  <input name="instructor" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Оролцогчдын тоо</label>
                  <input name="participants" type="number" min="0" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Төлөв</label>
                  <select name="status" className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option value="Төлөвлөгдсөн">Төлөвлөгдсөн</option>
                    <option value="Идэвхтэй">Идэвхтэй</option>
                    <option value="Дууссан">Дууссан</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Зорилго</label>
                  <input name="objective" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Агуулга</label>
                  <textarea name="content" rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2"></textarea>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Явц (%)</label>
                  <input name="progress" type="number" min="0" max="100" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-3 border-t border-gray-200 mt-4">
                <button type="button" onClick={closeAddTraining} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Цуцлах</button>
                <button type="submit" className="px-4 py-2 bg-[#0C213A] text-white rounded-lg hover:bg-[#0C213A]/90">Хадгалах</button>
              </div>
            </form>
          </div>
      </div>
      )}
    </main>
  );
}




