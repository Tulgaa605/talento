import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Occupation {
  code: string;
  titleMn: string;
  majorGroup: string;
  subMajor: string;
  minorGroup: string;
  unitGroup: string;
  version: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    const occupationsPath = path.join(process.cwd(), 'occupations.json');
    const occupationsData = fs.readFileSync(occupationsPath, 'utf8');
    const occupations = JSON.parse(occupationsData) as Occupation[];

    let filteredOccupations = occupations;

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filteredOccupations = occupations.filter((occupation: Occupation) =>
        occupation.titleMn.toLowerCase().includes(searchLower) ||
        occupation.code.includes(search)
      );
    }

    const limitedResults = filteredOccupations.slice(0, limit);

    return NextResponse.json({
      occupations: limitedResults,
      total: filteredOccupations.length,
      hasMore: filteredOccupations.length > limit
    });
  } catch (error) {
    console.error('Ажил мэргэжлийн жагсаалт авахад алдаа гарлаа:', error);
    return NextResponse.json(
      { error: 'Ажил мэргэжлийн жагсаалт авахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}