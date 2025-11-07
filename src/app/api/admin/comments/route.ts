import { NextRequest, NextResponse } from 'next/server';
import { commentService } from '@/lib/firestore';
import { verifyAuth } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyAuth();
    if (!decodedToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null;
    const articleId = searchParams.get('articleId');

    let comments;
    
    if (articleId) {
      // Get all comments for a specific article (regardless of status)
      comments = await commentService.getAllForArticle(articleId);
    } else if (status) {
      // Get comments by status
      comments = await commentService.getByStatus(status);
    } else {
      // Get all pending comments by default
      comments = await commentService.getAllPending();
    }

    return NextResponse.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Error fetching admin comments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}