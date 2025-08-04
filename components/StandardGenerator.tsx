'use client'

import { useState, useEffect } from 'react'
import { Clock, Sparkles, Eye, Edit3, Calendar, ArrowRight, Settings } from 'lucide-react'
import RichTextEditor from './RichTextEditor'
import LinkedInPreview from './LinkedInPreview'
import { useContent } from '../contexts/ContentContext'
import { useToast } from './ToastNotifications'
import { useWorkflow } from '../contexts/WorkflowContext'
import { GeneratedContent } from '../lib/supabase'

interface StandardGeneratorProps {
  onSwitchMode: (mode: 'express' | 'power') => void
  onBack: () => void
  ideationData?: {
  topic: string
  angle: string
  takeaways: string[]
  source_page: string
  session_id?: string
}
}

export default function StandardGenerator({ onSwitchMode, onBack, ideationData }: StandardGeneratorProps) {
  const [topic, setTopic] = useState(ideationData?.topic || '')
const [contentType, setContentType] = useState('framework')
const [tone, setTone] = useState('insightful_cfo')
const [points, setPoints] = useState('5')
const [context, setContext] = useState(
  ideationData ? 
    `Angle: ${ideationData.angle}\n\nKey Takeaways:\n${ideationData.takeaways.map((t, i) => `${i + 1}. ${t}`).join('\n')}` 
    : ''
)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0)
  const { moveToCreate } = useWorkflow()

  // Rotating placeholder suggestions
  const placeholders = [
    "Financial planning best practices for SaaS",
    "Common budgeting mistakes CFOs make",
    "KPIs that actually drive business growth",
    "Month-end close optimization strategies",
    "Cash flow management for startups"
  ]

  const contentTypes = [
    { id: 'framework', label: '📊 Framework', description: 'Structured approach or methodology' },
    { id: 'story', label: '💡 Story', description: 'Personal experience or case study' },
    { id: 'trend', label: '📈 Trend Take', description: 'Analysis of current market trends' },
    { id: 'mistake', label: '⚠️ Mistake Story', description: 'Lessons learned from failures' },
    { id: 'metrics', label: '📊 Metrics', description: 'Data-driven insights and KPIs' }
  ]

  const toneOptions = [
    { value: 'insightful_cfo', label: 'Insightful CFO', description: 'Data-driven and analytical' },
    { value: 'bold_operator', label: 'Bold Operator', description: 'Direct and action-oriented' },
    { value: 'strategic_advisor', label: 'Strategic Advisor', description: 'Thoughtful and advisory' },
    { value: 'data_driven_expert', label: 'Data-Driven Expert', description: 'Numbers and metrics focused' }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleGenerate = async () => {
  if (!topic.trim()) return
  
  setIsGenerating(true)
  
  // Track workflow progression if coming from ideation
  if (ideationData) {
    try {
      await moveToCreate('standard')
    } catch (error) {
      console.error('Error tracking workflow:', error)
    }
  }
  
  // Simulate AI generation
  setTimeout(() => {
    setIsGenerating(false)
    setShowResults(true)
  }, 3000)
}

  const handleAIImprovement = async (text: string, type: 'bold' | 'improve' | 'expand'): Promise<string> => {
    // Mock AI improvement - in real app, this would call your AI service
    await new Promise(resolve => setTimeout(resolve, 1000))
    return text + ' [AI Enhanced]'
  }

  if (showResults) {
  return (
    <StandardResults 
      topic={topic}
      contentType={contentType}
      tone={tone}
      ideationData={ideationData}
      onBack={() => setShowResults(false)}
      onSwitchMode={onSwitchMode}
    />
  )
}

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="text-slate-600 hover:text-slate-800 mb-4 transition"
        >
          ← Back to Mode Selection
        </button>
        
        <div className="flex items-center space-x-3 mb-4">
  <div className="w-10 h-10 bg-gradient-to-r from-slate-500 to-gray-600 rounded-lg flex items-center justify-center">
    <Clock className="w-5 h-5 text-white" />
  </div>
  <div>
    <h1 className="text-2xl font-bold text-gray-900">Standard Mode</h1>
    <p className="text-gray-600">
      {ideationData ? 'Creating content from your ideation' : 'Balanced control with smart defaults'}
    </p>
  </div>
</div>

{/* Ideation Context Display */}
{ideationData && (
  <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-4 mb-6">
    <div className="flex items-center space-x-2 mb-3">
      <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center">
        <Sparkles className="w-4 h-4 text-teal-600" />
      </div>
      <h3 className="font-semibold text-gray-900">From Your Ideation Session</h3>
    </div>
    <div className="space-y-2 text-sm">
      <div><span className="font-medium text-gray-700">Angle:</span> <span className="text-gray-600">{ideationData.angle}</span></div>
      <div><span className="font-medium text-gray-700">Key Points:</span> <span className="text-gray-600">{ideationData.takeaways.length} takeaways pre-loaded in context</span></div>
    </div>
  </div>
)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Content Details</h2>
            
            {/* Topic Input */}
            <div className="mb-6">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    {ideationData ? 'Your topic (from ideation)' : 'What do you want to write about?'}
  </label>
  <input
    type="text"
    value={topic}
    onChange={(e) => setTopic(e.target.value)}
    placeholder={ideationData ? ideationData.topic : placeholders[currentPlaceholder]}
    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-colors ${
      ideationData ? 'border-teal-300 bg-teal-50' : 'border-gray-300'
    }`}
  />
</div>

            {/* Content Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Content Type</label>
              <div className="grid grid-cols-1 gap-2">
                {contentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setContentType(type.id)}
                    className={`text-left p-3 rounded-lg border-2 transition ${
                      contentType === type.id
                        ? 'border-slate-500 bg-slate-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone and Points */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                >
                  {toneOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Points</label>
                <select
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                >
                  <option value="3">3 points</option>
                  <option value="5">5 points</option>
                  <option value="7">7 points</option>
                  <option value="10">10 points</option>
                </select>
              </div>
            </div>

            {/* Context Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Context (Optional)
              </label>
              <RichTextEditor
                content={context}
                onChange={setContext}
                placeholder="Any specific details, examples, or angle you want to include..."
                onAIImprove={handleAIImprovement}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600">
                Want faster creation?{' '}
                <button
                  onClick={() => onSwitchMode('express')}
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  Try Express Mode
                </button>
              </div>
              
              <div className="text-sm text-gray-600">
                Need more control?{' '}
                <button
                  onClick={() => onSwitchMode('power')}
                  className="text-purple-600 hover:text-purple-700 font-medium underline"
                >
                  Enter Writer Suite
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!topic.trim() || isGenerating}
              className="w-full bg-gradient-to-r from-slate-500 to-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating 3 Drafts...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate 3 Drafts</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">💡 Pro Tips</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Be specific with your topic for better AI results</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Use the context field to add personal experiences</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Framework posts perform 40% better than generic content</p>
              </div>
            </div>
          </div>

          {/* Trending Topics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">🔥 Trending Now</h3>
            <div className="space-y-2">
              {[
                'AI impact on financial planning',
                'Remote finance team management', 
                'SaaS unit economics optimization',
                'Year-end budget planning strategies'
              ].map((trend, index) => (
                <button
                  key={index}
                  onClick={() => setTopic(trend)}
                  className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition text-sm text-gray-700"
                >
                  "{trend}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Results component for Standard Mode
function StandardResults({ 
  topic, 
  contentType, 
  tone, 
  ideationData,
  onBack, 
  onSwitchMode 
}: { 
  topic: string
  contentType: string
  tone: string
  ideationData?: { topic: string; angle: string; takeaways: string[]; source_page?: string; session_id?: string }
  onBack: () => void
  onSwitchMode: (mode: 'express' | 'power') => void
}) {
  const [selectedDraft, setSelectedDraft] = useState('bold')
  const [showPreview, setShowPreview] = useState(true)
  const [editingDraft, setEditingDraft] = useState<string | null>(null)
  const { saveDraft, setSelectedContent, setShowScheduleModal } = useContent()
  const { showToast } = useToast()

  // Mock generated drafts
  const drafts = [
    {
      type: 'bold',
      label: 'Bold',
      description: 'Direct and confident approach',
      content: `I'm going to be direct: ${topic}\n\nThe framework that actually works:\n\n1. Stop overthinking the process - action beats analysis paralysis\n2. If you're not uncomfortable, you're not pushing hard enough\n3. Your strategy should scare competition, not comfort them\n4. Without clear accountability, it's just expensive theater\n5. Most teams fail because they won't make hard decisions\n\nMost finance leaders get this wrong. Don't be one of them.\n\nWhat's your take? Agree or disagree? 👇\n\n#Finance #CFO #Leadership #RealTalk`
    },
    {
      type: 'insightful',
      label: 'Insightful', 
      description: 'Data-driven and analytical',
      content: `📊 Deep dive: ${topic}\n\nAfter analyzing patterns across 100+ finance organizations, here are the key insights:\n\n1️⃣ Companies with structured processes show 35% better performance\n2️⃣ The correlation between maturity and valuation is stronger than expected\n3️⃣ Leading organizations invest 2.3x more resources in optimization\n4️⃣ Effectiveness directly impacts retention rates (18% improvement)\n5️⃣ ROI compounds at 127% annually when done correctly\n\nThe data consistently shows 25-40% improvement in efficiency.\n\nWhat metrics are you tracking? Share your experience below.\n\n#FinanceStrategy #DataDriven #CFOInsights #BusinessIntelligence`
    },
    {
      type: 'wildcard',
      label: 'Wildcard',
      description: 'Creative and engaging twist', 
      content: `If ${topic.toLowerCase()} were a recipe, most CFOs would be missing these ingredients:\n\n🎯 The right timing (not when you're comfortable)\n⚡ Proper measurement (beyond vanity metrics)\n🔥 Team alignment (everyone rowing same direction)\n💎 Resource allocation (invest where it matters)\n🚀 Continuous improvement (not set-and-forget)\n\n🎭 Plot twist: It's 20% math, 80% psychology - and most get this backwards.\n\nBeen there, done that, bought the t-shirt (and learned the hard way).\n\nWhich ingredient resonates most? Let's discuss! 👇\n\n#FinanceLife #CFOStruggles #LessonsLearned #RealTalk`
    }
  ]

  const currentDraft = drafts.find(d => d.type === selectedDraft)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-slate-600 hover:text-slate-800 mb-4 transition"
        >
          ← Back to Edit
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Your 3 Generated Drafts</h2>
        <p className="text-gray-600">Choose and customize your preferred version</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Draft Selection and Editing */}
        <div className="lg:col-span-2 space-y-6">
          {/* Draft Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {drafts.map((draft) => (
              <button
                key={draft.type}
                onClick={() => setSelectedDraft(draft.type)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition ${
                  selectedDraft === draft.type
                    ? 'bg-white text-slate-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span>{draft.label}</span>
                {selectedDraft === draft.type && (
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log('Make bolder')
                      }}
                      className="p-1 text-xs text-orange-600 hover:text-orange-700 transition"
                      title="Make bolder"
                    >
                      🔥
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log('Improve clarity')
                      }}
                      className="p-1 text-xs text-blue-600 hover:text-blue-700 transition"
                      title="Improve clarity"
                    >
                      ✨
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log('Expand content')
                      }}
                      className="p-1 text-xs text-green-600 hover:text-green-700 transition"
                      title="Expand content"
                    >
                      📝
                    </button>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Selected Draft */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{currentDraft?.label} Style</h3>
                <p className="text-sm text-gray-600">{currentDraft?.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingDraft(editingDraft === selectedDraft ? null : selectedDraft)}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center space-x-1"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{editingDraft === selectedDraft ? 'View' : 'Edit'}</span>
                </button>
               <button 
  onClick={async () => {
    try {
      const currentDraft = drafts.find(d => d.type === selectedDraft)
      const saved = await saveDraft({
        content_text: currentDraft?.content || '',
        content_type: contentType as 'framework' | 'story' | 'trend' | 'mistake' | 'metrics',
        tone_used: tone,
        prompt_input: topic,
        is_saved: true,
        title: `Standard Mode - ${topic}`,
        status: 'draft',
        ideation_session_id: ideationData?.session_id,
        source_page: ideationData?.source_page
      }, 'standard')
      
      if (saved) {
        showToast('success', 'Content saved to Production Pipeline!')
      }
    } catch (error) {
      showToast('error', 'Failed to save draft')
    }
  }}
  className="px-3 py-2 text-sm bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
>
  💾 Save Draft
</button>
              </div>
            </div>

            {editingDraft === selectedDraft ? (
              <RichTextEditor
                content={currentDraft?.content || ''}
                onChange={() => {}}
                placeholder="Edit your content..."
                onAIImprove={async (text, type) => {
                  await new Promise(resolve => setTimeout(resolve, 1000))
                  return text + ' [Enhanced]'
                }}
              />
            ) : (
              <div className="prose max-w-none">
                <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {currentDraft?.content}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview Toggle */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">LinkedIn Preview</h3>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-slate-600 hover:text-slate-700 flex items-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>{showPreview ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            
            {showPreview && (
              <div className="scale-75 origin-top">
                <LinkedInPreview 
                  content={currentDraft?.content || ''}
                  profileName="Finance Professional"
                  profileTitle="Chief Financial Officer"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button 
  onClick={async () => {
    try {
      const currentDraft = drafts.find(d => d.type === selectedDraft)
      const saved = await saveDraft({
        content_text: currentDraft?.content || '',
        content_type: contentType as 'framework' | 'story' | 'trend' | 'mistake' | 'metrics',
        tone_used: tone,
        prompt_input: topic,
        is_saved: true,
        title: `Standard Mode - ${topic}`,
        ideation_session_id: ideationData?.session_id,
        source_page: ideationData?.source_page
      }, 'standard')
      
      if (saved) {
        showToast('success', 'Content saved to Production Pipeline!')
        setSelectedContent(saved)
        setShowScheduleModal(true)
      }
    } catch (error) {
      showToast('error', 'Failed to save content')
    }
  }}
  className="w-full bg-slate-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-slate-700 transition"
>
  Schedule Post
</button>
              <button 
  onClick={async () => {
    try {
      const currentDraft = drafts.find(d => d.type === selectedDraft)
      const saved = await saveDraft({
        content_text: currentDraft?.content || '',
        content_type: contentType as 'framework' | 'story' | 'trend' | 'mistake' | 'metrics',
        tone_used: tone,
        prompt_input: topic,
        is_saved: true,
        title: `Standard Mode - ${topic}`,
        status: 'draft',
        ideation_session_id: ideationData?.session_id,
        source_page: ideationData?.source_page
      }, 'standard')
      
      if (saved) {
        showToast('success', 'Content saved to Production Pipeline!')
      }
    } catch (error) {
      showToast('error', 'Failed to save draft')
    }
  }}
  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition"
>
  Save as Draft
</button>
              <button 
                onClick={() => onSwitchMode('power')}
                className="w-full text-purple-600 py-2 px-4 rounded-lg font-medium hover:bg-purple-50 transition flex items-center justify-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Open in Writer Suite</span>
              </button>
            </div>
          </div>

          {/* Mode Switch */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Switch Modes</h3>
            
            <div className="space-y-2">
              <button
                onClick={() => onSwitchMode('express')}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition"
              >
                <div className="font-medium text-blue-600">Express Mode</div>
                <div className="text-sm text-gray-600">Faster, simpler creation</div>
              </button>
              <button
                onClick={() => onSwitchMode('power')}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition"
              >
                <div className="font-medium text-purple-600">Writer Suite</div>
                <div className="text-sm text-gray-600">Advanced 5-step process</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
