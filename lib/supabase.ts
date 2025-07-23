import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  // CORRECTED STATUS: Added the types used by the Production Pipeline
  status?: 'draft' | 'scheduled' | 'published' | 'failed'
  variations_data?: any
  word_count?: number
  linkedin_post_url?: string
  published_at?: string
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

// Database helpers
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
  
  return data
}

export const createUserProfile = async (userId: string): Promise<UserProfile | null> => {
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
    console.error('Error creating user profile:', error)
    return null
  }
  
  return data
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
