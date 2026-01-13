import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DecisionStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all statistics
    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      totalDepartments,
      totalPositions,
      activeContracts,
      expiredContracts,
      terminatedContracts,
      pendingDecisions,
      approvedDecisions,
      rejectedDecisions,
      employeesByDepartment,
      employeesByPosition,
      recentHires,
      recentTerminations,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: 'ACTIVE' } }),
      prisma.employee.count({ where: { status: 'INACTIVE' } }),
      prisma.department.count(),
      prisma.position.count(),
      prisma.employmentContract.count({ where: { status: 'ACTIVE' } }),
      prisma.employmentContract.count({ where: { status: 'EXPIRED' } }),
      prisma.employmentContract.count({ where: { status: 'TERMINATED' } }),
      prisma.decision.count({ where: { status: DecisionStatus.DRAFT } }),
      prisma.decision.count({ where: { status: DecisionStatus.ACTIVE } }),
      prisma.decision.count({ where: { status: DecisionStatus.REVOKED } }),
      prisma.employee.groupBy({
        by: ['departmentId'],
        _count: true,
        where: { status: 'ACTIVE' },
      }),
      prisma.employee.groupBy({
        by: ['positionId'],
        _count: true,
        where: { status: 'ACTIVE' },
      }),
      prisma.employee.findMany({
        where: {
          hireDate: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 3)),
          },
        },
        take: 10,
        orderBy: { hireDate: 'desc' },
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          employeeId: true,
          hireDate: true,
          department: { select: { name: true } },
          position: { select: { title: true } },
        },
      }),
      prisma.employee.findMany({
        where: {
          terminationDate: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 3)),
          },
        },
        take: 10,
        orderBy: { terminationDate: 'desc' },
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          employeeId: true,
          terminationDate: true,
          department: { select: { name: true } },
          position: { select: { title: true } },
        },
      }),
    ]);

    // Get department and position names
    const departmentIds = employeesByDepartment.map((d) => d.departmentId);
    const positionIds = employeesByPosition.map((p) => p.positionId);

    const departments = await prisma.department.findMany({
      where: { id: { in: departmentIds } },
      select: { id: true, name: true },
    });

    const positions = await prisma.position.findMany({
      where: { id: { in: positionIds } },
      select: { id: true, title: true },
    });

    const employeesByDepartmentData = employeesByDepartment.map((item) => {
      const dept = departments.find((d) => d.id === item.departmentId);
      return {
        departmentName: dept?.name || 'Тодорхойгүй',
        count: item._count,
      };
    });

    const employeesByPositionData = employeesByPosition.map((item) => {
      const pos = positions.find((p) => p.id === item.positionId);
      return {
        positionTitle: pos?.title || 'Тодорхойгүй',
        count: item._count,
      };
    });

    const stats = {
      overview: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        totalDepartments,
        totalPositions,
      },
      contracts: {
        active: activeContracts,
        expired: expiredContracts,
        terminated: terminatedContracts,
        total: activeContracts + expiredContracts + terminatedContracts,
      },
      decisions: {
        draft: pendingDecisions,
        active: approvedDecisions,
        revoked: rejectedDecisions,
        total: pendingDecisions + approvedDecisions + rejectedDecisions,
      },
      employeesByDepartment: employeesByDepartmentData,
      employeesByPosition: employeesByPositionData,
      recentHires: recentHires.map((emp) => ({
        id: emp.id,
        name: `${emp.firstName} ${emp.middleName || emp.lastName || ''}`,
        employeeId: emp.employeeId,
        hireDate: emp.hireDate.toISOString().split('T')[0],
        department: emp.department.name,
        position: emp.position.title,
      })),
      recentTerminations: recentTerminations.map((emp) => ({
        id: emp.id,
        name: `${emp.firstName} ${emp.middleName || emp.lastName || ''}`,
        employeeId: emp.employeeId,
        terminationDate: emp.terminationDate?.toISOString().split('T')[0] || '',
        department: emp.department.name,
        position: emp.position.title,
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

