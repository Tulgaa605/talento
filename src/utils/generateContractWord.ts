
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
  workConditions?: string;
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

function formatContractType(contractType?: string): string {
  if (!contractType) return 'Бүтэн цагийн';
  
  const typeMap: { [key: string]: string } = {
    'FULL_TIME': 'Үндсэн ажилтан',
    'PART_TIME': 'Цагийн ажилтан',
    'PROBATION': 'Туршилтын ажилтан',
    'INTERNSHIP': 'Дадлага ажилтан',
  };
  
  return typeMap[contractType.toUpperCase()] || contractType;
}

function formatWorkConditions(workConditions?: string): string {
  if (!workConditions) return 'Ердийн';
  
  const conditionsMap: { [key: string]: string } = {
    'NORMAL': 'Ердийн',
    'HARMFUL': 'Хортой',
  };
  
  return conditionsMap[workConditions.toUpperCase()] || workConditions;
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
      ['___CONTRACT_DATE___', formatDateMongolian(contractData.startDate || new Date().toISOString().split('T')[0])],
      ['___CONTRACT_NUMBER___', contractData.contractNumber || ''],
      ['___EMPLOYEE_NAME___', `${contractData.employeeLastName || ''} овогтой ${contractData.employeeName || ''}`],
      ['___REGISTRATION_NUMBER___', contractData.registrationNumber || contractData.employeeId || ''],
      ['___COMPANY_NAME___', contractData.companyName || ''],
      ['___DIRECTOR_NAME___', contractData.directorName || ''],
      ['___POSITION___', contractData.position || ''],
      ['___DEPARTMENT___', contractData.department || ''],
      ['___CONTRACT_TYPE___', formatContractType(contractData.contractType)],
      ['___WORK_CONDITIONS___', formatWorkConditions(contractData.workConditions)],
      ['___WORK_SCHEDULE___', contractData.workSchedule || 'Даваа-Баасан 09:00-18:00'],
      ['___SALARY___', (contractData.salary || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })],
      ['___SALARY_TEXT___', contractData.salaryText || ''],
      ['___BENEFITS___', contractData.benefits || 'Хөдөлмөрийн гэрээнд заасны дагуу'],
      ['___CONTRACT_DURATION___', contractData.contractDuration || 'Тодорхой хугацаагүй'],
    ];
    
    for (const [placeholder, value] of simplePlaceholders) {
      // Escape special regex characters in placeholder
      const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      documentXml = documentXml.replace(new RegExp(escapedPlaceholder, 'g'), value);
    }
    
    // Replace "Гүйцэтгэх захирал …..………………." patterns (dots and spaces after "Гүйцэтгэх захирал")
    documentXml = documentXml.replace(
      /Гүйцэтгэх захирал[\s\.]+\.+[\s\.]*/g,
      contractData.directorName ? `Гүйцэтгэх захирал ${contractData.directorName}` : 'Гүйцэтгэх захирал'
    );
    
    // Replace "Гүйцэтгэх захирал …..………………." with various dot patterns
    documentXml = documentXml.replace(
      /Гүйцэтгэх захирал[\s]*\.+[\s]*/g,
      contractData.directorName ? `Гүйцэтгэх захирал ${contractData.directorName}` : 'Гүйцэтгэх захирал'
    );
    
    // Replace "Нэг талаас ___COMPANY_NAME___ ХХК" if placeholder wasn't replaced (fallback)
    if (documentXml.includes('___COMPANY_NAME___')) {
      documentXml = documentXml.replace(
        /___COMPANY_NAME___/g,
        contractData.companyName || ''
      );
    }
    
    // Replace "Нэг талаас [company name] ХХК" pattern to ensure "ХК" is correct
    documentXml = documentXml.replace(
      /Нэг талаас[\s]+([^Х]+)[\s]*ХХК/g,
      (match, companyName) => {
        const name = companyName.trim();
        return name ? `Нэг талаас ${name} ХК` : 'Нэг талаас'
      }
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
      ['"Эрдэнэс-Тавантолгой" ХК', contractData.companyName ? `"${contractData.companyName}" ХК` : ''],
      ["Эрдэнэс-Тавантолгой ХК", contractData.companyName || ''],
      ["Нэг талаас Эрдэнэс-Тавантолгой ХК", contractData.companyName ? `Нэг талаас ${contractData.companyName} ХК` : ''],
      ["Нэг талаас Эрдэнэс-Тавантолгой ХК ХХК", contractData.companyName ? `Нэг талаас ${contractData.companyName} ХК` : ''],
      ["нэг талаас Эрдэнэс-Тавантолгой ХК", contractData.companyName ? `нэг талаас ${contractData.companyName} ХК` : ''],
      ["нэг талаас Эрдэнэс-Тавантолгой ХК ХХК", contractData.companyName ? `нэг талаас ${contractData.companyName} ХК` : ''],
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
      ["Хөдөлмөрийн нөхцөл: ...................", `Хөдөлмөрийн нөхцөл: ${formatWorkConditions(contractData.workConditions)}`],
      ["Бусад хангамж ...............................................", `Бусад хангамж: ${contractData.benefits || 'Хөдөлмөрийн гэрээнд заасны дагуу'}`],
      ["Ажлын хуваарь: ...................", `Ажлын хуваарь: ${contractData.workSchedule || 'Даваа-Баасан 09:00-18:00'}`],
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
      `Хөдөлмөрийн нөхцөл: ${formatWorkConditions(contractData.workConditions)}`
    );
    
    documentXml = documentXml.replace(
      /Ажлын цаг:[\s\.]+/g,
      `Ажлын цаг: ${contractData.workSchedule || 'Даваа-Баасан 09:00-18:00'}`
    );
    
    documentXml = documentXml.replace(
      /Гэрээний хугацаа:[\s\.]+/g,
      `Гэрээний хугацаа: ${contractData.contractDuration || 'Тодорхой хугацаагүй'}`
    );
    
    documentXml = documentXml.replace(
      /"[\s\.]+ХХК-/g,
      contractData.companyName ? `"${contractData.companyName}" ХХК-` : ''
    );
    
    // Replace "Нэг талаас Эрдэнэс-Тавантолгой ХК" patterns
    documentXml = documentXml.replace(
      /Нэг талаас[\s]*Эрдэнэс-Тавантолгой[\s]*ХК[\s]*ХХК?/gi,
      contractData.companyName ? `Нэг талаас ${contractData.companyName} ХК` : ''
    );
    
    documentXml = documentXml.replace(
      /нэг талаас[\s]*Эрдэнэс-Тавантолгой[\s]*ХК[\s]*ХХК?/gi,
      contractData.companyName ? `нэг талаас ${contractData.companyName} ХК` : ''
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