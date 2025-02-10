import { Sun, Battery } from 'lucide-react'
import Image from 'next/image'

interface EquipmentDetailsProps {
  packageType: 'standard' | 'premium'
}

const equipmentDetails = {
  standard: {
    panels: {
      name: 'Q CELLS Q.PEAK DUO BLK ML-G10+',
      details: [
        '400W output per panel',
        'Sleek all-black design',
        '20.4% efficiency',
        'Advanced weather resistance',
      ]
    },
    inverter: {
      name: 'Enphase IQ8+',
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

export function EquipmentDetails({ packageType }: EquipmentDetailsProps) {
  const equipment = equipmentDetails[packageType]

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Your Equipment</h2>
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
                    <li key={index} className="text-sm text-gray-600">• {detail}</li>
                  ))}
                </ul>
              </div>
              {packageType === 'premium' && (
                <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src="/RecPanel.png"
                    alt="REC Alpha Pure-R Panel"
                    fill
                    sizes="(max-width: 768px) 100vw, 192px"
                    style={{ objectFit: 'cover' }}
                    priority
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
                    <li key={index} className="text-sm text-gray-600">• {detail}</li>
                  ))}
                </ul>
              </div>
              <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0">
                <Image
                  src="/enphase.webp"
                  alt="Enphase IQ8 Inverter"
                  fill
                  sizes="(max-width: 768px) 100vw, 192px"
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 