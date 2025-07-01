"use client"

import { useState, useEffect } from "react"
import { ExpenseCalendar } from "@/components/expense-calendar"
import { ExpenseList } from "@/components/expense-list"
import { ExpenseForm } from "@/components/expense-form"
import { ImportExpenses } from "@/components/import-expenses"
import { supabase, type Expense, type Income } from "@/lib/supabase"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-simple-toast"
import { ExpenseChart } from "@/components/expense-chart"
import { ExpenseStats } from "@/components/expense-stats"
import { startOfMonth, endOfMonth } from "date-fns"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { IncomeForm } from "@/components/income-form"

export default function ExpenseTracker() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [allExpenses, setAllExpenses] = useState<Expense[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [showImport, setShowImport] = useState(false)
  const { toast } = useToast()
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [monthlyExpenses, setMonthlyExpenses] = useState<Expense[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)
  const [incomes, setIncomes] = useState<Income[]>([])
  const [isIncomeFormOpen, setIsIncomeFormOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)

  // Fetch all expenses
  const fetchAllExpenses = async () => {
    try {
      const { data, error } = await supabase.from("expenses").select("*").order("date", { ascending: false })

      if (error) throw error
      setAllExpenses(data || [])
    } catch (error) {
      console.error("Error fetching expenses:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách chi tiêu",
        variant: "destructive",
      })
    }
  }

  // Fetch expenses for selected date
  const fetchExpensesForDate = async (date: Date) => {
    try {
      const dateString = format(date, "yyyy-MM-dd")
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("date", dateString)
        .order("created_at", { ascending: false })

      if (error) throw error
      setExpenses(data || [])
    } catch (error) {
      console.error("Error fetching expenses for date:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải chi tiêu cho ngày này",
        variant: "destructive",
      })
    }
  }

  // Fetch all incomes
  const fetchAllIncomes = async () => {
    try {
      const { data, error } = await supabase.from("incomes").select("*").order("date", { ascending: false })
      if (error) throw error
      setIncomes(data || [])
    } catch (error) {
      console.error("Error fetching incomes:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách doanh thu",
        variant: "destructive",
      })
    }
  }

  // Add or update expense
  const handleSubmitExpense = async (expenseData: Omit<Expense, "id" | "created_at">) => {
    try {
      if (editingExpense) {
        const { error } = await supabase.from("expenses").update(expenseData).eq("id", editingExpense.id)

        if (error) throw error
        toast({
          title: "Thành công",
          description: "Đã cập nhật chi tiêu",
        })
      } else {
        const { error } = await supabase.from("expenses").insert([expenseData])

        if (error) throw error
        toast({
          title: "Thành công",
          description: "Đã thêm chi tiêu mới",
        })
      }

      setIsFormOpen(false)
      setEditingExpense(null)
      fetchAllExpenses()
      if (selectedDate) {
        fetchExpensesForDate(selectedDate)
      }
    } catch (error) {
      console.error("Error saving expense:", error)
      toast({
        title: "Lỗi",
        description: "Không thể lưu chi tiêu",
        variant: "destructive",
      })
    }
  }

  // Delete expense
  const handleDeleteExpense = async (id: string) => {
    setExpenseToDelete(id)
    setDeleteDialogOpen(true)
  }

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      fetchExpensesForDate(date)
    }
  }

  // Handle edit expense
  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setIsFormOpen(true)
  }

  // Handle add expense
  const handleAddExpense = () => {
    setEditingExpense(null)
    setIsFormOpen(true)
  }

  // Get unique expense dates for calendar
  const expenseDates = Array.from(new Set(allExpenses.map((expense) => expense.date)))

  // Fetch expenses for selected month
  const fetchExpensesForMonth = async (month: Date) => {
    try {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)

      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .gte("date", monthStart.toISOString().split("T")[0])
        .lte("date", monthEnd.toISOString().split("T")[0])
        .order("date", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching expenses for month:", error)
      return []
    }
  }

  // Add or update income
  const handleSubmitIncome = async (incomeData: Omit<Income, "id" | "created_at">) => {
    try {
      if (editingIncome) {
        const { error } = await supabase.from("incomes").update(incomeData).eq("id", editingIncome.id)
        if (error) throw error
        toast({
          title: "Thành công",
          description: "Đã cập nhật doanh thu",
        })
      } else {
        const { error } = await supabase.from("incomes").insert([incomeData])
        if (error) throw error
        toast({
          title: "Thành công",
          description: "Đã thêm doanh thu mới",
        })
      }
      setIsIncomeFormOpen(false)
      setEditingIncome(null)
      fetchAllIncomes()
    } catch (error) {
      console.error("Error saving income:", error)
      toast({
        title: "Lỗi",
        description: "Không thể lưu doanh thu",
        variant: "destructive",
      })
    }
  }

  // Handle edit income
  const handleEditIncome = (income: Income) => {
    setEditingIncome(income)
    setIsIncomeFormOpen(true)
  }

  // Handle add income
  const handleAddIncome = () => {
    setEditingIncome(null)
    setIsIncomeFormOpen(true)
  }

  // Confirm and execute delete
  const confirmDelete = async () => {
    if (!expenseToDelete) return;

    try {
      const { error } = await supabase.from("expenses").delete().eq("id", expenseToDelete);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã xóa chi tiêu",
      });

      fetchAllExpenses();
      if (selectedDate) {
        fetchExpensesForDate(selectedDate);
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa chi tiêu",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  useEffect(() => {
    fetchAllExpenses()
    fetchAllIncomes()
  }, [])

  useEffect(() => {
    if (selectedDate) {
      fetchExpensesForDate(selectedDate)
    }
  }, [selectedDate])

  useEffect(() => {
    const loadMonthlyData = async () => {
      const data = await fetchExpensesForMonth(selectedMonth)
      setMonthlyExpenses(data)
    }
    loadMonthlyData()
  }, [selectedMonth])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Quản Lý Chi Tiêu</h1>
            <p className="text-muted-foreground">Theo dõi chi tiêu hằng ngày của bạn</p>
          </div>
          <Button onClick={() => setShowImport(!showImport)} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            {showImport ? "Ẩn Import" : "Import Excel"}
          </Button>
        </div>

        {/* Import Component */}
        {showImport && (
          <div className="mb-6">
            <ImportExpenses />
          </div>
        )}

        {/* Thống kê tổng quan */}
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex gap-2">
            <Button onClick={handleAddExpense} size="sm">Thêm Chi Tiêu</Button>
            <Button onClick={handleAddIncome} size="sm" variant="secondary">Thêm Doanh Thu</Button>
          </div>
          <ExpenseStats expenses={allExpenses} incomes={incomes} selectedMonth={selectedMonth} />
        </div>

        {/* Biểu đồ chi tiêu */}
        <ExpenseChart expenses={monthlyExpenses} selectedMonth={selectedMonth} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ExpenseCalendar selectedDate={selectedDate} onDateSelect={handleDateSelect} expenseDates={expenseDates} />
          </div>

          <div>
            <ExpenseList
              selectedDate={selectedDate}
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          </div>
        </div>

        <ExpenseForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false)
            setEditingExpense(null)
          }}
          onSubmit={handleSubmitExpense}
          selectedDate={selectedDate}
          editingExpense={editingExpense}
        />

        <IncomeForm
          isOpen={isIncomeFormOpen}
          onClose={() => {
            setIsIncomeFormOpen(false)
            setEditingIncome(null)
          }}
          onSubmit={handleSubmitIncome}
          selectedDate={selectedDate}
          editingIncome={editingIncome}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa chi tiêu này? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
