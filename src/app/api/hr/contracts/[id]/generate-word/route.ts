import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { readFile } from 'fs/promises';
import { join } from 'path';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
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

// Огноог монгол хэлээр форматлах
function formatDateMongolian(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year} оны ${month} дугаар сарын ${day}-ны өдөр`;
  } catch {
    return dateStr;
  }
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

    // Template файлын зам
    const templatePath = join(process.cwd(), 'public', 'templates', 'contracts', 'template.docx');
    
    // Template файлыг унших
    const templateBuffer = await readFile(templatePath);
    
    // Docx файлыг бэлтгэх
    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Гэрээний өгөгдлүүдийг бэлтгэх
    const employeeFullName = `${contract.employee.lastName || ''} овогтой ${contract.employee.firstName || ''}`.trim();
    const registrationNumber = contract.employee.employeeId || '';
    const position = contract.employee.position?.title || '';
    const department = contract.employee.department?.name || contract.employee.position?.department?.name || '';
    const salary = contract.salary;
    const salaryText = numberToMongolianWords(Math.floor(salary));
    const formattedStartDate = formatDateMongolian(contract.startDate.toISOString().split('T')[0]);
    
    // Template-д орлуулах утгууд (Python script-тэй адил)
    const replacements: Record<string, string> = {
      '2025 оны. . . . дугаар сарын ….-ны өдөр': formattedStartDate,
      '№ .........': `№ ${contract.contractNumber}`,
      'Эрдэнэс-Тавантолгой ХК': 'Эрдэнэс-Тавантолгой ХК',
      '. . . . . . . . . . . . . . . овогтой. . . ............': employeeFullName,
      '. . . . . . . . . . . . . . овогтой. . ............': employeeFullName,
      'Регистрийн дугаар: ................./': `Регистрийн дугаар: ${registrationNumber}`,
      'Регистрийн дугаар: .................': `Регистрийн дугаар: ${registrationNumber}`,
      'Албан тушаал: ...............': `Албан тушаал: ${position}`,
      'Харьяалагдах нэгж: ..............': `Харьяалагдах нэгж: ${department}`,
      'Үндсэн цалин: ................ /............................../-н төгрөг': `Үндсэн цалин: ${salary.toLocaleString('mn-MN')} /${salaryText}/-н төгрөг`,
    };

    // Docx файлд текст орлуулах (docxtemplater ашиглах)
    // Note: Template файл дээр placeholder байхгүй бол text replacement хийх хэрэгтэй
    // Энэ тохиолдолд бид docxtemplater-ийн setData ашиглахгүй, харин PizZip-ийн XML-ийг шууд засах
    const docxData = doc.getZip();
    
    // Word document-ийн бүх XML файлуудыг авах
    const xmlFiles = docxData.files;
    const textFiles = Object.keys(xmlFiles).filter((name) => 
      name.startsWith('word/') && name.endsWith('.xml')
    );
    
    // Бүх XML файлуудад текст орлуулах
    for (const fileName of textFiles) {
      let xmlContent = xmlFiles[fileName].asText();
      for (const [oldText, newText] of Object.entries(replacements)) {
        // XML дотор текст орлуулах (энгийн replace)
        // Word documents store text in <w:t> tags, so we need to be careful
        // For now, do a simple global replace
        xmlContent = xmlContent.split(oldText).join(newText);
      }
      docxData.file(fileName, xmlContent);
    }

    try {
      // Word файл үүсгэх
      const buffer = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
      });

      // Response буцаах
      const safeFilename = `${contract.contractNumber}_Хөдөлмөрийн_гэрээ.docx`;
      const encodedFilename = encodeURIComponent(safeFilename);
      
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
        },
      });
    } catch (error: unknown) {
      const err = error as { message?: string; properties?: { errors?: unknown[] } };
      console.error('Word файл үүсгэхэд алдаа гарлаа:', error);
      
      let errorMessage = err.message || 'Word файл үүсгэхэд алдаа гарлаа';
      if (err.properties?.errors) {
        errorMessage += `: ${JSON.stringify(err.properties.errors)}`;
      }
      
      return NextResponse.json(
        { error: errorMessage, details: err },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const err = error as { message?: string; stdout?: string; stderr?: string };
    console.error('Word гэрээ үүсгэхэд алдаа гарлаа:', error);
    
    // Include detailed error information if available
    const errorDetails: { message: string; stdout?: string; stderr?: string } = { 
      message: err.message || 'Word гэрээ үүсгэхэд алдаа гарлаа' 
    };
    if (err.stdout) errorDetails.stdout = err.stdout;
    if (err.stderr) errorDetails.stderr = err.stderr;
    
    return NextResponse.json(
      { error: errorDetails.message, details: errorDetails },
      { status: 500 }
    );
  } finally {
    // Ensure Prisma client is disconnected
    await prisma.$disconnect().catch(() => {});
  }
}

