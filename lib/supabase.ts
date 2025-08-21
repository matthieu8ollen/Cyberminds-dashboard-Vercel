import { createClient } from '@supabase/supabase-js'
import type { EnhancedContentFormula } from '@/types/formulaTypes'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'writer-suite-auth-token',
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'writer-suite-app'
    }
  }
})

// Types for our database
export interface UserProfile {
  id: string
  plan_type: 'starter' | 'pro' | 'premium'
  posts_remaining: number
  preferred_tone: 'insightful_cfo' | 'bold_operator' | 'strategic_advisor' | 'data_driven_expert'
  niche: string
  posts_generated_this_month: number
  posts_saved_this_month: number
  // Onboarding fields
  role?: string
  content_goals?: string[]
  content_challenges?: string[]
  content_pillars?: string[]
  target_audience?: string
  posting_frequency?: string
  current_experience?: string
  onboarding_completed?: boolean
  ai_persona_data?: any
  created_at: string
  updated_at: string
}

export interface GeneratedContent {
  id: string
  user_id: string
  idea_id?: string
  title?: string
  content_text: string
  content_type: 'framework' | 'story' | 'trend' | 'mistake' | 'metrics'
  tone_used: string
  prompt_input: string | null
  is_saved: boolean
  status?: 'draft' | 'scheduled' | 'published' | 'archived' | undefined
  variations_data?: any
  word_count?: number
  linkedin_post_url?: string
  published_at?: string
  scheduled_date?: string
  scheduled_time?: string
  image_url?: string
  // NEW IDEATION HUB COLUMNS
  ideation_session_id?: string
  workflow_state_id?: string
  source_page?: string
  created_at: string
}

export interface TrendingTopic {
  id: string
  topic_title: string
  description: string | null
  engagement_boost: string | null
  niche: string
  is_active: boolean
  created_at: string
}

export interface ContentIdea {
  id: string
  user_id: string
  title: string
  description?: string
  tags: string[]
  content_pillar?: string
  source_type: 'ai_generated' | 'user_input' | 'trending' | 'imported'
  source_data?: any
  status: 'active' | 'used' | 'archived'
  created_at: string
}

export interface ContentCalendar {
  id: string
  user_id: string
  content_id: string
  scheduled_date: string
  scheduled_time?: string
  timezone: string
  status: 'scheduled' | 'posted' | 'failed' | 'cancelled'
  posted_at?: string
  linkedin_post_url?: string
  created_at: string
}

export interface GeneratedImage {
  id: string
  user_id: string
  content_id: string
  image_url: string
  original_prompt: string
  optimized_prompt?: string
  openai_image_id?: string
  created_at: string
}

// ========================================
// IDEATION HUB INTERFACES
// ========================================

export interface IdeationSession {
  id: string
  user_id: string
  page_type: 'talk_with_marcus' | 'ai_suggested' | 'repurpose_content' | 'content_formulas'
  session_data: any
  status: 'in_progress' | 'completed' | 'abandoned'
  topic?: string
  angle?: string
  takeaways?: string[]
  created_at: string
  updated_at: string
}

export interface WorkflowState {
  id: string
  user_id: string
  session_id?: string
  current_stage: 'ideas' | 'create' | 'image' | 'pipeline'
  stage_data: any
  continuation_route?: string
  last_save: string
  created_at: string
}

// Enhanced ideation output format (for passing between components)
export interface IdeationOutput {
  topic: string
  angle: string
  takeaways: string[]
  source_page: 'talk_with_marcus' | 'ai_suggested' | 'repurpose_content' | 'content_formulas'
  session_id: string
}

// ========================================
// CONTENT FORMULAS INTERFACES & FUNCTIONS
// ========================================

export interface ContentFormula {
  id: string
  formula_name: string
  funnel_stage: string
  funnel_purpose?: string
  content_intent?: string
  formula_category?: string
  content_type_compatibility?: string[]
  author_personas?: string[]
  target_audience?: string
  company_stage_fit?: string[]
  industry_fit?: string[]
  section_count: number
  estimated_word_count?: number
  difficulty_level?: string
  psychological_triggers?: string[]
  engagement_type?: string
  effectiveness_score?: number
  use_cases?: string[]
  best_posting_times?: any
  seasonal_relevance?: any
  is_active?: boolean
  is_premium?: boolean
  created_by?: string
  created_at: string
  updated_at?: string
  last_performance_update?: string
  reusability_score?: number
  engagement_prediction_score?: number
  adaptation_difficulty?: string
  primary_target_role?: string
  complete_template?: string
  formula_id?: string
  voice_template?: string
  viral_potential?: string
  save_worthiness?: string
  overall_performance_rating?: string
  overall_reusability_rating?: string
}

