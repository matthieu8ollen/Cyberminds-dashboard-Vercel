// AI Improvement Service for Rich Text Editor
// This simulates AI improvements - replace with actual AI API calls later

export type ImprovementType = 'bold' | 'improve' | 'expand'

export interface ImprovementResult {
  originalText: string
  improvedText: string
  type: ImprovementType
  confidence: number
}

class AIImprovementService {
  
  async improveText(text: string, type: ImprovementType): Promise<string> {
    // Simulate API delay
    await this.delay(800 + Math.random() * 1200)
    
    switch (type) {
      case 'bold':
        return this.makeBolder(text)
      case 'improve':
        return this.improveClarity(text)
      case 'expand':
        return this.expandContent(text)
      default:
        return text
    }
  }

  private makeBolder(text: string): string {
    const boldTransformations = [
      // Remove hedge words
      { from: /I think that /gi, to: '' },
      { from: /I believe that /gi, to: '' },
      { from: /Perhaps /gi, to: '' },
      { from: /Maybe /gi, to: '' },
      { from: /Possibly /gi, to: '' },
      { from: /It seems like /gi, to: '' },
      { from: /It appears that /gi, to: '' },
      
      // Strengthen language
      { from: /should consider/gi, to: 'must' },
      { from: /might want to/gi, to: 'should' },
      { from: /could potentially/gi, to: 'will' },
      { from: /may be able to/gi, to: 'can' },
      { from: /tends to be/gi, to: 'is' },
      { from: /seems to be/gi, to: 'is' },
      
      // Add power words
      { from: /important/gi, to: 'critical' },
      { from: /good/gi, to: 'exceptional' },
      { from: /bad/gi, to: 'devastating' },
      { from: /big/gi, to: 'massive' },
      { from: /small/gi, to: 'microscopic' },
      
      // Direct calls to action
      { from: /you should try/gi, to: 'implement immediately' },
      { from: /you might consider/gi, to: 'take action on' },
      { from: /it would be good to/gi, to: 'you must' }
    ]

    let improvedText = text

    // Apply transformations
    boldTransformations.forEach(({ from, to }) => {
      improvedText = improvedText.replace(from, to)
    })

    // Add emphatic punctuation if appropriate
    if (!improvedText.match(/[.!?]$/)) {
      improvedText += '.'
    }

    // Convert statements to strong declarations
    if (improvedText.toLowerCase().includes('finance') || improvedText.toLowerCase().includes('cfo')) {
      improvedText = this.addFinanceBoldness(improvedText)
    }

    return improvedText.trim()
  }

  private improveClarity(text: string): string {
    const clarityImprovements = [
      // Replace jargon with clearer terms
      { from: /utilize/gi, to: 'use' },
      { from: /facilitate/gi, to: 'help' },
      { from: /endeavor/gi, to: 'try' },
      { from: /commence/gi, to: 'start' },
      { from: /terminate/gi, to: 'end' },
      
      // Simplify complex phrases
      { from: /in order to/gi, to: 'to' },
      { from: /with regard to/gi, to: 'about' },
      { from: /in the event that/gi, to: 'if' },
      { from: /due to the fact that/gi, to: 'because' },
      { from: /at this point in time/gi, to: 'now' },
      
      // Make numbers more concrete
      { from: /a lot of/gi, to: 'significant' },
      { from: /many/gi, to: 'multiple' },
      { from: /some/gi, to: 'several' },
      
      // Improve transitions
      { from: /Also,/gi, to: 'Additionally,' },
      { from: /But /gi, to: 'However, ' },
      { from: /So /gi, to: 'Therefore, ' }
    ]

    let improvedText = text

    // Apply clarity improvements
    clarityImprovements.forEach(({ from, to }) => {
      improvedText = improvedText.replace(from, to)
    })

    // Add specific metrics if discussing finance topics
    if (improvedText.toLowerCase().includes('improve') && 
        (improvedText.toLowerCase().includes('financial') || improvedText.toLowerCase().includes('revenue'))) {
      improvedText = this.addFinanceMetrics(improvedText)
    }

    // Improve sentence structure
    improvedText = this.improveSentenceStructure(improvedText)

    return improvedText.trim()
  }

