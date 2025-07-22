'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { AuthProvider } from '../contexts/AuthContext'
import Login from '../components/Login'
import Dashboard from '../components/Dashboard'
import OnboardingWizard from '../components/OnboardingWizard'
import Loading from '../components/Loading'

function MainApp() {
  const { user, profile, loading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user && profile) {
      // Show onboarding if user hasn't completed it
      setShowOnboarding(!profile.onboarding_completed)
    }
  }, [user, profile])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  if (!mounted || loading) {
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
      <MainApp />
    </AuthProvider>
  )
}
