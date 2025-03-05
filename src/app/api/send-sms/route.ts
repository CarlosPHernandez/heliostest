import { NextResponse } from 'next/server';

// Import twilio only on the server side
import twilio from 'twilio';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Create a function to get the Twilio client
const getTwilioClient = () => {
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials are missing');
  }
  return twilio(accountSid, authToken);
};

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { to, message } = body;

    // Validate the request
    if (!to || !message) {
      return NextResponse.json(
        { success: false, error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // Validate phone number format (simple validation)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format. Must be in E.164 format (e.g., +1234567890)' },
        { status: 400 }
      );
    }

    if (!twilioPhoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Twilio phone number is missing' },
        { status: 500 }
      );
    }

    // Send the SMS
    const client = getTwilioClient();
    const twilioMessage = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });

    // Return success response
    return NextResponse.json({
      success: true,
      messageId: twilioMessage.sid
    });
  } catch (error) {
    console.error('Error sending SMS:', error);

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 