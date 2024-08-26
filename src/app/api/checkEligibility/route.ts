import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { loanTerm, creditScore, annualIncome, loanAmount, assetsValue } = body;

    if (!loanTerm || !creditScore || !annualIncome || !loanAmount || !assetsValue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ loanTerm, creditScore, annualIncome, loanAmount, assetsValue }),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in checkEligibility route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}