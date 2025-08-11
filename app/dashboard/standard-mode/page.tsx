'use client'

import { useAuth } from '../../../contexts/AuthContext'
import { redirect } from 'next/navigation'
import StandardGenerator from '../../../components/StandardGenerator'

export default function StandardModePage() {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) redirect('/')
  
  return (
    <StandardGenerator
      onSwitchMode={(mode) => {
        if (mode === 'power') {
          window.location.href = '/dashboard/writer-suite/selection'
        }
      }}
      onComplete={() => {
        // Navigate to production pipeline after completion
        window.location.href = '/dashboard/production'
      }}
    />
  )
}
