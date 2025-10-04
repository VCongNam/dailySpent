import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MainNav } from "@/components/main-nav"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Daily Spent - Quản Lý Chi Tiêu",
  description: "Ứng dụng quản lý chi tiêu và điểm danh hằng ngày",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <header className="border-b">
              <div className="container mx-auto flex h-16 items-center px-4">
                <MainNav />
              </div>
            </header>
            <main className="flex-1 container mx-auto p-4 md:p-8">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
