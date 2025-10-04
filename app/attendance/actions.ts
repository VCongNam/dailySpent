'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'

export async function addAttendance(dateString: string, attendanceType: 'full_day' | 'half_day') {
  if (!dateString) {
    return { error: 'Please select a date.' }
  }

  const { error } = await supabase
    .from('work_attendance')
    .upsert(
      { date: dateString, attendance_type: attendanceType },
      { onConflict: 'date' } // Specify the column that might conflict
    )

  if (error) {
    console.error('Supabase error:', error)
    return { error: 'Failed to check in. Please try again.' }
  }

  revalidatePath('/attendance')
  return { success: `Successfully checked in for ${dateString} as ${attendanceType.replace('_', ' ')}!` }
}

export async function deleteAttendance(dateString: string) {
  if (!dateString) {
    return { error: 'Please select a date to delete.' };
  }

  const { error } = await supabase
    .from('work_attendance')
    .delete()
    .eq('date', dateString);

  if (error) {
    console.error('Supabase delete error:', error);
    return { error: 'Failed to delete attendance. Please try again.' };
  }

  revalidatePath('/attendance');
  return { success: `Successfully deleted attendance for ${dateString}!` };
}
