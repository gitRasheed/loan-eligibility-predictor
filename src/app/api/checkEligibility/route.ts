import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

const SCRIPT_PATH = path.join(process.cwd(), 'api', 'predict.py');

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { loanTerm, creditScore, annualIncome, loanAmount, assetsValue } = body;

    if (!loanTerm || !creditScore || !annualIncome || !loanAmount || !assetsValue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const command = `python "${SCRIPT_PATH}" ${loanTerm} ${creditScore} ${annualIncome} ${loanAmount} ${assetsValue}`;

    const { stdout, stderr } = await execPromise(command);

    if (stderr) {
      console.error('Error from Python script:', stderr);
      return NextResponse.json({ error: 'Error in prediction script' }, { status: 500 });
    }

    const eligible = stdout.trim().toLowerCase() === 'true';

    return NextResponse.json({ eligible });
  } catch (error) {
    console.error('Error in checkEligibility route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}