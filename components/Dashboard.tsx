'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  getTrendingTopics, 
  saveGeneratedContent, 
  getSavedContent,
  updateUserProfile,
  TrendingTopic,
  GeneratedContent,
  ContentIdea
} from '../lib/supabase'
import { LogOut, Settings, BarChart3, Zap, User, Lightbulb, Calendar, BarChart, Rss, Sparkles, Target, TrendingUp, Eye } from 'lucide-react'
import IdeasPage from './IdeasPage'
import WriterSuite from './WriterSuite'
import LinkedInPreview from './LinkedInPreview'
import ProductionPipeline from './ProductionPipeline'
// === Calendar, Rich Text Editor & AI Tools Integration START ===
import ContentCalendar from './ContentCalendar'
import RichTextEditor from './RichTextEditor'
import { aiImprovementService } from '../lib/aiImprovementService'
import { schedulingService } from '../lib/schedulingService'
import { linkedInAPI, useLinkedInAuth } from '../lib/linkedInAPI'
// === Calendar, Rich Text Editor & AI Tools Integration END ===

type ToneType = 'insightful_cfo' | 'bold_operator' | 'strategic_advisor' | 'data_driven_expert'
type ContentType = 'framework' | 'story' | 'trend' | 'mistake' | 'metrics'
type ActivePage = 'generator' | 'ideas' | 'writer-suite' | 'production' | 'plan' | 'analytics' | 'feed'
type DraftType = 'bold' | 'insightful' | 'wildcard'

interface GeneratedDraft {
  type: DraftType
  content: string
  label: string
  description: string
  icon: any
}

