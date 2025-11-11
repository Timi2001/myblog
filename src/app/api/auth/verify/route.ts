import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  try {
    const decodedToken = await verifyAuth();

    if (!decodedToken) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    return new NextResponse(JSON.stringify({ success: true, uid: decodedToken.uid }), { status: 200 });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
