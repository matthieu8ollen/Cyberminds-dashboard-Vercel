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
  created_at: string
  updated_at: string
}

export interface GeneratedContent {
  id: string
  user_id: string
  content_text: string
  content_type: 'framework' | 'story' | 'trend' | 'mistake' | 'metrics'
  tone_used: string
  prompt_input: string | null
  is_saved: boolean
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