export interface FormulaSection {
  id: string
  formula_id: string
  section_order: number
  section_name: string
  section_slug?: string
  section_purpose: string
  section_template?: string
  section_guidelines?: string
  word_count_target?: number
  word_count_min?: number
  word_count_max?: number
  character_limit?: number
  is_required?: boolean
  is_customizable?: boolean
  template_variables?: any
  psychological_purpose?: string
  emotional_target?: string
  must_contain_elements?: string[]
  should_avoid_elements?: string[]
  created_at: string
  updated_at?: string
  section_strategy_explanation?: string
  transition_to_next_section?: string
  character_count_target?: number
}

// Fetch formulas and sections separately (no foreign key constraint exists)
export const getContentFormulas = async (userId?: string) => {
  console.log('🔍 Manual join - no foreign key constraint exists')
  
  try {
    // Get formulas
    const { data: formulas, error: formulasError } = await supabase
      .from('content_formulas')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (formulasError) return { data: null, error: formulasError }

    // Get sections
    const { data: sections, error: sectionsError } = await supabase
      .from('formula_sections')
      .select('*')
      .order('section_order', { ascending: true })

    if (sectionsError) return { data: null, error: sectionsError }

    // Join manually - FIX: Use formula_id instead of id
const result = formulas?.map(formula => ({
  ...formula,
  formula_sections: sections?.filter(s => s.formula_id === formula.formula_id) || []
})) || []

    console.log('📊 Manual join success:', result.length, 'formulas')
    return { data: result, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

// Save a new content formula with sections
export const saveContentFormula = async (formula: EnhancedContentFormula, userId: string) => {
  try {
    // Convert to database format
    const formulaData = {
      formula_name: formula.name,
      funnel_stage: 'awareness',
      funnel_purpose: formula.description,
      formula_category: formula.category,
      difficulty_level: formula.difficulty,
      section_count: formula.sections.length,
      estimated_word_count: formula.sections.reduce((acc, section) => acc + (section.wordCountTarget || 100), 0),
      psychological_triggers: formula.psychologicalTriggers?.map(t => t.name) || [],
      use_cases: formula.tags || [],
      is_active: true,
      is_premium: false,
      created_by: userId,
      effectiveness_score: formula.popularity || 0,
      engagement_type: 'interactive'
    }

    // Insert formula
    const { data: savedFormula, error: formulaError } = await supabase
      .from('content_formulas')
      .insert(formulaData)
      .select()
      .single()

    if (formulaError) throw formulaError

    // Insert sections
    const sectionsData = formula.sections.map(section => ({
      formula_id: savedFormula.id,
      section_order: section.position,
      section_name: section.title,
      section_purpose: section.description,
      section_guidelines: section.guidance,
      section_template: section.placeholder,
      word_count_target: section.wordCountTarget || 100,
      is_required: section.isRequired,
      is_customizable: section.isCustom,
      psychological_purpose: section.psychologyNote,
      emotional_target: section.toneGuidance
    }))

    const { error: sectionsError } = await supabase
      .from('formula_sections')
      .insert(sectionsData)

    if (sectionsError) throw sectionsError

    return { data: savedFormula, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

export const updateContentFormula = async (formulaId: string, formula: EnhancedContentFormula, userId: string) => {
  try {
    // Convert to database format
    const formulaData = {
      formula_name: formula.name,
      funnel_purpose: formula.description,
      formula_category: formula.category,
      difficulty_level: formula.difficulty,
      section_count: formula.sections.length,
      estimated_word_count: formula.sections.reduce((acc, section) => acc + (section.wordCountTarget || 100), 0),
      psychological_triggers: formula.psychologicalTriggers?.map(t => t.name) || [],
      use_cases: formula.tags || [],
      effectiveness_score: formula.popularity || 0,
      updated_at: new Date().toISOString()
    }

    // Update formula
    const { data: updatedFormula, error: formulaError } = await supabase
      .from('content_formulas')
      .update(formulaData)
      .eq('id', formulaId)
      .select()
      .single()

    if (formulaError) throw formulaError

    // Delete existing sections
    await supabase
      .from('formula_sections')
      .delete()
      .eq('formula_id', formulaId)

    // Insert new sections
    const sectionsData = formula.sections.map(section => ({
      formula_id: formulaId,
      section_order: section.position,
      section_name: section.title,
      section_purpose: section.description,
      section_guidelines: section.guidance,
      section_template: section.placeholder,
      word_count_target: section.wordCountTarget || 100,
      is_required: section.isRequired,
      is_customizable: section.isCustom,
      psychological_purpose: section.psychologyNote,
      emotional_target: section.toneGuidance
    }))

    const { error: sectionsError } = await supabase
      .from('formula_sections')
      .insert(sectionsData)

    if (sectionsError) throw sectionsError

    return { data: updatedFormula, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

export const deleteContentFormula = async (formulaId: string) => {
  try {
    // Delete sections first
    await supabase
      .from('formula_sections')
      .delete()
      .eq('formula_id', formulaId)

    // Delete formula
    const { error } = await supabase
      .from('content_formulas')
      .delete()
      .eq('id', formulaId)

    return { error }
  } catch (err) {
    return { error: err }
  }
}

// Auth helpers
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Database helpers with timeout fix
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log('🔍 getUserProfile: Starting with timeout approach for userId:', userId)
    
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout after 3 seconds')), 3000)
    })
    
    // Create the actual query promise
    const queryPromise = supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    console.log('🔍 getUserProfile: Racing query against timeout...')
    
    // Race the query against the timeout
    const { data, error } = await Promise.race([queryPromise, timeoutPromise])
    
    console.log('🔍 getUserProfile: Query won the race!')
    console.log('🔍 getUserProfile: Data received:', !!data)
    console.log('🔍 getUserProfile: Error received:', error)
    
    if (error) {
      console.log('⚠️ getUserProfile: Error details:', error.message, error.code)
      if (error.code === 'PGRST116') {
        console.log('✅ getUserProfile: No profile found (expected), returning null')
        return null
      }
      throw error
    }
    
    console.log('✅ getUserProfile: Profile found successfully')
    return data
  } catch (error: any) {
    console.error('💥 getUserProfile: Error or timeout:', error.message)
    
    // If it's a timeout or any error, return a fallback profile so the app works
    console.log('🔄 getUserProfile: Returning fallback profile to unblock app')
    return {
      id: userId,
      plan_type: 'starter',
      posts_remaining: 10,
      preferred_tone: 'insightful_cfo',
      niche: 'finance',
      posts_generated_this_month: 0,
      posts_saved_this_month: 0,
      onboarding_completed: true, // Skip onboarding since we can't load real data
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
}

export const createUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log('➕ createUserProfile: Creating profile for:', userId)
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        plan_type: 'starter',
        posts_remaining: 10,
        preferred_tone: 'insightful_cfo',
        niche: 'finance',
        posts_generated_this_month: 0,
        posts_saved_this_month: 0,
        onboarding_completed: false,
      })
      .select()
      .single()
    
    if (error) {
      console.error('❌ createUserProfile: Error:', error)
      throw error
    }
    
    console.log('✅ createUserProfile: Profile created')
    return data
  } catch (error) {
    console.error('❌ createUserProfile: Unexpected error:', error)
    
    // Return a default profile if database creation fails
    return {
      id: userId,
      plan_type: 'starter',
      posts_remaining: 10,
      preferred_tone: 'insightful_cfo',
      niche: 'finance',
      posts_generated_this_month: 0,
      posts_saved_this_month: 0,
      onboarding_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
}

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  return { data, error }
}

export const saveGeneratedContent = async (content: Omit<GeneratedContent, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('generated_content')
    .insert(content)
    .select()
    .single()
  
  return { data, error }
}

export const updateGeneratedContent = async (contentId: string, updates: Partial<GeneratedContent>) => {
  const { data, error } = await supabase
    .from('generated_content')
    .update(updates)
    .eq('id', contentId)
    .select()
    .single()
    
  return { data, error }
}

export const getGeneratedContent = async (userId: string, limit: number = 10) => {
  const { data, error } = await supabase
    .from('generated_content')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  return { data, error }
}

export const getSavedContent = async (userId: string, limit: number = 5) => {
  const { data, error } = await supabase
    .from('generated_content')
    .select('*')
    .eq('user_id', userId)
    .eq('is_saved', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  return { data, error }
}

export const getTrendingTopics = async () => {
  const { data, error } = await supabase
    .from('trending_topics')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(5)
  
  return { data, error }
}

// New helper functions for onboarding and content ideas
export const createContentIdea = async (idea: Omit<ContentIdea, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('content_ideas')
    .insert(idea)
    .select()
    .single()
  
  return { data, error }
}

export const getContentIdeas = async (userId: string, limit: number = 20) => {
  const { data, error } = await supabase
    .from('content_ideas')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  return { data, error }
}

// Update idea status (for dismiss functionality)
export const updateContentIdea = async (ideaId: string, updates: Partial<ContentIdea>) => {
  const { data, error } = await supabase
    .from('content_ideas')
    .update(updates)
    .eq('id', ideaId)
    .select()
    .single()
  
  return { data, error }
}

// Auto-save idea from ideation sessions
export const saveIdeaFromSession = async (
  userId: string,
  sessionId: string,
  topic: string,
  angle: string,
  takeaways: string[],
  sourcePage: string
) => {
  const idea: Omit<ContentIdea, 'id' | 'created_at'> = {
    user_id: userId,
    title: topic,
    description: angle,
    tags: takeaways,
    content_pillar: 'ai_generated',
    source_type: 'ai_generated',
    source_data: { session_id: sessionId, source_page: sourcePage },
    status: 'active'
  }
  
  return await createContentIdea(idea)
}

// Get ideas count for 100-limit enforcement
export const getActiveIdeasCount = async (userId: string) => {
  const { count, error } = await supabase
    .from('content_ideas')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'active')
  
  return { count, error }
}

export const scheduleContent = async (schedule: Omit<ContentCalendar, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('content_calendar')
    .insert(schedule)
    .select()
    .single()
  
  return { data, error }
}

export const getScheduledContent = async (userId: string, limit: number = 10) => {
  const { data, error } = await supabase
    .from('content_calendar')
    .select(`
      *,
      generated_content (
        title,
        content_text,
        content_type
      )
    `)
    .eq('user_id', userId)
    .order('scheduled_date', { ascending: true })
    .limit(limit)
  
  return { data, error }
}

// Image generation helpers
export const saveGeneratedImage = async (image: Omit<GeneratedImage, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('generated_images')
    .insert(image)
    .select()
    .single()
  
  return { data, error }
}

export const getGeneratedImages = async (userId: string, contentId?: string) => {
  let query = supabase
    .from('generated_images')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (contentId) {
    query = query.eq('content_id', contentId)
  }
  
  const { data, error } = await query
  return { data, error }
}

export const deleteGeneratedImage = async (imageId: string) => {
  const { error } = await supabase
    .from('generated_images')
    .delete()
    .eq('id', imageId)
  
  return { error }
}

// ========================================
// IDEATION HUB HELPER FUNCTIONS
// ========================================

// Ideation Sessions
export const createIdeationSession = async (session: Omit<IdeationSession, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('ideation_sessions')
    .insert(session)
    .select()
    .single()
  
  return { data, error }
}

export const updateIdeationSession = async (sessionId: string, updates: Partial<IdeationSession>) => {
  const { data, error } = await supabase
    .from('ideation_sessions')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .select()
    .single()
  
  return { data, error }
}

export const getIdeationSession = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('ideation_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()
  
  return { data, error }
}

export const getUserIdeationSessions = async (userId: string, limit: number = 10) => {
  const { data, error } = await supabase
    .from('ideation_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit)
  
  return { data, error }
}

// Workflow States
export const saveWorkflowState = async (state: Omit<WorkflowState, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('workflow_states')
    .insert(state)
    .select()
    .single()
  
  return { data, error }
}

export const updateWorkflowState = async (stateId: string, updates: Partial<WorkflowState>) => {
  const { data, error } = await supabase
    .from('workflow_states')
    .update({
      ...updates,
      last_save: new Date().toISOString()
    })
    .eq('id', stateId)
    .select()
    .single()
  
  return { data, error }
}

export const getUserWorkflowState = async (userId: string) => {
  const { data, error } = await supabase
    .from('workflow_states')
    .select('*')
    .eq('user_id', userId)
    .order('last_save', { ascending: false })
    .limit(1)
    .single()
  
  return { data, error }
}

export const deleteWorkflowState = async (stateId: string) => {
  const { error } = await supabase
    .from('workflow_states')
    .delete()
    .eq('id', stateId)
  
  return { error }
}

// Enhanced content creation with ideation integration
export const saveGeneratedContentWithIdeation = async (
  content: Omit<GeneratedContent, 'id' | 'created_at'>,
  ideationData?: IdeationOutput
) => {
  const contentData = {
    ...content,
    ideation_session_id: ideationData?.session_id,
    source_page: ideationData?.source_page
  }
  
  const { data, error } = await supabase
    .from('generated_content')
    .insert(contentData)
    .select()
    .single()
  
  return { data, error }
}
