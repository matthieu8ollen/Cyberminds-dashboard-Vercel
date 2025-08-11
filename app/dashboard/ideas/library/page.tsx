'use client'

import { useAuth } from '../../../../contexts/AuthContext'
import { redirect } from 'next/navigation'
import IdeasWrapper from '../../../../components/IdeasWrapper'

export default function IdeasLibraryPage() {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) redirect('/')
  
  return (
    <IdeasWrapper 
      activeTab="library"
      onTabChange={(tab) => {
        if (tab === 'hub') {
          window.location.href = '/dashboard/ideas/hub'
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
