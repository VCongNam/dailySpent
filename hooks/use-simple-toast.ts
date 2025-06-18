"use client"

export function useToast() {
  const toast = ({
    title,
    description,
    variant,
  }: {
    title?: string
    description?: string
    variant?: "default" | "destructive"
  }) => {
    const message = title && description ? `${title}: ${description}` : title || description || "Thông báo"

    if (variant === "destructive") {
      alert(`❌ ${message}`)
    } else {
      alert(`✅ ${message}`)
    }
  }

  return { toast }
}
