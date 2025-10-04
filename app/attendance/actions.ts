'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'

export async function addAttendance(date: Date, attendanceType: 'full_day' | 'half_day') {
  if (!date) {
    return { error: 'Please select a date.' }
  }

  const formattedDate = date.toISOString().split('T')[0]

  const { error } = await supabase
    .from('work_attendance')
    .upsert(
      { date: formattedDate, attendance_type: attendanceType },
      { onConflict: 'date' } // Specify the column that might conflict
    )

  if (error) {
    console.error('Supabase error:', error)
    return { error: 'Failed to check in. Please try again.' }
  }

  revalidatePath('/attendance')
  return { success: `Successfully checked in for ${formattedDate} as ${attendanceType.replace('_', ' ')}!` }
}

export async function deleteAttendance(date: Date) {
  if (!date) {
    return { error: 'Please select a date to delete.' };
  }

  const formattedDate = date.toISOString().split('T')[0];

  const { error } = await supabase
    .from('work_attendance')
    .delete()
    .eq('date', formattedDate);

  if (error) {
    console.error('Supabase delete error:', error);
    return { error: 'Failed to delete attendance. Please try again.' };
  }

  revalidatePath('/attendance');
  return { success: `Successfully deleted attendance for ${formattedDate}!` };
}
