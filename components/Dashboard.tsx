'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useWorkflow } from '../contexts/WorkflowContext'
import { 
  getTrendingTopics, 
  saveGeneratedContent, 
  getSavedContent,
  updateUserProfile,
  TrendingTopic,
  GeneratedContent,
  ContentIdea
} from '../lib/supabase'
import { LogOut, Settings, BarChart3, Zap, User, Lightbulb, Calendar, BarChart, Rss, Sparkles, Target, TrendingUp, Eye, Camera, ArrowRight } from 'lucide-react'
import IdeasPage from './IdeasPage'
import WriterSuite from './WriterSuite'
import LinkedInPreview from './LinkedInPreview'
import ProductionPipeline from './ProductionPipeline'
import ContentCalendar from './ContentCalendar'
import RichTextEditor from './RichTextEditor'
import ModeSelection from './ModeSelection'
import ExpressGenerator from './ExpressGenerator'
import StandardGenerator from './StandardGenerator'
import { aiImprovementService } from '../lib/aiImprovementService'
import { schedulingService } from '../lib/schedulingService'
import { linkedInAPI, useLinkedInAuth } from '../lib/linkedInAPI'
import SettingsPage from './SettingsPage'
import MarcusCopilot from './MarcusCopilot'
import SchedulingModal from './SchedulingModal'
import ImageGeneration from './ImageGeneration'
import IdeasHub from './IdeasHub'

type ToneType = 'insightful_cfo' | 'bold_operator' | 'strategic_advisor' | 'data_driven_expert'
type ContentType = 'framework' | 'story' | 'trend' | 'mistake' | 'metrics'
type ActivePage = 'ideas' | 'writer-suite' | 'create' | 'images' | 'production' | 'plan' | 'analytics' | 'feed' | 'settings'
type CreateSubPage = 'mode-selection' | 'express' | 'standard'
type DraftType = 'bold' | 'insightful' | 'wildcard'

interface GeneratedDraft {
  type: DraftType
  content: string
  label: string
  description: string
  icon: any
}

interface UserProfile {
  content_pillars?: string[]
  preferred_tone?: string
  role?: string
  plan_type?: string
  posts_generated_this_month?: number
  posts_remaining?: number
  posts_saved_this_month?: number
  target_audience?: string
  posting_frequency?: string
}

export default function Dashboard() {
  // State Management
  const { user, profile, signOut, refreshProfile } = useAuth()
  const { workflowState, ideationData: workflowIdeationData } = useWorkflow()
  const { isAuthenticated: isLinkedInConnected, login: connectLinkedIn, logout: disconnectLinkedIn } = useLinkedInAuth()
  
  // UI States
  const [useRichEditor, setUseRichEditor] = useState(true)
  const [editingDraft, setEditingDraft] = useState<DraftType | null>(null)
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const [profileMenuHoverActive, setProfileMenuHoverActive] = useState(false)
  const [profileMenuClickActive, setProfileMenuClickActive] = useState(false)
  const showProfileMenu = profileMenuHoverActive || profileMenuClickActive

  // Page and Content States
  const [activePage, setActivePage] = useState<ActivePage>('writer-suite')
  const [createSubPage, setCreateSubPage] = useState<CreateSubPage>('mode-selection')
  const [activeTab, setActiveTab] = useState<ContentType>('framework')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDrafts, setGeneratedDrafts] = useState<GeneratedDraft[]>([])
  const [selectedDraft, setSelectedDraft] = useState<DraftType>('bold')
  const [showGenerated, setShowGenerated] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [savedContent, setSavedContent] = useState<GeneratedContent[]>([])
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null)
  const [ideationData, setIdeationData] = useState<any>(null)

  // Form Data
  const [formData, setFormData] = useState({
    topic: '',
    points: '5',
    tone: (profile?.preferred_tone || 'insightful_cfo') as ToneType,
    context: ''
  })

  // Effects
  useEffect(() => {
    loadTrendingTopics()
    loadSavedContent()
  }, [])

  useEffect(() => {
    if (profile?.preferred_tone) {
      setFormData(prev => ({ ...prev, tone: profile.preferred_tone as ToneType }))
    }
  }, [profile])

  // Load ideation data from workflow if available
