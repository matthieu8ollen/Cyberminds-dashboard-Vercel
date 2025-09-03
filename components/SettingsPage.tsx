'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { updateUserProfile } from '../lib/supabase'
import { useLinkedInAuth } from '../lib/linkedInAPI'
import { SidebarNavigation } from '@/components/sidebar-navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
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

  // ===== DATA LOADING (useEffect to load user's current settings) =====
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
      name: "Insightful CFO",
      description: "Data-driven financial perspective with strategic insights",
      tone: "Professional, analytical, forward-thinking",
    },
    {
      id: "bold-operator", 
      name: "Bold Operator",
      description: "Action-oriented execution focus with practical solutions",
      tone: "Direct, confident, results-focused",
    },
    {
      id: "strategic-advisor",
      name: "Strategic Advisor",
      description: "High-level strategic thinking with industry expertise",
      tone: "Thoughtful, experienced, advisory",
    },
    {
      id: "data-driven-expert",
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
        first_name: accountData.firstName,
        last_name: accountData.lastName,
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
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-emerald-800 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              value={accountData.firstName}
              onChange={(e) => setAccountData(prev => ({ ...prev, firstName: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              value={accountData.lastName}
              onChange={(e) => setAccountData(prev => ({ ...prev, lastName: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="Enter your last name"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={accountData.email}
            onChange={(e) => setAccountData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            placeholder="your.email@company.com"
            disabled
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed. Contact support if you need to update this.</p>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Professional Role</label>
          <select
            value={accountData.role}
            onChange={(e) => setAccountData(prev => ({ ...prev, role: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          >
            <option value="">Select your role</option>
            {roles.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* LinkedIn Integration */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-emerald-800 mb-4">Social Connections</h3>
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Linkedin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">LinkedIn</div>
              <div className="text-sm text-gray-600">
                {isLinkedInConnected ? 'Connected and ready to publish' : 'Connect to publish directly'}
              </div>
            </div>
          </div>
          <button 
            onClick={() => isLinkedInConnected ? disconnectLinkedIn() : connectLinkedIn()}
            className={`px-4 py-2 rounded-lg transition-all ${
              isLinkedInConnected 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            {isLinkedInConnected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>
    </div>
  )

  const renderContentTab = () => (
    <div className="space-y-6">
      {/* AI Persona Selection */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-emerald-800 mb-4">AI Writing Persona</h3>
        <p className="text-gray-600 mb-6">Choose the professional voice that best matches your style and industry position.</p>
        
        <div className="grid gap-4">
          {aiPersonas.map((persona) => (
            <div 
              key={persona.id}
              onClick={() => setSelectedPersona(persona.id)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                selectedPersona === persona.id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">{persona.name}</div>
                  <div className="text-sm text-gray-600 mb-2">{persona.description}</div>
                  <div className="text-xs text-gray-500">
                    <strong>Tone:</strong> {persona.tone}
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                  selectedPersona === persona.id
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-gray-300'
                }`}>
                  {selectedPersona === persona.id && (
                    <Check className="w-3 h-3 text-white m-0.5" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Pillars */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-emerald-800 mb-4">Content Focus Areas</h3>
        <p className="text-gray-600 mb-6">Select the topics you want to focus on for better personalized content suggestions.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contentPillars.map((pillar) => (
            <label 
              key={pillar.id}
              className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
            >
              <input
                type="checkbox"
                checked={pillar.selected}
                onChange={() => handlePillarToggle(pillar.id)}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-900 flex-1">{pillar.name}</span>
              {pillar.type === 'custom' && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    removePillar(pillar.id)
                  }}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </label>
          ))}
        </div>

        {/* Add Custom Pillar */}
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newCustomPillar}
            onChange={(e) => setNewCustomPillar(e.target.value)}
            placeholder="Add custom content pillar..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            onKeyPress={(e) => e.key === 'Enter' && addCustomPillar()}
          />
          <button
            onClick={addCustomPillar}
            className="px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Publishing Preferences */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-emerald-800 mb-4">Publishing Preferences</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Posting Frequency</label>
            <select
              value={postingFrequency}
              onChange={(e) => setPostingFrequency(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
            <textarea
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              rows={3}
              placeholder="Describe your ideal audience (e.g., 'SaaS executives, finance professionals, startup founders...')"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-emerald-800 mb-4">Notification Preferences</h3>
        <p className="text-gray-600 mb-6">Manage how and when you want to receive updates from Writer Suite.</p>
        
        <div className="space-y-4">
          {Object.entries({
            postPublished: { label: 'Post Published', description: 'When your scheduled posts go live' },
            queueEmpty: { label: 'Queue Empty', description: 'When you need to schedule more content' },
            newSuggestions: { label: 'New Suggestions', description: 'When AI finds relevant trending topics' },
            weeklyReports: { label: 'Weekly Reports', description: 'Weekly performance summary' },
            draftReminders: { label: 'Draft Reminders', description: 'Reminders about incomplete drafts' },
            systemUpdates: { label: 'System Updates', description: 'Product updates and new features' }
          }).map(([key, { label, description }]) => (
            <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{label}</div>
                <div className="text-sm text-gray-600">{description}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[key as keyof typeof notifications]}
                  onChange={(e) => handleNotificationChange(key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderBillingTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-emerald-800 mb-4">Billing & Subscription</h3>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-emerald-600" />
          </div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">Billing Management</h4>
          <p className="text-gray-600 mb-6">
            Subscription management, payment methods, and billing history will be available soon.
          </p>
          <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-emerald-800 mb-4">Privacy & Data</h3>
        
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Export Your Data</div>
                <div className="text-sm text-gray-600">Download all your content and settings</div>
              </div>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
          
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-red-900">Delete Account</div>
                <div className="text-sm text-red-700">Permanently delete your account and all data</div>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Your Existing Sidebar */}
      <SidebarNavigation />

      {/* Main Content */}
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

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Settings Navigation */}
          <div className="w-64 bg-white border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {settingsSections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
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

          {/* Settings Content */}
          <div className="flex-1 p-6 overflow-auto">
            {activeSection === 'account' && renderAccountTab()}
            {activeSection === 'content' && renderContentTab()}
            {activeSection === 'notifications' && renderNotificationsTab()}
            {activeSection === 'billing' && renderBillingTab()}
            {activeSection === 'privacy' && renderPrivacyTab()}

            {/* Save Button */}
            {(activeSection === 'account' || activeSection === 'content' || activeSection === 'notifications') && (
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:opacity-90 transition-all flex items-center space-x-2 disabled:opacity-50 shadow-lg"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : saved ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModernSettingsPage
