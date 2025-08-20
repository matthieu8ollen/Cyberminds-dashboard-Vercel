'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle, Lightbulb, Zap, Eye, Save, Calendar } from 'lucide-react'
import AIAssistant from './AIAssistant'
import { getContentFormulas, type ContentFormula, type FormulaSection } from '../../lib/supabase'

interface FormulaTemplate {
  id: string
  name: string
  description: string
  structure: string[]
  example: string
}

interface WritingInterfaceProps {
  formula: FormulaTemplate
  onBack: () => void
  onComplete: (content: string) => void
  ideationData?: any
  initialContent?: string
}

interface SectionData {
  title: string
  content: string
  guidance: string
  placeholder: string
  completed: boolean
  wordCountTarget?: number
  psychologyNote?: string
  emotionalTarget?: string
  isRequired?: boolean
  templateVariables?: Record<string, any>
  hasTemplateVariables?: boolean
}

interface TemplateVariable {
  name: string
  type: string
  required: boolean
  description: string
  value?: string
}

export default function WritingInterface({ formula, onBack, onComplete, ideationData, initialContent }: WritingInterfaceProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [sections, setSections] = useState<SectionData[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({})
  const [showTemplateHelper, setShowTemplateHelper] = useState(false)

  // Initialize sections based on formula
useEffect(() => {
  // If we have initial content, try to split it and populate sections
  if (initialContent) {
    const contentSections = initialContent.split('\n\n').filter(section => section.trim())
    const populatedSections = formula.structure.map((step, index) => {
      const [title, guidance] = step.includes(' - ') ? step.split(' - ') : [step, '']
      
      return {
        title,
        content: contentSections[index] || '',
        guidance: getGuidanceForSection(formula.id, title, index),
        placeholder: getPlaceholderForSection(formula.id, title, index),
        completed: contentSections[index] ? contentSections[index].trim().length > 20 : false
      }
    })
    
    setSections(populatedSections)
    return
  }
  
  // Load real section data from database for this formula
  const loadRealSectionData = async () => {
    try {
      const { data } = await getContentFormulas()
      const currentFormula = data?.find(f => f.id === formula.id)
      
      if (currentFormula?.formula_sections) {
        const sortedSections = currentFormula.formula_sections.sort((a: FormulaSection, b: FormulaSection) => a.section_order - b.section_order)
        
        const realSections = sortedSections.map((section, index) => {
          let parsedVariables = null
          let hasVariables = false
          
          // Parse template variables if they exist
          if (section.template_variables) {
            try {
              parsedVariables = typeof section.template_variables === 'string' 
                ? JSON.parse(section.template_variables) 
                : section.template_variables
              hasVariables = Object.keys(parsedVariables).length > 0
            } catch (error) {
              console.warn('Failed to parse template variables:', error)
            }
          }
          
          return {
            title: section.section_name,
            content: '',
            guidance: section.section_guidelines || "Write this section with your authentic voice and specific examples.",
            placeholder: section.section_template || `Write your ${section.section_name.toLowerCase()} here...`,
            completed: false,
            wordCountTarget: section.word_count_target,
            psychologyNote: section.psychological_purpose,
            emotionalTarget: section.emotional_target,
            isRequired: section.is_required,
            templateVariables: parsedVariables,
            hasTemplateVariables: hasVariables
          }
        })
        
        setSections(realSections)
        return
      }
    } catch (error) {
      console.error('Failed to load real section data:', error)
    }
    
    // Fallback to formula structure
    const fallbackSections = formula.structure.map((step, index) => {
      const [title, guidance] = step.includes(' - ') ? step.split(' - ') : [step, '']
      
      return {
        title,
        content: '',
        guidance: guidance || "Write this section with your authentic voice and specific examples.",
        placeholder: `Write your ${title.toLowerCase()} here...`,
        completed: false
      }
    })
    
    setSections(fallbackSections)
  }
  
  loadRealSectionData()
}, [formula, initialContent])

  const getGuidanceForSection = (formulaId: string, title: string, index: number): string => {
    // Use real section data if available
    const currentSection = sections[index]
    if (currentSection?.guidance) {
      return currentSection.guidance
    }
    
    // Fallback guidance based on section title
    if (title.toLowerCase().includes('hook') || title.toLowerCase().includes('opener')) {
      return "Create a compelling opening that stops the scroll. Make it specific, relatable, and attention-grabbing."
    }
    if (title.toLowerCase().includes('cta') || title.toLowerCase().includes('call to action')) {
      return "End with a natural call-to-action that encourages engagement. Ask a specific question related to your content."
    }
    if (title.toLowerCase().includes('proof') || title.toLowerCase().includes('evidence')) {
      return "Provide credible evidence, data, or examples that support your main point. Be specific and cite sources when possible."
    }
    
    return "Write this section with your authentic voice and specific examples. Focus on providing value to your audience."
  }
  
  const getPlaceholderForSection = (formulaId: string, title: string, index: number): string => {
    // Use real section template if available
    const currentSection = sections[index]
    if (currentSection?.placeholder) {
      return currentSection.placeholder
    }
    
    return `Write your ${title.toLowerCase()} here...`
  }
  
  const handleSectionChange = (content: string) => {
    setSections(prev => prev.map((section, index) => 
      index === currentSectionIndex 
        ? { ...section, content, completed: content.trim().length > 20 }
        : section
    ))
  }

  const parseTemplateVariables = (template: string): TemplateVariable[] => {
    const variableRegex = /\[([^\]]+)\]/g
    const variables: TemplateVariable[] = []
    let match

    while ((match = variableRegex.exec(template)) !== null) {
      const variableName = match[1]
      if (!variables.find(v => v.name === variableName)) {
        variables.push({
          name: variableName,
          type: 'string',
          required: true,
          description: `Value for ${variableName}`,
          value: templateVariables[variableName] || ''
        })
      }
    }

    return variables
  }

  const applyTemplateVariables = (template: string, variables: Record<string, string>): string => {
    let result = template
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\[${key}\\]`, 'g')
      result = result.replace(regex, value || `[${key}]`)
    })
    return result
  }

  const handleTemplateVariableChange = (variableName: string, value: string) => {
    setTemplateVariables(prev => ({
      ...prev,
      [variableName]: value
    }))

    // Auto-update current section content if it uses this variable
    const currentSection = sections[currentSectionIndex]
    if (currentSection?.hasTemplateVariables) {
      const updatedTemplate = applyTemplateVariables(currentSection.placeholder, {
        ...templateVariables,
        [variableName]: value
      })
      handleSectionChange(updatedTemplate)
    }
  }

  const renderTemplateHelper = () => {
    const currentSection = sections[currentSectionIndex]
    if (!currentSection?.hasTemplateVariables) return null

    const variables = parseTemplateVariables(currentSection.placeholder)
    if (variables.length === 0) return null

    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h4 className="text-sm font-medium text-purple-900">Template Variables</h4>
          </div>
          <button
            onClick={() => setShowTemplateHelper(!showTemplateHelper)}
            className="text-purple-600 hover:text-purple-800 text-sm"
          >
            {showTemplateHelper ? 'Hide' : 'Show'} Helper
          </button>
        </div>

        {showTemplateHelper && (
          <div className="space-y-3">
            <p className="text-xs text-purple-700 mb-3">
              Fill in these variables to auto-populate your template:
            </p>
            
            {variables.map(variable => (
              <div key={variable.name}>
                <label className="block text-xs font-medium text-purple-800 mb-1">
                  {variable.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  {variable.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type="text"
                  value={templateVariables[variable.name] || ''}
                  onChange={(e) => handleTemplateVariableChange(variable.name, e.target.value)}
                  placeholder={variable.description}
                  className="w-full px-3 py-2 text-sm border border-purple-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            ))}

            <button
              onClick={() => {
                const populatedTemplate = applyTemplateVariables(currentSection.placeholder, templateVariables)
                handleSectionChange(populatedTemplate)
              }}
              className="w-full mt-3 px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition"
            >
              Apply Template
            </button>
          </div>
        )}
      </div>
    )
  }

  const goToNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
    }
  }

  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
    }
  }

  const generateFullContent = (): string => {
    return sections.map(section => section.content).filter(content => content.trim()).join('\n\n')
  }

  const handlePreview = () => {
    setShowPreview(true)
  }

  const handleComplete = () => {
    const fullContent = generateFullContent()
    onComplete(fullContent)
  }

  const completedSections = sections.filter(section => section.completed).length
  const progress = (completedSections / sections.length) * 100

  if (sections.length === 0) {
    return <div>Loading...</div>
  }

  const currentSection = sections[currentSectionIndex]

  if (showPreview) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Preview</h1>
            <p className="text-gray-600">Review your content before finishing</p>
          </div>
          <button
            onClick={() => setShowPreview(false)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Editing</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {generateFullContent()}
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setShowPreview(false)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Continue Editing
          </button>
          <button
            onClick={handleComplete}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Complete & Save</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{formula.name}</h1>
          <p className="text-gray-600">Section {currentSectionIndex + 1} of {sections.length}</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Template</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{completedSections} of {sections.length} sections completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Sidebar - Section Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sections</h3>
            <div className="space-y-3">
              {sections.map((section, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSectionIndex(index)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    index === currentSectionIndex
                      ? 'bg-teal-50 border-2 border-teal-200 text-teal-900'
                      : section.completed
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{index + 1}. {section.title}</span>
                        {section.isRequired === false && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Optional</span>
                        )}
                      </div>
                      <div className="text-xs mt-1 opacity-75">
                        {section.content ? (
                          <span>
                            {section.content.length} chars
                            {section.wordCountTarget && (
                              <span className="ml-1">
                                • ~{Math.round(section.content.split(' ').filter(word => word.length > 0).length)}/{section.wordCountTarget} words
                              </span>
                            )}
                          </span>
                        ) : (
                          'Not started'
                        )}
                      </div>
                    </div>
                    {section.completed && (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                {currentSection.title}
              </h2>
              
              {/* Template Variables Helper */}
              {renderTemplateHelper()}

              {/* Enhanced Guidance with Rich Metadata */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="w-full">
                    <p className="text-sm font-medium text-blue-900 mb-1">Marcus's Guidance:</p>
                    <p className="text-sm text-blue-800 mb-3">{currentSection.guidance}</p>
                    
                    {/* Rich Metadata Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 pt-3 border-t border-blue-200">
                      {currentSection.wordCountTarget && (
                        <div className="text-xs">
                          <span className="font-medium text-blue-900">Target Length:</span>
                          <span className="text-blue-700 ml-1">{currentSection.wordCountTarget} words</span>
                        </div>
                      )}
                      
                      {currentSection.psychologyNote && (
                        <div className="text-xs">
                          <span className="font-medium text-blue-900">Psychology:</span>
                          <span className="text-blue-700 ml-1">{currentSection.psychologyNote}</span>
                        </div>
                      )}
                      
                      {currentSection.emotionalTarget && (
                        <div className="text-xs">
                          <span className="font-medium text-blue-900">Emotional Goal:</span>
                          <span className="text-blue-700 ml-1">{currentSection.emotionalTarget}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Writing Area */}
              <div className="mb-6">
                <textarea
                  value={currentSection.content}
                  onChange={(e) => handleSectionChange(e.target.value)}
                  placeholder={currentSection.placeholder}
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-vertical"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>
                    {currentSection.content.length} characters
                    {currentSection.wordCountTarget && (
                      <span className="ml-2">
                        (~{Math.round(currentSection.content.split(' ').filter(word => word.length > 0).length)} / {currentSection.wordCountTarget} words)
                      </span>
                    )}
                  </span>
                  <span>
                    {currentSection.isRequired === false ? (
                      <span className="text-blue-600">Optional section</span>
                    ) : (
                      <span>Required section</span>
                    )}
                  </span>
                </div>
              </div>

             {/* AI Suggestions */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-teal-600" />
                  <span>Marcus's AI Suggestions</span>
                </h4>
                <AIAssistant
                  content={currentSection.content}
                  sectionType={currentSection.title}
                  formulaId={formula.id}
                  onApplySuggestion={(suggestion) => {
                    // Apply suggestion to content
                    const improvedContent = currentSection.content + '\n\n' + suggestion
                    handleSectionChange(improvedContent)
                  }}
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={goToPreviousSection}
                disabled={currentSectionIndex === 0}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                  currentSectionIndex === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={handlePreview}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>

                {currentSectionIndex === sections.length - 1 ? (
                  <button
                    onClick={handleComplete}
                    disabled={completedSections < sections.length}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition ${
                      completedSections < sections.length
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Complete</span>
                  </button>
                ) : (
                  <button
                    onClick={goToNextSection}
                    className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
