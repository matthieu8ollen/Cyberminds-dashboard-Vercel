"use client"

import { useState } from "react"
import { Home,
        Sparkles,
        Lightbulb,
        Camera,
        BarChart3,
        Calendar,
        BarChart,
        Rss,
        Settings,
        ChevronRight,
        ChevronLeft
       } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

const items = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Writer Suite", url: "/writer-suite", icon: Sparkles },
  { title: "Ideas", url: "/ideas", icon: Lightbulb },
  { title: "Images", url: "/images", icon: Camera },
  { title: "Production", url: "/production-pipeline", icon: BarChart3 },
  { title: "Plan", url: "/plan", icon: Calendar },
  { title: "Analytics", url: "/analytics", icon: BarChart },
  { title: "Feed", url: "/feed", icon: Rss },
  { title: "Settings", url: "/settings", icon: Settings },
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
            {items.map((item) => (
  <li key={item.title}>
    <Link href={item.url}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 h-12 text-white hover:bg-teal-800 hover:text-white",
          !isExpanded && "px-3",
        )}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        {isExpanded && <span>{item.title}</span>}
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
