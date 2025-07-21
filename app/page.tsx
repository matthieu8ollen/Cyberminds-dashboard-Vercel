'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { AuthProvider } from '../contexts/AuthContext'
import Login from '../components/Login'
import Dashboard from '../components/Dashboard'
import Loading from '../components/Loading'

function MainApp() {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || loading) {
    return <Loading />
  }

  if (!user) {
    return <Login />
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
