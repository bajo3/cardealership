"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Calendar, Car, Settings, BarChart3, Phone, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Follow-ups", href: "/follow-ups", icon: Phone },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Vehicles", href: "/vehicles", icon: Car },
  { name: "Tasks", href: "/tasks", icon: ClipboardList },
  { name: "Admin", href: "/admin", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 shrink-0 items-center px-4">
        <Car className="h-8 w-8 text-white" />
        <span className="ml-2 text-xl font-bold text-white">AutoCRM</span>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
              )}
            >
              <item.icon
                className={cn(
                  isActive ? "text-white" : "text-gray-400 group-hover:text-white",
                  "mr-3 h-5 w-5 flex-shrink-0",
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
