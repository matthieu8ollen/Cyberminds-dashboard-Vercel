'use client'

import { useState } from 'react'
import { BookOpen, Plus, Eye, Edit3, Star, Users, TrendingUp, BarChart3, MessageSquare, ArrowRight, Filter, Search } from 'lucide-react'

interface ContentFormula {
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
  onCreateFormula?: (baseFormula?: ContentFormula) => void
  onUseFormula?: (formula: ContentFormula) => void
}

// Sample built-in formulas from Marcus database
const BUILTIN_FORMULAS: ContentFormula[] = [
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

// Sample custom formulas (would come from user's saved formulas)
const CUSTOM_FORMULAS: ContentFormula[] = [
  {
    id: 'custom-1',
    name: 'My SaaS Metrics Formula',
    description: 'Custom formula for sharing SaaS performance insights',
    category: 'data',
    difficulty: 'intermediate',
    estimatedTime: '20 min',
    popularity: 0,
    structure: [
      'Shocking metric revelation',
      'Industry comparison',
      'Our specific strategy',
      'Implementation steps',
      'CTA for questions'
    ],
    example: 'Our churn rate dropped 67% when we stopped doing what everyone recommends...',
    whyItWorks: [
      'Data-driven credibility',
      'Contrarian positioning',
      'Specific results'
    ],
    bestFor: 'SaaS metrics, performance insights',
    isCustom: true,
    createdAt: '2024-01-15'
  }
]

const CATEGORIES = [
  { id: 'all', label: 'All Formulas', icon: BookOpen },
  { id: 'story', label: 'Story-Based', icon: MessageSquare },
  { id: 'data', label: 'Data-Driven', icon: BarChart3 },
  { id: 'framework', label: 'Framework', icon: TrendingUp },
  { id: 'lead-generation', label: 'Lead Generation', icon: Users }
]

export default function ContentFormulas({ onBack, onCreateFormula, onUseFormula }: ContentFormulasProps) {
  const [activeTab, setActiveTab] = useState<'builtin' | 'custom'>('builtin')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFormula, setSelectedFormula] = useState<ContentFormula | null>(null)

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
      'lead-generation': 'bg-orange-100 text-orange-700 border-orange-200'
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
            onClick={() => onCreateFormula?.()}
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

            {/* Structure Preview */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Structure ({formula.structure.length} steps):</p>
              <div className="space-y-1">
                {formula.structure.slice(0, 3).map((step, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                    <span className="truncate">{step}</span>
                  </div>
                ))}
                {formula.structure.length > 3 && (
                  <div className="text-xs text-gray-500 ml-3.5">
                    +{formula.structure.length - 3} more steps
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onUseFormula?.(formula)
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
              >
                <Eye className="w-4 h-4" />
              </button>
              
              {formula.isCustom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onCreateFormula?.(formula)
                  }}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
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
              onClick={() => onCreateFormula?.()}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition font-medium"
            >
              Create Your First Formula
            </button>
          )}
        </div>
      )}

      {/* Formula Detail Modal (Preview) */}
      {selectedFormula && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
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
              {/* Structure */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Formula Structure</h3>
                <div className="space-y-3">
                  {selectedFormula.structure.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why It Works */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Why It Works</h3>
                <ul className="space-y-2">
                  {selectedFormula.whyItWorks.map((reason, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Best For */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Best For</h3>
                <p className="text-gray-700">{selectedFormula.bestFor}</p>
              </div>

              {/* Example */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Example Opening</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 italic">"{selectedFormula.example}"</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    onUseFormula?.(selectedFormula)
                    setSelectedFormula(null)
                  }}
                  className="flex-1 bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition flex items-center justify-center space-x-2"
                >
                  <span>Use This Formula</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => {
                    onCreateFormula?.(selectedFormula)
                    setSelectedFormula(null)
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Customize Formula
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
