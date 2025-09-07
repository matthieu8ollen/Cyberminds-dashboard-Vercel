"use client"

import { useState } from "react"
import {
  Home,
  Plus,
  Lightbulb,
  Folder,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

const navigationItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: Plus, label: "Create Content", href: "/create" },
  { icon: Lightbulb, label: "Ideas Hub", href: "/ideas-hub" },
  { icon: Folder, label: "Production Pipeline", href: "/production-pipeline" },
  { icon: Calendar, label: "Calendar", href: "/content-calendar" },
  { icon: ImageIcon, label: "Image Generation", href: "/image-generation" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export function SidebarNavigation() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className={cn(
        "relative h-full bg-gradient-to-b from-teal-900 to-teal-950 border-r border-teal-800 transition-all duration-300 flex-shrink-0",
        isExpanded ? "w-64" : "w-16",
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-teal-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 relative flex-shrink-0">
              <Image
                src="/writer-suite-logo.png"
                alt="Writer Suite"
                width={32}
                height={32}
                className="rounded-lg object-cover"
              />
            </div>
            {isExpanded && <span className="font-bold text-white">Writer Suite</span>}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            {navigationItems.map((item) => (
              <li key={item.label}>
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-12 text-white hover:bg-teal-800 hover:text-white",
                      !isExpanded && "px-3",
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {isExpanded && <span>{item.label}</span>}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Toggle Button */}
        <div className="p-2 border-t border-teal-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full justify-center text-white hover:bg-teal-800 hover:text-white"
          >
            {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
