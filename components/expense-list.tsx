"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import type { Expense } from "@/lib/supabase"

interface ExpenseListProps {
  selectedDate: Date | undefined
  expenses: Expense[]
  onAddExpense: () => void
  onEditExpense: (expense: Expense) => void
  onDeleteExpense: (id: string) => void
}

export function ExpenseList({
  selectedDate,
  expenses,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
}: ExpenseListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Ăn uống": "bg-orange-100 text-orange-800",
      "Di chuyển": "bg-blue-100 text-blue-800",
      "Mua sắm": "bg-green-100 text-green-800",
      "Giáo dục": "bg-purple-100 text-purple-800",
      "Tiện ích": "bg-yellow-100 text-yellow-800",
      Khác: "bg-gray-100 text-gray-800",
    }
    return colors[category] || colors["Khác"]
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Chi Tiêu {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: vi }) : "Hôm Nay"}
          </CardTitle>
          <Button onClick={onAddExpense} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Thêm Chi Tiêu
          </Button>
        </div>
        {expenses.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Tổng: <span className="font-semibold text-primary">{formatCurrency(totalAmount)}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Chưa có chi tiêu nào trong ngày này</p>
            <Button onClick={onAddExpense} variant="outline" className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Thêm Chi Tiêu Đầu Tiên
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{expense.description}</span>
                    <Badge className={getCategoryColor(expense.category)}>{expense.category}</Badge>
                  </div>
                  <div className="text-lg font-semibold text-primary">{formatCurrency(expense.amount)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEditExpense(expense)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDeleteExpense(expense.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
