import { Sun, Battery, Minus, Plus, Check } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

interface EquipmentDetailsProps {
  packageType: 'standard' | 'premium'
}

const equipmentDetails = {
  standard: {
    panels: {
      name: 'Q CELLS Q.PEAK DUO BLK ML-G10+',
      image: '/qcell panel.jpg',
      details: [
        '400W output per panel',
        'Sleek all-black design',
        '20.4% efficiency',
        'Advanced weather resistance',
      ]
    },
    inverter: {
      name: 'Enphase IQ8+',
      image: '/enphase.webp',
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
      image: '/RecPanel.png',
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
      image: '/enphase.webp',
      details: [
        'Advanced microinverter system',
        'Higher power handling',
        'Enhanced performance monitoring',
        'Built-in rapid shutdown',
        'Future battery ready',
      ]
    }
  }
}

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

export function EquipmentDetails({ packageType }: EquipmentDetailsProps) {
  const equipment = equipmentDetails[packageType]
  const [imageLoadError, setImageLoadError] = useState<{[key: string]: boolean}>({})
  const [includeBattery, setIncludeBattery] = useState(false)
  const [batteryCount, setBatteryCount] = useState(1)

  const handleImageError = (imageKey: string) => {
    setImageLoadError(prev => ({ ...prev, [imageKey]: true }))
  }

  const adjustBatteryCount = (increment: boolean) => {
    setBatteryCount(prev => {
      const newCount = increment ? prev + 1 : prev - 1
      return Math.min(Math.max(1, newCount), 3) // Clamp between 1 and 3
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Your Equipment</h2>
      
      {/* Battery Section */}
      <div className="mb-12 border-b pb-8">
        <div className="flex items-center justify-between mb-6">
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
                onChange={() => setIncludeBattery(!includeBattery)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {includeBattery && (
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-900">Number batteries</label>
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
                <span className="text-blue-600 font-medium">$15,931</span>
              </div>
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-6">
                <Image
                  src="/RecPanel.png"
                  alt="Franklin Home Power Battery"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Backup Guide</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-3">Supported</h5>
                  <ul className="space-y-2">
                    {backupGuide.supported.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-3">Partial Support</h5>
                  <ul className="space-y-2">
                    {backupGuide.partial.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-4 h-4 rounded-full border-2 border-yellow-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-3">Not Supported</h5>
                  <ul className="space-y-2">
                    {backupGuide.unsupported.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-4 h-4 rounded-full border-2 border-red-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
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
                <p className="font-medium text-gray-900 mb-2">{equipment.panels.name}</p>
                <ul className="space-y-2">
                  {equipment.panels.details.map((detail, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
              {!imageLoadError['panels'] && (
                <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                  <Image
                    src={equipment.panels.image}
                    alt={equipment.panels.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 192px"
                    style={{ objectFit: 'cover' }}
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
                <p className="font-medium text-gray-900 mb-2">{equipment.inverter.name}</p>
                <ul className="space-y-2">
                  {equipment.inverter.details.map((detail, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
              {!imageLoadError['inverter'] && (
                <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                  <Image
                    src={equipment.inverter.image}
                    alt={equipment.inverter.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 192px"
                    style={{ objectFit: 'cover' }}
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