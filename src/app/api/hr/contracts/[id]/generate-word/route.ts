import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { readFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { generateContractWordAdvanced } from '@/utils/generateContractWord';

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
    if (!workSchedule) {
      switch (contract.contractType) {
        case 'FULL_TIME':
          workSchedule = 'Бүтэн цагийн (08:00-17:00)';
          break;
        case 'PART_TIME':
          workSchedule = 'Хагас цагийн';
          break;
        default:
          workSchedule = 'Бүтэн цагийн (08:00-17:00)';
      }
    }

    const contractData = {
      contractNumber: contract.contractNumber,
      employeeName: contract.employee.firstName || '',
      employeeLastName: contract.employee.lastName || '',
      employeeId: contract.employee.employeeId || '',
      registrationNumber: contract.employee.employeeId || '',
      position: contract.employee.position?.title || '',
      department: contract.employee.department?.name || contract.employee.position?.department?.name || '',
      salary: contract.salary,
      salaryText: numberToMongolianWords(Math.floor(contract.salary)),
      startDate: contract.startDate.toISOString().split('T')[0],
      endDate: contract.endDate ? contract.endDate.toISOString().split('T')[0] : null,
      contractType: contract.contractType,
      workSchedule: workSchedule,
      contractDuration: contractDuration,
      companyName: 'Эрдэнэс-Тавантолгой ХК',
      directorName: 'Гүйцэтгэх захирал',
      city: 'Улаанбаатар хот',
    };

    const outputDir = join(process.cwd(), 'public', 'uploads', 'contracts');
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }

    const templatePath = join(process.cwd(), 'public', 'templates', 'contracts', 'template.docx');
    
    if (!existsSync(templatePath)) {
      throw new Error(`Template файл олдсонгүй: ${templatePath}`);
    }

    const outputFileName = `contract_${contract.contractNumber}_${Date.now()}.docx`;
    const outputPath = join(outputDir, outputFileName);

    try {
      // Generate Word document using Node.js utility
      console.log('Starting Word generation...');
      console.log('Template path:', templatePath);
      console.log('Output path:', outputPath);
      console.log('Contract data:', JSON.stringify(contractData, null, 2));
      
      generateContractWordAdvanced(contractData, templatePath, outputPath);
      
      console.log('Word generation completed');

      if (!existsSync(outputPath)) {
        console.error('Output file does not exist after generation');
        throw new Error('Word файл үүсээгүй байна');
      }
      
      console.log('Output file exists, size:', (await readFile(outputPath)).length);

      const fileBuffer = await readFile(outputPath);

      // Cleanup file after 60 seconds
      setTimeout(async () => {
        try {
          await unlink(outputPath);
        } catch {
          // Ignore cleanup errors
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
      const error = generateError as { message?: string };
      console.error('Word document generation error:', generateError);
      throw new Error(`Word файл үүсгэхэд алдаа гарлаа: ${error.message || 'Unknown error'}`);
    }
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Word гэрээ үүсгэхэд алдаа гарлаа:', error);
    return NextResponse.json(
      { error: err.message || 'Word гэрээ үүсгэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}