import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const evaluations = await prisma.performanceEvaluation.findMany({
      where: {
        employeeRefId: session.user.id
      }
    });

    const totalEvaluations = evaluations.length;
    const averageScore = evaluations.length > 0 
      ? evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / evaluations.length 
      : 0;
    const highestScore = evaluations.length > 0 
      ? Math.max(...evaluations.map(evaluation => evaluation.score)) 
      : 0;
    const lowestScore = evaluations.length > 0 
      ? Math.min(...evaluations.map(evaluation => evaluation.score)) 
      : 0;

    const topPerformers = await prisma.performanceEvaluation.findMany({
      where: {
        status: "APPROVED"
      },
      orderBy: {
        score: "desc"
      },
      take: 4,
      distinct: ['employeeRefId']
    });

    const formattedTopPerformers = topPerformers.map((performer) => ({
      name: performer.employee,
      position: "Ажилтан",
      score: performer.score,
      department: "Тодорхойгүй",
      trend: "up"
    }));

    const stats = {
      totalEvaluations,
      averageScore: Math.round(averageScore * 10) / 10,
      highestScore,
      lowestScore,
      topPerformers: formattedTopPerformers,
      performanceStats: [
        { 
          label: "Нийт үнэлгээ", 
          value: totalEvaluations.toString(), 
          change: "+12%", 
          color: "text-blue-600", 
          icon: "📊" 
        },
        { 
          label: "Дундаж оноо", 
          value: averageScore.toFixed(1), 
          change: "+0.3", 
          color: "text-green-600", 
          icon: "⭐" 
        },
        { 
          label: "Шилдэг ажилтнууд", 
          value: topPerformers.length.toString(), 
          change: "+5", 
          color: "text-purple-600", 
          icon: "🏆" 
        },
        { 
          label: "Хөгжүүлэх шаардлагатай", 
          value: evaluations.filter(e => e.score < 3).length.toString(), 
          change: "-3", 
          color: "text-orange-600", 
          icon: "📈" 
        }
      ]
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching performance stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

