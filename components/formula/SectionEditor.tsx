'use client'

import { useState, useRef } from 'react'
import { 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Settings, 
  Brain, 
  Type, 
  Target, 
  Clock, 
  Eye, 
  EyeOff, 
  HelpCircle, 
  Lightbulb,
  Move,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import type { 
  FormulaSection, 
  EnhancedContentFormula,
  SectionEditorProps,
  ConditionalRule
} from '@/types/formulaTypes'

export default function SectionEditor({
  section,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  formula
}: SectionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)

  const getContextualTips = (section: FormulaSection): string[] => {
  const title = section.title.toLowerCase()
  
  if (title.includes('hook') || title.includes('intro') || title.includes('opening')) {
    return [
      'Start with a surprising statistic or counterintuitive statement',
      'Ask a provocative question your audience is thinking',
      'Share a brief personal anecdote that relates to the topic'
    ]
  }
  
  if (title.includes('problem') || title.includes('pain') || title.includes('challenge')) {
    return [
      'Be specific about the pain point - avoid generic statements',
      'Use "you" language to make it personal and relatable',
      'Quantify the impact when possible (time, money, stress)'
    ]
  }
  
  if (title.includes('solution') || title.includes('method') || title.includes('framework')) {
    return [
      'Break down complex ideas into simple, actionable steps',
      'Use numbered lists or bullet points for clarity',
      'Include a real example of the solution in action'
    ]
  }
  
  if (title.includes('result') || title.includes('outcome') || title.includes('conclusion')) {
    return [
      'Use specific metrics and measurable outcomes',
      'Connect back to the original problem you identified',
      'End with a clear next step or call-to-action'
    ]
  }
  
  if (title.includes('cta') || title.includes('call') || title.includes('action')) {
    return [
      'Make the desired action crystal clear and specific',
      'Create urgency without being pushy',
      'Offer value in exchange for engagement'
    ]
  }
  
  // Default tips for any section
  return [
    'Keep your audience engaged with conversational tone',
    'Use specific examples rather than abstract concepts',
    'Focus on one main idea per section'
  ]
}

const getExampleContent = (section: FormulaSection): string => {
  const title = section.title.toLowerCase()
  
  if (title.includes('hook') || title.includes('intro') || title.includes('opening')) {
    return 'Example: "87% of SaaS companies are making this one critical pricing mistake that\'s costing them millions in ARR..."'
  }
  
  if (title.includes('problem') || title.includes('pain') || title.includes('challenge')) {
    return 'Example: "You\'re spending 3+ hours every week manually reconciling financial data that should take 15 minutes..."'
  }
  
  if (title.includes('solution') || title.includes('method') || title.includes('framework')) {
    return 'Example: "Here\'s the 3-step framework I use: 1) Audit current process 2) Identify bottlenecks 3) Implement automation..."'
  }
  
  if (title.includes('result') || title.includes('outcome') || title.includes('conclusion')) {
    return 'Example: "Result: We reduced our month-end close from 12 days to 3 days, saving 40+ hours per month..."'
  }
  
  if (title.includes('cta') || title.includes('call') || title.includes('action')) {
    return 'Example: "What\'s your biggest challenge with financial reporting? Share in the comments - I\'ll personally respond with specific advice."'
  }
  
  return 'Example: "This reminds me of when we first implemented this approach at our company..."'
}
  
  const updateSection = (updates: Partial<FormulaSection>) => {
    onChange({ ...section, ...updates })
  }

  const addConditionalRule = (type: 'showIf' | 'hideIf') => {
    const newRule: ConditionalRule = {
      field: '',
      operator: 'equals',
      value: ''
    }
    
    updateSection({
      [type]: [...(section[type] || []), newRule]
    })
  }

  const updateConditionalRule = (
    type: 'showIf' | 'hideIf', 
    index: number, 
    updates: Partial<ConditionalRule>
  ) => {
    const rules = section[type] || []
    const updatedRules = rules.map((rule, i) => 
      i === index ? { ...rule, ...updates } : rule
    )
    updateSection({ [type]: updatedRules })
  }

  const removeConditionalRule = (type: 'showIf' | 'hideIf', index: number) => {
    const rules = section[type] || []
    updateSection({ [type]: rules.filter((_, i) => i !== index) })
  }

  const getSectionValidation = () => {
    const errors = []
    const warnings = []

    if (!section.title.trim()) {
      errors.push('Section title is required')
    }
    
    if (!section.guidance.trim()) {
      warnings.push('Consider adding writing guidance for better user experience')
    }

    if (!section.placeholder.trim()) {
      warnings.push('Placeholder text helps users understand expectations')
    }

    if (section.wordCountTarget && section.wordCountTarget < 10) {
      warnings.push('Word count target seems very low')
    }

    return { errors, warnings }
  }

  const validation = getSectionValidation()

  const getStatusIcon = () => {
    if (validation.errors.length > 0) {
      return <AlertCircle className="w-4 h-4 text-red-500" />
    }
    if (validation.warnings.length > 0) {
      return <HelpCircle className="w-4 h-4 text-yellow-500" />
    }
    return <CheckCircle2 className="w-4 h-4 text-green-500" />
  }

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <div 
      ref={dragRef}
      className={`bg-white border rounded-xl shadow-sm transition-all duration-200 ${
        isDragging ? 'shadow-lg scale-105 opacity-75' : 'border-gray-200'
      } ${isExpanded ? 'shadow-md' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Section Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Drag Handle */}
            <div className="cursor-move text-gray-400 hover:text-gray-600">
              <Move className="w-4 h-4" />
            </div>

            {/* Position Number */}
            <div className="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-sm font-medium">
              {section.position + 1}
            </div>

            {/* Section Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className={`font-medium ${section.title ? 'text-gray-900' : 'text-gray-400'}`}>
                  {section.title || 'Untitled Section'}
                </h4>
                {getStatusIcon()}
                {section.isRequired && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    Required
                  </span>
                )}
                {section.isCustom && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    Custom
                  </span>
                )}
              </div>
              {section.description && (
                <p className="text-sm text-gray-600 mt-1">{section.description}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            {/* Move Buttons */}
            <button
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move up"
            >
              <ChevronUp className="w-4 h-4" />
            </button>

            <button
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move down"
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Expand/Collapse */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            {/* Advanced Settings */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`p-2 rounded-lg transition ${
                showAdvanced 
                  ? 'text-teal-600 bg-teal-50' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
              title="Advanced settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              onClick={onDelete}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              title="Delete section"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Validation Messages */}
        {(validation.errors.length > 0 || validation.warnings.length > 0) && (
          <div className="mt-3 space-y-1">
            {validation.errors.map((error, index) => (
              <div key={`error-${index}`} className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-3 h-3" />
                <span>{error}</span>
              </div>
            ))}
            {validation.warnings.map((warning, index) => (
              <div key={`warning-${index}`} className="flex items-center space-x-2 text-yellow-600 text-sm">
                <HelpCircle className="w-3 h-3" />
                <span>{warning}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Basic Information */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Title *
              </label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSection({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="e.g., Hook - Problem Statement"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={section.description}
                onChange={(e) => updateSection({ description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Brief description of this section's purpose"
              />
            </div>

            {/* AI Writing Suggestions - Collapsible */}
<div className="bg-blue-50 border border-blue-200 rounded-lg">
  <button
    onClick={() => setShowAISuggestions(!showAISuggestions)}
    className="w-full p-4 text-left flex items-center justify-between hover:bg-blue-100 transition"
  >
    <div className="flex items-center space-x-2">
      <Lightbulb className="w-4 h-4 text-blue-600" />
      <span className="text-sm font-medium text-blue-900">AI Writing Suggestions</span>
    </div>
    {showAISuggestions ? (
      <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600" />
    )}
  </button>
  
  {showAISuggestions && (
    <div className="px-4 pb-4 border-t border-blue-200">
      <div className="bg-white rounded-lg p-3 mt-3">
        <div className="text-sm text-gray-700 space-y-2">
          <p className="font-medium text-blue-900">Writing Guidance:</p>
          <p className="text-blue-800">
            {section.guidance || "AI suggestions will appear here based on your section type and content goals."}
          </p>
          
          {/* Example suggestions - you can make these dynamic later */}
         <div className="mt-3 pt-3 border-t border-gray-100">
  <p className="font-medium text-blue-900 mb-2">Smart Tips for "{section.title}":</p>
  <ul className="text-xs text-blue-700 space-y-1">
    {getContextualTips(section).map((tip, index) => (
      <li key={index}>• {tip}</li>
    ))}
  </ul>
  
  <div className="mt-3 p-2 bg-gray-50 rounded border">
    <p className="text-xs font-medium text-gray-700 mb-1">Example Content:</p>
    <p className="text-xs text-gray-600 italic">{getExampleContent(section)}</p>
  </div>
</div>
        </div>
      </div>
    </div>
  )}
</div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Placeholder/Example Text
              </label>
              <textarea
                value={section.placeholder}
                onChange={(e) => updateSection({ placeholder: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Example content that users will see as a starting point..."
              />
            </div>
          </div>

          {/* Psychology Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-blue-600" />
              <label className="text-sm font-medium text-blue-900">
                Psychology Note
              </label>
            </div>
            <textarea
              value={section.psychologyNote || ''}
              onChange={(e) => updateSection({ psychologyNote: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              placeholder="Explain the psychological principle behind this section..."
            />
            <p className="text-xs text-blue-700 mt-1">
              This helps users understand why this section is effective and how to leverage it.
            </p>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="border-t border-gray-200 pt-4 space-y-4">
              <h5 className="font-medium text-gray-900 flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Advanced Settings</span>
              </h5>

              {/* Section Requirements */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={section.isRequired}
                      onChange={(e) => updateSection({ isRequired: e.target.checked })}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">Required section</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Target word count
                  </label>
                  <input
                    type="number"
                    value={section.wordCountTarget || ''}
                    onChange={(e) => updateSection({ 
                      wordCountTarget: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500"
                    placeholder="50"
                    min="1"
                  />
                </div>
              </div>

              {/* Tone Guidance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tone Guidance
                </label>
                <select
                  value={section.toneGuidance || ''}
                  onChange={(e) => updateSection({ toneGuidance: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">No specific tone</option>
                  <option value="professional">Professional</option>
                  <option value="conversational">Conversational</option>
                  <option value="authoritative">Authoritative</option>
                  <option value="empathetic">Empathetic</option>
                  <option value="urgent">Urgent</option>
                  <option value="inspiring">Inspiring</option>
                </select>
              </div>

              {/* Conditional Logic */}
              <div className="space-y-3">
                <h6 className="text-sm font-medium text-gray-700">Conditional Logic</h6>
                
                {/* Show If Rules */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Show section if:
                    </label>
                    <button
                      onClick={() => addConditionalRule('showIf')}
                      className="text-xs text-teal-600 hover:text-teal-700 flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add rule</span>
                    </button>
                  </div>
                  
                  {(section.showIf || []).map((rule, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <select
                        value={rule.field}
                        onChange={(e) => updateConditionalRule('showIf', index, { field: e.target.value })}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="">Select field</option>
                        <option value="category">Category</option>
                        <option value="difficulty">Difficulty</option>
                        <option value="stakeholder">Target stakeholder</option>
                      </select>

                      <select
                        value={rule.operator}
                        onChange={(e) => updateConditionalRule('showIf', index, { 
                          operator: e.target.value as ConditionalRule['operator']
                        })}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="equals">equals</option>
                        <option value="not_equals">not equals</option>
                        <option value="contains">contains</option>
                      </select>

                      <input
                        type="text"
                        value={rule.value}
                        onChange={(e) => updateConditionalRule('showIf', index, { value: e.target.value })}
                        className="text-xs border border-gray-300 rounded px-2 py-1 flex-1"
                        placeholder="value"
                      />

                      <button
                        onClick={() => removeConditionalRule('showIf', index)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Hide If Rules */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Hide section if:
                    </label>
                    <button
                      onClick={() => addConditionalRule('hideIf')}
                      className="text-xs text-teal-600 hover:text-teal-700 flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add rule</span>
                    </button>
                  </div>
                  
                  {(section.hideIf || []).map((rule, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <select
                        value={rule.field}
                        onChange={(e) => updateConditionalRule('hideIf', index, { field: e.target.value })}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="">Select field</option>
                        <option value="category">Category</option>
                        <option value="difficulty">Difficulty</option>
                        <option value="stakeholder">Target stakeholder</option>
                      </select>

                      <select
                        value={rule.operator}
                        onChange={(e) => updateConditionalRule('hideIf', index, { 
                          operator: e.target.value as ConditionalRule['operator']
                        })}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="equals">equals</option>
                        <option value="not_equals">not equals</option>
                        <option value="contains">contains</option>
                      </select>

                      <input
                        type="text"
                        value={rule.value}
                        onChange={(e) => updateConditionalRule('hideIf', index, { value: e.target.value })}
                        className="text-xs border border-gray-300 rounded px-2 py-1 flex-1"
                        placeholder="value"
                      />

                      <button
                        onClick={() => removeConditionalRule('hideIf', index)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
