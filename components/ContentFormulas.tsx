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

// Conversion function from database format to component format
const convertDatabaseToEnhanced = (dbFormula: ContentFormula & { formula_sections: FormulaSection[] }): EnhancedContentFormula => {
  return {
    id: dbFormula.id,
    name: dbFormula.formula_name,
    description: dbFormula.funnel_purpose || '',
    category: dbFormula.formula_category as any || 'framework',
    difficulty: dbFormula.difficulty_level as any || 'beginner',
    estimatedTime: '25 min', // Default since not in schema
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
const convertEnhancedToDatabase = (formula: EnhancedContentFormula): { 
  formula: Omit<ContentFormula, 'id' | 'created_at' | 'updated_at'>, 
  sections: Omit<FormulaSection, 'id' | 'formula_id' | 'created_at'>[] 
} => {
  return {
    formula: {
      user_id: formula.userId,
      name: formula.name,
      description: formula.description,
      category: formula.category,
      difficulty: formula.difficulty,
      estimated_time: formula.estimatedTime,
      popularity: formula.popularity,
      is_custom: formula.isCustom,
      is_public: formula.isPublic,
      usage_count: formula.usageCount,
      stakeholder_scores: formula.stakeholderScores,
      psychological_triggers: formula.psychologicalTriggers,
      cta_positions: formula.ctaPositions,
      tags: formula.tags,
      version: formula.version,
      base_formula_id: formula.baseFormulaId
    },
    sections: formula.sections.map(section => ({
      title: section.title,
      description: section.description,
      guidance: section.guidance,
      placeholder: section.placeholder,
      position: section.position,
      is_required: section.isRequired,
      is_custom: section.isCustom,
      psychology_note: section.psychologyNote,
      word_count_target: section.wordCountTarget,
      tone_guidance: section.toneGuidance,
      example_content: section.exampleContent
    }))
  }
}

const CATEGORIES = [
  { id: 'all', label: 'AI Suggested', icon: BookOpen },
  { id: 'story', label: 'Story-Based', icon: MessageSquare },
  { id: 'data', label: 'Data-Driven', icon: BarChart3 },
  { id: 'framework', label: 'Framework', icon: TrendingUp },
  { id: 'lead-generation', label: 'Lead Generation', icon: Users }
]

type ViewMode = 'gallery' | 'builder' | 'analyzer'

export default function ContentFormulas({ onBack, onCreateFormula, onUseFormula }: ContentFormulasProps) {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('gallery')
  const [activeTab, setActiveTab] = useState<'builtin' | 'custom'>('builtin')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFormula, setSelectedFormula] = useState<EnhancedContentFormula | null>(null)
  
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
      'story': 'bg-purple-100 text-purple-700 border-purple-200',
      'data': 'bg-blue-100 text-blue-700 border-blue-200',
      'framework': 'bg-green-100 text-green-700 border-green-200',
      'lead-generation': 'bg-orange-100 text-orange-700 border-orange-200',
      'hybrid': 'bg-pink-100 text-pink-700 border-pink-200'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      'beginner': 'text-green-600',
      'intermediate': 'text-yellow-600',
      'advanced': 'text-red-600'
    }
    return colors[difficulty as keyof typeof colors] || 'text-gray-600'
  }

  // Builder handlers
  const handleCreateFormula = (baseFormula?: EnhancedContentFormula) => {
    setBuilderFormula(baseFormula || null)
    setViewMode('builder')
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

  // Handle save
  const handleSaveFormula = async (formula: EnhancedContentFormula) => {
    try {
      const { formula: dbFormula, sections } = convertEnhancedToDatabase({
        ...formula,
        userId: user?.id,
        isCustom: true,
        isPublic: false
      })

      if (formula.id && formula.id.startsWith('custom_')) {
        // Update existing
        const { data, error } = await updateContentFormula(formula.id, dbFormula, sections)
        if (error) throw error
      } else {
        // Create new
        const { data, error } = await saveContentFormula(dbFormula, sections)
        if (error) throw error
      }

      // Reload formulas
      await loadFormulas()
      setViewMode('gallery')
    } catch (error) {
      console.error('Error saving formula:', error)
      // Handle error - you might want to show a toast notification
    }
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
            onClick={() => setSelectedFormula(formula)}
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

      {/* Enhanced Formula Detail Modal */}
      {selectedFormula && viewMode === 'gallery' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedFormula.name}</h2>
                  <p className="text-gray-600">{selectedFormula.description}</p>
                </div>
                <button
                  onClick={() => setSelectedFormula(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Enhanced Structure */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Formula Structure</h3>
                <div className="space-y-4">
                  {selectedFormula.sections.map((section, index) => (
                    <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3 mb-2">
                        <div className="w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{section.title}</h4>
                          {section.description && (
                            <p className="text-gray-600 text-sm mt-1">{section.description}</p>
                          )}
                        </div>
                      </div>
                      
                      {section.guidance && (
                        <div className="ml-9 mt-2">
                          <p className="text-sm text-gray-700 italic">"{section.guidance}"</p>
                        </div>
                      )}
                      
                      {section.psychologyNote && (
                        <div className="ml-9 mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">Psychology Note</span>
                          </div>
                          <p className="text-sm text-blue-800">{section.psychologyNote}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Psychological Triggers */}
              {selectedFormula.psychologicalTriggers.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Psychological Triggers</h3>
                  <div className="grid gap-3">
                    {selectedFormula.psychologicalTriggers.map((trigger) => (
                      <div key={trigger.id} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-purple-900">{trigger.name}</h4>
                          <span className="text-sm text-purple-700">Strength: {trigger.strength}/10</span>
                        </div>
                        <p className="text-sm text-purple-800 mb-2">{trigger.description}</p>
                        <p className="text-xs text-purple-700 italic">{trigger.implementation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTAs */}
              {selectedFormula.ctaPositions.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Call-to-Actions</h3>
                  <div className="space-y-2">
                    {selectedFormula.ctaPositions.map((cta) => (
                      <div key={cta.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">{cta.type}</span>
                          <span className="text-xs text-gray-500 capitalize">{cta.position}</span>
                        </div>
                        <p className="text-sm text-gray-800">"{cta.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Analysis Preview */}
              {selectedFormula.aiAnalysis && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">AI Analysis</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-green-900">Overall Score</span>
                      <span className="text-2xl font-bold text-green-700">{selectedFormula.aiAnalysis.overallScore}/10</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-green-700">Engagement: {selectedFormula.aiAnalysis.engagementPrediction}/10</span>
                      </div>
                      <div>
                        <span className="text-green-700">Conversion: {selectedFormula.aiAnalysis.conversionPotential}/10</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    handleUseFormula(selectedFormula)
                    setSelectedFormula(null)
                  }}
                  className="flex-1 bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition flex items-center justify-center space-x-2"
                >
                  <span>Use This Formula</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => {
                    handleCreateFormula(selectedFormula)
                    setSelectedFormula(null)
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Customize Formula
                </button>

                <button
                  onClick={() => {
                    setViewMode('analyzer')
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center space-x-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analyze</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}
