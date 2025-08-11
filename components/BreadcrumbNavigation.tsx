'use client'

import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href: string
  icon?: any
}

export default function BreadcrumbNavigation() {
  const pathname = usePathname()
  
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean)
    
    if (segments[0] !== 'dashboard') return []
    
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/dashboard/ideas/hub', icon: Home }
    ]
    
    if (segments[1] === 'ideas') {
      breadcrumbs.push({ label: 'Ideas', href: '/dashboard/ideas/hub' })
      if (segments[2] === 'hub') {
        breadcrumbs.push({ label: 'Ideas Hub', href: '/dashboard/ideas/hub' })
      } else if (segments[2] === 'library') {
        breadcrumbs.push({ label: 'Idea Library', href: '/dashboard/ideas/library' })
      } else if (segments[2] === 'talk-with-marcus') {
        breadcrumbs.push({ label: 'Talk with Marcus', href: '/dashboard/ideas/talk-with-marcus' })
      }
    } else if (segments[1] === 'writer-suite') {
      breadcrumbs.push({ label: 'Writer Suite', href: '/dashboard/writer-suite/selection' })
      if (segments[2] === 'selection') {
        breadcrumbs.push({ label: 'Mode Selection', href: '/dashboard/writer-suite/selection' })
      } else if (segments[2] === 'marcus') {
        breadcrumbs.push({ label: 'Marcus Mode', href: '/dashboard/writer-suite/marcus' })
      }
    } else if (segments[1] === 'standard-mode') {
      breadcrumbs.push({ label: 'Standard Mode', href: '/dashboard/standard-mode' })
    } else if (segments[1] === 'production') {
      breadcrumbs.push({ label: 'Production Pipeline', href: '/dashboard/production' })
    }
    
    return breadcrumbs
  }
  
  const breadcrumbs = getBreadcrumbs()
  
  if (breadcrumbs.length <= 1) return null
  
  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center">
            {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-gray-900 font-medium flex items-center">
                {crumb.icon && <crumb.icon className="w-4 h-4 mr-1" />}
                {crumb.label}
              </span>
            ) : (
              <Link 
                href={crumb.href}
                className="text-gray-600 hover:text-gray-900 flex items-center transition"
              >
                {crumb.icon && <crumb.icon className="w-4 h-4 mr-1" />}
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}
