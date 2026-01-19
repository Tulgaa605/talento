import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { readFile, unlink, mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { generateContractWordAdvanced } from '@/utils/generateContractWord';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

type Params = { id: string };

function numberToMongolianWords(num: number): string {
  const ones = ['', 'нэг', 'хоёр', 'гурав', 'дөрөв', 'тав', 'зургаа', 'долоо', 'найм', 'ес'];
  const tens = ['', 'арван', 'хорин', 'гучин', 'дөчин', 'тавь', 'жаран', 'далан', 'наян', 'ерэн'];
  
  if (num === 0) return 'тэг';
  if (num < 10) return ones[num];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return tens[ten] + (one > 0 ? ' ' + ones[one] : '');
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    return ones[hundred] + ' зуу' + (rest > 0 ? ' ' + numberToMongolianWords(rest) : '');
  }
  if (num < 1000000) {
    const thousand = Math.floor(num / 1000);
    const rest = num % 1000;
    return numberToMongolianWords(thousand) + ' мянган' + (rest > 0 ? ' ' + numberToMongolianWords(rest) : '');
  }
  if (num < 1000000000) {
    const million = Math.floor(num / 1000000);
    const rest = num % 1000000;
    return numberToMongolianWords(million) + ' сая' + (rest > 0 ? ' ' + numberToMongolianWords(rest) : '');
  }
  return num.toString();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;

    // Get current user's company information
    const session = await getServerSession(authOptions);
    let companyName = ''; // No default fallback
    
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { company: true },
      });
      
      console.log('User found:', user?.email);
      console.log('User company:', user?.company);
      console.log('User companyName field:', user?.companyName);
      
      if (user?.company?.name) {
        companyName = user.company.name;
        console.log('Using company.name:', companyName);
      } else if (user?.companyName) {
        companyName = user.companyName;
        console.log('Using user.companyName:', companyName);
      } else {
        console.warn('No company information found for user:', session.user.email);
      }
    } else {
      console.warn('No session found');
    }
    
    console.log('Final companyName:', companyName);

    const contract = await prisma.employmentContract.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            position: {
              include: {
                department: true,
              },
            },
            department: true,
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Гэрээ олдсонгүй' }, { status: 404 });
    }

    let contractDuration = 'Тодорхой хугацаагүй';
    if (contract.endDate) {
      const start = new Date(contract.startDate);
      const end = new Date(contract.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = Math.floor(diffMonths / 12);
      
      if (diffYears > 0) {
        contractDuration = `${diffYears} жил`;
      } else if (diffMonths > 0) {
        contractDuration = `${diffMonths} сар`;
      } else {
        contractDuration = `${diffDays} өдөр`;
      }
    }

    let workSchedule = contract.workSchedule || '';
    
    if (!workSchedule || workSchedule.trim() === '') {
      workSchedule = 'Даваа-Баасан 09:00-18:00';
    }
    
    console.log('Contract workSchedule from DB:', contract.workSchedule);
    console.log('Final workSchedule used:', workSchedule);

    const contractData = {
      contractNumber: contract.contractNumber,
      employeeName: contract.employee.firstName || '',
      employeeLastName: contract.employee.middleName || '',
      employeeId: contract.employee.employeeId || '',
      registrationNumber: contract.employee.employeeId || '',
      position: contract.employee.position?.title || '',
      department: contract.employee.department?.name || contract.employee.position?.department?.name || '',
      salary: contract.salary,
      salaryText: numberToMongolianWords(Math.floor(contract.salary)),
      startDate: contract.startDate.toISOString().split('T')[0],
      endDate: contract.endDate ? contract.endDate.toISOString().split('T')[0] : null,
      contractType: contract.contractType,
      workConditions: (contract as { workConditions?: string }).workConditions || 'NORMAL',
      workSchedule: workSchedule,
      contractDuration: contractDuration,
      companyName: companyName,
      directorName: 'Гүйцэтгэх захирал',
      city: 'Улаанбаатар хот',
      benefits: contract.benefits || contract.terms || undefined,
    };
    const outputDir = process.env.VERCEL ? '/tmp' : join(process.cwd(), 'public', 'uploads', 'contracts');
    
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }

    const templatePath = join(process.cwd(), 'public', 'templates', 'contracts', 'template.docx');
    
    console.log('Checking template path:', templatePath);
    console.log('Template exists:', existsSync(templatePath));
    
    if (!existsSync(templatePath)) {
      throw new Error(`Template файл олдсонгүй: ${templatePath}`);
    }

    const outputFileName = `contract_${contract.contractNumber}_${Date.now()}.docx`;
    const outputPath = join(outputDir, outputFileName);
    
    console.log('Output directory:', outputDir);
    console.log('Output path:', outputPath);

    try {
      console.log('Starting Word generation...');
      console.log('Environment:', process.env.VERCEL ? 'Vercel' : 'Local');
      console.log('Template path:', templatePath);
      console.log('Template exists:', existsSync(templatePath));
      console.log('Output path:', outputPath);
      
      try {
        generateContractWordAdvanced(contractData, templatePath, outputPath);
        console.log('Word generation completed successfully');
      } catch (genError) {
        console.error('Generation function error:', genError);
        throw genError;
      }

      if (!existsSync(outputPath)) {
        console.error('Output file does not exist after generation');
        console.error('Output directory contents:', await readdir(outputDir).catch(() => []));
        throw new Error('Word файл үүсээгүй байна');
      }
      
      const fileBuffer = await readFile(outputPath);
      console.log('Output file read successfully, size:', fileBuffer.length);

      setTimeout(async () => {
        try {
          await unlink(outputPath);
        } catch {
        }
      }, 60000);

      const safeFilename = `${contract.contractNumber}_Хөдөлмөрийн_гэрээ.docx`;
      const encodedFilename = encodeURIComponent(safeFilename);
      
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
        },
      });
    } catch (generateError: unknown) {
      const error = generateError as { message?: string; stack?: string };
      console.error('=== Word Generation Error ===');
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.error('Full error:', generateError);
      throw new Error(`Word файл үүсгэхэд алдаа гарлаа: ${error.message || 'Unknown error'}`);
    }
  } catch (error: unknown) {
    const err = error as { message?: string; stack?: string };
    console.error('=== API Route Error ===');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    console.error('Full error:', error);
    
    return NextResponse.json(
      { 
        error: err.message || 'Word гэрээ үүсгэхэд алдаа гарлаа',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      },
      { status: 500 }
    );
  }
}