export default function Dashboard() {
  const { user, profile, signOut, refreshProfile } = useAuth()
  // === Calendar, LinkedIn, Rich Text, AI Tools State ===
  const { isAuthenticated: isLinkedInConnected, login: connectLinkedIn, logout: disconnectLinkedIn } = useLinkedInAuth()
  const [useRichEditor, setUseRichEditor] = useState(true)
  const [editingDraft, setEditingDraft] = useState<DraftType | null>(null)
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)
  // === End Calendar, LinkedIn, Rich Text, AI Tools State ===

  const [activePage, setActivePage] = useState<ActivePage>('generator')
  const [activeTab, setActiveTab] = useState<ContentType>('framework')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDrafts, setGeneratedDrafts] = useState<GeneratedDraft[]>([])
  const [selectedDraft, setSelectedDraft] = useState<DraftType>('bold')
  const [showGenerated, setShowGenerated] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [savedContent, setSavedContent] = useState<GeneratedContent[]>([])
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  const handleClickOutside = () => {
    setShowProfileMenu(false)
  }

  if (showProfileMenu) {
    document.addEventListener('click', handleClickOutside)
  }

  return () => {
    document.removeEventListener('click', handleClickOutside)
  }
}, [showProfileMenu])
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    topic: '',
    points: '5',
    tone: (profile?.preferred_tone || 'insightful_cfo') as ToneType,
    context: ''
  })

  useEffect(() => {
    loadTrendingTopics()
    loadSavedContent()
  }, [])

  useEffect(() => {
    if (profile?.preferred_tone) {
      setFormData(prev => ({ ...prev, tone: profile.preferred_tone as ToneType }))
    }
  }, [profile])

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

  const handleWriteFromIdea = (idea: ContentIdea) => {
    setActivePage('generator')
    setFormData(prev => ({
      ...prev,
      topic: idea.title,
      context: idea.description || ''
    }))
    setSelectedIdea(idea)
    setTimeout(() => { handleGenerate() }, 100)
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
    return `${intro} ${topic}

${contentType === 'framework' ? 'The framework' : 'The approach'} that actually works:

${Array.from({length: points}, (_, i) => 
  `${i + 1}. ${getBoldPoint(topic, i)}`
).join('\n\n')}

${context ? `\n💡 Reality check: ${context}` : ''}

Most finance leaders get this wrong. Don't be one of them.

What's your take? Agree or disagree? 👇

#Finance #CFO #Leadership #SaaS #RealTalk`
  }

  const generateInsightfulDraft = (topic: string, points: number, context: string, contentType: ContentType): string => {
    return `📊 Deep dive: ${topic}

After analyzing patterns across 100+ finance organizations, here are the key insights:

${Array.from({length: points}, (_, i) => 
  `${i + 1}️⃣ ${getInsightfulPoint(topic, i)}`
).join('\n\n')}

${context ? `\n📈 Key finding: ${context}` : ''}

The data consistently shows that companies implementing these approaches see 25-40% improvement in financial efficiency.

What metrics are you tracking for ${topic}? Share your experience below.

#FinanceStrategy #DataDriven #CFOInsights #BusinessIntelligence #Metrics`
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
    return `${intro}

${Array.from({length: points}, (_, i) => {
  const emojis = ['🎯', '⚡', '🔥', '💎', '🚀', '⭐', '🌟', '💡']
  return `${emojis[i % emojis.length]} ${getWildcardPoint(topic, i)}`
}).join('\n\n')}

${context ? `\n🎭 Plot twist: ${context}` : ''}

Been there, done that, bought the t-shirt (and learned the hard way).

Which of these resonates most with your experience? Let's discuss! 👇

#FinanceLife #CFOStruggles #LessonsLearned #FinanceHumor #RealTalk`
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

  // === AI IMPROVEMENT & SCHEDULING FUNCTIONS ===
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

  const handleQuickSchedule = async (content: string, contentType: ContentType, toneUsed: string) => {
  try {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const scheduledContent = await schedulingService.scheduleContent({
      user_id: user?.id || '',
      content_text: content,
      content_type: contentType as 'framework' | 'story' | 'trend' | 'mistake' | 'metrics',
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
  // === END AI IMPROVEMENT & SCHEDULING FUNCTIONS ===

  // === KEYBOARD SHORTCUTS HELP COMPONENT ===
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
  // === END KEYBOARD SHORTCUTS HELP COMPONENT ===

  const contentTypes = [
    { id: 'framework' as ContentType, label: '📊 Framework', icon: '📊' },
    { id: 'story' as ContentType, label: '💡 Story', icon: '💡' },
    { id: 'trend' as ContentType, label: '📈 Trend Take', icon: '📈' },
    { id: 'mistake' as ContentType, label: '⚠️ Mistake Story', icon: '⚠️' },
    { id: 'metrics' as ContentType, label: '📊 Metrics', icon: '📊' }
  ]

  const toneOptions = [
    { value: 'insightful_cfo' as ToneType, label: 'Insightful CFO' },
    { value: 'bold_operator' as ToneType, label: 'Bold Operator' },
    { value: 'strategic_advisor' as ToneType, label: 'Strategic Advisor' },
    { value: 'data_driven_expert' as ToneType, label: 'Data-Driven Expert' }
  ]

  const navigationItems = [
  { id: 'ideas' as ActivePage, label: 'Ideas', icon: Lightbulb },
  { id: 'generator' as ActivePage, label: 'Generator', icon: Zap },
  { id: 'writer-suite' as ActivePage, label: 'Writer Suite', icon: Sparkles, premium: true },
  { id: 'production' as ActivePage, label: 'Production', icon: BarChart3 },
  { id: 'plan' as ActivePage, label: 'Plan', icon: Calendar },
  { id: 'analytics' as ActivePage, label: 'Analytics', icon: BarChart },
  { id: 'feed' as ActivePage, label: 'Feed', icon: Rss }
]

  const getCurrentDraftContent = () => generatedDrafts.find(d => d.type === selectedDraft)?.content || ''
  const getProfileDisplayName = () => (user?.email ? user.email.split('@')[0] : 'Finance Professional')
  const getProfileTitle = () => (profile?.role ? profile.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Chief Financial Officer')

  const renderPageContent = () => {
    switch (activePage) {
      case 'ideas':
        return <IdeasPage onWritePost={handleWriteFromIdea} />
        case 'writer-suite':
  return <WriterSuite onComplete={(data) => {
    console.log('Writer Suite completed:', data)
    // Here you could save the final content, navigate to production, etc.
  }} />
    case 'production':
  return <ProductionPipeline />
      case 'plan':
        return <ContentCalendar />
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
                      : 'bg-blue-600 text-white hover:bg-blue-700'
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
            <div className="grid gap-8" style={{ gridTemplateColumns: showPreview && showGenerated ? '1fr 400px' : '2fr 1fr' }}>
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-slate-700/5 to-teal-600/5 rounded-full -mr-10 -mt-10"></div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Your Next Post</h2>
                    <p className="text-gray-600">Create engaging finance content that builds your authority</p>
                    {selectedIdea && (
                      <div className="mt-3 p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
                        <p className="text-sm text-indigo-800">
                          💡 <strong>Generating from idea:</strong> {selectedIdea.title}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 mb-6 overflow-x-auto">
                    {contentTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setActiveTab(type.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                          activeTab === type.id
                            ? 'bg-gradient-to-r from-slate-700 to-teal-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {activeTab === 'framework' ? 'Framework Topic' : 'Content Topic'}
                      </label>
                      <input
                        type="text"
                        value={formData.topic}
                        onChange={(e) => {
                          setFormData({ ...formData, topic: e.target.value })
                          setSelectedIdea(null)
                        }}
                        placeholder="e.g., SaaS metrics every CFO should track"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Points
                        </label>
                        <select
                          value={formData.points}
                          onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                          <option value="3">3 points</option>
                          <option value="5">5 points</option>
                          <option value="7">7 points</option>
                          <option value="10">10 points</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Base Tone
                        </label>
                        <select
                          value={formData.tone}
                          onChange={(e) => setFormData({ ...formData, tone: e.target.value as ToneType })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                          {toneOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {/* Rich Text Editor Context Section */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Additional Context (Optional)
                        </label>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Rich Editor</span>
                          <button
                            type="button"
                            onClick={() => setUseRichEditor(!useRichEditor)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${useRichEditor ? 'bg-indigo-600' : 'bg-gray-200'}`}
                          >
                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${useRichEditor ? 'translate-x-5' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      </div>
                      {useRichEditor ? (
                        <RichTextEditor
                          content={formData.context}
                          onChange={(content) => setFormData({ ...formData, context: content })}
                          placeholder="Any specific details, examples, or angle you want to include..."
                          onAIImprove={handleAIImprovement}
                        />
                      ) : (
                        <textarea
                          value={formData.context}
                          onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                          placeholder="Any specific details, examples, or angle you want to include..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          rows={3}
                        />
                      )}
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      💡 Tip: We'll create 3 different variations for you to choose from
                    </div>
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating || !formData.topic.trim() || (profile?.posts_remaining || 0) <= 0}
                      className="bg-gradient-to-r from-slate-700 via-slate-600 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      {isGenerating ? (
                        <>
                          <div className="loading-spinner"></div>
                          <span>Creating 3 Drafts...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          <span>Generate 3 Drafts</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                {/* Generated Content - Multi-Draft Interface */}
                {showGenerated && generatedDrafts.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 fade-in">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">3 Post Drafts</h3>
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => setShowPreview(!showPreview)}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                            showPreview 
                              ? 'bg-indigo-100 text-indigo-700' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Eye className="w-4 h-4" />
                          <span>LinkedIn Preview</span>
                        </button>
                        <button 
                          onClick={handleGenerate}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Regenerate
                        </button>
                      </div>
                    </div>
                    {/* Enhanced Draft Tabs With AI Tools */}
                    <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
                      {generatedDrafts.map((draft) => {
                        const Icon = draft.icon
                        return (
                          <div key={draft.type} className="flex-1">
                            <button
                              onClick={() => setSelectedDraft(draft.type)}
                              className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition ${
                                selectedDraft === draft.type
                                  ? 'bg-white text-indigo-700 shadow-sm'
                                  : 'text-gray-600 hover:text-gray-800'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span>{draft.label}</span>
                            </button>
                            {selectedDraft === draft.type && (
                              <div className="flex justify-center space-x-1 mt-2">
                                <button
                                  onClick={() => improveDraftWithAI(draft.type, 'bold')}
                                  className="p-1 text-xs text-gray-500 hover:text-indigo-600 transition"
                                  title="Make bolder"
                                >
                                  🔥
                                </button>
                                <button
                                  onClick={() => improveDraftWithAI(draft.type, 'improve')}
                                  className="p-1 text-xs text-gray-500 hover:text-indigo-600 transition"
                                  title="Improve clarity"
                                >
                                  ✨
                                </button>
                                <button
                                  onClick={() => improveDraftWithAI(draft.type, 'expand')}
                                  className="p-1 text-xs text-gray-500 hover:text-indigo-600 transition"
                                  title="Expand content"
                                >
                                  📝
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    {/* Draft Content Display (Editable) */}
                    <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-indigo-500">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {generatedDrafts.find(d => d.type === selectedDraft)?.label} Style
                          </h4>
                          <p className="text-sm text-gray-600">
                            {generatedDrafts.find(d => d.type === selectedDraft)?.description}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={handleSaveDraft}
                            className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition"
                          >
                            💾 Save This Draft
                          </button>
                          <button 
                            onClick={() => {
                              const content = generatedDrafts.find(d => d.type === selectedDraft)?.content
                              if (content) navigator.clipboard.writeText(content)
                            }}
                            className="text-sm text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
                          >
                            📋 Copy
                          </button>
                          {/* Add Schedule Button */}
                          <button 
                            onClick={() => handleQuickSchedule(
                              generatedDrafts.find(d => d.type === selectedDraft)?.content || '',
                              activeTab,
                              selectedDraft
                            )}
                            className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium transition flex items-center space-x-2"
                          >
                            <Calendar className="w-4 h-4" />
                            <span>Schedule</span>
                          </button>
                          <button 
                            onClick={() => setEditingDraft(editingDraft === selectedDraft ? null : selectedDraft)}
                            className="text-sm text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
                          >
                            {editingDraft === selectedDraft ? '👁️ View' : '✏️ Edit'}
                          </button>
                        </div>
                      </div>
                      {editingDraft === selectedDraft ? (
                        <div className="mb-4">
                          <RichTextEditor
                            content={generatedDrafts.find(d => d.type === selectedDraft)?.content || ''}
                            onChange={(content) => {
                              setGeneratedDrafts(prev => prev.map(draft =>
                                draft.type === selectedDraft
                                  ? { ...draft, content }
                                  : draft
                              ))
                            }}
                            onAIImprove={handleAIImprovement}
                            placeholder="Edit your generated content..."
                          />
                          <div className="flex justify-end space-x-2 mt-3">
                            <button
                              onClick={() => setEditingDraft(null)}
                              className="text-sm text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => setEditingDraft(null)}
                              className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                            >
                              ✓ Done Editing
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                          {generatedDrafts.find(d => d.type === selectedDraft)?.content}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* LinkedIn Preview Sidebar */}
              {showPreview && showGenerated && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">LinkedIn Preview</h3>
                      <button 
                        onClick={() => setShowPreview(false)}
                        className="text-gray-400 hover:text-gray-600 text-sm"
                      >
                        Hide
                      </button>
                    </div>
                    <LinkedInPreview 
                      content={getCurrentDraftContent()}
                      profileName={getProfileDisplayName()}
                      profileTitle={getProfileTitle()}
                    />
                    <div className="mt-4 text-xs text-gray-500 text-center">
                      Preview updates as you switch between drafts
                    </div>
                  </div>
                </div>
              )}
              {/* Sidebar */}
              {(!showPreview || !showGenerated) && (
                <div className="space-y-6">
                  {/* Stats */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Posts Generated</span>
                        <span className="font-semibold text-gray-900">
                          {profile?.posts_generated_this_month || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Posts Saved</span>
                        <span className="font-semibold text-gray-900">
                          {profile?.posts_saved_this_month || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Plan</span>
                        <span className="font-semibold text-indigo-600 capitalize">
                          {profile?.plan_type || 'Starter'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                        <div 
                          className="bg-gradient-to-r from-slate-600 to-teal-600 h-2 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${Math.max(0, Math.min(100, ((profile?.posts_generated_this_month || 0) / 50) * 100))}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-500 text-center">
                        {profile?.posts_remaining || 0} posts remaining ({profile?.plan_type} Plan)
                      </div>
                    </div>
                  </div>
                  {/* Recent Saves */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Saves</h3>
                      <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                        View All
                      </button>
                    </div>
                    <div className="space-y-3">
                      {savedContent.length > 0 ? (
                        savedContent.map((content) => (
                          <div 
                            key={content.id}
                            className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition border-l-4 border-indigo-500"
                          >
                            <div className="text-sm font-medium text-gray-900 mb-1 truncate">
                              {content.content_text.substring(0, 50)}...
                            </div>
                            <div className="text-xs text-gray-500 capitalize flex items-center gap-2">
                              <span>{content.content_type}</span>
                              {content.tone_used && (
                                <>
                                  <span>•</span>
                                  <span className="capitalize">{content.tone_used} style</span>
                                </>
                              )}
                              <span>•</span>
                              <span>{new Date(content.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 text-center py-4">
                          No saved content yet. Generate and save your first post!
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Trending Topics */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🔥 Trending in Finance</h3>
                    <div className="space-y-3">
                      {trendingTopics.map((topic) => (
                        <div key={topic.id} className="text-sm">
                          <div className="font-medium text-gray-900 mb-1">{topic.topic_title}</div>
                          <div className="text-gray-600 text-xs">{topic.description}</div>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => setActivePage('ideas')}
                      className="w-full mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Get Content Ideas →
                    </button>
                  </div>
                  {/* LinkedIn Status to Sidebar */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Publishing</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${isLinkedInConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-sm text-gray-600">LinkedIn</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {isLinkedInConnected ? 'Connected' : 'Not Connected'}
                        </span>
                      </div>
                      {!isLinkedInConnected && (
                        <button
                          onClick={connectLinkedIn}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
                        >
                          Connect LinkedIn
                        </button>
                      )}
                      {isLinkedInConnected && (
                        <div className="text-xs text-green-600 bg-green-50 rounded-lg p-2">
                          ✅ Auto-publishing enabled
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Add Help Modal to Render */}
            <KeyboardShortcutsHelp 
              isOpen={showShortcutsHelp} 
              onClose={() => setShowShortcutsHelp(false)} 
            />
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
             <div className="flex items-center space-x-3">
  <div className="w-10 h-10 bg-gradient-to-br from-slate-800 via-slate-700 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  </div>
  <div>
    <span className="text-xl font-bold bg-gradient-to-r from-slate-700 to-teal-600 bg-clip-text text-transparent">Writer Suite</span>
    <div className="text-xs text-slate-500 -mt-1">Professional Content Creation</div>
  </div>
</div>
              {/* Main Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActivePage(item.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
  activePage === item.id
    ? item.premium 
      ? 'bg-gradient-to-r from-slate-50 to-teal-50 text-slate-700 border border-slate-200' 
      : 'bg-indigo-100 text-indigo-700'
    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
{item.premium && (
  <span className="bg-gradient-to-r from-slate-700 to-teal-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">
    PRO
  </span>
)}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
      
              <div className="relative" ref={profileMenuRef}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-2 hover:bg-gray-200 transition"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-slate-700 to-teal-600 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {getProfileDisplayName()}
                  </span>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 backdrop-blur-sm">
                    <div className="py-1">
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </button>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <BarChart3 className="w-4 h-4 mr-3" />
                        Usage
                      </button>
                      <hr className="my-1" />
                      <button 
                        onClick={signOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      {renderPageContent()}
    </div>
  )
}
