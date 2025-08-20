'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Plus, Eye, Edit3, Star, Users, TrendingUp, BarChart3, MessageSquare, ArrowRight, Filter, Search, Sparkles } from 'lucide-react'
import FormulaBuilder from './formula/FormulaBuilder'
import FormulaAnalyzer from './formula/FormulaAnalyzer'
import { formulaConverter, convertLegacyFormulas } from '@/lib/formulaConverter'
import type { 
  EnhancedContentFormula,
  AIAnalysisResult,
  OptimizationSuggestion,
  FormulaAnalysisResponse
} from '@/types/formulaTypes'

// Import database functions
import { getContentFormulas, saveContentFormula, updateContentFormula, deleteContentFormula, type ContentFormula, type FormulaSection } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface ContentFormulasProps {
  onBack: () => void
  onCreateFormula?: (baseFormula?: EnhancedContentFormula) => void
  onUseFormula?: (formula: EnhancedContentFormula) => void
}

// Map database categories to user-friendly names
const mapCategoryToUserFriendly = (dbCategory: string): 'authority' | 'contrarian' | 'personal' | 'framework' => {
  switch (dbCategory) {
    case 'Authority_Framework':
      return 'authority'
    case 'Contrarian_Insight':
      return 'contrarian'
    case 'Personal_Story_Lesson':
      return 'personal'
    default:
      return 'framework'
  }
}

// Conversion function from database format to component format
const convertDatabaseToEnhanced = (dbFormula: ContentFormula & { formula_sections: FormulaSection[] }): EnhancedContentFormula => {
  return {
    id: dbFormula.id,
    name: dbFormula.formula_name,
    description: dbFormula.funnel_purpose || dbFormula.content_intent || '',
    category: mapCategoryToUserFriendly(dbFormula.formula_category || ''),
    difficulty: (dbFormula.difficulty_level?.toLowerCase() as any) || 'intermediate',
    estimatedTime: `${Math.ceil((dbFormula.estimated_word_count || 200) / 200) * 5} min`,
    popularity: Math.round((dbFormula.effectiveness_score || 0) * 10),
    isCustom: dbFormula.created_by !== null,
    createdAt: dbFormula.created_at,
    updatedAt: dbFormula.updated_at,
    userId: dbFormula.created_by,
    
    // Convert sections
    sections: (dbFormula.formula_sections || []).map(section => ({
      id: section.id,
      title: section.section_name,
      description: section.section_purpose || '',
      guidance: section.section_guidelines || '',
      placeholder: section.section_template || '',
      position: section.section_order,
      isRequired: section.is_required ?? true,
      isCustom: section.is_customizable ?? true,
      psychologyNote: section.psychological_purpose,
      wordCountTarget: section.word_count_target,
      toneGuidance: section.emotional_target,
      exampleContent: section.section_strategy_explanation
    })).sort((a, b) => a.position - b.position),
    
    // Default values for enhanced properties
    ctaPositions: [],
    psychologicalTriggers: (dbFormula.psychological_triggers || []).map((trigger, index) => ({
      id: `trigger_${index}`,
      name: trigger,
      description: '',
      category: 'authority' as any,
      strength: 5,
      applicableSections: [],
      implementation: ''
    })),
    usageCount: 0,
    stakeholderScores: { cfo: 5, cmo: 5, ceo: 5, vc: 5 },
    version: 1,
    tags: dbFormula.use_cases || [],
    isPublic: !dbFormula.created_by
  }
}

// Conversion function from component format to database format
const convertEnhancedToDatabase = (formula: EnhancedContentFormula, userId: string) => {
  const formulaData = {
    formula_name: formula.name,
    funnel_purpose: formula.description,
    formula_category: formula.category === 'authority' ? 'Authority_Framework' : 
                     formula.category === 'contrarian' ? 'Contrarian_Insight' : 
                     formula.category === 'personal' ? 'Personal_Story_Lesson' : 'Authority_Framework',
    difficulty_level: formula.difficulty,
    section_count: formula.sections.length,
    estimated_word_count: formula.sections.reduce((acc, section) => acc + (section.wordCountTarget || 100), 0),
    psychological_triggers: formula.psychologicalTriggers?.map(t => t.name) || [],
    use_cases: formula.tags || [],
    is_active: true,
    is_premium: formula.isCustom,
    created_by: userId,
    effectiveness_score: formula.popularity / 10
  }

  const sectionsData = formula.sections.map(section => ({
    section_order: section.position,
    section_name: section.title,
    section_purpose: section.description,
    section_guidelines: section.guidance,
    section_template: section.placeholder,
    word_count_target: section.wordCountTarget || 100,
    is_required: section.isRequired,
    is_customizable: section.isCustom,
    psychological_purpose: section.psychologyNote,
    emotional_target: section.toneGuidance
  }))

  return { formulaData, sectionsData }
}

