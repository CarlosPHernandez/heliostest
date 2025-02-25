'use client'

import { useState } from 'react'
import { format, addDays, isSameDay } from 'date-fns'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

const TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
]

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
  const [time, setTime] = useState<string | undefined>(selectedTime)
  const [isOpen, setIsOpen] = useState(false)

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

  const handleDateSelect = (newDate: Date) => {
    setDate(newDate)
    onDateTimeSelect(newDate, time)
    setIsOpen(false)
  }

  const handleTimeSelect = (newTime: string) => {
    setTime(newTime)
    onDateTimeSelect(date, newTime)
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
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between bg-white px-6 py-4 rounded-xl text-black border border-blue-100 hover:border-blue-200 transition-colors"
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
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-blue-100 rounded-xl shadow-lg z-10 max-h-[280px] overflow-y-auto">
                {availableDates.map((availableDate) => (
                  <button
                    key={availableDate.toISOString()}
                    onClick={() => handleDateSelect(availableDate)}
                    className={cn(
                      'w-full text-left px-6 py-3 text-lg transition-colors',
                      isSameDay(availableDate, date as Date)
                        ? 'bg-blue-50 text-black font-medium'
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

        {/* Time Selection */}
        <div className="w-full max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-6 text-black">
            Select a Time
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                onClick={() => handleTimeSelect(slot)}
                disabled={!date}
                className={cn(
                  'flex items-center justify-center h-14 text-base rounded-xl transition-all duration-200',
                  !date
                    ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                    : time === slot
                      ? 'bg-blue-50 text-black font-medium border-2 border-black'
                      : 'bg-blue-50/30 text-black hover:bg-blue-50'
                )}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
