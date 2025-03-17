import { ClipboardCheck, Ruler, FileCheck, FileText, Wrench, Zap, Check } from 'lucide-react'
import { useState, useEffect } from 'react'

const steps = [
  {
    title: 'Place Order',
    description: 'Submit your order to begin your solar journey',
    icon: ClipboardCheck,
    active: true,
    completed: false
  },
  {
    title: 'Final Design',
    description: 'Our engineers create a detailed design for your approval',
    icon: Ruler,
    active: false,
    completed: false
  },
  {
    title: 'Design Approval',
    description: 'Review and approve your custom solar system design',
    icon: FileCheck,
    active: false,
    completed: false
  },
  {
    title: 'Permitting',
    description: 'We handle all necessary permits and documentation',
    icon: FileText,
    active: false,
    completed: false
  },
  {
    title: 'Installation',
    description: 'Professional installation by our certified team',
    icon: Wrench,
    active: false,
    completed: false
  },
  {
    title: 'System Activation',
    description: 'Final inspection and system power-on',
    icon: Zap,
    active: false,
    completed: false
  },
]

export function InstallationRoadmap() {
  const [activeStep] = useState(0) // In a real app, this would be dynamic based on the user's progress
  const [isPulsing, setIsPulsing] = useState(true)

  // Create a pulsing effect for the active step
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(prev => !prev)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gradient-to-b from-white to-sky-50 rounded-2xl shadow-lg border border-sky-100 p-6 sm:p-8 md:p-10 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #0284c7 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="relative">
        {/* Horizontal progress line for desktop */}
        <div className="hidden md:block absolute top-[60px] left-0 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full shadow-sm"
            style={{ width: `${(activeStep / (steps.length - 1)) * 100}%`, transition: 'width 1s ease-in-out' }}
          />
        </div>

        {/* Vertical progress line for mobile */}
        <div className="md:hidden absolute top-0 bottom-0 left-8 w-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full bg-gradient-to-b from-sky-400 to-sky-600 rounded-full shadow-sm"
            style={{ height: `${(activeStep / (steps.length - 1)) * 100}%`, transition: 'height 1s ease-in-out' }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8 md:gap-10 lg:gap-12">
          {steps.map((step, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;
            const isUpcoming = index > activeStep;

            return (
              <div
                key={step.title}
                className={`relative group animate-fade-in-up opacity-0 transition-all duration-300 hover:translate-y-[-2px]`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Mobile layout container */}
                <div className="flex md:block items-center gap-6 md:gap-0">
                  {/* Icon Circle - Mobile & Desktop */}
                  <div className="relative flex-shrink-0 flex justify-center items-center w-16 h-16 sm:w-20 sm:h-20 md:mx-auto">
                    {/* Pulsing effect for active step */}
                    {isActive && (
                      <div
                        className={`absolute inset-[-8px] rounded-full transition-opacity duration-1000 ${isPulsing ? 'opacity-100' : 'opacity-30'}`}
                        style={{
                          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.3) 0%, rgba(14, 165, 233, 0) 70%)'
                        }}
                      ></div>
                    )}

                    {/* Background ring */}
                    <div
                      className={`absolute inset-0 rounded-full transition-all duration-500 ${isActive
                        ? 'bg-sky-100 border-2 border-sky-300 scale-110'
                        : isCompleted
                          ? 'bg-sky-50 border-2 border-sky-200'
                          : 'bg-gray-50 border-2 border-gray-200 group-hover:border-gray-300'
                        }`}
                    />

                    {/* Icon container */}
                    <div
                      className={`absolute inset-0 m-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-500 ${isActive
                        ? 'bg-white shadow-md scale-105'
                        : isCompleted
                          ? 'bg-sky-500 shadow-sm'
                          : 'bg-white shadow-sm group-hover:shadow-md'
                        }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      ) : (
                        <step.icon
                          className={`w-6 h-6 sm:w-8 sm:h-8 transition-colors ${isActive
                            ? 'text-sky-600'
                            : isUpcoming
                              ? 'text-gray-500 group-hover:text-gray-700'
                              : 'text-gray-600'
                            }`}
                        />
                      )}
                    </div>

                    {/* Connector dots for desktop */}
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 left-[calc(100%+1rem)] right-0 h-0.5">
                        <div className="w-full flex justify-between items-center">
                          <div className={`w-1 h-1 rounded-full ${isCompleted ? 'bg-sky-400' : 'bg-gray-300'}`}></div>
                          <div className={`w-1 h-1 rounded-full ${isCompleted ? 'bg-sky-400' : 'bg-gray-300'}`}></div>
                          <div className={`w-1 h-1 rounded-full ${isCompleted ? 'bg-sky-400' : 'bg-gray-300'}`}></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 md:text-center mt-0 md:mt-6">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 transition-colors ${isActive
                        ? 'bg-sky-100 text-sky-700'
                        : isCompleted
                          ? 'bg-sky-50 text-sky-600'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                        }`}
                    >
                      Step {index + 1}
                    </span>
                    <h3
                      className={`text-base sm:text-lg font-semibold mb-2 transition-colors ${isActive
                        ? 'text-sky-900'
                        : isCompleted
                          ? 'text-sky-800'
                          : 'text-gray-700 group-hover:text-gray-900'
                        }`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`text-sm md:max-w-[250px] md:mx-auto transition-colors ${isActive
                        ? 'text-gray-700'
                        : isCompleted
                          ? 'text-gray-600'
                          : 'text-gray-500 group-hover:text-gray-600'
                        }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
} 