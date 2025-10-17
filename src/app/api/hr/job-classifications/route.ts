import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const items = await prisma.jobClassification.findMany();
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const data = await req.json();
  const created = await prisma.jobClassification.create({ data });
  return NextResponse.json(created, { status: 201 });
}
