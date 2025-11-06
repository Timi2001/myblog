import { NextRequest, NextResponse } from 'next/server';
import { categoryService } from '@/lib/firestore';

// GET /api/categories - List all categories (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const categories = await categoryService.getAll();
    
    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}