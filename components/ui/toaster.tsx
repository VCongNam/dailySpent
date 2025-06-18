"use client"

import { useToast } from "@/hooks/use-toast"
import { Toast } from "./toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-0 right-0 z-50 m-4 flex max-h-screen w-full flex-col items-end space-y-2 md:max-w-[420px]">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          onClose={dismiss}
        />
      ))}
    </div>
  )
}
