import { NextRequest, NextResponse } from 'next/server';
import { query, where, getDocs, updateDoc } from 'firebase/firestore';
import { subscribersCollection } from '@/lib/firestore-collections';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Find subscriber by email
    const subscriberQuery = query(
      subscribersCollection,
      where('email', '==', email.toLowerCase().trim())
    );
    const subscriberDocs = await getDocs(subscriberQuery);

    if (subscriberDocs.empty) {
      return NextResponse.json(
        { success: false, error: 'Email not found in our system' },
        { status: 404 }
      );
    }

    // Update subscriber status to unsubscribed
    const subscriberDoc = subscriberDocs.docs[0];
    await updateDoc(subscriberDoc.ref, {
      status: 'unsubscribed'
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });

  } catch (error) {
    console.error('Newsletter unsubscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unsubscribe from newsletter' },
      { status: 500 }
    );
  }
}