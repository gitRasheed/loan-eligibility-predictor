import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    console.log("Sending data:", body);

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    console.log("Connecting to backend URL:", backendUrl);

    const response = await fetch(`${backendUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        loan_term: body.loanTerm,
        cibil_score: body.creditScore,
        income_annum: body.annualIncome,
        loan_amount: body.loanAmount,
        total_assets: body.assetsValue
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", errorText);
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Received result:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in checkEligibility route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}