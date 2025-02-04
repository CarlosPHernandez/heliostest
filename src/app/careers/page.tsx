'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Search, MapPin, Briefcase, DollarSign } from 'lucide-react'
import CorporateLayout from '@/components/layout/CorporateLayout'

const sections = [
  {
    title: 'Job Categories',
    items: [
      { name: 'Engineering', href: '#engineering' },
      { name: 'Sales', href: '#sales' },
      { name: 'Marketing', href: '#marketing' },
      { name: 'Operations', href: '#operations' },
    ],
  },
  {
    title: 'Locations',
    items: [
      { name: 'San Francisco', href: '#sf' },
      { name: 'New York', href: '#ny' },
      { name: 'London', href: '#london' },
      { name: 'Remote', href: '#remote' },
    ],
  },
]

const jobs = [
  {
    id: 1,
    title: 'Senior Solar Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$120K - $180K',
    description: 'Lead the development of next-generation solar technology...',
  },
  {
    id: 2,
    title: 'Sales Development Representative',
    department: 'Sales',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$70K - $90K',
    description: 'Drive business growth through outbound sales initiatives...',
  },
  {
    id: 3,
    title: 'Marketing Manager',
    department: 'Marketing',
    location: 'Remote',
    type: 'Full-time',
    salary: '$90K - $120K',
    description: 'Lead our digital marketing strategies and campaigns...',
  },
]

const CareersPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('All')

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = selectedDepartment === 'All' || job.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  return (
    <CorporateLayout sections={sections}>
      {/* Hero Section */}
      <section className="relative h-[40vh] mb-12 rounded-xl overflow-hidden">
        <Image
          src="https://picsum.photos/id/1066/1200/400"
          alt="Office culture"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-white mb-4">
              Join Our Mission
            </h1>
            <p className="text-xl text-gray-200">
              Help us build a sustainable future through innovative solar technology.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search positions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
        >
          <option value="All">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Sales">Sales</option>
          <option value="Marketing">Marketing</option>
          <option value="Operations">Operations</option>
        </select>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{job.title}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1" />
                  {job.type}
                </span>
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.location}
                </span>
                <span className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {job.salary}
                </span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">{job.description}</p>
            <button className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors">
              Apply Now
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No positions found matching your criteria.</p>
        </div>
      )}

      {/* Benefits Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-8">Why Join Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Competitive Benefits',
              description: 'Comprehensive health coverage, 401(k) matching, and generous PTO',
              icon: '🎯',
            },
            {
              title: 'Growth Opportunities',
              description: 'Continuous learning and career development programs',
              icon: '📈',
            },
            {
              title: 'Work-Life Balance',
              description: 'Flexible work arrangements and remote options available',
              icon: '⚖️',
            },
          ].map((benefit) => (
            <div
              key={benefit.title}
              className="bg-gray-50 p-6 rounded-lg"
            >
              <div className="text-4xl mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>
    </CorporateLayout>
  )
}

export default CareersPage 