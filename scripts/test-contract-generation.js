#!/usr/bin/env node

/**
 * Test script for contract generation
 * This script tests the Python contract generation directly
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function testContractGeneration() {
  console.log('🧪 Testing Contract Generation...\n');

  // Test data
  const testData = {
    contractNumber: 'CT-2025-TEST-001',
    employeeName: 'Баяр',
    employeeLastName: 'Болд',
    employeeId: 'EMP-TEST-001',
    registrationNumber: 'УБ12345678',
    position: 'Тест инженер',
    department: 'Тест хэлтэс',
    salary: 1500000,
    salaryText: 'нэг сая таван зуун мянган',
    startDate: '2025-01-15',
    endDate: null,
    contractType: 'FULL_TIME',
    workSchedule: 'Бүтэн цагийн (08:00-17:00)',
    contractDuration: '1 жил',
    companyName: 'Эрдэнэс-Тавантолгой ХК',
    directorName: 'Гүйцэтгэх захирал',
    city: 'Улаанбаатар хот'
  };

  const tempJsonPath = path.join(process.cwd(), `temp_contract_test_${Date.now()}.json`);
  const pythonScriptPath = path.join(process.cwd(), 'scripts', 'generate_contract_word_api.py');
  const outputPath = path.join(process.cwd(), `test_contract_output_${Date.now()}.docx`);

  try {
    // 1. Write test data to JSON
    console.log('1️⃣ Writing test data...');
    fs.writeFileSync(tempJsonPath, JSON.stringify(testData, null, 2), 'utf-8');
    console.log('   ✅ Test data written to:', tempJsonPath);

    // 2. Create Python API script
    console.log('\n2️⃣ Creating Python API script...');
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
    fs.writeFileSync(pythonScriptPath, pythonApiScript, 'utf-8');
    console.log('   ✅ Python script created');

    // 3. Detect Python command
    console.log('\n3️⃣ Detecting Python...');
    let pythonCmd = 'python';
    try {
      await execAsync('python3 --version');
      pythonCmd = 'python3';
      console.log('   ✅ Using: python3');
    } catch {
      try {
        await execAsync('python --version');
        pythonCmd = 'python';
        console.log('   ✅ Using: python');
      } catch {
        throw new Error('Python not found');
      }
    }

    // 4. Run Python script
    console.log('\n4️⃣ Running contract generation...');
    console.log('   Command:', `${pythonCmd} "${pythonScriptPath}" "${tempJsonPath}" "${outputPath}"`);
    
    const { stdout, stderr } = await execAsync(
      `"${pythonCmd}" "${pythonScriptPath}" "${tempJsonPath}" "${outputPath}"`,
      { maxBuffer: 10 * 1024 * 1024, encoding: 'utf-8' }
    );

    if (stdout) console.log('   Output:', stdout);
    if (stderr) console.log('   Errors:', stderr);

    // 5. Check output file
    console.log('\n5️⃣ Checking output...');
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log('   ✅ Contract generated successfully!');
      console.log('   📄 File:', outputPath);
      console.log('   📊 Size:', (stats.size / 1024).toFixed(2), 'KB');
    } else {
      throw new Error('Output file was not created');
    }

    // Cleanup temp files
    console.log('\n6️⃣ Cleaning up...');
    try {
      fs.unlinkSync(tempJsonPath);
      fs.unlinkSync(pythonScriptPath);
      console.log('   ✅ Temp files cleaned up');
    } catch (err) {
      console.log('   ⚠️  Could not clean up temp files');
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Test completed successfully!');
    console.log('📄 Generated file is at:', outputPath);
    console.log('💡 You can delete the test file manually if needed');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nFull error:', error);

    // Cleanup on error
    try {
      if (fs.existsSync(tempJsonPath)) fs.unlinkSync(tempJsonPath);
      if (fs.existsSync(pythonScriptPath)) fs.unlinkSync(pythonScriptPath);
    } catch {}

    console.log('\n💡 Troubleshooting:');
    console.log('   1. Run: node scripts/check-contract-setup.js');
    console.log('   2. Check: public/templates/contracts/template.docx exists');
    console.log('   3. Install: pip install python-docx');
    console.log('   4. See: PYTHON_SETUP.md for detailed setup');

    process.exit(1);
  }
}

testContractGeneration();

