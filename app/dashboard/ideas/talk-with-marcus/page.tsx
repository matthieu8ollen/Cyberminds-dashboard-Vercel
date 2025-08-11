'use client'

import { useAuth } from '../../../../contexts/AuthContext'
import { redirect } from 'next/navigation'
import TalkWithMarcus from '../../../../components/TalkWithMarcus'

export default function TalkWithMarcusPage() {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) redirect('/')
  
  return (
    <TalkWithMarcus
      onIdeationComplete={(ideation) => {
        console.log('Ideation completed:', ideation)
        // Could navigate to creation mode or stay here
      }}
      onNavigateToCreate={(mode, ideationData) => {
        if (mode === 'power') {
          window.location.href = '/dashboard/writer-suite/selection'
        } else if (mode === 'standard') {
          window.location.href = '/dashboard/standard-mode'
        }
      }}
    />
  )
}
