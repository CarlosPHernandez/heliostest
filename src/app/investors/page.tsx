'use client'

import { LineChart, TrendingUp, Download, Users, DollarSign } from 'lucide-react'
import CorporateLayout from '@/components/layout/CorporateLayout'
import { InvestmentCalculator } from '@/components/features/InvestmentCalculator'

const sections = [
  {
    title: 'Investment Opportunity',
    items: [
      { name: 'Current Round', href: '#current-round' },
      { name: 'Financial Projections', href: '#projections' },
      { name: 'Investment Calculator', href: '#calculator' },
    ],
  },
  {
    title: 'Financial Information',
    items: [
      { name: 'Revenue Projections', href: '#revenue-projections' },
      { name: 'Seed Investment', href: '#seed-investment' },
      { name: 'Available Shares', href: '#available-shares' },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Investment Opportunity */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              Current Investment Round
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-700 font-medium">Seeking</span>
                  <div className="p-2 bg-green-50 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">$500,000</div>
                <div className="text-sm text-gray-500 font-medium">Investment Round</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-700 font-medium">Available Shares</span>
                  <div className="p-2 bg-blue-50 rounded-full">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">1,000,000</div>
                <div className="text-sm text-gray-500 font-medium">Total Shares</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-700 font-medium">Seed Investment</span>
                  <div className="p-2 bg-purple-50 rounded-full">
                    <DollarSign className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">$7,500</div>
                <div className="text-sm text-gray-500 font-medium">Initial Capital</div>
              </div>
            </div>
          </div>
        </section>

        {/* Financial Projections */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              Financial Projections
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-700 font-medium">Monthly Revenue</span>
                  <div className="p-2 bg-green-50 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">$190,000</div>
                <div className="text-sm text-green-500 font-medium">Projected Year 1</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-700 font-medium">Annual Revenue</span>
                  <div className="p-2 bg-blue-50 rounded-full">
                    <LineChart className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">$2.28M</div>
                <div className="text-sm text-gray-500 font-medium">Year 1 Projection</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-700 font-medium">Growth Potential</span>
                  <div className="p-2 bg-amber-50 rounded-full">
                    <TrendingUp className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">High</div>
                <div className="text-sm text-gray-500 font-medium">Market Position</div>
              </div>
            </div>
          </div>
        </section>

        {/* Investment Calculator */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <InvestmentCalculator />
          </div>
        </section>

        {/* Financial Reports */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              Financial Reports
            </h2>
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
                  className="flex items-center justify-between p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{report.title}</h3>
                    <p className="text-sm text-gray-500">{report.date}</p>
                  </div>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <div className="p-2 bg-gray-50 rounded-full">
                      <Download className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">{report.size}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Corporate Governance */}
        <section>
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              Corporate Governance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-xl text-gray-900 mb-6">Board of Directors</h3>
                <ul className="space-y-4">
                  {[
                    'Jim Kitchen - Chairman',
                    'Carlos Pacheco Hernandez - CEO',
                    'Juan Silva-Mendoza - CFO',
                  ].map((member) => (
                    <li key={member} className="text-gray-600 flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span>{member}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-xl text-gray-900 mb-6">Committees</h3>
                <ul className="space-y-4">
                  {[
                    'Audit Committee',
                    'Compensation Committee',
                    'Nominating Committee',
                  ].map((committee) => (
                    <li key={committee} className="text-gray-600 flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>{committee}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-xl text-gray-900 mb-6">Documents</h3>
                <ul className="space-y-4">
                  {[
                    'Corporate Bylaws',
                    'Code of Ethics',
                    'Committee Charters',
                  ].map((doc) => (
                    <li key={doc} className="text-gray-600">
                      <a href="#" className="flex items-center space-x-2 hover:text-black transition-colors">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span>{doc}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </CorporateLayout>
  )
}

export default InvestorsPage 