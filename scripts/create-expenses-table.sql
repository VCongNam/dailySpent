-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on date for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- Insert some sample data
INSERT INTO expenses (date, description, amount, category) VALUES
  ('2024-01-15', 'Ăn sáng', 25000, 'Ăn uống'),
  ('2024-01-15', 'Xăng xe', 150000, 'Di chuyển'),
  ('2024-01-15', 'Cà phê', 35000, 'Ăn uống'),
  ('2024-01-16', 'Ăn trưa', 45000, 'Ăn uống'),
  ('2024-01-16', 'Mua sách', 120000, 'Giáo dục'),
  ('2024-01-17', 'Siêu thị', 250000, 'Mua sắm'),
  ('2024-01-17', 'Điện thoại', 200000, 'Tiện ích'),
  ('2024-01-18', 'Ăn tối', 80000, 'Ăn uống');
