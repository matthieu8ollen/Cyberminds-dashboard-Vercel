'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Target, BarChart3, Sparkles, CheckCircle, Loader2, Star } from 'lucide-react'
import WritingInterface from './WritingInterface'
import { useContent } from '../../contexts/ContentContext'
import { useToast } from '../ToastNotifications'
import { GeneratedContent, getContentFormulas, type ContentFormula, type FormulaSection } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import LinkedInPreview from '../LinkedInPreview'
import { formatDatabaseTextArray, formatDatabaseText } from '../../lib/textUtils'

interface FormulaTemplate {
  id: string
  name: string
  description: string
  category: 'story' | 'data' | 'framework' | 'lead-magnet'
  structure: string[]
  example: string
  whyItWorks: string[]
  bestFor: string
  _aiData?: {
    confidence?: string
    whyPerfect?: string
    characteristics?: string[]
    formulaNumber?: string
    source?: string
  }
}

interface PathFormulaProps {
  onBack: () => void
  ideationData?: any
  aiFormulas?: any[]
  isLoadingAIFormulas?: boolean
  onExitWorkflow?: () => void
  onContinueToImages?: (contentId: string) => void
  onUserStartedWorking?: () => void
}

export default function PathFormula({ 
  onBack, 
  ideationData, 
  aiFormulas = [],
  isLoadingAIFormulas = false,
  onExitWorkflow, 
  onContinueToImages,
  onUserStartedWorking
}: PathFormulaProps) {
  const { user, profile } = useAuth()
  const [currentStep, setCurrentStep] = useState<'selection' | 'template' | 'writing' | 'preview'>('selection')
  const [selectedFormula, setSelectedFormula] = useState<FormulaTemplate | null>(null)
  const [generatedContent, setGeneratedContent] = useState('')
  const [editingContent, setEditingContent] = useState('')
  const { saveDraft, setSelectedContent, setShowScheduleModal } = useContent()
  const { showToast } = useToast()
  
  // Database state
  const [formulas, setFormulas] = useState<FormulaTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // AI enhancement system - enhance database formulas with AI recommendations
const [enhancedFormulas, setEnhancedFormulas] = useState<FormulaTemplate[]>([])

// Enhance database formulas with AI recommendations
const enhanceFormulasWithAI = (dbFormulas: FormulaTemplate[], aiRecommendations: any[]) => {
  if (!aiRecommendations || aiRecommendations.length === 0) {
    return dbFormulas
  }

  return dbFormulas.map(dbFormula => {
    // Find matching AI recommendation by formula_id
    const aiMatch = aiRecommendations.find(ai => ai.formula_id === dbFormula.id)
    
    if (aiMatch) {
      // Enhance with AI data
      return {
        ...dbFormula,
        _aiData: {
          confidence: aiMatch.match_score,
          whyPerfect: aiMatch.why_it_works,
          source: aiMatch.source,
          formulaNumber: aiMatch.sequence
        }
      }
    }
    
    return dbFormula
  })
}

  // Transform backend AI response to FormulaTemplate format
  const transformAIFormula = (backendFormula: any): FormulaTemplate => {
    return {
      id: backendFormula.formula_id || `ai-${backendFormula.sequence}`,
      name: backendFormula.name || 'AI Suggested Formula',
      description: backendFormula.why_it_works || 'Personalized formula for your content',
      category: mapBackendCategory(backendFormula.category),
      structure: ['AI-optimized structure'],
      example: `AI-suggested: ${backendFormula.name}`,
      whyItWorks: [backendFormula.why_it_works || 'AI-optimized for your content'],
      bestFor: backendFormula.why_it_works || 'Your specific content needs',
      // Store original backend data for enhanced display
      _aiData: {
        confidence: backendFormula.match_score,
        whyPerfect: backendFormula.why_it_works,
        characteristics: [], // No longer provided by backend
        formulaNumber: backendFormula.sequence,
        source: backendFormula.source
      }
    }
  }
  
  const mapBackendCategory = (backendCategory: string): 'story' | 'data' | 'framework' | 'lead-magnet' => {
    const categoryMap: Record<string, 'story' | 'data' | 'framework' | 'lead-magnet'> = {
      'personal_story': 'story',
      'data_driven': 'data', 
      'framework': 'framework',
      'lead_generation': 'lead-magnet',
      'contrarian_insight': 'data',
      'authority_building': 'framework'
    }
    return categoryMap[backendCategory?.toLowerCase()] || 'framework'
  }
  
  // Load real formulas from database
useEffect(() => {
  loadFormulas()
}, [user])

// Enhance formulas when AI data arrives
useEffect(() => {
  if (formulas.length > 0) {
    const enhanced = enhanceFormulasWithAI(formulas, aiFormulas)
    setEnhancedFormulas(enhanced)
  }
}, [formulas, aiFormulas])

  const loadFormulas = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await getContentFormulas(user?.id)
      
      if (error) {
        console.error('Error loading formulas:', error)
        setError('Failed to load formulas')
        return
      }

      if (data) {
        const convertedFormulas = data.map(convertDatabaseToFormula)
        setFormulas(convertedFormulas)
      }
    } catch (err) {
      console.error('Error loading formulas:', err)
      setError('Failed to load formulas')
    } finally {
      setLoading(false)
    }
  }

  // Convert database format to component format
  const convertDatabaseToFormula = (dbFormula: ContentFormula & { formula_sections: FormulaSection[] }): FormulaTemplate => {
    const sortedSections = dbFormula.formula_sections.sort((a, b) => a.section_order - b.section_order)
    
    return {
      id: dbFormula.id,
      name: formatDatabaseText(dbFormula.formula_name),
      description: formatDatabaseText(dbFormula.funnel_purpose || dbFormula.content_intent || ''),
      category: mapCategoryToDisplay(dbFormula.formula_category || ''),
      structure: sortedSections.map(section => 
        `${formatDatabaseText(section.section_name)} - ${formatDatabaseText(section.section_purpose)}`
      ),
      example: dbFormula.complete_template?.split('\n')[0] || `${formatDatabaseText(dbFormula.formula_name)} example...`,
      whyItWorks: formatDatabaseTextArray(dbFormula.psychological_triggers || [
        'Proven framework structure',
        'Optimized for engagement',
        'Based on successful patterns'
      ]),
      bestFor: formatDatabaseText(dbFormula.primary_target_role || 'Professional content creation')
    }
  }

  const mapCategoryToDisplay = (dbCategory: string): 'story' | 'data' | 'framework' | 'lead-magnet' => {
    switch (dbCategory) {
      case 'Authority_Framework':
        return 'framework'
      case 'Contrarian_Insight':
        return 'data'
      case 'Personal_Story_Lesson':
        return 'story'
      default:
        return 'framework'
    }
  }
  const handleWritingComplete = (content: string) => {
    setGeneratedContent(content)
    setCurrentStep('preview')
  }

  // Display pre-existing ideation data if available
