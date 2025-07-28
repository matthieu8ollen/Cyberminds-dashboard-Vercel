'use client'

import { useState, useEffect } from 'react'
import { Zap, TrendingUp, Target, Eye, Lightbulb, AlertCircle } from 'lucide-react'

interface AISuggestion {
  type: 'improvement' | 'warning' | 'tip' | 'performance'
  icon: any
  title: string
  message: string
  action?: string
  severity: 'low' | 'medium' | 'high'
}

interface AIAssistantProps {
  content: string
  sectionType: string
  formulaId: string
  onApplySuggestion?: (suggestion: string) => void
}

export default function AIAssistant({ content, sectionType, formulaId, onApplySuggestion }: AIAssistantProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Analyze content and generate suggestions
  useEffect(() => {
    if (content.length > 10) {
      setIsAnalyzing(true)
      
      // Simulate AI analysis delay
      const timer = setTimeout(() => {
        const newSuggestions = generateSuggestions(content, sectionType, formulaId)
        setSuggestions(newSuggestions)
        setIsAnalyzing(false)
      }, 800)

      return () => clearTimeout(timer)
    } else {
      setSuggestions([])
    }
  }, [content, sectionType, formulaId])

  const generateSuggestions = (text: string, section: string, formula: string): AISuggestion[] => {
    const suggestions: AISuggestion[] = []

    // Length-based suggestions
    if (text.length < 50) {
      suggestions.push({
        type: 'tip',
        icon: Target,
        title: 'Add More Detail',
        message: 'This section could be more impactful with specific examples or numbers.',
        severity: 'medium'
      })
    }

    // Hook-specific suggestions
    if (section.toLowerCase().includes('admission') || section.toLowerCase().includes('hook')) {
      if (!hasNumbers(text)) {
        suggestions.push({
          type: 'improvement',
          icon: TrendingUp,
          title: 'Add Specific Numbers',
          message: 'Hooks with specific numbers get 34% more engagement. Consider adding a timeframe, cost, or metric.',
          action: 'Add a specific number like "$50K" or "6 months"',
          severity: 'high'
        })
      }

      if (!hasEmotionalWords(text)) {
        suggestions.push({
          type: 'improvement',
          icon: Target,
          title: 'Strengthen Emotional Impact',
          message: 'Consider using more decisive language to grab attention.',
          action: 'Try words like "biggest mistake", "nearly destroyed", or "hardest lesson"',
          severity: 'medium'
        })
      }
    }

    // Context/setup suggestions
    if (section.toLowerCase().includes('context') || section.toLowerCase().includes('setup')) {
      if (!hasRelatable elements(text)) {
        suggestions.push({
          type: 'tip',
          icon: Lightbulb,
          title: 'Make It Relatable',
          message: 'Help readers think "I would have done the same thing" by explaining your reasoning.',
          severity: 'medium'
        })
      }
    }

    // Consequence/problem suggestions
    if (section.toLowerCase().includes('consequence') || section.toLowerCase().includes('problem')) {
      if (!hasSpecificImpact(text)) {
        suggestions.push({
          type: 'improvement',
          icon: AlertCircle,
          title: 'Quantify the Impact',
          message: 'Specific costs and timelines make the consequences more visceral.',
          action: 'Add details like "cost us $X", "took 6 months", or "lost 3 clients"',
          severity: 'high'
        })
      }
    }

    // Learning/insight suggestions
    if (section.toLowerCase().includes('learning') || section.toLowerCase().includes('insight')) {
      if (!hasActionableAdvice(text)) {
        suggestions.push({
          type: 'tip',
          icon: Target,
          title: 'Make It Actionable',
          message: 'Transform your lesson into advice others can implement.',
          action: 'Start with "The key is..." or "Now I always..."',
          severity: 'medium'
        })
      }
    }

    // CTA suggestions
    if (section.toLowerCase().includes('cta') || section.toLowerCase().includes('question')) {
      if (isGenericCTA(text)) {
        suggestions.push({
          type: 'improvement',
          icon: TrendingUp,
          title: 'Make CTA More Specific',
          message: 'Specific questions get 45% more responses than generic ones.',
          action: 'Instead of "What do you think?", ask about their specific experience',
          severity: 'high'
        })
      }
    }

    // Performance predictions
    if (text.length > 100) {
      const score = calculateEngagementScore(text, section, formula)
      suggestions.push({
        type: 'performance',
        icon: Eye,
        title: `Engagement Score: ${score}/100`,
        message: getPerformanceMessage(score),
        severity: score > 70 ? 'low' : score > 50 ? 'medium' : 'high'
      })
    }

    // Readability suggestions
    if (hasReadabilityIssues(text)) {
      suggestions.push({
        type: 'warning',
        icon: AlertCircle,
        title: 'Improve Readability',
        message: 'Consider breaking up long sentences for better mobile reading.',
        severity: 'low'
      })
    }

    return suggestions.slice(0, 3) // Limit to 3 suggestions to avoid overwhelm
  }

  // Helper functions for content analysis
  const hasNumbers = (text: string): boolean => {
    return /\d+/.test(text)
  }

  const hasEmotionalWords = (text: string): boolean => {
    const emotionalWords = ['biggest', 'hardest', 'worst', 'best', 'destroyed', 'failed', 'succeeded', 'transformed']
    return emotionalWords.some(word => text.toLowerCase().includes(word))
  }

  const hasRelatableElements = (text: string): boolean => {
    const relatablePatterns = ['i thought', 'seemed like', 'made sense', 'felt right', 'believed']
    return relatablePatterns.some(pattern => text.toLowerCase().includes(pattern))
  }

  const hasSpecificImpact = (text: string): boolean => {
    const impactWords = ['cost', 'lost', 'took', 'months', 'weeks', 'days', '$', '%']
    return impactWords.some(word => text.toLowerCase().includes(word))
  }

  const hasActionableAdvice = (text: string): boolean => {
    const actionablePatterns = ['now i', 'always', 'never', 'key is', 'secret is', 'rule']
    return actionablePatterns.some(pattern => text.toLowerCase().includes(pattern))
  }

  const isGenericCTA = (text: string): boolean => {
    const genericPatterns = ['what do you think', 'thoughts?', 'agree?', 'comments?']
    return genericPatterns.some(pattern => text.toLowerCase().includes(pattern))
  }

  const calculateEngagementScore = (text: string, section: string, formula: string): number => {
    let score = 50 // Base score

    // Length optimization
    if (text.length >= 100 && text.length <= 300) score += 10
    if (text.length > 300) score -= 5

    // Numbers boost engagement
    if (hasNumbers(text)) score += 15

    // Emotional language
    if (hasEmotionalWords(text)) score += 10

    // Question format (for CTAs)
    if (text.includes('?')) score += 5

    // Specific details
    if (hasSpecificImpact(text)) score += 10

    // Cap at 100
    return Math.min(score, 100)
  }

  const getPerformanceMessage = (score: number): string => {
    if (score >= 80) return 'Excellent! This content should perform very well.'
    if (score >= 60) return 'Good engagement potential. Consider the suggestions below.'
    if (score >= 40) return 'Moderate performance expected. Try implementing suggestions.'
    return 'Low engagement predicted. Consider major revisions.'
  }

  const hasReadabilityIssues = (text: string): boolean => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length
    return avgLength > 120 // Average sentence longer than 120 characters
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50 text-red-800'
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-800'
      case 'low': return 'border-blue-200 bg-blue-50 text-blue-800'
      default: return 'border-gray-200 bg-gray-50 text-gray-800'
    }
  }

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case 'improvement': return 'text-green-600'
      case 'warning': return 'text-red-600'
      case 'tip': return 'text-blue-600'
      case 'performance': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  if (content.length <= 10) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">Start writing to get AI-powered suggestions</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {isAnalyzing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-800">Marcus is analyzing your content...</span>
          </div>
        </div>
      )}

      {suggestions.map((suggestion, index) => {
        const Icon = suggestion.icon
        return (
          <div
            key={index}
            className={`border rounded-lg p-4 ${getSeverityColor(suggestion.severity)}`}
          >
            <div className="flex items-start space-x-3">
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${getSeverityIcon(suggestion.type)}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-1">{suggestion.title}</p>
                <p className="text-sm mb-2">{suggestion.message}</p>
                
                {suggestion.action && (
                  <div className="bg-white/50 rounded px-3 py-2 text-xs">
                    <strong>Try this:</strong> {suggestion.action}
                  </div>
                )}
                
                {onApplySuggestion && suggestion.action && (
                  <button
                    onClick={() => onApplySuggestion(suggestion.action!)}
                    className="mt-2 text-xs font-medium hover:underline"
                  >
                    Apply suggestion →
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
