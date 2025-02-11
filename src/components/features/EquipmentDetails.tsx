import { Sun, Battery, Minus, Plus, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'

interface EquipmentDetailsProps {
  packageType: 'standard' | 'premium'
  includeBattery: boolean
  batteryCount: number
  selectedBattery: 'franklin' | 'qcell'
  onBatteryChange: (include: boolean) => void
  onBatteryCountChange: (count: number) => void
  onBatteryTypeChange: (type: 'franklin' | 'qcell') => void
}

const batteryOptions = {
  franklin: {
    name: 'Franklin WH5000',
    price: 8500,
    capacity: '5 kWh',
    description: 'High-performance home battery system with advanced energy management',
  },
  qcell: {
    name: 'Q.HOME ESS HYB-G3',
    price: 9200,
    capacity: '6 kWh',
    description: 'Premium energy storage solution with intelligent power management',
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const equipmentDetails = {
  standard: {
    panels: {
      name: 'Q CELLS Q.PEAK DUO BLK ML-G10+',
      image: '/images/qcell-panel.jpg',
      details: [
        '400W output per panel',
        'Sleek all-black design',
        '20.4% efficiency',
        'Advanced weather resistance',
      ]
    },
    inverter: {
      name: 'Enphase IQ8+',
      image: '/images/enphase-inverter.jpg',
      details: [
        'Microinverter system',
        'Per-panel optimization',
        'Built-in rapid shutdown',
        'Real-time monitoring',
      ]
    }
  },
  premium: {
    panels: {
      name: 'REC Alpha Pure-R',
      image: '/images/rec-panel.jpg',
      details: [
        '430W output per panel',
        'Premium all-black design',
        '22.3% efficiency',
        'Advanced cell technology',
        'Superior low-light performance',
      ]
    },
    inverter: {
      name: 'Enphase IQ8M+',
      image: '/images/enphase-inverter.jpg',
      details: [
        'Advanced microinverter system',
        'Higher power handling',
        'Enhanced performance monitoring',
        'Built-in rapid shutdown',
        'Future battery ready',
      ]
    }
  }
} as const

const backupGuide = {
  supported: [
    'Lights & Plugs',
    'Gas Appliances',
    'Microwave & Fridge',
    'Electric Oven'
  ],
  partial: [
    'Air Conditioner',
    'Electric Dryer',
    'EV Charger'
  ],
  unsupported: [
    'Dishwasher',
    'Electric Water Heater',
    'Water & Well Pumps',
    '2nd Air Conditioner'
  ]
}

export function EquipmentDetails({ 
  packageType = 'standard',
  includeBattery,
  batteryCount,
  selectedBattery,
  onBatteryChange,
  onBatteryCountChange,
  onBatteryTypeChange
}: EquipmentDetailsProps) {
  const equipment = equipmentDetails[packageType] || equipmentDetails.standard
  const [imageLoadError, setImageLoadError] = useState<{[key: string]: boolean}>({})
  const [currentGuideSection, setCurrentGuideSection] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleImageError = (imageKey: string) => {
    setImageLoadError(prev => ({ ...prev, [imageKey]: true }))
  }

  const adjustBatteryCount = (increment: boolean) => {
    const newCount = increment ? batteryCount + 1 : batteryCount - 1
    const clampedCount = Math.min(Math.max(1, newCount), 3) // Clamp between 1 and 3
    onBatteryCountChange(clampedCount)
  }

  const guideSections = [
    {
      title: 'Supported',
      items: backupGuide.supported,
      color: 'green'
    },
    {
      title: 'Partial Support',
      items: backupGuide.partial,
      color: 'yellow'
    },
    {
      title: 'Not Supported',
      items: backupGuide.unsupported,
      color: 'red'
    }
  ]

  const nextGuideSection = () => {
    setCurrentGuideSection((prev) => (prev + 1) % guideSections.length)
  }

  const prevGuideSection = () => {
    setCurrentGuideSection((prev) => (prev - 1 + guideSections.length) % guideSections.length)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Your Equipment</h2>
      
      {/* Battery Section */}
      <div className="mb-12 border-b pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Battery className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Add Battery</h3>
              <p className="text-sm text-gray-600">Add a battery to store energy for off peak usage.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={includeBattery}
                onChange={(e) => onBatteryChange(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {includeBattery && (
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-900">Number of batteries</label>
              <p className="text-sm text-gray-600">Maximum of three batteries per location.</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => adjustBatteryCount(false)}
                  disabled={batteryCount <= 1}
                  className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-8 text-center font-medium">{batteryCount}</span>
                <button
                  onClick={() => adjustBatteryCount(true)}
                  disabled={batteryCount >= 3}
                  className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="font-medium text-gray-900">Battery type</label>
                <span className="text-blue-600 font-medium">
                  {formatCurrency(batteryOptions[selectedBattery].price * batteryCount)}
                </span>
              </div>
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-6">
                <Image
                  src="/franklin.png"
                  alt="Franklin Home Power Battery"
                  fill
                  style={{ objectFit: 'contain', padding: '16px' }}
                  priority
                  onError={() => handleImageError('battery')}
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h4 className="font-medium text-gray-900 mb-4">Backup Guide</h4>
              
              {/* Desktop View */}
              <div className="hidden md:grid md:grid-cols-3 gap-6">
                {guideSections.map((section, index) => (
                  <div key={index}>
                    <h5 className="text-sm font-medium text-gray-900 mb-3">{section.title}</h5>
                    <ul className="space-y-2">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center gap-2 text-sm text-gray-600">
                          {section.color === 'green' ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <span className={`w-4 h-4 rounded-full border-2 border-${section.color}-500`} />
                          )}
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Mobile Carousel */}
              <div className="md:hidden">
                <div className="relative">
                  <div className="overflow-hidden">
                    <div className="transition-transform duration-300 ease-in-out">
                      <div key={currentGuideSection} className="px-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-3">
                          {guideSections[currentGuideSection].title}
                        </h5>
                        <ul className="space-y-2">
                          {guideSections[currentGuideSection].items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-center gap-2 text-sm text-gray-600">
                              {guideSections[currentGuideSection].color === 'green' ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <span className={`w-4 h-4 rounded-full border-2 border-${guideSections[currentGuideSection].color}-500`} />
                              )}
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Dots */}
                  <div className="flex justify-center items-center gap-2 mt-4">
                    {guideSections.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentGuideSection(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          currentGuideSection === index ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Navigation Arrows */}
                  <button
                    onClick={prevGuideSection}
                    className="absolute left-0 top-1/2 -translate-y-1/2 p-1 bg-white rounded-full shadow-md"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={nextGuideSection}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 bg-white rounded-full shadow-md"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Solar Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Solar Panels */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Sun className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="font-semibold text-gray-900">Solar Panels</h3>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-2">{equipment?.panels?.name || 'Standard Solar Panel'}</p>
                <ul className="space-y-2">
                  {equipment?.panels?.details?.map((detail, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
              {!imageLoadError['panels'] && equipment?.panels?.image && (
                <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                  <Image
                    src={equipment.panels.image}
                    alt={equipment.panels.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 192px"
                    style={{ objectFit: 'contain', padding: '8px' }}
                    priority
                    onError={() => handleImageError('panels')}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Inverter */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Battery className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="font-semibold text-gray-900">Inverter System</h3>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-2">{equipment?.inverter?.name || 'Standard Inverter'}</p>
                <ul className="space-y-2">
                  {equipment?.inverter?.details?.map((detail, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
              {!imageLoadError['inverter'] && equipment?.inverter?.image && (
                <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                  <Image
                    src={equipment.inverter.image}
                    alt={equipment.inverter.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 192px"
                    style={{ objectFit: 'contain', padding: '8px' }}
                    priority
                    onError={() => handleImageError('inverter')}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 