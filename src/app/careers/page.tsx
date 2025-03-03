'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Search, Briefcase, ArrowRight, Building2, Phone, X } from 'lucide-react'

const jobs = [
  {
    id: 1,
    title: 'Senior Solar Engineer',
    department: 'Engineering',
    location: 'Chapel Hill, NC',
    type: 'Full-time',
    description: 'Lead the development of next-generation solar technology...',
    fullDescription: `We're looking for a Senior Solar Engineer to join our team in Chapel Hill, NC. In this role, you'll lead the development of next-generation solar technology and help us push the boundaries of what's possible in renewable energy.

Key Responsibilities:
• Design and develop innovative solar energy solutions
• Lead technical projects from concept to implementation
• Collaborate with cross-functional teams to optimize product performance
• Stay current with industry trends and emerging technologies
• Mentor junior engineers and provide technical guidance

Requirements:
• Bachelor's degree in Electrical Engineering, Mechanical Engineering, or related field
• 5+ years of experience in solar technology development
• Strong understanding of photovoltaic systems and renewable energy principles
• Excellent problem-solving and analytical skills
• Experience with project management and team leadership`
  },
  {
    id: 2,
    title: 'Software Developer',
    department: 'Engineering',
    location: 'Raleigh, NC',
    type: 'Full-time',
    description: 'Develop and maintain modern web applications for our renewable energy platform...',
    fullDescription: `We're looking for a talented Software Developer to join our engineering team in Raleigh, NC. In this role, you'll help enhance and maintain our web applications that serve as the digital face of our renewable energy solutions.

Key Responsibilities:
• Develop and maintain modern web applications using JavaScript frameworks
• Create responsive UI components for our clean, modern interface
• Implement new features and optimize existing functionality for performance
• Collaborate with designers to translate mockups into functional components
• Ensure cross-browser compatibility and mobile responsiveness
• Write clean, maintainable code with proper documentation

Requirements:
• 2+ years of experience with modern JavaScript and front-end frameworks
• Experience with server-side rendering and component-based architecture
• Proficiency with typed programming languages
• Strong understanding of modern CSS frameworks and styling approaches
• Familiarity with responsive design principles and mobile-first approach
• Experience with version control systems
• Ability to work in a collaborative environment with designers and other developers
• Interest in renewable energy and sustainability is a plus`
  },
  {
    id: 3,
    title: 'Sales Development Representative',
    department: 'Sales',
    location: 'Raleigh, NC',
    type: 'Full-time',
    description: 'Drive business growth through outbound sales initiatives...',
    fullDescription: `We're seeking a motivated Sales Development Representative to join our team in Raleigh, NC. In this role, you'll drive business growth through outbound sales initiatives and help expand our customer base.

Key Responsibilities:
• Generate new business opportunities through outbound prospecting
• Qualify leads and schedule meetings for the sales team
• Build relationships with potential customers
• Research and identify target accounts
• Track activities and maintain accurate records in our CRM

Requirements:
• Bachelor's degree or equivalent experience
• Strong communication and interpersonal skills
• Self-motivated with a drive to achieve results
• Ability to learn quickly and adapt to changing priorities
• Experience with CRM systems preferred but not required`
  },
  {
    id: 4,
    title: 'Marketing Manager',
    department: 'Marketing',
    location: 'Burlington, NC',
    type: 'Full-time',
    description: 'Lead our digital marketing strategies and campaigns...',
    fullDescription: `We're looking for a Marketing Manager to join our team in Burlington, NC. In this role, you'll lead our digital marketing strategies and campaigns to increase brand awareness and drive customer acquisition.

Key Responsibilities:
• Develop and implement comprehensive marketing strategies
• Manage digital marketing campaigns across multiple channels
• Analyze campaign performance and optimize for results
• Collaborate with sales and product teams to align messaging
• Oversee content creation and brand consistency

Requirements:
• Bachelor's degree in Marketing, Communications, or related field
• 3+ years of experience in marketing, preferably in the renewable energy sector
• Strong understanding of digital marketing channels and analytics
• Excellent project management and organizational skills
• Creative thinking with an analytical approach to problem-solving`
  },
  {
    id: 5,
    title: 'Solar Panel Installer',
    department: 'Installation',
    location: 'Greensboro, NC',
    type: 'Full-time',
    description: 'Join our installation team to help customers transition to clean energy by installing solar panels on residential and commercial properties...',
    fullDescription: `We're seeking experienced Solar Panel Installers to join our team in Greensboro, NC. In this role, you'll help customers transition to clean energy by installing solar panels on residential and commercial properties.

Key Responsibilities:
• Install solar panel systems on various roof types and ground mounts
• Perform electrical wiring and connections according to code
• Conduct system testing and quality assurance checks
• Maintain a safe work environment and follow safety protocols
• Provide excellent customer service during installations

Requirements:
• High school diploma or equivalent
• Previous experience in construction, roofing, or electrical work preferred
• Physical ability to lift up to 50 pounds and work on rooftops
• Valid driver's license and clean driving record
• Willingness to learn and follow detailed installation procedures`
  },
]

