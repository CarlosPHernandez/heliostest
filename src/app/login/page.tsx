import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import LoginForm from './login-form'

export default function LoginPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-black animate-spin mx-auto" />
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
} 