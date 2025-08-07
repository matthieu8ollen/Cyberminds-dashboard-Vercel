// ==========================================
// FORMULA ANALYZER COMPONENT
// File: components/formula/FormulaAnalyzer.tsx
// ==========================================

'use client'

import { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  Brain, 
  Lightbulb, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Sparkles,
  Eye,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Zap
} from 'lucide-react'
import type { 
  EnhancedContentFormula, 
  AIAnalysisResult, 
  OptimizationSuggestion,
  FormulaAnalyzerProps,
  StakeholderScores
} from '@/types/formulaTypes'

export default function FormulaAnalyzer({ 
  formula, 
  analysis, 
  suggestions = [], 
  onAnalyze, 
  onApplySuggestion, 
  isAnalyzing 
}: FormulaAnalyzerProps) {
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null)
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set())

  const handleApplySuggestion = (suggestion: OptimizationSuggestion) => {
    onApplySuggestion(suggestion)
    setAppliedSuggestions(prev => {
  const newSet = new Set(prev)
  newSet.add(suggestion.id)
  return newSet
})
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100'
    if (score >= 6) return 'text-yellow-600 bg-yellow-100'
    if (score >= 4) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 8) return <TrendingUp className="w-4 h-4" />
    if (score >= 6) return <Target className="w-4 h-4" />
    return <TrendingDown className="w-4 h-4" />
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'structure': return <Target className="w-4 h-4" />
      case 'psychology': return <Brain className="w-4 h-4" />
      case 'content': return <Eye className="w-4 h-4" />
      case 'positioning': return <Users className="w-4 h-4" />
      case 'cta': return <Zap className="w-4 h-4" />
      default: return <Lightbulb className="w-4 h-4" />
    }
  }

  const renderStakeholderScores = (scores: StakeholderScores) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Object.entries(scores).map(([stakeholder, score]) => (
        <div key={stakeholder} className="text-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${getScoreColor(score)}`}>
            {getScoreIcon(score)}
          </div>
          <div className="text-2xl font-bold text-gray-900">{score}/10</div>
          <div className="text-xs text-gray-600 uppercase tracking-wide">
            {stakeholder}
          </div>
        </div>
      ))}
    </div>
  )

  if (!analysis && !isAnalyzing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-teal-600" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            AI Formula Analysis
          </h3>
          
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Get insights into your formula's effectiveness, audience appeal, and optimization opportunities.
          </p>
          
          <button
            onClick={onAnalyze}
            className="flex items-center space-x-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition mx-auto"
          >
            <Sparkles className="w-5 h-5" />
            <span>Analyze Formula</span>
          </button>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
            <div className="flex items-center justify-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Stakeholder Appeal</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>Psychology Score</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Engagement Prediction</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Analyzing Formula...
          </h3>
          
          <p className="text-gray-600 mb-6">
            Marcus is analyzing your formula structure, psychology, and audience appeal.
          </p>
          
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
              <span>Structure Analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <span>Psychology Check</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <span>Engagement Prediction</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Analysis Results</h3>
            <p className="text-gray-600">Formula effectiveness breakdown</p>
          </div>
          
          <button
            onClick={onAnalyze}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Re-analyze</span>
          </button>
        </div>

        {/* Overall Score */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${getScoreColor(analysis.overallScore)}`}>
            <span className="text-2xl font-bold">{analysis.overallScore}</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900">Overall Score</h4>
          <p className="text-gray-600">
            {analysis.overallScore >= 8 ? 'Excellent' : 
             analysis.overallScore >= 6 ? 'Good' : 
             analysis.overallScore >= 4 ? 'Needs Improvement' : 'Poor'}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${getScoreColor(analysis.engagementPrediction)}`}>
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{analysis.engagementPrediction}/10</div>
            <div className="text-sm text-gray-600">Engagement Prediction</div>
          </div>

          <div className="text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${getScoreColor(analysis.conversionPotential)}`}>
              <Target className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{analysis.conversionPotential}/10</div>
            <div className="text-sm text-gray-600">Conversion Potential</div>
          </div>

          <div className="text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${getScoreColor(analysis.psychologicalEffectiveness)}`}>
              <Brain className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{analysis.psychologicalEffectiveness}/10</div>
            <div className="text-sm text-gray-600">Psychology Score</div>
          </div>
        </div>

        {/* Stakeholder Scores */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Audience Appeal</h4>
          {renderStakeholderScores(analysis.audienceAlignment)}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <ThumbsUp className="w-4 h-4 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Strengths</h4>
          </div>
          
          <div className="space-y-3">
            {analysis.strengths.map((strength, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{strength}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <ThumbsDown className="w-4 h-4 text-red-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Areas for Improvement</h4>
          </div>
          
          <div className="space-y-3">
            {analysis.weaknesses.map((weakness, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{weakness}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Optimization Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Optimization Suggestions</h4>
              <p className="text-gray-600">AI-powered recommendations to improve your formula</p>
            </div>
            <div className="text-sm text-gray-500">
              {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="space-y-4">
            {suggestions
              .sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 }
                return priorityOrder[b.priority] - priorityOrder[a.priority]
              })
              .map((suggestion) => (
                <div 
                  key={suggestion.id} 
                  className={`border rounded-lg p-4 transition ${
                    appliedSuggestions.has(suggestion.id) 
                      ? 'bg-green-50 border-green-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        appliedSuggestions.has(suggestion.id) 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {appliedSuggestions.has(suggestion.id) ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          getSuggestionIcon(suggestion.type)
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h5 className="font-medium text-gray-900">{suggestion.title}</h5>
                          
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(suggestion.priority)}`}>
                            {suggestion.priority} priority
                          </span>
                          
                          <div className="flex items-center space-x-1 text-xs text-gray-600">
                            <TrendingUp className="w-3 h-3" />
                            <span>+{suggestion.expectedImpact}/10 impact</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 text-sm mb-3">{suggestion.description}</p>
                        
                        {expandedSuggestion === suggestion.id && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <h6 className="font-medium text-gray-900 mb-2">Implementation:</h6>
                            <p className="text-gray-700 text-sm">{suggestion.implementation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setExpandedSuggestion(
                          expandedSuggestion === suggestion.id ? null : suggestion.id
                        )}
                        className="text-gray-400 hover:text-gray-600 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {!appliedSuggestions.has(suggestion.id) && (
                        <button
                          onClick={() => handleApplySuggestion(suggestion)}
                          className="flex items-center space-x-1 bg-teal-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-teal-700 transition"
                        >
                          <span>Apply</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Analysis Metadata */}
      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-600">
          Analysis completed on {new Date(analysis.analysisTimestamp).toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Powered by Marcus AI • Results may vary based on audience and content
        </p>
      </div>
    </div>
  )
}
