'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Settings, BarChart3, User, Lightbulb, Calendar, BarChart, Rss, Sparkles, Camera } from 'lucide-react'

type ActivePage = 'ideas' | 'writer-suite' | 'standard' | 'images' | 'production' | 'plan' | 'analytics' | 'feed' | 'settings'

export default function Dashboard() {
  // State Management
  const { user, profile, signOut } = useAuth()
  
  // UI States
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const [profileMenuHoverActive, setProfileMenuHoverActive] = useState(false)
  const [profileMenuClickActive, setProfileMenuClickActive] = useState(false)
  const showProfileMenu = profileMenuHoverActive || profileMenuClickActive

  // Navigation state (no page switching - just for visual active state)
  const activePage: ActivePage = 'ideas'

  // Click outside handler for profile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuClickActive(false)
        setProfileMenuHoverActive(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Navigation Configuration
  const navigationItems = [
    { id: 'ideas', label: 'Ideas', icon: Lightbulb, href: '/dashboard/ideas/hub' },
    { id: 'writer-suite', label: 'Writer Suite', icon: Sparkles, premium: true, href: '/dashboard/writer-suite/selection' },
    { id: 'production', label: 'Production', icon: BarChart3, href: '/dashboard/production' },
    { id: 'images', label: 'Images', icon: Camera },
    { id: 'plan', label: 'Plan', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart },
    { id: 'feed', label: 'Feed', icon: Rss }
  ]

  // Utility Functions
  const getProfileDisplayName = () => {
    if (!user?.email) return 'Finance Professional'
    const email = user.email
    const firstName = email.split('@')[0].split('.')[0]
    return firstName.charAt(0).toUpperCase() + firstName.slice(1)
  }
  
  const getProfileTitle = () => (profile?.role ? profile.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Chief Financial Officer')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Premium Left Sidebar */}
      <nav 
        className={`bg-slate-800 min-h-screen fixed left-0 top-0 z-50 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarExpanded ? 'w-60' : 'w-16'
        }`}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-700 via-slate-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:brightness-110 transition-all duration-200 flex-shrink-0">
              <img src="/writer-suite-logo.png" alt="Writer Suite" className="w-5 h-5" />
            </div>
            {sidebarExpanded && (
              <div className="transition-opacity duration-300 ease-in-out">
                <span className="text-lg font-bold text-white whitespace-nowrap">Writer Suite</span>
                <div className="text-xs text-slate-400 -mt-1 whitespace-nowrap">Professional Content Creation</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-2 py-6">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.id
              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => {
                      if (item.href) {
                        window.location.href = item.href
                      } else {
                        // For pages without URLs yet, you can add console.log or handle differently
                        console.log(`Navigate to ${item.id}`)
                      }
                    }}
                    className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                      sidebarExpanded ? 'space-x-3' : 'justify-center'
                    } ${
                      isActive
                        ? 'bg-slate-700 text-white shadow-lg'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-teal-400 to-teal-600"></div>
                    )}
                    
                    <Icon className={`w-5 h-5 transition-transform duration-200 flex-shrink-0 ${
                      isActive ? 'text-teal-400' : 'group-hover:scale-110'
                    }`} />
                    
                    {sidebarExpanded && (
                      <>
                        <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
                        
                        {item.premium && (
                          <span className="bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm animate-pulse whitespace-nowrap">
                            PRO
                          </span>
                        )}
                      </>
                    )}
                  </button>
                  
                  {/* Tooltip for collapsed state */}
                  {!sidebarExpanded && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                      {item.label}
                      {item.premium && (
                        <span className="ml-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                          PRO
                        </span>
                      )}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45"></div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Profile Section at Bottom */}
        <div className="mt-auto border-t border-slate-700 p-4">
          <div 
            className="relative" 
            ref={profileMenuRef}
            onMouseEnter={() => {
              setProfileMenuHoverActive(true)
              setProfileMenuClickActive(false)
            }}
            onMouseLeave={() => {
              setProfileMenuHoverActive(false)
            }}
          >
            <button
              onClick={() => {
                setProfileMenuClickActive(!profileMenuClickActive)
                setProfileMenuHoverActive(false)
              }}
              className={`w-full flex items-center rounded-lg p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 ${
                sidebarExpanded ? 'space-x-3': 'justify-center'
              } ${showProfileMenu ? 'bg-slate-700/50 text-white' : ''}`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              
              {sidebarExpanded && (
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-white">
                    {getProfileDisplayName()}
                  </div>
                  <div className="text-xs text-slate-400 capitalize">
                    {getProfileTitle()}
                  </div>
                </div>
              )}
              
              {sidebarExpanded && (
                <div className={`text-slate-400 transition-transform duration-200 ${
                  showProfileMenu ? 'rotate-180' : ''
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
            </button>
            
            {/* Profile Dropdown Menu */}
            {showProfileMenu && sidebarExpanded && (
              <div 
                className="absolute bottom-full left-0 right-0 mb-2 bg-slate-900 rounded-lg shadow-2xl border border-slate-600 overflow-hidden transition-all duration-200 ease-out transform origin-bottom"
                onMouseEnter={() => {
                  setProfileMenuHoverActive(true)
                }}
                onMouseLeave={() => {
                  setProfileMenuHoverActive(false)
                }}
              >
                <div className="py-1">
                  <button 
                    onClick={() => {
                      // Settings navigation will be added later
                      console.log('Navigate to settings')
                      setProfileMenuClickActive(false)
                      setProfileMenuHoverActive(false)
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700">
                    <BarChart3 className="w-4 h-4 mr-3" />
                    Usage & Analytics
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700">
                    <User className="w-4 h-4 mr-3" />
                    Account Settings
                  </button>
                  <hr className="my-1 border-slate-600" />
                  <button 
                    onClick={signOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-red-600/20"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
            
            {/* Tooltip for collapsed state */}
            {!sidebarExpanded && !showProfileMenu && (
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                {getProfileDisplayName()}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45"></div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area - Page content handled by URL routing */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarExpanded ? 'ml-60' : 'ml-16'}`}>
        {/* Dashboard content now handled by layout + URL routing */}
      </div>
    </div>
  )
}
