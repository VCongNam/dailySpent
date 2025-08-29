"use client"

import { Clock } from "lucide-react"
import { formatGmt7DateTime } from "@/lib/utils"

interface TimeDisplayProps {
  time: string | Date
  showIcon?: boolean
  className?: string
}

export function TimeDisplay({ time, showIcon = true, className = "" }: TimeDisplayProps) {
  return (
    <div className={`flex items-center gap-1 text-xs text-muted-foreground ${className}`}>
      {showIcon && <Clock className="w-3 h-3" />}
      <span>{formatGmt7DateTime(time)}</span>
    </div>
  )
}
