'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { AuthProvider } from '../contexts/AuthContext'
import { ContentProvider } from '../contexts/ContentContext'
import { WorkflowProvider } from '../contexts/WorkflowContext'
import { ToastProvider } from '../components/ToastNotifications'
import { redirect } from 'next/navigation'
import Login from '../components/Login'
import Dashboard from '../components/Dashboard'
import OnboardingWizard from '../components/OnboardingWizard'
import Loading from '../components/Loading'


function MainApp() {
  const { user, profile, loading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Only set initialLoad to false when we have definitive auth state
    if (user && profile) {
      setShowOnboarding(!profile.onboarding_completed)
      setInitialLoad(false)
    } else if (!loading && !user) {
      // Auth check is complete and no user found
      setInitialLoad(false)
    }
  }, [user, profile, loading])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  // Show loading during hydration and initial auth check
  if (!mounted || initialLoad) {
    return <Loading />
  }

  // Show loading only during actual auth operations (not initial check)
  if (loading && user === null) {
    return <Loading />
  }

  if (!user) {
    return <Login />
  }

  if (showOnboarding) {
  return <OnboardingWizard onComplete={handleOnboardingComplete} />
}

return <Dashboard />
}

export default function Home() {
  return (
    <AuthProvider>
      <ContentProvider>
        <WorkflowProvider>
          <ToastProvider>
            <MainApp />
          </ToastProvider>
        </WorkflowProvider>
      </ContentProvider>
    </AuthProvider>
  )
}
