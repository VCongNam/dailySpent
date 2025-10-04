'use client'

import { useState, useEffect, useMemo } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Toaster, toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { addAttendance, deleteAttendance } from './actions'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

type AttendanceType = 'full_day' | 'half_day'
interface AttendedDay {
  date: Date
  type: AttendanceType
}

// --- Helper Functions ---
const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const isSunday = (date: Date) => date.getDay() === 0;

// Correctly formats a Date object to 'YYYY-MM-DD' in the local timezone.
const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- Main Page Component ---
export default function AttendancePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [attendedDays, setAttendedDays] = useState<AttendedDay[]>([])
  const [monthlySalary, setMonthlySalary] = useState<number>(0)

  const selectedDayInfo = useMemo(() => {
    if (!date) return null;
    const formattedSelectedDate = formatDate(date);
    return attendedDays.find(d => formatDate(d.date) === formattedSelectedDate) || null;
  }, [date, attendedDays]);

  useEffect(() => {
    async function fetchAttendance() {
      setLoading(true);
      const { data, error } = await supabase.from('work_attendance').select('date, attendance_type')

      if (error) {
        toast.error('Lỗi khi tải dữ liệu điểm danh.', { description: error.message })
      } else if (data) {
        const dates = data.map((item: { date: string; attendance_type: AttendanceType }) => ({
          // When creating a Date from a 'YYYY-MM-DD' string, it's interpreted as UTC.
          // Adding 'T00:00:00' makes it parse as local time, avoiding timezone shifts on display.
          date: new Date(item.date + 'T00:00:00'),
          type: item.attendance_type,
        }))
        setAttendedDays(dates)
      }
      setLoading(false);
    }
    fetchAttendance()
  }, [])

  const handleCheckIn = async (attendanceType: AttendanceType) => {
    if (!date) { toast.error('Vui lòng chọn ngày.'); return }
    setLoading(true)
    try {
      const dateString = formatDate(date);
      const result = await addAttendance(dateString, attendanceType)
      if (result.error) {
        toast.error(selectedDayInfo ? 'Sửa điểm danh thất bại.' : 'Điểm danh thất bại.', { description: result.error })
      } else if (result.success) {
        toast.success(result.success)
        setAttendedDays(prev => {
          const newAttendance = { date, type: attendanceType };
          const existingIndex = prev.findIndex(d => formatDate(d.date) === dateString);
          if (existingIndex !== -1) {
            const updatedDays = [...prev];
            updatedDays[existingIndex] = newAttendance;
            return updatedDays;
          }
          return [...prev, newAttendance];
        })
      }
    } catch (e) {
        console.error('Lỗi điểm danh:', e)
        toast.error('Đã có lỗi không mong muốn xảy ra.')
    } finally {
        setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!date) { toast.error('Vui lòng chọn ngày để xóa.'); return }
    setLoading(true);
    try {
        const dateString = formatDate(date);
        const result = await deleteAttendance(dateString);
        if (result.error) {
            toast.error('Xóa điểm danh thất bại.', { description: result.error });
        } else if (result.success) {
            toast.success(result.success);
            setAttendedDays(prev => prev.filter(d => formatDate(d.date) !== dateString));
        }
    } catch (e) {
        console.error('Lỗi xóa điểm danh:', e);
        toast.error('Đã có lỗi không mong muốn xảy ra khi xóa.');
    } finally {
        setLoading(false);
    }
  }

  const salaryData = useMemo(() => {
    const month = currentMonth.getMonth()
    const year = currentMonth.getFullYear()
    const totalDaysInMonth = getDaysInMonth(currentMonth)
    let workingDaysInMonth = 0;
    for (let i = 1; i <= totalDaysInMonth; i++) {
        if (!isSunday(new Date(year, month, i))) {
            workingDaysInMonth++;
        }
    }
    const actualWorkedDays = attendedDays
      .filter(d => d.date.getMonth() === month && d.date.getFullYear() === year)
      .reduce((acc, day) => acc + (day.type === 'full_day' ? 1 : 0.5), 0)

    const dailyRate = monthlySalary > 0 && workingDaysInMonth > 0 ? monthlySalary / workingDaysInMonth : 0
    const calculatedSalary = dailyRate * actualWorkedDays

    return { workingDaysInMonth, actualWorkedDays, calculatedSalary, dailyRate }
  }, [attendedDays, monthlySalary, currentMonth])

  const modifiers = {
    full_day: attendedDays.filter(d => d.type === 'full_day').map(d => d.date),
    half_day: attendedDays.filter(d => d.type === 'half_day').map(d => d.date),
    sunday: isSunday,
  }

  const modifiersStyles = {
    full_day: { backgroundColor: 'hsl(var(--chart-2))', color: 'hsl(var(--primary-foreground))' },
    half_day: { backgroundColor: 'hsl(var(--chart-4))', color: 'hsl(var(--secondary-foreground))' },
    sunday: { color: 'hsl(var(--destructive))' },
  }

  return (
    <div className="w-full">
      <Toaster richColors position="top-center" />
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-auto flex-shrink-0 flex justify-center">
          <Card className="w-full max-w-md lg:max-w-none">
            <CardHeader><CardTitle>Lịch Điểm Danh</CardTitle><CardDescription>Chọn ngày, Chủ nhật được tô đỏ.</CardDescription></CardHeader>
            <CardContent className="flex justify-center"><Calendar mode="single" selected={date} onSelect={setDate} month={currentMonth} onMonthChange={setCurrentMonth} className="rounded-md border" modifiers={modifiers} modifiersStyles={modifiersStyles} disabled={isSunday} /></CardContent>
          </Card>
        </div>

        <div className="w-full lg:flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý Ngày Công</CardTitle>
              <CardDescription>{date ? `Ngày đã chọn: ${formatDate(date)}` : 'Chọn một ngày trên lịch'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDayInfo && (
                <div className='text-sm font-semibold p-3 bg-muted rounded-md text-center'>
                  Trạng thái: {selectedDayInfo.type === 'full_day' ? 'Đã điểm danh (Cả ngày)' : 'Đã điểm danh (Nửa ngày)'}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Button onClick={() => handleCheckIn('full_day')} disabled={loading || !date || (date && isSunday(date))} >{selectedDayInfo ? 'Đổi sang Cả ngày' : 'Điểm danh (Cả ngày)'}</Button>
                <Button onClick={() => handleCheckIn('half_day')} disabled={loading || !date || (date && isSunday(date))} variant="secondary">{selectedDayInfo ? 'Đổi sang Nửa ngày' : 'Điểm danh (Nửa ngày)'}</Button>
              </div>
              {selectedDayInfo && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full" disabled={loading}>Xóa điểm danh</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle><AlertDialogDescription>Hành động này sẽ xóa dữ liệu điểm danh của ngày {date ? formatDate(date) : ''}. Bạn không thể hoàn tác.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Tính Lương Tháng</CardTitle><CardDescription>Nhập lương để xem tính toán chi tiết.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label htmlFor="salary">Lương tháng (nếu làm đủ)</Label><Input id="salary" type="number" placeholder="Ví dụ: 10000000" value={monthlySalary || ''} onChange={(e) => setMonthlySalary(Number(e.target.value))} /></div>
              <div className="space-y-2 text-sm p-4 bg-muted rounded-lg">
                <p>Tháng đang xem: <strong>{currentMonth.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}</strong></p>
                <p>Số ngày làm việc của tháng (trừ CN): <strong>{salaryData.workingDaysInMonth}</strong></p>
                <p>Lương một ngày công (ước tính): <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(salaryData.dailyRate)}</strong></p>
                <hr className="my-2"/>
                <p>Số ngày công thực tế: <strong>{salaryData.actualWorkedDays}</strong></p>
                <p className="text-base font-semibold">Lương thực nhận (dự tính): <strong className="text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(salaryData.calculatedSalary)}</strong></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
