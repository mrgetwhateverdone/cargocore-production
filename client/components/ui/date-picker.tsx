import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
}

/**
 * This part of the code creates a date picker component for report filtering
 * Provides a clean calendar interface for selecting date ranges
 */
export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled = false
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

interface DateRangePickerProps {
  startDate?: Date
  endDate?: Date
  onStartDateChange?: (date: Date | undefined) => void
  onEndDateChange?: (date: Date | undefined) => void
  disabled?: boolean
}

/**
 * This part of the code creates a date range picker for report filtering
 * Allows users to select start and end dates for custom report periods
 */
export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  disabled = false
}: DateRangePickerProps) {
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Start Date
        </label>
        <DatePicker
          date={startDate}
          onDateChange={onStartDateChange}
          placeholder="Select start date"
          disabled={disabled}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          End Date
        </label>
        <DatePicker
          date={endDate}
          onDateChange={onEndDateChange}
          placeholder="Select end date"
          disabled={disabled}
        />
      </div>
    </div>
  )
}
