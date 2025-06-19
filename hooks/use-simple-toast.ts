"use client"

import { toast as toastify } from "react-toastify"

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
      toastify.error(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    } else {
      toastify.success(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  }

  return { toast }
}
