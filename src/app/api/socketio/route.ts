import { NextRequest, NextResponse } from 'next/server';

/**
 * This is a placeholder Socket.IO implementation for the demo
 * In a production app, we would implement proper WebSocket handling
 */
export async function GET(req: NextRequest) {
  return NextResponse.json(
    { 
      message: 'Socket.IO is disabled in this demo version. In a production app, this would implement real-time features.',
      status: 'ok' 
    },
    { status: 200 }
  );
} 