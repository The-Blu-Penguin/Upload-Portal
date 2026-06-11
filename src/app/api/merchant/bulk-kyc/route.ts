import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'https://staging-loans-api.blupayafrica.com';

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: 'No file provided',
          statusCode: 400,
        },
        { status: 400 }
      );
    }

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

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: `File size exceeds the maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)',
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // Create Basic Auth header
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');

    // Forward the file to the external API
    const apiFormData = new FormData();
    apiFormData.append('file', file);

    const response = await fetch(`${API_URL}/merchant/bulk-kyc`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
      },
      body: apiFormData,
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
