import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'https://staging-api.blupaytms.com/api/v1';
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error('API_KEY is not defined in environment variables');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> }
) {
  try {
    const { merchantId } = await params;
    const body = await request.json();

    const response = await fetch(`${API_URL}/merchant/update/${merchantId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(
      {
        success: response.ok,
        message: data.message || (response.ok ? 'Merchant updated successfully' : 'Failed to update merchant'),
        statusCode: response.status,
        data: response.ok ? data : undefined,
        errors: data.errors || [],
      },
      { status: response.status }
    );
  } catch (error) {
    console.error('Error updating merchant:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred',
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}
