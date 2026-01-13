import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'excel';
    const type = searchParams.get('type') || 'all';
    const reportName = searchParams.get('reportName') || '';
    const period = searchParams.get('period') || '';

    let data: unknown[] = [];
    let filename = '';

    if (type === 'employees') {
      const employees = await prisma.employee.findMany({
        include: {
          department: { select: { name: true } },
          position: { select: { title: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      data = employees.map((emp) => ({
        'Ажилтны ID': emp.employeeId,
        'Овог': emp.lastName,
        'Нэр': emp.firstName,
        'Төрсөн огноо': emp.dateOfBirth.toISOString().split('T')[0],
        'Хүйс': emp.gender,
        'Имэйл': emp.email,
        'Утас': emp.phoneNumber,
        'Хэлтэс': emp.department.name,
        'Албан тушаал': emp.position.title,
        'Төлөв': emp.status,
        'Ажилд орсон огноо': emp.hireDate.toISOString().split('T')[0],
        'Ажлаас гарсан огноо': emp.terminationDate?.toISOString().split('T')[0] || '',
      }));

      filename = reportName && period 
        ? `${reportName}_${period}`
        : `Ажилтнууд_${new Date().toISOString().split('T')[0]}`;
    }

    if (type === 'departments') {
      const departments = await prisma.department.findMany({
        include: {
          employees: {
            where: { status: 'ACTIVE' },
            select: { id: true },
          },
        },
        orderBy: { name: 'asc' },
      });

      data = departments.map((dept) => ({
        'Код': dept.code,
        'Нэр': dept.name,
        'Ажилтны тоо': dept.employees.length,
        'Тайлбар': dept.description || '',
      }));
      filename = reportName && period 
        ? `${reportName}_${period}`
        : `Хэлтэс_${new Date().toISOString().split('T')[0]}`;
    }

    if (type === 'contracts') {
      const contracts = await prisma.employmentContract.findMany({
        include: {
          employee: {
            select: {
              firstName: true,
              middleName: true,
              lastName: true,
              employeeId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      data = contracts.map((contract) => ({
        'Гэрээний дугаар': contract.contractNumber,
        'Ажилтан': `${contract.employee.firstName} ${contract.employee.middleName || contract.employee.lastName || ''}`,
        'Ажилтны ID': contract.employee.employeeId,
        'Эхлэх огноо': contract.startDate.toISOString().split('T')[0],
        'Дуусах огноо': contract.endDate?.toISOString().split('T')[0] || '',
        'Төлөв': contract.status,
        'Цалин': contract.salary || '',
      }));
      filename = reportName && period 
        ? `${reportName}_${period}`
        : `Гэрээ_${new Date().toISOString().split('T')[0]}`;
    }

    if (type === 'all' && data.length === 0) {
      // If all and no data, create a summary report
      const [employees, departments, contracts, decisions] = await Promise.all([
        prisma.employee.count(),
        prisma.department.count(),
        prisma.employmentContract.count(),
        prisma.decision.count(),
      ]);

      data = [
        {
          'Нийт ажилтан': employees,
          'Нийт хэлтэс': departments,
          'Нийт гэрээ': contracts,
          'Нийт шийдвэр': decisions,
          'Огноо': new Date().toISOString().split('T')[0],
        },
      ];
      filename = reportName && period 
        ? `${reportName}_${period}`
        : reportName 
        ? `${reportName}_${new Date().toISOString().split('T')[0]}`
        : `Тайлан_${new Date().toISOString().split('T')[0]}`;
    }

    if (format === 'excel' || format === 'csv') {
      // Convert to CSV
      if (data.length === 0) {
        return NextResponse.json({ error: 'No data found' }, { status: 404 });
      }

      const headers = Object.keys(data[0] as Record<string, unknown>);
      const csvRows = [
        headers.join(','),
        ...data.map((row) =>
          headers
            .map((header) => {
              const value = (row as Record<string, unknown>)[header];
              return typeof value === 'string' && value.includes(',')
                ? `"${value.replace(/"/g, '""')}"`
                : value || '';
            })
            .join(',')
        ),
      ];

      const csv = csvRows.join('\n');
      const csvBuffer = Buffer.from('\ufeff' + csv, 'utf-8'); // BOM for Excel UTF-8

      return new NextResponse(csvBuffer, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename || 'report')}.csv`,
        },
      });
    } else if (format === 'json') {
      return NextResponse.json(data, {
        headers: {
          'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename || 'report')}.json`,
        },
      });
    } else {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

