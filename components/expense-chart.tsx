"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Button } from "@/components/ui/button"
import { PieChartIcon, BarChart3 } from "lucide-react"
import { useState } from "react"
import type { Expense } from "@/lib/supabase"

interface ExpenseChartProps {
  expenses: Expense[]
  selectedMonth: Date
}

const COLORS = [
  "#0088FE", // Blue
  "#00C49F", // Green
  "#FFBB28", // Yellow
  "#FF8042", // Orange
  "#EC4899", // Pink
  "#8884D8", // Purple
  "#82CA9D", // Light Green
  "#FFC658", // Light Orange
  "#FF7C7C", // Light Red
]

export function ExpenseChart({ expenses, selectedMonth }: ExpenseChartProps) {
  const [chartType, setChartType] = useState<"pie" | "bar">("pie")

  // Tính toán dữ liệu theo danh mục
  const categoryData = expenses.reduce(
    (acc, expense) => {
      const category = expense.category
      if (!acc[category]) {
        acc[category] = {
          name: category,
          value: 0,
          count: 0,
        }
      }
      acc[category].value += expense.amount
      acc[category].count += 1
      return acc
    },
    {} as Record<string, { name: string; value: number; count: number }>,
  )

  const chartData = Object.values(categoryData).sort((a, b) => b.value - a.value)
  const totalAmount = chartData.reduce((sum, item) => sum + item.value, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const formatMonth = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      month: "long",
      year: "numeric",
    }).format(date)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-primary font-semibold">{formatCurrency(data.value)}</p>
          <p className="text-sm text-muted-foreground">{data.count} giao dịch</p>
          <p className="text-sm text-muted-foreground">
            {((data.value / totalAmount) * 100).toFixed(1)}% tổng chi tiêu
          </p>
        </div>
      )
    }
    return null
  }

  if (expenses.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Biểu Đồ Chi Tiêu - {formatMonth(selectedMonth)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <PieChartIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Chưa có dữ liệu chi tiêu để hiển thị biểu đồ</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Biểu Đồ Chi Tiêu - {formatMonth(selectedMonth)}</CardTitle>
          <div className="flex gap-2">
            <Button variant={chartType === "pie" ? "default" : "outline"} size="sm" onClick={() => setChartType("pie")}>
              <PieChartIcon className="w-4 h-4 mr-2" />
              Tròn
            </Button>
            <Button variant={chartType === "bar" ? "default" : "outline"} size="sm" onClick={() => setChartType("bar")}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Cột
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Tổng chi tiêu: <span className="font-semibold text-primary">{formatCurrency(totalAmount)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Biểu đồ */}
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={300}>
              {chartType === "pie" ? (
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                  <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#0088FE" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Danh sách chi tiết */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Chi Tiết Theo Danh Mục</h4>
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {chartData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.count} giao dịch</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">{formatCurrency(item.value)}</div>
                    <div className="text-xs text-muted-foreground">
                      {((item.value / totalAmount) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Thống kê tổng quan */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{chartData.length}</div>
            <div className="text-sm text-muted-foreground">Danh mục</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{expenses.length}</div>
            <div className="text-sm text-muted-foreground">Giao dịch</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(totalAmount / expenses.length).replace("₫", "")}₫
            </div>
            <div className="text-sm text-muted-foreground">TB/giao dịch</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{chartData[0]?.name || "N/A"}</div>
            <div className="text-sm text-muted-foreground">Chi nhiều nhất</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
