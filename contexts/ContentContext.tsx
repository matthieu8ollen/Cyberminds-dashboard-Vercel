'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { 
  GeneratedContent, 
  saveGeneratedContent, 
  updateGeneratedContent,
  getGeneratedContent,
  scheduleContent,
  ContentCalendar,
  supabase
} from '../lib/supabase'

interface ContentContextType {
  // Content Management
  draftContent: GeneratedContent[]
  scheduledContent: GeneratedContent[]
  publishedContent: GeneratedContent[]
  archivedContent: GeneratedContent[]
  loadingContent: boolean
  
  // Actions
  saveDraft: (content: Omit<GeneratedContent, 'id' | 'created_at' | 'user_id'>, mode?: 'marcus' | 'standard') => Promise<GeneratedContent | null>
  updateContent: (id: string, updates: Partial<GeneratedContent>) => Promise<boolean>
  scheduleContentItem: (contentId: string, date: string, time: string) => Promise<boolean>
  publishContent: (contentId: string) => Promise<boolean>
  deleteContent: (contentId: string) => Promise<boolean>
  refreshContent: () => Promise<void>
  attachImage: (contentId: string, imageUrl: string) => Promise<boolean>
  
  // UI State
  selectedContent: GeneratedContent | null
  setSelectedContent: (content: GeneratedContent | null) => void
  showScheduleModal: boolean
  setShowScheduleModal: (show: boolean) => void
}

const ContentContext = createContext<ContentContextType>({} as ContentContextType)

export const useContent = () => {
  const context = useContext(ContentContext)
  if (!context) {
    throw new Error('useContent must be used within ContentProvider')
  }
  return context
}

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [allContent, setAllContent] = useState<GeneratedContent[]>([])
  const [loadingContent, setLoadingContent] = useState(true)
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)

  // Computed states
  const draftContent = allContent.filter(c => c.status === 'draft' || !c.status)
  const scheduledContent = allContent.filter(c => c.status === 'scheduled')
  const publishedContent = allContent.filter(c => c.status === 'published')
  const archivedContent = allContent.filter(c => c.status === 'archived')

  // Load all content on mount and user change
  useEffect(() => {
    if (user) {
      refreshContent()
    }
  }, [user])

  const refreshContent = useCallback(async () => {
    if (!user) return
    
    setLoadingContent(true)
    try {
      const { data, error } = await getGeneratedContent(user.id, 100)
      if (error) throw error
      
      if (data) {
        setAllContent(data)
      }
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoadingContent(false)
    }
  }, [user])

  const clearWorkflowForContent = async (contentId: string) => {
  try {
    // Clear any lingering workflow states for this content
    console.log('Workflow completed for content:', contentId)
    // Additional cleanup logic can be added here
  } catch (error) {
    console.error('Error clearing workflow state:', error)
  }
}

  const saveDraft = async (content: Omit<GeneratedContent, 'id' | 'created_at' | 'user_id'>, mode?: 'marcus' | 'standard') => {
  if (!user) return null

  try {
    const { data, error } = await saveGeneratedContent({
      ...content,
      user_id: user.id
    })

    if (error) throw error
    
    if (data) {
      await refreshContent()
      
      // Clear workflow state when content is saved to production
      if (content.status === 'draft') {
        await clearWorkflowForContent(data.id)
      }
      
      return data
    }
  } catch (error) {
    console.error('Error saving draft:', error)
  }
  
  return null
}

  const updateContent = async (id: string, updates: Partial<GeneratedContent>) => {
    try {
      const { error } = await updateGeneratedContent(id, updates)
      if (error) throw error
      
      setAllContent(prev => prev.map(content => 
        content.id === id ? { ...content, ...updates } : content
      ))
      
      return true
    } catch (error) {
      console.error('Error updating content:', error)
      return false
    }
  }

const scheduleContentItem = async (contentId: string, date: string, time: string) => {
  if (!user) return false
  
  try {
    // Update content with status AND scheduled date/time
    const success = await updateContent(contentId, { 
      status: 'scheduled',
      scheduled_date: date,
      scheduled_time: time
    })
    
    if (!success) throw new Error('Failed to update content')
    
    return true
  } catch (error) {
    console.error('Error scheduling content:', error)
    return false
  }
}

  const publishContent = async (contentId: string) => {
    try {
      // In real app, this would call LinkedIn API
      // For now, just update status
      await updateContent(contentId, { 
        status: 'published',
        published_at: new Date().toISOString()
      })
      
      return true
    } catch (error) {
      console.error('Error publishing content:', error)
      return false
    }
  }

  const deleteContent = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('generated_content')
        .delete()
        .eq('id', contentId)
      
      if (error) throw error
      
      setAllContent(prev => prev.filter(c => c.id !== contentId))
      return true
    } catch (error) {
      console.error('Error deleting content:', error)
      return false
    }
  }

  const attachImage = async (contentId: string, imageUrl: string) => {
  try {
    const success = await updateContent(contentId, { image_url: imageUrl })
    if (success) {
      return true
    }
    return false
  } catch (error) {
    console.error('Error attaching image:', error)
    return false
  }
}

  const value = {
    draftContent,
    scheduledContent,
    publishedContent,
    archivedContent,
    loadingContent,
    saveDraft,
    updateContent,
    scheduleContentItem,
    publishContent,
    deleteContent,
    refreshContent,
    attachImage,
    selectedContent,
    setSelectedContent,
    showScheduleModal,
    setShowScheduleModal
  }

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  )
}
