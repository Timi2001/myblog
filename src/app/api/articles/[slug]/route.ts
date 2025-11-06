import { NextRequest, NextResponse } from 'next/server';
import { articleService, categoryService, analyticsService } from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get article by slug
    const article = await articleService.getBySlug(slug);

    if (!article || article.status !== 'published') {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    // Get category information
    const category = await categoryService.getAll().then(categories =>
      categories.find(cat => cat.id === article.categoryId)
    );

    // Record page view (in a real app, you might want to debounce this)
    try {
      await analyticsService.recordPageView({
        articleId: article.id,
        timestamp: Timestamp.now(),
        userAgent: request.headers.get('user-agent') || '',
        referrer: request.headers.get('referer') || ''
      });

      // Update view count
      await articleService.update(article.id, {
        viewCount: article.viewCount + 1
      });
    } catch (analyticsError) {
      console.error('Error recording page view:', analyticsError);
      // Don't fail the request if analytics fails
    }

    return NextResponse.json({
      success: true,
      data: {
        ...article,
        category: category || null
      }
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}