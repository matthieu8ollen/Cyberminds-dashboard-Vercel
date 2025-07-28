'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, getUserProfile, createUserProfile, UserProfile } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isSessionValid: boolean
  signUp: (email: string, password: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  refreshSession: () => Promise<void>
  stayLoggedIn: boolean
  setStayLoggedInPreference: (shouldStayLoggedIn: boolean) => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSessionValid, setIsSessionValid] = useState(true)
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [stayLoggedIn, setStayLoggedIn] = useState(false)

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (error) {
          console.error('Session error:', error)
          setIsSessionValid(false)
          setLoading(false)
          return
        }

        if (session?.user) {
          setUser(session.user)
          setIsSessionValid(true)
          setLastActivity(Date.now())
          
          // Initialize stay logged in preference from localStorage
          const savedStayLoggedIn = localStorage.getItem('writer-suite-stay-logged-in')
          setStayLoggedIn(savedStayLoggedIn === 'true')
          
          await loadUserProfile(session.user.id)
        } else {
          setIsSessionValid(false)
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setUser(null)
          setProfile(null)
          setIsSessionValid(false)
          setLoading(false)
        }
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        console.log('🔄 Auth state changed:', event)
        
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          setLastActivity(Date.now())
        }
        
        if (session?.user) {
          setUser(session.user)
          setIsSessionValid(true)
          if (event !== 'TOKEN_REFRESHED') {
            await loadUserProfile(session.user.id)
          }
        } else {
          setUser(null)
          setProfile(null)
          setIsSessionValid(false)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Session timeout checker
  useEffect(() => {
    if (!user) return

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          console.log('⚠️ Session expired or invalid')
          setIsSessionValid(false)
          setUser(null)
          setProfile(null)
          return
        }

        // Check if session is close to expiring (within 5 minutes)
        const expiresAt = session.expires_at
        const now = Math.floor(Date.now() / 1000)
        const timeUntilExpiry = expiresAt ? expiresAt - now : 0

        if (timeUntilExpiry < 300) { // Less than 5 minutes
          console.log('🔄 Session expiring soon, refreshing...')
          await supabase.auth.refreshSession()
        }

        setIsSessionValid(true)
      } catch (error) {
        console.error('Session check failed:', error)
        setIsSessionValid(false)
      }
    }

    // Check session every 2 minutes
    const interval = setInterval(checkSession, 2 * 60 * 1000)
    
    // Also check on user activity
    const handleActivity = () => {
      setLastActivity(Date.now())
      checkSession()
    }

    window.addEventListener('focus', handleActivity)
    window.addEventListener('click', handleActivity)
    window.addEventListener('keydown', handleActivity)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleActivity)
      window.removeEventListener('click', handleActivity)
      window.removeEventListener('keydown', handleActivity)
    }
  }, [user])

  // Auto-logout after inactivity (24 hours or 30 days based on preference)
  useEffect(() => {
    if (!user) return

    const checkInactivity = () => {
      const now = Date.now()
      const timeSinceActivity = now - lastActivity
      
      // Use different timeout based on "stay logged in" preference
      const maxInactivity = stayLoggedIn 
        ? 30 * 24 * 60 * 60 * 1000  // 30 days if "stay logged in" is checked
        : 24 * 60 * 60 * 1000        // 24 hours if not checked

      if (timeSinceActivity > maxInactivity) {
        console.log('⚠️ Auto-logout due to inactivity')
        handleSignOut()
      }
    }

    const interval = setInterval(checkInactivity, 60 * 1000) // Check every minute
    return () => clearInterval(interval)
  }, [user, lastActivity, stayLoggedIn])

  const loadUserProfile = async (userId: string) => {
    try {
      let userProfile = await getUserProfile(userId)
      
      if (!userProfile) {
        userProfile = await createUserProfile(userId)
      }
      
      setProfile(userProfile)
    } catch (error) {
      console.error('Error loading user profile:', error)
      // Set a basic profile so the app doesn't break
      setProfile({
        id: userId,
        plan_type: 'starter',
        posts_remaining: 10,
        preferred_tone: 'insightful_cfo',
        niche: 'finance',
        posts_generated_this_month: 0,
        posts_saved_this_month: 0,
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  const handleSignIn = async (email: string, password: string) => {
    try {
      setLastActivity(Date.now())
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  const handleSignOut = async () => {
    setIsSessionValid(false)
    // Clear stay logged in preference on logout
    localStorage.removeItem('writer-suite-stay-logged-in')
    setStayLoggedIn(false)
    await supabase.auth.signOut()
  }

  const refreshProfile = async () => {
    if (user && isSessionValid) {
      await loadUserProfile(user.id)
    }
  }

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error
      
      setLastActivity(Date.now())
      setIsSessionValid(true)
      console.log('✅ Session refreshed successfully')
    } catch (error) {
      console.error('Failed to refresh session:', error)
      setIsSessionValid(false)
      await handleSignOut()
    }
  }

  const setStayLoggedInPreference = (shouldStayLoggedIn: boolean) => {
    setStayLoggedIn(shouldStayLoggedIn)
    localStorage.setItem('writer-suite-stay-logged-in', shouldStayLoggedIn.toString())
    
    // Update session timeout immediately
    if (shouldStayLoggedIn) {
      console.log('✅ Stay logged in enabled - 30 day session')
    } else {
      console.log('⏰ Regular session - 24 hour timeout')
    }
  }

  const value = {
    user,
    profile,
    loading,
    isSessionValid,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    refreshProfile,
    refreshSession,
    stayLoggedIn,
    setStayLoggedInPreference,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
