import { sendEmail } from './emailService';
import { sendSMS, generateBookingNotificationSMS } from './smsService';
import { generateBookingNotificationEmail } from './emailService';
import { format } from 'date-fns';

interface BookingDetails {
  date: Date;
  time?: string;
  customerName: string;
  email?: string;
  phone?: string;
  panelCount: string;
  service: string;
  address?: string;
  message?: string;
}

export async function sendBookingNotifications(booking: BookingDetails) {
  try {
    console.log('Starting booking notification process for:', booking.customerName);
    console.log('Admin email target:', process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@heliosnexus.com');

    // Send email notification to admin
    const emailNotification = await generateBookingNotificationEmail(booking);
    console.log('Generated email notification:', { subject: emailNotification.subject });

    const emailResult = await sendEmail({
      to: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@heliosnexus.com',
      subject: emailNotification.subject,
      body: emailNotification.body,
      html: emailNotification.html
    });

    console.log('Email notification result:', emailResult);

    // Try to send SMS notification if Twilio is configured
    let smsResult: { success: boolean; messageId?: string; error?: string } = {
      success: false,
      error: 'SMS sending skipped'
    };

    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      console.log('Twilio is configured, attempting to send SMS');
      const formattedDate = format(booking.date, 'MMMM d, yyyy');
      const smsContent = await generateBookingNotificationSMS(
        formattedDate,
        booking.time || 'No specific time',
        booking.customerName,
        booking.panelCount
      );

      smsResult = await sendSMS({
        to: process.env.NEXT_PUBLIC_ADMIN_PHONE || '+1234567890',
        message: smsContent.message
      });

      console.log('SMS notification result:', smsResult);
    } else {
      console.log('Twilio is not configured, skipping SMS notification');
    }

    return {
      success: true,
      email: emailResult,
      sms: smsResult
    };
  } catch (error) {
    console.error('Failed to send notifications:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 