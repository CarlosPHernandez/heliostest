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
    const height = svgRef.current.clientHeight - 40
    const padding = 40

    const maxCost = Math.max(
      ...data.map(d => Math.max(d.solarCost, d.utilityCost))
    )

    const points = data.map((point, i) => {
      const x = padding + (i * (width - 2 * padding) / 25)
      const y = height - padding - ((type === 'solar' ? point.solarCost : point.utilityCost) / maxCost * (height - 2 * padding))
      return `${x},${y}`
    }).join(' ')

    return points
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
    <div className="bg-white rounded-xl shadow-sm p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold text-gray-900">25-Year Savings Forecast</h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm text-gray-600">Solar Cost</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-600">Utility Cost</span>
          </div>
        </div>
      </div>
      
      <div className="relative h-[400px]">
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="utilityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {Array.from({ length: 6 }, (_, i) => (
            <g key={`grid-${i}`}>
              <line
                x1="40"
                y1={80 + i * 60}
                x2="100%"
                y2={80 + i * 60}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text
                x="35"
                y={85 + i * 60}
                textAnchor="end"
                className="text-xs fill-gray-400"
              >
                {formatCurrency(Math.max(...data.map(d => d.utilityCost)) * (1 - i/5))}
              </text>
            </g>
          ))}

          {/* Year labels */}
          {data.filter((_, i) => i % 5 === 0).map((point, i) => (
            <text
              key={`year-${i}`}
              x={40 + (i * 5 * (svgRef.current?.clientWidth ?? 0 - 80) / 25)}
              y="360"
              textAnchor="middle"
              className="text-xs fill-gray-400"
            >
              {point.year}
            </text>
          ))}

          {/* Area fills */}
          <motion.path
            d={`M40,360 L${getPathCoordinates(data, 'utility')} L${40 + ((data.length - 1) * (svgRef.current?.clientWidth ?? 0 - 80) / 25)},360 Z`}
            fill="url(#utilityGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
          <motion.path
            d={`M40,360 L${getPathCoordinates(data, 'solar')} L${40 + ((data.length - 1) * (svgRef.current?.clientWidth ?? 0 - 80) / 25)},360 Z`}
            fill="url(#solarGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />

          {/* Lines */}
          <motion.polyline
            points={getPathCoordinates(data, 'utility')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          
          <motion.polyline
            points={getPathCoordinates(data, 'solar')}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
          />

          {/* Data points */}
          {data.map((point, i) => (
            <g key={`points-${i}`}>
              <motion.circle
                cx={40 + (i * (svgRef.current?.clientWidth ?? 0 - 80) / 25)}
                cy={360 - (point.utilityCost / Math.max(...data.map(d => d.utilityCost)) * 320)}
                r="4"
                className="fill-white stroke-blue-500 stroke-2 cursor-pointer transition-transform hover:scale-150"
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2 + i * 0.02 }}
              />
              <motion.circle
                cx={40 + (i * (svgRef.current?.clientWidth ?? 0 - 80) / 25)}
                cy={360 - (point.solarCost / Math.max(...data.map(d => d.utilityCost)) * 320)}
                r="4"
                className="fill-white stroke-emerald-500 stroke-2 cursor-pointer transition-transform hover:scale-150"
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2 + i * 0.02 }}
              />
            </g>
          ))}
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-100 z-10 pointer-events-none"
            style={{
              left: `${40 + ((hoveredPoint.year - 2024) * (svgRef.current?.clientWidth ?? 0 - 80) / 25)}px`,
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="text-sm font-medium text-gray-900 mb-2">Year {hoveredPoint.year}</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-emerald-600">{formatCurrency(hoveredPoint.solarCost)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-blue-600">{formatCurrency(hoveredPoint.utilityCost)}</span>
              </div>
              <div className="pt-2 mt-2 border-t border-gray-100">
                <span className="text-xs font-medium text-gray-600">
                  Total Savings: {formatCurrency(hoveredPoint.utilityCost - hoveredPoint.solarCost)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cost Summary Section */}
      <div className="mt-8 pt-8 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-1">25-Year Utility Cost</h3>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(data[25]?.utilityCost * 25 || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Without solar installation</p>
          </div>
          
          <div className="p-4 bg-emerald-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-1">25-Year Solar Cost</h3>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(data.reduce((sum, point) => sum + point.solarCost, 0))}
            </p>
            <p className="text-xs text-gray-500 mt-1">Including maintenance</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Savings</h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(
                (data[25]?.utilityCost * 25 || 0) - 
                data.reduce((sum, point) => sum + point.solarCost, 0)
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">Over 25 years</p>
          </div>
        </div>
      </div>
    </div>
  )
} 