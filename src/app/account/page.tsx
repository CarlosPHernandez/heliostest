'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Loader2, Sun, FileText, User, Settings, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface UserData {
  full_name: string
  email: string
}

interface Proposal {
  id: string
  status: string
  package_type: string
  system_size: number
  created_at: string
}

const installationSteps = [
  { key: 'saved', label: 'Proposal Saved' },
  { key: 'ordered', label: 'Order Placed' },
  { key: 'site_survey_scheduled', label: 'Site Survey Scheduled' },
  { key: 'permit_approved', label: 'Permit Approved' },
  { key: 'installation_scheduled', label: 'Installation Scheduled' },
  { key: 'system_activated', label: 'System Activated' }
]

export default function AccountPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const loadData = async () => {
      try {
        // Load user data
        setUserData({
          full_name: user.user_metadata?.full_name || 'User',
          email: user.email || ''
        })

        // Load latest proposal
        const { data: proposalData, error } = await supabase
          .from('proposals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading proposal:', error)
        }
        
        if (proposalData) {
          setProposal(proposalData)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, router])

  const getStatusIndex = (status: string) => {
    return installationSteps.findIndex(step => step.key === status)
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userData?.full_name}
          </h1>
          <p className="mt-2 text-gray-600">
            Track your solar installation progress and manage your account
          </p>
        </div>

        {/* Installation Progress */}
        {proposal && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Installation Progress</h2>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200" />
              <div 
                className="absolute top-5 left-5 h-0.5 bg-green-500 transition-all duration-500"
                style={{ 
                  width: `${(getStatusIndex(proposal.status) / (installationSteps.length - 1)) * 100}%`
                }}
              />

              {/* Status Steps */}
              <div className="relative grid grid-cols-6 gap-4">
                {installationSteps.map((step, index) => {
                  const isCompleted = getStatusIndex(proposal.status) >= index
                  const isCurrent = proposal.status === step.key

                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 
                          ${isCompleted ? 'bg-green-500' : 'bg-gray-200'} 
                          ${isCurrent ? 'ring-4 ring-green-100' : ''}`}
                      >
                        <CheckCircle2 className={`h-6 w-6 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <p className={`text-sm mt-2 text-center ${isCurrent ? 'font-medium' : ''}`}>
                        {step.label}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* System Details */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-t pt-6">
              <div>
                <p className="text-sm text-gray-600">Package Type</p>
                <p className="font-medium capitalize">{proposal.package_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">System Size</p>
                <p className="font-medium">{proposal.system_size} kW</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-medium">
                  {new Date(proposal.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/proposal"
            className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Sun className="h-6 w-6 text-gray-900" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">My Proposal</h2>
                <p className="mt-1 text-gray-600">
                  View your solar system proposal details
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/documents"
            className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-900" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
                <p className="mt-1 text-gray-600">
                  Upload and manage your documents
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/profile"
            className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Settings className="h-6 w-6 text-gray-900" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>
                <p className="mt-1 text-gray-600">
                  Update your account information
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Required Documents Section */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Required Documents
          </h2>
          <div className="bg-white border-2 border-black rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold">Upload Required Documentation</h3>
            <p className="mt-1 text-gray-600">
              Submit your utility bills and other required documents for installation
            </p>
            <Link
              href="/documents"
              className="mt-4 inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Upload Documents
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 