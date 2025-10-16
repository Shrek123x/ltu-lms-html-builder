import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/db/client';

/**
 * GET /api/messages - Retrieve all messages from the database
 */
export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { timestamp: 'desc' },
    });
    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages - Create a new message in the database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, from, level, timestamp } = body;

    // Validate required fields
    if (!text || !level || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields: text, level, timestamp' },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        text,
        from: from || null,
        level,
        timestamp: new Date(timestamp),
        resolved: false,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
