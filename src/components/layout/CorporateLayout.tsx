'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import MainLayout from './MainLayout'

interface CorporateLayoutProps {
  children: React.ReactNode
  sections: {
    title: string
    items: { name: string; href: string }[]
  }[]
}

const CorporateLayout = ({ children, sections }: CorporateLayoutProps) => {
  const [openSections, setOpenSections] = useState<string[]>([])

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    )
  }

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Side Navigation */}
        <aside className="w-full md:w-64 bg-gray-50 border-r">
          <nav className="sticky top-16 p-4 space-y-2">
            {sections.map((section) => (
              <div key={section.title}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex items-center justify-between w-full p-2 text-left text-gray-900 hover:bg-gray-100 rounded-md"
                >
                  <span className="font-medium">{section.title}</span>
                  {openSections.includes(section.title) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {openSections.includes(section.title) && (
                  <div className="ml-4 mt-2 space-y-1">
                    {section.items.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="block px-2 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </MainLayout>
  )
}

export default CorporateLayout 