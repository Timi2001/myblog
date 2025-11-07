import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return new NextResponse(JSON.stringify({ error: 'Token is required' }), { status: 400 });
    }

    const response = new NextResponse(JSON.stringify({ success: true }));
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/',
      maxAge: 3600,
    });

    return response;
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
