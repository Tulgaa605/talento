"use client";

import Link from "next/link";
import { useState } from "react";
import GovernmentEmployeeQuestionnaire from "@/components/GovernmentEmployeeQuestionnaire";

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  const recruitmentStats = [
    { label: "Нийт анкет", value: "156", change: "+23", color: "text-blue-600", icon: "📋" },
    { label: "Шинэ анкет", value: "24", change: "+8", color: "text-green-600", icon: "🆕" },
    { label: "Ярилцлага", value: "12", change: "+3", color: "text-purple-600", icon: "💬" },
    { label: "Амжилттай", value: "8", change: "+2", color: "text-orange-600", icon: "✅" }
  ];

  const recentApplications = [
    { id: 1, name: "Батбаяр", position: "Программист", department: "IT", status: "Ярилцлага", date: "2024-01-15", score: 85 },
    { id: 2, name: "Сайханбаяр", position: "Маркетинг мэргэжилтэн", department: "Маркетинг", status: "Шинэ", date: "2024-01-14", score: 92 },
    { id: 3, name: "Оюунчимэг", position: "HR мэргэжилтэн", department: "HR", status: "Амжилттай", date: "2024-01-12", score: 88 },
    { id: 4, name: "Энхтуяа", position: "Нягтлан бодогч", department: "Санхүү", status: "Хүлээгдэж буй", date: "2024-01-10", score: 76 }
  ];

  const recruitmentStages = [
    { 
      stage: "1. Анкет хүлээн авах, ангилах", 
      count: 156, 
      color: "bg-blue-500", 
      description: "Ирсэн анкетуудыг системд бүртгэнэ",
      subSteps: [
        "Ирсэн анкетуудыг системд бүртгэнэ",
        "Анкетыг ангилах:",
        "• Шаардлага хангасан",
        "• Хангаагүй", 
        "• Нөөцөнд бүртгэх"
      ]
    },
    { 
      stage: "2. Гол ярилцлагын шат", 
      count: 89, 
      color: "bg-purple-500", 
      description: "Хэлтсийн дарга, ХН-ийн мэргэжилтэн, удирдлагын баг оролцоно",
      subSteps: [
        "Хэлтсийн дарга, ХН-ийн мэргэжилтэн, удирдлагын баг оролцоно",
        "Асуултууд:",
        "• Ур чадвар, туршлагын талаар",
        "• Байгууллагын соёлд нийцэх эсэх",
        "• Сэтгэлгээ, харилцааны ур чадвар"
      ]
    },
    { 
      stage: "3. Шалгарсан нэр дэвшигчдийн баримт бичиг шалгах", 
      count: 45, 
      color: "bg-yellow-500", 
      description: "Диплом, сертификат, өмнөх ажлын тодорхойлолт",
      subSteps: [
        "Диплом, сертификат, өмнөх ажлын тодорхойлолт",
        "Хувийн үнэмлэх, лавлагаа (Reference) зэргийг шалгах"
      ]
    },
    { 
      stage: "5. Гэрээ байгуулах", 
      count: 23, 
      color: "bg-green-500", 
      description: "Хөдөлмөрийн гэрээ байгуулах",
      subSteps: [
        "Хөдөлмөрийн гэрээ байгуулах",
        "Нууцлалын гэрээ, дотоод журам, аюулгүй ажиллагааны бичиг баримт гарын үсэг зуруулах"
      ]
    }
  ];

  const jobPositions = [
    { id: 1, title: "Программист", department: "IT", applicants: 45, status: "Идэвхтэй", deadline: "2024-02-15" },
    { id: 2, title: "Маркетинг мэргэжилтэн", department: "Маркетинг", applicants: 32, status: "Идэвхтэй", deadline: "2024-02-20" },
    { id: 3, title: "HR мэргэжилтэн", department: "HR", applicants: 28, status: "Дууссан", deadline: "2024-01-30" },
    { id: 4, title: "Нягтлан бодогч", department: "Санхүү", applicants: 38, status: "Идэвхтэй", deadline: "2024-02-25" }
  ];

  return (
    <main className="max-w-7xl mt-10 mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0C213A] mb-2">Ажилд авах процесс</h1>
        <p className="text-gray-600">Ажлын байрны зарлал, анкет, ярилцлага, сонголтын процессыг удирдах</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {recruitmentStats.map((stat, index) => (
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
              { id: "applications", name: "Анкетууд" },
              { id: "questionnaire", name: "Төрийн албан хаагчийн анкет" },
              { id: "positions", name: "Ажлын байр" },
              { id: "process", name: "Процесс" }
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
          {/* Recent Applications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#0C213A]">Сүүлийн анкетууд</h3>
              <Link href="#" className="text-sm text-[#0C213A] hover:text-[#0C213A]/80">Бүгдийг харах</Link>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#0C213A] text-white rounded-full flex items-center justify-center font-bold">
                        {application.name[0]}
                      </div>
                      <div>
                        <h4 className="font-medium text-[#0C213A]">{application.name}</h4>
                        <p className="text-sm text-gray-600">{application.position} • {application.department}</p>
                        <p className="text-xs text-gray-500">{application.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-[#0C213A]">{application.score}%</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          application.status === "Амжилттай" ? "bg-green-100 text-green-800" :
                          application.status === "Ярилцлага" ? "bg-purple-100 text-purple-800" :
                          application.status === "Шинэ" ? "bg-blue-100 text-blue-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {application.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recruitment Pipeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-[#0C213A]">Ажилд авах урсгал</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {recruitmentStages.map((stage, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full ${stage.color} flex items-center justify-center text-white text-xs font-bold`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-[#0C213A]">{stage.stage}</h4>
                          <p className="text-sm text-gray-600">{stage.description}</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-[#0C213A]">{stage.count}</span>
                    </div>
                    <div className="ml-9">
                      <div className="space-y-1">
                        {stage.subSteps.map((subStep, subIndex) => (
                          <div key={subIndex} className="text-sm text-gray-600 flex items-start">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            <span>{subStep}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "applications" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[#0C213A]">Анкетуудын жагсаалт</h3>
            <div className="flex space-x-3">
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C213A]"
              >
                <option value="all">Бүгд</option>
                <option value="new">Шинэ</option>
                <option value="interview">Ярилцлага</option>
                <option value="successful">Амжилттай</option>
              </select>
              <button className="bg-[#0C213A] text-white px-4 py-2 rounded-lg hover:bg-[#0C213A]/90 transition-colors">
                Шинэ анкет нэмэх
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Нэр</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Албан тушаал</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Хэлтэс</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Оноо</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Төлөв</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Огноо</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0C213A]">{application.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{application.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{application.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-[#0C213A] mr-2">{application.score}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#0C213A] h-2 rounded-full" 
                            style={{ width: `${application.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        application.status === "Амжилттай" ? "bg-green-100 text-green-800" :
                        application.status === "Ярилцлага" ? "bg-purple-100 text-purple-800" :
                        application.status === "Шинэ" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {application.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{application.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button className="text-[#0C213A] hover:text-[#0C213A]/80">Үзэх</button>
                      <button className="text-gray-500 hover:text-gray-700">Засах</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "positions" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobPositions.map((position) => (
            <div key={position.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-semibold text-[#0C213A]">{position.title}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  position.status === "Идэвхтэй" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {position.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p><span className="font-medium">Хэлтэс:</span> {position.department}</p>
                <p><span className="font-medium">Анкет:</span> {position.applicants} хүн</p>
                <p><span className="font-medium">Дуусах хугацаа:</span> {position.deadline}</p>
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 bg-[#0C213A] text-white py-2 px-3 rounded text-sm hover:bg-[#0C213A]/90 transition-colors">
                  Анкет үзэх
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors">
                  Засах
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "process" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-[#0C213A]">Процессийн алхамууд</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {[
                  { step: 1, title: "Ажлын байр зарлах", description: "Ажлын байрны мэдээлэл оруулах", status: "Дууссан" },
                  { step: 2, title: "Анкет хүлээн авах", description: "Өргөдөл, CV хүлээн авах", status: "Дууссан" },
                  { step: 3, title: "Анхны шалгалт", description: "CV, баримт бичиг шалгах", status: "Дууссан" },
                  { step: 4, title: "Ярилцлага", description: "Ярилцлага зохион байгуулах", status: "Идэвхтэй" },
                  { step: 5, title: "Сонголт", description: "Амжилттай нэр дэвшигчдийг сонгох", status: "Хүлээгдэж буй" },
                  { step: 6, title: "Ажилд оруулах", description: "Сонгогдсон хүмүүсийг ажилд оруулах", status: "Хүлээгдэж буй" }
                ].map((process, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      process.status === "Дууссан" ? "bg-green-500" :
                      process.status === "Идэвхтэй" ? "bg-blue-500" :
                      "bg-gray-300"
                    }`}>
                      {process.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-[#0C213A]">{process.title}</h4>
                      <p className="text-sm text-gray-600">{process.description}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      process.status === "Дууссан" ? "bg-green-100 text-green-800" :
                      process.status === "Идэвхтэй" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {process.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-[#0C213A]">Статистик</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Нийт анкет</span>
                  <span className="text-2xl font-bold text-[#0C213A]">156</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Ярилцлага хийсэн</span>
                  <span className="text-2xl font-bold text-blue-600">45</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Амжилттай</span>
                  <span className="text-2xl font-bold text-green-600">8</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Амжилтын хувь</span>
                  <span className="text-2xl font-bold text-purple-600">5.1%</span>
                </div>
              </div>
            </div>
          </div>
      </div>
      )}

      {activeTab === "questionnaire" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-[#0C213A]">Төрийн албан хаагчийн анкет</h3>
            <p className="text-sm text-gray-600 mt-1">Төрийн албан хаагчийн анкет бөглөх</p>
          </div>
          <div className="p-6">
            {!showQuestionnaire ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-[#0C213A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📋</span>
                </div>
                <h4 className="text-lg font-medium text-[#0C213A] mb-2">Төрийн албан хаагчийн анкет</h4>
                <p className="text-gray-600 mb-6">Төрийн албан хаагчийн анкет бөглөх боломжтой</p>
                <button
                  onClick={() => setShowQuestionnaire(true)}
                  className="bg-[#0C213A] text-white px-6 py-3 rounded-lg hover:bg-[#0C213A]/90 transition-colors"
                >
                  Анкет бөглөх
                </button>
              </div>
            ) : (
              <GovernmentEmployeeQuestionnaire
                onSubmit={(data) => {
                  console.log('Questionnaire submitted:', data);
                  setShowQuestionnaire(false);
                  // Here you can handle the form submission
                  alert('Анкет амжилттай илгээгдлээ!');
                }}
                onCancel={() => setShowQuestionnaire(false)}
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
}




