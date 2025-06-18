"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface ExpenseCalendarProps {
  selectedDate: Date | undefined
  onDateSelect: (date: Date | undefined) => void
  expenseDates: string[]
}

export function ExpenseCalendar({ selectedDate, onDateSelect, expenseDates }: ExpenseCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const hasExpenseOnDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    return expenseDates.includes(dateString)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Lịch Chi Tiêu
          <Badge variant="secondary">{format(currentMonth, "MMMM yyyy", { locale: vi })}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          locale={vi}
          className="rounded-md border"
          modifiers={{
            hasExpense: (date) => hasExpenseOnDate(date),
          }}
          modifiersStyles={{
            hasExpense: {
              backgroundColor: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              fontWeight: "bold",
            },
          }}
        />
        <div className="mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary"></div>
            <span>Ngày có chi tiêu</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
