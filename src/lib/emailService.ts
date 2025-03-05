import { sendEmailAction, generateBookingNotificationEmail as generateEmail } from '@/app/actions';

interface EmailData {
  to: string
  subject: string
  body: string
  html?: string
}

export async function sendEmail(data: EmailData) {
  try {
    console.log('Email service: Preparing to send email to:', data.to);
    console.log('Email service: Subject:', data.subject);

    // Use the server action to send email
    const result = await sendEmailAction(data.to, data.subject, data.body, data.html);

    console.log('Email service: Result from server action:', result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Re-export the email generation function from the server action
export const generateBookingNotificationEmail = generateEmail;

// Keep the other email generation functions for backward compatibility
export function generateStatusUpdateEmail(customerName: string, projectId: string, stage: string) {
  return {
    subject: `Project Update: ${projectId}`,
    body: `
Dear ${customerName},

We wanted to let you know that your solar installation project (${projectId}) has been updated.

Current Stage: ${stage}

You can view the full details of your project by logging into your dashboard.

Best regards,
The Helios Team
    `.trim()
  }
}

export function generateDocumentRequestEmail(customerName: string, projectId: string, documentName: string) {
  return {
    subject: `Action Required: Document Upload for Project ${projectId}`,
    body: `
Dear ${customerName},

We need your help to keep your solar installation project moving forward. Please upload the following document at your earliest convenience:

Required Document: ${documentName}

You can upload this document by logging into your dashboard and navigating to the Documents section.

If you have any questions, please don't hesitate to contact us.

Best regards,
The Helios Team
    `.trim()
  }
} 