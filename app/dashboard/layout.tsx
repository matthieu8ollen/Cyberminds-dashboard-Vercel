'use client'

import { AuthProvider } from '../../contexts/AuthContext'
import { ContentProvider } from '../../contexts/ContentContext'
import { WorkflowProvider } from '../../contexts/WorkflowContext'
import { ToastProvider } from '../../components/ToastNotifications'

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
            {children}
          </ToastProvider>
        </WorkflowProvider>
      </ContentProvider>
    </AuthProvider>
  )
}
