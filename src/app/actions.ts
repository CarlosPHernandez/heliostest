'use server';

import twilio from 'twilio';
import nodemailer from 'nodemailer';
import { format } from 'date-fns';

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

// Create a reusable email transporter
const getEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// SMS Actions
export async function sendSMSAction(to: string, message: string) {
  try {
    console.log('Sending SMS via server action:', {
      to,
      message
    });

    if (!twilioPhoneNumber) {
      throw new Error('Twilio phone number is missing');
    }

    const client = getTwilioClient();
    const twilioMessage = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to
    });

    return {
      success: true,
      messageId: twilioMessage.sid
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function generateBookingNotificationSMS(date: string, time: string, customerName: string, panelCount: string) {
  const timeInfo = time === 'No specific time' ? '' : ` at ${time}`;

  return {
    message: `New booking received! ${customerName} has booked a cleaning for ${panelCount} panels on ${date}${timeInfo}.`
  }
}

// Email Actions
export async function sendEmailAction(to: string, subject: string, body: string, html?: string) {
  try {
    console.log('Server action: Sending email with the following details:');
    console.log('- To:', to);
    console.log('- Subject:', subject);
    console.log('- From:', process.env.EMAIL_FROM || 'Helios Nexus <notifications@heliosnexus.com>');
    console.log('- Using SMTP server:', process.env.EMAIL_HOST);
    console.log('- Using email account:', process.env.EMAIL_USER);

    const transporter = getEmailTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Helios Nexus <notifications@heliosnexus.com>',
      to,
      subject,
      text: body,
      html: html || body.replace(/\n/g, '<br>'),
    };

    console.log('Server action: Calling nodemailer sendMail...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Server action: Email sent successfully!');
    console.log('Server action: Message ID:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Server action: Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function generateBookingNotificationEmail(booking: {
  date: Date;
  time?: string;
  customerName: string;
  email?: string;
  phone?: string;
  panelCount: string;
  service: string;
  address?: string;
  message?: string;
}) {
  const formattedDate = booking.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const timeInfo = booking.time ? `at ${booking.time}` : '';

  return {
    subject: `New Booking: ${booking.service} on ${formattedDate}`,
    body: `
A new booking has been received:

Service: ${booking.service}
Date: ${formattedDate} ${timeInfo}
Customer: ${booking.customerName}
${booking.email ? `Email: ${booking.email}` : ''}
${booking.phone ? `Phone: ${booking.phone}` : ''}
Panel Count: ${booking.panelCount}
${booking.address ? `Address: ${booking.address}` : ''}
${booking.message ? `Additional Notes: ${booking.message}` : ''}
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #000; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; border: 1px solid #ddd; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Booking Received</h1>
    </div>
    <div class="content">
      <h2>Booking Details</h2>
      <p><strong>Service:</strong> ${booking.service}</p>
      <p><strong>Date:</strong> ${formattedDate} ${timeInfo}</p>
      <p><strong>Customer:</strong> ${booking.customerName}</p>
      ${booking.email ? `<p><strong>Email:</strong> ${booking.email}</p>` : ''}
      ${booking.phone ? `<p><strong>Phone:</strong> ${booking.phone}</p>` : ''}
      <p><strong>Panel Count:</strong> ${booking.panelCount}</p>
      ${booking.address ? `<p><strong>Address:</strong> ${booking.address}</p>` : ''}
      ${booking.message ? `<p><strong>Additional Notes:</strong> ${booking.message}</p>` : ''}
    </div>
    <div class="footer">
      <p>This is an automated notification from Helios Nexus.</p>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
} 