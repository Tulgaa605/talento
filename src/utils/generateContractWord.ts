
import PizZip from 'pizzip';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

interface ContractData {
  contractNumber?: string;
  employeeName?: string;
  employeeLastName?: string;
  employeeId?: string;
  registrationNumber?: string;
  position?: string;
  department?: string;
  salary?: number;
  salaryText?: string;
  startDate?: string;
  endDate?: string | null;
  contractType?: string;
  workSchedule?: string;
  contractDuration?: string;
  companyName?: string;
  directorName?: string;
  city?: string;
  benefits?: string;
}

/**
 * Огноог монгол хэлээр форматлах
 */
function formatDateMongolian(dateStr: string | Date): string {
  try {
    let date: Date;
    
    if (typeof dateStr === 'string') {
      date = new Date(dateStr);
    } else {
      date = dateStr;
    }
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year} оны ${month} дугаар сарын ${day}-ны өдөр`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return String(dateStr);
  }
}

/**
 * Гэрээний төрлийг монгол хэлээр форматлах
 */
function formatContractType(contractType?: string): string {
  if (!contractType) return 'Бүтэн цагийн';
  
  const typeMap: { [key: string]: string } = {
    'FULL_TIME': 'Бүтэн цагийн',
    'PART_TIME': 'Хагас цагийн',
    'TEMPORARY': 'Түр хугацааны',
    'CONTRACT': 'Гэрээт',
    'INTERNSHIP': 'Дадлага',
  };
  
  return typeMap[contractType.toUpperCase()] || contractType;
}

/**
 * Generate contract using simple placeholders (if template uses ___ format)
 */
export function generateContractWordSimple(
  contractData: ContractData,
  templatePath: string,
  outputPath: string
): string {
  try {
    const content = readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);
    
    let documentXml = zip.file('word/document.xml')?.asText();
    
    if (!documentXml) {
      throw new Error('Template файл буруу байна');
    }
    
    const simplePlaceholders: Array<[string, string]> = [
      // Date
      ['___CONTRACT_DATE___', formatDateMongolian(contractData.startDate || new Date().toISOString().split('T')[0])],
      // Contract number
      ['___CONTRACT_NUMBER___', contractData.contractNumber || ''],
      // Employee info
      ['___EMPLOYEE_NAME___', `${contractData.employeeLastName || ''} овогтой ${contractData.employeeName || ''}`],
      ['___REGISTRATION_NUMBER___', contractData.registrationNumber || contractData.employeeId || ''],
      // Company & Director
      ['___COMPANY_NAME___', contractData.companyName || 'Эрдэнэс-Тавантолгой'],
      ['___DIRECTOR_NAME___', contractData.directorName || ''],
      // Position & Department
      ['___POSITION___', contractData.position || ''],
      ['___DEPARTMENT___', contractData.department || ''],
      // Contract type
      ['___CONTRACT_TYPE___', formatContractType(contractData.contractType)],
      // Work conditions
      ['___WORK_CONDITIONS___', formatContractType(contractData.contractType)],
      ['___WORK_SCHEDULE___', formatContractType(contractData.contractType)],
      // Salary
      ['___SALARY___', (contractData.salary || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })],
      ['___SALARY_TEXT___', contractData.salaryText || ''],
      // Benefits & Duration
      ['___BENEFITS___', contractData.benefits || 'Хөдөлмөрийн гэрээнд заасны дагуу'],
      ['___CONTRACT_DURATION___', contractData.contractDuration || 'Тодорхой хугацаагүй'],
    ];
    
    for (const [placeholder, value] of simplePlaceholders) {
      documentXml = documentXml.replace(new RegExp(placeholder, 'g'), value);
    }
    
    // Note: Signature section дээрх "ГҮЙЦЭТГЭХ ЗАХИРАЛ ........" нь гарын үсэг зурах зай
    // Үүнийг replace хийхгүй!
    
    // Update the zip
    zip.file('word/document.xml', documentXml);
    
    // Generate output
    const outputBuffer = zip.generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });
    
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, outputBuffer);
    
    return outputPath;
  } catch (error) {
    console.error('Error generating Word document:', error);
    throw error;
  }
}
export function generateContractWordAdvanced(
  contractData: ContractData,
  templatePath: string,
  outputPath: string
): string {
  try {
    const content = readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);
    
    let documentXml = zip.file('word/document.xml')?.asText();
    
    if (!documentXml) {
      throw new Error('Template файл буруу байна');
    }
    const hasSimplePlaceholders = documentXml.includes('___CONTRACT_DATE___') || 
                                  documentXml.includes('___EMPLOYEE_NAME___');
    
    if (hasSimplePlaceholders) {
      return generateContractWordSimple(contractData, templatePath, outputPath);
    }
    
    const replacements: Array<[string, string]> = [
      ["№ .............", `№ ${contractData.contractNumber || ''}`],
      ["№ .........", `№ ${contractData.contractNumber || ''}`],
      ['"Эрдэнэс-Тавантолгой" ХК', `"${contractData.companyName || 'Эрдэнэс-Тавантолгой'}" ХК`],
      ["Эрдэнэс-Тавантолгой ХК", contractData.companyName || 'Эрдэнэс-Тавантолгой ХК'],
      ["Регистрийн дугаар: ..................", `Регистрийн дугаар: ${contractData.registrationNumber || contractData.employeeId || ''}`],
      ["Регистрийн дугаар: ................./", `Регистрийн дугаар: ${contractData.registrationNumber || contractData.employeeId || ''}`],
      ["Регистрийн дугаар: .................", `Регистрийн дугаар: ${contractData.registrationNumber || contractData.employeeId || ''}`],
      ["нөгөө талаас ........................ овогтой ........................", `нөгөө талаас ${contractData.employeeLastName || ''} овогтой ${contractData.employeeName || ''}`],
      ["Албан тушаал: ...............", `Албан тушаал: ${contractData.position || ''}`],
      ["Харьяалагдах нэгж: ..............", `Харьяалагдах нэгж: ${contractData.department || ''}`],
      ["Гэрээний төрөл: ..................", `Гэрээний төрөл: ${formatContractType(contractData.contractType)}`],
      ["Үндсэн цалин: ................ /............................../-н төгрөг", 
       `Үндсэн цалин: ${(contractData.salary || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} /${contractData.salaryText || ''}/-н төгрөг`],
      ["Үндсэн цалин: ................", `Үндсэн цалин: ${(contractData.salary || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`],
      ["Хөдөлмөрийн нөхцөл: ...................", `Хөдөлмөрийн нөхцөл: ${formatContractType(contractData.contractType)}`],
      ["Бусад хангамж ...............................................", `Бусад хангамж: ${contractData.benefits || 'Хөдөлмөрийн гэрээнд заасны дагуу'}`],
    ];
    
    for (const [oldText, newText] of replacements) {
      documentXml = documentXml.replace(oldText, newText);
    }
    
    documentXml = documentXml.replace(
      /2025 оны[\s\.]*\.[\s\.]*\.[\s\.]*\.[\s\.]*\.[\s\.]*дугаар сарын[\s\.]*…+\.?-?ны өдөр/g,
      formatDateMongolian(contractData.startDate || new Date().toISOString().split('T')[0])
    );
    
    documentXml = documentXml.replace(
      /нөгөө талаас[\s\.]+\.[\s\.]*\.[\s\.]*\.[\s\.]*\.[\s\.]*\.[\s\.]*\.[\s\.]*\.[\s\.]*\.[\s\.]*\.[\s\.]*\.[\s\.]*\.[\s\.]*\.[\s\.]*\.[\s\.]*\.[\s\.]*овогтой\.[\s\.]*\.[\s\.]*\.[\s\.]+/g,
      `нөгөө талаас ${contractData.employeeLastName || ''} овогтой ${contractData.employeeName || ''} `
    );
    
    documentXml = documentXml.replace(
      /Гүйцэтгэх захирал[\s]+Гүйцэтгэх захирал/g,
      'Гүйцэтгэх захирал: ${contractData.directorName}'
    );
    
    documentXml = documentXml.replace(
      /Гэрээний төрөл:[\s\.]+/g,
      `Гэрээний төрөл: ${formatContractType(contractData.contractType)}`
    );
    
    documentXml = documentXml.replace(
      /Хөдөлмөрийн нөхцөл:[\s\.]+/g,
      `Хөдөлмөрийн нөхцөл: ${formatContractType(contractData.contractType)}`
    );
    
    documentXml = documentXml.replace(
      /Ажлын цаг:[\s\.]+/g,
      `Ажлын цаг: ${formatContractType(contractData.contractType)}`
    );
    
    documentXml = documentXml.replace(
      /Гэрээний хугацаа:[\s\.]+/g,
      `Гэрээний хугацаа: ${contractData.contractDuration || 'Тодорхой хугацаагүй'}`
    );
    
    documentXml = documentXml.replace(
      /"[\s\.]+ХХК-/g,
      `"${contractData.companyName || 'Эрдэнэс-Тавантолгой'}" ХХК-`
    );
    
    zip.file('word/document.xml', documentXml);
    
    const outputBuffer = zip.generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });
    
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, outputBuffer);
    
    return outputPath;
  } catch (error) {
    console.error('Error generating Word document:', error);
    throw error;
  }
}
