'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

interface OrderStatus {
  id: string
  status: string
  package_type: string
  system_size: number
  created_at: string
  current_step: string
  next_appointment?: {
    type: string
    date: string
  }
  estimated_completion?: string
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  scheduled: 'bg-purple-100 text-purple-800',
}

const statusIcons = {
  pending: Clock,
  in_progress: Loader2,
  completed: CheckCircle2,
  scheduled: AlertCircle,
}

export function OrderDashboard({ userId }: { userId: string }) {
  const [order, setOrder] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrderStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('proposals')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (error) throw error

        if (data) {
          setOrder({
            ...data,
            current_step: data.status || 'pending',
            next_appointment: data.next_appointment || null,
            estimated_completion: data.estimated_completion || null,
          })
        }
      } catch (error) {
        console.error('Error loading order status:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrderStatus()
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">No Active Orders</h2>
        <p className="text-gray-600">
          You don't have any active orders yet. Start by creating a proposal!
        </p>
      </div>
    )
  }

  const StatusIcon = statusIcons[order.current_step as keyof typeof statusIcons] || Clock
  const statusColorClass = statusColors[order.current_step as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Your Solar Installation</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColorClass}`}>
          {order.current_step.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Package Type</h3>
            <p className="mt-1 text-lg">{order.package_type}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">System Size</h3>
            <p className="mt-1 text-lg">{order.system_size} kW</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Order Date</h3>
            <p className="mt-1 text-lg">{format(new Date(order.created_at), 'MMM d, yyyy')}</p>
          </div>
        </div>

        <div className="space-y-4">
          {order.next_appointment && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800">Next Appointment</h3>
              <div className="mt-2">
                <p className="text-blue-900">{order.next_appointment.type}</p>
                <p className="text-blue-700">{format(new Date(order.next_appointment.date), 'MMM d, yyyy - h:mm a')}</p>
              </div>
            </div>
          )}
          
          {order.estimated_completion && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">Estimated Completion</h3>
              <p className="mt-2 text-green-900">{format(new Date(order.estimated_completion), 'MMM d, yyyy')}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Installation Progress</h3>
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-between">
            {['proposal', 'site_survey', 'permit', 'installation', 'activation'].map((step, idx) => {
              const isCompleted = getStepStatus(order.current_step, step) === 'completed'
              const isCurrent = getStepStatus(order.current_step, step) === 'current'
              
              return (
                <div key={step} className="flex flex-col items-center">
                  <div className={`
                    relative w-8 h-8 flex items-center justify-center rounded-full
                    ${isCompleted ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-gray-200'}
                  `}>
                    <CheckCircle2 className={`w-5 h-5 ${isCompleted || isCurrent ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <p className="mt-2 text-xs font-medium text-gray-500">
                    {step.replace('_', ' ').charAt(0).toUpperCase() + step.slice(1)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function getStepStatus(currentStep: string, step: string) {
  const steps = ['proposal', 'site_survey', 'permit', 'installation', 'activation']
  const currentIdx = steps.indexOf(currentStep)
  const stepIdx = steps.indexOf(step)
  
  if (stepIdx < currentIdx) return 'completed'
  if (stepIdx === currentIdx) return 'current'
  return 'upcoming'
} 