const CATEGORIES = [
  { id: 'all', label: 'All Formulas', icon: BookOpen },
  { id: 'authority', label: 'Authority Framework', icon: TrendingUp },
  { id: 'contrarian', label: 'Contrarian Insight', icon: BarChart3 },
  { id: 'personal', label: 'Personal Stories/Lesson', icon: MessageSquare }
]

type ViewMode = 'gallery' | 'builder' | 'analyzer'

export default function ContentFormulas({ onBack, onCreateFormula, onUseFormula }: ContentFormulasProps) {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('gallery')
  const [activeTab, setActiveTab] = useState<'builtin' | 'custom'>('builtin')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFormula, setSelectedFormula] = useState<EnhancedContentFormula | null>(null)
  const [showFormulaModal, setShowFormulaModal] = useState(false)
  const [modalFormula, setModalFormula] = useState<EnhancedContentFormula | null>(null)
  
  // Replace static data with dynamic loading
  const [allFormulas, setAllFormulas] = useState<EnhancedContentFormula[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Builder/Analyzer state
  const [builderFormula, setBuilderFormula] = useState<EnhancedContentFormula | null>(null)
  const [analysisData, setAnalysisData] = useState<{
    analysis?: AIAnalysisResult
    suggestions?: OptimizationSuggestion[]
  }>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Load formulas from database
  useEffect(() => {
    loadFormulas()
  }, [user])

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
        const convertedFormulas = data.map(convertDatabaseToEnhanced)
        setAllFormulas(convertedFormulas)
      }
    } catch (err) {
      console.error('Error loading formulas:', err)
      setError('Failed to load formulas')
    } finally {
      setLoading(false)
    }
  }

  // Separate formulas into builtin and custom
  const builtinFormulas = allFormulas.filter(f => !f.isCustom)
  const customFormulas = allFormulas.filter(f => f.isCustom && f.userId === user?.id)
  
  const currentFormulas = activeTab === 'builtin' ? builtinFormulas : customFormulas

  const filteredFormulas = currentFormulas.filter(formula => {
    const matchesCategory = selectedCategory === 'all' || formula.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      formula.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formula.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getCategoryColor = (category: string) => {
    const colors = {
      'authority': 'bg-blue-100 text-blue-700 border-blue-200',
      'contrarian': 'bg-purple-100 text-purple-700 border-purple-200',
      'personal': 'bg-green-100 text-green-700 border-green-200',
      'framework': 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      'beginner': 'text-green-600 bg-green-100',
      'intermediate': 'text-yellow-600 bg-yellow-100', 
      'advanced': 'text-red-600 bg-red-100'
    }
    return colors[difficulty as keyof typeof colors] || 'text-gray-600 bg-gray-100'
  }

  // Builder handlers
  const handleCreateFormula = async (baseFormula?: EnhancedContentFormula) => {
    if (!user?.id) return
    
    setBuilderFormula(baseFormula || null)
    setViewMode('builder')
  }

  const handleFormulaClick = (formula: EnhancedContentFormula) => {
    setModalFormula(formula)
    setShowFormulaModal(true)
  }

  const handleUseFormula = (formula: EnhancedContentFormula) => {
    setShowFormulaModal(false)
    if (onUseFormula) {
      onUseFormula(formula)
    }
  }

  const formatEffectivenessScore = (score: number) => {
    if (score >= 8) return { label: 'Excellent', color: 'text-green-600 bg-green-100' }
    if (score >= 6) return { label: 'Good', color: 'text-blue-600 bg-blue-100' }
    if (score >= 4) return { label: 'Fair', color: 'text-yellow-600 bg-yellow-100' }
    return { label: 'Poor', color: 'text-red-600 bg-red-100' }
  }

  const renderFormulaModal = () => {
    if (!modalFormula) return null

    const effectiveness = formatEffectivenessScore(modalFormula.popularity)

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{modalFormula.name}</h2>
                <p className="text-gray-600">{modalFormula.description}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(modalFormula.category)}`}>
                    {modalFormula.category === 'authority' ? 'Authority Framework' : 
                     modalFormula.category === 'contrarian' ? 'Contrarian Insight' : 
                     modalFormula.category === 'personal' ? 'Personal Stories/Lesson' : 'Framework'}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(modalFormula.difficulty)}`}>
                    {modalFormula.difficulty}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${effectiveness.color}`}>
                    {effectiveness.label}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-600 mb-1">Estimated Time</h4>
                <p className="text-lg font-semibold text-gray-900">{modalFormula.estimatedTime}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-600 mb-1">Sections</h4>
                <p className="text-lg font-semibold text-gray-900">{modalFormula.sections.length}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-600 mb-1">Effectiveness</h4>
                <p className="text-lg font-semibold text-gray-900">{modalFormula.popularity}/10</p>
              </div>
            </div>

            {/* Formula Structure */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Formula Structure</h3>
              <div className="space-y-3">
                {modalFormula.sections.map((section, index) => (
                  <div key={section.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{section.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                      {section.wordCountTarget && (
                        <p className="text-xs text-gray-500 mt-1">Target: {section.wordCountTarget} words</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Psychological Triggers */}
            {modalFormula.psychologicalTriggers && modalFormula.psychologicalTriggers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Psychological Triggers</h3>
                <div className="flex flex-wrap gap-2">
                  {modalFormula.psychologicalTriggers.map((trigger, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                      {trigger.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {modalFormula.tags && modalFormula.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Use Cases</h3>
                <div className="flex flex-wrap gap-2">
                  {modalFormula.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
              >
                Close
              </button>
              <button
                onClick={() => handleUseFormula(modalFormula)}
                className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition font-medium"
              >
                Use This Formula
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleSaveFormula = async (formula: EnhancedContentFormula) => {
    if (!user?.id) return
    
    try {
      if (formula.id && formula.isCustom) {
        // Update existing custom formula
        await updateContentFormula(formula.id, formula, user.id)
      } else {
        // Save new custom formula
        await saveContentFormula(formula, user.id)
      }
      
      // Reload formulas
      await loadFormulas()
      setViewMode('gallery')
      setBuilderFormula(null)
    } catch (err) {
      console.error('Error saving formula:', err)
      setError('Failed to save formula')
    }
  }

  const handleCancelBuilder = () => {
    setViewMode('gallery')
    setBuilderFormula(null)
  }

  // Analyzer handlers
  const handleAnalyzeFormula = async (formula: EnhancedContentFormula): Promise<FormulaAnalysisResponse> => {
    setIsAnalyzing(true)
    
    try {
      // TODO: Backend integration - analyze formula with Marcus AI
      console.log('Analyzing formula:', formula)
      
      // Mock analysis for now
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockAnalysis: AIAnalysisResult = {
        overallScore: 7.5,
        strengths: [
          'Clear structure with logical flow',
          'Good use of psychological triggers',
          'Appropriate for target audience'
        ],
        weaknesses: [
          'Could benefit from more specific examples',
          'Missing emotional hook in opening'
        ],
        improvementAreas: [
          'Strengthen opening hook',
          'Add more concrete examples',
          'Enhance emotional appeal'
        ],
        engagementPrediction: 8.2,
        conversionPotential: 6.8,
        audienceAlignment: { cfo: 7, cmo: 8, ceo: 7, vc: 6 },
        psychologicalEffectiveness: 7.8,
        analysisTimestamp: new Date().toISOString()
      }

      const mockSuggestions: OptimizationSuggestion[] = [
        {
          id: 'hook_improvement',
          type: 'content',
          priority: 'high',
          title: 'Strengthen Opening Hook',
          description: 'Your opening could be more compelling with a specific statistic or surprising statement',
          implementation: 'Start with a concrete number or counterintuitive fact that immediately grabs attention',
          expectedImpact: 8,
          appliesTo: ['hook_section']
        },
        {
          id: 'psychology_enhancement',
          type: 'psychology',
          priority: 'medium',
          title: 'Add Social Proof Element',
          description: 'Including social proof would increase credibility and engagement',
          implementation: 'Add a section mentioning how many others have benefited from this approach',
          expectedImpact: 6,
          appliesTo: ['all']
        }
      ]

      const response: FormulaAnalysisResponse = {
        analysis: mockAnalysis,
        optimizations: mockSuggestions,
        enhancedFormula: formula
      }

      setAnalysisData({
        analysis: mockAnalysis,
        suggestions: mockSuggestions
      })

      return response
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleApplySuggestion = (suggestion: OptimizationSuggestion) => {
    // Implementation for applying suggestions
    console.log('Applying suggestion:', suggestion)
  }

  const handleUseFormula = (formula: EnhancedContentFormula) => {
    if (onUseFormula) {
      onUseFormula(formula)
    } else {
      console.log('Using formula:', formula)
      // TODO: Navigate to Writer Suite with this formula
    }
  }

  // Render different views based on mode
  if (viewMode === 'builder') {
    return (
      <FormulaBuilder
  baseFormula={builderFormula}
  onSave={handleSaveFormula}
  onCancel={() => setViewMode('gallery')}
  onAnalyze={handleAnalyzeFormula}
/>
    )
  }

  if (viewMode === 'analyzer' && selectedFormula) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Formula Analysis</h1>
            <p className="text-gray-600">{selectedFormula.name}</p>
          </div>
          <button
            onClick={() => setViewMode('gallery')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Back to Gallery
          </button>
        </div>

        <FormulaAnalyzer
          formula={selectedFormula}
          analysis={analysisData.analysis}
          suggestions={analysisData.suggestions}
          onAnalyze={() => handleAnalyzeFormula(selectedFormula)}
          onApplySuggestion={handleApplySuggestion}
          isAnalyzing={isAnalyzing}
        />
      </div>
    )
  }

  // Gallery view
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
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

      {/* Only show content if not loading and no error */}
      {!loading && !error && (
        <>
          {/* Header */}
          <div className="mb-8">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 mb-4 transition"
        >
          ← Back to Ideas Hub
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Formulas</h1>
            <p className="text-gray-600">Proven templates and your custom formulas for consistent, engaging content</p>
          </div>
          
          <button
            onClick={() => handleCreateFormula()}
            className="flex items-center space-x-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Create Custom Formula</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('builtin')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'builtin'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Built-in Formulas ({builtinFormulas.length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'custom'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Custom Formulas ({customFormulas.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search formulas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center space-x-2 mb-8 overflow-x-auto pb-2">
        {CATEGORIES.map(category => {
          const Icon = category.icon
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-teal-100 text-teal-700 border border-teal-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{category.label}</span>
            </button>
          )
        })}
      </div>

      {/* Formulas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFormulas.map(formula => (
          <div
            key={formula.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group cursor-pointer"
            onClick={() => handleFormulaClick(formula)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(formula.category)}`}>
                    {formula.category.replace('-', ' ')}
                  </span>
                  {formula.isCustom && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700 border border-teal-200">
                      Custom
                    </span>
                  )}
                  {formula.aiAnalysis && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Enhanced
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                  {formula.name}
                </h3>
                <p className="text-gray-600 text-sm mt-1">{formula.description}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-4">
                <span className={getDifficultyColor(formula.difficulty)}>
                  {formula.difficulty}
                </span>
                <span>{formula.estimatedTime}</span>
              </div>
              {!formula.isCustom && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{formula.popularity}%</span>
                </div>
              )}
            </div>

            {/* Enhanced Structure Preview */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Structure ({formula.sections.length} sections):</p>
              <div className="space-y-1">
                {formula.sections.slice(0, 3).map((section, index) => (
                  <div key={section.id} className="flex items-center space-x-2 text-xs text-gray-600">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                    <span className="truncate">{section.title}</span>
                  </div>
                ))}
                {formula.sections.length > 3 && (
                  <div className="text-xs text-gray-500 ml-3.5">
                    +{formula.sections.length - 3} more sections
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Features Indicators */}
            <div className="flex items-center space-x-3 text-xs text-gray-500 mb-4">
              {formula.psychologicalTriggers.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{formula.psychologicalTriggers.length} triggers</span>
                </div>
              )}
              {formula.ctaPositions.length > 0 && (
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{formula.ctaPositions.length} CTAs</span>
                </div>
              )}
              {formula.aiAnalysis && (
                <div className="flex items-center space-x-1">
                  <BarChart3 className="w-3 h-3" />
                  <span>Score: {formula.aiAnalysis.overallScore}/10</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleUseFormula(formula)
                }}
                className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition flex items-center justify-center space-x-1"
              >
                <span>Use Formula</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedFormula(formula)
                }}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                title="Preview"
              >
                <Eye className="w-4 h-4" />
              </button>
              
              {formula.isCustom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCreateFormula(formula)
                  }}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedFormula(formula)
                  setViewMode('analyzer')
                }}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                title="Analyze"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredFormulas.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No formulas found</h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'custom' 
              ? "You haven't created any custom formulas yet. Start with a built-in template!"
              : "No formulas match your current filters. Try adjusting your search or category."
            }
          </p>
          {activeTab === 'custom' && (
            <button
              onClick={() => handleCreateFormula()}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition font-medium"
            >
              Create Your First Formula
            </button>
          )}
        </div>
      )}
        </>
      )}
    </div>
  )
}
