'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Move, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  Target,
  Users,
  BarChart3,
  Save,
  Eye,
  Settings,
  ChevronUp,
  ChevronDown,
  Lightbulb
} from 'lucide-react'
import type { 
  EnhancedContentFormula, 
  FormulaSection, 
  CTAPlacement, 
  PsychologicalTrigger,
  FormulaBuilderProps,
  ValidationError,
  BuilderStep
} from '@/types/formulaTypes'

// Builder steps configuration
const BUILDER_STEPS: BuilderStep[] = [
  {
    id: 'basic_info',
    name: 'Basic Information',
    description: 'Name, description, and category',
    isComplete: false,
    isRequired: true
  },
  {
    id: 'sections',
    name: 'Formula Structure',
    description: 'Create and organize your content sections',
    isComplete: false,
    isRequired: true
  },
  {
    id: 'psychology',
    name: 'Psychological Triggers',
    description: 'Add persuasion and engagement elements',
    isComplete: false,
    isRequired: false
  },
  {
    id: 'ctas',
    name: 'Call-to-Actions',
    description: 'Configure CTAs and positioning',
    isComplete: false,
    isRequired: false
  },
  {
    id: 'review',
    name: 'Review & Save',
    description: 'Preview and finalize your formula',
    isComplete: false,
    isRequired: true
  }
]

export default function FormulaBuilder({ 
  baseFormula, 
  onSave, 
  onCancel, 
  onAnalyze 
}: FormulaBuilderProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formula, setFormula] = useState<EnhancedContentFormula>(() => {
    if (baseFormula) {
      return { ...baseFormula, id: '', isCustom: true, createdAt: new Date().toISOString() }
    }
    
    // Default new formula
    return {
      id: '',
      name: '',
      description: '',
      category: 'framework',
      difficulty: 'beginner',
      estimatedTime: '20 min',
      popularity: 0,
      isCustom: true,
      createdAt: new Date().toISOString(),
      sections: [],
      ctaPositions: [],
      psychologicalTriggers: [],
      usageCount: 0,
      stakeholderScores: { cfo: 5, cmo: 5, ceo: 5, vc: 5 },
      version: 1,
      tags: [],
      isPublic: false
    }
  })
  
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showAISuggestions, setShowAISuggestions] = useState<Record<number, boolean>>({})

  // Mark changes when formula is modified
  useEffect(() => {
    setHasUnsavedChanges(true)
  }, [formula])

  // Validation logic
  const validateCurrentStep = (): ValidationError[] => {
    const errors: ValidationError[] = []
    
    switch (BUILDER_STEPS[currentStep].id) {
      case 'basic_info':
        if (!formula.name.trim()) {
          errors.push({ field: 'name', message: 'Formula name is required', severity: 'error' })
        }
        if (!formula.description.trim()) {
          errors.push({ field: 'description', message: 'Description is required', severity: 'error' })
        }
        break
        
      case 'sections':
        if (formula.sections.length === 0) {
          errors.push({ field: 'sections', message: 'At least one section is required', severity: 'error' })
        }
        formula.sections.forEach((section, index) => {
          if (!section.title.trim()) {
            errors.push({ field: `section_${index}_title`, message: `Section ${index + 1} title is required`, severity: 'error' })
          }
        })
        break
    }
    
    return errors
  }

  const canProceedToNext = () => {
    const errors = validateCurrentStep()
    setValidationErrors(errors)
    return errors.filter(e => e.severity === 'error').length === 0
  }

  const nextStep = () => {
    if (canProceedToNext() && currentStep < BUILDER_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Section management
  const addSection = () => {
    const newSection: FormulaSection = {
      id: `section_${Date.now()}`,
      title: '',
      description: '',
      guidance: '',
      placeholder: '',
      position: formula.sections.length,
      isRequired: true,
      isCustom: true
    }
    
    setFormula(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }))
  }

  const updateSection = (index: number, updatedSection: FormulaSection) => {
    setFormula(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...updatedSection, position: i } : section
      )
    }))
  }

  const deleteSection = (index: number) => {
    setFormula(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index).map((section, i) => ({
        ...section,
        position: i
      }))
    }))
  }

  const moveSectionUp = (index: number) => {
    if (index > 0) {
      setFormula(prev => {
        const newSections = [...prev.sections]
        const temp = newSections[index]
        newSections[index] = newSections[index - 1]
        newSections[index - 1] = temp
        return {
          ...prev,
          sections: newSections.map((section, i) => ({ ...section, position: i }))
        }
      })
    }
  }

  const moveSectionDown = (index: number) => {
    if (index < formula.sections.length - 1) {
      setFormula(prev => {
        const newSections = [...prev.sections]
        const temp = newSections[index]
        newSections[index] = newSections[index + 1]
        newSections[index + 1] = temp
        return {
          ...prev,
          sections: newSections.map((section, i) => ({ ...section, position: i }))
        }
      })
    }
  }

  // CTA management
  const addCTA = () => {
    const newCTA: CTAPlacement = {
      id: `cta_${Date.now()}`,
      type: 'comment',
      position: 'end',
      text: 'What do you think?'
    }
    
    setFormula(prev => ({
      ...prev,
      ctaPositions: [...prev.ctaPositions, newCTA]
    }))
  }

  const updateCTA = (index: number, updatedCTA: CTAPlacement) => {
    setFormula(prev => ({
      ...prev,
      ctaPositions: prev.ctaPositions.map((cta, i) => 
        i === index ? updatedCTA : cta
      )
    }))
  }

  const deleteCTA = (index: number) => {
    setFormula(prev => ({
      ...prev,
      ctaPositions: prev.ctaPositions.filter((_, i) => i !== index)
    }))
  }

  // Handle save
  const handleSave = async () => {
    const allErrors = validateCurrentStep()
    if (allErrors.filter(e => e.severity === 'error').length > 0) {
      setValidationErrors(allErrors)
      return
    }

    try {
      const finalFormula = {
        ...formula,
        id: formula.id || `custom_${Date.now()}`,
        updatedAt: new Date().toISOString()
      }
      
      await onSave(finalFormula)
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Error saving formula:', error)
      // Handle error state
    }
  }

  // Handle analysis
  const handleAnalyze = async () => {
    if (!onAnalyze) return
    
    setIsAnalyzing(true)
    try {
      const analysis = await onAnalyze(formula)
      // Analysis results will be handled by parent component
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const renderStepContent = () => {
    switch (BUILDER_STEPS[currentStep].id) {
      case 'basic_info':
        return renderBasicInfoStep()
      case 'sections':
        return renderSectionsStep()
      case 'psychology':
        return renderPsychologyStep()
      case 'ctas':
        return renderCTAStep()
      case 'review':
        return renderReviewStep()
      default:
        return null
    }
  }

  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Formula Details</h3>
        
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formula Name *
            </label>
            <input
              type="text"
              value={formula.name}
              onChange={(e) => setFormula(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., My SaaS Growth Formula"
            />
            {validationErrors.find(e => e.field === 'name') && (
              <p className="text-red-600 text-sm mt-1">
                {validationErrors.find(e => e.field === 'name')?.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formula.description}
              onChange={(e) => setFormula(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Describe what this formula helps achieve..."
            />
            {validationErrors.find(e => e.field === 'description') && (
              <p className="text-red-600 text-sm mt-1">
                {validationErrors.find(e => e.field === 'description')?.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formula.category}
                onChange={(e) => setFormula(prev => ({ 
                  ...prev, 
                  category: e.target.value as EnhancedContentFormula['category']
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="story">Story-Based</option>
                <option value="data">Data-Driven</option>
                <option value="framework">Framework</option>
                <option value="lead-generation">Lead Generation</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={formula.difficulty}
                onChange={(e) => setFormula(prev => ({ 
                  ...prev, 
                  difficulty: e.target.value as EnhancedContentFormula['difficulty']
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Time
            </label>
            <input
              type="text"
              value={formula.estimatedTime}
              onChange={(e) => setFormula(prev => ({ ...prev, estimatedTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., 25 min"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderSectionsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Formula Structure</h3>
        <button
          onClick={addSection}
          className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Section</span>
        </button>
      </div>

      {validationErrors.find(e => e.field === 'sections') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">
            {validationErrors.find(e => e.field === 'sections')?.message}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {formula.sections.map((section, index) => (
          <div key={section.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <span className="text-sm text-gray-600">Section {index + 1}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => moveSectionUp(index)}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveSectionDown(index)}
                  disabled={index === formula.sections.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteSection(index)}
                  className="p-1 text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Title *
                </label>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSection(index, { ...section, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Hook - Problem Statement"
                />
                {validationErrors.find(e => e.field === `section_${index}_title`) && (
                  <p className="text-red-600 text-sm mt-1">
                    {validationErrors.find(e => e.field === `section_${index}_title`)?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={section.description}
                  onChange={(e) => updateSection(index, { ...section, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Brief description of this section"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placeholder Text
                </label>
                <input
                  type="text"
                  value={section.placeholder}
                  onChange={(e) => updateSection(index, { ...section, placeholder: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Example content for this section..."
                />
              </div>

              {/* AI Writing Suggestions - Collapsible */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg">
                <button
                  onClick={() => setShowAISuggestions(prev => ({ ...prev, [index]: !prev[index] }))}
                  className="w-full p-3 text-left flex items-center justify-between hover:bg-blue-100 transition"
                >
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">AI Writing Suggestions</span>
                  </div>
                  {showAISuggestions[index] ? (
                    <ChevronUp className="w-4 h-4 text-blue-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-blue-600" />
                  )}
                </button>
                
                {showAISuggestions[index] && (
                  <div className="px-3 pb-3 border-t border-blue-200">
                    <div className="bg-white rounded-lg p-3 mt-3">
                      <div className="text-sm text-gray-700">
                        <p className="font-medium text-blue-900 mb-2">Writing Guidance:</p>
                        <p className="text-blue-800 mb-3">
                          {section.guidance || "AI will provide contextual writing guidance based on your section title."}
                        </p>
                        
                        <div className="pt-2 border-t border-gray-100">
                          <p className="font-medium text-blue-900 mb-2">Quick Tips:</p>
                          <ul className="text-xs text-blue-700 space-y-1">
                            <li>• Start with a compelling hook to grab attention</li>
                            <li>• Use specific examples and data points</li>
                            <li>• End with a clear call-to-action</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {formula.sections.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h4>
          <p className="text-gray-600 mb-4">Start building your formula by adding sections</p>
          <button
            onClick={addSection}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition"
          >
            Add First Section
          </button>
        </div>
      )}
    </div>
  )

  const renderPsychologyStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Psychological Triggers</h3>
      <p className="text-gray-600">
        Coming soon: Add psychological triggers and persuasion elements to enhance engagement.
      </p>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <span className="text-blue-800 font-medium">AI Enhancement Ready</span>
        </div>
        <p className="text-blue-700 text-sm mt-1">
          This step will be connected to Marcus AI for automatic psychological optimization.
        </p>
      </div>
    </div>
  )

  const renderCTAStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Call-to-Actions</h3>
        <button
          onClick={addCTA}
          className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add CTA</span>
        </button>
      </div>

      <div className="space-y-4">
        {formula.ctaPositions.map((cta, index) => (
          <div key={cta.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">CTA {index + 1}</span>
              <button
                onClick={() => deleteCTA(index)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={cta.type}
                  onChange={(e) => updateCTA(index, { 
                    ...cta, 
                    type: e.target.value as CTAPlacement['type']
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="comment">Ask for Comment</option>
                  <option value="share">Ask for Share</option>
                  <option value="signup">Signup Link</option>
                  <option value="visit">Visit Link</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <select
                  value={cta.position}
                  onChange={(e) => updateCTA(index, { 
                    ...cta, 
                    position: e.target.value as CTAPlacement['position']
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="beginning">Beginning</option>
                  <option value="middle">Middle</option>
                  <option value="end">End</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CTA Text
              </label>
              <input
                type="text"
                value={cta.text}
                onChange={(e) => updateCTA(index, { ...cta, text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="What do you think about this approach?"
              />
            </div>

            {(cta.type === 'signup' || cta.type === 'visit') && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={cta.url || ''}
                  onChange={(e) => updateCTA(index, { ...cta, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="https://..."
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {formula.ctaPositions.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Users className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No CTAs configured</p>
          <button
            onClick={addCTA}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
          >
            Add First CTA
          </button>
        </div>
      )}
    </div>
  )

  const renderReviewStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Review Your Formula</h3>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid gap-4">
          <div>
            <h4 className="font-medium text-gray-900">{formula.name}</h4>
            <p className="text-gray-600 text-sm">{formula.description}</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Category:</span>
              <span className="ml-2 capitalize">{formula.category}</span>
            </div>
            <div>
              <span className="text-gray-500">Difficulty:</span>
              <span className="ml-2 capitalize">{formula.difficulty}</span>
            </div>
            <div>
              <span className="text-gray-500">Time:</span>
              <span className="ml-2">{formula.estimatedTime}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Structure ({formula.sections.length} sections)</h4>
        <div className="space-y-2">
          {formula.sections.map((section, index) => (
            <div key={section.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <div>
                <span className="font-medium text-gray-900">{section.title}</span>
                {section.description && (
                  <p className="text-gray-600 text-sm">{section.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {formula.ctaPositions.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">CTAs ({formula.ctaPositions.length})</h4>
          <div className="space-y-2">
            {formula.ctaPositions.map((cta, index) => (
              <div key={cta.id} className="p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 capitalize">{cta.type}</span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-sm text-gray-600">{cta.position}</span>
                <p className="text-sm text-gray-800 mt-1">"{cta.text}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {onAnalyze && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">AI Analysis Available</h4>
              <p className="text-blue-700 text-sm">Get insights and optimization suggestions</p>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <BarChart3 className="w-4 h-4" />
              <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Formula'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {baseFormula ? 'Customize Formula' : 'Create Formula'}
          </h1>
          {baseFormula && (
            <p className="text-gray-600">Based on: {baseFormula.name}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {hasUnsavedChanges && (
            <span className="text-sm text-amber-600 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>Unsaved changes</span>
            </span>
          )}
          
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          
          {currentStep === BUILDER_STEPS.length - 1 && (
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Formula</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {BUILDER_STEPS.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition ${
                index === currentStep 
                  ? 'bg-teal-600 border-teal-600 text-white'
                  : index < currentStep
                  ? 'bg-teal-100 border-teal-600 text-teal-600'
                  : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}>
                {index < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${
                  index === currentStep ? 'text-teal-600' : 'text-gray-600'
                }`}>
                  {step.name}
                </p>
                <p className="text-xs text-gray-500 max-w-20">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep) / (BUILDER_STEPS.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={previousStep}
          disabled={currentStep === 0}
          className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {currentStep < BUILDER_STEPS.length - 1 ? (
          <button
            onClick={nextStep}
            className="flex items-center space-x-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Complete & Save</span>
          </button>
        )}
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-2">Please fix the following:</h4>
          <ul className="space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index} className="text-red-700 text-sm flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
