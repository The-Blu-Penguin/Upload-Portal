import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'https://staging-loans-api.blupayafrica.com';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> }
) {
  try {
    const { merchantId } = await params;
    const body = await request.json();
    
    const { username, password, ...merchantData } = body;

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Username and password are required',
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // Create Basic Auth header
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');

    const response = await fetch(`${API_URL}/api/merchant/${merchantId}/kyc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify(merchantData),
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
