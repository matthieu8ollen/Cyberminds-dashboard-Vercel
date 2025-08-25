'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Eye, 
  Sparkles, 
  BookOpen,
  Target,
  BarChart3,
  Users,
  Heart,
  Mic,
  ChevronLeft,
  ChevronRight,
  Brain,
  Lightbulb,
  Edit3,
  Wand2
} from 'lucide-react'
import { useContent } from '../../contexts/ContentContext'
import { useToast } from '../ToastNotifications'
import { GeneratedContent } from '../../lib/supabase'

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

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

interface SectionData {
  id: string
  title: string
  content: string
  guidance: string
  placeholder: string
  completed: boolean
  wordCountTarget?: number
  wordCountMin?: number
  psychologyNote?: string
  emotionalTarget?: string
  isRequired?: boolean
  contentChecks: string[]
  completedChecks: string[]
}

interface TemplateVariable {
  name: string
  label: string
  value: string
  aiSuggestion?: string
  required: boolean
  type: 'text' | 'textarea'
  placeholder: string
}

interface ContentCheck {
  id: string
  label: string
  completed: boolean
  description: string
}

interface WritingGuidanceTab {
  id: string
  label: string
  icon: any
  content: string[]
  active: boolean
}

interface WritingInterfaceProps {
  formula: FormulaTemplate
  onBack: () => void
  onComplete: (content: string) => void
  ideationData?: {
    topic?: string
    angle?: string
    takeaways?: string[]
  }
  initialContent?: string
  backendExample?: {
    example_post?: string
    section_examples?: Record<string, string>
    tips_and_guidance?: string[]
    template_variables?: Record<string, string>
    // NEW: Support for structured guidance response
    response_type?: string
    writing_guidance_sections?: any[]
    total_sections?: string
    guidance_types_found?: string[]
    extraction_metadata?: any
    processing_status?: string
    conversation_stage?: string
  }
  generatedExample?: {
    generated_content?: string
    full_post?: string
    linkedin_ready?: string
    timestamp?: number
  }
  inStrictWorkflow?: boolean
  onExitWorkflow?: () => void
  onContinueToImages?: (contentId: string) => void
}

