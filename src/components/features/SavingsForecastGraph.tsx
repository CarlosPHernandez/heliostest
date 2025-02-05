'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface DataPoint {
  year: number
  solarCost: number
  utilityCost: number
}

interface SavingsForecastGraphProps {
  monthlyBill: number
  systemCost: number
}

export const SavingsForecastGraph = ({ monthlyBill, systemCost }: SavingsForecastGraphProps) => {
  const [data, setData] = useState<DataPoint[]>([])
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null)
  const [isAnimating, setIsAnimating] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    // Calculate 25-year forecast
    const yearlyBill = monthlyBill * 12
    const annualIncrease = 0.03 // 3% annual increase
    
    const forecastData: DataPoint[] = Array.from({ length: 26 }, (_, i) => {
      const year = 2024 + i
      const utilityCost = yearlyBill * Math.pow(1 + annualIncrease, i)
      const solarCost = i === 0 ? systemCost : 0 // Initial system cost only
      
      return {
        year,
        solarCost: solarCost + (200 * i), // Adding minimal maintenance costs
        utilityCost: utilityCost
      }
    })

    setData(forecastData)
  }, [monthlyBill, systemCost])

  const getPathCoordinates = (data: DataPoint[], type: 'solar' | 'utility') => {
    if (!svgRef.current) return ''

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight - 40 // Leave space for labels
    const padding = 40

    const maxCost = Math.max(
      ...data.map(d => Math.max(d.solarCost, d.utilityCost))
    )

    return data.map((point, i) => {
      const x = padding + (i * (width - 2 * padding) / 25)
      const y = height - padding - ((type === 'solar' ? point.solarCost : point.utilityCost) / maxCost * (height - 2 * padding))
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 overflow-hidden">
      <h2 className="text-xl font-semibold mb-6">25-Year Savings Forecast</h2>
      
      <div className="relative h-[400px]">
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ overflow: 'visible' }}
        >
          {/* Grid lines */}
          {Array.from({ length: 6 }, (_, i) => (
            <line
              key={`grid-${i}`}
              x1="40"
              y1={80 + i * 60}
              x2="100%"
              y2={80 + i * 60}
              stroke="#e5e7eb"
              strokeDasharray="4 4"
            />
          ))}

          {/* Animated paths */}
          <motion.path
            d={getPathCoordinates(data, 'utility')}
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isAnimating ? 1 : 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="drop-shadow-md"
          />
          
          <motion.path
            d={getPathCoordinates(data, 'solar')}
            fill="none"
            stroke="#22c55e"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isAnimating ? 1 : 1 }}
            transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
            className="drop-shadow-md"
          />

          {/* Interactive points */}
          {data.map((point, i) => (
            <g key={`points-${i}`}>
              <circle
                cx={40 + (i * (svgRef.current?.clientWidth ?? 0 - 80) / 25)}
                cy={360 - (point.utilityCost / Math.max(...data.map(d => d.utilityCost)) * 320)}
                r="6"
                className="fill-red-500 cursor-pointer transition-transform hover:scale-150"
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              <circle
                cx={40 + (i * (svgRef.current?.clientWidth ?? 0 - 80) / 25)}
                cy={360 - (point.solarCost / Math.max(...data.map(d => d.utilityCost)) * 320)}
                r="6"
                className="fill-green-500 cursor-pointer transition-transform hover:scale-150"
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-8 py-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full" />
            <span className="text-sm text-gray-600">Solar Cost</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full" />
            <span className="text-sm text-gray-600">Utility Cost</span>
          </div>
        </div>

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-10 pointer-events-none"
            style={{
              left: `${40 + ((hoveredPoint.year - 2024) * (svgRef.current?.clientWidth ?? 0 - 80) / 25)}px`,
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <p className="font-semibold">Year {hoveredPoint.year}</p>
            <p className="text-green-600">Solar: {formatCurrency(hoveredPoint.solarCost)}</p>
            <p className="text-red-600">Utility: {formatCurrency(hoveredPoint.utilityCost)}</p>
            <p className="text-sm text-gray-600 mt-1">
              Savings: {formatCurrency(hoveredPoint.utilityCost - hoveredPoint.solarCost)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 