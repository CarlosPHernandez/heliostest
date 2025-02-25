"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"

import "react-day-picker/dist/style.css"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "",
        month: "",
        caption: "flex justify-between items-center mb-4",
        caption_label: "text-2xl text-[#1a237e] font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: "h-7 w-7 bg-transparent p-0 text-[#1a237e] hover:text-[#1a237e] opacity-75 hover:opacity-100",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-[#6b7280] rounded-md w-9 font-normal text-[0.8rem] uppercase",
        row: "flex w-full mt-2",
        cell: "text-center text-sm relative p-0 rounded-md",
        day: "h-9 w-9 p-0 font-normal text-[#1a237e] hover:bg-blue-50 rounded-md flex items-center justify-center text-sm",
        day_range_end: "day-range-end",
        day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
        day_today: "underline",
        day_outside: "text-gray-300 opacity-50 hover:bg-transparent",
        day_disabled: "text-gray-300 opacity-50 hover:bg-transparent cursor-not-allowed",
        day_range_middle: "day-range-middle",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar } 