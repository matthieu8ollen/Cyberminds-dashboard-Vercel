'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

type ViewMode = 'login' | 'signup' | 'forgot-password' | 'reset-sent'

export default function Login() {
  const [view, setView] = useState<ViewMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)
  const [stayLoggedInChecked, setStayLoggedInChecked] = useState(false)
  const { signIn, signUp, setStayLoggedInPreference } = useAuth()

  // Initialize stay logged in preference from storage
  useEffect(() => {
    const savedPreference = localStorage.getItem('writer-suite-stay-logged-in')
    if (savedPreference === 'true') {
      setStayLoggedInChecked(true)
    }
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1)
      }, 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCountdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (view === 'signup') {
        if (password !== confirmPassword) {
          setMessage('Passwords do not match')
          setLoading(false)
          return
        }
        
        const { data, error } = await signUp(email, password)
        if (error) {
          setMessage(error.message)
        } else {
          setMessage('Check your email for the confirmation link!')
        }
      } else if (view === 'login') {
        const { data, error } = await signIn(email, password)
        if (error) {
          setMessage(error.message)
        } else {
          // Save stay logged in preference
          setStayLoggedInPreference(stayLoggedInChecked)
        }
      }
    } catch (error) {
      setMessage('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setMessage('Please enter your email address')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      
      if (error) {
        setMessage(error.message)
      } else {
        setView('reset-sent')
        setResendCountdown(30)
      }
    } catch (error) {
      setMessage('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const renderForgotPassword = () => (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <form className="space-y-6" onSubmit={handleForgotPassword}>
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Reset Your Password</h3>
          <p className="text-sm text-gray-600 mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500"
              placeholder="Enter your email"
            />
          </div>
        </div>

        {message && (
          <div className={`text-sm ${message.includes('error') || message.includes('Invalid') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-md bg-gradient-to-r from-slate-700 to-teal-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 disabled:opacity-50"
          >
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setView('login')}
            className="text-sm text-slate-600 hover:text-teal-600 font-medium"
          >
            ← Back to Sign In
          </button>
        </div>
      </form>
    </div>
  )

  const renderResetSent = () => (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Check Your Email</h3>
        <p className="text-sm text-gray-600 mb-6">
          We've sent a password reset link to <strong>{email}</strong>. 
          Click the link in the email to reset your password.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => setView('login')}
            className="w-full rounded-md bg-gradient-to-r from-slate-700 to-teal-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            Back to Sign In
          </button>
          <button
            onClick={async () => {
              if (!email.trim()) {
                setMessage('Please enter your email address')
                return
              }

              setLoading(true)
              setMessage('')

              try {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: `${window.location.origin}/reset-password`,
                })
                
                if (error) {
                  setMessage(error.message)
                } else {
                  setMessage('Reset link sent again!')
                  setResendCountdown(30)
                }
              } catch (error) {
                setMessage('An unexpected error occurred')
              } finally {
                setLoading(false)
              }
            }}
            disabled={loading || resendCountdown > 0}
            className={`w-full text-sm font-medium ${
              resendCountdown > 0 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-slate-600 hover:text-teal-600'
            }`}
          >
            {resendCountdown > 0 
              ? `Resend in ${resendCountdown}s` 
              : loading 
              ? 'Sending...' 
              : 'Resend Email'
            }
          </button>
        </div>
      </div>
    </div>
  )

  const renderLoginSignup = () => (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={view === 'signup' ? 'new-password' : 'current-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500"
            />
          </div>
        </div>

        {view === 'signup' && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500"
              />
            </div>
          </div>
        )}

        {/* Stay Logged In Checkbox - Only for Login */}
        {view === 'login' && (
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="stay-logged-in"
                name="stay-logged-in"
                type="checkbox"
                checked={stayLoggedInChecked}
                onChange={(e) => setStayLoggedInChecked(e.target.checked)}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="stay-logged-in" className="text-sm text-gray-900">
                Stay logged in for 30 days
              </label>
              {stayLoggedInChecked && (
                <p className="text-xs text-gray-500 mt-1">
                  You'll stay logged in on this device for 30 days
                </p>
              )}
            </div>
          </div>
        )}

        {view === 'login' && (
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                type="button"
                onClick={() => setView('forgot-password')}
                className="font-medium text-slate-600 hover:text-teal-600"
              >
                Forgot your password?
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className={`text-sm ${message.includes('Check your email') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-md bg-gradient-to-r from-slate-700 to-teal-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 disabled:opacity-50"
          >
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              view === 'login' ? 'Sign in' : 'Sign up'
            )}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Welcome to Writer Suite</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-800 via-slate-700 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          {view === 'forgot-password' ? 'Reset Password' : 
           view === 'reset-sent' ? 'Email Sent' :
           view === 'login' ? 'Sign in to your account' : 'Create your account'}
        </h2>
        {view === 'login' || view === 'signup' ? (
          <p className="mt-2 text-center text-sm text-gray-600">
            {view === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setView(view === 'login' ? 'signup' : 'login')}
              className="font-medium text-slate-600 hover:text-teal-600"
            >
              {view === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        ) : null}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {view === 'forgot-password' ? renderForgotPassword() :
         view === 'reset-sent' ? renderResetSent() :
         renderLoginSignup()}
      </div>
    </div>
  )
}
