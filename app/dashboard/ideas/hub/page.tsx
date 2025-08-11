'use client'

import { useAuth } from '../../../../contexts/AuthContext'
import { redirect } from 'next/navigation'
import IdeasWrapper from '../../../../components/IdeasWrapper'

export default function IdeasHubPage() {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) redirect('/')
  
  return (
    <IdeasWrapper 
      activeTab="hub"
      onTabChange={(tab) => {
        if (tab === 'library') {
          window.location.href = '/dashboard/ideas/library'
        }
      }}
      onNavigateToCreate={(mode, ideationData) => {
        if (mode === 'power') {
          window.location.href = '/dashboard/writer-suite/selection'
        } else if (mode === 'standard') {
          window.location.href = '/dashboard/standard-mode'
        }
      }}
      onUseInStandardMode={(idea) => {
        window.location.href = '/dashboard/standard-mode'
      }}
      onUseInWriterSuite={(idea) => {
        window.location.href = '/dashboard/writer-suite/selection'
      }}
    />
  )
}
