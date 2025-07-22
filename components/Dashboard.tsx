'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  getTrendingTopics, 
  saveGeneratedContent, 
  getSavedContent,
  updateUserProfile,
  TrendingTopic,
  GeneratedContent 
} from '../lib/supabase'
import { LogOut, Settings, BarChart3, Zap, User } from 'lucide-react'

type ToneType = 'insightful_cfo' | 'bold_operator' | 'strategic_advisor' | 'data_driven_expert'
type ContentType = 'framework' | 'story' | 'trend' | 'mistake' | 'metrics'

export default function Dashboard() {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<ContentType>('framework')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPosts, setGeneratedPosts] = useState<string[]>([])
  const [showGenerated, setShowGenerated] = useState(false)
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [savedContent, setSavedContent] = useState<GeneratedContent[]>([])
  const [showProfileMenu, setShowProfileMenu] = useState(false)

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

  const handleGenerate = async () => {
    if (!formData.topic.trim()) return

    setIsGenerating(true)
    
    // Simulate AI generation (replace with actual API call later)
    setTimeout(() => {
      const mockPosts = generateMockPosts(formData)
      setGeneratedPosts(mockPosts)
      setShowGenerated(true)
      setIsGenerating(false)
      
      // Update user stats
      if (profile && user) {
        updateUserProfile(user.id, {
          posts_generated_this_month: profile.posts_generated_this_month + 1,
          posts_remaining: Math.max(0, profile.posts_remaining - 1)
        }).then(() => refreshProfile())
      }
    }, 2000)
  }

  const generateMockPosts = (data: typeof formData) => {
    const toneStyles = {
      insightful_cfo: 'data-driven and analytical',
      bold_operator: 'confident and direct',
      strategic_advisor: 'thoughtful and strategic',
      data_driven_expert: 'metrics-focused and precise'
    }

    const posts = [
      `🔍 ${data.points} ${activeTab === 'framework' ? 'Key Insights' : 'Essential Points'} on ${data.topic}

After analyzing the latest trends, here's what every finance professional should know:

${Array.from({length: parseInt(data.points)}, (_, i) => 
  `${i + 1}️⃣ ${getRandomInsight(data.topic, i)}`
).join('\n\n')}

${data.context ? `\n💡 Context: ${data.context}` : ''}

What's your experience with ${data.topic}? Share your thoughts below! 👇

#Finance #CFO #SaaS #FinanceLeadership`,

      `📊 The ${data.topic} Framework That Changed Everything

As a ${toneStyles[data.tone]} finance leader, I've learned that ${data.topic} isn't just about numbers—it's about strategic insight.

Here are the ${data.points} pillars that matter most:

${Array.from({length: parseInt(data.points)}, (_, i) => 
  `⚡ ${getRandomFrameworkPoint(data.topic, i)}`
).join('\n\n')}

${data.context ? `\nKey insight: ${data.context}` : ''}

Have you implemented this approach? I'd love to hear your results.

#FinanceStrategy #CFOInsights #BusinessIntelligence`
    ]

    return posts
  }

  const getRandomInsight = (topic: string, index: number) => {
    const insights = [
      `Understanding ${topic} requires deep market analysis`,
      `Most companies overlook the strategic implications of ${topic}`,
      `The data shows ${topic} drives 40% more engagement when done right`,
      `Smart CFOs use ${topic} as a competitive advantage`,
      `${topic} isn't just a metric—it's a business philosophy`
    ]
    return insights[index % insights.length]
  }

  const getRandomFrameworkPoint = (topic: string, index: number) => {
    const points = [
      `Define clear KPIs for ${topic} measurement`,
      `Establish baseline metrics before implementing changes`,
      `Create feedback loops for continuous improvement`,
      `Align team incentives with ${topic} outcomes`,
      `Document learnings for future optimization`
    ]
    return points[index % points.length]
  }

  const handleSavePost = async (postIndex: number) => {
    if (!user || !generatedPosts[postIndex]) return

    const content = {
      user_id: user.id,
      content_text: generatedPosts[postIndex],
      content_type: activeTab,
      tone_used: formData.tone,
      prompt_input: formData.topic,
      is_saved: true
    }

    await saveGeneratedContent(content)
    await loadSavedContent()
    await refreshProfile()
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CM</span>
                </div>
                <span className="text-xl font-bold text-gray-900">CyberMinds</span>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm text-gray-500">|</span>
                <span className="text-sm font-medium text-indigo-600">Finance Niche</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full pulse-dot"></div>
                <span className="text-sm text-gray-600">
                  {profile?.posts_remaining || 0} posts remaining
                </span>
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-2 hover:bg-gray-200 transition"
                >
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.email?.split('@')[0] || 'User'}
                  </span>
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
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

      {/* Main Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Content Generator */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Your Next Post</h2>
                <p className="text-gray-600">Create engaging finance content that builds your authority</p>
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
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
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
                      Tone
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
                  💡 Tip: Be specific for better results
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !formData.topic.trim() || (profile?.posts_remaining || 0) <= 0}
                  className="gradient-bg text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Generate Content</span>
                    </>
                  )}
                </button>
              </div>

              {/* Generated Content */}
              {showGenerated && generatedPosts.length > 0 && (
                <div className="mt-8 border-t border-gray-200 pt-6 fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Generated Posts</h3>
                    <div className="flex space-x-2">
                      <button 
                        onClick={handleGenerate}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Regenerate
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {generatedPosts.map((post, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-sm font-medium text-indigo-600">
                            Version {index + 1}
                          </span>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleSavePost(index)}
                              className="text-sm text-gray-600 hover:text-gray-800"
                            >
                              💾 Save
                            </button>
                            <button className="text-sm text-gray-600 hover:text-gray-800">
                              ✏️ Edit
                            </button>
                            <button 
                              onClick={() => navigator.clipboard.writeText(post)}
                              className="text-sm text-gray-600 hover:text-gray-800"
                            >
                              📋 Copy
                            </button>
                          </div>
                        </div>
                        <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                          {post}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
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
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
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
                      <div className="text-xs text-gray-500 capitalize">
                        {content.content_type} • {new Date(content.created_at).toLocaleDateString()}
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
              <button className="w-full mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                Use Trending Topic →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