  private expandContent(text: string): string {
    const expansions = [
      // Add context and examples
      { 
        pattern: /cash flow/gi, 
        addition: ' (including operational, investing, and financing activities)' 
      },
      { 
        pattern: /ROI/gi, 
        addition: ' (Return on Investment)' 
      },
      { 
        pattern: /KPIs/gi, 
        addition: ' (Key Performance Indicators)' 
      },
      { 
        pattern: /SaaS metrics/gi, 
        addition: ' such as MRR, churn rate, and customer acquisition cost' 
      },
      { 
        pattern: /financial planning/gi, 
        addition: ' and analysis (FP&A)' 
      },
      { 
        pattern: /budget/gi, 
        addition: ' and forecasting process' 
      }
    ]

    let expandedText = text

    // Apply expansions
    expansions.forEach(({ pattern, addition }) => {
      if (pattern.test(expandedText) && !expandedText.includes(addition)) {
        expandedText = expandedText.replace(pattern, (match) => match + addition)
      }
    })

    // Add supporting details based on content
    if (expandedText.toLowerCase().includes('cfo')) {
      expandedText = this.addCFOContext(expandedText)
    }

    if (expandedText.toLowerCase().includes('metric')) {
      expandedText = this.addMetricContext(expandedText)
    }

    // Add actionable insights
    expandedText = this.addActionableInsights(expandedText)

    return expandedText.trim()
  }

  private addFinanceBoldness(text: string): string {
    const boldFinancePhrases = [
      'Stop making these expensive mistakes.',
      'Your competition already knows this.',
      'This is costing you money every day.',
      "Most CFOs get this completely wrong.",
      'The data doesn\'t lie.'
    ]

    // Add a bold finance statement if text is about finance
    if (text.length > 50 && Math.random() > 0.5) {
      const randomPhrase = boldFinancePhrases[Math.floor(Math.random() * boldFinancePhrases.length)]
      return `${text} ${randomPhrase}`
    }

    return text
  }

  private addFinanceMetrics(text: string): string {
    const metrics = [
      'typically improving efficiency by 25-40%',
      'with measurable ROI within 6 months',
      'leading to cost savings of $50K+ annually',
      'resulting in 15-30% faster month-end close',
      'reducing manual work by up to 60%'
    ]

    const randomMetric = metrics[Math.floor(Math.random() * metrics.length)]
    return `${text} - ${randomMetric}`
  }

  private improveSentenceStructure(text: string): string {
    // Split long sentences
    return text
      .replace(/,\s*and\s*([^,]{20,})/g, '. Additionally, $1')
      .replace(/,\s*but\s*([^,]{20,})/g, '. However, $1')
      .replace(/,\s*so\s*([^,]{20,})/g, '. Therefore, $1')
  }

  private addCFOContext(text: string): string {
    const cfoContexts = [
      'As finance leaders know,',
      'From a strategic financial perspective,',
      'Based on industry benchmarks,',
      'According to recent CFO surveys,'
    ]

    if (!text.match(/^(As|From|Based|According)/)) {
      const randomContext = cfoContexts[Math.floor(Math.random() * cfoContexts.length)]
      return `${randomContext} ${text.toLowerCase()}`
    }

    return text
  }

  private addMetricContext(text: string): string {
    const metricContexts = [
      'Key indicators to track include',
      'The most important measurements are',
      'Critical benchmarks involve',
      'Essential KPIs encompass'
    ]

    if (text.toLowerCase().includes('track') || text.toLowerCase().includes('measure')) {
      const randomContext = metricContexts[Math.floor(Math.random() * metricContexts.length)]
      return `${text} ${randomContext.toLowerCase()} quarterly performance reviews and monthly variance analysis.`
    }

    return text
  }

  private addActionableInsights(text: string): string {
    const actionableAdditions = [
      'Here\'s how to implement this:',
      'Take these specific steps:',
      'Start with these actions:',
      'Focus on these priorities:'
    ]

    // Add actionable insights for longer content
    if (text.length > 100 && Math.random() > 0.7) {
      const randomAction = actionableAdditions[Math.floor(Math.random() * actionableAdditions.length)]
      return `${text}\n\n${randomAction}`
    }

    return text
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Batch improvement for multiple pieces of text
  async batchImprove(
    texts: string[], 
    type: ImprovementType
  ): Promise<ImprovementResult[]> {
    const promises = texts.map(async (text) => {
      const improvedText = await this.improveText(text, type)
      return {
        originalText: text,
        improvedText,
        type,
        confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
      }
    })

    return Promise.all(promises)
  }

  // Get improvement suggestions without applying them
  getSuggestions(text: string): Array<{
    type: ImprovementType
    preview: string
    confidence: number
  }> {
    return [
      {
        type: 'bold',
        preview: this.makeBolder(text).substring(0, 50) + '...',
        confidence: 0.85
      },
      {
        type: 'improve',
        preview: this.improveClarity(text).substring(0, 50) + '...',
        confidence: 0.78
      },
      {
        type: 'expand',
        preview: this.expandContent(text).substring(0, 50) + '...',
        confidence: 0.82
      }
    ]
  }
}

// Export singleton instance
export const aiImprovementService = new AIImprovementService()

// Export for use in components
export default aiImprovementService
