import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HistoryCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  historyData?: any[];
}

export default function HistoryCalendar({ selectedDate, onDateSelect, historyData = [] }: HistoryCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 8)) // September 2025

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const formatMonth = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    )
  }

  const isSelected = (day: number) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    )
  }

  const hasHistory = (day: number) => {
    return historyData.some(item => {
      const itemDate = new Date(item.date.replace(/\./g, "/"))
      return (
        itemDate.getDate() === day &&
        itemDate.getMonth() === currentMonth.getMonth() &&
        itemDate.getFullYear() === currentMonth.getFullYear()
      )
    })
  }

  const isSunday = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return date.getDay() === 0
  }

  const isSaturday = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return date.getDay() === 6
  }

  return (
    <div className="w-full px-1">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{formatMonth(currentMonth)}</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 gap-y-4 mb-4">
        {/* Day headers */}
        {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
          <div
            key={day}
            className={cn(
              "h-8 w-8 flex items-center justify-center text-sm font-medium",
              index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-gray-600",
            )}
          >
            {day}
          </div>
        ))}

        {/* Empty days */}
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="h-8 w-8" />
        ))}

        {/* Days */}
        {days.map((day) => (
          <button
            key={day}
            onClick={() => onDateSelect(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
            className={cn(
              "h-8 w-8 flex items-center justify-center text-sm rounded-full transition-colors",
              isSelected(day) && "bg-blue-500 text-white",
              hasHistory(day) && !isSelected(day) && "bg-gray-200 rounded-full",
              isToday(day) && !isSelected(day) && "bg-blue-100 text-blue-600 rounded-full",
              isSunday(day) && !isSelected(day) && !isToday(day) && "text-red-500",
              isSaturday(day) && !isSelected(day) && !isToday(day) && "text-blue-500",
              !hasHistory(day) && !isToday(day) && !isSelected(day) && "hover:bg-gray-100 rounded-full",
            )}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  )
}
