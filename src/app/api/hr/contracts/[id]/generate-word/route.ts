import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

type Params = { id: string };

// Тооныг монгол үгээр хөрвүүлэх
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

    // Гэрээний мэдээллийг авах
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

    // Гэрээний хугацааг тооцоолох
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

    // Ажлын цагийг тодорхойлох
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

    // Contract data бэлтгэх
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

    // Output directory үүсгэх
    const outputDir = join(process.cwd(), 'public', 'uploads', 'contracts');
    if (!existsSync(outputDir)) {
      const { mkdir } = await import('fs/promises');
      await mkdir(outputDir, { recursive: true });
    }

    // Temporary JSON file үүсгэх (contract data дамжуулах)
    const tempJsonPath = join(process.cwd(), `temp_contract_${id}_${Date.now()}.json`);
    const pythonScriptPath = join(process.cwd(), 'scripts', 'generate_contract_word_api.py');
    
    // Template file path шалгах
    const templatePath = join(process.cwd(), 'public', 'templates', 'contracts', 'template.docx');
    if (!existsSync(templatePath)) {
      console.error(`Template файл олдсонгүй: ${templatePath}`);
      return NextResponse.json(
        { error: `Template файл олдсонгүй: ${templatePath}` },
        { status: 500 }
      );
    }
    
    // Python API script үүсгэх (бичсэн contract data унших)
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
      // Python command шалгах (python3 эсвэл python)
      let pythonCmd = 'python3';
      try {
        await execAsync('python3 --version', { timeout: 2000 });
      } catch {
        try {
          await execAsync('python --version', { timeout: 2000 });
          pythonCmd = 'python';
        } catch {
          return NextResponse.json(
            { error: 'Python суугаагүй байна. Server дээр Python суугааж байгаа эсэхийг шалгана уу.' },
            { status: 500 }
          );
        }
      }

      // Python script ажиллуулах
      let stdout = '';
      let stderr = '';
      
      try {
        const result = await execAsync(
          `${pythonCmd} "${pythonScriptPath}" "${tempJsonPath}" "${outputPath}"`,
          { maxBuffer: 10 * 1024 * 1024, encoding: 'utf-8', timeout: 30000 }
        );
        stdout = result.stdout || '';
        stderr = result.stderr || '';
      } catch (execError: unknown) {
        const error = execError as { stdout?: string; stderr?: string; message?: string; code?: string };
        stdout = error.stdout || '';
        stderr = error.stderr || '';
        
        // Python script execution алдаа - файл үүссэн эсэхийг шалгах
        if (existsSync(outputPath)) {
          // Файл үүссэн бол stderr-ийг үл тоомсорлож болно
          console.warn('Python script warning:', stderr);
        } else {
          // Файл үүсээгүй бол алдааны мэдээлэл буцаах
          const errorMsg = error.message || stderr || stdout || 'Unknown error';
          console.error('Python execution failed:', {
            command: `${pythonCmd} "${pythonScriptPath}" "${tempJsonPath}" "${outputPath}"`,
            error: errorMsg,
            code: error.code,
            stdout,
            stderr,
            templateExists: existsSync(templatePath),
            scriptExists: existsSync(pythonScriptPath),
            jsonExists: existsSync(tempJsonPath),
          });
          throw new Error(`Python script ажиллахгүй байна: ${errorMsg}`);
        }
      }

      // Check if output file exists
      if (!existsSync(outputPath)) {
        console.error('Python execution details:', {
          stdout,
          stderr,
          templatePath,
          scriptPath: pythonScriptPath,
          jsonPath: tempJsonPath,
          outputPath,
        });
        throw new Error(`Word файл үүсээгүй байна. Python stdout: ${stdout}, stderr: ${stderr}`);
      }

      const fileBuffer = await readFile(outputPath);

      // Temporary файлуудыг устгах
      try {
        await unlink(tempJsonPath);
        await unlink(pythonScriptPath);
      } catch {
        // Ignore delete errors
      }

      // Үүссэн файлыг устгах (download дараа)
      setTimeout(async () => {
        try {
          await unlink(outputPath);
        } catch {
          // Ignore
        }
      }, 60000); // 1 минутын дараа устгах

      // Response буцаах
      // Filename encoding for non-ASCII characters
      const safeFilename = `${contract.contractNumber}_Хөдөлмөрийн_гэрээ.docx`;
      const encodedFilename = encodeURIComponent(safeFilename);
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
        },
      });
    } catch (execError: unknown) {
      // Temporary файлуудыг устгах
      try {
        await unlink(tempJsonPath);
        await unlink(pythonScriptPath);
      } catch {
        // Ignore
      }
      
      const error = execError as { message?: string };
      console.error('Python script execution error:', execError);
      throw new Error(`Word файл үүсгэхэд алдаа гарлаа: ${error.message || 'Unknown error'}`);
    }
  } catch (error: unknown) {
    const err = error as { message?: string; stack?: string };
    console.error('Word гэрээ үүсгэхэд алдаа гарлаа:', {
      error: err.message,
      stack: err.stack,
      cwd: process.cwd(),
    });
    return NextResponse.json(
      { 
        error: err.message || 'Word гэрээ үүсгэхэд алдаа гарлаа',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      },
      { status: 500 }
    );
  }
}

