// ==========================================
// ENHANCED CONTENT FORMULA TYPES
// File: types/formulaTypes.ts
// ==========================================

// Core enhanced formula interface
export interface EnhancedContentFormula {
  id: string
  name: string
  description: string
  category: 'authority' | 'contrarian' | 'personal' | 'framework'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  popularity: number
  isCustom: boolean
  createdAt: string
  updatedAt?: string
  userId?: string
  
  // Enhanced structure
  sections: FormulaSection[]
  ctaPositions: CTAPlacement[]
  psychologicalTriggers: PsychologicalTrigger[]
  compositeElements?: CompositeElement[]
  
  // Analytics & Performance
  usageCount: number
  performanceScore?: number
  stakeholderScores: StakeholderScores
  
  // AI Analysis
  aiAnalysis?: AIAnalysisResult
  optimizationSuggestions?: OptimizationSuggestion[]
  
  // Database-aligned fields from CSV
  effectivenessScore: number
  reusabilityScore: number
  engagementPredictionScore: number
  primaryTargetRole: string
  viralPotential: string
  saveWorthiness: string
  overallPerformanceRating: string
  overallReusabilityRating: string
  voiceTemplate: string
  adaptationDifficulty: string
  targetAudience: string
  authorPersonas: string[]
  companyStages: string[]
  industryFit: string[]
  
  // Metadata
  baseFormulaId?: string // If derived from existing formula
  version: number
  tags: string[]
  isPublic: boolean
}

export interface FormulaSection {
  id: string
  title: string
  description: string
  guidance: string
  placeholder: string
  position: number
  isRequired: boolean
  isCustom: boolean
  psychologyNote?: string
  
  // Section-specific settings
  wordCountTarget?: number
  toneGuidance?: string
  exampleContent?: string
  
  // Conditional logic
  showIf?: ConditionalRule[]
  hideIf?: ConditionalRule[]
}

export interface CTAPlacement {
  id: string
  type: 'signup' | 'comment' | 'share' | 'visit' | 'custom'
  position: 'beginning' | 'middle' | 'end' | 'custom'
  customPosition?: number // For precise positioning
  text: string
  url?: string
  trackingParams?: Record<string, string>
}

export interface PsychologicalTrigger {
  id: string
  name: string
  description: string
  category: 'authority' | 'social_proof' | 'scarcity' | 'reciprocity' | 'commitment' | 'liking'
  strength: number // 1-10
  applicableSections: string[] // Section IDs where this applies
  implementation: string // How to implement this trigger
}

export interface CompositeElement {
  id: string
  sourceFormulaId: string
  sourceFormulaName: string
  sectionsIncluded: string[]
  modifications: SectionModification[]
}

export interface SectionModification {
  sectionId: string
  modificationType: 'content_change' | 'tone_shift' | 'cta_addition' | 'removal' | 'repositioning'
  description: string
  newContent?: string
}

export interface StakeholderScores {
  cfo: number
  cmo: number
  ceo: number
  vc: number
  [key: string]: number
}

export interface AIAnalysisResult {
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  improvementAreas: string[]
  engagementPrediction: number
  conversionPotential: number
  audienceAlignment: StakeholderScores
  psychologicalEffectiveness: number
  analysisTimestamp: string
}

export interface OptimizationSuggestion {
  id: string
  type: 'structure' | 'psychology' | 'content' | 'positioning' | 'cta'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  implementation: string
  expectedImpact: number // 1-10
  appliesTo: string[] // Section IDs or 'all'
}

export interface ConditionalRule {
  field: string
  operator: 'equals' | 'contains' | 'not_equals' | 'greater_than' | 'less_than'
  value: string | number
}

// Builder-specific interfaces
export interface FormulaBuilderState {
  currentFormula: EnhancedContentFormula
  isAnalyzing: boolean
  hasUnsavedChanges: boolean
  currentStep: BuilderStep
  validationErrors: ValidationError[]
}

export interface BuilderStep {
  id: string
  name: string
  description: string
  isComplete: boolean
  isRequired: boolean
}

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning' | 'info'
}

// API interfaces for backend integration
export interface CreateFormulaRequest {
  baseFormulaId?: string
  name: string
  description: string
  category: EnhancedContentFormula['category']
  sections: Omit<FormulaSection, 'id'>[]
  ctaPositions: Omit<CTAPlacement, 'id'>[]
  tags: string[]
  isPublic: boolean
}

export interface UpdateFormulaRequest extends Partial<CreateFormulaRequest> {
  id: string
  version: number
}

export interface AnalyzeFormulaRequest {
  formulaId: string
  targetAudience?: string[]
  industry?: string
  contentGoal?: string
}

export interface FormulaAnalysisResponse {
  analysis: AIAnalysisResult
  optimizations: OptimizationSuggestion[]
  enhancedFormula?: EnhancedContentFormula
}

// Component prop interfaces
export interface FormulaBuilderProps {
  baseFormula?: EnhancedContentFormula | null
  onSave: (formula: EnhancedContentFormula) => Promise<void>
  onCancel: () => void
  onAnalyze?: (formula: EnhancedContentFormula) => Promise<FormulaAnalysisResponse>
}

export interface FormulaAnalyzerProps {
  formula: EnhancedContentFormula
  analysis?: AIAnalysisResult
  suggestions?: OptimizationSuggestion[]
  onAnalyze: () => Promise<FormulaAnalysisResponse>  // ← Fixed to match return type
  onApplySuggestion: (suggestion: OptimizationSuggestion) => void
  isAnalyzing: boolean
}

export interface SectionEditorProps {
  section: FormulaSection
  onChange: (section: FormulaSection) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
  formula: EnhancedContentFormula
}

// Utility type for converting legacy formulas
export interface LegacyFormulaConverter {
  convertToEnhanced: (legacy: any) => EnhancedContentFormula
  extractSections: (structure: string[]) => FormulaSection[]
  generatePsychologicalTriggers: (category: string) => PsychologicalTrigger[]
}
