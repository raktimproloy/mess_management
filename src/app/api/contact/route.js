import { NextResponse } from 'next/server';
import { sendSMS, generateContactNotificationMessage } from '../../../lib/sms';
import { CONFIG } from '../../../lib/config';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, message } = body;

    // Validate required fields
    if (!name || !phone || !message) {
      return NextResponse.json(
        { success: false, message: 'Name, phone, and message are required' },
        { status: 400 }
      );
    }

    // Generate contact notification message for owner
    const ownerMessage = generateContactNotificationMessage(name, phone, message);
    
    // Send SMS to owner
    const smsResult = await sendSMS(CONFIG.OWNER.PHONE, ownerMessage);
    
    if (smsResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Message sent successfully! We will contact you soon.',
        data: {
          name,
          phone,
          message,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      console.error('SMS sending failed:', smsResult.message);
      // Even if SMS fails, we can still return success to user
      // but log the error for admin review
      return NextResponse.json({
        success: true,
        message: 'Message received! We will contact you soon.',
        data: {
          name,
          phone,
          message,
          timestamp: new Date().toISOString(),
          smsStatus: 'failed'
        }
      });
    }
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