const renderIdeationContext = () => {
  // Only show if we have meaningful ideation data
  if (!ideationData || !ideationData.topic || ideationData.topic.trim() === '') {
    return null
  }
  
  return (
    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="w-5 h-5 text-teal-600" />
        <h4 className="font-semibold text-teal-900">Your Ideation Data</h4>
      </div>
      <div className="space-y-2 text-sm">
        <div><strong>Topic:</strong> {ideationData.topic}</div>
        {ideationData.angle && <div><strong>Angle:</strong> {ideationData.angle}</div>}
        {ideationData.takeaways?.length > 0 && (
          <div>
            <strong>Key Takeaways:</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              {ideationData.takeaways.map((takeaway: string, index: number) => (
                <li key={index} className="text-teal-800">{takeaway}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="text-xs text-teal-600 mt-2">
          ✨ This data will be used to pre-populate your content structure
        </div>
      </div>
    </div>
  )
}

 const handleBackToWriting = () => {
  setEditingContent(generatedContent)
  setCurrentStep('writing')
}

  const handleFormulaSelect = (formula: FormulaTemplate) => {
    setSelectedFormula(formula)
    setCurrentStep('template')
  }

  const handleStartWriting = () => {
  // User has started working - enable navigation protection
  if (onUserStartedWorking) {
    onUserStartedWorking()
  }
  setCurrentStep('writing')
}

  const renderFormulaSelection = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Ideation Context */}
    {renderIdeationContext()}
    
    {/* Existing header content continues... */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Content Formula</h1>
          <p className="text-gray-600">Start with a proven template for maximum engagement</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marcus</span>
        </button>
      </div>

    {/* AI Processing Status */}
{isLoadingAIFormulas && (
  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
    <div className="flex items-center space-x-3">
      <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
      <div>
        <h4 className="font-medium text-purple-900">AI Analysis in Progress</h4>
        <p className="text-sm text-purple-700">Marcus is analyzing your ideation data to recommend the best formulas...</p>
      </div>
    </div>
  </div>
)}

     {/* Database Formulas with AI Enhancements */}
        {/* Loading State */}
        {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <span className="ml-3 text-gray-600">Loading formulas...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadFormulas}
            className="mt-2 text-sm text-red-700 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Database Formulas Grid */}
      {!loading && !error && (
        <div className="grid gap-6 md:grid-cols-2">
          {enhancedFormulas.map((formula) => (
          <div
            key={formula.id}
            className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-teal-500 hover:shadow-lg transition-all duration-200 cursor-pointer group"
            onClick={() => handleFormulaSelect(formula)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
                  formula.category === 'story' ? 'bg-purple-100 text-purple-600' :
                  formula.category === 'data' ? 'bg-blue-100 text-blue-600' :
                  formula.category === 'framework' ? 'bg-green-100 text-green-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {formula.category === 'story' ? <Target className="w-6 h-6" /> :
                   formula.category === 'data' ? <BarChart3 className="w-6 h-6" /> :
                   formula.category === 'framework' ? <BookOpen className="w-6 h-6" /> :
                   <Sparkles className="w-6 h-6" />}
                </div>
                <div>
  <div className="flex items-center space-x-2 mb-1">
    <h3 className="text-lg font-semibold text-gray-900">{formula.name}</h3>
    {formula._aiData && (
      <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-700 flex items-center space-x-1">
        <Sparkles className="w-3 h-3" />
        <span>AI RECOMMENDED</span>
      </span>
    )}
  </div>
  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    formula.category === 'story' ? 'bg-purple-100 text-purple-700' :
                    formula.category === 'data' ? 'bg-blue-100 text-blue-700' :
                    formula.category === 'framework' ? 'bg-green-100 text-green-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {formula.category.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
            </div>

            <p className="text-gray-600 mb-4">{formula.description}</p>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium text-gray-900">Structure:</p>
              <div className="text-sm text-gray-600">
                {formula.structure.slice(0, 3).map((step, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                    <span>{step}</span>
                  </div>
                ))}
                {formula.structure.length > 3 && (
                  <div className="text-xs text-gray-500 ml-3.5">
                    +{formula.structure.length - 3} more steps
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-700 font-medium">Best for: {formula.bestFor}</p>
            
            {/* AI Recommendation Explanation */}
            {formula._aiData && (
              <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start space-x-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-purple-900">Why Marcus recommends this:</h4>
                    <p className="text-sm text-purple-800 leading-relaxed">{formula._aiData.whyPerfect}</p>
                  </div>
                </div>
                {formula._aiData.confidence && (
                  <div className="flex items-center justify-between text-xs text-purple-700">
                    <span>Match Score: {formula._aiData.confidence}%</span>
                    {formula._aiData.source && <span>Source: {formula._aiData.source}</span>}
                  </div>
                )}
              </div>
            )}
          </div>
          ))}
        </div>
      )}
      
      {/* No formulas state */}
      {!loading && !error && formulas.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No formulas available</h3>
          <p className="text-gray-600">Check back later for new content formulas.</p>
        </div>
      )}
    </div>
  )

  const renderTemplatePreview = () => {
    if (!selectedFormula) return null

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedFormula.name}</h1>
            <p className="text-gray-600">{selectedFormula.description}</p>
          </div>
          <button
            onClick={() => setCurrentStep('selection')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Choose Different Formula</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Template Structure</h2>
          
          <div className="space-y-4 mb-8">
            {selectedFormula.structure.map((step, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{step.split(' - ')[0]}</p>
                  <p className="text-sm text-gray-600">{step.split(' - ')[1]}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">Example Opening:</h3>
            <p className="text-blue-800 italic">"{selectedFormula.example}"</p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Why This Template Works</h3>
            <div className="grid gap-4 lg:grid-cols-2">
              {selectedFormula.whyItWorks.map((reason, index) => (
                <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-green-900 font-medium leading-relaxed">
                        {formatDatabaseText(reason)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleStartWriting}
              className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition font-medium flex items-center space-x-2"
            >
              <span>Start Writing with This Template</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderWritingInterface = () => {
  if (!selectedFormula) return null
  
  return (
  <WritingInterface
    formula={selectedFormula}
    onBack={() => setCurrentStep('template')}
    onComplete={handleWritingComplete}
    ideationData={ideationData}
    initialContent={editingContent}
  />
)
}

const renderFinalPreview = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎉 Content Created!</h1>
        <p className="text-gray-600">Your content is ready to publish</p>
      </div>
      <button
        onClick={handleBackToWriting}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Edit</span>
      </button>
    </div>

    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">LinkedIn Preview</h3>
      <LinkedInPreview 
        content={generatedContent}
        profileName={user?.email?.split('@')[0].split('.').map(name => 
          name.charAt(0).toUpperCase() + name.slice(1)
        ).join(' ') || 'Finance Professional'}
        profileTitle={profile?.role ? 
          profile.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
          'Chief Financial Officer'
        }
      />
    </div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <button
    onClick={handleBackToWriting}
    className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
    <span>✏️ Edit Content</span>
  </button>
  
  <button
    onClick={async () => {
      try {
        const contentData: Omit<GeneratedContent, 'id' | 'created_at'> = {
          user_id: '',
          content_text: generatedContent,
          content_type: 'framework',
          tone_used: 'professional',
          prompt_input: selectedFormula?.name || 'Content Formula',
          is_saved: true,
          title: selectedFormula?.name,
          status: 'draft'
        }
        
        const saved = await saveDraft(contentData, 'marcus')
        
        if (saved) {
          // Mark idea as used if we have idea_id
          if (ideationData?.idea_id) {
            try {
              const { updateContentIdea } = await import('../../lib/supabase')
              await updateContentIdea(ideationData.idea_id, { status: 'used' })
              console.log('✅ Marked idea as used:', ideationData.idea_id)
            } catch (error) {
              console.error('❌ Failed to mark idea as used:', error)
            }
          }
          
          showToast('success', 'Content saved to Production Pipeline!')
          console.log('🚪 Calling onExitWorkflow callback')
          if (onExitWorkflow) {
            onExitWorkflow()
          }
        }
        
      } catch (error) {
        showToast('error', 'Failed to save content')
      }
    }}
    className="flex items-center justify-center space-x-2 px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
    </svg>
    <span>💾 Save & Exit Workflow</span>
  </button>
  
  <button
    onClick={async () => {
      try {
        const contentData: Omit<GeneratedContent, 'id' | 'created_at'> = {
          user_id: '',
          content_text: generatedContent,
          content_type: 'framework',
          tone_used: 'professional',
          prompt_input: selectedFormula?.name || 'Content Formula',
          is_saved: true,
          title: selectedFormula?.name,
          status: 'draft'
        }
        
        const saved = await saveDraft(contentData, 'marcus')
        
        if (saved) {
  showToast('success', 'Content saved! Adding image...')
  console.log('🖼️ Calling onContinueToImages callback with:', saved.id)
  if (onContinueToImages) {
    onContinueToImages(saved.id)
  }
}
      } catch (error) {
        showToast('error', 'Failed to save content')
      }
    }}
    className="flex items-center justify-center space-x-2 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
    </svg>
    <span>🖼️ Add Image</span>
  </button>
</div>
  </div>
)

  switch (currentStep) {
  case 'selection':
    return renderFormulaSelection()
  case 'template':
    return renderTemplatePreview()
  case 'writing':
    return renderWritingInterface()
  case 'preview':
    return renderFinalPreview()
  default:
    return renderFormulaSelection()
}
}
