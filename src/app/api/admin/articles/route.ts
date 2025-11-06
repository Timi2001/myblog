import { NextRequest, NextResponse } from 'next/server';
import { articleService, categoryService } from '@/lib/firestore';
import { CreateArticleInput } from '@/types';
import { serverTimestamp } from 'firebase/firestore';
import { slugify } from '@/utils/slugify';

// GET /api/admin/articles - List all articles (including drafts)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'draft' | 'published' | 'archived' | null;

    const articles = await articleService.getAll(status || undefined);
    
    return NextResponse.json({
      success: true,
      data: articles,
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch articles',
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/articles - Create new article
export async function POST(request: NextRequest) {
  try {
    const body: CreateArticleInput = await request.json();
    
    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title and content are required',
        },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = slugify(body.title);
    
    // Check if slug already exists
    const existingArticle = await articleService.getBySlug(slug);
    if (existingArticle) {
      return NextResponse.json(
        {
          success: false,
          error: 'An article with this title already exists',
        },
        { status: 400 }
      );
    }

    // Calculate reading time (rough estimate: 200 words per minute)
    const wordCount = body.content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    // Create article data
    const articleData = {
      title: body.title,
      slug,
      content: body.content,
      excerpt: body.excerpt || '',
      featuredImage: body.featuredImage || '',
      categoryId: body.categoryId || '',
      tags: body.tags || [],
      status: body.status || 'draft',
      metaTitle: body.metaTitle || body.title,
      metaDescription: body.metaDescription || body.excerpt || '',
      readingTime,
      viewCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      publishedAt: body.status === 'published' ? serverTimestamp() : null,
    } as any;

    const articleId = await articleService.create(articleData);
    
    return NextResponse.json({
      success: true,
      data: { id: articleId, ...articleData },
      message: 'Article created successfully',
    });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create article',
      },
      { status: 500 }
    );
  }
}