type PreviewMode = 'auto' | 'template' | 'example'
type GuidanceTabId = 'matters' | 'essentials' | 'techniques' | 'reader' | 'arc' | 'voice'

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function WritingInterface({
  formula,
  onBack,
  onComplete,
  ideationData,
  initialContent,
  backendExample,
  generatedExample,
  inStrictWorkflow = false,
  onExitWorkflow,
  onContinueToImages
}: WritingInterfaceProps) {
  const { saveDraft } = useContent()
  const { showToast } = useToast()

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('auto')
  const [activeGuidanceTab, setActiveGuidanceTab] = useState<GuidanceTabId>('matters')
  
  // Content State
  const [sections, setSections] = useState<SectionData[]>([])
  const [templateVariables, setTemplateVariables] = useState<TemplateVariable[]>([])
  const [contentChecks, setContentChecks] = useState<ContentCheck[]>([])
  
  // Auto-flicker for preview
  const [autoFlickerIndex, setAutoFlickerIndex] = useState(0)

  // ============================================================================
// DEBUG LOGGING
// ============================================================================

// Debug structured guidance data
useEffect(() => {
  if (backendExample?.writing_guidance_sections) {
    console.log('📝 Structured Guidance Received:', {
      response_type: backendExample.response_type,
      total_sections: backendExample.total_sections,
      guidance_types_found: backendExample.guidance_types_found,
      sections_count: backendExample.writing_guidance_sections.length,
      sections_preview: backendExample.writing_guidance_sections.map((s: any) => ({
        section_name: s.section_name,
        guidance_types: s.guidance_types,
        keys: Object.keys(s)
      }))
    })
  }
}, [backendExample])

  // ============================================================================
// STRUCTURED GUIDANCE HELPERS
// ============================================================================

// Extract guidance from structured backend response
const extractGuidanceFromStructured = (structuredSection: any): string => {
  if (!structuredSection) return ''
  
  const guidanceElements: string[] = []
  
  // Extract different types of guidance based on backend response format
  Object.keys(structuredSection).forEach(key => {
    if (key.includes('guidance') && structuredSection[key]) {
      const guidanceData = structuredSection[key]
      if (typeof guidanceData === 'string') {
        guidanceElements.push(guidanceData)
      } else if (typeof guidanceData === 'object') {
        // Extract nested guidance fields
        Object.keys(guidanceData).forEach(subKey => {
          if (guidanceData[subKey] && typeof guidanceData[subKey] === 'string') {
            guidanceElements.push(`${subKey}: ${guidanceData[subKey]}`)
          }
        })
      }
    }
  })
  
  return guidanceElements.join('\n\n') || ''
}

// Extract content examples from structured response
const extractContentFromStructured = (structuredSection: any, sectionTitle: string): string => {
  if (!structuredSection) return ''
  
  // Look for content examples in various formats
  if (structuredSection.content_example) return structuredSection.content_example
  if (structuredSection.example_content) return structuredSection.example_content
  if (structuredSection.sample_content) return structuredSection.sample_content
  
  // Check for section-specific content
  const titleKey = sectionTitle.toLowerCase().replace(/\s+/g, '_')
  if (structuredSection[titleKey]) return structuredSection[titleKey]
  
  return ''
}

// ============================================================================
// INITIALIZATION
// ============================================================================

  // Initialize sections from formula structure
useEffect(() => {
  const initializedSections: SectionData[] = formula.structure.map((step, index) => {
    const [title, guidance] = step.includes(' - ') ? step.split(' - ') : [step, '']
    const cleanTitle = title.trim()
    
    // Find matching structured guidance section by name or order
    const structuredGuidance = backendExample?.writing_guidance_sections?.find(
      (section: any) => 
        section.section_name === cleanTitle || 
        section.section_order === index ||
        section.section_id === `section-${index}`
    )
    
    // Extract structured content and guidance
    const structuredGuidanceText = extractGuidanceFromStructured(structuredGuidance)
    const structuredContent = extractContentFromStructured(structuredGuidance, cleanTitle)
    
    return {
      id: `section-${index}`,
      title: cleanTitle,
      // Prioritize structured content, then legacy format, then empty
      content: structuredContent || backendExample?.section_examples?.[cleanTitle] || '',
      // Prioritize structured guidance, then legacy, then default
      guidance: structuredGuidanceText || guidance || getGuidanceForSection(formula.id, cleanTitle, index),
      placeholder: getPlaceholderForSection(formula.id, cleanTitle, index),
      completed: false,
      wordCountTarget: getWordCountTarget(cleanTitle),
      wordCountMin: Math.floor(getWordCountTarget(cleanTitle) * 0.7),
      psychologyNote: getPsychologyNote(cleanTitle),
      emotionalTarget: getEmotionalTarget(cleanTitle),
      isRequired: isRequiredSection(cleanTitle),
      contentChecks: getContentChecks(cleanTitle),
      completedChecks: []
    }
  })
  
  setSections(initializedSections)
}, [formula, backendExample])
  
  // Initialize template variables
  useEffect(() => {
    const variables = extractTemplateVariables(formula, ideationData, backendExample)
    setTemplateVariables(variables)
  }, [formula, ideationData, backendExample])

  // Initialize content checks
  useEffect(() => {
    const checks = initializeContentChecks(formula.category)
    setContentChecks(checks)
  }, [formula.category])

  // Auto-flicker effect for preview mode
  useEffect(() => {
    if (previewMode === 'auto') {
      const interval = setInterval(() => {
        setAutoFlickerIndex(prev => (prev + 1) % 2) // 0 = template, 1 = example
      }, 2000)
      
      return () => clearInterval(interval)
    }
  }, [previewMode])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const currentSection = sections[currentSectionIndex]
  const overallProgress = sections.filter(s => s.completed).length
  const totalSections = sections.length
  const progressPercentage = (overallProgress / totalSections) * 100

  const completedContentChecks = contentChecks.filter(check => check.completed).length
  const totalContentChecks = contentChecks.length

  const assembledContent = useMemo(() => {
    return sections
      .filter(section => section.content.trim())
      .map(section => section.content.trim())
      .join('\n\n')
  }, [sections])

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  function getGuidanceForSection(formulaId: string, title: string, index: number): string {
    const guidanceMap: Record<string, string> = {
      'Hook': 'Create an attention-grabbing opening that stops the scroll. Use specific details, questions, or contrarian statements.',
      'Problem': 'Identify a specific pain point your audience faces. Make it relatable and urgent.',
      'Framework': 'Present your systematic approach. Use numbered steps or clear structure.',
      'Solution': 'Provide actionable advice that directly addresses the problem.',
      'CTA': 'End with a question or call-to-action that encourages engagement.',
      'Context': 'Set the scene for your story. Help readers understand the situation.',
      'Learning': 'Extract the key lesson or insight from your experience.',
      'Evidence': 'Support your position with data, examples, or specific details.'
    }
    
    return guidanceMap[title] || `Write compelling content for your ${title.toLowerCase()} section.`
  }

  function getPlaceholderForSection(formulaId: string, title: string, index: number): string {
    const currentVar = templateVariables.find(v => v.name.toLowerCase().includes(title.toLowerCase()))
    if (currentVar?.aiSuggestion) {
      return currentVar.aiSuggestion
    }
    
    return `Write your ${title.toLowerCase()} here... Focus on providing value to your audience.`
  }

  function getWordCountTarget(title: string): number {
    const targetMap: Record<string, number> = {
      'Hook': 30,
      'Problem': 50,
      'Framework': 100,
      'Solution': 80,
      'CTA': 25,
      'Context': 60,
      'Learning': 40
    }
    
    return targetMap[title] || 50
  }

  function getPsychologyNote(title: string): string {
    const psychologyMap: Record<string, string> = {
      'Hook': 'Use pattern interrupts and curiosity gaps to capture attention',
      'Problem': 'Trigger pain points and create urgency for solution',
      'Framework': 'Provide structure and reduce cognitive load',
      'Solution': 'Offer clear path forward and build confidence'
    }
    
    return psychologyMap[title] || 'Focus on connecting with your audience emotionally'
  }

  function getEmotionalTarget(title: string): string {
    const emotionMap: Record<string, string> = {
      'Hook': 'Curiosity, Intrigue',
      'Problem': 'Concern, Recognition',
      'Framework': 'Confidence, Clarity',
      'Solution': 'Relief, Hope'
    }
    
    return emotionMap[title] || 'Engagement'
  }

  function isRequiredSection(title: string): boolean {
    return ['Hook', 'Problem', 'Solution', 'CTA'].includes(title)
  }

  function getContentChecks(title: string): string[] {
    const checksMap: Record<string, string[]> = {
      'Hook': ['Specific details', 'Attention-grabbing', 'Relevant to audience'],
      'Problem': ['Clear pain point', 'Relatable situation', 'Creates urgency'],
      'Framework': ['Numbered steps', 'Logical flow', 'Actionable guidance'],
      'Solution': ['Specific advice', 'Directly addresses problem', 'Easy to implement']
    }
    
    return checksMap[title] || ['Clear message', 'Value provided', 'Engaging content']
  }

  function extractTemplateVariables(
    formula: FormulaTemplate, 
    ideationData?: any, 
    backendExample?: any
  ): TemplateVariable[] {
    // Extract variables from formula structure and backend suggestions
    const variables: TemplateVariable[] = []
    
    if (formula.category === 'story') {
      variables.push(
        {
          name: 'THEME',
          label: 'Main Theme',
          value: ideationData?.topic || '',
          aiSuggestion: backendExample?.template_variables?.THEME || 'Your main topic or theme',
          required: true,
          type: 'text',
          placeholder: 'e.g., VC funding vs Bootstrap'
        },
        {
          name: 'PERSONAL_EXPERIENCE',
          label: 'Personal Experience',
          value: '',
          aiSuggestion: backendExample?.template_variables?.PERSONAL_EXPERIENCE || 'Your relevant experience',
          required: true,
          type: 'text',
          placeholder: 'e.g., experienced both paths'
        }
      )
    } else if (formula.category === 'framework') {
      variables.push(
        {
          name: 'PROBLEM_AREA',
          label: 'Problem Area',
          value: ideationData?.topic || '',
          aiSuggestion: backendExample?.template_variables?.PROBLEM_AREA || 'The problem you solve',
          required: true,
          type: 'text',
          placeholder: 'e.g., SaaS pricing strategy'
        },
        {
          name: 'FRAMEWORK_NAME',
          label: 'Framework Name',
          value: '',
          aiSuggestion: backendExample?.template_variables?.FRAMEWORK_NAME || 'Your framework name',
          required: true,
          type: 'text',
          placeholder: 'e.g., The 5-Step Revenue Framework'
        }
      )
    }
    
    return variables
  }

  function initializeContentChecks(category: string): ContentCheck[] {
    const baseChecks: ContentCheck[] = [
      {
        id: 'theme_contrast',
        label: 'Theme contrast',
        completed: false,
        description: 'Clear differentiation of perspectives or approaches'
      },
      {
        id: 'personal_element',
        label: 'Personal element',
        completed: false,
        description: 'Includes personal experience or perspective'
      },
      {
        id: 'value_promise',
        label: 'Value promise',
        completed: false,
        description: 'Clear value proposition for the reader'
      },
      {
        id: 'specific_details',
        label: 'Specific details',
        completed: false,
        description: 'Concrete examples and specific information'
      },
      {
        id: 'emotional_hook',
        label: 'Emotional hook',
        completed: false,
        description: 'Emotionally engaging content that resonates'
      }
    ]
    
    return baseChecks
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSectionChange = useCallback((content: string) => {
    setSections(prev => prev.map((section, index) => {
      if (index === currentSectionIndex) {
        const wordCount = content.trim().split(/\s+/).length
        const completed = content.trim().length > 20 && wordCount >= (section.wordCountMin || 10)
        
        // Update content checks
        const updatedChecks = section.contentChecks.filter(check => 
          content.toLowerCase().includes(check.toLowerCase())
        )
        
        return {
          ...section,
          content,
          completed,
          completedChecks: updatedChecks
        }
      }
      return section
    }))
  }, [currentSectionIndex])

  const handleTemplateVariableChange = useCallback((name: string, value: string) => {
    setTemplateVariables(prev => prev.map(variable => 
      variable.name === name ? { ...variable, value } : variable
    ))
  }, [])

  const handleSectionNavigation = useCallback((sectionIndex: number) => {
    if (sectionIndex >= 0 && sectionIndex < sections.length) {
      setCurrentSectionIndex(sectionIndex)
    }
  }, [sections.length])

  const handlePreviousSection = useCallback(() => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
    }
  }, [currentSectionIndex])

  const handleNextSection = useCallback(() => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
    }
  }, [currentSectionIndex, sections.length])

  const handlePreview = useCallback(() => {
    if (assembledContent.trim()) {
      onComplete(assembledContent)
    } else {
      showToast('warning', 'Please add some content before previewing')
    }
  }, [assembledContent, onComplete, showToast])

  const handleAIAnalysis = useCallback(async () => {
    // TODO: Implement AI analysis call
    showToast('info', 'AI analysis feature coming soon')
  }, [showToast])

  const handleEnhanceSection = useCallback(async () => {
    // TODO: Implement AI enhancement call
    showToast('info', 'AI enhancement feature coming soon')
  }, [showToast])

  // Workflow handlers
  const handleSaveAndExit = useCallback(async () => {
    if (!assembledContent.trim()) {
      showToast('warning', 'Please add some content before saving')
      return
    }

    try {
      const contentData: Omit<GeneratedContent, 'id' | 'created_at'> = {
        user_id: '',
        content_text: assembledContent,
        content_type: 'framework',
        tone_used: 'professional',
        prompt_input: formula?.name || 'Content Formula',
        is_saved: true,
        title: formula?.name,
        status: 'draft'
      }
      
      const saved = await saveDraft(contentData, 'marcus')
      
      if (saved) {
        showToast('success', 'Content saved to Production Pipeline!')
        if (onExitWorkflow) {
          onExitWorkflow()
        }
      }
    } catch (error) {
      showToast('error', 'Failed to save content')
    }
  }, [assembledContent, formula, saveDraft, showToast, onExitWorkflow])

  const handleContinueToImages = useCallback(async () => {
    if (!assembledContent.trim()) {
      showToast('warning', 'Please add some content before continuing')
      return
    }

    try {
      const contentData: Omit<GeneratedContent, 'id' | 'created_at'> = {
        user_id: '',
        content_text: assembledContent,
        content_type: 'framework',
        tone_used: 'professional',
        prompt_input: formula?.name || 'Content Formula',
        is_saved: true,
        title: formula?.name,
        status: 'draft'
      }
      
      const saved = await saveDraft(contentData, 'marcus')
      
      if (saved && onContinueToImages) {
        showToast('success', 'Content saved! Adding image...')
        onContinueToImages(saved.id)
      }
    } catch (error) {
      showToast('error', 'Failed to save content')
    }
  }, [assembledContent, formula, saveDraft, showToast, onContinueToImages])

  // Real-time content validation
  useEffect(() => {
    const checkContent = () => {
      const content = assembledContent.toLowerCase()
      
      setContentChecks(prev => prev.map(check => {
        let completed = false
        
        switch (check.id) {
          case 'theme_contrast':
            completed = content.includes('vs') || content.includes('versus') || content.includes('but') || content.includes('however')
            break
          case 'personal_element':
            completed = content.includes('i ') || content.includes('my ') || content.includes('we ') || content.includes('our ')
            break
          case 'value_promise':
            completed = content.includes('learn') || content.includes('discover') || content.includes('get') || content.includes('find out')
            break
          case 'specific_details':
            completed = /\d+/.test(content) || content.includes('%') || content.includes('$')
            break
          case 'emotional_hook':
            completed = content.includes('?') || content.includes('!') || content.includes('secret') || content.includes('mistake')
            break
        }
        
        return { ...check, completed }
      }))
    }
    
    checkContent()
  }, [assembledContent])

  // ============================================================================
  // GUIDANCE TAB CONTENT
  // ============================================================================

  const guidanceTabs: WritingGuidanceTab[] = [
  {
    id: 'matters',
    label: 'Why This Matters',
    icon: Brain,
    active: activeGuidanceTab === 'matters',
    content: (() => {
      const structuredContent: string[] = []
      
      // Extract psychological insights from structured guidance
      if (backendExample?.writing_guidance_sections) {
        backendExample.writing_guidance_sections.forEach((section: any) => {
          // Look for psychology-related guidance
          Object.keys(section).forEach(key => {
            if (key.includes('psychology') || key.includes('why_it_works') || key.includes('impact')) {
              const value = section[key]
              if (typeof value === 'string' && value.trim()) {
                structuredContent.push(value)
              } else if (typeof value === 'object' && value.explanation) {
                structuredContent.push(value.explanation)
              }
            }
          })
        })
      }
      
      // Include general guidance types found
      if (backendExample?.guidance_types_found?.length > 0) {
        structuredContent.push(`Guidance available: ${backendExample.guidance_types_found.join(', ')}`)
      }
      
      // Fallback to default content if no structured data
      return structuredContent.length > 0 ? structuredContent : [
        'This creates an "insider secret" promise. Your audience desperately wants validation that they\'re not missing critical knowledge.',
        'By saying "what they don\'t tell you," you position yourself as the truth-teller who\'s seen behind the curtain.',
        'This psychological trigger of "insider knowledge" makes readers feel they\'re getting exclusive information.',
        backendExample?.tips_and_guidance?.[0] || 'Focus on the psychological impact of your message.'
      ]
    })()
  },
  {
    id: 'essentials',
    label: 'Story Essentials',
    icon: Target,
    active: activeGuidanceTab === 'essentials',
    content: (() => {
      const structuredEssentials: string[] = []
      
      // Extract essential guidance from structured response
      if (backendExample?.writing_guidance_sections) {
        backendExample.writing_guidance_sections.forEach((section: any) => {
          Object.keys(section).forEach(key => {
            if (key.includes('essential') || key.includes('requirement') || key.includes('must_include')) {
              const value = section[key]
              if (typeof value === 'string') {
                structuredEssentials.push(`✓ ${value}`)
              } else if (Array.isArray(value)) {
                value.forEach(item => structuredEssentials.push(`✓ ${item}`))
              }
            }
          })
        })
      }
      
      return structuredEssentials.length > 0 ? structuredEssentials : [
        '✓ Personal stakes - What did you have to lose?',
        '✓ Specific moment - When exactly did this happen?',
        '✓ Emotional state - How did you feel?',
        '✓ Clear outcome - What was the result?',
        '✓ Universal lesson - What can others learn?'
      ]
    })()
  },
    {
      id: 'techniques',
      label: 'Writing Techniques',
      icon: Edit3,
      active: activeGuidanceTab === 'techniques',
      content: [
        'Use present tense for immediate scenes: "I walk into the meeting room..."',
        'Include sensory details: sounds, sights, physical sensations',
        'Show don\'t tell: "My hands were shaking" vs "I was nervous"',
        'Use specific numbers and details for credibility',
        'End sections with transition hooks to maintain flow'
      ]
    },
    {
      id: 'reader',
      label: 'Know Your Reader',
      icon: Users,
      active: activeGuidanceTab === 'reader',
      content: [
        `Your audience: ${formula.category === 'story' ? 'Professionals who have faced similar challenges' : 'People looking for structured solutions'}`,
        'They want: Practical insights they can immediately apply',
        'They fear: Making costly mistakes or missing opportunities',
        'They value: Authentic experiences and proven frameworks',
        ideationData?.angle ? `Your angle: ${ideationData.angle}` : 'Connect with their current situation'
      ]
    },
    {
      id: 'arc',
      label: 'Emotional Arc',
      icon: Heart,
      active: activeGuidanceTab === 'arc',
      content: [
        '1. Hook: Curiosity and intrigue',
        '2. Problem: Recognition and concern',
        '3. Stakes: Tension and investment',
        '4. Solution: Relief and hope',
        '5. Outcome: Satisfaction and learning',
        'Each section should build emotional momentum toward the resolution'
      ]
    },
    {
      id: 'voice',
      label: 'Voice & Tone',
      icon: Mic,
      active: activeGuidanceTab === 'voice',
      content: [
        'Conversational but professional',
        'Confident without being arrogant',
        'Vulnerable about mistakes, strong about lessons learned',
        'Use contractions: "don\'t" not "do not"',
        'Avoid jargon unless your audience expects it',
        'Write like you\'re talking to a colleague over coffee'
      ]
    }
  ]

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderSidebar = () => (
    <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
      sidebarCollapsed ? 'w-16' : 'w-80'
    }`}>
      {/* Sidebar Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        {!sidebarCollapsed && (
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">{formula.name}</h2>
            <p className="text-sm text-gray-600">Section {currentSectionIndex + 1} of {totalSections}</p>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Progress Bar */}
      {!sidebarCollapsed && (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">{overallProgress}/{totalSections}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex mt-2 space-x-1">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`w-3 h-3 rounded-full ${
                  section.completed 
                    ? 'bg-green-500' 
                    : index === currentSectionIndex 
                      ? 'bg-blue-500' 
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Section Navigation */}
      <div className="flex-1 overflow-y-auto">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => handleSectionNavigation(index)}
            className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
              index === currentSectionIndex ? 'bg-teal-50 border-l-4 border-l-teal-600' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                section.completed 
                  ? 'bg-green-500 text-white' 
                  : index === currentSectionIndex 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
              }`}>
                {section.completed ? '✓' : index + 1}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{section.title}</div>
                  <div className="text-xs text-gray-500">
                    {section.content.trim().split(/\s+/).length} words
                    {section.wordCountTarget && ` / ${section.wordCountTarget} target`}
                  </div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  const renderCurrentSectionHeader = () => (
    <div className="border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{currentSection?.title}</h1>
          <p className="text-gray-600 mt-1">{currentSection?.guidance}</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>
    </div>
  )

  const renderContentChecklist = () => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Content Checklist</h3>
        <span className="text-sm font-medium text-gray-600">
          {completedContentChecks}/{totalContentChecks} 
        </span>
      </div>
      <div className="space-y-2">
        {contentChecks.map((check) => (
          <div key={check.id} className="flex items-center space-x-2">
            <CheckCircle className={`w-4 h-4 ${check.completed ? 'text-green-500' : 'text-gray-300'}`} />
            <span className={`text-sm ${check.completed ? 'text-green-700' : 'text-gray-600'}`}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  const renderTemplateVariables = () => (
    <div className="mb-6">
      <h3 className="font-semibold text-gray-900 mb-4">Template Variables</h3>
      <div className="space-y-4">
        {templateVariables.map((variable) => (
          <div key={variable.name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {variable.label} {variable.required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input
                type="text"
                value={variable.value}
                onChange={(e) => handleTemplateVariableChange(variable.name, e.target.value)}
                placeholder={variable.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              {variable.aiSuggestion && !variable.value && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    🤖 AI
                  </span>
                </div>
              )}
            </div>
            {variable.aiSuggestion && (
              <button
                onClick={() => handleTemplateVariableChange(variable.name, variable.aiSuggestion!)}
                className="mt-1 text-xs text-purple-600 hover:text-purple-800"
              >
                Use suggestion: "{variable.aiSuggestion}"
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderLivePreview = () => {
    const getPreviewContent = () => {
      if (previewMode === 'template') {
        return sections.map(s => s.placeholder).join('\n\n')
      } else if (previewMode === 'example') {
        return backendExample?.example_post || sections.map(s => s.placeholder).join('\n\n')
      } else {
        // Auto mode - flicker between template and current content
        if (assembledContent.trim()) {
          return assembledContent
        } else {
          return autoFlickerIndex === 0 
            ? sections.map(s => s.placeholder).join('\n\n')
            : backendExample?.example_post || "Here's what they don't tell you about VC funding vs Bootstrap until you experienced both paths..."
        }
      }
    }

    const wordCount = getPreviewContent().trim().split(/\s+/).length
    const variableCount = templateVariables.filter(v => v.value.trim()).length

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Live Preview</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewMode('auto')}
              className={`px-3 py-1 text-xs rounded-lg transition ${
                previewMode === 'auto' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => setPreviewMode('template')}
              className={`px-3 py-1 text-xs rounded-lg transition ${
                previewMode === 'template' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Template
            </button>
            <button
              onClick={() => setPreviewMode('example')}
              className={`px-3 py-1 text-xs rounded-lg transition ${
                previewMode === 'example' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Example
            </button>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 min-h-32 mb-3">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {getPreviewContent()}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>📏 {wordCount} words</span>
          <span>📝 Variables: {variableCount}/{templateVariables.length}</span>
        </div>
      </div>
    )
  }

  const renderWritingGuidanceTabs = () => (
    <div className="mb-6">
      <div className="border-b border-gray-200 mb-4">
        <div className="flex overflow-x-auto space-x-1">
          {guidanceTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveGuidanceTab(tab.id as GuidanceTabId)}
              className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab.active 
                  ? 'border-teal-500 text-teal-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
        {guidanceTabs.find(tab => tab.active)?.content.map((item, index) => (
          <div key={index} className="text-sm text-gray-700 mb-2 last:mb-0">
            {item}
          </div>
        ))}
      </div>
    </div>
  )

  const renderAIButtons = () => (
    <div className="flex space-x-3 mb-6">
      <button
        onClick={handleAIAnalysis}
        className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
      >
        <Brain className="w-4 h-4" />
        <span>🤖 Analyze Tone & Style</span>
      </button>
      <button
        onClick={handleEnhanceSection}
        className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition"
      >
        <Wand2 className="w-4 h-4" />
        <span>✨ Enhance This Section</span>
      </button>
    </div>
  )

  const renderWritingArea = () => (
    <div className="mb-6">
      <textarea
        value={currentSection?.content || ''}
        onChange={(e) => handleSectionChange(e.target.value)}
        placeholder={currentSection?.placeholder || 'Start writing...'}
        className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
        style={{ fontSize: '16px', lineHeight: '1.6' }}
      />
      
      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
        <span>
          {currentSection?.content.trim().split(/\s+/).filter(w => w).length || 0} words
          {currentSection?.wordCountTarget && ` / ${currentSection.wordCountTarget} target`}
        </span>
        <span>
          {currentSection?.psychologyNote}
        </span>
      </div>
    </div>
  )

  const renderNavigationButtons = () => (
    <div className="flex items-center justify-between">
      <button
        onClick={handlePreviousSection}
        disabled={currentSectionIndex === 0}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
          currentSectionIndex === 0 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Previous</span>
      </button>
      
      <div className="flex space-x-3">
        <button
          onClick={handlePreview}
          className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition"
        >
          Preview
        </button>
        
        <button
          onClick={handleNextSection}
          disabled={currentSectionIndex === sections.length - 1}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
            currentSectionIndex === sections.length - 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          }`}
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  const renderWorkflowActions = () => {
    if (!inStrictWorkflow) return null

    return (
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-t border-teal-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="font-semibold text-teal-900">Complete Your Content</h3>
              <p className="text-sm text-teal-700">Save your work and continue your workflow</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveAndExit}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
            >
              <span>💾 Save & Exit Workflow</span>
            </button>
            <button
              onClick={handleContinueToImages}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              <span>🖼️ Add Image</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (!currentSection) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      {renderSidebar()}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        {renderCurrentSectionHeader()}
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div>
                {renderContentChecklist()}
                {renderTemplateVariables()}
                {renderWritingArea()}
                {renderAIButtons()}
                {renderNavigationButtons()}
              </div>
              
              {/* Right Column */}
              <div>
                {renderLivePreview()}
                {renderWritingGuidanceTabs()}
              </div>
            </div>
          </div>
        </div>
        
        {/* Workflow Actions */}
        {renderWorkflowActions()}
      </div>
    </div>
  )
}
