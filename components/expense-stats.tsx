"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Calendar, Wallet } from "lucide-react"
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { vi } from "date-fns/locale"
import type { Expense, Income } from "@/lib/supabase"

interface ExpenseStatsProps {
  expenses: Expense[]
  incomes: Income[]
  selectedMonth: Date
}

export function ExpenseStats({ expenses, incomes, selectedMonth }: ExpenseStatsProps) {
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

  const currentMonthIncomes = incomes.filter((income) => {
    const incomeDate = new Date(income.date)
    return incomeDate >= currentMonthStart && incomeDate <= currentMonthEnd
  })

  const currentTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const currentIncomeTotal = currentMonthIncomes.reduce((sum, income) => sum + income.amount, 0)
  const currentBalance = currentIncomeTotal - currentTotal

  // Tính toán cho tháng trước
  const previousMonth = subMonths(selectedMonth, 1)
  const previousMonthStart = startOfMonth(previousMonth)
  const previousMonthEnd = endOfMonth(previousMonth)

  const previousMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    return expenseDate >= previousMonthStart && expenseDate <= previousMonthEnd
  })

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
      {/* Tổng doanh thu tháng */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng Doanh Thu</CardTitle>
          <Wallet className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(currentIncomeTotal)}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="mr-1 h-3 w-3" />
            {format(selectedMonth, "MMMM yyyy", { locale: vi })}
          </div>
        </CardContent>
      </Card>
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
      {/* Số dư tháng */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Số Dư Tháng</CardTitle>
          <Wallet className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${currentBalance >= 0 ? "text-blue-600" : "text-red-600"}`}>{formatCurrency(currentBalance)}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="mr-1 h-3 w-3" />
            {format(selectedMonth, "MMMM yyyy", { locale: vi })}
          </div>
        </CardContent>
      </Card>
      {/* Trung bình mỗi ngày */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Trung Bình/Ngày (Chi)</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(currentTotal / currentMonthEnd.getDate())}</div>
          <p className="text-xs text-muted-foreground">{currentMonthExpenses.length} giao dịch</p>
        </CardContent>
      </Card>

     
    </div>
  )
}
