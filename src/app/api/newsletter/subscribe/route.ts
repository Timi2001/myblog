import { NextRequest, NextResponse } from 'next/server';
import { addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { subscribersCollection } from '@/lib/firestore-collections';
import { SubscribeInput, CreateSubscriberInput } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: SubscribeInput = await request.json();
    const { email } = body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubscriberQuery = query(
      subscribersCollection,
      where('email', '==', email)
    );
    const existingSubscribers = await getDocs(existingSubscriberQuery);

    if (!existingSubscribers.empty) {
      const existingSubscriber = existingSubscribers.docs[0].data();
      
      if (existingSubscriber.status === 'active') {
        return NextResponse.json(
          { success: false, error: 'Email is already subscribed' },
          { status: 409 }
        );
      }
      
      // If subscriber exists but is unsubscribed, we could reactivate them
      // For now, we'll treat it as already subscribed
      return NextResponse.json(
        { success: false, error: 'Email is already in our system' },
        { status: 409 }
      );
    }

    // Create new subscriber
    const newSubscriber: CreateSubscriberInput = {
      email: email.toLowerCase().trim(),
      status: 'active' as const,
      subscribedAt: serverTimestamp()
    };

    const docRef = await addDoc(subscribersCollection, newSubscriber);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: { id: docRef.id }
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}