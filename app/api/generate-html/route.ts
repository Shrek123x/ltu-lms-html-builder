import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint to generate HTML using AWS Lambda
 * POST /api/generate-html
 * 
 * Body: {
 *   messages: Message[],
 *   theme: 'light' | 'dark'
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Invalid input: messages array required' },
        { status: 400 }
      );
    }

    // AWS Lambda function URL (replace with your actual Lambda function URL)
    const lambdaUrl = process.env.LAMBDA_FUNCTION_URL || 
                      'https://xxxxxx.execute-api.ap-southeast-2.amazonaws.com/prod/generate';

    // Call Lambda function
    const lambdaResponse = await fetch(lambdaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: body.messages,
        theme: body.theme || 'light',
      }),
    });

    if (!lambdaResponse.ok) {
      throw new Error(`Lambda returned ${lambdaResponse.status}`);
    }

    const result = await lambdaResponse.json();

    // Return the generated HTML
    return new NextResponse(result.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Error calling Lambda:', error);
    return NextResponse.json(
      { error: 'Failed to generate HTML', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
