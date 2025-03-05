import SMSTest from '@/components/SMSTest'

export const metadata = {
  title: 'SMS Test | Helios Nexus Admin',
  description: 'Test SMS functionality',
}

export default function SMSTestPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">SMS Test Page</h1>
      <p className="text-center mb-8 max-w-2xl mx-auto">
        Use this page to test the SMS functionality. Enter a phone number in E.164 format
        (e.g., +1234567890) and a message to send a test SMS.
      </p>
      <SMSTest />
    </div>
  )
} 