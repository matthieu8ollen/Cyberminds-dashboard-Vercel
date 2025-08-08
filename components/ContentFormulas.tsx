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

// Legacy formula interface for backward compatibility
interface LegacyContentFormula {
  id: string
  name: string
  description: string
  category: 'story' | 'data' | 'framework' | 'lead-generation'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  popularity: number
  structure: string[]
  example: string
  whyItWorks: string[]
  bestFor: string
  isCustom?: boolean
  createdAt?: string
}

interface ContentFormulasProps {
  onBack: () => void
  onCreateFormula?: (baseFormula?: EnhancedContentFormula) => void
  onUseFormula?: (formula: EnhancedContentFormula) => void
}

// Your existing legacy formulas (converted to enhanced format)
const LEGACY_BUILTIN_FORMULAS: LegacyContentFormula[] = [
  {
    id: 'confession',
    name: 'Confession Formula',
    description: 'Share vulnerable business lessons through personal mistakes',
    category: 'story',
    difficulty: 'beginner',
    estimatedTime: '15 min',
    popularity: 94,
    structure: [
      'Admission - Hook that takes responsibility',
      'Context - Why you made this decision', 
      'Consequence - What went wrong and impact',
      'Learning - Key insight discovered',
      'Redemption - How you do it differently now',
      'CTA - Question inviting sharing'
    ],
    example: 'Hiring my best friend as CTO was the hardest mistake I ever made...',
    whyItWorks: [
      'Vulnerability builds immediate trust',
      'Specific details make it relatable', 
      'Clear lesson provides universal value'
    ],
    bestFor: 'Business relationship lessons, leadership stories'
  },
  {
    id: 'myth-buster',
    name: 'Myth-Buster Formula',
    description: 'Challenge conventional wisdom with evidence',
    category: 'data',
    difficulty: 'intermediate',
    estimatedTime: '20 min',
    popularity: 87,
    structure: [
      'State the conventional wisdom',
      'Explain the problems with this belief',
      'Provide credible evidence',
      'Give superior alternative',
      'CTA asking about experience'
    ],
    example: 'Everyone says "hire slow, fire fast" but this advice is killing your startup...',
    whyItWorks: [
      'Creates cognitive dissonance',
      'Positions you as contrarian thinker',
      'Evidence builds credibility'
    ],
    bestFor: 'Industry misconceptions, best practice challenges'
  },
  {
    id: 'framework-reveal',
    name: 'Framework Reveal',
    description: 'Share systematic approach to solving problems',
    category: 'framework',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    popularity: 91,
    structure: [
      'Problem introduction',
      'Framework overview',
      'Step-by-step breakdown',
      'Real-world application',
      'Results and validation',
      'CTA for implementation'
    ],
    example: 'The 3-2-1 Method that transformed our customer retention...',
    whyItWorks: [
      'Provides structured value',
      'Memorable and actionable',
      'Establishes expertise'
    ],
    bestFor: 'Process sharing, methodologies, strategic insights'
  },
  {
    id: 'webinar-teaser',
    name: 'Webinar Teaser',
    description: 'Generate leads with valuable preview content',
    category: 'lead-generation',
    difficulty: 'advanced',
    estimatedTime: '30 min',
    popularity: 78,
    structure: [
      'Hook with common mistake',
      'Personal transformation story',
      'Preview of valuable insight',
      'Mid-post CTA with signup link',
      'Surface-level teaching',
      'Deep-dive promise for webinar'
    ],
    example: 'I used to think cash flow was just about timing payments...',
    whyItWorks: [
      'Provides immediate value',
      'Creates curiosity gap',
      'Clear value proposition'
    ],
    bestFor: 'Lead generation, webinar promotion, course marketing'
  }
]

// Convert legacy to enhanced formulas
const BUILTIN_FORMULAS: EnhancedContentFormula[] = convertLegacyFormulas(LEGACY_BUILTIN_FORMULAS)

// Sample custom enhanced formulas
const CUSTOM_FORMULAS: EnhancedContentFormula[] = [
  {
    id: 'custom-saas-metrics',
    name: 'SaaS Metrics Breakthrough',
    description: 'Custom formula for sharing counterintuitive SaaS performance insights',
    category: 'data',
    difficulty: 'intermediate',
    estimatedTime: '20 min',
    popularity: 0,
    isCustom: true,
    createdAt: '2024-01-15T10:00:00Z',
    sections: [
      {
        id: 'hook_section',
        title: 'Shocking Metric Hook',
        description: 'Lead with a counterintuitive metric that challenges assumptions',
        guidance: 'Start with a specific, surprising statistic that makes people question what they know',
        placeholder: 'Our churn rate is 47% higher than industry average, and our investors are celebrating...',
        position: 0,
        isRequired: true,
        isCustom: true,
        psychologyNote: 'Cognitive dissonance creates attention and curiosity'
      },
      {
        id: 'context_section',
        title: 'Industry Comparison',
        description: 'Show how this metric compares to industry standards',
        guidance: 'Provide context that explains why this metric seems problematic at first glance',
        placeholder: 'While most SaaS companies celebrate low churn, we discovered something different...',
        position: 1,
        isRequired: true,
        isCustom: true,
        psychologyNote: 'Context helps readers understand the stakes and why this matters'
      },
      {
        id: 'strategy_section',
        title: 'Our Contrarian Strategy',
        description: 'Reveal the strategy behind the surprising metric',
        guidance: 'Explain the methodology that led to this counterintuitive approach',
        placeholder: 'Here\'s our 3-part approach to strategic churn management...',
        position: 2,
        isRequired: true,
        isCustom: true,
        psychologyNote: 'Providing a systematic approach establishes authority'
      }
    ],
    ctaPositions: [
      {
        id: 'engagement_cta',
        type: 'comment',
        position: 'end',
        text: 'What metrics do you track that might seem counterintuitive? Share below.',
        trackingParams: { type: 'engagement' }
      }
    ],
    psychologicalTriggers: [
      {
        id: 'contrarian_authority',
        name: 'Contrarian Authority',
        description: 'Challenging conventional wisdom establishes thought leadership',
        category: 'authority',
        strength: 8,
        applicableSections: ['hook_section', 'strategy_section'],
        implementation: 'Present data that contradicts popular beliefs'
      }
    ],
    usageCount: 0,
    stakeholderScores: { cfo: 9, cmo: 6, ceo: 7, vc: 8 },
    version: 1,
    tags: ['saas', 'metrics', 'contrarian', 'data-driven'],
    isPublic: false
  }
]

const CATEGORIES = [
  { id: 'all', label: 'AI Suggested', icon: BookOpen },
  { id: 'story', label: 'Story-Based', icon: MessageSquare },
  { id: 'data', label: 'Data-Driven', icon: BarChart3 },
  { id: 'framework', label: 'Framework', icon: TrendingUp },
  { id: 'lead-generation', label: 'Lead Generation', icon: Users }
]

type ViewMode = 'gallery' | 'builder' | 'analyzer'

export default function ContentFormulas({ onBack, onCreateFormula, onUseFormula }: ContentFormulasProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('gallery')
  const [activeTab, setActiveTab] = useState<'builtin' | 'custom'>('builtin')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFormula, setSelectedFormula] = useState<EnhancedContentFormula | null>(null)
  
  // Builder/Analyzer state
  const [builderFormula, setBuilderFormula] = useState<EnhancedContentFormula | null>(null)
  const [analysisData, setAnalysisData] = useState<{
    analysis?: AIAnalysisResult
    suggestions?: OptimizationSuggestion[]
  }>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const currentFormulas = activeTab === 'builtin' ? BUILTIN_FORMULAS : CUSTOM_FORMULAS

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

  const handleSaveFormula = async (formula: EnhancedContentFormula) => {
    // TODO: Backend integration - save formula
    console.log('Saving formula:', formula)
    
    // For now, just go back to gallery
    setViewMode('gallery')
    setBuilderFormula(null)
    
    // In real implementation, update the custom formulas list
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
    // TODO: Apply suggestion to formula
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
  baseFormula={builderFormula || undefined}
  onSave={handleSaveFormula}
  onCancel={handleCancelBuilder}
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
            Built-in Formulas ({BUILTIN_FORMULAS.length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'custom'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Custom Formulas ({CUSTOM_FORMULAS.length})
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
    </div>
  )
}
