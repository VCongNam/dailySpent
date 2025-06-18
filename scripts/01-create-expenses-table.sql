-- Tạo bảng expenses để lưu trữ chi tiêu
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo index trên cột date để tăng hiệu suất truy vấn
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- Bật Row Level Security (RLS) - tùy chọn để bảo mật
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Tạo policy cho phép tất cả người dùng đọc và ghi (có thể điều chỉnh sau)
CREATE POLICY "Enable all operations for all users" ON expenses
FOR ALL USING (true) WITH CHECK (true);
