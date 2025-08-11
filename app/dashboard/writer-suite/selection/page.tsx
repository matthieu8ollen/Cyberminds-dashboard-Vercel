'use client'

import { useAuth } from '../../../../contexts/AuthContext'
import { redirect } from 'next/navigation'
import WriterSuiteSelection from '../../../../components/WriterSuiteSelection'

export default function WriterSuiteSelectionPage() {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) redirect('/')
  
  return (
    <WriterSuiteSelection
      onModeSelect={(mode) => {
        if (mode === 'writer-suite') {
          window.location.href = '/dashboard/writer-suite/marcus'
        } else if (mode === 'standard') {
          window.location.href = '/dashboard/standard-mode'
        }
      }}
      onBack={() => {
        window.location.href = '/dashboard/ideas/hub'
      }}
    />
  )
}
