import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

type Params = { id: string };

/**
 * Test endpoint to debug contract generation
 * Usage: GET /api/hr/contracts/{id}/test-generate
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const logs: string[] = [];
  const errors: string[] = [];

  try {
    const { id } = await params;
    logs.push(`Contract ID: ${id}`);

    // 1. Check template
    const templatePath = join(process.cwd(), 'public', 'templates', 'contracts', 'template.docx');
    if (existsSync(templatePath)) {
      logs.push(`✅ Template found: ${templatePath}`);
    } else {
      errors.push(`❌ Template NOT found: ${templatePath}`);
    }

    // 2. Check Python
    let pythonCmd = null;
    try {
      await execAsync('python3 --version');
      pythonCmd = 'python3';
      logs.push('✅ Python3 found');
    } catch {
      try {
        await execAsync('python --version');
        pythonCmd = 'python';
        logs.push('✅ Python found');
      } catch {
        errors.push('❌ Python NOT found');
      }
    }

    // 3. Check python-docx
    if (pythonCmd) {
      try {
        const { stdout } = await execAsync(`${pythonCmd} -c "import docx; print('OK')"`);
        if (stdout.includes('OK')) {
          logs.push('✅ python-docx installed');
        }
      } catch (err) {
        const error = err as { stderr?: string };
        errors.push(`❌ python-docx NOT installed: ${error.stderr || 'Unknown error'}`);
      }
    }

    // 4. Check generate script
    const scriptPath = join(process.cwd(), 'scripts', 'generate_contract_word.py');
    if (existsSync(scriptPath)) {
      logs.push(`✅ Python script found: ${scriptPath}`);
    } else {
      errors.push(`❌ Python script NOT found: ${scriptPath}`);
    }

    // 5. Try to import the script
    if (pythonCmd && existsSync(scriptPath)) {
      try {
        const testCmd = `${pythonCmd} -c "import sys; sys.path.insert(0, '${process.cwd()}'); from scripts.generate_contract_word import generate_contract_word; print('OK')"`;
        const { stdout, stderr } = await execAsync(testCmd);
        if (stdout.includes('OK')) {
          logs.push('✅ Python script can be imported');
        } else if (stderr) {
          errors.push(`⚠️ Import warning: ${stderr}`);
        }
      } catch (err) {
        const error = err as { stderr?: string; stdout?: string };
        errors.push(`❌ Cannot import script: ${error.stderr || error.stdout || 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      status: errors.length === 0 ? 'ready' : 'errors',
      logs,
      errors,
      recommendations: errors.length > 0 ? [
        'Check the errors above',
        'Run: npm run check:contracts',
        'Run: npm run test:contracts',
        'See: DEBUG_CONTRACT_ERROR.md for detailed guide'
      ] : ['Everything looks good! The 500 error might be a data issue. Check server console logs.']
    });

  } catch (error) {
    const err = error as { message?: string; stack?: string };
    return NextResponse.json({
      status: 'error',
      logs,
      errors: [...errors, `Fatal error: ${err.message}`],
      stack: err.stack,
    }, { status: 500 });
  }
}

