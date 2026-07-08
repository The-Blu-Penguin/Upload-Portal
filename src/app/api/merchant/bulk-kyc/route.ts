import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL;

if (!API_URL) {
  console.error('API_URL is not defined in environment variables');
}

/**
 * POST /api/merchant/bulk-kyc
 * 
 * Proxies bulk merchant KYC updates to the external API
 * 
 * Expects JSON body:
 * {
 *   username: string,
 *   password: string,
 *   updates: Array<{
 *     merchantId: string (required),
 *     incorporationDate?: string,
 *     contactPersonName?: string,
 *     contactPersonEmail?: string,
 *     contactPersonPhone?: string,
 *     contactPersonRelation?: string,
 *     companyRegistrationNumber?: string,
 *     ghanaCardId?: string
 *   }>
 * }
 * 
 * External API endpoint: POST {API_URL}/api/merchant/kyc/bulk
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, updates } = body;

    console.log('Bulk-KYC Route - Received body:', JSON.stringify({ 
      username: username ? '***' : undefined, 
      password: password ? '***' : undefined,
      updatesCount: updates?.length,
      updates: updates
    }, null, 2));

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

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Updates array is required and must contain at least one merchant',
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // Validate each update has merchantId
    const invalidUpdates = updates.filter((update: { merchantId?: string }) => !update.merchantId);
    if (invalidUpdates.length > 0) {
      console.log('Invalid updates found:', invalidUpdates);
      return NextResponse.json(
        {
          success: false,
          message: 'Each update must include a merchantId',
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // Validate API_URL is configured
    if (!API_URL) {
      return NextResponse.json(
        {
          success: false,
          message: 'Server configuration error: API_URL not set',
          statusCode: 500,
        },
        { status: 500 }
      );
    }

    // Create Basic Auth header
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');

    const response = await fetch(`${API_URL}/api/merchant/kyc/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify({ updates }),
    });

    const data = await response.json();

    return NextResponse.json(
      {
        success: response.ok,
        message: data.message || (response.ok ? 'Merchants updated successfully' : 'Failed to update merchants'),
        statusCode: response.status,
        data: response.ok ? data : undefined,
        errors: data.errors || [],
      },
      { status: response.status }
    );
  } catch (error) {
    console.error('Error updating multiple merchants:', error);
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