const departments = ['All', 'Engineering', 'Sales', 'Marketing', 'Operations', 'Installation']

const CareersPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('All')
  const [selectedJob, setSelectedJob] = useState<typeof jobs[0] | null>(null)

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = selectedDepartment === 'All' || job.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Full screen with image and minimal text */}
      <section className="relative h-screen w-full">
        <Image
          src="/images/solar-panel-installation.jpg"
          alt="Solar panel installation"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Shape the Future
            </h1>
            <p className="text-xl md:text-2xl text-white max-w-2xl mx-auto mb-8">
              Join our mission to transform energy through innovation and sustainability
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  const jobsSection = document.getElementById('jobs-section')
                  jobsSection?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="group bg-white text-black px-8 py-4 rounded-full flex items-center hover:bg-gray-100 transition-all"
              >
                View Open Positions
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        {/* Mission Statement */}
        <section className="mb-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            At Helios Nexus, we're building the infrastructure for a sustainable future.
            Our team is dedicated to making clean energy accessible to everyone through
            innovative technology and exceptional service.
          </p>
        </section>

        {/* Jobs Section */}
        <section id="jobs-section" className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Open Positions</h2>

          {/* Filters */}
          <div className="mb-12 flex flex-col md:flex-row gap-6 max-w-3xl mx-auto">
            <div className="relative flex-1 group">
              <div className="absolute inset-0 bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity -z-10"></div>
              <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search positions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-transparent border-b border-gray-200 focus:border-black focus:outline-none transition-colors rounded-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
            <div className="flex overflow-x-auto py-2 md:py-0 gap-2 no-scrollbar">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-5 py-3 rounded-full whitespace-nowrap transition-all ${selectedDepartment === dept
                    ? 'bg-black text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Job Listings */}
          <div className="grid grid-cols-1 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="group border border-gray-200 rounded-xl p-6 hover:border-black transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{job.title}</h3>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-2 md:mt-0">
                    <span className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-1" />
                      {job.type}
                    </span>
                    <span className="flex items-center">
                      <Building2 className="h-4 w-4 mr-1" />
                      {job.location}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{job.description}</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="flex items-center text-black font-medium group-hover:underline"
                  >
                    Apply Now
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredJobs.length === 0 && (
            <div className="text-center py-12 border border-gray-200 rounded-xl">
              <p className="text-gray-600">No positions found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedDepartment('All')
                }}
                className="mt-4 text-black underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Sustainability</h3>
              <p className="text-gray-600">
                We're committed to creating a cleaner, more sustainable future for generations to come.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Innovation</h3>
              <p className="text-gray-600">
                We constantly push boundaries to develop cutting-edge solutions for renewable energy.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Community</h3>
              <p className="text-gray-600">
                We believe in building strong relationships with our customers, partners, and team members.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="relative h-[400px] rounded-xl overflow-hidden">
              <Image
                src="/images/happyfamily.jpg"
                alt="Happy family with solar energy"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Join Us</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-lg">Competitive Benefits</h3>
                    <p className="text-gray-600">Comprehensive health coverage and generous PTO</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-lg">Growth Opportunities</h3>
                    <p className="text-gray-600">Continuous learning and career development programs</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-lg">Work-Life Balance</h3>
                    <p className="text-gray-600">Flexible work arrangements and remote options available</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-lg">Meaningful Work</h3>
                    <p className="text-gray-600">Make a real impact on the environment and help combat climate change</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Job Application Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-16 md:pt-24 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] md:max-h-[85vh] overflow-y-auto my-4 shadow-xl">
            <div className="sticky top-0 bg-white p-4 sm:p-6 border-b flex justify-between items-center z-10">
              <h2 className="text-xl sm:text-2xl font-bold pr-8">{selectedJob.title}</h2>
              <button
                onClick={() => setSelectedJob(null)}
                className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full text-sm">
                  <Briefcase className="h-4 w-4 mr-1.5" />
                  {selectedJob.type}
                </span>
                <span className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full text-sm">
                  <Building2 className="h-4 w-4 mr-1.5" />
                  {selectedJob.location}
                </span>
              </div>

              <div className="prose max-w-none mb-8">
                <h3 className="text-lg sm:text-xl font-bold mb-4">Job Description</h3>
                <div className="whitespace-pre-line text-sm sm:text-base">
                  {selectedJob.fullDescription}
                </div>
              </div>

              <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                <h3 className="text-lg sm:text-xl font-bold mb-3">Interested in this position?</h3>
                <p className="mb-5 text-sm sm:text-base">
                  Call us directly to discuss this opportunity and schedule an interview.
                </p>
                <a
                  href="tel:+13369556877"
                  className="inline-flex items-center bg-black text-white px-5 py-3 rounded-full hover:bg-gray-800 transition-colors"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  (336) 955-6877
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CareersPage 