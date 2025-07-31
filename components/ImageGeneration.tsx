'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useContent } from '../contexts/ContentContext'
import { useToast } from './ToastNotifications'
import { generateImagesMock } from '../lib/imageGenerationService'
import { generatePromptSuggestions, optimizePrompt } from '../lib/promptOptimizationService'
import { saveGeneratedImage, updateGeneratedContent } from '../lib/supabase'
import {
  Camera,
  Sparkles,
  Download,
  Link,
  RefreshCw,
  Eye,
  Edit3,
  Clock,
  CheckCircle,
  BarChart3,
  Target,
  TrendingUp,
  AlertCircle,
  User,
  Zap,
  FileText,
  Wand2,
  ImageIcon,
  ArrowRight
} from 'lucide-react'

interface GeneratedImage {
  url: string
  revised_prompt?: string
}

export default function ImageGeneration() {
  const { user } = useAuth()
  const { 
    draftContent, 
    scheduledContent, 
    updateContent,
    refreshContent 
  } = useContent()
  const { showToast } = useToast()

  const [selectedContent, setSelectedContent] = useState<any>(null)
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([])
  const [customPrompt, setCustomPrompt] = useState('')
  const [optimizedPrompt, setOptimizedPrompt] = useState('')
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'draft' | 'scheduled'>('draft')
  const [showOptimized, setShowOptimized] = useState(false)

  // Only show draft and scheduled content
  const currentContent = activeTab === 'draft' ? draftContent : scheduledContent

  useEffect(() => {
    if (selectedContent) {
      const prompts = generatePromptSuggestions(selectedContent)
      setSuggestedPrompts(prompts)
      setGeneratedImages([])
      setCustomPrompt('')
      setOptimizedPrompt('')
      setShowOptimized(false)
    }
  }, [selectedContent])

  // Auto-select content if coming from Production Pipeline
useEffect(() => {
  const selectedContentFromStorage = localStorage.getItem('selectedContentForImage')
  if (selectedContentFromStorage) {
    try {
      const contentData = JSON.parse(selectedContentFromStorage)
      
      // Find the content in current data and select it
      const allContent = [...draftContent, ...scheduledContent]
      const matchingContent = allContent.find(c => c.id === contentData.id)
      
      if (matchingContent) {
        setSelectedContent(matchingContent)
        // Set the appropriate tab
        setActiveTab(matchingContent.status === 'scheduled' ? 'scheduled' : 'draft')
      }
      
      // Clean up localStorage
      localStorage.removeItem('selectedContentForImage')
    } catch (error) {
      console.error('Error parsing selected content from storage:', error)
    }
  }
}, [draftContent, scheduledContent])

  const handleContentSelect = (content: any) => {
    setSelectedContent(content)
  }

  const handleOptimizePrompt = () => {
    if (customPrompt.trim()) {
      const optimized = optimizePrompt(customPrompt)
      setOptimizedPrompt(optimized)
      setShowOptimized(true)
    }
  }

  const handleGenerateFromAISuggestions = async () => {
    if (suggestedPrompts.length === 0) return

    setIsGenerating(true)
    try {
      // Generate images from the first AI suggestion
      const response = await generateImagesMock({ prompt: suggestedPrompts[0], n: 3 })
      setGeneratedImages(response.data)
      showToast('success', 'Images generated from AI suggestions!')
    } catch (error) {
      showToast('error', 'Failed to generate images')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateFromCustom = async () => {
    const promptToUse = showOptimized ? optimizedPrompt : customPrompt
    if (!promptToUse.trim()) return

    setIsGenerating(true)
    try {
      const response = await generateImagesMock({ prompt: promptToUse, n: 3 })
      setGeneratedImages(response.data)
      showToast('success', 'Images generated from custom prompt!')
    } catch (error) {
      showToast('error', 'Failed to generate images')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAttachImage = async (imageUrl: string, prompt: string) => {
    if (!selectedContent || !user) return

    try {
      const success = await updateContent(selectedContent.id, {
        image_url: imageUrl
      })

      if (success) {
        await saveGeneratedImage({
          user_id: user.id,
          content_id: selectedContent.id,
          image_url: imageUrl,
          original_prompt: prompt,
          optimized_prompt: prompt
        })

        showToast('success', 'Image attached to content!')
        refreshContent()
        
        setSelectedContent((prev: any) => prev ? { ...prev, image_url: imageUrl } : null)
      } else {
        showToast('error', 'Failed to attach image')
      }
    } catch (error) {
      showToast('error', 'An error occurred while attaching image')
    }
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'framework': return <BarChart3 className="w-4 h-4" />
      case 'story': return <Target className="w-4 h-4" />
      case 'trend': return <TrendingUp className="w-4 h-4" />
      case 'mistake': return <AlertCircle className="w-4 h-4" />
      case 'metrics': return <Sparkles className="w-4 h-4" />
      default: return <BarChart3 className="w-4 h-4" />
    }
  }

  const getCreationModeIcon = (content: any) => {
    const mode = content.variations_data?.creation_mode
    switch (mode) {
      case 'marcus': return <User className="w-4 h-4" />
      case 'classic': return <Sparkles className="w-4 h-4" />
      case 'express': return <Zap className="w-4 h-4" />
      case 'standard': return <Clock className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'draft': return <Edit3 className="w-4 h-4 text-gray-500" />
      case 'scheduled': return <Clock className="w-4 h-4 text-blue-500" />
      default: return <Edit3 className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Content Selection */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-slate-700 to-teal-600 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Image Generation</h1>
              <p className="text-sm text-gray-600">Create AI images for your content</p>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('draft')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
                activeTab === 'draft'
                  ? 'text-slate-700 border-b-2 border-slate-700 bg-slate-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Edit3 className="w-4 h-4" />
                <span>Draft ({draftContent.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
                activeTab === 'scheduled'
                  ? 'text-slate-700 border-b-2 border-slate-700 bg-slate-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Scheduled ({scheduledContent.length})</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {currentContent.map((content) => (
              <div
                key={content.id}
                onClick={() => handleContentSelect(content)}
                className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedContent?.id === content.id
                    ? 'border-slate-700 bg-slate-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Content Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getContentTypeIcon(content.content_type)}
                    {getCreationModeIcon(content)}
                    <span className="text-xs font-medium text-gray-600 capitalize">
                      {content.content_type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(content.status)}
                    {content.image_url && (
                      <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center">
                        <Camera className="w-3 h-3 text-teal-600" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Content Preview */}
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 leading-tight">
                  {content.title || content.content_text.split('\n')[0].substring(0, 50) + '...'}
                </h3>
                
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {content.content_text.substring(0, 100) + '...'}
                </p>

                {/* Content Meta */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(content.created_at).toLocaleDateString()}</span>
                    <span>{content.word_count || content.content_text.length} chars</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {currentContent.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
              <p className="text-gray-600">
                No {activeTab} content available for image generation.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Image Generation */}
      <div className="flex-1 flex flex-col">
        {selectedContent ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Generate Image for Content
                  </h2>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      {getContentTypeIcon(selectedContent.content_type)}
                      <span className="capitalize font-medium">{selectedContent.content_type}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedContent.status)}
                      <span className="capitalize">{selectedContent.status}</span>
                    </div>
                    {selectedContent.image_url && (
                      <>
                        <span>•</span>
                        <div className="flex items-center space-x-2 text-teal-600">
                          <Camera className="w-4 h-4" />
                          <span className="font-medium">Has Image</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {selectedContent.image_url && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-teal-200">
                    <img
                      src={selectedContent.image_url}
                      alt="Current image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* AI Suggested Prompts */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Wand2 className="w-5 h-5 mr-3 text-teal-500" />
                    AI Suggested Prompts
                  </h3>
                  <button
                    onClick={handleGenerateFromAISuggestions}
                    disabled={isGenerating || suggestedPrompts.length === 0}
                    className="px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {isGenerating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>Generate Images</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {suggestedPrompts.map((prompt, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-slate-50 to-teal-50 rounded-xl border border-gray-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0 mt-0.5">
                          <span className="text-sm font-semibold text-slate-600">{index + 1}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed flex-1">{prompt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Prompt */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Edit3 className="w-5 h-5 mr-3 text-slate-500" />
                  Custom Prompt
                </h3>

                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Describe the image you want to generate..."
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none h-32 transition-all duration-200"
                    />
                  </div>
                  
                  {showOptimized && optimizedPrompt && (
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-900 mb-2">Optimized Prompt:</h4>
                          <p className="text-sm text-blue-800 leading-relaxed">{optimizedPrompt}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleOptimizePrompt}
                      disabled={!customPrompt.trim()}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200"
                    >
                      <Wand2 className="w-4 h-4" />
                      <span>Optimize Prompt</span>
                    </button>
                    
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    
                    <button
                      onClick={handleGenerateFromCustom}
                      disabled={!customPrompt.trim() || isGenerating}
                      className="px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      {isGenerating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      <span>Generate Images</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Generated Images */}
              {generatedImages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <ImageIcon className="w-5 h-5 mr-3 text-green-500" />
                    Generated Images
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {generatedImages.map((image, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={image.url}
                            alt={`Generated ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => window.open(image.url, '_blank')}
                              className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2 text-sm transition-all duration-200"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download</span>
                            </button>
                            
                            <button
                              onClick={() => handleAttachImage(image.url, image.revised_prompt || '')}
                              className="flex-1 px-3 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 flex items-center justify-center space-x-2 text-sm transition-all duration-200"
                            >
                              <Link className="w-4 h-4" />
                              <span>Attach</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isGenerating && generatedImages.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <RefreshCw className="w-8 h-8 text-slate-600 animate-spin" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Generating Images</h3>
                  <p className="text-gray-600">Creating AI-powered visuals for your content...</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-gradient-to-r from-slate-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Select Content to Begin</h3>
              <p className="text-gray-600 leading-relaxed">
                Choose content from the left panel to start generating professional AI images for your LinkedIn posts.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
