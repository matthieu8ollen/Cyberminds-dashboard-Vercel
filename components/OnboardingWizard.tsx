'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { updateUserProfile } from '../lib/supabase'
import { CheckCircle, Circle, ArrowRight, ArrowLeft, Zap, Target, TrendingUp, Users, Building, BarChart3 } from 'lucide-react'

interface OnboardingData {
  role: string
  contentGoals: string[]
  contentChallenges: string[]
  contentPillars: string[]
  customPillars: string[]
  targetAudience: string
  postingFrequency: string
  currentExperience: string
}

const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome to Writer Suite', duration: '30 sec' },
  { id: 'role', title: 'Define your role', duration: '1 min' },
  { id: 'goals', title: 'Set your goals', duration: '1 min' },
  { id: 'challenges', title: 'Identify challenges', duration: '1 min' },
  { id: 'pillars', title: 'Choose content pillars', duration: '2 min' },
  { id: 'audience', title: 'Define your audience', duration: '1 min' },
  { id: 'analysis', title: 'AI Profile Analysis', duration: '30 sec' },
  { id: 'complete', title: 'Setup complete!', duration: '30 sec' }
]

const ROLES = [
  { value: 'cfo', label: 'Chief Financial Officer (CFO)', icon: '👑' },
  { value: 'finance_director', label: 'Finance Director', icon: '📊' },
  { value: 'controller', label: 'Controller', icon: '🧮' },
  { value: 'fractional_cfo', label: 'Fractional CFO', icon: '⚡' },
  { value: 'fp_a_manager', label: 'FP&A Manager', icon: '📈' },
  { value: 'finance_consultant', label: 'Finance Consultant', icon: '💼' },
  { value: 'startup_founder', label: 'Startup Founder', icon: '🚀' },
  { value: 'other', label: 'Other Finance Role', icon: '💡' }
]

const CONTENT_GOALS = [
  { value: 'thought_leadership', label: 'Build thought leadership', icon: <TrendingUp className="w-5 h-5" /> },
  { value: 'network_growth', label: 'Grow professional network', icon: <Users className="w-5 h-5" /> },
  { value: 'client_acquisition', label: 'Attract new clients', icon: <Target className="w-5 h-5" /> },
  { value: 'brand_awareness', label: 'Increase brand awareness', icon: <Building className="w-5 h-5" /> },
  { value: 'industry_insights', label: 'Share industry insights', icon: <BarChart3 className="w-5 h-5" /> },
  { value: 'career_growth', label: 'Advance career opportunities', icon: <ArrowRight className="w-5 h-5" /> }
]

const CONTENT_CHALLENGES = [
  { value: 'lack_of_time', label: 'Lack of time to create content' },
  { value: 'writers_block', label: "Writer's block / lack of ideas" },
  { value: 'consistency', label: 'Maintaining consistent posting' },
  { value: 'engagement', label: 'Low engagement on posts' },
  { value: 'tone_voice', label: 'Finding the right tone/voice' },
  { value: 'technical_topics', label: 'Explaining complex financial concepts' }
]

