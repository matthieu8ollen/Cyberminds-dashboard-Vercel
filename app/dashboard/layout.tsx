'use client'

import { AuthProvider } from '../../contexts/AuthContext'
import { ContentProvider } from '../../contexts/ContentContext'
import { WorkflowProvider } from '../../contexts/WorkflowContext'
import { ToastProvider } from '../../components/ToastNotifications'

import BreadcrumbNavigation from '../../components/BreadcrumbNavigation'

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
            <div className="min-h-screen bg-gray-50">
              <BreadcrumbNavigation />
              {children}
            </div>
          </ToastProvider>
        </WorkflowProvider>
      </ContentProvider>
    </AuthProvider>
  )
}
