"use client"

import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
  onClose: (id: string) => void
}

export function Toast({ id, title, description, variant = "default", onClose }: ToastProps) {
  return (
    <div
      className={cn(
        "relative mb-2 w-full rounded-lg border p-4 shadow-md transition-all",
        variant === "destructive" ? "border-red-200 bg-red-50 text-red-900" : "border-gray-200 bg-white text-gray-900",
      )}
    >
      <button
        onClick={() => onClose(id)}
        className="absolute right-2 top-2 rounded-md p-1 text-gray-400 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="grid gap-1">
        {title && <h5 className="text-sm font-medium">{title}</h5>}
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
    </div>
  )
}
