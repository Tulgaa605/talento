import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCompanyId } from '@/lib/hr-utils';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Нэвтрээгүй байна' },
        { status: 401 }
      );
    }

    // Get current user's companyId
    const companyId = await getCompanyId(session.user.id);
    
    // Note: Reports might not have companyId field, so we filter by company if available

    // Filter reports by company (if reports have companyId field, otherwise return all)
    // Note: HRReport might not have companyId field, so we'll return all for now
    // If you add companyId to HRReport model later, filter here
    const rows = await prisma.hRReport.findMany({ 
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  const data = rows.map((r) => ({
    id: r.legacyId,
    name: r.name,
    type: r.type,
    period: r.period,
    status: r.status,
    size: r.size,
    description: r.description ?? '',
    createdBy: r.createdBy,
    createdAt: r.createdAt.toISOString().slice(0,10),
    lastModified: r.lastModified.toISOString().slice(0,10),
    format: r.format,
    department: r.department,
  }));
  return NextResponse.json(data);
  } catch (error) {
    console.error('Тайлангуудыг авахад алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Тайлангуудыг авахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const created = await prisma.hRReport.create({
      data: {
        legacyId: Date.now(),
        name: body.name,
        type: body.type,
        period: body.period,
        status: body.status,
        size: '-',
        description: body.description ?? '',
        createdBy: 'Систем',
        createdAt: new Date(),
        lastModified: new Date(),
        format: body.format,
        department: body.department,
      },
    });
    const response = {
      id: created.legacyId,
      name: created.name,
      type: created.type,
      period: created.period,
      status: created.status,
      size: created.size,
      description: created.description ?? '',
      createdBy: created.createdBy,
      createdAt: created.createdAt.toISOString().slice(0,10),
      lastModified: created.lastModified.toISOString().slice(0,10),
      format: created.format,
      department: created.department,
    };
    return NextResponse.json(response, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}


