import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = contactSchema.parse(body);
    
    // Here you could:
    // 1. Log the contact form submission to Firestore
    // 2. Send a backup email using a server-side email service
    // 3. Perform additional validation or spam filtering
    
    // For now, we'll just validate and return success
    // The actual email sending is handled by EmailJS on the client side
    
    console.log('Contact form submission:', {
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
    });
    
  } catch (error) {
    console.error('Error processing contact form:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid form data',
          errors: error.issues,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}