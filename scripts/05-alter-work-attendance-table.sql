-- Add attendance_type to work_attendance table
ALTER TABLE public.work_attendance
ADD COLUMN attendance_type TEXT NOT NULL DEFAULT 'full_day';

-- Add a check constraint to ensure data integrity
ALTER TABLE public.work_attendance
ADD CONSTRAINT check_attendance_type CHECK (attendance_type IN ('full_day', 'half_day'));

-- Add a comment for the new column
COMMENT ON COLUMN public.work_attendance.attendance_type IS 'Type of attendance: full_day or half_day.';
