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
import RichTextEditor from './RichTextEditor' // Import the new editor for Phase 4

type ToneType = 'insightful_cfo' | 'bold_operator' | 'strategic_advisor' | 'data_driven_expert'
type ContentType = 'framework' | 'story' | 'trend' | 'mistake' | 'metrics'
type ActivePage = 'generator' | 'ideas' | 'production' | 'plan' | 'analytics' | 'feed'
type DraftType = 'bold' | 'insightful' | 'wildcard'

interface GeneratedDraft {
  type: DraftType
  content: string // This will now be generated as HTML
  label: string
  description: string
  icon: any
}

export default function Dashboard() {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const [activePage, setActivePage] = useState<ActivePage>('generator')
  const [activeTab, setActiveTab] = useState<ContentType>('framework')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDrafts, setGeneratedDrafts] = useState<GeneratedDraft[]>([])
  const [selectedDraft, setSelectedDraft] = useState<DraftType>('bold')
  
  // New state for the rich text editor's content
  const [editorContent, setEditorContent] = useState('')

  const [showGenerated, setShowGenerated] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [savedContent, setSavedContent] = useState<GeneratedContent[]>([])
  const [showProfileMenu, setShowProfileMenu] = useState(false)
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

  // When the selected draft changes, update the editor content
  useEffect(() => {
    const newContent = generatedDrafts.find(d => d.type === selectedDraft)?.content || ''
    setEditorContent(newContent)
  }, [selectedDraft, generatedDrafts])

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
    // Switch to generator page and pre-fill with idea
    setActivePage('generator')
    setFormData(prev => ({
      ...prev,
      topic: idea.title,
      context: idea.description || ''
    }))
    setSelectedIdea(idea)
    
    // Auto-generate content from the idea
    setTimeout(() => {
      handleGenerate()
    }, 100)
  }

  const handleGenerate = async () => {
    if (!formData.topic.trim()) return

    setIsGenerating(true)
    
    // Simulate AI generation with 3 different drafts
    setTimeout(() => {
      const drafts = generateMultipleDraftsAsHtml(formData)
      setGeneratedDrafts(drafts)
      setSelectedDraft('bold') // Default to first tab
      setShowGenerated(true)
      setShowPreview(true) // Automatically show preview when content is generated
      setIsGenerating(false)
      
      // Update user stats
      if (profile && user) {
        updateUserProfile(user.id, {
          posts_generated_this_month: (profile.posts_generated_this_month || 0) + 1,
          posts_remaining: Math.max(0, (profile.posts_remaining || 0) - 1)
        }).then(() => refreshProfile())
      }
    }, 3000) // Slightly longer for multiple drafts
  }
  
  const textToHtml = (text: string) => {
    // A simple conversion: wrap each line in a <p> tag.
    // Tiptap will handle the rest.
    return text.split('\n').filter(line => line.trim() !== '').map(line => `<p>${line}</p>`).join('')
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
).join('\n\n')}\n\n${context ? `💡 Reality check: ${context}` : ''}\n\nMost finance leaders get this wrong. Don't be one of them.\n\nWhat's your take? Agree or disagree? 👇\n\n#Finance #CFO #Leadership #SaaS #RealTalk`
  }

  const generateInsightfulDraft = (topic: string, points: number, context: string, contentType: ContentType): string => {
    return `📊 Deep dive: ${topic}\n\nAfter analyzing patterns across 100+ finance organizations, here are the key insights:\n\n${Array.from({length: points}, (_, i) => 
  `${i + 1}️⃣ ${getInsightfulPoint(topic, i)}`
).join('\n\n')}\n\n${context ? `📈 Key finding: ${context}` : ''}\n\nThe data consistently shows that companies implementing these approaches see 25-40% improvement in financial efficiency.\n\nWhat metrics are you tracking for ${topic}? Share your experience below.\n\n#FinanceStrategy #DataDriven #CFOInsights #BusinessIntelligence #Metrics`
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
}).join('\n\n')}\n\n${context ? `🎭 Plot twist: ${context}` : ''}\n\nBeen there, done that, bought the t-shirt (and learned the hard way).\n\nWhich of these resonates most with your experience? Let's discuss! 👇\n\n#FinanceLife #CFOStruggles #LessonsLearned #FinanceHumor #RealTalk`
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

  const generateMultipleDraftsAsHtml = (data: typeof formData): GeneratedDraft[] => {
    const { topic, points, context } = data
    const numPoints = parseInt(points)
    return [
      { type: 'bold', label: 'Bold', description: 'Direct and confident approach', icon: Target, content: textToHtml(generateBoldDraft(topic, numPoints, context, activeTab)) },
      { type: 'insightful', label: 'Insightful', description: 'Data-driven and analytical', icon: BarChart3, content: textToHtml(generateInsightfulDraft(topic, numPoints, context, activeTab)) },
      { type: 'wildcard', label: 'Wildcard', description: 'Creative and engaging twist', icon: Sparkles, content: textToHtml(generateWildcardDraft(topic, numPoints, context, activeTab)) }
    ]
  }

  const handleSaveDraft = async () => {
    if (!user || !editorContent) return

    const content = {
      user_id: user.id,
      content_text: editorContent, // Save the HTML content from the editor
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

  const contentTypes = [
    { id: 'framework' as ContentType, label: '📊 Framework' },
    { id: 'story' as ContentType, label: '💡 Story' },
    { id: 'trend' as ContentType, label: '📈 Trend Take' },
    { id: 'mistake' as ContentType, label: '⚠️ Mistake Story' },
    { id: 'metrics' as ContentType, label: '📊 Metrics' }
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
    { id: 'production' as ActivePage, label: 'Production', icon: BarChart3 },
    { id: 'plan' as ActivePage, label: 'Plan', icon: Calendar },
    { id: 'analytics' as ActivePage, label: 'Analytics', icon: BarChart },
    { id: 'feed' as ActivePage, label: 'Feed', icon: Rss }
  ]

  const getProfileDisplayName = () => {
    if (user?.email) return user.email.split('@')[0]
    return 'Finance Professional'
  }

  const getProfileTitle = () => {
    if (profile?.role) return profile.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    return 'Chief Financial Officer'
  }

  const renderPageContent = () => {
    switch (activePage) {
      case 'ideas':
        return <IdeasPage onWritePost={handleWriteFromIdea} />
      
      case 'production':
        return <ProductionPipeline />
      
      case 'plan':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Content Calendar</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendar Coming Soon</h3>
              <p className="text-gray-600">Schedule and plan your content strategy</p>
            </div>
          </div>
        )
      
      case 'analytics':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
              <p className="text-gray-600">Track your content performance and engagement</p>
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
      
      default: // generator
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid gap-8" style={{ gridTemplateColumns: showPreview && showGenerated ? '1fr 400px' : '2fr 1fr' }}>
              
              {/* Content Generator */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

                  {/* Content Type Tabs */}
                  <div className="flex space-x-2 mb-6 overflow-x-auto">
                    {contentTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setActiveTab(type.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                          activeTab === type.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>

                  {/* Content Form */}
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
                          setSelectedIdea(null) // Clear selected idea when manually editing
                        }}
                        placeholder="e.g., SaaS metrics every CFO should track"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          {toneOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Context (Optional)
                      </label>
                      <textarea
                        value={formData.context}
                        onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                        placeholder="Any specific details, examples, or angle you want to include..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Generate Button */}
                  <div className="mt-6 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      💡 Tip: We'll create 3 different variations for you to choose from
                    </div>
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating || !formData.topic.trim() || (profile?.posts_remaining || 0) <= 0}
                      className="gradient-bg text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    
                    {/* Draft Selection Tabs */}
                    <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
                      {generatedDrafts.map((draft) => {
                        const Icon = draft.icon
                        return (
                          <button
                            key={draft.type}
                            onClick={() => setSelectedDraft(draft.type)}
                            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition ${
                              selectedDraft === draft.type
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{draft.label}</span>
                          </button>
                        )
                      })}
                    </div>

                    {/* RICH TEXT EDITOR INTEGRATION */}
                    <RichTextEditor 
                      content={editorContent} 
                      onChange={setEditorContent} 
                    />
                    
                    <div className="flex justify-end space-x-2 mt-4">
                      <button 
                        onClick={handleSaveDraft}
                        className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition"
                      >
                        💾 Save This Draft
                      </button>
                      <button 
                        onClick={() => navigator.clipboard.writeText(editorContent)}
                        className="text-sm text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
                      >
                        📋 Copy HTML
                      </button>
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
                      content={editorContent} 
                      profileName={getProfileDisplayName()} 
                      profileTitle={getProfileTitle()} 
                    />
                  </div>
                </div>
              )}

              {/* Original Sidebar - Only show when preview is hidden */}
              {(!showPreview || !showGenerated) && (
                <div className="space-y-6">
                  {/* Stats */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center"><span className="text-gray-600">Posts Generated</span><span className="font-semibold text-gray-900">{profile?.posts_generated_this_month || 0}</span></div>
                      <div className="flex justify-between items-center"><span className="text-gray-600">Posts Saved</span><span className="font-semibold text-gray-900">{profile?.posts_saved_this_month || 0}</span></div>
                      <div className="flex justify-between items-center"><span className="text-gray-600">Plan</span><span className="font-semibold text-indigo-600 capitalize">{profile?.plan_type || 'Starter'}</span></div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-4"><div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${Math.max(0, Math.min(100, ((profile?.posts_generated_this_month || 0) / 50) * 100))}%` }}></div></div>
                      <div className="text-sm text-gray-500 text-center">{profile?.posts_remaining || 0} posts remaining ({profile?.plan_type} Plan)</div>
                    </div>
                  </div>

                  {/* Recent Saves */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Saves</h3>
                      <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</button>
                    </div>
                    <div className="space-y-3">
                      {savedContent.length > 0 ? (savedContent.map((content) => (<div key={content.id} className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition border-l-4 border-indigo-500"><div className="text-sm font-medium text-gray-900 mb-1 truncate">{content.content_text.substring(0, 50)}...</div><div className="text-xs text-gray-500 capitalize flex items-center gap-2"><span>{content.content_type}</span>{content.tone_used && (<><span>•</span><span className="capitalize">{content.tone_used} style</span></>)}<span>•</span><span>{new Date(content.created_at).toLocaleDateString()}</span></div></div>))) : (<div className="text-sm text-gray-500 text-center py-4">No saved content yet. Generate and save your first post!</div>)}
                    </div>
                  </div>

                  {/* Trending Topics */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🔥 Trending in Finance</h3>
                    <div className="space-y-3">
                      {trendingTopics.map((topic) => (<div key={topic.id} className="text-sm"><div className="font-medium text-gray-900 mb-1">{topic.topic_title}</div><div className="text-gray-600 text-xs">{topic.description}</div></div>))}
                    </div>
                    <button onClick={() => setActivePage('ideas')} className="w-full mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium">Get Content Ideas →</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">CM</span></div>
                <span className="text-xl font-bold text-gray-900">CyberMinds</span>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                {navigationItems.map((item) => { const Icon = item.icon; return (
                  <button key={item.id} onClick={() => setActivePage(item.id)} className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${activePage === item.id ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                    <Icon className="w-4 h-4" /><span>{item.label}</span>
                  </button>
                )})}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full pulse-dot"></div>
                <span className="text-sm text-gray-600">{profile?.posts_remaining || 0} posts remaining</span>
              </div>
              <div className="relative">
                <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-2 hover:bg-gray-200 transition">
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center"><User className="w-3 h-3 text-white" /></div>
                  <span className="text-sm font-medium text-gray-700">{getProfileDisplayName()}</span>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Settings className="w-4 h-4 mr-3" />Settings</button>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><BarChart3 className="w-4 h-4 mr-3" />Usage</button>
                      <hr className="my-1" />
                      <button onClick={signOut} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><LogOut className="w-4 h-4 mr-3" />Sign Out</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main>
        {renderPageContent()}
      </main>
    </div>
  )
}
