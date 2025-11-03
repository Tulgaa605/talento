/**
 * Test script for Word contract generation
 * Run with: npx tsx scripts/test-contract-generation.ts
 */
import { generateContractWordAdvanced } from '../src/utils/generateContractWord';
import { join } from 'path';
import { existsSync } from 'fs';

const testData = {
  contractNumber: 'CT-2025-001',
  employeeName: 'Баяр',
  employeeLastName: 'Болд',
  employeeId: 'EMP-2025-001',
  registrationNumber: 'РД12345678',
  position: 'Программист',
  department: 'IT хэлтэс',
  salary: 1500000,
  salaryText: 'нэг сая таван зуун мянган',
  startDate: '2025-01-15',
  endDate: undefined,
  contractType: 'FULL_TIME',
  workSchedule: 'Бүтэн цагийн (08:00-17:00)',
  contractDuration: '1 жил',
  companyName: 'Эрдэнэс-Тавантолгой ХК',
  directorName: 'Ж.Батбаяр',
  city: 'Улаанбаатар хот'
};

async function testContractGeneration() {
  console.log('🧪 Testing Word contract generation...\n');
  
  const templatePath = join(process.cwd(), 'public', 'templates', 'contracts', 'template.docx');
  const outputPath = join(process.cwd(), 'test_contract_output.docx');
  
  // Check if template exists
  if (!existsSync(templatePath)) {
    console.error(`❌ Template файл олдсонгүй: ${templatePath}`);
    console.log('\n📋 Template файлыг дараах замд байрлуулна уу:');
    console.log(`   ${templatePath}`);
    process.exit(1);
  }
  
  console.log(`✅ Template файл олдлоо: ${templatePath}`);
  
  try {
    console.log('\n📝 Гэрээ үүсгэж байна...');
    console.log('Contract Data:', JSON.stringify(testData, null, 2));
    
    const result = generateContractWordAdvanced(testData, templatePath, outputPath);
    
    if (existsSync(result)) {
      console.log(`\n✅ Амжилттай! Гэрээ үүсгэгдлээ: ${result}`);
      console.log('\n📄 Generated file details:');
      const fs = require('fs');
      const stats = fs.statSync(result);
      console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`   Created: ${stats.birthtime}`);
    } else {
      console.error('\n❌ Гэрээ үүсээгүй байна');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Алдаа гарлаа:', error);
    process.exit(1);
  }
}

testContractGeneration().catch(console.error);

