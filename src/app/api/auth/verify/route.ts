import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let token: string | undefined;

    if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => ({} as any));
      token = body?.token;
    }

    if (!token) {
      // Also allow Authorization header as a fallback
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const decoded = await verifyIdToken(token);
    return NextResponse.json({ valid: true, uid: decoded.uid, decoded }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ valid: false, error: err?.message || 'Invalid token' }, { status: 401 });
  }
}
