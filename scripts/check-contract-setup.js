#!/usr/bin/env node

/**
 * Script to verify contract generation setup
 * Checks:
 * - Template file exists
 * - Python is installed
 * - python-docx is installed
 * - Required directories exist
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Contract Generation Setup...\n');

let hasErrors = false;

// 1. Check template file
console.log('1️⃣ Checking template file...');
const templatePath = path.join(process.cwd(), 'public', 'templates', 'contracts', 'template.docx');
if (fs.existsSync(templatePath)) {
  console.log('   ✅ Template file found:', templatePath);
} else {
  console.log('   ❌ Template file NOT found:', templatePath);
  console.log('   💡 Create the template file at this location');
  hasErrors = true;
}

// 2. Check Python installation
console.log('\n2️⃣ Checking Python installation...');
let pythonCmd = null;
const pythonCommands = ['python3', 'python'];

for (const cmd of pythonCommands) {
  try {
    const version = execSync(`${cmd} --version`, { encoding: 'utf-8' }).trim();
    console.log(`   ✅ ${cmd} found: ${version}`);
    pythonCmd = cmd;
    break;
  } catch (error) {
    console.log(`   ⚠️  ${cmd} not found`);
  }
}

if (!pythonCmd) {
  console.log('   ❌ Python NOT installed');
  console.log('   💡 Install Python 3 from https://www.python.org/downloads/');
  hasErrors = true;
}

// 3. Check python-docx
if (pythonCmd) {
  console.log('\n3️⃣ Checking python-docx library...');
  try {
    execSync(`${pythonCmd} -c "import docx; print(docx.__version__)"`, { 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    console.log('   ✅ python-docx is installed');
  } catch (error) {
    console.log('   ❌ python-docx NOT installed');
    console.log(`   💡 Run: pip install python-docx`);
    hasErrors = true;
  }
} else {
  console.log('\n3️⃣ Skipping python-docx check (Python not found)');
}

// 4. Check output directory
console.log('\n4️⃣ Checking output directory...');
const outputDir = path.join(process.cwd(), 'public', 'uploads', 'contracts');
if (fs.existsSync(outputDir)) {
  console.log('   ✅ Output directory exists:', outputDir);
} else {
  console.log('   ⚠️  Output directory will be created automatically:', outputDir);
}

// 5. Check generate_contract_word.py
console.log('\n5️⃣ Checking Python script...');
const scriptPath = path.join(process.cwd(), 'scripts', 'generate_contract_word.py');
if (fs.existsSync(scriptPath)) {
  console.log('   ✅ Python script found:', scriptPath);
} else {
  console.log('   ❌ Python script NOT found:', scriptPath);
  hasErrors = true;
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Setup incomplete. Please fix the errors above.');
  console.log('📖 See PYTHON_SETUP.md for detailed instructions');
  process.exit(1);
} else {
  console.log('✅ All checks passed! Contract generation should work.');
  console.log('\n💡 If you still encounter issues:');
  console.log('   - Check server logs for detailed error messages');
  console.log('   - Verify template file placeholders are correct');
  console.log('   - Test Python script manually: node scripts/test-contract-generation.js');
}
console.log('='.repeat(50));

