import type { 
  EnhancedContentFormula, 
  FormulaSection, 
  PsychologicalTrigger,
  CTAPlacement,
  StakeholderScores,
  LegacyFormulaConverter
} from '@/types/formulaTypes'

// Legacy formula interface (your current ContentFormula)
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

const mapLegacyCategory = (legacyCategory: string): 'authority' | 'contrarian' | 'personal' | 'framework' => {
  switch (legacyCategory) {
    case 'framework':
      return 'authority'
    case 'data':
      return 'contrarian'
    case 'story':
      return 'personal'
    case 'lead-generation':
      return 'framework'
    default:
      return 'framework'
  }
}

class FormulaConverter implements LegacyFormulaConverter {
  
  /**
   * Convert legacy formula to enhanced format
   */
  convertToEnhanced(legacy: LegacyContentFormula): EnhancedContentFormula {
    const sections = this.extractSections(legacy.structure)
    const psychologicalTriggers = this.generatePsychologicalTriggers(legacy.category)
    const ctaPositions = this.generateDefaultCTAs(legacy.category)
    const stakeholderScores = this.generateStakeholderScores(legacy.category)

    return {
      id: legacy.id,
      name: legacy.name,
      description: legacy.description,
      category: mapLegacyCategory(legacy.category),
      difficulty: legacy.difficulty,
      estimatedTime: legacy.estimatedTime,
      popularity: legacy.popularity,
      isCustom: legacy.isCustom || false,
      createdAt: legacy.createdAt || new Date().toISOString(),
      
      // Enhanced structure
      sections,
      ctaPositions,
      psychologicalTriggers,
      compositeElements: [],
      
      // Analytics
      usageCount: 0,
      stakeholderScores,
      
     // Metadata
      version: 1,
      tags: this.generateTags(legacy),
      isPublic: !legacy.isCustom,
      
      // AI Analysis placeholder
      aiAnalysis: undefined,
      optimizationSuggestions: [],
      
      // Database-aligned fields with defaults
      effectivenessScore: 0,
      reusabilityScore: 0,
      engagementPredictionScore: 0,
      primaryTargetRole: '',
      viralPotential: '',
      saveWorthiness: '',
      overallPerformanceRating: '',
      overallReusabilityRating: '',
      voiceTemplate: '',
      adaptationDifficulty: '',
      targetAudience: '',
      authorPersonas: [],
      companyStages: [],
      industryFit: []
    }
  }

  /**
   * Extract sections from legacy structure array
   */
  extractSections(structure: string[]): FormulaSection[] {
    return structure.map((step, index) => {
      const [title, description] = this.parseStructureStep(step)
      
      return {
        id: `section_${index}_${Date.now()}`,
        title,
        description: description || '',
        guidance: this.generateGuidance(title, index),
        placeholder: this.generatePlaceholder(title, index),
        position: index,
        isRequired: index < 3, // First 3 sections are required
        isCustom: false,
        psychologyNote: this.generatePsychologyNote(title, index)
      }
    })
  }

  /**
   * Parse individual structure step
   */
  private parseStructureStep(step: string): [string, string?] {
    // Handle steps with " - " separator
    if (step.includes(' - ')) {
      const [title, description] = step.split(' - ', 2)
      return [title.trim(), description.trim()]
    }
    
    return [step.trim()]
  }

  /**
   * Generate writing guidance for section
   */
  private generateGuidance(title: string, index: number): string {
    const lowerTitle = title.toLowerCase()
    
    // Hook/Opening patterns
    if (index === 0 || lowerTitle.includes('hook') || lowerTitle.includes('admission')) {
      return "Start with a compelling statement that grabs attention. Be specific and relatable. Avoid generic openings."
    }
    
    // Context/Background patterns
    if (lowerTitle.includes('context') || lowerTitle.includes('background') || lowerTitle.includes('why')) {
      return "Provide necessary background without overwhelming detail. Help readers understand the situation and stakes."
    }
    
    // Problem/Challenge patterns
    if (lowerTitle.includes('problem') || lowerTitle.includes('consequence') || lowerTitle.includes('challenge')) {
      return "Be specific about the problem and its impact. Use concrete examples and quantify when possible."
    }
    
    // Solution/Learning patterns
    if (lowerTitle.includes('solution') || lowerTitle.includes('learning') || lowerTitle.includes('insight')) {
      return "Share the key insight or lesson learned. Make it actionable and broadly applicable to your audience."
    }
    
    // Framework/Process patterns
    if (lowerTitle.includes('framework') || lowerTitle.includes('step') || lowerTitle.includes('process')) {
      return "Break down your approach into clear, actionable steps. Use numbered lists or bullet points for clarity."
    }
    
    // CTA patterns
    if (lowerTitle.includes('cta') || lowerTitle.includes('question') || index === 5) {
      return "End with a question that encourages engagement. Make it specific to the content and easy to answer."
    }
    
    // Default guidance
    return "Write this section with clear, specific details that support your main message. Use examples when possible."
  }

