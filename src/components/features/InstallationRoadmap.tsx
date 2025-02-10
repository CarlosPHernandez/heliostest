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
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 md:p-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-8 sm:mb-12 text-center">
        Your Solar Journey
      </h2>
      <div className="relative">
        {/* Progress Line - Hidden on mobile, shown on larger screens */}
        <div className="hidden md:block absolute top-[45px] left-0 w-full h-0.5 bg-gray-100">
          <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-gray-200 to-gray-300 animate-progress origin-left" />
        </div>

        {/* Vertical progress line for mobile */}
        <div className="md:hidden absolute top-0 bottom-0 left-[28px] w-0.5 bg-gray-100">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-200 to-gray-300 animate-progress-vertical origin-top" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div 
              key={step.title} 
              className={`relative group animate-fade-in-up opacity-0`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Mobile layout container */}
              <div className="flex md:block items-start gap-6 md:gap-0">
                {/* Icon Circle - Adjusted for mobile and desktop */}
                <div className="relative flex-shrink-0">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-[60px] h-[60px] sm:w-[90px] sm:h-[90px] bg-gray-50 rounded-full border-2 border-gray-200 group-hover:border-gray-300 transition-all duration-300" />
                  <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <step.icon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700 group-hover:text-gray-900 transition-colors duration-300" />
                  </div>
                </div>

                {/* Content - Adjusted for mobile and desktop */}
                <div className="flex-1 md:text-center mt-0 md:mt-6">
                  <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600 mb-2 md:mb-3">
                    Step {index + 1}
                  </span>
                  <h3 className="font-semibold text-gray-900 mb-1 md:mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 md:max-w-[250px] md:mx-auto">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 