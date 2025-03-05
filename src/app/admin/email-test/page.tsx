import EmailTest from '@/components/EmailTest'

export const metadata = {
  title: 'Email Test | Helios Nexus Admin',
  description: 'Test email functionality',
}

export default function EmailTestPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Email Test Page</h1>
      <p className="text-center mb-8 max-w-2xl mx-auto">
        Use this page to test the email functionality. Enter an email address, subject, and message to send a test email.
      </p>
      <EmailTest />
    </div>
  )
} 