  /**
   * Generate placeholder text for section
   */
  private generatePlaceholder(title: string, index: number): string {
    const lowerTitle = title.toLowerCase()
    
    if (index === 0 || lowerTitle.includes('hook') || lowerTitle.includes('admission')) {
      return "I made a $50K mistake that taught me the most valuable lesson of my career..."
    }
    
    if (lowerTitle.includes('context') || lowerTitle.includes('background')) {
      return "Back in 2022, we were growing fast but burning through cash. I thought I had everything under control..."
    }
    
    if (lowerTitle.includes('problem') || lowerTitle.includes('consequence')) {
      return "Within 3 months, we had lost 2 key clients, team morale was at an all-time low, and..."
    }
    
    if (lowerTitle.includes('learning') || lowerTitle.includes('insight')) {
      return "Here's what I learned: [Key insight that others can apply to their situation]"
    }
    
    if (lowerTitle.includes('framework') || lowerTitle.includes('step')) {
      return "Here's the 3-step process I now use:\n1. [First step]\n2. [Second step]\n3. [Third step]"
    }
    
    if (lowerTitle.includes('cta') || lowerTitle.includes('question')) {
      return "What's the biggest lesson you've learned from a mistake? Share it below."
    }
    
    return "Write your content for this section here..."
  }

  /**
   * Generate psychology note for section
   */
  private generatePsychologyNote(title: string, index: number): string {
    const lowerTitle = title.toLowerCase()
    
    if (index === 0 || lowerTitle.includes('hook') || lowerTitle.includes('admission')) {
      return "Vulnerability and specificity create immediate trust and relatability. People connect with authentic struggles."
    }
    
    if (lowerTitle.includes('problem') || lowerTitle.includes('consequence')) {
      return "Concrete consequences make the stakes real and help readers understand why this matters to them."
    }
    
    if (lowerTitle.includes('learning') || lowerTitle.includes('insight')) {
      return "Providing value through hard-won insights positions you as someone worth following and learning from."
    }
    
    if (lowerTitle.includes('cta') || lowerTitle.includes('question')) {
      return "Ending with a relevant question encourages engagement and helps the algorithm show your content to more people."
    }
    
    return "This section builds credibility and keeps readers engaged through the narrative."
  }

  /**
   * Generate psychological triggers based on category
   */
  generatePsychologicalTriggers(category: string): PsychologicalTrigger[] {
    const baseTriggers: PsychologicalTrigger[] = []
    
    switch (category) {
      case 'story':
        baseTriggers.push(
          {
            id: 'vulnerability',
            name: 'Vulnerability',
            description: 'Sharing personal struggles creates trust and relatability',
            category: 'liking',
            strength: 8,
            applicableSections: ['0'],
            implementation: 'Be honest about mistakes and challenges faced'
          },
          {
            id: 'social_proof_story',
            name: 'Experiential Social Proof',
            description: 'Others can relate to similar situations',
            category: 'social_proof',
            strength: 7,
            applicableSections: ['1', '2'],
            implementation: 'Reference common experiences your audience has had'
          }
        )
        break
        
      case 'data':
        baseTriggers.push(
          {
            id: 'authority_data',
            name: 'Data Authority',
            description: 'Numbers and statistics establish credibility',
            category: 'authority',
            strength: 9,
            applicableSections: ['0', '2'],
            implementation: 'Use specific, impressive statistics and metrics'
          },
          {
            id: 'scarcity_knowledge',
            name: 'Exclusive Knowledge',
            description: 'Insider information feels valuable and scarce',
            category: 'scarcity',
            strength: 6,
            applicableSections: ['1', '3'],
            implementation: 'Position insights as not widely known'
          }
        )
        break
        
      case 'framework':
        baseTriggers.push(
          {
            id: 'authority_system',
            name: 'Systematic Authority',
            description: 'Structured approaches demonstrate expertise',
            category: 'authority',
            strength: 8,
            applicableSections: ['1', '2'],
            implementation: 'Present clear, logical step-by-step processes'
          },
          {
            id: 'commitment_framework',
            name: 'Implementation Commitment',
            description: 'Frameworks encourage active commitment to try',
            category: 'commitment',
            strength: 7,
            applicableSections: ['3', '4'],
            implementation: 'Ask readers to commit to trying the framework'
          }
        )
        break
        
      case 'lead-generation':
        baseTriggers.push(
          {
            id: 'reciprocity_value',
            name: 'Value First Reciprocity',
            description: 'Giving value first creates obligation to reciprocate',
            category: 'reciprocity',
            strength: 8,
            applicableSections: ['2', '3'],
            implementation: 'Provide genuine value before making any ask'
          },
          {
            id: 'scarcity_offer',
            name: 'Limited Availability',
            description: 'Scarcity increases perceived value and urgency',
            category: 'scarcity',
            strength: 7,
            applicableSections: ['4', '5'],
            implementation: 'Mention limited spots, time-sensitive offers'
          }
        )
        break
    }
    
    return baseTriggers
  }

