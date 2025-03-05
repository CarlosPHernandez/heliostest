'use server';

import { sendSMSAction, generateBookingNotificationSMS as generateSMS } from '@/app/actions';

interface SMSData {
  to: string
  message: string
}

export async function sendSMS(data: SMSData) {
  try {
    // Use the server action to send SMS
    return await sendSMSAction(data.to, data.message);
  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Re-export the SMS generation function from the server action
export const generateBookingNotificationSMS = generateSMS; 