useEffect(() => {
  if (workflowIdeationData) {
    setIdeationData(workflowIdeationData)
  }
}, [workflowIdeationData])

  // Click outside handler for profile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuClickActive(false)
        setProfileMenuHoverActive(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Data Loading Functions
  const loadTrendingTopics = async () => {
    const { data } = await getTrendingTopics()
    if (data) setTrendingTopics(data)
  }

  const loadSavedContent = async () => {
    if (user) {
      const { data } = await getSavedContent(user.id)
      if (data) setSavedContent(data)
    }
  }

  // Content Generation Functions
  const handleWriteFromIdea = (idea: ContentIdea) => {
    // Open Create tab with pre-filled topic
    setFormData(prev => ({
      ...prev,
      topic: idea.title,
      context: idea.description || ''
    }))
    setSelectedIdea(idea)
    setActivePage('create')
    setCreateSubPage('mode-selection')
  }

  const handleGenerate = async () => {
    if (!formData.topic.trim()) return

    setIsGenerating(true)
    setTimeout(() => {
      const drafts = generateMultipleDrafts(formData)
      setGeneratedDrafts(drafts)
      setSelectedDraft('bold')
      setShowGenerated(true)
      setShowPreview(true)
      setIsGenerating(false)
      if (profile && user) {
        updateUserProfile(user.id, {
          posts_generated_this_month: (profile.posts_generated_this_month || 0) + 1,
          posts_remaining: Math.max(0, (profile.posts_remaining || 0) - 1)
        }).then(() => refreshProfile())
      }
    }, 3000)
  }

  const generateMultipleDrafts = (data: typeof formData): GeneratedDraft[] => {
    const topic = data.topic
    const points = parseInt(data.points)
    const context = data.context

    return [
      {
        type: 'bold',
        label: 'Bold',
        description: 'Direct and confident approach',
        icon: Target,
        content: generateBoldDraft(topic, points, context, activeTab)
      },
      {
        type: 'insightful',
        label: 'Insightful',
        description: 'Data-driven and analytical',
        icon: BarChart3,
        content: generateInsightfulDraft(topic, points, context, activeTab)
      },
      {
        type: 'wildcard',
        label: 'Wildcard',
        description: 'Creative and engaging twist',
        icon: Sparkles,
        content: generateWildcardDraft(topic, points, context, activeTab)
      }
    ]
  }

  const generateBoldDraft = (topic: string, points: number, context: string, contentType: ContentType): string => {
    const boldIntros = [
      "I'm going to be direct:",
      "Let me cut through the noise:",
      "Here's what nobody talks about:",
      "The uncomfortable truth about",
      "Stop doing this immediately:"
    ]
    const intro = boldIntros[Math.floor(Math.random() * boldIntros.length)]
    return `${intro} ${topic}\n\n${contentType === 'framework' ? 'The framework' : 'The approach'} that actually works:\n\n${Array.from({length: points}, (_, i) => 
      `${i + 1}. ${getBoldPoint(topic, i)}`
    ).join('\n\n')}\n\n${context ? `\n💡 Reality check: ${context}` : ''}\n\nMost finance leaders get this wrong. Don't be one of them.\n\nWhat's your take? Agree or disagree? 👇\n\n#Finance #CFO #Leadership #SaaS #RealTalk`
  }

  const generateInsightfulDraft = (topic: string, points: number, context: string, contentType: ContentType): string => {
    return `📊 Deep dive: ${topic}\n\nAfter analyzing patterns across 100+ finance organizations, here are the key insights:\n\n${Array.from({length: points}, (_, i) => 
      `${i + 1}️⃣ ${getInsightfulPoint(topic, i)}`
    ).join('\n\n')}\n\n${context ? `\n📈 Key finding: ${context}` : ''}\n\nThe data consistently shows that companies implementing these approaches see 25-40% improvement in financial efficiency.\n\nWhat metrics are you tracking for ${topic}? Share your experience below.\n\n#FinanceStrategy #DataDriven #CFOInsights #BusinessIntelligence #Metrics`
  }

  const generateWildcardDraft = (topic: string, points: number, context: string, contentType: ContentType): string => {
    const creativeIntros = [
      `If ${topic} were a recipe, most CFOs would be missing these ingredients:`,
      `${topic} is like playing chess while everyone else plays checkers.`,
      `The ${topic} playbook they don't teach in business school:`,
      `Plot twist: Everything you know about ${topic} is backwards.`,
      `${topic} through the lens of a recovering perfectionist CFO:`
    ]
    const intro = creativeIntros[Math.floor(Math.random() * creativeIntros.length)]
    return `${intro}\n\n${Array.from({length: points}, (_, i) => {
      const emojis = ['🎯', '⚡', '🔥', '💎', '🚀', '⭐', '🌟', '💡']
      return `${emojis[i % emojis.length]} ${getWildcardPoint(topic, i)}`
    }).join('\n\n')}\n\n${context ? `\n🎭 Plot twist: ${context}` : ''}\n\nBeen there, done that, bought the t-shirt (and learned the hard way).\n\nWhich of these resonates most with your experience? Let's discuss! 👇\n\n#FinanceLife #CFOStruggles #LessonsLearned #FinanceHumor #RealTalk`
  }

  const getBoldPoint = (topic: string, index: number): string => {
    const points = [
      `Stop overthinking ${topic} - action beats analysis paralysis every time`,
      `If you're not uncomfortable, you're not pushing hard enough on ${topic}`,
      `Your ${topic} strategy should scare your competition, not comfort them`,
      `${topic} without clear accountability is just expensive theater`,
      `Most teams fail at ${topic} because they won't make the hard decisions`
    ]
    return points[index % points.length]
  }

  const getInsightfulPoint = (topic: string, index: number): string => {
    const points = [
      `Companies with structured ${topic} processes show 35% better financial performance`,
      `The correlation between ${topic} maturity and company valuation is stronger than expected`,
      `Leading organizations invest 2.3x more resources in ${topic} optimization`,
      `${topic} effectiveness directly impacts employee retention rates (18% improvement)`,
      `Our analysis shows ${topic} ROI compounds at 127% annually when done correctly`
    ]
    return points[index % points.length]
  }

  const getWildcardPoint = (topic: string, index: number): string => {
    const points = [
      `${topic} is 20% math, 80% psychology - and most CFOs get this backwards`,
      `The best ${topic} strategies I've seen started as "terrible" ideas on a napkin`,
      `Your team's resistance to ${topic} changes? That's actually valuable data`,
      `I used to think ${topic} was about control. Turns out it's about trust`,
      `${topic} done right feels like magic to your team, science to your board`
    ]
    return points[index % points.length]
  }

  // Content Management Functions
  const handleSaveDraft = async () => {
    if (!user || !generatedDrafts.length) return
    const selectedDraftContent = generatedDrafts.find(d => d.type === selectedDraft)
    if (!selectedDraftContent) return
    const content = {
      user_id: user.id,
      content_text: selectedDraftContent.content,
      content_type: activeTab,
      tone_used: selectedDraft,
      prompt_input: formData.topic,
      is_saved: true,
      idea_id: selectedIdea?.id,
      variations_data: {
        all_drafts: generatedDrafts.map(d => ({
          type: d.type,
          content: d.content
        })),
        selected_draft: selectedDraft
      }
    }
    await saveGeneratedContent(content)
    await loadSavedContent()
    await refreshProfile()
  }

  // AI Improvement Functions
  const handleAIImprovement = async (text: string, type: 'bold' | 'improve' | 'expand'): Promise<string> => {
    try {
      return await aiImprovementService.improveText(text, type)
    } catch (error) {
      console.error('AI improvement failed:', error)
      return text
    }
  }

  const improveDraftWithAI = async (draftType: DraftType, improvementType: 'bold' | 'improve' | 'expand') => {
    const draft = generatedDrafts.find(d => d.type === draftType)
    if (!draft) return
    try {
      const improvedContent = await aiImprovementService.improveText(draft.content, improvementType)
      setGeneratedDrafts(prev => prev.map(d =>
        d.type === draftType
          ? { ...d, content: improvedContent }
          : d
      ))
    } catch (error) {
      console.error('Bulk AI improvement failed:', error)
    }
  }

  // Scheduling Functions
  const handleQuickSchedule = async (content: string, contentType: ContentType, toneUsed: string) => {
    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const scheduledContent = await schedulingService.scheduleContent({
        user_id: user?.id || '',
        content_text: content,
        content_type: contentType,
        tone_used: toneUsed,
        prompt_input: formData.topic,
        is_saved: false,
        scheduled_date: tomorrow.toISOString().split('T')[0],
        scheduled_time: '09:00'
      })
      console.log('Content scheduled successfully:', scheduledContent)
      setActivePage('plan')
    } catch (error) {
      console.error('Error scheduling content:', error)
    }
  }

  // UI Components
  const KeyboardShortcutsHelp = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Make text bolder (AI)</span>
              <kbd className="bg-gray-100 px-2 py-1 rounded">Cmd+B</kbd>
            </div>
            <div className="flex justify-between">
              <span>Improve clarity (AI)</span>
              <kbd className="bg-gray-100 px-2 py-1 rounded">Cmd+I</kbd>
            </div>
            <div className="flex justify-between">
              <span>Expand content (AI)</span>
              <kbd className="bg-gray-100 px-2 py-1 rounded">Cmd+E</kbd>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Select text first to use AI improvements
          </div>
        </div>
      </div>
    )
  }

  // Navigation Configuration
  const contentTypes = [
    { id: 'framework' as ContentType, label: '📊 Framework', icon: '📊' },
    { id: 'story' as ContentType, label: '💡 Story', icon: '💡' },
    { id: 'trend' as ContentType, label: '📈 Trend Take', icon: '📈' },
    { id: 'mistake' as ContentType, label: '⚠️ Mistake Story', icon: '⚠️' },
    { id: 'metrics' as ContentType, label: '📊 Metrics', icon: '📊' }
  ]

  const navigationItems = [
  { id: 'writer-suite' as ActivePage, label: 'Writer Suite', icon: Sparkles, premium: true },
  { id: 'ideas' as ActivePage, label: 'Ideas', icon: Lightbulb },
  { id: 'create' as ActivePage, label: 'Create', icon: Zap },
  { id: 'images' as ActivePage, label: 'Images', icon: Camera },
  { id: 'production' as ActivePage, label: 'Production', icon: BarChart3 },
  { id: 'plan' as ActivePage, label: 'Plan', icon: Calendar },
  { id: 'analytics' as ActivePage, label: 'Analytics', icon: BarChart },
  { id: 'feed' as ActivePage, label: 'Feed', icon: Rss }
]

  // Utility Functions
  const getCurrentDraftContent = () => generatedDrafts.find(d => d.type === selectedDraft)?.content || ''
  
  const getProfileDisplayName = () => {
    if (!user?.email) return 'Finance Professional'
    const email = user.email
    const firstName = email.split('@')[0].split('.')[0]
    return firstName.charAt(0).toUpperCase() + firstName.slice(1)
  }
  
  const getProfileTitle = () => (profile?.role ? profile.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Chief Financial Officer')

  // Page Content Rendering
  const renderPageContent = () => {
    switch (activePage) {
      case 'ideas':
  return <IdeasHub 
    onIdeationComplete={(ideation) => {
      console.log('Ideation completed:', ideation)
      setIdeationData(ideation)
    }} 
    onNavigateToCreate={(mode, ideationData) => {
  setIdeationData(ideationData)
  
  // Smart mode detection - if ideation data suggests a specific approach
  if (ideationData.angle?.toLowerCase().includes('quick') || ideationData.angle?.toLowerCase().includes('fast')) {
    mode = 'express'
  }
  
  if (mode === 'power') {
    setActivePage('writer-suite')
  } else {
    setActivePage('create')
    setCreateSubPage(mode)
  }
}}
  />
      
      case 'writer-suite':
        return <WriterSuite onComplete={(data) => {
          console.log('Writer Suite completed:', data)
        }} />
        
      case 'production':
        return <ProductionPipeline />
      
      case 'plan':
        return <ContentCalendar />
      
      case 'settings':
        return <SettingsPage />

        case 'images':
  return <ImageGeneration />
      
      case 'create':
  // Handle Create tab with sub-navigation
  if (createSubPage === 'express') {
    return (
      <ExpressGenerator
        onSwitchMode={(mode) => {
          if (mode === 'power') {
            setActivePage('writer-suite')
          } else {
            setCreateSubPage(mode)
          }
        }}
        onBack={() => setCreateSubPage('mode-selection')}
        ideationData={ideationData}
      />
    )
        } else if (createSubPage === 'standard') {
  return (
    <StandardGenerator
      onSwitchMode={(mode) => {
        if (mode === 'power') {
          setActivePage('writer-suite')
        } else {
          setCreateSubPage(mode)
        }
      }}
      onBack={() => setCreateSubPage('mode-selection')}
      ideationData={ideationData}
    />
  )
        } else {
          // Default to mode selection
          return (
            <ModeSelection
              onModeSelect={(mode) => {
                if (mode === 'power') {
                  setActivePage('writer-suite')
                } else {
                  setCreateSubPage(mode)
                }
              }}
              onBack={() => setActivePage('writer-suite')}
            />
          )
        }
      
      case 'analytics':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics & Performance</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${isLinkedInConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">LinkedIn Integration</h3>
                    <p className="text-sm text-gray-600">
                      {isLinkedInConnected 
                        ? 'Connected - Automated publishing enabled' 
                        : 'Not connected - Manual publishing only'}
                    </p>
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
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isLinkedInConnected ? 'Analytics Coming Soon' : 'Connect LinkedIn for Analytics'}
              </h3>
              <p className="text-gray-600">
                {isLinkedInConnected 
                  ? 'Track your content performance and engagement metrics'
                  : 'Connect your LinkedIn account to view detailed analytics'}
              </p>
            </div>
          </div>
        )
      
      case 'feed':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Feed</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rss className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Feed Coming Soon</h3>
              <p className="text-gray-600">Discover trending content and inspiration</p>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              default:
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Dashboard */}
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Writer Suite</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Your AI-powered LinkedIn content creation platform. Start with an idea or jump straight to creation.
        </p>
        
        {/* Quick Start Options */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
          <button
            onClick={() => setActivePage('ideas')}
            className="bg-white border-2 border-gray-200 rounded-xl p-6 text-left hover:border-teal-500 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors">
              <Lightbulb className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Start with Ideas</h3>
            <p className="text-sm text-gray-600">Develop topics with Marcus</p>
          </button>
          
          <button
            onClick={() => {
              setActivePage('create')
              setCreateSubPage('express')
            }}
            className="bg-white border-2 border-gray-200 rounded-xl p-6 text-left hover:border-blue-500 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Express Create</h3>
            <p className="text-sm text-gray-600">Quick content generation</p>
          </button>
          
          <button
            onClick={() => setActivePage('writer-suite')}
            className="bg-white border-2 border-gray-200 rounded-xl p-6 text-left hover:border-purple-500 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Writer Suite</h3>
            <p className="text-sm text-gray-600">Comprehensive process</p>
          </button>
          
          <button
            onClick={() => setActivePage('production')}
            className="bg-white border-2 border-gray-200 rounded-xl p-6 text-left hover:border-green-500 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">View Pipeline</h3>
            <p className="text-sm text-gray-600">Manage your content</p>
          </button>
        </div>
      </div>
    </div>
  )
              <p className="text-gray-600">Use the floating "New Post" button to create content.</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Premium Left Sidebar */}
      <nav 
        className={`bg-slate-800 min-h-screen fixed left-0 top-0 z-50 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarExpanded ? 'w-60' : 'w-16'
        }`}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-700 via-slate-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:brightness-110 transition-all duration-200 flex-shrink-0">
              <img src="/writer-suite-logo.png" alt="Writer Suite" className="w-5 h-5" />
            </div>
            {sidebarExpanded && (
              <div className="transition-opacity duration-300 ease-in-out">
                <span className="text-lg font-bold text-white whitespace-nowrap">Writer Suite</span>
                <div className="text-xs text-slate-400 -mt-1 whitespace-nowrap">Professional Content Creation</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-2 py-6">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.id
              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => setActivePage(item.id)}
                    className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                      sidebarExpanded ? 'space-x-3' : 'justify-center'
                    } ${
                      isActive
                        ? 'bg-slate-700 text-white shadow-lg'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 to-teal-600 rounded-r-full"></div>
                    )}
                    
                    <Icon className={`w-5 h-5 transition-transform duration-200 flex-shrink-0 ${
                      isActive ? 'text-teal-400' : 'group-hover:scale-110'
                    }`} />
                    
                    {sidebarExpanded && (
                      <>
                        <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
                        
                        {item.premium && (
                          <span className="bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm animate-pulse whitespace-nowrap">
                            PRO
                          </span>
                        )}
                      </>
                    )}
                  </button>
                  
                  {/* Tooltip for collapsed state */}
                  {!sidebarExpanded && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                      {item.label}
                      {item.premium && (
                        <span className="ml-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                          PRO
                        </span>
                      )}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45"></div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Profile Section at Bottom */}
        <div className="mt-auto border-t border-slate-700 p-4">
          <div 
            className="relative" 
            ref={profileMenuRef}
            onMouseEnter={() => {
              setProfileMenuHoverActive(true)
              setProfileMenuClickActive(false)
            }}
            onMouseLeave={() => {
              setProfileMenuHoverActive(false)
            }}
          >
            <button
              onClick={() => {
                setProfileMenuClickActive(!profileMenuClickActive)
                setProfileMenuHoverActive(false)
              }}
              className={`w-full flex items-center rounded-lg p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 ${
                sidebarExpanded ? 'space-x-3': 'justify-center'
              } ${showProfileMenu ? 'bg-slate-700/50 text-white' : ''}`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              
              {sidebarExpanded && (
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-white">
                    {getProfileDisplayName()}
                  </div>
                  <div className="text-xs text-slate-400 capitalize">
                    {getProfileTitle()}
                  </div>
                </div>
              )}
              
              {sidebarExpanded && (
                <div className={`text-slate-400 transition-transform duration-200 ${
                  showProfileMenu ? 'rotate-180' : ''
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
            </button>
            
            {/* Profile Dropdown Menu */}
            {showProfileMenu && sidebarExpanded && (
              <div 
                className="absolute bottom-full left-0 right-0 mb-2 bg-slate-900 rounded-lg shadow-2xl border border-slate-600 overflow-hidden transition-all duration-200 ease-out transform origin-bottom"
                onMouseEnter={() => {
                  setProfileMenuHoverActive(true)
                }}
                onMouseLeave={() => {
                  setProfileMenuHoverActive(false)
                }}
              >
                <div className="py-1">
                  <button 
                    onClick={() => {
                      setActivePage('settings')
                      setProfileMenuClickActive(false)
                      setProfileMenuHoverActive(false)
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700">
                    <BarChart3 className="w-4 h-4 mr-3" />
                    Usage & Analytics
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700">
                    <User className="w-4 h-4 mr-3" />
                    Account Settings
                  </button>
                  <hr className="my-1 border-slate-600" />
                  <button 
                    onClick={signOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-red-600/20"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
            
            {/* Tooltip for collapsed state */}
            {!sidebarExpanded && !showProfileMenu && (
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                {getProfileDisplayName()}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45"></div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarExpanded ? 'ml-60' : 'ml-16'}`}>
   {/* Removed empty header to save space */}

        {/* Workflow Recovery Banner */}
  {workflowState && workflowIdeationData && (
    <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Continue Where You Left Off</h3>
              <p className="text-sm text-gray-600">
                Working on: "{workflowIdeationData.topic}" • Stage: {workflowState.current_stage}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                // Navigate to appropriate stage
                if (workflowState.current_stage === 'ideas') {
                  setActivePage('ideas')
                } else if (workflowState.current_stage === 'create') {
                  setActivePage('create')
                  setCreateSubPage('express') // Default to express, could be smarter
                } else if (workflowState.current_stage === 'image') {
                  setActivePage('images')
                } else if (workflowState.current_stage === 'pipeline') {
                  setActivePage('production')
                }
              }}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition flex items-center space-x-2"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Continue</span>
            </button>
            <button
  onClick={async () => {
    try {
      await clearProgress()
    } catch (error) {
      console.error('Error clearing progress:', error)
    }
  }}
  className="text-gray-600 hover:text-gray-800 text-sm"
>
  Start Fresh
</button>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="mt-4">
          <div className="flex items-center space-x-4 text-sm">
            <div className={`flex items-center space-x-2 ${
              workflowState.current_stage === 'ideas' ? 'text-teal-600 font-medium' : 
              ['create', 'image', 'pipeline'].includes(workflowState.current_stage) ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                workflowState.current_stage === 'ideas' ? 'bg-teal-600' : 
                ['create', 'image', 'pipeline'].includes(workflowState.current_stage) ? 'bg-green-600' : 'bg-gray-300'
              }`}></div>
              <span>Ideas</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${
              workflowState.current_stage === 'create' ? 'text-teal-600 font-medium' : 
              ['image', 'pipeline'].includes(workflowState.current_stage) ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                workflowState.current_stage === 'create' ? 'bg-teal-600' : 
                ['image', 'pipeline'].includes(workflowState.current_stage) ? 'bg-green-600' : 'bg-gray-300'
              }`}></div>
              <span>Create</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${
              workflowState.current_stage === 'image' ? 'text-teal-600 font-medium' : 
              workflowState.current_stage === 'pipeline' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                workflowState.current_stage === 'image' ? 'bg-teal-600' : 
                workflowState.current_stage === 'pipeline' ? 'bg-green-600' : 'bg-gray-300'
              }`}></div>
              <span>Images</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${
              workflowState.current_stage === 'pipeline' ? 'text-teal-600 font-medium' : 'text-gray-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                workflowState.current_stage === 'pipeline' ? 'bg-teal-600' : 'bg-gray-300'
              }`}></div>
              <span>Pipeline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

        {/* Page Content */}
        <main>
          {renderPageContent()}
        </main>
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp 
        isOpen={showShortcutsHelp} 
        onClose={() => setShowShortcutsHelp(false)} 
      />
      
      {/* Scheduling Modal */}
      <SchedulingModal />
    </div>
  )
}
