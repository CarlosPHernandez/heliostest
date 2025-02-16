'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronRight, Sun, Battery, DollarSign, Calendar, ArrowRight, Loader2, PlusCircle, FileText, MessageCircle, X, ClipboardCheck, Check } from 'lucide-react'
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

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileError) throw profileError
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
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProposals(data || [])

      // Set the first active proposal as selected for documents
      const activeProposal = data?.find(p => p.status !== 'cancelled' && p.status !== 'completed')
      if (activeProposal) {
        setSelectedProposal(activeProposal.id)
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
            <div className="bg-[#111111]/90 backdrop-blur-md border border-gray-800/50 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-lg font-semibold mb-6 text-white">Your Solar Journey</h3>

              <div className="relative">
                {/* Timeline Track */}
                <div className="absolute top-[2.25rem] left-0 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                  {/* Energy Surge Base Layer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-blue-400/20 to-blue-500/20" />
                  {/* Energy Surge Pulse */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent animate-energy-surge" />
                </div>

                {/* Timeline Progress */}
                <div
                  className="absolute top-[2.25rem] left-0 h-1 overflow-hidden rounded-full transition-all duration-700 ease-in-out"
                  style={{
                    width: (() => {
                      const stages = ['design', 'permitting', 'installation', 'completed'];
                      const currentIndex = stages.indexOf(activeProposal.stage);
                      return `${Math.max((currentIndex + 1) * (100 / stages.length), 25)}%`;
                    })()
                  }}
                >
                  {/* Progress Bar with Energy Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500">
                    {/* Electric Sparks Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-spark" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-spark-delayed" />
                  </div>

                  {/* Energy Particles */}
                  <div className="absolute inset-0 opacity-50">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent animate-particle-1" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-300 via-transparent to-transparent animate-particle-2" />
                  </div>
                </div>

                {/* Timeline Steps */}
                <div className="relative grid grid-cols-4 gap-4">
                  {/* Design Stage */}
                  <div className="text-center group">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`relative w-12 h-12 mx-auto mb-2 rounded-full border-2 flex items-center justify-center transition-all duration-300
                      ${activeProposal.stage === 'design' ? 'border-blue-500 bg-blue-500/10 text-blue-400' :
                          ['permitting', 'installation', 'completed'].includes(activeProposal.stage) ? 'border-green-500 bg-green-500/10 text-green-400' :
                            'border-gray-700 bg-[#111111] text-gray-400'}`}
                    >
                      <FileText className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                      {activeProposal.stage === 'design' && (
                        <>
                          <div className="absolute -inset-1 bg-blue-500/20 rounded-full animate-pulse-slow" />
                          <div className="absolute -inset-2 bg-blue-500/10 rounded-full animate-energy-ring" />
                        </>
                      )}
                    </motion.div>
                    <div className="text-sm font-medium text-white mb-1 transition-colors group-hover:text-blue-400">Design</div>
                    <div className="text-xs text-gray-400 transition-colors group-hover:text-gray-300">System planning</div>
                  </div>

                  {/* Permitting Stage */}
                  <div className="text-center group">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`relative w-12 h-12 mx-auto mb-2 rounded-full border-2 flex items-center justify-center transition-all duration-300
                      ${activeProposal.stage === 'permitting' ? 'border-blue-500 bg-blue-500/10 text-blue-400' :
                          ['installation', 'completed'].includes(activeProposal.stage) ? 'border-green-500 bg-green-500/10 text-green-400' :
                            'border-gray-700 bg-[#111111] text-gray-400'}`}
                    >
                      <ClipboardCheck className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                      {activeProposal.stage === 'permitting' && (
                        <div className="absolute -inset-1 bg-blue-500/20 rounded-full animate-pulse-slow" />
                      )}
                    </motion.div>
                    <div className="text-sm font-medium text-white mb-1 transition-colors group-hover:text-blue-400">Permits</div>
                    <div className="text-xs text-gray-400 transition-colors group-hover:text-gray-300">Approvals</div>
                  </div>

                  {/* Installation Stage */}
                  <div className="text-center group">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`relative w-12 h-12 mx-auto mb-2 rounded-full border-2 flex items-center justify-center transition-all duration-300
                      ${activeProposal.stage === 'installation' ? 'border-blue-500 bg-blue-500/10 text-blue-400' :
                          ['completed'].includes(activeProposal.stage) ? 'border-green-500 bg-green-500/10 text-green-400' :
                            'border-gray-700 bg-[#111111] text-gray-400'}`}
                    >
                      <Sun className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                      {activeProposal.stage === 'installation' && (
                        <div className="absolute -inset-1 bg-blue-500/20 rounded-full animate-pulse-slow" />
                      )}
                    </motion.div>
                    <div className="text-sm font-medium text-white mb-1 transition-colors group-hover:text-blue-400">Installation</div>
                    <div className="text-xs text-gray-400 transition-colors group-hover:text-gray-300">Setup & testing</div>
                  </div>

                  {/* Completion Stage */}
                  <div className="text-center group">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`relative w-12 h-12 mx-auto mb-2 rounded-full border-2 flex items-center justify-center transition-all duration-300
                      ${activeProposal.stage === 'completed' ? 'border-green-500 bg-green-500/10 text-green-400' :
                          'border-gray-700 bg-[#111111] text-gray-400'}`}
                    >
                      <Check className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                      {activeProposal.stage === 'completed' && (
                        <div className="absolute -inset-1 bg-green-500/20 rounded-full animate-pulse-slow" />
                      )}
                    </motion.div>
                    <div className="text-sm font-medium text-white mb-1 transition-colors group-hover:text-blue-400">Complete</div>
                    <div className="text-xs text-gray-400 transition-colors group-hover:text-gray-300">System active</div>
                  </div>
                </div>

                {/* Add custom keyframes for animations */}
                <style jsx global>{`
                  @keyframes energy-surge {
                    0% { 
                      transform: translateX(-100%) scaleX(0.5);
                      opacity: 0;
                    }
                    50% { 
                      transform: translateX(0%) scaleX(2);
                      opacity: 1;
                    }
                    100% { 
                      transform: translateX(100%) scaleX(0.5);
                      opacity: 0;
                    }
                  }

                  @keyframes spark {
                    0% { transform: translateX(-100%) skewX(-15deg); opacity: 0; }
                    25% { transform: translateX(-20%) skewX(-15deg); opacity: 1; }
                    50% { transform: translateX(0%) skewX(-15deg); opacity: 0; }
                    75% { transform: translateX(20%) skewX(-15deg); opacity: 1; }
                    100% { transform: translateX(100%) skewX(-15deg); opacity: 0; }
                  }

                  @keyframes spark-delayed {
                    0% { transform: translateX(-100%) skewX(-15deg); opacity: 0; }
                    50% { transform: translateX(0%) skewX(-15deg); opacity: 1; }
                    100% { transform: translateX(100%) skewX(-15deg); opacity: 0; }
                  }

                  @keyframes particle-1 {
                    0% { transform: translateX(-50%) translateY(-50%) scale(0); opacity: 0; }
                    50% { transform: translateX(0%) translateY(0%) scale(1); opacity: 1; }
                    100% { transform: translateX(50%) translateY(50%) scale(0); opacity: 0; }
                  }

                  @keyframes particle-2 {
                    0% { transform: translateX(50%) translateY(50%) scale(0); opacity: 0; }
                    50% { transform: translateX(0%) translateY(0%) scale(1); opacity: 1; }
                    100% { transform: translateX(-50%) translateY(-50%) scale(0); opacity: 0; }
                  }

                  @keyframes energy-ring {
                    0% { transform: scale(0.8); opacity: 0; }
                    50% { transform: scale(1.2); opacity: 0.5; }
                    100% { transform: scale(0.8); opacity: 0; }
                  }

                  .animate-energy-surge {
                    animation: energy-surge 3s ease-in-out infinite;
                  }

                  .animate-spark {
                    animation: spark 2s ease-out infinite;
                  }

                  .animate-spark-delayed {
                    animation: spark-delayed 2s ease-out infinite;
                    animation-delay: 1s;
                  }

                  .animate-particle-1 {
                    animation: particle-1 3s ease-in-out infinite;
                  }

                  .animate-particle-2 {
                    animation: particle-2 3s ease-in-out infinite;
                    animation-delay: 1.5s;
                  }

                  .animate-energy-ring {
                    animation: energy-ring 2s ease-in-out infinite;
                  }

                  .animate-pulse-slow {
                    animation: pulse-slow 2s ease-in-out infinite;
                  }
                `}</style>
              </div>
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