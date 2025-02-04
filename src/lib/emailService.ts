interface EmailData {
  to: string
  subject: string
  body: string
}

export async function sendEmail(data: EmailData) {
  // In a real application, you would integrate with an email service provider
  // like SendGrid, AWS SES, or similar
  
  // This is a mock implementation
  console.log('Sending email:', {
    to: data.to,
    subject: data.subject,
    body: data.body
  })

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))

  return {
    success: true,
    messageId: `mock_${Date.now()}`
  }
}

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