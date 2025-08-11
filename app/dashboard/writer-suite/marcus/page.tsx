'use client'

import { useAuth } from '../../../../contexts/AuthContext'
import { redirect } from 'next/navigation'
import WriterSuite from '../../../../components/WriterSuite'

export default function MarcusModePage() {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) redirect('/')
  
  return (
    <WriterSuite
      onComplete={(data) => {
        console.log('Writer Suite completed:', data)
        // Navigate to production pipeline
        window.location.href = '/dashboard/production'
      }}
    />
  )
}
