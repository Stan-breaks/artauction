import { NextResponse } from 'next/server';
import { initSocket } from '@/lib/socket';
import { NextApiResponseServerIO } from '@/lib/socket';

export async function GET(req: Request, res: NextApiResponseServerIO) {
  try {
    const io = initSocket(res as any);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Socket initialization error:', error);
    return NextResponse.json({ error: 'Failed to initialize socket' }, { status: 500 });
  }
} 