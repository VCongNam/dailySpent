import type React from "react"
import type { Metadata } from "next"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "./globals.css"

export const metadata: Metadata = {
  title: "Quản Lý Chi Tiêu",
  description: "Ứng dụng quản lý chi tiêu hằng ngày",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body>
        {children}
        <ToastContainer />
      </body>
    </html>
  )
}
