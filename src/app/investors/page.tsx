'use client'

import { LineChart, TrendingUp, Download, Users } from 'lucide-react'
import CorporateLayout from '@/components/layout/CorporateLayout'
import { InvestmentCalculator } from '@/components/features/InvestmentCalculator'

const sections = [
  {
    title: 'Financial Information',
    items: [
      { name: 'Annual Reports', href: '#annual-reports' },
      { name: 'Quarterly Results', href: '#quarterly-results' },
      { name: 'SEC Filings', href: '#sec-filings' },
    ],
  },
  {
    title: 'Stock Information',
    items: [
      { name: 'Stock Quote', href: '#stock-quote' },
      { name: 'Dividend History', href: '#dividend-history' },
      { name: 'Investment Calculator', href: '#calculator' },
    ],
  },
  {
    title: 'Corporate Governance',
    items: [
      { name: 'Board of Directors', href: '#board' },
      { name: 'Committee Composition', href: '#committees' },
      { name: 'Governance Documents', href: '#documents' },
    ],
  },
]

const InvestorsPage = () => {
  return (
    <CorporateLayout sections={sections}>
      {/* Stock Overview */}
      <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Stock Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Stock Price</span>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold">$156.78</div>
            <div className="text-sm text-green-500">+2.45 (1.57%)</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Market Cap</span>
              <LineChart className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">$8.2B</div>
            <div className="text-sm text-gray-500">USD</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Volume</span>
              <LineChart className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">2.1M</div>
            <div className="text-sm text-gray-500">Shares</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Shareholders</span>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">45.2K</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
        </div>
      </section>

      {/* Investment Calculator */}
      <section className="mb-8">
        <InvestmentCalculator />
      </section>

      {/* Financial Reports */}
      <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Financial Reports</h2>
        <div className="space-y-4">
          {[
            {
              title: 'Q4 2023 Earnings Report',
              date: 'February 1, 2024',
              size: '2.4 MB',
            },
            {
              title: 'Q3 2023 Earnings Report',
              date: 'November 1, 2023',
              size: '2.1 MB',
            },
            {
              title: 'Q2 2023 Earnings Report',
              date: 'August 1, 2023',
              size: '2.3 MB',
            },
          ].map((report) => (
            <div
              key={report.title}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <h3 className="font-semibold">{report.title}</h3>
                <p className="text-sm text-gray-500">{report.date}</p>
              </div>
              <button className="flex items-center space-x-2 text-black hover:text-gray-700">
                <Download className="h-5 w-5" />
                <span className="text-sm">{report.size}</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Corporate Governance */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6">Corporate Governance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Board of Directors</h3>
            <ul className="space-y-2">
              {[
                'Jim Kitchen - Chairman',
                'Carlos Pacheco Hernandez - CEO',
                'Juan Silva-Mendoza - CFO',
              ].map((member) => (
                <li key={member} className="text-gray-600">
                  {member}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Committees</h3>
            <ul className="space-y-2">
              {[
                'Audit Committee',
                'Compensation Committee',
                'Nominating Committee',
              ].map((committee) => (
                <li key={committee} className="text-gray-600">
                  {committee}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Documents</h3>
            <ul className="space-y-2">
              {[
                'Corporate Bylaws',
                'Code of Ethics',
                'Committee Charters',
              ].map((doc) => (
                <li key={doc} className="text-gray-600">
                  <a href="#" className="hover:text-black">
                    {doc}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </CorporateLayout>
  )
}

export default InvestorsPage 