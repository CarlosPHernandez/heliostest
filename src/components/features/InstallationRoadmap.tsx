import { ClipboardCheck, Ruler, FileCheck, FileText, Wrench, Zap } from 'lucide-react'

const steps = [
  {
    title: 'Place Order',
    description: 'Submit your order and initial deposit to begin the process',
    icon: ClipboardCheck,
  },
  {
    title: 'Final Design',
    description: 'Our engineers create a detailed design for your approval',
    icon: Ruler,
  },
  {
    title: 'Design Approval',
    description: 'Review and approve your custom solar system design',
    icon: FileCheck,
  },
  {
    title: 'Permitting',
    description: 'We handle all necessary permits and documentation',
    icon: FileText,
  },
  {
    title: 'Installation',
    description: 'Professional installation by our certified team',
    icon: Wrench,
  },
  {
    title: 'System Activation',
    description: 'Final inspection and system power-on',
    icon: Zap,
  },
]

export function InstallationRoadmap() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Installation Process</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div key={step.title} className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <step.icon className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-500">Step {index + 1}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mt-1">{step.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 