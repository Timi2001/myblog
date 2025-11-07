import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, getImagePath } from '@/lib/storage';
import { verifyAuth } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const decodedToken = await verifyAuth();
    if (!decodedToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
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