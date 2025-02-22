'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronRight, Sun, Battery, DollarSign, Calendar, ArrowRight, Loader2, PlusCircle, FileText, MessageCircle, X, ClipboardCheck, Check, Camera, PencilRuler, Wrench } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import ProjectDocuments from '@/components/features/ProjectDocuments'
import SendMessage from '@/components/features/SendMessage'
import { motion, AnimatePresence } from 'framer-motion'
import SiteSurveyStatus from '@/components/features/SiteSurveyStatus'

interface Proposal {
  id: string
  user_id: string
  address: string
  system_size: number
  number_of_panels: number
  total_price: number
  package_type: string
  payment_type: string
  include_battery: boolean
  battery_type?: string
  battery_count?: number
  status: string
  stage: string
  notes?: string
  created_at: string
  status_updated_at?: string
}

interface Profile {
  id: string
  full_name: string
  email: string
  is_admin: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Define stages array once at the component level
  const stages = ['proposal', 'site_survey', 'design', 'permitting', 'installation', 'completed'] as const

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      console.log('Checking user session...')
      setError(null)

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('Session error:', sessionError)
        throw sessionError
      }

      if (!session) {
        console.log('No session found, redirecting to login...')
        router.push('/login')
        return
      }

      setUser(session.user)

      // Create or update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        })

      if (profileError) {
        console.error('Profile error:', profileError)
        // Don't throw the error, try to fetch the profile anyway
        console.log('Attempting to fetch profile despite upsert error...')
      }

      // Fetch user profile
      const { data: profileData, error: profileFetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileFetchError) {
        console.error('Profile fetch error:', profileFetchError)
        throw profileFetchError
      }

      if (!profileData) {
        throw new Error('Profile not found')
      }
      setProfile(profileData)

      await loadProposals(session.user.id)
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to load user data')
      toast.error('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  async function loadProposals(userId: string) {
    try {
      // First attempt to load proposals
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // If no proposals found and we came from a proposal creation
      if (!data?.length && window.location.href.includes('returnUrl=/order/proposal')) {
        console.log('No proposals found on first try, retrying...')

        // Wait a moment and try again
        await new Promise(resolve => setTimeout(resolve, 1000))

        const { data: retryData, error: retryError } = await supabase
          .from('proposals')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (retryError) throw retryError

        if (!retryData?.length) {
          console.log('Still no proposals found after retry')
        } else {
          console.log('Proposals found after retry:', retryData.length)
        }

        setProposals(retryData || [])

        // Set the first active proposal as selected for documents
        const activeProposal = retryData?.find(p => p.status !== 'cancelled' && p.status !== 'completed')
        if (activeProposal) {
          setSelectedProposal(activeProposal.id)
        }
      } else {
        setProposals(data || [])

        // Set the first active proposal as selected for documents
        const activeProposal = data?.find(p => p.status !== 'cancelled' && p.status !== 'completed')
        if (activeProposal) {
          setSelectedProposal(activeProposal.id)
        }
      }
    } catch (error) {
      console.error('Error loading proposals:', error)
      toast.error('Failed to load proposals')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0A0A0A]">
        <div className="rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
      </div>
    )
  }

  const activeProposal = proposals.find(p => p.id === selectedProposal)

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative">
      {/* Hero Section with Solar House */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-[500px] sm:min-h-[600px] w-full overflow-hidden bg-[#0A0A0A]"
      >
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-5" />
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent"
          />
        </div>

        {/* Welcome Text */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 pt-32 sm:pt-36 px-6 md:px-16 lg:px-24 text-center md:text-left"
        >
          <div className="max-w-xl mx-auto md:mx-0">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-white"
            >
              Welcome, {profile?.full_name || 'there'}
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-300"
            >
              Powering your future with clean energy
            </motion.p>
          </div>
        </motion.div>

        {/* Solar House Image Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative mt-12 md:mt-16 mx-auto max-w-[110%] sm:max-w-[95%] md:max-w-[85%] lg:max-w-[75%] aspect-[16/9] mb-0 sm:mb-[-4rem] md:mb-[-6rem]"
        >
          {/* Pulsing Energy Glow */}
          <motion.div
            animate={{
              scale: [1, 1.03, 1],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -inset-16 bg-blue-500/30 blur-[100px] rounded-[50px] scale-y-150"
          />

          {/* Secondary Glow */}
          <motion.div
            animate={{
              scale: [1.02, 1, 1.02],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute -inset-8 bg-sky-400/25 blur-[80px] rounded-[40px] scale-y-125"
          />

          {/* Image */}
          <div className="relative z-10 w-full h-full">
            <Image
              src="/images/vecteezy_modern-home-with-solar-panels-ready-for-use-in-mockups_53349884.png"
              alt="Modern Solar Home"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>

          {/* Bottom Gradient Fade */}
          <div className="absolute -bottom-32 left-0 right-0 h-80 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/85 to-transparent z-20" />
        </motion.div>

        {/* System Information */}
        {activeProposal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="relative z-30 mx-auto px-4 -mt-8 sm:-mt-12 max-w-3xl"
          >
            <div className="bg-[#111111]/90 backdrop-blur-md border border-gray-800/50 rounded-2xl p-6 shadow-2xl">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {/* System Size */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sun className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">System Size</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-bold text-white">{activeProposal.system_size}</p>
                    <p className="text-sm text-gray-400">kW</p>
                  </div>
                </div>

                {/* Total Investment */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-400" strokeWidth={1.5} />
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Investment</p>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatCurrency(activeProposal.total_price)}</p>
                </div>

                {/* Panels */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Battery className="w-4 h-4 text-purple-400" strokeWidth={1.5} />
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Panels</p>
                  </div>
                  <p className="text-2xl font-bold text-white">{activeProposal.number_of_panels}</p>
                </div>

                {/* Stage */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Stage</p>
                  </div>
                  <p className="text-2xl font-bold text-white capitalize">{activeProposal.stage.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Solar Journey Timeline */}
        {activeProposal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="relative z-30 mx-auto px-4 mt-8 max-w-4xl"
          >
            <div className="bg-[#111111]/90 backdrop-blur-md border border-gray-800/50 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-semibold text-white">Solar Journey Progress</h3>
                <div className="text-sm text-blue-400">
                  Stage {stages.indexOf(activeProposal.stage) + 1} of {stages.length}
                </div>
              </div>

              <div className="relative">
                {/* Main Timeline Track */}
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-800/50 transform -translate-y-1/2">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-blue-400/20 to-blue-500/20" />
                </div>

                {/* Progress Bar */}
                <div
                  className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-blue-500 to-blue-400 transform -translate-y-1/2 transition-all duration-700 ease-in-out"
                  style={{
                    width: `${Math.max((stages.indexOf(activeProposal.stage) + 1) * (100 / stages.length), 16.67)}%`
                  }}
                >
                  <div className="absolute right-0 top-1/2 w-3 h-3 bg-blue-400 rounded-full transform -translate-y-1/2 translate-x-1/2 shadow-lg shadow-blue-500/50" />
                </div>

                {/* Timeline Steps */}
                <div className="relative grid grid-cols-6 gap-4">
                  {[
                    { stage: 'proposal', icon: FileText, label: 'Proposal' },
                    { stage: 'site_survey', icon: Camera, label: 'Site Survey' },
                    { stage: 'design', icon: PencilRuler, label: 'Design' },
                    { stage: 'permitting', icon: ClipboardCheck, label: 'Permits' },
                    { stage: 'installation', icon: Wrench, label: 'Installation' },
                    { stage: 'completed', icon: Check, label: 'Complete' }
                  ].map((item, index) => (
                    <motion.div
                      key={item.stage}
                      className="flex flex-col items-center"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <motion.div
                        className={`
                          relative w-10 h-10 rounded-full flex items-center justify-center
                          transition-all duration-300 cursor-pointer
                          ${activeProposal.stage === item.stage ? 'bg-blue-500 text-white' :
                            index <= stages.indexOf(activeProposal.stage) ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-800/30 text-gray-500'}
                          ${index <= stages.indexOf(activeProposal.stage) ? 'border-2 border-blue-500/50' : 'border-2 border-gray-700'}
                          group hover:bg-blue-500/30 hover:border-blue-400
                        `}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <item.icon className="w-4 h-4" />

                        {/* Hover Card */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                          <div className="bg-gray-900 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap">
                            {item.label}
                          </div>
                        </div>

                        {activeProposal.stage === item.stage && (
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-blue-400"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Stage Description */}
              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={activeProposal.stage}
              >
                <div className="text-blue-400 font-medium mb-2">
                  {(() => {
                    switch (activeProposal.stage) {
                      case 'proposal': return 'Initial Review';
                      case 'site_survey': return 'Property Assessment';
                      case 'design': return 'System Planning';
                      case 'permitting': return 'Permit Approvals';
                      case 'installation': return 'System Installation';
                      case 'completed': return 'Project Complete';
                      default: return '';
                    }
                  })()}
                </div>
                <p className="text-gray-400 text-sm">
                  {(() => {
                    switch (activeProposal.stage) {
                      case 'proposal': return 'We are reviewing your initial proposal and preparing for the next steps.';
                      case 'site_survey': return 'Our team will assess your property and take necessary measurements.';
                      case 'design': return 'Creating a custom solar system design for your home.';
                      case 'permitting': return 'Obtaining necessary permits and approvals from local authorities.';
                      case 'installation': return 'Installing and testing your solar system components.';
                      case 'completed': return 'Your solar system is fully operational and producing clean energy!';
                      default: return '';
                    }
                  })()}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 pt-8 pb-8 relative z-10"
      >
        {proposals.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="bg-[#111111] rounded-xl shadow-xl p-8 text-center border border-gray-800"
          >
            <h2 className="text-2xl font-semibold mb-4 text-white">Start Your Solar Journey</h2>
            <p className="text-gray-300 mb-6">
              Begin your transition to clean energy by creating your first solar project.
            </p>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/order"
                className="inline-flex items-center px-6 py-3 bg-white text-black rounded-lg font-medium transition-colors hover:bg-gray-200"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Create Your First Project
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Project List */}
              <motion.div variants={itemVariants} className="space-y-6">
                {proposals.map((proposal) => (
                  <motion.div
                    key={proposal.id}
                    layoutId={proposal.id}
                    onClick={() => setSelectedProposal(proposal.id)}
                    whileHover={{ scale: 1.01 }}
                    className={`bg-[#111111] rounded-xl shadow-xl p-8 cursor-pointer transition-colors border border-gray-800 relative
                      ${selectedProposal === proposal.id ? 'ring-2 ring-white' : 'hover:bg-[#151515]'}`}
                  >
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-2 text-white">{proposal.address}</h2>
                      <p className="text-sm text-gray-400">
                        Created on {new Date(proposal.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Site Survey Status */}
                    <div className="mb-6">
                      <SiteSurveyStatus proposalId={proposal.id} />
                    </div>

                    <div className="flex items-center gap-4 mb-12">
                      <div className={`px-4 py-1.5 rounded-full text-sm font-medium
                        ${proposal.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          proposal.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                            proposal.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                              'bg-gray-500/20 text-gray-400'}`}
                      >
                        {proposal.status.replace('_', ' ')}
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-sm font-medium
                        ${proposal.stage === 'completed' ? 'bg-green-500/20 text-green-400' :
                          proposal.stage === 'installation' ? 'bg-purple-500/20 text-purple-400' :
                            proposal.stage === 'permitting' ? 'bg-yellow-500/20 text-yellow-400' :
                              proposal.stage === 'design' ? 'bg-indigo-500/20 text-indigo-400' :
                                'bg-gray-500/20 text-gray-400'}`}
                      >
                        {proposal.stage.replace('_', ' ')}
                      </div>
                    </div>

                    <Link
                      href={`/proposals/${proposal.id}`}
                      className="absolute bottom-8 right-8 inline-flex items-center px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-lg text-sm font-medium transition-all border border-white/10 hover:border-white/20 backdrop-blur-sm group"
                    >
                      <span className="hidden sm:inline">View </span>Details
                      <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Sidebar */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="bg-[#111111] rounded-xl shadow-xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold mb-4 text-white">Project Documents</h2>
                {selectedProposal ? (
                  <ProjectDocuments proposalId={selectedProposal} isAdmin={false} />
                ) : (
                  <p className="text-center text-gray-300 py-4">
                    Select a project to view documents
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 bg-white text-black p-4 rounded-full shadow-lg transition-colors hover:bg-gray-200 z-40"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Panel Overlay */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            {/* Chat Panel */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-24 right-6 w-[380px] bg-[#111111] shadow-2xl border border-gray-800 z-50 rounded-2xl flex flex-col max-h-[600px]"
            >
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0A0A0A] rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <h3 className="text-lg font-semibold text-white">Support Chat</h3>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsChatOpen(false)}
                    className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors text-white"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Chat Content */}
              <div className="flex-1 overflow-hidden min-h-[400px] max-h-[500px]">
                {selectedProposal ? (
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto">
                      <SendMessage proposalId={selectedProposal} />
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-6">
                    <div className="text-center">
                      <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
                        <div className="bg-[#252525] rounded-full p-4 w-16 h-16 mx-auto mb-4">
                          <MessageCircle className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-white font-medium mb-2">No Project Selected</p>
                        <p className="text-white text-sm">
                          Select a project to start messaging
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Footer */}
              <div className="p-4 border-t border-gray-800 bg-[#0A0A0A] rounded-b-2xl">
                <div className="flex items-center gap-2">
                  <div className="text-sm text-white">
                    {selectedProposal ? 'Connected to support' : 'Select a project to chat'}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
} 