  /**
   * Generate default CTAs based on category
   */
  private generateDefaultCTAs(category: string): CTAPlacement[] {
    const ctas: CTAPlacement[] = []
    
    switch (category) {
      case 'story':
      case 'framework':
        ctas.push({
          id: 'engagement_cta',
          type: 'comment',
          position: 'end',
          text: 'What\'s your experience with this? Share in the comments.',
          trackingParams: { type: 'engagement', category }
        })
        break
        
      case 'data':
        ctas.push({
          id: 'data_cta',
          type: 'comment',
          position: 'end',
          text: 'What metrics do you track that others might find surprising?',
          trackingParams: { type: 'engagement', category }
        })
        break
        
      case 'lead-generation':
        ctas.push(
          {
            id: 'value_cta',
            type: 'comment',
            position: 'middle',
            text: 'Finding this helpful? There\'s more where this came from.',
            trackingParams: { type: 'nurture', category }
          },
          {
            id: 'signup_cta',
            type: 'signup',
            position: 'end',
            text: 'Get the full framework in my free guide',
            url: 'https://example.com/signup',
            trackingParams: { type: 'conversion', category }
          }
        )
        break
    }
    
    return ctas
  }

  /**
   * Generate stakeholder scores based on category
   */
  private generateStakeholderScores(category: string): StakeholderScores {
    const baseScores = { cfo: 5, cmo: 5, ceo: 5, vc: 5 }
    
    switch (category) {
      case 'story':
        return { ...baseScores, ceo: 8, cmo: 7, vc: 6 }
      case 'data':
        return { ...baseScores, cfo: 9, ceo: 7, vc: 8 }
      case 'framework':
        return { ...baseScores, cfo: 7, cmo: 8, ceo: 8 }
      case 'lead-generation':
        return { ...baseScores, cmo: 9, ceo: 6, vc: 5 }
      default:
        return baseScores
    }
  }

  /**
   * Generate tags from legacy formula
   */
  private generateTags(legacy: LegacyContentFormula): string[] {
    const tags: string[] = [legacy.category, legacy.difficulty]
    
    // Add category-specific tags
    if (legacy.category === 'story') {
      tags.push('personal', 'vulnerable', 'relatable')
    } else if (legacy.category === 'data') {
      tags.push('metrics', 'analytical', 'evidence')
    } else if (legacy.category === 'framework') {
      tags.push('systematic', 'process', 'actionable')
    } else if (legacy.category === 'lead-generation') {
      tags.push('conversion', 'value', 'nurture')
    }
    
    // Add difficulty-specific tags
    if (legacy.difficulty === 'beginner') {
      tags.push('simple', 'foundational')
    } else if (legacy.difficulty === 'advanced') {
      tags.push('complex', 'expert')
    }
    
    return tags
  }
}

// Export singleton instance
export const formulaConverter = new FormulaConverter()

// Utility functions for batch conversion
export const convertLegacyFormulas = (legacyFormulas: LegacyContentFormula[]): EnhancedContentFormula[] => {
  return legacyFormulas.map(formula => formulaConverter.convertToEnhanced(formula))
}

// Helper for backend API integration
export const prepareFormulaForAPI = (formula: EnhancedContentFormula) => {
  return {
    name: formula.name,
    description: formula.description,
    category: formula.category,
    difficulty: formula.difficulty,
    estimatedTime: formula.estimatedTime,
    sections: formula.sections.map(section => ({
      title: section.title,
      description: section.description,
      guidance: section.guidance,
      placeholder: section.placeholder,
      position: section.position,
      isRequired: section.isRequired,
      psychologyNote: section.psychologyNote,
      wordCountTarget: section.wordCountTarget,
      toneGuidance: section.toneGuidance
    })),
    ctaPositions: formula.ctaPositions,
    psychologicalTriggers: formula.psychologicalTriggers,
    tags: formula.tags,
    isPublic: formula.isPublic,
    stakeholderScores: formula.stakeholderScores
  }
}

// Helper for validating enhanced formulas
export const validateEnhancedFormula = (formula: EnhancedContentFormula): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!formula.name.trim()) {
    errors.push('Formula name is required')
  }
  
  if (!formula.description.trim()) {
    errors.push('Formula description is required')
  }
  
  if (formula.sections.length === 0) {
    errors.push('At least one section is required')
  }
  
  formula.sections.forEach((section, index) => {
    if (!section.title.trim()) {
      errors.push(`Section ${index + 1} title is required`)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
