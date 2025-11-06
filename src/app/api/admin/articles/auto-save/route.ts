import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuthToken } from '@/lib/auth';
import { articleService } from '@/lib/firestore';
import { CreateArticleInput, UpdateArticleInput } from '@/types';
import { slugify } from '@/utils/slugify';
import { serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const isValid = await verifyAuthToken();
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Check if this is an update to an existing article/draft
    if (body.id) {
      // Update existing article
      const updateData: UpdateArticleInput = {
        id: body.id,
        title: body.title || 'Untitled Draft',
        content: body.content || '',
        excerpt: body.excerpt || '',
        featuredImage: body.featuredImage || '',
        categoryId: body.categoryId || '',
        tags: body.tags || [],
        status: body.status || 'draft',
        metaTitle: body.metaTitle || '',
        metaDescription: body.metaDescription || '',
      };

      // Calculate reading time
      const text = body.content || '';
      const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));

      const articleWithMetadata = {
        ...updateData,
        slug: slugify(updateData.title || 'untitled-draft'),
        readingTime,
        updatedAt: serverTimestamp(),
      } as any;

      await articleService.update(body.id, articleWithMetadata);

      return NextResponse.json({
        success: true,
        data: { id: body.id, ...articleWithMetadata },
        message: 'Draft auto-saved successfully',
      });
    } else {
      // Create new article
      const articleData: CreateArticleInput = {
        title: body.title || 'Untitled Draft',
        content: body.content || '',
        excerpt: body.excerpt || '',
        featuredImage: body.featuredImage || '',
        categoryId: body.categoryId || '',
        tags: body.tags || [],
        status: 'draft', // Always save as draft for auto-save
        metaTitle: body.metaTitle || '',
        metaDescription: body.metaDescription || '',
      };

      // Calculate reading time
      const text = articleData.content || '';
      const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));

      const slug = slugify(articleData.title);
      
      const articleWithMetadata = {
        ...articleData,
        slug,
        readingTime,
        viewCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as any;

      const articleId = await articleService.create(articleWithMetadata);

      return NextResponse.json({
        success: true,
        data: { id: articleId, ...articleWithMetadata },
        message: 'Draft auto-saved successfully',
      });
    }
  } catch (error) {
    console.error('Auto-save error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to auto-save draft' },
      { status: 500 }
    );
  }
}