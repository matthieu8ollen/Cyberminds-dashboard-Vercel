"use client"

import { useState } from "react"
import { 
  Home, Plus, Lightbulb, Folder, Calendar, BarChart3, Settings, 
  Sparkles, Zap, ImageIcon, Rss 
} from "lucide-react"
import Link from "next/link"

const navigationItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard', href: '/' },
  { id: 'writer-suite', icon: Sparkles, label: 'Writer Suite', href: '/writer-suite' },
  { id: 'ideas', icon: Lightbulb, label: 'Ideas', href: '/ideas' },
  { id: 'images', icon: ImageIcon, label: 'Images', href: '/images' },
  { id: 'production', icon: Folder, label: 'Production', href: '/production' },
  { id: 'plan', icon: Calendar, label: 'Plan', href: '/plan' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { id: 'feed', icon: Rss, label: 'Feed', href: '/feed' },
  { id: 'settings', icon: Settings, label: 'Settings', href: '/settings' },
]

export function AppSidebar() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700 z-10 transition-all duration-300 ${
        sidebarExpanded ? 'w-60' : 'w-16'
      }`}
      onMouseEnter={() => setSidebarExpanded(true)}
      onMouseLeave={() => setSidebarExpanded(false)}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-slate-700">
        <Link href="/" className="flex items-center space-x-3 w-full hover:bg-slate-700/30 rounded-lg p-2 -m-2 transition-colors">
          <div className="w-8 h-8 bg-gradient-to-br from-slate-700 via-slate-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:brightness-110 transition-all duration-200 flex-shrink-0">
            <img src="/writer-suite-logo.png" alt="Writer Suite" className="w-5 h-5" />
          </div>
          {sidebarExpanded && (
            <div className="transition-opacity duration-300 ease-in-out text-left">
              <span className="text-lg font-bold text-white whitespace-nowrap">Writer Suite</span>
              <div className="text-xs text-slate-400 -mt-1 whitespace-nowrap">Professional Content Creation</div>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-2 py-6">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.id} href={item.href}>
                <button className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                  sidebarExpanded ? 'space-x-3' : 'justify-center'
                } text-slate-300 hover:text-white hover:bg-slate-700/50`}>
                  <Icon className="w-5 h-5 transition-transform duration-200 flex-shrink-0" />
                  {sidebarExpanded && (
                    <span className="transition-all duration-300 ease-in-out whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </button>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
