import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create a reusable transporter object
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

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { to, subject, body: emailBody, html } = body;

    // Validate the request
    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { success: false, error: 'Email recipient, subject, and body are required' },
        { status: 400 }
      );
    }

    // Validate email format (simple validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Send the email
    const transporter = getEmailTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Helios Nexus <notifications@heliosnexus.com>',
      to,
      subject,
      text: emailBody,
      html: html || emailBody.replace(/\n/g, '<br>'),
    };

    const info = await transporter.sendMail(mailOptions);

    // Return success response
    return NextResponse.json({
      success: true,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('Error sending email:', error);

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