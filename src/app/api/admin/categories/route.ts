import { NextRequest, NextResponse } from 'next/server';
import { categoryService } from '@/lib/firestore';
import { CreateCategoryInput } from '@/types';
import { verifyAuth } from '@/lib/auth-server';
import { serverTimestamp } from 'firebase/firestore';
import { slugify } from '@/utils/slugify';

// GET /api/admin/categories - List all categories
export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyAuth();
    if (!decodedToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

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

// POST /api/admin/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const decodedToken = await verifyAuth();
    if (!decodedToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateCategoryInput = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category name is required',
        },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = slugify(body.name);
    
    // Check if slug already exists
    const existingCategory = await categoryService.getBySlug(slug);
    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'A category with this name already exists',
        },
        { status: 400 }
      );
    }

    // Create category data
    const categoryData = {
      name: body.name,
      slug,
      description: body.description || '',
      color: body.color || '#3B82F6',
      createdAt: serverTimestamp(),
    } as any;

    const categoryId = await categoryService.create(categoryData);
    
    return NextResponse.json({
      success: true,
      data: { id: categoryId, ...categoryData },
      message: 'Category created successfully',
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create category',
      },
      { status: 500 }
    );
  }
}