import { NextRequest, NextResponse } from 'next/server';

// Firebase Admin initialization helper
function getFirebaseAuth() {
  try {
    const { getAuth } = require('firebase-admin/auth');
    const { initializeApp, getApps, cert } = require('firebase-admin/app');
    
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
    
    return getAuth();
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Check if Firebase Admin is properly configured
    if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Firebase Admin not configured', valid: false },
        { status: 500 }
      );
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      return NextResponse.json(
        { error: 'Firebase Admin initialization failed', valid: false },
        { status: 500 }
      );
    }

    // Verify the Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);
    
    return NextResponse.json({
      valid: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Invalid token', valid: false },
      { status: 401 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No valid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Check if Firebase Admin is properly configured
    if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Firebase Admin not configured', valid: false },
        { status: 500 }
      );
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      return NextResponse.json(
        { error: 'Firebase Admin initialization failed', valid: false },
        { status: 500 }
      );
    }
    
    // Verify the Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);
    
    return NextResponse.json({
      valid: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Invalid token', valid: false },
      { status: 401 }
    );
  }
}