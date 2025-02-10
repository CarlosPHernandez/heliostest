import { Sun, Battery, Shield } from 'lucide-react'

interface EquipmentDetailsProps {
  packageType: 'standard' | 'premium'
  warrantyPackage: 'basic' | 'extended' | 'comprehensive'
}

const warrantyDetails = {
  basic: {
    title: 'Basic Warranty',
    coverage: [
      '25-year panel performance warranty',
      '10-year inverter warranty',
      '10-year workmanship warranty',
    ]
  },
  extended: {
    title: 'Extended Warranty',
    coverage: [
      '25-year panel performance warranty',
      '15-year inverter warranty',
      '15-year workmanship warranty',
      'Extended parts coverage',
    ]
  },
  comprehensive: {
    title: 'Comprehensive Warranty',
    coverage: [
      '25-year panel performance warranty',
      '25-year inverter warranty',
      '25-year workmanship warranty',
      'Full system coverage',
      'Annual maintenance included',
    ]
  }
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

export function EquipmentDetails({ packageType, warrantyPackage }: EquipmentDetailsProps) {
  const equipment = equipmentDetails[packageType]
  const warranty = warrantyDetails[warrantyPackage]

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Your Equipment</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Solar Panels */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Sun className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="font-semibold text-gray-900">Solar Panels</h3>
          </div>
          <div className="space-y-4">
            <p className="font-medium text-gray-900">{equipment.panels.name}</p>
            <ul className="space-y-2">
              {equipment.panels.details.map((detail, index) => (
                <li key={index} className="text-sm text-gray-600">• {detail}</li>
              ))}
            </ul>
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
            <p className="font-medium text-gray-900">{equipment.inverter.name}</p>
            <ul className="space-y-2">
              {equipment.inverter.details.map((detail, index) => (
                <li key={index} className="text-sm text-gray-600">• {detail}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Warranty */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="font-semibold text-gray-900">{warranty.title}</h3>
          </div>
          <div className="space-y-4">
            <ul className="space-y-2">
              {warranty.coverage.map((detail, index) => (
                <li key={index} className="text-sm text-gray-600">• {detail}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 