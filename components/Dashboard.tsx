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
  ContentIdea,
  createContentIdea // Import new function
} from '../lib/supabase'
import {
  LogOut, Settings, BarChart3, Zap, User, Lightbulb, Calendar, BarChart, Rss, Sparkles, Target, TrendingUp,
  Copy, Save, Edit, XCircle, ChevronDown, Plus, Filter, Clock, Tag, Search
} from 'lucide-react'
import IdeasPage from './IdeasPage'
import LinkedInPostPreview from './LinkedInPostPreview' // Import the new component

type ToneType = 'insightful_cfo' | 'bold_operator' | 'strategic_advisor' | 'data_driven_expert'
type ContentType = 'framework' | 'story' | 'trend' | 'mistake' | 'metrics'
type ActivePage = 'generator' | 'ideas' | 'production' | 'plan' | 'analytics' | 'feed'
type DraftType = 'bold' | 'insightful' | 'wildcard' | 'standard' // Added 'standard' for initial content

interface GeneratedDraft {
  type: DraftType
  content: string // This will be the HTML content from the rich text editor
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
  const [selectedDraftType, setSelectedDraftType] = useState<DraftType>('standard') // Default to 'standard'
  const [selectedDraftContent, setSelectedDraftContent] = useState<string>('') // Content of the currently selected draft
  const [selectedDraftTitle, setSelectedDraftTitle] = useState<string>('') // Title of the currently selected draft
  const [topicInput, setTopicInput] = useState('')
  const [numPoints, setNumPoints] = useState(3)
  const [tone, setTone] = useState<ToneType>('insightful_cfo')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null) // Ref for profile menu for click outside detection

  // State for content ideas
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([])
  const [ideasLoading, setIdeasLoading] = useState(false)
  const [ideaFilter, setIdeaFilter] = useState<string>('all')
  const [ideaCategoryFilter, setIdeaCategoryFilter] = useState<string>('all')
  const [ideaSearchTerm, setIdeaSearchTerm] = useState<string>('')

  // State for content calendar
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]) // Use 'any' for now, will define type later
  const [calendarLoading, setCalendarLoading] = useState(false)

  // Dummy data for content types and tones
  const contentTypes = [
    { id: 'framework', name: 'Framework Post', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'story', name: 'Story Post', icon: <Users className="w-5 h-5" /> },
    { id: 'trend', name: 'Trend Take', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'mistake', name: 'Mistake Story', icon: <XCircle className="w-5 h-5" /> },
    { id: 'metrics', name: 'Metrics Post', icon: <BarChart className="w-5 h-5" /> },
  ]

  const tones = [
    { value: 'insightful_cfo', label: 'Insightful CFO' },
    { value: 'bold_operator', label: 'Bold Operator' },
    { value: 'strategic_advisor', label: 'Strategic Advisor' },
    { value: 'data_driven_expert', label: 'Data-Driven Expert' },
  ]

  // Mock AI generation function (will be replaced by actual API call)
  const generateContent = async () => {
    setIsGenerating(true)
    setGeneratedDrafts([])
    setSelectedDraftContent('')
    setSelectedDraftTitle('')

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock generated content (HTML for rich text editor)
    const mockContentHTML = {
      framework: `
        <p><strong>The 3-Step Framework for Financial Agility in 2025:</strong></p>
        <ol>
          <li><strong>Automate Routine Tasks:</strong> Leverage AI and RPA for data entry, reconciliation, and reporting. This frees up your team for strategic analysis.</li>
          <li><strong>Dynamic Scenario Planning:</strong> Move beyond static budgets. Implement real-time forecasting models that adapt to market shifts, allowing for proactive decision-making.</li>
          <li><strong>Upskill Your Finance Team:</strong> Invest in data science, AI literacy, and strategic communication training. The modern CFO leads with insights, not just numbers.</li>
        </ol>
        <p><em>#FinancialStrategy #CFO #AIinFinance #FutureofFinance</em></p>
      `,
      story: `
        <p><strong>The Day We Almost Missed a $10M Opportunity...</strong></p>
        <p>It was Q3, and our projections looked solid. But a sudden shift in commodity prices threatened to erode our margins. My team was buried in manual spreadsheets, unable to react fast enough.</p>
        <p>That's when we implemented a real-time analytics dashboard. Within hours, we identified the exposure, re-negotiated supplier terms, and not only mitigated the risk but found an unexpected arbitrage opportunity.</p>
        <p>Lesson learned: Speed of insight is the new currency. Don't let outdated tools cost you millions.</p>
        <p><em>#FinanceLeadership #BusinessStory #RealTimeAnalytics #DecisionMaking</em></p>
      `,
      trend: `
        <p><strong>The Rise of Embedded Finance: What CFOs Need to Know.</strong></p>
        <p>Embedded finance isn't just a buzzword; it's a fundamental shift. Companies are integrating financial services directly into non-financial products, creating seamless customer experiences.</p>
        <p>For CFOs, this means new revenue streams, deeper customer insights, and a re-evaluation of traditional business models. Are you prepared to partner with fintechs and unbundle your financial stack?</p>
        <p>The future of finance is invisible, integrated, and everywhere.</p>
        <p><em>#EmbeddedFinance #Fintech #CFOInsights #FutureofBanking</em></p>
      `,
      mistake: `
        <p><strong>My Biggest Financial Mistake: Ignoring the "Soft" Skills.</strong></p>
        <p>Early in my career, I believed finance was purely about numbers. I focused relentlessly on models, forecasts, and technical accuracy. And while those are critical, I overlooked something vital: communication.</p>
        <p>I presented a complex financial strategy, technically perfect, but failed to articulate its "why" to the leadership team. Result? Confusion, delays, and a missed opportunity.</p>
        <p>Now I know: the best financial minds don't just crunch numbers; they tell compelling stories with them.</p>
        <p><em>#FinanceCareer #LeadershipLessons #CommunicationSkills #CFOJourney</em></p>
      `,
      metrics: `
        <p><strong>SaaS Metrics Deep Dive: Understanding Customer Lifetime Value (CLTV).</strong></p>
        <p>CLTV is more than a vanity metric; it's the bedrock of sustainable SaaS growth. Here's how to truly leverage it:</p>
        <ol>
          <li><strong>Accurate Calculation:</strong> (Average Revenue Per User * Gross Margin) / Churn Rate. Don't cut corners here.</li>
          <li><strong>Segmentation is Key:</strong> Analyze CLTV by customer segment, acquisition channel, and product tier.</li>
          <li><strong>Actionable Insights:</strong> Use CLTV to optimize marketing spend, inform product development, and prioritize customer success efforts.</li>
        </ol>
        <p>A high CLTV means your growth engine is firing on all cylinders.</p>
        <p><em>#SaaSMetrics #CLTV #FinanceAnalytics #GrowthStrategy</em></p>
      `,
    }

    const generatedTitle = `AI-Generated Post: ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`

    setGeneratedDrafts([
      {
        type: 'standard',
        content: mockContentHTML[activeTab as ContentType] || '<p>No content generated for this type yet.</p>',
        label: 'Standard Draft',
        description: 'A balanced and professional draft.',
        icon: <Zap className="w-4 h-4" />,
      },
      {
        type: 'bold',
        content: `<p><strong>BOLD TAKE:</strong> ${mockContentHTML[activeTab as ContentType] || '<p>No content generated for this type yet.</p>'} </p>`,
        label: 'Bold Draft',
        description: 'A more assertive and direct version.',
        icon: <Zap className="w-4 h-4" />,
      },
      {
        type: 'insightful',
        content: `<p><strong>DEEP INSIGHT:</strong> ${mockContentHTML[activeTab as ContentType] || '<p>No content generated for this type yet.</p>'} </p>`,
        label: 'Insightful Draft',
        description: 'A detailed and analytical perspective.',
        icon: <Zap className="w-4 h-4" />,
      },
    ])

    // Automatically select the first draft and set its content
    setSelectedDraftType('standard')
    setSelectedDraftContent(mockContentHTML[activeTab as ContentType] || '<p>No content generated for this type yet.</p>')
    setSelectedDraftTitle(generatedTitle)

    setIsGenerating(false)
  }

  // Handle saving content
  const handleSaveContent = async () => {
    if (!user || !selectedDraftContent) return

    setIsGenerating(true) // Use generating state for saving too for now
    try {
      const newContent: Omit<GeneratedContent, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id,
        title: selectedDraftTitle,
        content_text: selectedDraftContent,
        content_type: activeTab,
        tone_used: tone,
        prompt_input: topicInput,
        is_saved: true,
        status: 'draft', // Set initial status
      }
      await saveGeneratedContent(newContent)
      // Optionally, refresh saved content list or show success message
      console.log('Content saved successfully!')
    } catch (error) {
      console.error('Failed to save content:', error)
      // Show error message to user
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle copying content to clipboard
  const handleCopyContent = () => {
    // Use a temporary textarea to copy HTML content
    const tempTextArea = document.createElement('textarea');
    tempTextArea.innerHTML = selectedDraftContent; // Set innerHTML to get rich text
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand('copy'); // Deprecated but widely supported for iframes
    document.body.removeChild(tempTextArea);
    // You might want to add a small visual feedback here (e.g., "Copied!")
    console.log('Content copied to clipboard!');
  };

  // Handle clicking outside the profile menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuRef]);


  // Placeholder for a custom modal for confirmations/alerts
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalAction, setModalAction] = useState<(() => void) | null>(null);

  const showCustomModal = (message: string, action: (() => void) | null = null) => {
    setModalMessage(message);
    setModalAction(() => action); // Use a function to set the state
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
    setModalAction(null);
  };

  const handleModalConfirm = () => {
    if (modalAction) {
      modalAction();
    }
    closeModal();
  };


  const renderPageContent = () => {
    switch (activePage) {
      case 'generator':
        return (
          <div className="flex flex-col lg:flex-row gap-6 p-6">
            {/* Left Pane: Content Generation Form & Editor */}
            <div className="lg:w-1/2 bg-white rounded-xl shadow-lg p-6 flex flex-col">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">AI Content Generator</h2>

              {/* Content Type Selector */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2">Content Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {contentTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setActiveTab(type.id as ContentType)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200
                                  ${activeTab === type.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-indigo-300 hover:bg-indigo-100'
                        }`}
                    >
                      {type.icon}
                      <span className="text-xs font-medium mt-1 text-center">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Fields */}
              <div className="mb-6">
                <label htmlFor="topic" className="block text-gray-700 text-sm font-semibold mb-2">Topic / Keyword</label>
                <input
                  type="text"
                  id="topic"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="e.g., 'Impact of AI on finance operations'"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="numPoints" className="block text-gray-700 text-sm font-semibold mb-2">Number of Points (for Frameworks)</label>
                <input
                  type="number"
                  id="numPoints"
                  value={numPoints}
                  onChange={(e) => setNumPoints(parseInt(e.target.value))}
                  min="1"
                  max="5"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="tone" className="block text-gray-700 text-sm font-semibold mb-2">Tone</label>
                <select
                  id="tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value as ToneType)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition bg-white"
                >
                  {tones.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateContent}
                disabled={isGenerating || !topicInput}
                className="gradient-bg text-white px-6 py-3 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Generate Content
                  </>
                )}
              </button>

              {/* Generated Drafts & Editor */}
              {generatedDrafts.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Generated Drafts</h3>
                  {/* Draft Selection Tabs */}
                  <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                    {generatedDrafts.map((draft) => (
                      <button
                        key={draft.type}
                        onClick={() => {
                          setSelectedDraftType(draft.type);
                          setSelectedDraftContent(draft.content);
                        }}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                                    ${selectedDraftType === draft.type
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {draft.label}
                      </button>
                    ))}
                  </div>

                  {/* Rich Text Editor Placeholder */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[200px] mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">{selectedDraftTitle}</h4>
                    {/* This textarea is a placeholder for a rich text editor */}
                    <textarea
                      className="w-full h-48 bg-transparent text-gray-800 focus:outline-none resize-none"
                      value={selectedDraftContent.replace(/<[^>]*>/g, '')} // Remove HTML tags for simple textarea display
                      onChange={(e) => setSelectedDraftContent(e.target.value)}
                      placeholder="Your generated content will appear here..."
                    ></textarea>
                    <p className="text-right text-xs text-gray-500 mt-2">
                      {selectedDraftContent.replace(/<[^>]*>/g, '').length} characters
                    </p>
                  </div>

                  {/* Action Buttons for Draft */}
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={handleSaveContent}
                      className="flex items-center bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                      disabled={isGenerating}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </button>
                    <button
                      onClick={handleCopyContent}
                      className="flex items-center bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                      disabled={isGenerating}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </button>
                    {/* Add an Edit button if a full rich text editor is integrated */}
                    {/* <button className="flex items-center bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button> */}
                  </div>
                </div>
              )}
            </div>

            {/* Right Pane: LinkedIn Post Preview */}
            <div className="lg:w-1/2 flex flex-col items-center justify-center p-4 lg:p-0">
              <h3 className="text-xl font-bold text-gray-800 mb-6">LinkedIn Post Preview</h3>
              {selectedDraftContent ? (
                <LinkedInPostPreview
                  content={selectedDraftContent}
                  title={selectedDraftTitle}
                  authorName={user?.email?.split('@')[0] || 'CyberMinds User'}
                  authorTitle={profile?.role || 'Finance Professional'}
                  // You can add a dynamic profile picture URL here if available in user profile
                  // profilePicUrl={profile?.profile_pic_url}
                />
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500 border border-gray-200 w-full max-w-xl mx-auto">
                  <Rss className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Generate content to see a live LinkedIn preview here!</p>
                </div>
              )}

              {/* Action Buttons for Posting/Scheduling */}
              {selectedDraftContent && (
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => showCustomModal('Are you sure you want to schedule this post?', () => console.log('Post Scheduled!'))}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-300 flex items-center"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Schedule Post
                  </button>
                  <button
                    onClick={() => showCustomModal('Are you sure you want to post this now?', () => console.log('Post Now!'))}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-300 flex items-center"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Post Now
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      case 'ideas':
        return <IdeasPage onWritePost={(idea) => {
          // This function needs to be updated to handle setting the idea content
          // into the main generator's selectedDraftContent and selectedDraftTitle
          setActivePage('generator'); // Switch to generator page
          // For now, we'll just set the title and a placeholder content
          setSelectedDraftTitle(idea.title);
          setSelectedDraftContent(`<p>This is a draft for the idea: <strong>${idea.title}</strong></p><p>${idea.description || ''}</p><p><em>(Content will be generated by AI)</em></p>`);
          setGeneratedDrafts([]); // Clear previous drafts
        }} />
      case 'production':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Content Production</h2>
            <p className="text-gray-600">Overview of your content workflow (drafts, pending review, scheduled).</p>
            {/* Implement production sections here */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Example Card for Action Required */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-3">Action Required</h3>
                <p className="text-gray-600 text-sm mb-4">Review and finalize posts.</p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
                  <p className="font-semibold mb-2">"The Future of Finance AI"</p>
                  <p>Needs your review.</p>
                  <button className="mt-3 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-md hover:bg-yellow-500 transition">Review Now</button>
                </div>
                {/* More action required items */}
              </div>

              {/* Example Card for AI in Progress */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-3">AI in Progress</h3>
                <p className="text-gray-600 text-sm mb-4">Content currently being generated.</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm">
                  <p className="font-semibold mb-2">"Blockchain in Supply Chain"</p>
                  <p className="flex items-center">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-blue-700 rounded-full animate-spin mr-2"></div>
                    Generating draft...
                  </p>
                </div>
              </div>

              {/* Example Card for Ready & Scheduled */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-3">Ready & Scheduled</h3>
                <p className="text-gray-600 text-sm mb-4">Posts ready for publishing.</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
                  <p className="font-semibold mb-2">"Q3 Financial Report Insights"</p>
                  <p>Scheduled for Jul 25, 2025.</p>
                  <button className="mt-3 bg-green-400 text-green-900 px-4 py-2 rounded-md hover:bg-green-500 transition">View Schedule</button>
                </div>
              </div>
            </div>
          </div>
        )
      case 'plan':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Content Calendar</h2>
            <p className="text-gray-600">Plan your LinkedIn posts for the week.</p>
            {/* Placeholder for calendar component */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6 min-h-[400px] flex items-center justify-center text-gray-500">
              <Calendar className="w-16 h-16 mr-4 text-gray-300" />
              <p className="text-lg">Calendar view coming soon!</p>
            </div>
          </div>
        )
      case 'analytics':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics</h2>
            <p className="text-gray-600">Track your post performance and insights.</p>
            {/* Placeholder for analytics content */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6 min-h-[400px] flex flex-col items-center justify-center text-gray-500">
              <BarChart className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg mb-4">Connect your LinkedIn to see performance data!</p>
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                Connect LinkedIn
              </button>
            </div>
          </div>
        )
      case 'feed':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Curated Feed</h2>
            <p className="text-gray-600">Discover viral posts and industry trends.</p>
            {/* Placeholder for feed content */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6 min-h-[400px] flex flex-col items-center justify-center text-gray-500">
              <Rss className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg mb-4">Your personalized feed and viral posts will appear here!</p>
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                Explore Feeds
              </button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  if (!user || !profile) {
    // This case should ideally be handled by page.tsx's loading/login logic
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Custom Modal Component */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirmation</h3>
            <p className="text-gray-700 mb-6">{modalMessage}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleModalConfirm}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white shadow-sm py-4 px-6 flex items-center justify-between z-10">
        <div className="flex items-center">
          <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-xl">CM</span>
          </div>
          <span className="text-xl font-bold text-gray-800">CyberMinds</span>
        </div>

        {/* Main Navigation Links */}
        <div className="hidden md:flex space-x-6">
          <button
            onClick={() => setActivePage('generator')}
            className={`text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200
                        ${activePage === 'generator' ? 'text-indigo-600 border-b-2 border-indigo-600' : ''}`}
          >
            Generator
          </button>
          <button
            onClick={() => setActivePage('ideas')}
            className={`text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200
                        ${activePage === 'ideas' ? 'text-indigo-600 border-b-2 border-indigo-600' : ''}`}
          >
            Ideas
          </button>
          <button
            onClick={() => setActivePage('production')}
            className={`text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200
                        ${activePage === 'production' ? 'text-indigo-600 border-b-2 border-indigo-600' : ''}`}
          >
            Production
          </button>
          <button
            onClick={() => setActivePage('plan')}
            className={`text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200
                        ${activePage === 'plan' ? 'text-indigo-600 border-b-2 border-indigo-600' : ''}`}
          >
            Plan
          </button>
          <button
            onClick={() => setActivePage('analytics')}
            className={`text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200
                        ${activePage === 'analytics' ? 'text-indigo-600 border-b-2 border-indigo-600' : ''}`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActivePage('feed')}
            className={`text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200
                        ${activePage === 'feed' ? 'text-indigo-600 border-b-2 border-indigo-600' : ''}`}
          >
            Feed
          </button>
        </div>

        {/* Right Section: User Profile & Notifications */}
        <div className="flex items-center space-x-4">
          <button className="text-gray-600 hover:text-indigo-600">
            <Bell className="w-6 h-6" /> {/* Placeholder for Bell icon */}
          </button>

          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 bg-gray-100 rounded-full py-1 px-3 hover:bg-gray-200 transition"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.email?.split('@')[0] || 'User'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
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
      </nav>

      {/* Page Content */}
      {renderPageContent()}
    </div>
  )
}
