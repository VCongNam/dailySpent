"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { format } from "date-fns"
import type { Income } from "@/lib/supabase"

interface IncomeFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (income: Omit<Income, "id" | "created_at">) => void
  selectedDate: Date | undefined
  editingIncome?: Income | null
}

const incomeCategories = ["Lương", "Thưởng", "Kinh doanh", "Đầu tư", "Khác"]

export function IncomeForm({ isOpen, onClose, onSubmit, selectedDate, editingIncome }: IncomeFormProps) {
  const [formData, setFormData] = useState({
    date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    description: "",
    amount: "",
    category: "",
  })

  useEffect(() => {
    if (editingIncome) {
      setFormData({
        date: editingIncome.date,
        description: editingIncome.description,
        amount: editingIncome.amount.toString(),
        category: editingIncome.category,
      })
    } else {
      setFormData({
        date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        description: "",
        amount: "",
        category: "",
      })
    }
  }, [editingIncome, selectedDate, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.description || !formData.amount || !formData.category) return

    onSubmit({
      date: formData.date,
      description: formData.description,
      amount: Number.parseFloat(formData.amount),
      category: formData.category,
    })

    setFormData({
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      description: "",
      amount: "",
      category: "",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingIncome ? "Sửa Doanh Thu" : "Thêm Doanh Thu Mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Ngày</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Nhập mô tả doanh thu..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Số tiền (VNĐ)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                min="0"
                step="1000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Danh mục</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {incomeCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">{editingIncome ? "Cập Nhật" : "Thêm"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 