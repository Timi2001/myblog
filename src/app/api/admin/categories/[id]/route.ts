import { NextRequest, NextResponse } from 'next/server';
import { categoryService } from '@/lib/firestore';
import { UpdateCategoryInput } from '@/types';
import { verifyAuth } from '@/lib/auth-server';
import { slugify } from '@/utils/slugify';

// GET /api/admin/categories/[id] - Get single category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decodedToken = await verifyAuth();
    if (!decodedToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const categories = await categoryService.getAll();
    const foundCategory = categories.find(c => c.id === id);
    
    if (!foundCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: foundCategory,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch category',
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decodedToken = await verifyAuth();
    if (!decodedToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body: Partial<UpdateCategoryInput> = await request.json();
    
    // Get existing category to check if it exists
    const categories = await categoryService.getAll();
    const existingCategory = categories.find(c => c.id === id);
    
    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category not found',
        },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    // Update fields if provided
    if (body.name !== undefined) {
      updateData.name = body.name;
      // Update slug if name changed
      const newSlug = slugify(body.name);
      if (newSlug !== existingCategory.slug) {
        // Check if new slug already exists
        const slugExists = await categoryService.getBySlug(newSlug);
        if (slugExists && slugExists.id !== id) {
          return NextResponse.json(
            {
              success: false,
              error: 'A category with this name already exists',
            },
            { status: 400 }
          );
        }
        updateData.slug = newSlug;
      }
    }

    if (body.description !== undefined) updateData.description = body.description;
    if (body.color !== undefined) updateData.color = body.color;

    await categoryService.update(id, updateData);
    
    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update category',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decodedToken = await verifyAuth();
    if (!decodedToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    // Check if category exists
    const categories = await categoryService.getAll();
    const existingCategory = categories.find(c => c.id === id);
    
    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category not found',
        },
        { status: 404 }
      );
    }

    await categoryService.delete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete category',
      },
      { status: 500 }
    );
  }
}