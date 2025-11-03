import { NextRequest, NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

type Params = { id: string };

interface CheckResult {
  contractId: string;
  timestamp: string;
  checks: {
    templateFile: {
      path: string;
      exists: boolean;
    };
    outputDirectory: {
      path: string;
      exists: boolean;
    };
    python: {
      installed: boolean;
      command: string | null;
      version: string | null;
      error: string | null;
    };
    pythonDocx: {
      installed: boolean;
      error: string | null;
    };
    pythonScript: {
      path: string;
      exists: boolean;
    };
    workingDirectory: {
      cwd: string;
    };
    status: string;
    recommendations: string[];
  };
}

/**
 * Debug endpoint to check contract generation setup
 * Usage: GET /api/hr/contracts/{id}/debug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    
    // 1. Check template file
    const templatePath = join(process.cwd(), 'public', 'templates', 'contracts', 'template.docx');
    const templateFile = {
      path: templatePath,
      exists: existsSync(templatePath),
    };

    // 2. Check output directory
    const outputDir = join(process.cwd(), 'public', 'uploads', 'contracts');
    const outputDirectory = {
      path: outputDir,
      exists: existsSync(outputDir),
    };

    // 3. Check Python installation
    let pythonInfo: { installed: boolean; command: string | null; version: string | null; error: string | null } = { 
      installed: false, 
      command: null, 
      version: null, 
      error: null 
    };
    const pythonCommands = ['python3', 'python'];
    
    for (const cmd of pythonCommands) {
      try {
        const { stdout } = await execAsync(`${cmd} --version`);
        pythonInfo = {
          installed: true,
          command: cmd,
          version: stdout.trim(),
          error: null,
        };
        break;
      } catch (error) {
        const err = error as { message?: string };
        pythonInfo.error = err.message || 'Unknown error';
      }
    }

    // 4. Check python-docx
    let pythonDocxInfo: { installed: boolean; error: string | null } = { installed: false, error: null };
    if (pythonInfo.installed && pythonInfo.command) {
      try {
        await execAsync(`${pythonInfo.command} -c "import docx; print(docx.__version__)"`);
        pythonDocxInfo = {
          installed: true,
          error: null,
        };
      } catch (error) {
        const err = error as { message?: string };
        pythonDocxInfo = {
          installed: false,
          error: err.message || 'Unknown error',
        };
      }
    }

    // 5. Check Python script
    const scriptPath = join(process.cwd(), 'scripts', 'generate_contract_word.py');
    const pythonScript = {
      path: scriptPath,
      exists: existsSync(scriptPath),
    };

    // 6. Check working directory
    const workingDirectory = {
      cwd: process.cwd(),
    };

    // Overall status
    const allChecksPassed = 
      templateFile.exists &&
      pythonInfo.installed &&
      pythonDocxInfo.installed &&
      pythonScript.exists;

    const status = allChecksPassed ? 'ready' : 'not_ready';
    
    // Recommendations
    const recommendations = [];
    if (!templateFile.exists) {
      recommendations.push('Upload template.docx to public/templates/contracts/');
    }
    if (!pythonInfo.installed) {
      recommendations.push('Install Python 3 on the server');
    }
    if (!pythonDocxInfo.installed) {
      recommendations.push('Install python-docx: pip install python-docx');
    }
    if (!pythonScript.exists) {
      recommendations.push('Ensure generate_contract_word.py exists in scripts/');
    }

    const result: CheckResult = {
      contractId: id,
      timestamp: new Date().toISOString(),
      checks: {
        templateFile,
        outputDirectory,
        python: pythonInfo,
        pythonDocx: pythonDocxInfo,
        pythonScript,
        workingDirectory,
        status,
        recommendations,
      },
    };

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    const err = error as { message?: string; stack?: string };
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Debug check failed',
        message: err.message || 'Unknown error',
        stack: err.stack,
      },
      { status: 500 }
    );
  }
}

