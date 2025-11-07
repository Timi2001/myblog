import { NextRequest, NextResponse } from 'next/server';
import { getDocs, query, orderBy, limit, where, deleteDoc, doc } from 'firebase/firestore';
import { subscribersCollection } from '@/lib/firestore-collections';
import { verifyAuth } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const decodedToken = await verifyAuth();
    if (!decodedToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') as 'active' | 'unsubscribed' | null;

    // Build query
    let subscriberQuery = query(subscribersCollection);

    // Add status filter if provided
    if (status) {
      subscriberQuery = query(
        subscribersCollection,
        where('status', '==', status),
        orderBy('subscribedAt', 'desc')
      );
    } else {
      subscriberQuery = query(
        subscribersCollection,
        orderBy('subscribedAt', 'desc')
      );
    }

    // Add pagination
    if (page > 1) {
      // For proper pagination, we'd need to implement cursor-based pagination
      // For now, we'll use a simple limit approach
      subscriberQuery = query(
        subscriberQuery,
        limit(pageSize * page)
      );
    } else {
      subscriberQuery = query(
        subscriberQuery,
        limit(pageSize)
      );
    }

    const subscribersSnapshot = await getDocs(subscriberQuery);
    const subscribers = subscribersSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));

    // If we're on a page > 1, slice to get only the current page
    const startIndex = page > 1 ? (page - 1) * pageSize : 0;
    const paginatedSubscribers = page > 1 
      ? subscribers.slice(startIndex, startIndex + pageSize)
      : subscribers;

    // Get total count for pagination info
    const totalQuery = status 
      ? query(subscribersCollection, where('status', '==', status))
      : subscribersCollection;
    const totalSnapshot = await getDocs(totalQuery);
    const totalCount = totalSnapshot.size;

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      success: true,
      data: {
        subscribers: paginatedSubscribers,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          pageSize,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const decodedToken = await verifyAuth();
    if (!decodedToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const subscriberId = searchParams.get('id');

    if (!subscriberId) {
      return NextResponse.json(
        { success: false, error: 'Subscriber ID is required' },
        { status: 400 }
      );
    }

    // Delete subscriber
    const subscriberDoc = doc(subscribersCollection, subscriberId);
    await deleteDoc(subscriberDoc);

    return NextResponse.json({
      success: true,
      message: 'Subscriber deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete subscriber' },
      { status: 500 }
    );
  }
}