const CONTENT_PILLARS = [
  { value: 'industry_trends', label: 'Industry Trends & Analysis', description: 'Latest finance industry developments' },
  { value: 'case_studies', label: 'Case Studies & Best Practices', description: 'Real-world finance examples' },
  { value: 'saas_metrics', label: 'SaaS Metrics & KPIs', description: 'Financial metrics for SaaS companies' },
  { value: 'leadership', label: 'Finance Leadership', description: 'Leadership insights for finance professionals' },
  { value: 'career_advice', label: 'Career Development', description: 'Professional growth in finance' },
  { value: 'market_insights', label: 'Market Analysis', description: 'Economic and market commentary' },
  { value: 'tools_tech', label: 'Finance Tools & Technology', description: 'Software and tools for finance teams' },
  { value: 'personal_stories', label: 'Personal Stories & Lessons', description: 'Personal experiences and learnings' }
]

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const { user, profile, refreshProfile } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    role: '',
    contentGoals: [],
    contentChallenges: [],
    contentPillars: [],
    customPillars: [],
    targetAudience: '',
    postingFrequency: '',
    currentExperience: ''
  })

  const currentStepData = ONBOARDING_STEPS[currentStep]
  const totalSteps = ONBOARDING_STEPS.length

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleArraySelection = (field: keyof OnboardingData, value: string) => {
    setData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value)
        ? (prev[field] as string[]).filter(item => item !== value)
        : [...(prev[field] as string[]), value]
    }))
  }

  const handleComplete = async () => {
    if (!user) return

    setIsLoading(true)
    
    try {
      // Update user profile with onboarding data
      await updateUserProfile(user.id, {
        role: data.role,
        content_goals: data.contentGoals,
        content_challenges: data.contentChallenges,
        content_pillars: data.contentPillars.concat(data.customPillars),
        target_audience: data.targetAudience,
        posting_frequency: data.postingFrequency,
        current_experience: data.currentExperience,
        onboarding_completed: true,
        ai_persona_data: {
          analyzed_at: new Date().toISOString(),
          insights: {
            primary_role: data.role,
            content_focus: data.contentPillars,
            target_audience: data.targetAudience,
            experience_level: data.currentExperience
          }
        }
      })
      
      await refreshProfile()
      onComplete()
    } catch (error) {
      console.error('Error completing onboarding:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderProgressTracker = () => (
    <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Let's get you set up</h3>
      <div className="space-y-3">
        {ONBOARDING_STEPS.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          
          return (
            <div key={step.id} className="flex items-center gap-3">
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className={`w-5 h-5 flex-shrink-0 ${isCurrent ? 'text-teal-600' : 'text-gray-300'}`} />
              )}
              <div className="flex-1">
                <div className={`text-sm font-medium ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500">{step.duration}</div>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Progress</span>
          <span>{Math.round((currentStep / (totalSteps - 1)) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-slate-600 to-teal-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )

  const renderWelcomeStep = () => (
    <div className="text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <span className="text-white font-bold text-2xl">WS</span>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Writer Suite</h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl">
        We'll help you create authentic LinkedIn content that builds your authority as a finance professional. 
        Let's personalize your AI assistant in just a few steps.
      </p>
      <div className="bg-teal-50 rounded-lg p-4 max-w-md mx-auto">
        <p className="text-sm text-teal-700">
          💡 <strong>Tip:</strong> The more information you provide, the better your AI will understand your unique voice and expertise.
        </p>
      </div>
    </div>
  )

  const renderRoleStep = () => (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">What best describes your role?</h2>
      <p className="text-gray-600 mb-8">This helps us understand your perspective and expertise level.</p>
      
      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        {ROLES.map((role) => (
          <button
            key={role.value}
            onClick={() => setData(prev => ({ ...prev, role: role.value }))}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              data.role === role.value
                ? 'border-teal-500 bg-teal-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{role.icon}</span>
              <span className="font-medium text-gray-900">{role.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  const renderGoalsStep = () => (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">What are your main LinkedIn goals?</h2>
      <p className="text-gray-600 mb-8">Select all that apply. We'll tailor your content strategy accordingly.</p>
      
      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        {CONTENT_GOALS.map((goal) => (
          <button
            key={goal.value}
            onClick={() => handleArraySelection('contentGoals', goal.value)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              data.contentGoals.includes(goal.value)
                ? 'border-teal-500 bg-teal-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-teal-600">{goal.icon}</div>
              <span className="font-medium text-gray-900">{goal.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  const renderChallengesStep = () => (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">What challenges do you face with content creation?</h2>
      <p className="text-gray-600 mb-8">Understanding your pain points helps us provide better solutions.</p>
      
      <div className="space-y-3 max-w-2xl">
        {CONTENT_CHALLENGES.map((challenge) => (
          <button
            key={challenge.value}
            onClick={() => handleArraySelection('contentChallenges', challenge.value)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              data.contentChallenges.includes(challenge.value)
                ? 'border-teal-500 bg-teal-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                data.contentChallenges.includes(challenge.value)
                  ? 'border-teal-500 bg-teal-500'
                  : 'border-gray-300'
              }`}>
                {data.contentChallenges.includes(challenge.value) && (
                  <CheckCircle className="w-3 h-3 text-white" />
                )}
              </div>
              <span className="font-medium text-gray-900">{challenge.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  const renderPillarsStep = () => (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose your content pillars</h2>
      <p className="text-gray-600 mb-8">Select the topics you want to create content about. You can always adjust these later.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
        {CONTENT_PILLARS.map((pillar) => (
          <button
            key={pillar.value}
            onClick={() => handleArraySelection('contentPillars', pillar.value)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              data.contentPillars.includes(pillar.value)
                ? 'border-teal-500 bg-teal-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                data.contentPillars.includes(pillar.value)
                  ? 'border-teal-500 bg-teal-500'
                  : 'border-gray-300'
              }`}>
                {data.contentPillars.includes(pillar.value) && (
                  <CheckCircle className="w-3 h-3 text-white" />
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900 mb-1">{pillar.label}</div>
                <div className="text-sm text-gray-600">{pillar.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-6 max-w-2xl">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add custom content pillars (optional)
        </label>
        <input
          type="text"
          placeholder="e.g., Startup Finance, International Taxation"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const value = (e.target as HTMLInputElement).value.trim()
              if (value && !data.customPillars.includes(value)) {
                setData(prev => ({
                  ...prev,
                  customPillars: [...prev.customPillars, value]
                }));
                (e.target as HTMLInputElement).value = ''
              }
            }
          }}
        />
        {data.customPillars.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {data.customPillars.map((pillar, index) => (
              <span
                key={index}
                className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {pillar}
                <button
                  onClick={() => setData(prev => ({
                    ...prev,
                    customPillars: prev.customPillars.filter((_, i) => i !== index)
                  }))}
                  className="text-teal-600 hover:text-teal-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderAudienceStep = () => (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Tell us about your target audience</h2>
      <p className="text-gray-600 mb-8">Understanding your audience helps create more relevant content.</p>
      
      <div className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Who is your primary audience?
          </label>
          <select
            value={data.targetAudience}
            onChange={(e) => setData(prev => ({ ...prev, targetAudience: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How often do you want to post?
          </label>
          <select
            value={data.postingFrequency}
            onChange={(e) => setData(prev => ({ ...prev, postingFrequency: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Select frequency</option>
            <option value="daily">Daily (7 posts/week)</option>
            <option value="weekdays">Weekdays only (5 posts/week)</option>
            <option value="3x_week">3 times per week</option>
            <option value="2x_week">2 times per week</option>
            <option value="weekly">Weekly (1 post/week)</option>
            <option value="flexible">Flexible - as needed</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How would you describe your LinkedIn content experience?
          </label>
          <select
            value={data.currentExperience}
            onChange={(e) => setData(prev => ({ ...prev, currentExperience: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Select experience level</option>
            <option value="beginner">Beginner - New to LinkedIn content</option>
            <option value="occasional">Occasional - Post sometimes but inconsistently</option>
            <option value="regular">Regular - Post regularly but want to improve</option>
            <option value="experienced">Experienced - Looking to optimize and scale</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderAnalysisStep = () => (
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Zap className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Analyzing your profile...</h2>
      <p className="text-gray-600 mb-8 max-w-lg mx-auto">
        Our AI is building your personalized content strategy based on your responses. 
        This will help create content that truly reflects your expertise.
      </p>
      
      <div className="bg-gradient-to-r from-slate-600 to-teal-600 rounded-full h-2 w-64 mx-auto mb-6 overflow-hidden">
        <div className="bg-white/30 h-full rounded-full animate-pulse"></div>
      </div>
      
      <div className="bg-teal-50 rounded-lg p-4 max-w-md mx-auto">
        <p className="text-sm text-teal-700">
          💡 <strong>Tip:</strong> Quality content focuses on solving your audience's biggest challenges. 
          Think about the questions you get asked most often.
        </p>
      </div>
    </div>
  )

  const renderCompleteStep = () => (
    <div className="text-center">
      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">You're all set!</h2>
      <p className="text-gray-600 mb-8 max-w-lg mx-auto">
        Your AI assistant is now personalized for your finance expertise and goals. 
        Ready to start creating authentic LinkedIn content?
      </p>
      
      <div className="bg-gradient-to-br from-teal-50 to-slate-50 rounded-xl p-6 max-w-md mx-auto mb-8">
        <h3 className="font-semibold text-gray-900 mb-3">Your Profile Summary:</h3>
        <div className="text-sm text-gray-600 space-y-2 text-left">
          <div><strong>Role:</strong> {ROLES.find(r => r.value === data.role)?.label}</div>
          <div><strong>Goals:</strong> {data.contentGoals.length} selected</div>
          <div><strong>Content Pillars:</strong> {data.contentPillars.length + data.customPillars.length} topics</div>
          <div><strong>Target Audience:</strong> {data.targetAudience.replace(/_/g, ' ')}</div>
        </div>
      </div>
    </div>
  )

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'welcome': return renderWelcomeStep()
      case 'role': return renderRoleStep()
      case 'goals': return renderGoalsStep()
      case 'challenges': return renderChallengesStep()
      case 'pillars': return renderPillarsStep()
      case 'audience': return renderAudienceStep()
      case 'analysis': return renderAnalysisStep()
      case 'complete': return renderCompleteStep()
      default: return null
    }
  }

  const canProceed = () => {
    switch (currentStepData.id) {
      case 'welcome': return true
      case 'role': return data.role !== ''
      case 'goals': return data.contentGoals.length > 0
      case 'challenges': return data.contentChallenges.length > 0
      case 'pillars': return data.contentPillars.length > 0
      case 'audience': return data.targetAudience !== '' && data.postingFrequency !== '' && data.currentExperience !== ''
      case 'analysis': return true
      case 'complete': return true
      default: return false
    }
  }

  // Auto-advance from analysis step
  useEffect(() => {
    if (currentStepData.id === 'analysis') {
      const timer = setTimeout(() => {
        handleNext()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [currentStep])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 max-w-4xl">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[600px]">
              {renderStepContent()}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                
                <div className="text-sm text-gray-500">
                  Step {currentStep + 1} of {totalSteps}
                </div>
                
                {currentStepData.id === 'complete' ? (
                  <button
                    onClick={handleComplete}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-slate-700 to-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Completing...
                      </>
                    ) : (
                      <>
                        Enter Dashboard
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={!canProceed() || currentStepData.id === 'analysis'}
                    className="flex items-center gap-2 bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Progress Tracker Sidebar */}
          {renderProgressTracker()}
        </div>
      </div>
    </div>
  )
}
