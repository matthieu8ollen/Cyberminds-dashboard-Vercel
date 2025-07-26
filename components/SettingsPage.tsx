'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { updateUserProfile } from '../lib/supabase'
import { useLinkedInAuth } from '../lib/linkedInAPI'
import { 
  Settings, 
  User, 
  Bell, 
  CreditCard, 
  Shield, 
  Linkedin, 
  Globe, 
  Sparkles,
  Save,
  Check,
  X,
  ExternalLink,
  Download,
  Trash2
} from 'lucide-react'

type SettingsTab = 'account' | 'content' | 'notifications' | 'billing' | 'privacy'

interface ContentPillar {
  id: string
  name: string
  type: 'predefined' | 'custom'
  selected: boolean
}

const PREDEFINED_PILLARS = [
  { id: 'industry_trends', name: 'Industry Trends & Analysis', type: 'predefined' as const },
  { id: 'case_studies', name: 'Case Studies & Best Practices', type: 'predefined' as const },
  { id: 'saas_metrics', name: 'SaaS Metrics & KPIs', type: 'predefined' as const },
  { id: 'leadership', name: 'Finance Leadership', type: 'predefined' as const },
  { id: 'career_advice', name: 'Career Development', type: 'predefined' as const },
  { id: 'market_insights', name: 'Market Analysis', type: 'predefined' as const },
  { id: 'tools_tech', name: 'Finance Tools & Technology', type: 'predefined' as const },
  { id: 'personal_stories', name: 'Personal Stories & Lessons', type: 'predefined' as const }
]

const ROLES = [
  { value: 'cfo', label: 'Chief Financial Officer (CFO)' },
  { value: 'finance_director', label: 'Finance Director' },
  { value: 'controller', label: 'Controller' },
  { value: 'fractional_cfo', label: 'Fractional CFO' },
  { value: 'fp_a_manager', label: 'FP&A Manager' },
  { value: 'finance_consultant', label: 'Finance Consultant' },
  { value: 'startup_founder', label: 'Startup Founder' },
  { value: 'other', label: 'Other Finance Role' }
]

const TONE_OPTIONS = [
  { value: 'insightful_cfo', label: 'Insightful CFO', description: 'Data-driven and analytical' },
  { value: 'bold_operator', label: 'Bold Operator', description: 'Direct and action-oriented' },
  { value: 'strategic_advisor', label: 'Strategic Advisor', description: 'Thoughtful and advisory' },
  { value: 'data_driven_expert', label: 'Data-Driven Expert', description: 'Numbers and metrics focused' }
]

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const { isAuthenticated: isLinkedInConnected, login: connectLinkedIn, logout: disconnectLinkedIn } = useLinkedInAuth()
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('account')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newCustomPillar, setNewCustomPillar] = useState('')
  
  // Form states
  const [accountData, setAccountData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    role: profile?.role || 'cfo',
    company: '',
    bio: ''
  })
  
  const [contentData, setContentData] = useState({
    preferred_tone: profile?.preferred_tone || 'insightful_cfo',
    content_pillars: profile?.content_pillars || [],
    target_audience: profile?.target_audience || '',
    posting_frequency: profile?.posting_frequency || 'weekly'
  })
  
  const [notificationData, setNotificationData] = useState({
    post_published: true,
    queue_empty: true,
    new_suggestions: false,
    weekly_analytics: true,
    draft_reminders: false
  })
  
  const [contentPillars, setContentPillars] = useState<ContentPillar[]>([])

  useEffect(() => {
    // Initialize content pillars
    const userPillars = profile?.content_pillars || []
    const initialPillars = PREDEFINED_PILLARS.map(pillar => ({
      ...pillar,
      selected: userPillars.includes(pillar.id)
    }))
    
    // Add custom pillars
    const customPillars = userPillars
      .filter(pillar => !PREDEFINED_PILLARS.find(p => p.id === pillar))
      .map(pillar => ({
        id: pillar,
        name: pillar,
        type: 'custom' as const,
        selected: true
      }))
    
    setContentPillars([...initialPillars, ...customPillars])
  }, [profile])

  useEffect(() => {
    if (user?.email) {
      const emailParts = user.email.split('@')[0].split('.')
      setAccountData(prev => ({
        ...prev,
        firstName: emailParts[0]?.charAt(0).toUpperCase() + emailParts[0]?.slice(1) || '',
        lastName: emailParts[1]?.charAt(0).toUpperCase() + emailParts[1]?.slice(1) || ''
      }))
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      const selectedPillars = contentPillars
        .filter(pillar => pillar.selected)
        .map(pillar => pillar.id)
      
      await updateUserProfile(user.id, {
        role: accountData.role,
        preferred_tone: contentData.preferred_tone as any,
        content_pillars: selectedPillars,
        target_audience: contentData.target_audience,
        posting_frequency: contentData.posting_frequency
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

  const togglePillar = (pillarId: string) => {
    setContentPillars(prev => prev.map(p => 
      p.id === pillarId ? { ...p, selected: !p.selected } : p
    ))
  }

  const tabs = [
    { id: 'account' as SettingsTab, label: 'Account', icon: User },
    { id: 'content' as SettingsTab, label: 'Content & AI', icon: Sparkles },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'billing' as SettingsTab, label: 'Billing & Plan', icon: CreditCard },
    { id: 'privacy' as SettingsTab, label: 'Privacy & Data', icon: Shield }
  ]

  const renderAccountTab = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              value={accountData.firstName}
              onChange={(e) => setAccountData(prev => ({ ...prev, firstName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              value={accountData.lastName}
              onChange={(e) => setAccountData(prev => ({ ...prev, lastName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={accountData.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={accountData.role}
              onChange={(e) => setAccountData(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {ROLES.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
            <input
              type="text"
              value={accountData.company}
              onChange={(e) => setAccountData(prev => ({ ...prev, company: e.target.value }))}
              placeholder="Your company name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* LinkedIn Integration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">LinkedIn Integration</h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isLinkedInConnected ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Linkedin className={`w-5 h-5 ${isLinkedInConnected ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <div className="font-medium text-gray-900">LinkedIn Account</div>
              <div className={`text-sm ${isLinkedInConnected ? 'text-green-600' : 'text-gray-500'}`}>
                {isLinkedInConnected ? 'Connected - Auto-publishing enabled' : 'Not connected'}
              </div>
            </div>
          </div>
          <button
            onClick={isLinkedInConnected ? disconnectLinkedIn : connectLinkedIn}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isLinkedInConnected
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-slate-700 text-white hover:bg-slate-800'
            }`}
          >
            {isLinkedInConnected ? 'Disconnect' : 'Connect LinkedIn'}
          </button>
        </div>
        {isLinkedInConnected && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-green-700">
              ✅ Your LinkedIn account is connected. Writer Suite can now automatically publish your content and track analytics.
            </div>
          </div>
        )}
      </div>

      {/* Plan Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900 capitalize">{profile?.plan_type || 'Starter'} Plan</div>
            <div className="text-sm text-gray-600">{profile?.posts_remaining || 0} posts remaining this month</div>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-slate-700 to-teal-600 text-white rounded-lg hover:opacity-90 transition">
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  )

  const renderContentTab = () => (
    <div className="space-y-6">
      {/* AI Persona Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Writing Persona</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Tone</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TONE_OPTIONS.map(tone => (
                <div
                  key={tone.value}
                  onClick={() => setContentData(prev => ({ ...prev, preferred_tone: tone.value }))}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition ${
                    contentData.preferred_tone === tone.value
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{tone.label}</div>
                  <div className="text-sm text-gray-600">{tone.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
            <select
              value={contentData.target_audience}
              onChange={(e) => setContentData(prev => ({ ...prev, target_audience: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select your audience</option>
              <option value="fellow_cfos">Fellow CFOs and Finance Leaders</option>
              <option value="startup_founders">Startup Founders & Entrepreneurs</option>
              <option value="finance_professionals">Finance Professionals & Teams</option>
              <option value="potential_clients">Potential Clients & Partners</option>
              <option value="industry_peers">Industry Peers & Colleagues</option>
              <option value="mixed_audience">Mixed Professional Audience</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Posting Frequency</label>
            <select
              value={contentData.posting_frequency}
              onChange={(e) => setContentData(prev => ({ ...prev, posting_frequency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="daily">Daily (7 posts/week)</option>
              <option value="weekdays">Weekdays only (5 posts/week)</option>
              <option value="3x_week">3 times per week</option>
              <option value="2x_week">2 times per week</option>
              <option value="weekly">Weekly (1 post/week)</option>
              <option value="flexible">Flexible - as needed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Pillars */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Pillars</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select the topics you want to create content about. This helps the AI generate more relevant ideas.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {contentPillars.map(pillar => (
            <div
              key={pillar.id}
              className={`flex items-center justify-between p-3 border rounded-lg ${
                pillar.selected ? 'border-teal-500 bg-teal-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={pillar.selected}
                  onChange={() => togglePillar(pillar.id)}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-gray-900">{pillar.name}</span>
              </div>
              {pillar.type === 'custom' && (
                <button
                  onClick={() => removePillar(pillar.id)}
                  className="text-gray-400 hover:text-red-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={newCustomPillar}
            onChange={(e) => setNewCustomPillar(e.target.value)}
            placeholder="Add custom content pillar..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && addCustomPillar()}
          />
          <button
            onClick={addCustomPillar}
            disabled={!newCustomPillar.trim()}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {Object.entries({
            post_published: 'When a post is published',
            queue_empty: 'When publishing queue is empty',
            new_suggestions: 'New post suggestions available',
            weekly_analytics: 'Weekly analytics report',
            draft_reminders: 'Draft post reminders'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{label}</div>
                <div className="text-sm text-gray-600">Get notified via email</div>
              </div>
              <button
                onClick={() => setNotificationData(prev => ({ 
                  ...prev, 
                  [key]: !prev[key as keyof typeof prev] 
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationData[key as keyof typeof notificationData]
                    ? 'bg-gradient-to-r from-slate-600 to-teal-600'
                    : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationData[key as keyof typeof notificationData] ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderBillingTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing & Subscription</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Billing Management Coming Soon</h4>
          <p className="text-gray-600">
            Subscription management, payment methods, and billing history will be available soon.
          </p>
        </div>
      </div>
    </div>
  )

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Data</h3>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Export Your Data</div>
                <div className="text-sm text-gray-600">Download all your content and settings</div>
              </div>
              <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition flex items-center space-x-2">
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
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center space-x-2">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account preferences and Writer Suite configuration</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition ${
                    activeTab === tab.id
                      ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {activeTab === 'account' && renderAccountTab()}
          {activeTab === 'content' && renderContentTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'billing' && renderBillingTab()}
          {activeTab === 'privacy' && renderPrivacyTab()}

          {/* Save Button */}
          {(activeTab === 'account' || activeTab === 'content' || activeTab === 'notifications') && (
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-slate-700 to-teal-600 text-white rounded-lg hover:opacity-90 transition flex items-center space-x-2 disabled:opacity-50"
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
  )
}
