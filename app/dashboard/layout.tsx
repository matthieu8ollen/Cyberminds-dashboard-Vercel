'use client'

import { AuthProvider } from '../../contexts/AuthContext'
import { ContentProvider } from '../../contexts/ContentContext'
import { WorkflowProvider } from '../../contexts/WorkflowContext'
import { ToastProvider } from '../../components/ToastNotifications'
import BreadcrumbNavigation from '../../components/BreadcrumbNavigation'
import Dashboard from '../../components/Dashboard'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ContentProvider>
        <WorkflowProvider>
          <ToastProvider>
            <div className="flex min-h-screen bg-gray-50">
              {/* Dashboard Sidebar */}
              <Dashboard />
              
              {/* Main Content Area */}
              <div className="flex-1 flex flex-col">
                <BreadcrumbNavigation />
                <main className="flex-1">
                  {children}
                </main>
              </div>
            </div>
          </ToastProvider>
        </WorkflowProvider>
      </ContentProvider>
    </AuthProvider>
  )
}
