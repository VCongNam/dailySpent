-- Kiểm tra dữ liệu đã được tạo
SELECT 
  COUNT(*) as total_expenses,
  SUM(amount) as total_amount,
  MIN(date) as earliest_date,
  MAX(date) as latest_date
FROM expenses;

-- Xem chi tiêu theo danh mục
SELECT 
  category,
  COUNT(*) as count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount
FROM expenses 
GROUP BY category 
ORDER BY total_amount DESC;

-- Xem chi tiêu theo ngày
SELECT 
  date,
  COUNT(*) as count,
  SUM(amount) as daily_total
FROM expenses 
GROUP BY date 
ORDER BY date DESC;
