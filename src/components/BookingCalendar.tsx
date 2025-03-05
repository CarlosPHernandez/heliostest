'use client'

import { useState, useEffect } from 'react'
import { format, addDays, isSameDay } from 'date-fns'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface BookingCalendarProps {
  onDateTimeSelect: (date: Date | undefined, time: string | undefined) => void
  selectedDate?: Date
  selectedTime?: string
}

export default function BookingCalendar({
  onDateTimeSelect,
  selectedDate,
  selectedTime,
}: BookingCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(selectedDate)
  const [isOpen, setIsOpen] = useState(false)

  // Update the parent component with the selected date, but don't trigger form submission
  useEffect(() => {
    if (date) {
      onDateTimeSelect(date, undefined)
    }
  }, [date])

  const getAvailableDates = () => {
    const dates: Date[] = []
    let currentDate = new Date()
    let daysToAdd = 0

    while (dates.length < 14) {
      const nextDate = addDays(currentDate, daysToAdd)
      const day = nextDate.getDay()
      if (day !== 0 && day !== 6) {
        dates.push(nextDate)
      }
      daysToAdd++
    }
    return dates
  }

  const availableDates = getAvailableDates()

  const handleDateSelect = (e: React.MouseEvent, newDate: Date) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event propagation
    setDate(newDate);
    setIsOpen(false);
    onDateTimeSelect(newDate, undefined);
  }

  const formatDateOption = (date: Date) => {
    const today = new Date()
    const isToday = isSameDay(date, today)
    const dayName = format(date, 'EEE')
    const monthDay = format(date, 'MMM d')
    return isToday ? `Today, ${monthDay}` : `${dayName}, ${monthDay}`
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="flex flex-col space-y-8">
        {/* Date Dropdown */}
        <div className="w-full max-w-sm mx-auto">
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(!isOpen);
              }}
              className="w-full flex items-center justify-between bg-white px-6 py-4 rounded-xl text-black border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <span className="text-lg font-medium">
                {date ? formatDateOption(date) : 'Select a date'}
              </span>
              <ChevronDown className={cn(
                "h-5 w-5 text-black transition-transform duration-200",
                isOpen && "transform rotate-180"
              )} />
            </button>

            {isOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-[280px] overflow-y-auto">
                {availableDates.map((availableDate) => (
                  <button
                    key={availableDate.toISOString()}
                    type="button"
                    onClick={(e) => handleDateSelect(e, availableDate)}
                    className={cn(
                      'w-full text-left px-6 py-3 text-lg transition-colors',
                      isSameDay(availableDate, date as Date)
                        ? 'bg-gray-100 text-black font-medium'
                        : 'text-black hover:bg-gray-50'
                    )}
                  >
                    {formatDateOption(availableDate)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
