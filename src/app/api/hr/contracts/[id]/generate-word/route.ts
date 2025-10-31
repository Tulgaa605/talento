import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { tmpdir } from 'os';

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

    // Production server дээр /tmp directory ашиглах (serverless environments)
    const isProduction = process.env.NODE_ENV === 'production';
    const useTempDir = isProduction || !existsSync(join(process.cwd(), 'public', 'uploads'));
    
    // Output directory үүсгэх
    let outputDir: string;
    if (useTempDir) {
      // Serverless/Lambda environment - /tmp ашиглах
      outputDir = join(tmpdir(), 'contracts');
    } else {
      outputDir = join(process.cwd(), 'public', 'uploads', 'contracts');
    }
    
    // Directory үүсгэх
    const { mkdir } = await import('fs/promises');
    try {
      await mkdir(outputDir, { recursive: true });
    } catch (mkdirError) {
      console.error('Failed to create output directory:', mkdirError);
      // /tmp directory үүсгэхгүй байхгүй, гэхдээ шалгах
      if (useTempDir && !existsSync(outputDir)) {
        return NextResponse.json(
          { error: `Output directory үүсгэх боломжгүй: ${outputDir}` },
          { status: 500 }
        );
      }
    }

    // Temporary JSON file үүсгэх (contract data дамжуулах)
    const tempJsonPath = useTempDir 
      ? join(tmpdir(), `temp_contract_${id}_${Date.now()}.json`)
      : join(process.cwd(), `temp_contract_${id}_${Date.now()}.json`);
    
    const pythonScriptPath = useTempDir
      ? join(tmpdir(), `generate_contract_word_api_${Date.now()}.py`)
      : join(process.cwd(), 'scripts', 'generate_contract_word_api.py');
    
    // Template file path шалгах
    const templatePath = join(process.cwd(), 'public', 'templates', 'contracts', 'template.docx');
    if (!existsSync(templatePath)) {
      // Build time дээр template-ийг copy хийх хэрэгтэй байж магадгүй
      // Alternative: template-ийг /tmp руу copy хийх (build time дээр embed хийх нь илүү сайн)
      console.error(`Template файл олдсонгүй: ${templatePath}`);
      return NextResponse.json(
        { error: `Template файл олдсонгүй. Production build дээр template файлыг шалгана уу.` },
        { status: 500 }
      );
    }
    
    // Template file-ийг /tmp руу copy хийх (production дээр)
    let actualTemplatePath = templatePath;
    if (useTempDir) {
      try {
        const templateBuffer = await readFile(templatePath);
        actualTemplatePath = join(tmpdir(), 'contract_template.docx');
        await writeFile(actualTemplatePath, templateBuffer);
      } catch (copyError) {
        console.error('Failed to copy template to /tmp:', copyError);
        return NextResponse.json(
          { error: 'Template файл copy хийхэд алдаа гарлаа' },
          { status: 500 }
        );
      }
    }

    // Python API script үүсгэх (бичсэн contract data унших)
    // Template path-ийг script дээр дамжуулах
    const escapedTemplatePath = actualTemplatePath.replace(/\\/g, '/').replace(/'/g, "\\'");
    const pythonApiScript = `
import sys
import json
import os
import re
from pathlib import Path
from datetime import datetime

# Template path (script-ээс дамжуулсан)
template_path = r'${escapedTemplatePath}'

try:
    from docx import Document
except ImportError:
    print("ERROR: python-docx module not installed", file=sys.stderr)
    sys.exit(1)

def format_date_mongolian(date_str):
    try:
        if isinstance(date_str, str):
            date = datetime.strptime(date_str, "%Y-%m-%d")
        else:
            date = date_str
        return f"{date.year} оны {date.month} дугаар сарын {date.day}-ны өдөр"
    except Exception as e:
        return str(date_str)

def generate_contract_word(contract_data, output_path):
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Template файл олдсонгүй: {template_path}")
    
    doc = Document(template_path)
    
    replacements = [
        ("2025 оны. . . . дугаар сарын ….-ны өдөр", format_date_mongolian(contract_data.get('startDate', datetime.now().strftime("%Y-%m-%d")))),
        ("№ .........", f"№ {contract_data.get('contractNumber', '')}"),
        ("Эрдэнэс-Тавантолгой ХК", contract_data.get('companyName', 'Эрдэнэс-Тавантолгой ХК')),
        (". . . . . . . . . . . . . . . овогтой. . . ............", f"{contract_data.get('employeeLastName', '')} овогтой {contract_data.get('employeeName', '')}"),
        (". . . . . . . . . . . . . . овогтой. . ............", f"{contract_data.get('employeeLastName', '')} овогтой {contract_data.get('employeeName', '')}"),
        ("Регистрийн дугаар: ................./", f"Регистрийн дугаар: {contract_data.get('registrationNumber', contract_data.get('employeeId', ''))}"),
        ("Регистрийн дугаар: .................", f"Регистрийн дугаар: {contract_data.get('registrationNumber', contract_data.get('employeeId', ''))}"),
        ("Албан тушаал: ...............", f"Албан тушаал: {contract_data.get('position', '')}"),
        ("Харьяалагдах нэгж: ..............", f"Харьяалагдах нэгж: {contract_data.get('department', '')}"),
        ("Үндсэн цалин: ................ /............................../-н төгрөг", f"Үндсэн цалин: {contract_data.get('salary', 0):,.0f} /{contract_data.get('salaryText', str(contract_data.get('salary', 0)))}/-н төгрөг"),
    ]
    
    def replace_in_text(text):
        result = text
        for old_text, new_text in replacements:
            if old_text in result:
                result = result.replace(old_text, new_text, 1)
        
        # Гүйцэтгэх захирал
        if 'Гүйцэтгэх захирал' in result and re.search(r'Гүйцэтгэх захирал\\s+\\.{3,}', result):
            director_name = contract_data.get('directorName', '')
            if director_name and director_name.strip():
                result = re.sub(r'Гүйцэтгэх захирал\\s+\\.{3,}', 
                               f"Гүйцэтгэх захирал {director_name}", 
                               result, count=1)
        
        # Ажлын цаг
        if 'Ажлын цаг:' in result and re.search(r'Ажлын цаг:\\s+\\.{3,}', result):
            result = re.sub(r'Ажлын цаг:\\s+\\.{3,}', 
                           f"Ажлын цаг: {contract_data.get('workSchedule', 'Бүтэн цагийн (08:00-17:00)')}", 
                           result, count=1)
        
        # Гэрээний хугацаа
        if 'Гэрээний хугацаа:' in result and re.search(r'Гэрээний хугацаа:\\s+\\.{3,}', result):
            result = re.sub(r'Гэрээний хугацаа:\\s+\\.{3,}', 
                           f"Гэрээний хугацаа: {contract_data.get('contractDuration', 'Тодорхой хугацаагүй')}", 
                           result, count=1)
        
        return result
    
    for para in doc.paragraphs:
        original_text = para.text
        new_text = replace_in_text(original_text)
        if original_text != new_text:
            para.text = new_text
    
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for para in cell.paragraphs:
                    original_text = para.text
                    new_text = replace_in_text(original_text)
                    if original_text != new_text:
                        para.text = new_text
    
    # Доод хэсэгт байгаа ажилтны овог нэр
    for para in doc.paragraphs:
        para_text = para.text.strip()
        if len(para_text) > 0 and len(para_text) < 50:
            if para_text.startswith('. . .') and not any(char.isalpha() or char.isdigit() for char in para_text if char not in '. '):
                employee_full_name = f"{contract_data.get('employeeLastName', '')} {contract_data.get('employeeName', '')}".strip()
                if employee_full_name:
                    para.text = employee_full_name
    
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    doc.save(output_path)
    return output_path

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
        if (useTempDir && actualTemplatePath !== templatePath) {
          await unlink(actualTemplatePath).catch(() => {}); // Ignore errors
        }
      } catch {
        // Ignore delete errors
      }

      // Үүссэн файлыг устгах (download дараа) - зөвхөн /tmp дээр байвал
      if (useTempDir) {
        setTimeout(async () => {
          try {
            await unlink(outputPath);
          } catch {
            // Ignore
          }
        }, 60000); // 1 минутын дараа устгах
      }

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
        await unlink(tempJsonPath).catch(() => {});
        await unlink(pythonScriptPath).catch(() => {});
        if (useTempDir && actualTemplatePath !== templatePath) {
          await unlink(actualTemplatePath).catch(() => {});
        }
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

