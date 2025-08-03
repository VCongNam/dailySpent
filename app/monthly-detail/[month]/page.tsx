"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Edit, Trash, TrendingUp, TrendingDown } from "lucide-react"
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns"
import { vi } from "date-fns/locale"
import { supabase, type Expense, type Income } from "@/lib/supabase"
import { useToast } from "@/hooks/use-simple-toast"
import { ExpenseForm } from "@/components/expense-form"
import { IncomeForm } from "@/components/income-form"
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

export default function MonthlyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false)
  const [isIncomeFormOpen, setIsIncomeFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string | number, type: 'expense' | 'income' } | null>(null)

  // Parse month from URL params
  const monthParam = params.month as string
  const selectedMonth = parseISO(monthParam)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  // Fetch data for the selected month
  const fetchMonthlyData = async () => {
    try {
      const monthStart = startOfMonth(selectedMonth)
      const monthEnd = endOfMonth(selectedMonth)

      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select("*")
        .gte("date", monthStart.toISOString().split("T")[0])
        .lte("date", monthEnd.toISOString().split("T")[0])
        .order("date", { ascending: false })

      if (expensesError) throw expensesError

      // Fetch incomes
      const { data: incomesData, error: incomesError } = await supabase
        .from("incomes")
        .select("*")
        .gte("date", monthStart.toISOString().split("T")[0])
        .lte("date", monthEnd.toISOString().split("T")[0])
        .order("date", { ascending: false })

      if (incomesError) throw incomesError

      setExpenses(expensesData || [])
      setIncomes(incomesData || [])
    } catch (error) {
      console.error("Error fetching monthly data:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu tháng này",
        variant: "destructive",
      })
    }
  }

  // Handle expense operations
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
      setIsExpenseFormOpen(false)
      setEditingExpense(null)
      fetchMonthlyData()
    } catch (error) {
      console.error("Error saving expense:", error)
      toast({
        title: "Lỗi",
        description: "Không thể lưu chi tiêu",
        variant: "destructive",
      })
    }
  }

  // Handle income operations
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
      fetchMonthlyData()
    } catch (error) {
      console.error("Error saving income:", error)
      toast({
        title: "Lỗi",
        description: "Không thể lưu doanh thu",
        variant: "destructive",
      })
    }
  }

  // Handle delete
  const handleDelete = (id: string | number, type: 'expense' | 'income') => {
    setItemToDelete({ id, type })
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      const { error } = await supabase
        .from(itemToDelete.type === 'expense' ? 'expenses' : 'incomes')
        .delete()
        .eq('id', itemToDelete.id)

      if (error) throw error

      toast({
        title: "Thành công",
        description: `Đã xóa ${itemToDelete.type === 'expense' ? 'chi tiêu' : 'doanh thu'}`,
      })

      fetchMonthlyData()
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalIncomes = incomes.reduce((sum, income) => sum + income.amount, 0)
  const balance = totalIncomes - totalExpenses

  useEffect(() => {
    fetchMonthlyData()
  }, [monthParam])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                Chi Tiết Tháng {format(selectedMonth, "MMMM yyyy", { locale: vi })}
              </h1>
              <p className="text-muted-foreground">
                Xem chi tiết chi tiêu và doanh thu
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Doanh Thu</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncomes)}</div>
              <p className="text-xs text-muted-foreground">{incomes.length} giao dịch</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Chi Tiêu</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
              <p className="text-xs text-muted-foreground">{expenses.length} giao dịch</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Số Dư</CardTitle>
              <Badge variant={balance >= 0 ? "default" : "destructive"}>
                {balance >= 0 ? "Thặng dư" : "Thâm hụt"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? "text-blue-600" : "text-red-600"}`}>
                {formatCurrency(balance)}
              </div>
              <p className="text-xs text-muted-foreground">
                {balance >= 0 ? "Thu nhập > Chi tiêu" : "Chi tiêu > Thu nhập"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Expenses and Incomes */}
        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expenses">Chi Tiêu ({expenses.length})</TabsTrigger>
            <TabsTrigger value="incomes">Doanh Thu ({incomes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Danh Sách Chi Tiêu</h3>
              <Button onClick={() => setIsExpenseFormOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Thêm Chi Tiêu
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Danh mục</TableHead>
                      <TableHead className="text-right">Số tiền</TableHead>
                      <TableHead className="text-center">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{format(new Date(expense.date), "dd/MM/yyyy")}</TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{expense.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingExpense(expense)
                                setIsExpenseFormOpen(true)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(expense.id, 'expense')}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {expenses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Không có chi tiêu nào trong tháng này
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incomes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Danh Sách Doanh Thu</h3>
              <Button onClick={() => setIsIncomeFormOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Thêm Doanh Thu
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Danh mục</TableHead>
                      <TableHead className="text-right">Số tiền</TableHead>
                      <TableHead className="text-center">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomes.map((income) => (
                      <TableRow key={income.id}>
                        <TableCell>{format(new Date(income.date), "dd/MM/yyyy")}</TableCell>
                        <TableCell>{income.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{income.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(income.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingIncome(income)
                                setIsIncomeFormOpen(true)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(income.id, 'income')}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {incomes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Không có doanh thu nào trong tháng này
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Forms */}
        <ExpenseForm
          isOpen={isExpenseFormOpen}
          onClose={() => {
            setIsExpenseFormOpen(false)
            setEditingExpense(null)
          }}
          onSubmit={handleSubmitExpense}
          selectedDate={selectedMonth}
          editingExpense={editingExpense}
        />

        <IncomeForm
          isOpen={isIncomeFormOpen}
          onClose={() => {
            setIsIncomeFormOpen(false)
            setEditingIncome(null)
          }}
          onSubmit={handleSubmitIncome}
          selectedDate={selectedMonth}
          editingIncome={editingIncome}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa {itemToDelete?.type === 'expense' ? 'chi tiêu' : 'doanh thu'} này? 
                Hành động này không thể hoàn tác.
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