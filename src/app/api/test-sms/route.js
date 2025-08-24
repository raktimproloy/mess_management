import { sendSMS } from '../../../lib/sms';

export async function POST(request) {
  try {
    let body = {};
    
    try {
      body = await request.json();
    } catch (parseError) {
      // Handle empty or malformed JSON body
      console.log('📱 Request body is empty or malformed, using defaults');
      body = {};
    }
    
    const { message, phoneNumber } = body;

    // Default phone number if not provided
    const targetPhone = phoneNumber || '01303644935';
    
    // Default test message if not provided
    const testMessage = message || `Test SMS from Avilash Palace. Time:${new Date().toLocaleTimeString('en-US', {timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit'})}`;

    console.log(`📱 === TEST SMS DEBUG START ===`);
    console.log(`📱 Target phone: ${targetPhone}`);
    console.log(`📱 Message length: ${testMessage.length} characters`);
    console.log(`📱 Message content: ${testMessage}`);

    // Send the test SMS
    const smsResult = await sendSMS(targetPhone, testMessage);
    
    console.log(`📱 Test SMS result: ${smsResult.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`📱 === TEST SMS DEBUG END ===`);

    if (smsResult.success) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Test SMS sent successfully',
        data: {
          targetPhone,
          messageLength: testMessage.length,
          sentAt: new Date().toISOString(),
          smsResult
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: 'Test SMS failed',
        error: smsResult.message,
        data: {
          targetPhone,
          messageLength: testMessage.length,
          attemptedAt: new Date().toISOString(),
          smsResult
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('❌ Test SMS API error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Internal server error',
      error: error.message,
      data: {
        attemptedAt: new Date().toISOString()
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET() {
  try {
    return new Response(JSON.stringify({
      success: true,
      message: 'Test SMS API endpoint',
      usage: {
        method: 'POST',
        body: {
          message: 'Optional custom message (string)',
          phoneNumber: 'Optional phone number (string, defaults to 01303644935)'
        },
        example: {
          message: 'Custom test message',
          phoneNumber: '01303644935'
        }
      },
      endpoint: '/api/test-sms',
      quickTest: 'Send POST request with empty body {} to test SMS functionality'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
