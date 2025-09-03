'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { updateUserProfile } from '../lib/supabase'
import { useLinkedInAuth } from '../lib/linkedInAPI'
import {
  User,
  Sparkles,
  Bell,
  CreditCard,
  Shield,
  Home,
  Settings,
  Check,
  Save,
  ChevronRight,
  Download,
  Trash2,
  AlertTriangle,
  Linkedin,
  Plus,
  X
} from 'lucide-react'

type SettingsTab = 'account' | 'content' | 'notifications' | 'billing' | 'privacy'

interface ContentPillar {
  id: string
  name: string
  type: 'predefined' | 'custom'
  selected: boolean
}

const ModernSettingsPage = () => {
  const { user, profile, refreshProfile } = useAuth()
  const { isAuthenticated: isLinkedInConnected, login: connectLinkedIn, logout: disconnectLinkedIn } = useLinkedInAuth()
  
  // ===== STATE MANAGEMENT =====
  const [activeSection, setActiveSection] = useState("account")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newCustomPillar, setNewCustomPillar] = useState('')
  
  // Account Data
  const [accountData, setAccountData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  })

  // Content & AI Settings
  const [selectedPersona, setSelectedPersona] = useState("insightful-cfo")
  const [contentPillars, setContentPillars] = useState<ContentPillar[]>([
    { id: 'industry_trends', name: 'Industry Trends & Analysis', type: 'predefined', selected: false },
    { id: 'case_studies', name: 'Case Studies & Best Practices', type: 'predefined', selected: false },
    { id: 'saas_metrics', name: 'SaaS Metrics & KPIs', type: 'predefined', selected: false },
    { id: 'leadership', name: 'Finance Leadership', type: 'predefined', selected: false },
    { id: 'career_advice', name: 'Career Development', type: 'predefined', selected: false },
    { id: 'market_insights', name: 'Market Analysis', type: 'predefined', selected: false },
    { id: 'tools_tech', name: 'Finance Tools & Technology', type: 'predefined', selected: false },
    { id: 'personal_stories', name: 'Personal Stories & Lessons', type: 'predefined', selected: false }
  ])
  const [postingFrequency, setPostingFrequency] = useState('weekly')
  const [targetAudience, setTargetAudience] = useState('')
  
  // Notifications
  const [notifications, setNotifications] = useState({
    postPublished: true,
    queueEmpty: true,
    newSuggestions: false,
    weeklyReports: true,
    draftReminders: true,
    systemUpdates: false,
  })

  // ===== DATA LOADING =====
  useEffect(() => {
    if (user && profile) {
      // Load account data
      setAccountData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: user.email || '',
        role: profile.role || ''
      })
      
      // Load content preferences
      setSelectedPersona(profile.preferred_tone || 'insightful_cfo')
      setTargetAudience(profile.target_audience || '')
      setPostingFrequency(profile.posting_frequency || 'weekly')
      
      // Load content pillars
      if (profile.content_pillars && Array.isArray(profile.content_pillars)) {
        setContentPillars(prev => prev.map(pillar => ({
          ...pillar,
          selected: profile.content_pillars?.includes(pillar.id) || false
        })))
      }
      
      // Extract email parts for default names if empty
      if (!profile.first_name && user.email) {
        const emailParts = user.email.split('@')[0].split('.')
        setAccountData(prev => ({
          ...prev,
          firstName: emailParts[0]?.charAt(0).toUpperCase() + emailParts[0]?.slice(1) || '',
          lastName: emailParts[1]?.charAt(0).toUpperCase() + emailParts[1]?.slice(1) || ''
        }))
      }
    }
  }, [user, profile])

  // ===== DATA DEFINITIONS =====
  const settingsSections = [
    { id: "account", label: "Account", icon: User },
    { id: "content", label: "Content & AI", icon: Sparkles },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Billing & Plan", icon: CreditCard },
    { id: "privacy", label: "Privacy & Data", icon: Shield },
  ]

  const aiPersonas = [
    {
      id: "insightful-cfo",
      name:
