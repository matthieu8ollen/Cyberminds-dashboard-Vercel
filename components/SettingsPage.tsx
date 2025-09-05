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
  X,
  AlertTriangle 
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
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Update your personal and professional details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={accountData.firstName}
              onChange={(e) => setAccountData(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={accountData.lastName}
              onChange={(e) => setAccountData(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Enter your last name"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={accountData.email}
            disabled
            placeholder="your.email@company.com"
          />
          <p className="text-xs text-muted-foreground">Email cannot be changed. Contact support if needed.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={accountData.role} onValueChange={(value) => setAccountData(prev => ({ ...prev, role: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input id="company" placeholder="Your company" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Social Connections</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Linkedin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium">LinkedIn</div>
              <div className="text-sm text-muted-foreground">
                {isLinkedInConnected ? 'Connected and ready to publish' : 'Connect to publish directly'}
              </div>
            </div>
          </div>
          <Button 
            onClick={() => isLinkedInConnected ? disconnectLinkedIn() : connectLinkedIn()}
            variant={isLinkedInConnected ? "destructive" : "default"}
          >
            {isLinkedInConnected ? 'Disconnect' : 'Connect'}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
 )


const renderContentTab = () => (
  <div className="space-y-6 max-w-4xl">
{/* AI Writing Persona Section */}
<Card>
  <CardHeader>
    <CardTitle>AI Writing Persona</CardTitle>
    <CardDescription>Choose your AI writing style and tone</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div>
      <Label className="text-sm font-medium">Preferred Tone</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {aiPersonas.map(persona => (
          <div
            key={persona.id}
            onClick={() => setSelectedPersona(persona.id as AiPersonaId)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition ${
              selectedPersona === persona.id
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-foreground mb-1">{persona.name}</div>
            <div className="text-sm text-muted-foreground mb-2">{persona.description}</div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Tone:</span> {persona.tone}
            </div>
          </div>
        ))}
      </div>
    </div>
  </CardContent>
</Card>

    {/* Target Audience & Posting Section */}
<Card>
  <CardHeader>
    <CardTitle>Target Audience & Posting</CardTitle>
    <CardDescription>Configure your audience and posting preferences</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-3 gap-4">
      <div>
        <Label className="text-sm font-medium">Target Audience</Label>
        <Select value={targetAudience} onValueChange={setTargetAudience}>
          <SelectTrigger>
            <SelectValue placeholder="C-Suite Executives" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fellow_cfos">Fellow CFOs</SelectItem>
            <SelectItem value="startup_founders">Startup Founders</SelectItem>
            <SelectItem value="finance_professionals">Finance Professionals</SelectItem>
            <SelectItem value="potential_clients">Potential Clients</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium">Industry</Label>
        <Select defaultValue="saas_technology">
          <SelectTrigger>
            <SelectValue placeholder="SaaS & Technology" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="saas_technology">SaaS & Technology</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium">Posting Frequency</Label>
        <Select value={postingFrequency} onValueChange={setPostingFrequency}>
          <SelectTrigger>
            <SelectValue placeholder="Weekly" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="biweekly">Bi-weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </CardContent>
</Card>

    {/* Content Pillars Section */}
<Card>
  <CardHeader>
    <CardTitle>Content Pillars</CardTitle>
    <CardDescription>Select topics you want to create content about</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="grid grid-cols-3 gap-4">
      {contentPillars.map(pillar => (
        <div key={pillar.id} className="flex items-center space-x-3">
          <Checkbox
            checked={pillar.selected}
            onCheckedChange={() => handlePillarToggle(pillar.id)}
            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
          />
          <Label className="text-sm font-medium cursor-pointer">
            {pillar.name}
          </Label>
          {pillar.type === 'custom' && (
            <Button
              onClick={() => removePillar(pillar.id)}
              size="sm"
              variant="ghost"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}
    </div>

    <div>
      <Label className="text-sm font-medium">Add Custom Pillar</Label>
      <div className="flex space-x-2">
        <Input
          value={newCustomPillar}
          onChange={(e) => setNewCustomPillar(e.target.value)}
          placeholder="Enter custom topic..."
          className="flex-1"
          onKeyPress={(e) => e.key === 'Enter' && addCustomPillar()}
        />
        <Button onClick={addCustomPillar} variant="outline">
          Add
        </Button>
      </div>
    </div>
  </CardContent>
</Card>
  </div>
)

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
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
                <div className="text-muted-foreground text-sm">{description}</div>
              </div>
              <Switch
                checked={notifications[key as keyof typeof notifications]}
                onCheckedChange={(checked) => handleNotificationChange(key, checked)}
              />
          </CardContent>
          </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  )

const renderBillingTab = () => (
  <div className="space-y-6 max-w-2xl">
    <Card>
      <CardHeader>
        <CardTitle>Current Subscription</CardTitle>
        <CardDescription>Professional Plan - $49/month</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Next billing date</Label>
            <p className="text-sm text-gray-900">January 15, 2025</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Payment method</Label>
            <p className="text-sm text-gray-900">•••• •••• •••• 4242</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Change Plan</Button>
          <Button variant="outline" size="sm">Update Payment</Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download Invoice
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Usage Analytics</CardTitle>
        <CardDescription>Track your monthly usage and limits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
             <span className="text-muted-foreground">Posts generated</span>
             <span className="text-foreground">23 / 50</span>
            </div>
            <Progress value={46} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">AI enhancements used</span>
              <span className="text-gray-900">156 / 200</span>
            </div>
            <Progress value={78} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">Images generated</span>
              <span className="text-gray-900">8 / 25</span>
            </div>
            <Progress value={32} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)

const renderPrivacyTab = () => (
  <div className="space-y-6 max-w-2xl">
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>Export and manage your data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <div className="font-medium">Export all data</div>
            <div className="text-muted-foreground text-sm">Download all your content, settings, and analytics</div>
          </div>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <div className="font-medium">Export content only</div>
            <div className="text-sm text-gray-600">Download just your posts and drafts</div>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </CardContent>
    </Card>

    <div className="p-6 border border-red-200 rounded-lg bg-red-50">
      <div className="flex items-start">
        <div className="w-5 h-5 text-red-500 mr-3 mt-0.5">⚠️</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900 mb-1">Danger Zone</h3>
          <p className="text-sm text-red-700 mb-4">Irreversible actions that will permanently affect your account</p>
          
          <div className="p-4 border border-red-200 rounded-lg bg-white">
            <div className="flex items-start">
              <div className="w-5 h-5 text-red-500 mr-3 mt-0.5">⚠️</div>
              <div className="flex-1">
                <p className="text-sm text-red-900 mb-4">
                  Deleting your account will permanently remove all your data, including posts, drafts, and analytics. This action cannot be undone.
                </p>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
  {/* Left Navigation */}
  <div className="w-64 bg-white border-r border-gray-200 p-4">
    <nav className="space-y-2">
      {settingsSections.map((section) => (
        <Button
          key={section.id}
          variant={activeSection === section.id ? "default" : "ghost"}
          className={cn(
            "w-full justify-start gap-3 h-12",
            activeSection === section.id && "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
          )}
          onClick={() => setActiveSection(section.id)}
        >
          <section.icon className="h-5 w-5" />
          {section.label}
        </Button>
      ))}
    </nav>
  </div>

  {/* Right Content */}
  <div className="flex-1 overflow-auto p-6">
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
