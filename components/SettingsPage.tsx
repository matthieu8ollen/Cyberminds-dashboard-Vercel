'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'
import { updateUserProfile } from '../lib/supabase'
import { useLinkedInAuth } from '../lib/linkedInAPI'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { Badge } from './ui/badge'
import { Checkbox } from './ui/checkbox'
import { Alert, AlertDescription } from './ui/alert'
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
  Download,
  Trash2,
  Linkedin,
  Plus,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from './ui/progress'

type SettingsTab = 'account' | 'content' | 'notifications' | 'billing' | 'privacy'

interface ContentPillar {
  id: string
  name: string
  type: 'predefined' | 'custom'
  selected: boolean
}

// Add this type definition
type AiPersonaId = "insightful_cfo" | "bold_operator" | "strategic_advisor" | "data_driven_expert";

const SettingsPage = () => {
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
  const [selectedPersona, setSelectedPersona] = useState<AiPersonaId>("insightful_cfo")
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
        firstName: '',
        lastName: '',
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
      
      // Extract email parts for default names
      if (user.email) {
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
      id: "insightful_cfo",
      name: "Insightful CFO",
      description: "Data-driven financial perspective with strategic insights",
      tone: "Professional, analytical, forward-thinking",
    },
    {
      id: "bold_operator", 
      name: "Bold Operator",
      description: "Action-oriented execution focus with practical solutions",
      tone: "Direct, confident, results-focused",
    },
    {
      id: "strategic_advisor",
      name: "Strategic Advisor",
      description: "High-level strategic thinking with industry expertise",
      tone: "Thoughtful, experienced, advisory",
    },
    {
      id: "data_driven_expert",
      name: "Data-Driven Expert",
      description: "Evidence-based insights with analytical depth",
      tone: "Precise, factual, research-oriented",
    },
  ]

  const roles = [
    { value: 'cfo', label: 'Chief Financial Officer (CFO)' },
    { value: 'finance_director', label: 'Finance Director' },
    { value: 'controller', label: 'Controller' },
    { value: 'fractional_cfo', label: 'Fractional CFO' },
    { value: 'fp_a_manager', label: 'FP&A Manager' },
    { value: 'finance_consultant', label: 'Finance Consultant' },
    { value: 'startup_founder', label: 'Startup Founder' },
    { value: 'other', label: 'Other Finance Role' }
  ]

  // ===== BACKEND FUNCTIONS =====
  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      const selectedPillars = contentPillars
        .filter(pillar => pillar.selected)
        .map(pillar => pillar.id)
      
      await updateUserProfile(user.id, {
        role: accountData.role,
        preferred_tone: selectedPersona,
        content_pillars: selectedPillars,
        target_audience: targetAudience,
        posting_frequency: postingFrequency
      })
      
      await refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }))
  }

  const handlePillarToggle = (pillarId: string) => {
    setContentPillars(prev => 
      prev.map(p => p.id === pillarId ? { ...p, selected: !p.selected } : p)
    )
  }

  const addCustomPillar = () => {
    if (newCustomPillar.trim() && !contentPillars.find(p => p.name === newCustomPillar.trim())) {
      const customPillar: ContentPillar = {
        id: newCustomPillar.trim().toLowerCase().replace(/\s+/g, '_'),
        name: newCustomPillar.trim(),
        type: 'custom',
        selected: true
      }
      setContentPillars(prev => [...prev, customPillar])
      setNewCustomPillar('')
    }
  }

  const removePillar = (pillarId: string) => {
    setContentPillars(prev => prev.filter(p => p.id !== pillarId))
  }

  // ===== RENDER SECTIONS =====
 
 const renderAccountTab = () => (
  <div className="space-y-6 max-w-2xl">
    {/* Rest of your existing code stays exactly the same */}
  </div>
)

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-emerald-800">Notification Preferences</CardTitle>
          <CardDescription>Manage how you receive updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries({
            postPublished: { label: 'Post Published', description: 'When your scheduled posts go live' },
            queueEmpty: { label: 'Queue Empty', description: 'When you need to schedule more content' },
            newSuggestions: { label: 'New Suggestions', description: 'When AI finds relevant trending topics' },
            weeklyReports: { label: 'Weekly Reports', description: 'Weekly performance summary' },
            draftReminders: { label: 'Draft Reminders', description: 'Reminders about incomplete drafts' },
            systemUpdates: { label: 'System Updates', description: 'Product updates and new features' }
          }).map(([key, { label, description }]) => (
            <Card key={key}>
  <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{label}</div>
                <div className="text-sm text-gray-600">{description}</div>
              </div>
              <Switch
                checked={notifications[key as keyof typeof notifications]}
                onCheckedChange={(checked) => handleNotificationChange(key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )

  const renderBillingTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-emerald-800">Billing & Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-emerald-600" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Billing Management</h4>
            <p className="text-gray-600 mb-6">
              Subscription management, payment methods, and billing history will be available soon.
            </p>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-emerald-800">Privacy & Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Export Your Data</div>
                <div className="text-sm text-gray-600">Download all your content and settings</div>
              </div>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-red-900">Delete Account</div>
                <div className="text-sm text-red-700">Permanently delete your account and all data</div>
              </div>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
  <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
     {/* Header */}
<div className="bg-white border-b border-gray-200 px-6 py-4">
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/" className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          Dashboard
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>Settings</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>

  <div className="mt-4">
    <h1 className="text-3xl font-medium tracking-tight text-balance font-sans text-emerald-800">Settings</h1>
    <p className="text-gray-600 text-pretty">Manage your account preferences and Writer Suite configuration</p>
  </div>
</div>
      <div className="flex overflow-hidden">
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {settingsSections.map(section => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition ${
                    activeSection === section.id
                      ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="flex-1">
          {activeSection === 'account' && renderAccountTab()}
          {activeSection === 'content' && renderContentTab()}
          {activeSection === 'notifications' && renderNotificationsTab()}
          {activeSection === 'billing' && renderBillingTab()}
          {activeSection === 'privacy' && renderPrivacyTab()}

          {(activeSection === 'account' || activeSection === 'content' || activeSection === 'notifications') && (
            <div className="mt-8 flex justify-end space-x-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
</Button>
            </div>
          )}
        </div>
      </div>
    </div>  
  </div>
  )
}

export default SettingsPage;
