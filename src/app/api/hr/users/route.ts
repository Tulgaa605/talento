import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Бүртгэлтэй хэрэглэгчид (role=USER) -ийг гэрээтэй/гэрээгүй төлвөөр нь ялган авах
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractFilter = searchParams.get('contract'); // HAS | NONE | null
    const approvalFilter = searchParams.get('approval'); // EMPLOYER | ADMIN | APPROVED | null

    // Бүх USER хэрэглэгчид
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        image: true,
        position: true,
        department: true,
        createdAt: true,
        jobApplications: {
          select: { status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Гэрээтэй ажилчдын имэйлүүдийг тодорхойлох (ямар нэг гэрээтэй байх)
    const employeesWithAnyContract = await prisma.employee.findMany({
      where: {
        contracts: {
          some: {},
        },
      },
      select: { email: true },
    });

    const emailHasContractSet = new Set(
      employeesWithAnyContract.map((e) => e.email.toLowerCase())
    );

    let results = users.map((u) => {
      const employerApproved = u.jobApplications?.some((a) => a.status === 'EMPLOYER_APPROVED') || false;
      const adminApproved = u.jobApplications?.some((a) => a.status === 'ADMIN_APPROVED') || false;
      const approved = u.jobApplications?.some((a) => a.status === 'APPROVED') || false;
      return {
        id: u.id,
        name: u.name ?? '',
        email: u.email ?? '',
        phoneNumber: u.phoneNumber ?? '',
        image: u.image ?? '',
        position: u.position ?? '',
        department: u.department ?? '',
        hasContract: u.email ? emailHasContractSet.has(u.email.toLowerCase()) : false,
        employerApproved,
        adminApproved,
        approved,
      };
    });

    if (contractFilter === 'HAS') {
      results = results.filter((r) => r.hasContract);
    } else if (contractFilter === 'NONE') {
      results = results.filter((r) => !r.hasContract);
    }

    if (approvalFilter === 'EMPLOYER') {
      results = results.filter((r) => r.employerApproved);
    } else if (approvalFilter === 'ADMIN') {
      results = results.filter((r) => r.adminApproved);
    } else if (approvalFilter === 'APPROVED') {
      results = results.filter((r) => r.approved);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Хэрэглэгчдийн жагсаалт авахад алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Хэрэглэгчдийн жагсаалт авахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}


