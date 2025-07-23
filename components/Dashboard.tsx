'use client'

import { useState, useEffect } from 'react'
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
import LinkedInPreview from './LinkedInPreview'
import ProductionPipeline from './ProductionPipeline'

// Define types used within the component
type ToneType = 'insightful_cfo' | 'bold_operator' | 'strategic_advisor' | 'data_driven_expert'
type ContentType = 'framework' | 'story' | 'trend' | 'mistake' | 'metrics'
type ActivePage = 'generator' | 'ideas' | 'production' | 'plan' | 'analytics' | 'feed'
type DraftType = 'bold' | 'insightful' | 'wildcard'

// Interface for the generated drafts
interface GeneratedDraft {
  type: DraftType
  content: string
  label: string
  description: string
  icon: React.ElementType // Use React.ElementType for component icons
}

export default function Dashboard() {
  // Authentication and user profile from context
  const { user, profile, signOut, refreshProfile } = useAuth()

  // State management for the dashboard
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
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null)

  // State for the generator form
  const [formData, setFormData] = useState({
    topic: '',
    points: '5',
    tone: (profile?.preferred_tone || 'insightful_cfo') as ToneType,
    context: ''
  })

  // Load initial data on component mount
  useEffect(() => {
    loadTrendingTopics()
    loadSavedContent()
  }, [])

  // Update form tone if profile changes
  useEffect(() => {
    if (profile?.preferred_tone) {
      setFormData(prev => ({ ...prev, tone: profile.preferred_tone as ToneType }))
    }
  }, [profile])

  // Fetches trending topics from Supabase
  const loadTrendingTopics = async () => {
    const { data } = await getTrendingTopics()
    if (data) setTrendingTopics(data)
  }

  // Fetches user's saved content from Supabase
  const loadSavedContent = async () => {
    if (user) {
      const { data } = await getSavedContent(user.id)
      if (data) setSavedContent(data)
    }
  }

  // Handles the action when a user wants to write a post from an idea
  const handleWriteFromIdea = (idea: ContentIdea) => {
    setActivePage('generator')
    setFormData(prev => ({
      ...prev,
      topic: idea.title,
      context: idea.description || ''
    }))
    setSelectedIdea(idea)
    
    // Auto-generate content from the selected idea after a short delay
    setTimeout(() => {
      handleGenerate()
    }, 100)
  }

  // Main function to generate content drafts
  const handleGenerate = async () => {
    if (!formData.topic.trim()) return

    setIsGenerating(true)
    setShowGenerated(false)
    
    // Simulate AI generation with 3 different drafts
    setTimeout(() => {
      const drafts = generateMultipleDrafts(formData)
      setGeneratedDrafts(drafts)
      setSelectedDraft('bold') // Default to the first tab
      setShowGenerated(true)
      setShowPreview(true) // Automatically show preview
      setIsGenerating(false)
      
      // Update user stats in Supabase
      if (profile && user) {
        updateUserProfile(user.id, {
          posts_generated_this_month: (profile.posts_generated_this_month || 0) + 1,
          posts_remaining: Math.max(0, (profile.posts_remaining || 0) - 1)
        }).then(() => refreshProfile())
      }
    }, 2500)
  }

  // Simulates creating three distinct drafts based on the form data
  const generateMultipleDrafts = (data: typeof formData): GeneratedDraft[] => {
    const { topic, points, context } = data
    const numPoints = parseInt(points)

    // Helper functions to generate different styles of points
    const getBoldPoint = (topic: string, index: number): string => {
        const points = [ `Stop overthinking ${topic} - action beats analysis paralysis every time`, `If you're not uncomfortable, you're not pushing hard enough on ${topic}`, `Your ${topic} strategy should scare your competition, not comfort them`, `${topic} without clear accountability is just expensive theater`, `Most teams fail at ${topic} because they won't make the hard decisions` ]
        return points[index % points.length]
    }
    const getInsightfulPoint = (topic: string, index: number): string => {
        const points = [ `Companies with structured ${topic} processes show 35% better financial performance`, `The correlation between ${topic} maturity and company valuation is stronger than expected`, `Leading organizations invest 2.3x more resources in ${topic} optimization`, `${topic} effectiveness directly impacts employee retention rates (18% improvement)`, `Our analysis shows ${topic} ROI compounds at 127% annually when done correctly` ]
        return points[index % points.length]
    }
    const getWildcardPoint = (topic: string, index: number): string => {
        const points = [ `${topic} is 20% math, 80% psychology - and most CFOs get this backwards`, `The best ${topic} strategies I've seen started as "terrible" ideas on a napkin`, `Your team's resistance to ${topic} changes? That's actually valuable data`, `I used to think ${topic} was about control. Turns out it's about trust`, `${topic} done right feels like magic to your team, science to your board` ]
        return points[index % points.length]
    }

    return [
      {
        type: 'bold', label: 'Bold', description: 'Direct and confident approach', icon: Target,
        content: `Stop doing this immediately: ${topic}\n\nThe framework that actually works:\n\n${Array.from({length: numPoints}, (_, i) => `${i + 1}. ${getBoldPoint(topic, i)}`).join('\n\n')}\n\n💡 Reality check: ${context || 'Traditional methods are failing modern finance teams.'}\n\nMost finance leaders get this wrong. Don't be one of them.\n\nWhat's your take? Agree or disagree? �\n\n#Finance #CFO #Leadership #SaaS #RealTalk`
      },
      {
        type: 'insightful', label: 'Insightful', description: 'Data-driven and analytical', icon: BarChart3,
        content: `📊 Deep dive: ${topic}\n\nAfter analyzing patterns across 100+ finance organizations, here are the key insights:\n\n${Array.from({length: numPoints}, (_, i) => `${i + 1}️⃣ ${getInsightfulPoint(topic, i)}`).join('\n\n')}\n\n📈 Key finding: ${context || 'Data-driven approaches lead to a 25-40% improvement in financial efficiency.'}\n\nThe data consistently shows that companies implementing these approaches see significant gains.\n\nWhat metrics are you tracking for ${topic}? Share your experience below.\n\n#FinanceStrategy #DataDriven #CFOInsights #BusinessIntelligence #Metrics`
      },
      {
        type: 'wildcard', label: 'Wildcard', description: 'Creative and engaging twist', icon: Sparkles,
        content: `Plot twist: Everything you know about ${topic} is backwards.\n\nHere's the playbook they don't teach in business school:\n\n${Array.from({length: numPoints}, (_, i) => { const emojis = ['🎯', '⚡', '🔥', '💎', '🚀']; return `${emojis[i % emojis.length]} ${getWildcardPoint(topic, i)}` }).join('\n\n')}\n\n🎭 The real story: ${context || 'Innovation in finance comes from challenging the status quo.'}\n\nBeen there, done that, learned the hard way so you don't have to.\n\nWhich of these resonates most with your experience? Let's discuss! 👇\n\n#FinanceLife #CFOStruggles #LessonsLearned #FinanceHumor #Innovation`
      }
    ]
  }

  // Saves the currently selected draft to Supabase
  const handleSaveDraft = async () => {
    if (!user || !generatedDrafts.length) return

    const draftToSave = generatedDrafts.find(d => d.type === selectedDraft)
    if (!draftToSave) return

    const contentPayload = {
      user_id: user.id,
      content_text: draftToSave.content,
      content_type: activeTab,
      tone_used: selectedDraft,
      prompt_input: formData.topic,
      is_saved: true,
      idea_id: selectedIdea?.id,
      variations_data: {
        all_drafts: generatedDrafts.map(d => ({ type: d.type, content: d.content })),
        selected_draft: selectedDraft
      }
    }

    await saveGeneratedContent(contentPayload)
    await loadSavedContent() // Refresh the saved content list
    await refreshProfile() // Refresh user stats
  }

  // Configuration for UI elements
  const contentTypes = [
    { id: 'framework' as ContentType, label: 'Framework' }, { id: 'story' as ContentType, label: 'Story' }, { id: 'trend' as ContentType, label: 'Trend Take' }, { id: 'mistake' as ContentType, label: 'Mistake Story' }, { id: 'metrics' as ContentType, label: 'Metrics' }
  ]
  const toneOptions = [
    { value: 'insightful_cfo' as ToneType, label: 'Insightful CFO' }, { value: 'bold_operator' as ToneType, label: 'Bold Operator' }, { value: 'strategic_advisor' as ToneType, label: 'Strategic Advisor' }, { value: 'data_driven_expert' as ToneType, label: 'Data-Driven Expert' }
  ]
  const navigationItems = [
    { id: 'ideas' as ActivePage, label: 'Ideas', icon: Lightbulb }, { id: 'generator' as ActivePage, label: 'Generator', icon: Zap }, { id: 'production' as ActivePage, label: 'Production', icon: BarChart3 }, { id: 'plan' as ActivePage, label: 'Plan', icon: Calendar }, { id: 'analytics' as ActivePage, label: 'Analytics', icon: BarChart }, { id: 'feed' as ActivePage, label: 'Feed', icon: Rss }
  ]

  // Helper functions to get dynamic data for rendering
  const getCurrentDraftContent = () => generatedDrafts.find(d => d.type === selectedDraft)?.content || ''
  const getProfileDisplayName = () => profile?.full_name || user?.email?.split('@')[0] || 'Finance Pro'
  const getProfileTitle = () => profile?.role || 'Chief Financial Officer'

  // Main render function to switch between pages
  const renderPageContent = () => {
    switch (activePage) {
      case 'ideas':
        return <IdeasPage onWritePost={handleWriteFromIdea} />
      case 'production':
        return <ProductionPipeline />
      case 'plan':
      case 'analytics':
      case 'feed':
        const pageDetails = {
          plan: { title: 'Content Calendar', icon: Calendar, comingSoon: true },
          analytics: { title: 'Analytics', icon: BarChart, comingSoon: true },
          feed: { title: 'Feed', icon: Rss, comingSoon: true },
        }[activePage]
        const Icon = pageDetails.icon
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{pageDetails.title}</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{pageDetails.title} Coming Soon</h3>
              <p className="text-gray-600">This feature is currently under development.</p>
            </div>
          </div>
        )
      default: // 'generator' page
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid gap-8" style={{ gridTemplateColumns: showPreview && showGenerated ? '1fr 400px' : '2fr 1fr' }}>
              
              {/* Left Pane: Content Generator & Drafts */}
              <div className="space-y-6">
                {/* Generator Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Your Next Post</h2>
                  <p className="text-gray-600 mb-6">Create engaging finance content that builds your authority.</p>
                  
                  {/* Content Type Tabs */}
                  <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                    {contentTypes.map((type) => (
                      <button key={type.id} onClick={() => setActiveTab(type.id)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${activeTab === type.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {type.label}
                      </button>
                    ))}
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                      <input type="text" value={formData.topic} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} placeholder="e.g., SaaS metrics every CFO should track" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Number of Points</label>
                        <select value={formData.points} onChange={(e) => setFormData({ ...formData, points: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                          <option value="3">3 points</option><option value="5">5 points</option><option value="7">7 points</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Base Tone</label>
                        <select value={formData.tone} onChange={(e) => setFormData({ ...formData, tone: e.target.value as ToneType })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                          {toneOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Additional Context (Optional)</label>
                      <textarea value={formData.context} onChange={(e) => setFormData({ ...formData, context: e.target.value })} placeholder="Any specific details, examples, or angle..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" rows={3}/>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <div className="mt-6 flex justify-between items-center">
                    <div className="text-sm text-gray-500">💡 Tip: We'll create 3 variations for you.</div>
                    <button onClick={handleGenerate} disabled={isGenerating || !formData.topic.trim() || (profile?.posts_remaining || 0) <= 0} className="gradient-bg text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isGenerating ? (<><div className="loading-spinner"></div><span>Creating Drafts...</span></>) : (<><Zap className="w-5 h-5" /><span>Generate 3 Drafts</span></>)}
                    </button>
                  </div>
                </div>

                {/* Generated Drafts Section */}
                {showGenerated && generatedDrafts.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 fade-in">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">3 Post Drafts</h3>
                      <button onClick={() => setShowPreview(!showPreview)} className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${showPreview ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        <Eye className="w-4 h-4" /><span>LinkedIn Preview</span>
                      </button>
                    </div>
                    <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
                      {generatedDrafts.map((draft) => { const Icon = draft.icon; return (
                        <button key={draft.type} onClick={() => setSelectedDraft(draft.type)} className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition ${selectedDraft === draft.type ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
                          <Icon className="w-4 h-4" /><span>{draft.label}</span>
                        </button>
                      )})}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-indigo-500">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{generatedDrafts.find(d => d.type === selectedDraft)?.label} Style</h4>
                          <p className="text-sm text-gray-600">{generatedDrafts.find(d => d.type === selectedDraft)?.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button onClick={handleSaveDraft} className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition">Save Draft</button>
                          <button onClick={() => navigator.clipboard.writeText(getCurrentDraftContent())} className="text-sm text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-200 transition">Copy</button>
                        </div>
                      </div>
                      <div className="text-gray-800 leading-relaxed whitespace-pre-line">{getCurrentDraftContent()}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Pane: Preview or Stats */}
              <div className="space-y-6">
                {showPreview && showGenerated ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">LinkedIn Preview</h3>
                      <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600 text-sm">Hide</button>
                    </div>
                    <LinkedInPreview content={getCurrentDraftContent()} profileName={getProfileDisplayName()} profileTitle={getProfileTitle()} />
                  </div>
                ) : (
                  <>
                    {/* Stats Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center"><span className="text-gray-600">Posts Generated</span><span className="font-semibold text-gray-900">{profile?.posts_generated_this_month || 0}</span></div>
                        <div className="flex justify-between items-center"><span className="text-gray-600">Posts Saved</span><span className="font-semibold text-gray-900">{profile?.posts_saved_this_month || 0}</span></div>
                        <div className="flex justify-between items-center"><span className="text-gray-600">Plan</span><span className="font-semibold text-indigo-600 capitalize">{profile?.plan_type || 'Starter'}</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-4"><div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${Math.max(0, Math.min(100, ((profile?.posts_generated_this_month || 0) / 50) * 100))}%` }}></div></div>
                        <div className="text-sm text-gray-500 text-center">{profile?.posts_remaining || 0} posts remaining</div>
                      </div>
                    </div>
                    {/* Trending Topics Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-96">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🔥 Trending in Finance</h3>
                      <div className="space-y-3">
                        {trendingTopics.length > 0 ? trendingTopics.map((topic) => (
                          <div key={topic.id} className="text-sm cursor-pointer hover:bg-gray-50 p-2 rounded-md" onClick={() => setFormData(prev => ({...prev, topic: topic.topic_title}))}>
                            <div className="font-medium text-gray-900 mb-1">{topic.topic_title}</div>
                            <div className="text-gray-600 text-xs">{topic.description}</div>
                          </div>
                        )) : <p className="text-sm text-gray-500">No trending topics available.</p>}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">CM</span></div>
                <span className="text-xl font-bold text-gray-900">CyberMinds</span>
              </div>
              <div className="hidden md:flex items-center space-x-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button key={item.id} onClick={() => setActivePage(item.id)} className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${activePage === item.id ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                      <Icon className="w-4 h-4" /><span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center space-x-2 bg-gray-100 rounded-full p-1 pr-3 hover:bg-gray-200 transition">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-white" /></div>
                  <span className="text-sm font-medium text-gray-700">{getProfileDisplayName()}</span>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-xs text-gray-500">Logged in as {user?.email}</div>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Settings className="w-4 h-4 mr-3" />Settings</button>
                      <hr className="my-1" />
                      <button onClick={signOut} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4 mr-3" />Sign Out</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Render the active page content */}
      <main>
        {renderPageContent()}
      </main>
    </div>
  )
}
�
