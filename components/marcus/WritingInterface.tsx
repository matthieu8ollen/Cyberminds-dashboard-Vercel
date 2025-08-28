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
  Wand2,
  X
} from 'lucide-react'
import { useContent } from '../../contexts/ContentContext'
import { useToast } from '../ToastNotifications'
import { GeneratedContent } from '../../lib/supabase'
import AIContentOverlay from './AIContentOverlay'
import ContentPreview from './ContentPreview'
import WritingSidebar from './WritingSidebar'

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
  sections?: Array<{
    id: string
    section_name?: string
    title?: string
    template_variables?: string
    section_purpose?: string
    description?: string
    section_order?: number
  }>
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
  backendData?: any // Store complete backend section for section-specific guidance
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
  contentData?: {
    guidance?: any
    generatedContent?: any
  } | null
  inStrictWorkflow?: boolean
  onExitWorkflow?: () => void
  onContinueToImages?: (contentId: string) => void
}

type PreviewMode = 'template' | 'example'
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
  contentData,
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
const [currentView, setCurrentView] = useState<'writing' | 'preview'>('writing')
const [previewMode, setPreviewMode] = useState<PreviewMode>('template')
const [activeGuidanceTab, setActiveGuidanceTab] = useState<GuidanceTabId>('matters')
const [showAIOverlay, setShowAIOverlay] = useState(false)
const [showFullDraftModal, setShowFullDraftModal] = useState(false)
  
  // Content State
const [sections, setSections] = useState<SectionData[]>([])
const [templateVariables, setTemplateVariables] = useState<TemplateVariable[]>([])
const [contentChecks, setContentChecks] = useState<ContentCheck[]>([])
const [showTemplateVariables, setShowTemplateVariables] = useState(true)

  // Computed values - DECLARED IMMEDIATELY AFTER STATE
  const currentSection = sections[currentSectionIndex]
  const totalSections = sections.length
  const overallProgress = sections.filter(s => s.completed).length
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
// DEBUG LOGGING
// ============================================================================

// Single content data analysis
useEffect(() => {
  if (contentData) {
    console.log('✅ Consolidated content data received:', {
      hasGuidance: !!contentData.guidance,
      hasGeneratedContent: !!contentData.generatedContent,
      guidanceSections: contentData.guidance?.writing_guidance_sections?.length || 0,
      generatedPostLength: contentData.generatedContent?.generated_content?.complete_post?.length || 0
    })
  }
}, [contentData])

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

  // Initialize sections from formula structure with consolidated data
useEffect(() => {
  const initializedSections: SectionData[] = formula.structure.map((step, index) => {
    const [title, guidance] = step.includes(' - ') ? step.split(' - ') : [step, '']
    const cleanTitle = title.trim()
    
    // Find matching backend section by section_order (1-based matching to 0-based index)
    const backendSection = contentData?.guidance?.writing_guidance_sections?.find(
      (section: any) => section.section_order === (index + 1)
    )
    
    // Store complete backend section data for guidance tabs
    const sectionBackendData = backendSection || null
    
    // Extract structured content and guidance
    const structuredGuidanceText = extractGuidanceFromStructured(backendSection)
    const structuredContent = extractContentFromStructured(backendSection, cleanTitle)
    
    return {
      id: backendSection?.section_id || `section-${index}`,
      title: backendSection?.section_name || cleanTitle, // Use backend section_name if available
      content: structuredContent || '',
      guidance: structuredGuidanceText || guidance || getGuidanceForSection(formula.id, cleanTitle, index),
      placeholder: getTemplatePlaceholder(cleanTitle, formula, index),
      completed: false,
      wordCountTarget: getWordCountTarget(cleanTitle),
      wordCountMin: Math.floor(getWordCountTarget(cleanTitle) * 0.7),
      psychologyNote: getPsychologyNote(cleanTitle),
      emotionalTarget: getEmotionalTarget(cleanTitle),
      isRequired: isRequiredSection(cleanTitle),
      contentChecks: getContentChecks(cleanTitle),
      completedChecks: [],
      backendData: sectionBackendData // Store complete backend section for section-specific guidance
    }
  })
  
  setSections(initializedSections)
}, [formula, contentData])
  
 // Initialize template variables - section-specific
useEffect(() => {
  if (currentSection?.title) {
    console.log('🔍 TEMPLATE VARIABLE LOADING DEBUG:')
    console.log('📊 Current Section Index:', currentSectionIndex)
    console.log('📝 Current Section Title:', currentSection.title)
    console.log('📋 Formula Object Keys:', Object.keys(formula))
    console.log('📊 Formula Sections Available:', !!formula.sections, formula.sections?.length || 0)
    
    if (formula.sections && formula.sections[currentSectionIndex]) {
      const currentDbSection = formula.sections[currentSectionIndex]
      console.log('🎯 Current Database Section:')
      console.log('  - Section Name:', currentDbSection.title || currentDbSection.section_name)
      console.log('  - Template Variables:', currentDbSection.template_variables)
      console.log('  - Section Purpose:', currentDbSection.section_purpose || currentDbSection.description)
      console.log('  - All Section Keys:', Object.keys(currentDbSection))
    } else {
      console.log('❌ No database section found for index:', currentSectionIndex)
    }
    
    const variables = extractTemplateVariables(
      formula, 
      currentSection.title, 
      ideationData, 
      contentData
    )
    setTemplateVariables(variables)
    
    console.log('📤 FINAL VARIABLES OUTPUT:')
    console.log('  - Count:', variables.length)
    console.log('  - Variable Names:', variables.map(v => v.name))
    console.log('  - First Variable Full:', variables[0])
  } else {
    setTemplateVariables([])
  }
}, [formula, currentSection?.title, ideationData, contentData, currentSectionIndex])

  // Initialize content checks
  useEffect(() => {
    const checks = initializeContentChecks(formula.category)
    setContentChecks(checks)
  }, [formula.category])

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
  return getTemplatePlaceholder(title, { id: formulaId } as FormulaTemplate, index)
}

function getTemplatePlaceholder(sectionTitle: string, formula: FormulaTemplate, index: number): string {
  // Template with variable placeholders based on section type
  const templates: Record<string, string> = {
    'Hook': '[OPENING_LINE]\n\nCreate an attention-grabbing opening that stops the scroll...',
    'Problem': '[PROBLEM_STATEMENT]\n\nDescribe the specific challenge your audience faces...',
    'Framework': '[FRAMEWORK_NAME]\n\nA [KEY_STEPS]-step approach to solve this problem...',
    'Solution': 'Here\'s how to solve [PROBLEM_STATEMENT]:\n\n[SOLUTION_APPROACH]',
    'Story': '[SITUATION]\n\nThe challenge was [CHALLENGE]...',
    'Evidence': '[SUPPORTING_DATA] proves that...',
    'CTA': '[ENGAGEMENT_QUESTION]'
  }
  
  const cleanTitle = sectionTitle.replace(/\s+/g, '')
  return templates[cleanTitle] || `[SECTION_CONTENT]\n\nWrite your ${sectionTitle.toLowerCase()} here...`
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
  currentSectionTitle: string, 
  ideationData: any, 
  contentData?: any
): TemplateVariable[] {
  console.log('🎯 EXTRACT TEMPLATE VARIABLES DEBUG START:')
  console.log('  - Formula ID:', formula.id)
  console.log('  - Current Section Title:', currentSectionTitle)
  console.log('  - Formula Category:', formula.category)
  console.log('  - Formula Sections Count:', formula.sections?.length || 0)
  
  // PRIORITY 1: Always use database template variables as structure
  const databaseVariables = getSectionSpecificVariables(currentSectionTitle, formula.category, ideationData)
  console.log('🏗️ DATABASE VARIABLES RESULT:', databaseVariables.map(v => v.name))
  
  // PRIORITY 2: Enhance database variables with backend AI suggestions
  if (contentData?.generatedContent?.all_filled_variables) {
    console.log('🔍 DEBUGGING TEMPLATE VARIABLES ALIGNMENT:')
    console.log('📊 Database variables for section:', databaseVariables.map(v => v.name))
    console.log('🤖 Backend variables available:', Object.keys(contentData.generatedContent.all_filled_variables))
    console.log('📊 Backend sections data:', contentData.generatedContent.sections_data?.length || 0, 'sections')
    console.log('🎯 Backend total variables filled:', contentData.generatedContent.total_variables_filled || 'unknown')
    console.log('📊 Backend validation score:', contentData.generatedContent.validation_score || 'unknown')
    console.log('📝 Full backend variable data:', JSON.stringify(contentData.generatedContent.all_filled_variables, null, 2))
    
    return databaseVariables.map(dbVar => {
      // Find matching backend suggestion by name or semantic matching
      const backendMatch = findBackendVariableMatch(dbVar.name, contentData.generatedContent.all_filled_variables)
      
      if (backendMatch) {
        console.log(`🤖 Enhanced ${dbVar.name} with AI suggestion: ${backendMatch.substring(0, 50)}...`)
        return {
          ...dbVar,
          aiSuggestion: backendMatch
        }
      }
      
      return dbVar // Keep original if no backend match
    })
  }
  
  return databaseVariables
}

function findBackendVariableMatch(databaseVarName: string, backendVariables: Record<string, any>): string | null {
  // Direct name matching
  const directMatch = backendVariables[databaseVarName]
  if (directMatch) {
    return extractVariableValue(directMatch)
  }
  
  // Semantic matching for database variable concepts
  const semanticMappings: Record<string, string[]> = {
    'OPENING_LINE': ['CRISIS_TIMELINE', 'DRAMATIC_REALIZATION', 'STAKES', 'EMOTIONAL_SETUP'],
    'PROBLEM_STATEMENT': ['PAIN_FOCUS', 'WRONG_APPROACH_INTRO', 'INTERNAL_STRUGGLE'],
    'FRAMEWORK_NAME': ['CATEGORY', 'KEY_INSIGHT'],
    'SITUATION': ['SPECIFIC_SITUATION', 'DISCOVERY_MOMENT'],
    'CHALLENGE': ['WRONG_POINTS', 'PAIN_FOCUS'],
    'ENGAGEMENT_QUESTION': ['SIMPLE_CTA', 'CTA']
  }
  
  const possibleMatches = semanticMappings[databaseVarName] || []
  for (const matchKey of possibleMatches) {
    if (backendVariables[matchKey]) {
      return extractVariableValue(backendVariables[matchKey])
    }
  }
  
  return null
}

function extractVariableValue(varData: any): string {
  if (typeof varData === 'string') {
    return varData
  } else if (typeof varData === 'object' && varData !== null) {
    return varData.value || varData.content || varData.ai_generated_content || JSON.stringify(varData)
  }
  return ''
}
  
function getSectionSpecificVariables(
  sectionTitle: string, 
  category: string, 
  ideationData?: any
): TemplateVariable[] {
  const variables: TemplateVariable[] = []
  const cleanTitle = sectionTitle.toLowerCase().trim()
  
  // Define section-specific variables based on section title and category
  switch (cleanTitle) {
    case 'hook':
    case 'opening':
    case 'intro':
      variables.push({
        name: 'OPENING_LINE',
        label: 'Opening Hook',
        value: '',
        aiSuggestion: ideationData?.topic ? 
          `Here's what they don't tell you about ${ideationData.topic}` : 
          'Here\'s what they don\'t tell you about...',
        required: true,
        type: 'text',
        placeholder: 'Your attention-grabbing opening line'
      })
      break
      
    case 'problem':
    case 'challenge':
    case 'pain point':
      variables.push({
        name: 'PROBLEM_STATEMENT',
        label: 'Main Problem',
        value: '',
        aiSuggestion: ideationData?.topic ? 
          `Most people struggle with ${ideationData.topic} because...` : 
          'The core problem is...',
        required: true,
        type: 'text',
        placeholder: 'The specific problem your audience faces'
      })
      break
      
    case 'framework':
    case 'solution':
    case 'approach':
      variables.push(
        {
          name: 'FRAMEWORK_NAME',
          label: 'Framework Name',
          value: '',
          aiSuggestion: ideationData?.topic ? 
            `The ${ideationData.topic} Framework` : 
            'The [Solution] Framework',
          required: true,
          type: 'text',
          placeholder: 'Your framework or solution name'
        },
        {
          name: 'KEY_STEPS',
          label: 'Number of Steps',
          value: '',
          aiSuggestion: '5',
          required: false,
          type: 'text',
          placeholder: 'e.g., 3, 5, 7'
        }
      )
      break
      
    case 'story':
    case 'experience':
    case 'example':
      if (category === 'story') {
        variables.push(
          {
            name: 'SITUATION',
            label: 'The Situation',
            value: '',
            aiSuggestion: 'When I was facing...',
            required: true,
            type: 'text',
            placeholder: 'Describe the context or situation'
          },
          {
            name: 'CHALLENGE',
            label: 'What Went Wrong',
            value: '',
            aiSuggestion: 'The problem was...',
            required: true,
            type: 'text',
            placeholder: 'What challenge or mistake occurred'
          }
        )
      }
      break
      
    case 'evidence':
    case 'proof':
    case 'data':
      variables.push({
        name: 'SUPPORTING_DATA',
        label: 'Evidence/Data',
        value: '',
        aiSuggestion: 'Studies show that...',
        required: false,
        type: 'text',
        placeholder: 'Statistics, studies, or concrete evidence'
      })
      break
      
    case 'cta':
    case 'call to action':
    case 'question':
      variables.push({
        name: 'ENGAGEMENT_QUESTION',
        label: 'Engagement Question',
        value: '',
        aiSuggestion: ideationData?.topic ? 
          `What's your experience with ${ideationData.topic}?` : 
          'What\'s your take on this?',
        required: false,
        type: 'text',
        placeholder: 'Question to engage your audience'
      })
      break
      
    default:
      // Generic fallback for unknown sections
      variables.push({
        name: 'SECTION_CONTENT',
        label: `${sectionTitle} Content`,
        value: '',
        aiSuggestion: `Your ${sectionTitle.toLowerCase()} goes here...`,
        required: false,
        type: 'text',
        placeholder: `Enter content for ${sectionTitle}`
      })
      break
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
      // No auto-completion - sections complete only when user clicks Next
      // Update content checks
      const updatedChecks = section.contentChecks.filter(check => 
        content.toLowerCase().includes(check.toLowerCase())
      )
      
      return {
        ...section,
        content,
        completedChecks: updatedChecks
        // Keep existing completed status, don't override
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
      console.log(`📍 Navigated to section ${sectionIndex + 1}: ${sections[sectionIndex]?.title}`)
      console.log('🎯 Backend data for this section:', sections[sectionIndex]?.backendData ? 'Available' : 'None')
    }
  }, [sections.length, sections])

  const handlePreviousSection = useCallback(() => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
    }
  }, [currentSectionIndex])

  const handleNextSection = useCallback(() => {
  // Mark current section as complete when moving to next
  setSections(prev => prev.map((section, index) => 
    index === currentSectionIndex ? { ...section, completed: true } : section
  ))
  
  if (currentSectionIndex < sections.length - 1) {
    setCurrentSectionIndex(currentSectionIndex + 1)
  }
}, [currentSectionIndex, sections.length])

  const handleCompleteWriting = useCallback(() => {
  // Mark final section as complete
  setSections(prev => prev.map((section, index) => 
    index === currentSectionIndex ? { ...section, completed: true } : section
  ))
  
  if (assembledContent.trim()) {
    setCurrentView('preview')
  } else {
    showToast('warning', 'Please add some content before completing')
  }
}, [assembledContent, showToast, currentSectionIndex])

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

  const handleAIAnalysis = useCallback(async () => {
    // TODO: Implement AI analysis call
    showToast('info', 'AI analysis feature coming soon')
  }, [showToast])

  const handleEnhanceSection = useCallback(async () => {
    // TODO: Implement AI enhancement call
    showToast('info', 'AI enhancement feature coming soon')
  }, [showToast])

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

  const guidanceTabs: WritingGuidanceTab[] = useMemo(() => [
  {
    id: 'matters',
    label: 'Why This Matters',
    icon: Brain,
    active: activeGuidanceTab === 'matters',
    content: (() => {
      const currentBackendSection = currentSection?.backendData
      
      if (currentBackendSection?.why_this_matters) {
        const whyMatters = currentBackendSection.why_this_matters
        if (typeof whyMatters === 'string') {
          return [whyMatters]
        } else if (typeof whyMatters === 'object' && whyMatters.main_point) {
          return [whyMatters.main_point, whyMatters.how_it_works || '']
        }
      }
      
      return [
        'This creates an "insider secret" promise. Your audience desperately wants validation that they\'re not missing critical knowledge.',
        'By saying "what they don\'t tell you," you position yourself as the truth-teller who\'s seen behind the curtain.'
      ]
    })()
  },
  {
    id: 'essentials',
    label: 'Story Essentials',
    icon: Target,
    active: activeGuidanceTab === 'essentials',
    content: (() => {
      const currentBackendSection = currentSection?.backendData
      const essentials: string[] = []
      
      if (currentBackendSection?.story_essentials) {
        const storyEssentials = currentBackendSection.story_essentials
        if (typeof storyEssentials === 'object') {
          Object.entries(storyEssentials).forEach(([key, value]) => {
            if (typeof value === 'string' && key !== '_analytics') {
              essentials.push(`✓ ${key.replace(/_/g, ' ')}: ${value}`)
            }
          })
        } else if (typeof storyEssentials === 'string') {
          essentials.push(`✓ ${storyEssentials}`)
        }
      }
      
      return essentials.length > 0 ? essentials : [
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
    content: (() => {
      const currentBackendSection = currentSection?.backendData
      const techniques: string[] = []
      
      if (currentBackendSection?.writing_techniques) {
        const writingTechniques = currentBackendSection.writing_techniques
        if (typeof writingTechniques === 'object') {
          Object.entries(writingTechniques).forEach(([key, value]) => {
            if (typeof value === 'string' && key !== '_analytics') {
              techniques.push(`• ${key.replace(/_/g, ' ')}: ${value}`)
            }
          })
        } else if (typeof writingTechniques === 'string') {
          techniques.push(`• ${writingTechniques}`)
        }
      }
      
      return techniques.length > 0 ? techniques : [
        'Use present tense for immediate scenes: "I walk into the meeting room..."',
        'Include sensory details: sounds, sights, physical sensations',
        'Show don\'t tell: "My hands were shaking" vs "I was nervous"',
        'Use specific numbers and details for credibility'
      ]
    })()
  },
  {
    id: 'reader',
    label: 'Know Your Reader',
    icon: Users,
    active: activeGuidanceTab === 'reader',
    content: (() => {
      const currentBackendSection = currentSection?.backendData
      const readerInfo: string[] = []
      
      if (currentBackendSection?.know_your_reader) {
        const knowReader = currentBackendSection.know_your_reader
        if (typeof knowReader === 'object') {
          Object.entries(knowReader).forEach(([key, value]) => {
            if (typeof value === 'string' && key !== '_analytics') {
              readerInfo.push(`${key.replace(/_/g, ' ')}: ${value}`)
            }
          })
        } else if (typeof knowReader === 'string') {
          readerInfo.push(knowReader)
        }
      }
      
      return readerInfo.length > 0 ? readerInfo : [
        `Your audience: ${formula.category === 'story' ? 'Professionals who have faced similar challenges' : 'People looking for structured solutions'}`,
        'They want: Practical insights they can immediately apply',
        'They fear: Making costly mistakes or missing opportunities',
        'They value: Authentic experiences and proven frameworks'
      ]
    })()
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
  ], [currentSection, activeGuidanceTab])

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

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

  const renderContentChecklist = () => {
  // Backend will implement this later with live detection
  return null
}

const renderTemplateVariables = () => (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-gray-900">Template Variables</h3>
      <button
        onClick={() => setShowTemplateVariables(!showTemplateVariables)}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        {showTemplateVariables ? 'Hide' : 'Show'}
      </button>
    </div>
    {showTemplateVariables && (
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
  className="mt-1 text-xs text-purple-600 hover:text-purple-800 flex items-center space-x-1"
>
  <span>🤖</span>
<span>Use AI suggestion</span>
</button>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
)

  const renderLivePreview = () => {
  const getPreviewContent = () => {
    if (previewMode === 'template') {
      // Show current section template with variables filled
      let template = getTemplatePlaceholder(currentSection?.title || '', formula, currentSectionIndex)
      templateVariables.forEach(variable => {
        const placeholder = `[${variable.name}]`
        const value = variable.value || variable.aiSuggestion || placeholder
        template = template.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value)
      })
      return template
    } else if (previewMode === 'example') {
      console.log('🔍 DEBUGGING LIVE PREVIEW SECTION CONTENT:')
      console.log('📍 Current section:', currentSection?.title)
      console.log('🎯 Current section index:', currentSectionIndex)
      console.log('📊 Full generated content length:', contentData?.generatedContent?.generated_content?.complete_post?.length)
      console.log('📝 Section-specific data check:', currentSection?.backendData)
      
      // Show backend example for current section only
      return contentData?.guidance?.section_examples?.[currentSection?.title] || currentSection?.placeholder || ''
    }
    
    // Default to template mode
    return getTemplatePlaceholder(currentSection?.title || '', formula, currentSectionIndex)
  }

    const wordCount = getPreviewContent().trim().split(/\s+/).length
    const variableCount = templateVariables.filter(v => v.value.trim()).length

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Live Preview</h3>
          <div className="flex items-center space-x-2">
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
  <button
    onClick={() => setShowFullDraftModal(true)}
    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
  >
    View Full Draft
  </button>
  {contentData?.generatedContent?.generated_content?.complete_post && (
    <button
      onClick={() => setShowAIOverlay(true)}
      className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
    >
      AI Content
    </button>
  )}
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
    {contentData?.generatedContent?.generated_content?.complete_post && (
      <button
        onClick={() => {
  // Use AI-generated content for CURRENT SECTION ONLY
  if (currentSection && contentData?.generatedContent?.generated_content?.complete_post) {
    const confirmUse = window.confirm('Replace this section with AI-generated content?')
    if (confirmUse) {
      // Extract the section content from the full AI post (split by paragraphs)
      const fullPost = contentData.generatedContent.generated_content.complete_post
      const sections = fullPost.split('\n\n')
      const sectionContent = sections[currentSectionIndex] || fullPost
      
      handleSectionChange(sectionContent)
      showToast('success', `AI content applied to ${currentSection.title} section!`)
    }
  }
}}
        className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
      >
        <Sparkles className="w-4 h-4" />
        <span>✨ Use AI Content</span>
      </button>
    )}
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
        {/* Preview button removed - only show on final section as "Complete Writing" */}
        
        {currentSectionIndex === sections.length - 1 ? (
  <button
    onClick={handleCompleteWriting}
    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
  >
    <span>Complete Writing</span>
    <CheckCircle className="w-4 h-4" />
  </button>
) : (
  <button
    onClick={handleNextSection}
    className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
  >
    <span>Next</span>
    <ArrowRight className="w-4 h-4" />
  </button>
)}
      </div>
    </div>
  )

  // ============================================================================
// CONTENT PREVIEW STATE
// ============================================================================

// Extracted to ContentPreview component

// ============================================================================
// MODAL COMPONENTS
// ============================================================================

const renderFullDraftModal = () => {
  if (!showFullDraftModal) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Full Draft Preview</h3>
            <button 
              onClick={() => setShowFullDraftModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="prose max-w-none">
            <div className="text-gray-800 leading-relaxed whitespace-pre-line">
              {assembledContent || 'No content written yet. Start writing in the sections to see your full draft here.'}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 text-sm text-gray-500">
          {assembledContent.trim().split(/\s+/).filter(w => w).length} words • {sections.filter(s => s.completed).length}/{sections.length} sections completed
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

  // Render appropriate view based on current state
if (currentView === 'preview') {
  return (
    <ContentPreview
      assembledContent={assembledContent}
      onBackToWriting={() => setCurrentView('writing')}
      onSaveAndExit={handleSaveAndExit}
      onContinueToImages={handleContinueToImages}
      inStrictWorkflow={inStrictWorkflow}
    />
  )
}

return (
  <>
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
<WritingSidebar
  formula={formula}
  sections={sections}
  currentSectionIndex={currentSectionIndex}
  totalSections={totalSections}
  sidebarCollapsed={sidebarCollapsed}
  onSectionNavigation={handleSectionNavigation}
  onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
/>
      
      <AIContentOverlay
        isVisible={showAIOverlay}
        onClose={() => setShowAIOverlay(false)}
        contentData={contentData}
        mode="reference"
      />
      
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
      </div>
    </div>
    
    {/* Modals */}
    {renderFullDraftModal()}
 </>
)
}
