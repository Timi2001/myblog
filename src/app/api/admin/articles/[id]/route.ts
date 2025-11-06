import { NextRequest, NextResponse } from 'next/server';
import { articleService } from '@/lib/firestore';
import { UpdateArticleInput } from '@/types';
import { serverTimestamp } from 'firebase/firestore';
import { slugify } from '@/utils/slugify';

// GET /api/admin/articles/[id] - Get single article by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await articleService.getAll();
    const foundArticle = article.find(a => a.id === id);
    
    if (!foundArticle) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: foundArticle,
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch article',
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/articles/[id] - Update article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: Partial<UpdateArticleInput> = await request.json();
    
    // Get existing article to check if it exists
    const articles = await articleService.getAll();
    const existingArticle = articles.find(a => a.id === id);
    
    if (!existingArticle) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article not found',
        },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    // Update fields if provided
    if (body.title !== undefined) {
      updateData.title = body.title;
      // Update slug if title changed
      const newSlug = slugify(body.title);
      if (newSlug !== existingArticle.slug) {
        // Check if new slug already exists
        const slugExists = await articleService.getBySlug(newSlug);
        if (slugExists && slugExists.id !== id) {
          return NextResponse.json(
            {
              success: false,
              error: 'An article with this title already exists',
            },
            { status: 400 }
          );
        }
        updateData.slug = newSlug;
      }
    }

    if (body.content !== undefined) {
      updateData.content = body.content;
      // Recalculate reading time
      const wordCount = body.content.split(/\s+/).length;
      updateData.readingTime = Math.ceil(wordCount / 200);
    }

    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.featuredImage !== undefined) updateData.featuredImage = body.featuredImage;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.metaTitle !== undefined) updateData.metaTitle = body.metaTitle;
    if (body.metaDescription !== undefined) updateData.metaDescription = body.metaDescription;

    // Handle status change
    if (body.status !== undefined) {
      updateData.status = body.status;
      
      // Set publishedAt when publishing for the first time
      if (body.status === 'published' && existingArticle.status !== 'published') {
        updateData.publishedAt = serverTimestamp();
      }
      // Clear publishedAt when unpublishing
      else if (body.status !== 'published' && existingArticle.status === 'published') {
        updateData.publishedAt = null;
      }
    }

    await articleService.update(id, updateData);
    
    return NextResponse.json({
      success: true,
      message: 'Article updated successfully',
    });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update article',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/articles/[id] - Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if article exists
    const articles = await articleService.getAll();
    const existingArticle = articles.find(a => a.id === id);
    
    if (!existingArticle) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article not found',
        },
        { status: 404 }
      );
    }

    await articleService.delete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete article',
      },
      { status: 500 }
    );
  }
}