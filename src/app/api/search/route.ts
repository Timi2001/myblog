import { NextRequest, NextResponse } from 'next/server';
import { articleService, categoryService } from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const categoryId = searchParams.get('categoryId');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Search query is required',
      }, { status: 400 });
    }

    // Get all published articles
    let articles = await articleService.getAll('published');
    
    // Filter by category if specified
    if (categoryId) {
      articles = articles.filter(article => article.categoryId === categoryId);
    }

    // Search in title and content (case-insensitive)
    const searchTerm = query.toLowerCase().trim();
    const filteredArticles = articles.filter(article => {
      const titleMatch = article.title.toLowerCase().includes(searchTerm);
      const contentMatch = article.content.toLowerCase().includes(searchTerm);
      const excerptMatch = article.excerpt?.toLowerCase().includes(searchTerm) || false;
      
      return titleMatch || contentMatch || excerptMatch;
    });

    // Get categories for each article
    const categories = await categoryService.getAll();
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

    // Add category info to articles
    const articlesWithCategories = filteredArticles.map(article => ({
      ...article,
      category: categoryMap.get(article.categoryId) || null
    }));

    // Sort by relevance (title matches first, then content matches)
    articlesWithCategories.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(searchTerm);
      const bTitle = b.title.toLowerCase().includes(searchTerm);
      
      if (aTitle && !bTitle) return -1;
      if (!aTitle && bTitle) return 1;
      
      // If both or neither have title matches, sort by date (newest first)
      const bDate = b.publishedAt || b.createdAt;
      const aDate = a.publishedAt || a.createdAt;
      
      // Handle Firestore Timestamp objects
      const bTime = bDate instanceof Timestamp ? bDate.toDate().getTime() : new Date(bDate).getTime();
      const aTime = aDate instanceof Timestamp ? aDate.toDate().getTime() : new Date(aDate).getTime();
      
      return bTime - aTime;
    });

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
        },
        query: query.trim()
      }
    });
  } catch (error) {
    console.error('Error searching articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search articles' },
      { status: 500 }
    );
  }
}