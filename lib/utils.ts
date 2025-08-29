import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Timezone utilities for GMT+7
export const TIMEZONE_OFFSET = 7 * 60 // 7 hours in minutes

/**
 * Convert UTC date to GMT+7
 */
export function utcToGmt7(utcDate: string | Date): Date {
  const date = new Date(utcDate)
  // Add 7 hours to UTC time
  return new Date(date.getTime() + (TIMEZONE_OFFSET * 60000))
}

/**
 * Convert GMT+7 date to UTC
 */
export function gmt7ToUtc(gmt7Date: Date): Date {
  // Subtract 7 hours from GMT+7 time
  return new Date(gmt7Date.getTime() - (TIMEZONE_OFFSET * 60000))
}

/**
 * Get current date in GMT+7
 */
export function getCurrentGmt7Date(): Date {
  const now = new Date()
  return utcToGmt7(now)
}

/**
 * Format date for display in GMT+7
 */
export function formatGmt7Date(date: string | Date, formatStr: string = "dd/MM/yyyy"): string {
  const gmt7Date = utcToGmt7(date)
  return gmt7Date.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * Format datetime for display in GMT+7
 */
export function formatGmt7DateTime(date: string | Date): string {
  const gmt7Date = utcToGmt7(date)
  return gmt7Date.toLocaleString('vi-VN', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
