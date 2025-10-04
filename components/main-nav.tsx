'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    { href: '/', label: 'Ghi chi tiêu' },
    { href: '/attendance', label: 'Điểm danh & Tính lương' },
  ]

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {routes.map((route) => (
        <Button
          key={route.href}
          asChild
          variant={pathname === route.href ? "default" : "ghost"}
        >
          <Link href={route.href}>{route.label}</Link>
        </Button>
      ))}
    </nav>
  )
}
