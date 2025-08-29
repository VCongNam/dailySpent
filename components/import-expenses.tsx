"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-simple-toast"
import * as XLSX from "xlsx"
import { getCurrentGmt7Date } from "@/lib/utils"

interface ImportedExpense {
  amount: string
  type: string
  time: string
  note: string
}

export function ImportExpenses() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [importResults, setImportResults] = useState<{
    total: number
    success: number
    errors: string[]
  } | null>(null)
  const { toast } = useToast()

  // Chuyển đổi amount từ string có đơn vị "đ" sang number
  const parseAmount = (amountStr: string): number => {
    if (!amountStr) return 0
    // Loại bỏ ký tự "đ", dấu phẩy, khoảng trắng
    const cleanAmount = amountStr
      .toString()
      .replace(/[đ,\s]/g, "")
      .replace(/\./g, "")
    return Number.parseFloat(cleanAmount) || 0
  }

  // Chuyển đổi time từ ISO string sang date
  const parseTime = (timeStr: string): string => {
    try {
      const date = new Date(timeStr)
      return date.toISOString().split("T")[0] // Chỉ lấy phần date YYYY-MM-DD
    } catch {
      return getCurrentGmt7Date().toISOString().split("T")[0]
    }
  }

  // Map note thành category
  const mapNoteToCategory = (note: string): string => {
    const noteStr = note?.toLowerCase() || ""

    if (noteStr.includes("ăn") || noteStr.includes("uống") || noteStr.includes("phở") || noteStr.includes("cơm")) {
      return "Ăn uống"
    }
    if (noteStr.includes("xăng") || noteStr.includes("grab") || noteStr.includes("xe")) {
      return "Di chuyển"
    }
    if (noteStr.includes("mua") || noteStr.includes("siêu thị") || noteStr.includes("shop")) {
      return "Mua sắm"
    }
    if (
      noteStr.includes("điện") ||
      noteStr.includes("nước") ||
      noteStr.includes("internet") ||
      noteStr.includes("tiện ích")
    ) {
      return "Tiện ích"
    }
    if (noteStr.includes("sách") || noteStr.includes("học") || noteStr.includes("khóa")) {
      return "Giáo dục"
    }

    return "Khác"
  }

  // Đọc file Excel
  const readExcelFile = (file: File): Promise<ImportedExpense[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })

          const allExpenses: ImportedExpense[] = []

          // Đọc tất cả các sheet (tháng)
          workbook.SheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

            // Bỏ qua hàng đầu tiên (header)
            const rows = jsonData.slice(1) as any[]

            rows.forEach((row) => {
              if (row.length >= 4) {
                allExpenses.push({
                  amount: row[0],
                  type: row[1],
                  time: row[2],
                  note: row[3],
                })
              }
            })
          })

          resolve(allExpenses)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error("Không thể đọc file"))
      reader.readAsArrayBuffer(file)
    })
  }

  // Import dữ liệu vào database
  const importToDatabase = async (expenses: ImportedExpense[]) => {
    const results = {
      total: 0,
      success: 0,
      errors: [] as string[],
    }

    // Chỉ import expense, bỏ qua income
    const expenseOnly = expenses.filter((item) => item.type === "expense")
    results.total = expenseOnly.length

    for (const expense of expenseOnly) {
      try {
        const amount = parseAmount(expense.amount)
        const date = parseTime(expense.time)
        const category = mapNoteToCategory(expense.note)

        if (amount <= 0) {
          results.errors.push(`Số tiền không hợp lệ: ${expense.amount}`)
          continue
        }

        const { error } = await supabase.from("expenses").insert({
          date,
          description: expense.note || "Chi tiêu",
          amount,
          category,
        })

        if (error) {
          results.errors.push(`Lỗi import: ${expense.note} - ${error.message}`)
        } else {
          results.success++
        }
      } catch (error) {
        results.errors.push(`Lỗi xử lý: ${expense.note} - ${error}`)
      }
    }

    return results
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setImportResults(null)
    }
  }

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file để import",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Đọc file Excel
      const expenses = await readExcelFile(file)

      if (expenses.length === 0) {
        toast({
          title: "Lỗi",
          description: "Không tìm thấy dữ liệu trong file",
          variant: "destructive",
        })
        return
      }

      // Import vào database
      const results = await importToDatabase(expenses)
      setImportResults(results)

      if (results.success > 0) {
        toast({
          title: "Thành công",
          description: `Đã import ${results.success}/${results.total} chi tiêu`,
        })
      }
    } catch (error) {
      console.error("Import error:", error)
      toast({
        title: "Lỗi",
        description: "Không thể import file. Vui lòng kiểm tra định dạng file.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Import Chi Tiêu Từ Excel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="excel-file">Chọn file Excel (.xlsx, .xls)</Label>
          <Input id="excel-file" type="file" accept=".xlsx,.xls" onChange={handleFileChange} disabled={isUploading} />
        </div>

        {file && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>File đã chọn:</strong> {file.name}
            </p>
            <p className="text-xs text-muted-foreground">Kích thước: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Định dạng file Excel:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Cột A: amount (số tiền có đơn vị đ)</li>
            <li>• Cột B: type (expense hoặc income)</li>
            <li>• Cột C: time (thời gian ISO format)</li>
            <li>• Cột D: note (ghi chú mô tả)</li>
            <li>• Chỉ import các dòng có type = "expense"</li>
          </ul>
        </div>

        <Button onClick={handleImport} disabled={!file || isUploading} className="w-full">
          {isUploading ? (
            <>
              <Upload className="w-4 h-4 mr-2 animate-spin" />
              Đang import...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Import Chi Tiêu
            </>
          )}
        </Button>

        {importResults && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                Thành công: {importResults.success}/{importResults.total} chi tiêu
              </span>
            </div>

            {importResults.errors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Lỗi ({importResults.errors.length}):</span>
                </div>
                <div className="max-h-32 overflow-y-auto bg-red-50 p-3 rounded-lg">
                  {importResults.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-700">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
