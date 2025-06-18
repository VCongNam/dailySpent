"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Calendar, Wallet } from "lucide-react"
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { vi } from "date-fns/locale"
import type { Expense } from "@/lib/supabase"

interface ExpenseStatsProps {
  expenses: Expense[]
  selectedMonth: Date
}

export function ExpenseStats({ expenses, selectedMonth }: ExpenseStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  // Tính toán cho tháng hiện tại
  const currentMonthStart = startOfMonth(selectedMonth)
  const currentMonthEnd = endOfMonth(selectedMonth)

  const currentMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    return expenseDate >= currentMonthStart && expenseDate <= currentMonthEnd
  })

  // Tính toán cho tháng trước
  const previousMonth = subMonths(selectedMonth, 1)
  const previousMonthStart = startOfMonth(previousMonth)
  const previousMonthEnd = endOfMonth(previousMonth)

  const previousMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    return expenseDate >= previousMonthStart && expenseDate <= previousMonthEnd
  })

  const currentTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const previousTotal = previousMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  const percentageChange = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0
  const isIncrease = percentageChange > 0

  // Tính trung bình theo ngày
  const daysInMonth = currentMonthEnd.getDate()
  const averagePerDay = currentTotal / daysInMonth

  // Tìm ngày chi tiêu nhiều nhất
  const dailyTotals = currentMonthExpenses.reduce(
    (acc, expense) => {
      const date = expense.date
      acc[date] = (acc[date] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const maxDayExpense = Object.entries(dailyTotals).reduce(
    (max, [date, amount]) => (amount > max.amount ? { date, amount } : max),
    { date: "", amount: 0 },
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Tổng chi tiêu tháng */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng Chi Tiêu</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(currentTotal)}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="mr-1 h-3 w-3" />
            {format(selectedMonth, "MMMM yyyy", { locale: vi })}
          </div>
        </CardContent>
      </Card>

      {/* So sánh với tháng trước */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">So Với Tháng Trước</CardTitle>
          {isIncrease ? (
            <TrendingUp className="h-4 w-4 text-red-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-green-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <Badge variant={isIncrease ? "destructive" : "default"}>
              {isIncrease ? "+" : ""}
              {percentageChange.toFixed(1)}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">Tháng trước: {formatCurrency(previousTotal)}</p>
        </CardContent>
      </Card>

      {/* Trung bình mỗi ngày */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Trung Bình/Ngày</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(averagePerDay)}</div>
          <p className="text-xs text-muted-foreground">{currentMonthExpenses.length} giao dịch</p>
        </CardContent>
      </Card>

      {/* Ngày chi nhiều nhất */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ngày Chi Nhiều Nhất</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(maxDayExpense.amount)}</div>
          <p className="text-xs text-muted-foreground">
            {maxDayExpense.date ? format(new Date(maxDayExpense.date), "dd/MM/yyyy") : "Chưa có dữ liệu"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
