import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'https://staging-api.blupaytms.com/api/v1';
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error('API_KEY is not defined in environment variables');
}

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

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

    // Forward the file to the external API
    const apiFormData = new FormData();
    apiFormData.append('file', file);

    const response = await fetch(`${API_URL}/merchant/update-multiple`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
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
