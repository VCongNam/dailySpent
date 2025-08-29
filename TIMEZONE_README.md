# Timezone Configuration - GMT+7

## Tổng quan

Ứng dụng này đã được cấu hình để hoạt động với timezone GMT+7 (Việt Nam). Tất cả thời gian được hiển thị theo múi giờ Việt Nam, trong khi database vẫn lưu trữ theo UTC.

## Cấu hình Database

Database sử dụng `TIMESTAMP WITH TIME ZONE` để lưu trữ thời gian:
```sql
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

Điều này đảm bảo:
- Thời gian được lưu trữ theo UTC (đúng)
- Không mất thông tin timezone
- Có thể chuyển đổi sang bất kỳ timezone nào

## Utility Functions

### `lib/utils.ts`

Các function xử lý timezone:

```typescript
// Chuyển đổi UTC sang GMT+7
utcToGmt7(utcDate: string | Date): Date

// Chuyển đổi GMT+7 sang UTC
gmt7ToUtc(gmt7Date: Date): Date

// Lấy thời gian hiện tại theo GMT+7
getCurrentGmt7Date(): Date

// Format ngày tháng theo GMT+7
formatGmt7Date(date: string | Date): string

// Format ngày giờ theo GMT+7
formatGmt7DateTime(date: string | Date): string
```

## Sử dụng trong Components

### 1. Hiển thị thời gian

Sử dụng component `TimeDisplay`:
```tsx
import { TimeDisplay } from "@/components/ui/time-display"

<TimeDisplay time={expense.created_at} />
```

### 2. Tạo ngày mới

Thay vì `new Date()`, sử dụng:
```tsx
import { getCurrentGmt7Date } from "@/lib/utils"

const currentDate = getCurrentGmt7Date()
```

### 3. Format thời gian

```tsx
import { formatGmt7DateTime } from "@/lib/utils"

const formattedTime = formatGmt7DateTime(expense.created_at)
```

## Ví dụ

### Database timestamp: `2025-06-17 15:58:09.870603+00`
- **UTC**: 15:58:09 17/06/2025
- **GMT+7**: 22:58:09 17/06/2025

### Hiển thị trong ứng dụng:
- **Tạo lúc**: 22:58:09 17/06/2025 (GMT+7)

## Lưu ý quan trọng

1. **Không thay đổi database**: Database vẫn lưu UTC, chỉ hiển thị GMT+7
2. **Consistency**: Tất cả thời gian trong ứng dụng đều hiển thị GMT+7
3. **Performance**: Chuyển đổi timezone được thực hiện ở frontend, không ảnh hưởng database

## Testing

Để test timezone, có thể sử dụng:

```typescript
import { utcToGmt7, formatGmt7DateTime } from "@/lib/utils"

const dbTime = "2025-06-17 15:58:09.870603+00"
const gmt7Time = utcToGmt7(dbTime)
console.log(formatGmt7DateTime(gmt7Time))
// Output: 22:58:09 17/06/2025
```
