import { NextRequest, NextResponse } from 'next/server';
import { articleService, categoryService } from '@/lib/firestore';
import { Article, Category } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const categoryId = searchParams.get('categoryId');

    // Get published articles
    let articles: Article[];
    if (categoryId) {
      articles = await articleService.getByCategory(categoryId);
    } else {
      articles = await articleService.getAll('published');
    }

    // Get categories for each article
    const categories = await categoryService.getAll();
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

    // Add category info to articles
    const articlesWithCategories = articles.map(article => ({
      ...article,
      category: categoryMap.get(article.categoryId) || null
    }));

    // Implement pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedArticles = articlesWithCategories.slice(startIndex, endIndex);

    const totalCount = articlesWithCategories.length;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        articles: paginatedArticles,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}