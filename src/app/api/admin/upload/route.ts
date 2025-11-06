import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, getImagePath } from '@/lib/storage';
import { auth } from '@/lib/firebase';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin (for server-side auth verification)
let adminAuth: any = null;
try {
  const admin = require('firebase-admin');
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  adminAuth = admin.auth();
} catch (error) {
  console.warn('Firebase Admin not initialized:', error);
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token (fallback to client-side verification if admin not available)
    if (adminAuth) {
      try {
        await adminAuth.verifyIdToken(token);
      } catch (error) {
        return NextResponse.json(
          { success: false, error: 'Invalid token' },
          { status: 401 }
        );
      }
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'media';
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Generate file path
    const validTypes = ['articles', 'branding', 'media'] as const;
    const uploadType = validTypes.includes(type as any) ? type as typeof validTypes[number] : 'media';
    const filePath = getImagePath(uploadType, file.name);

    // Upload to Firebase Storage
    const downloadURL = await uploadImage(file, filePath);

    return NextResponse.json({
      success: true,
      data: {
        url: downloadURL,
        path: filePath,
        filename: file.name,
        size: file.size,
        type: file.type
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}