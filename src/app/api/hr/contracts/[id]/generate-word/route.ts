import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, unlink, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const execAsync = promisify(exec);
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
      console.error('Contract not found with ID:', id);
      return NextResponse.json({ error: 'Гэрээ олдсонгүй' }, { status: 404 });
    }

    if (!contract.employee) {
      console.error('Employee not found for contract:', id);
      return NextResponse.json({ error: 'Ажилтан олдсонгүй. Гэрээ дутуу байна.' }, { status: 400 });
    }

    console.log('Generating contract for:', {
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      employeeId: contract.employee.id,
      employeeName: `${contract.employee.firstName} ${contract.employee.lastName}`,
    });

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

    // Check if template file exists
    const templatePath = join(process.cwd(), 'public', 'templates', 'contracts', 'template.docx');
    if (!existsSync(templatePath)) {
      return NextResponse.json(
        { error: `Template файл олдсонгүй: ${templatePath}. Template файлыг public/templates/contracts/ folder-т байршуулна уу.` },
        { status: 500 }
      );
    }

    const outputDir = join(process.cwd(), 'public', 'uploads', 'contracts');
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }

    const tempJsonPath = join(process.cwd(), `temp_contract_${id}_${Date.now()}.json`);
    const pythonScriptPath = join(process.cwd(), 'scripts', 'generate_contract_word_api.py');
    
    const pythonApiScript = `
import sys
import json
import os
from pathlib import Path

# Add project root to path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

from scripts.generate_contract_word import generate_contract_word

if __name__ == "__main__":
    json_path = sys.argv[1]
    output_path = sys.argv[2]
    
    with open(json_path, 'r', encoding='utf-8') as f:
        contract_data = json.load(f)
    
    result_path = generate_contract_word(contract_data, output_path)
    print(result_path)
`;

    await writeFile(pythonScriptPath, pythonApiScript, 'utf-8');
    await writeFile(tempJsonPath, JSON.stringify(contractData, null, 2), 'utf-8');

    const outputFileName = `contract_${contract.contractNumber}_${Date.now()}.docx`;
    const outputPath = join(outputDir, outputFileName);

    try {
      let stdout = '';
      let stderr = '';
      let pythonCmd = 'python';
      
      // Try python3 first, then python
      try {
        await execAsync('python3 --version');
        pythonCmd = 'python3';
      } catch {
        try {
          await execAsync('python --version');
          pythonCmd = 'python';
        } catch {
          throw new Error('Python суугаагүй байна. Python 3 суулгана уу.');
        }
      }
      
      console.log(`Using Python command: ${pythonCmd}`);
      console.log(`Script path: ${pythonScriptPath}`);
      console.log(`JSON path: ${tempJsonPath}`);
      console.log(`Output path: ${outputPath}`);
      
      try {
        const result = await execAsync(
          `"${pythonCmd}" "${pythonScriptPath}" "${tempJsonPath}" "${outputPath}"`,
          { maxBuffer: 10 * 1024 * 1024, encoding: 'utf-8' }
        );
        stdout = result.stdout || '';
        stderr = result.stderr || '';
      } catch (execError: unknown) {
        const error = execError as { stdout?: string; stderr?: string; message?: string };
        stdout = error.stdout || '';
        stderr = error.stderr || '';
        console.error('Python execution error:', error.message);
        console.error('Python stdout:', stdout);
        console.error('Python stderr:', stderr);
      }

      if (!existsSync(outputPath)) {
        console.error('Python stdout:', stdout);
        console.error('Python stderr:', stderr);
        throw new Error(`Word файл үүсээгүй байна. Алдаа: ${stderr || stdout || 'Template файл эсвэл python-docx суугаагүй байж болзошгүй'}`);
      }

      const fileBuffer = await readFile(outputPath);

      try {
        await unlink(tempJsonPath);
        await unlink(pythonScriptPath);
      } catch {
      }

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
    } catch (execError: unknown) {
      try {
        await unlink(tempJsonPath);
        await unlink(pythonScriptPath);
      } catch {
      }
      
      const error = execError as { message?: string };
      console.error('Python script execution error:', execError);
      throw new Error(`Word файл үүсгэхэд алдаа гарлаа: ${error.message || 'Unknown error'}`);
    }
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Word гэрээ үүсгэхэд алдаа гарлаа:', error);
    
    // Provide helpful error messages based on common issues
    let errorMessage = err.message || 'Word гэрээ үүсгэхэд алдаа гарлаа';
    
    if (errorMessage.includes('Python суугаагүй')) {
      errorMessage = 'Python суугаагүй байна. Server дээр Python 3 суулгаж, python-docx санг суулгана уу: pip install python-docx';
    } else if (errorMessage.includes('Template файл олдсонгүй')) {
      errorMessage = 'Template файл олдсонгүй. public/templates/contracts/template.docx файлыг шалгана уу.';
    } else if (errorMessage.includes('python-docx')) {
      errorMessage = 'python-docx сан суугаагүй байна. Server дээр суулгана уу: pip install python-docx';
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}