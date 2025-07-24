'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, getUserProfile, createUserProfile, UserProfile } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
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

  useEffect(() => {
    console.log('🚀 AuthProvider: Starting initialization')
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log('🔍 AuthProvider: Getting session...')
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        console.log('📊 AuthProvider: Session result:', { session: !!session, error })
        
        if (!mounted) {
          console.log('❌ AuthProvider: Component unmounted, stopping')
          return
        }

        if (error) {
          console.error('❌ AuthProvider: Session error:', error)
          setLoading(false)
          return
        }

        setUser(session?.user ?? null)
        console.log('👤 AuthProvider: User set:', !!session?.user)
        
        if (session?.user) {
          console.log('📝 AuthProvider: Loading profile...')
          await loadUserProfile(session.user.id)
        } else {
          console.log('✅ AuthProvider: No user, loading complete')
          setLoading(false)
        }
      } catch (error) {
        console.error('💥 AuthProvider: Initialization error:', error)
        if (mounted) {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    }

    // Add a timeout as fallback
    const timeout = setTimeout(() => {
      console.log('⏰ AuthProvider: Timeout reached, forcing loading to false')
      if (mounted) {
        setLoading(false)
      }
    }, 5000) // 5 second timeout

    // Initialize auth immediately
    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AuthProvider: Auth state changed:', event, !!session)
        if (!mounted) return
        
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      console.log('🧹 AuthProvider: Cleaning up')
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('📂 AuthProvider: Loading user profile for:', userId)
      let userProfile = await getUserProfile(userId)
      
      // If no profile exists, create one
      if (!userProfile) {
        console.log('➕ AuthProvider: Creating new profile')
        userProfile = await createUserProfile(userId)
      }
      
      console.log('✅ AuthProvider: Profile loaded:', !!userProfile)
      setProfile(userProfile)
    } catch (error) {
      console.error('❌ AuthProvider: Error loading user profile:', error)
    } finally {
      console.log('🏁 AuthProvider: Setting loading to false')
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
    await supabase.auth.signOut()
  }

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id)
    }
  }

  console.log('🎯 AuthProvider: Current state:', { user: !!user, profile: !!profile, loading })

  const value = {
    user,
    profile,
    loading,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
