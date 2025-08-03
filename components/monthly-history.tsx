"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, Calendar } from "lucide-react"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { vi } from "date-fns/locale"
import type { Expense, Income } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface MonthlyHistoryProps {
  expenses: Expense[]
  incomes: Income[]
  selectedMonth: Date
  onMonthChange: (month: Date) => void
}

interface MonthlyData {
  month: Date
  expenses: Expense[]
  incomes: Income[]
  totalExpenses: number
  totalIncomes: number
  balance: number
}

export function MonthlyHistory({ expenses, incomes, selectedMonth, onMonthChange }: MonthlyHistoryProps) {
  const [showHistory, setShowHistory] = useState(false)
  const [historyMonths, setHistoryMonths] = useState(6) // Hiển thị 6 tháng gần nhất
  const router = useRouter()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const getMonthlyData = (month: Date): MonthlyData => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)

    const monthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate >= monthStart && expenseDate <= monthEnd
    })

    const monthIncomes = incomes.filter((income) => {
      const incomeDate = new Date(income.date)
      return incomeDate >= monthStart && incomeDate <= monthEnd
    })

    const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const totalIncomes = monthIncomes.reduce((sum, income) => sum + income.amount, 0)
    const balance = totalIncomes - totalExpenses

    return {
      month,
      expenses: monthExpenses,
      incomes: monthIncomes,
      totalExpenses,
      totalIncomes,
      balance,
    }
  }

  const generateHistoryData = (): MonthlyData[] => {
    const data: MonthlyData[] = []
    for (let i = 0; i < historyMonths; i++) {
      const month = subMonths(selectedMonth, i)
      data.push(getMonthlyData(month))
    }
    return data.reverse() // Sắp xếp từ cũ đến mới
  }

  const historyData = generateHistoryData()

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = direction === "prev" ? subMonths(selectedMonth, 1) : subMonths(selectedMonth, -1)
    onMonthChange(newMonth)
  }

  const navigateToMonthDetail = (month: Date) => {
    const monthString = format(month, "yyyy-MM")
    router.push(`/monthly-detail/${monthString}`)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Lịch Sử Chi Tiêu & Doanh Thu</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("prev")}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Badge variant="secondary">
              {format(selectedMonth, "MMMM yyyy", { locale: vi })}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("next")}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Nút toggle hiển thị lịch sử */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "Ẩn Lịch Sử" : "Xem Lịch Sử"} ({historyMonths} tháng)
            </Button>
            <div className="flex gap-2">
              <Button
                variant={historyMonths === 3 ? "default" : "outline"}
                size="sm"
                onClick={() => setHistoryMonths(3)}
              >
                3 tháng
              </Button>
              <Button
                variant={historyMonths === 6 ? "default" : "outline"}
                size="sm"
                onClick={() => setHistoryMonths(6)}
              >
                6 tháng
              </Button>
              <Button
                variant={historyMonths === 12 ? "default" : "outline"}
                size="sm"
                onClick={() => setHistoryMonths(12)}
              >
                12 tháng
              </Button>
            </div>
          </div>

          {/* Bảng lịch sử */}
          {showHistory && (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tháng</TableHead>
                    <TableHead className="text-right">Doanh Thu</TableHead>
                    <TableHead className="text-right">Chi Tiêu</TableHead>
                    <TableHead className="text-right">Số Dư</TableHead>
                    <TableHead className="text-center">Xu Hướng</TableHead>
                    <TableHead className="text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyData.map((data, index) => {
                    const prevData = index > 0 ? historyData[index - 1] : null
                    const expenseChange = prevData 
                      ? ((data.totalExpenses - prevData.totalExpenses) / prevData.totalExpenses) * 100 
                      : 0
                    const incomeChange = prevData 
                      ? ((data.totalIncomes - prevData.totalIncomes) / prevData.totalIncomes) * 100 
                      : 0

                    return (
                      <TableRow key={data.month.toISOString()} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {format(data.month, "MMM yyyy", { locale: vi })}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatCurrency(data.totalIncomes)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(data.totalExpenses)}
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${
                          data.balance >= 0 ? "text-blue-600" : "text-red-600"
                        }`}>
                          {formatCurrency(data.balance)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {expenseChange > 0 ? (
                              <TrendingUp className="w-4 h-4 text-red-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-green-500" />
                            )}
                            <span className="text-xs">
                              {expenseChange > 0 ? "+" : ""}{expenseChange.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigateToMonthDetail(data.month)
                            }}
                          >
                            Xem chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Tổng kết */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(historyData.reduce((sum, data) => sum + data.totalIncomes, 0))}
                  </div>
                  <div className="text-sm text-muted-foreground">Tổng Doanh Thu</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {formatCurrency(historyData.reduce((sum, data) => sum + data.totalExpenses, 0))}
                  </div>
                  <div className="text-sm text-muted-foreground">Tổng Chi Tiêu</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    historyData.reduce((sum, data) => sum + data.balance, 0) >= 0 
                      ? "text-blue-600" 
                      : "text-red-600"
                  }`}>
                    {formatCurrency(historyData.reduce((sum, data) => sum + data.balance, 0))}
                  </div>
                  <div className="text-sm text-muted-foreground">Tổng Số Dư</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 