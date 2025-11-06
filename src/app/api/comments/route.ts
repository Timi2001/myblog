import { NextRequest, NextResponse } from 'next/server';
import { commentService } from '@/lib/firestore';
import { CreateCommentInput } from '@/types';
import { serverTimestamp } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json(
        { success: false, error: 'Article ID is required' },
        { status: 400 }
      );
    }

    // Get approved comments for the article
    const comments = await commentService.getByArticle(articleId);

    return NextResponse.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.articleId || !body.authorName || !body.authorEmail || !body.content) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.authorEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate content length
    if (body.content.length < 10 || body.content.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Comment must be between 10 and 1000 characters' },
        { status: 400 }
      );
    }

    // Validate name length
    if (body.authorName.length < 2 || body.authorName.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Name must be between 2 and 50 characters' },
        { status: 400 }
      );
    }

    // Basic spam detection
    const spamKeywords = ['viagra', 'casino', 'lottery', 'winner', 'click here', 'free money'];
    const contentLower = body.content.toLowerCase();
    const hasSpam = spamKeywords.some(keyword => contentLower.includes(keyword));
    
    if (hasSpam) {
      return NextResponse.json(
        { success: false, error: 'Comment contains prohibited content' },
        { status: 400 }
      );
    }

    // Create comment data
    const commentData = {
      articleId: body.articleId,
      authorName: body.authorName.trim(),
      authorEmail: body.authorEmail.trim().toLowerCase(),
      content: body.content.trim(),
      status: 'pending' as const, // All comments start as pending
      createdAt: serverTimestamp() as any, // Type assertion for Firestore timestamp
    };

    // Save comment to Firestore
    const commentId = await commentService.create(body.articleId, commentData);

    return NextResponse.json({
      success: true,
      data: { id: commentId },
      message: 'Comment submitted successfully and is pending approval'
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit comment' },
      { status: 500 }
    );
  }
}