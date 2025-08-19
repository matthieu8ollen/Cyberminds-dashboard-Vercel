'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useContent } from '../contexts/ContentContext'
import { useToast } from './ToastNotifications'
import { generateImagesMock } from '../lib/imageGenerationService'
import { generatePromptSuggestions, optimizePrompt } from '../lib/promptOptimizationService'
import { saveGeneratedImage } from '../lib/supabase'
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

interface ImageGenerationProps {
  inStrictWorkflow?: boolean
  onCompleteWorkflow?: () => void
  onExitWorkflow?: () => void
}

export default function ImageGeneration({ 
  inStrictWorkflow = false, 
  onCompleteWorkflow, 
  onExitWorkflow 
}: ImageGenerationProps) {
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
  const [aiGeneratedImages, setAiGeneratedImages] = useState<GeneratedImage[]>([])
  const [customGeneratedImages, setCustomGeneratedImages] = useState<GeneratedImage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'draft' | 'scheduled'>('draft')
  const [showOptimized, setShowOptimized] = useState(false)
  const [promptMode, setPromptMode] = useState<'ai' | 'custom'>('ai')
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null)

  // Only show draft and scheduled content
  const currentContent = activeTab === 'draft' ? draftContent : scheduledContent

  useEffect(() => {
    if (selectedContent) {
      const prompts = generatePromptSuggestions(selectedContent)
      setSuggestedPrompts(prompts)
      setAiGeneratedImages([])
      setCustomGeneratedImages([])
      setCustomPrompt('')
      setOptimizedPrompt('')
      setShowOptimized(false)
    }
  }, [selectedContent])

  // Auto-select content if coming from Production Pipeline or Workflow
useEffect(() => {
  // Check for workflow content first
  const workflowContentId = localStorage.getItem('workflowContentId')
  if (workflowContentId && inStrictWorkflow) {
    const allContent = [...draftContent, ...scheduledContent]
    const workflowContent = allContent.find(c => c.id === workflowContentId)
    
    if (workflowContent) {
      console.log('🎯 Auto-selecting workflow content:', workflowContent.title)
      setSelectedContent(workflowContent)
      setActiveTab('draft') // Workflow content is always draft
      // Clear the workflow content ID
      localStorage.removeItem('workflowContentId')
      return
    }
  }
  
  // Fallback to Production Pipeline selection
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
}, [draftContent, scheduledContent, inStrictWorkflow])

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

  const handleGenerateFromAI = async () => {
    if (!selectedContent) return

    setIsGenerating(true)
    try {
      // AI agent will generate content-specific images based on the selected content
      const aiPrompt = `Generate professional LinkedIn image for ${selectedContent.content_type} content`
      const response = await generateImagesMock({ prompt: aiPrompt, n: 3 })
      setAiGeneratedImages(response.data)
      showToast('success', 'AI images generated successfully!')
    } catch (error) {
      showToast('error', 'Failed to generate AI images')
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
      setCustomGeneratedImages(response.data)
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

  const handleRemoveImage = async () => {
    if (!selectedContent || !user) return

    const confirmed = window.confirm('Are you sure you want to remove this image?')
    if (!confirmed) return

    try {
      const success = await updateContent(selectedContent.id, {
        image_url: ''
      })

      if (success) {
        showToast('success', 'Image removed successfully!')
        refreshContent()
        
        setSelectedContent((prev: any) => prev ? { ...prev, image_url: '' } : null)
      } else {
        showToast('error', 'Failed to remove image')
      }
    } catch (error) {
      showToast('error', 'An error occurred while removing image')
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
      {/* Workflow Progress Indicator */}
      {inStrictWorkflow && (
        <div className="fixed top-0 left-16 right-0 z-40 bg-gradient-to-r from-slate-50 to-teal-50 border-b border-teal-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gradient-to-br from-slate-700 to-teal-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-700">Workflow Active: Final Step</span>
                  <div className="text-xs text-slate-600">Add an image to complete your content</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">Step 3 of 3</span>
                <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className={`flex w-full ${inStrictWorkflow ? 'pt-16' : ''}`}>
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
                  <div className="relative">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-teal-200">
                      <img
                        src={selectedContent.image_url}
                        alt="Current image"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md border-2 border-white"
                      title="Remove image"
                    >
                      <span className="text-xs leading-none">✕</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Workflow Completion Panel */}
            {inStrictWorkflow && selectedContent && (
              <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-teal-600" />
                    <div>
                      <h3 className="font-semibold text-teal-900">Complete Your Workflow</h3>
                      <p className="text-sm text-teal-700">Add an image to finish your content creation</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        if (onExitWorkflow) {
                          const confirmed = window.confirm(
                            "Leave without attaching an image? Your content is saved, but you won't complete the full workflow."
                          )
                          if (confirmed) {
                            onExitWorkflow()
                          }
                        }
                      }}
                      className="px-3 py-2 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                    >
                      Exit Workflow
                    </button>
                    
                    <button
                      onClick={() => {
                        if (selectedContent?.image_url && onCompleteWorkflow) {
                          onCompleteWorkflow()
                        } else {
                          showToast('info', 'Please attach an image to complete the workflow')
                        }
                      }}
                      disabled={!selectedContent?.image_url}
                      className={`px-4 py-2 text-sm rounded-lg font-medium transition ${
                        selectedContent?.image_url
                          ? 'bg-teal-600 text-white hover:bg-teal-700'
                          : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Complete Workflow
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto scroll-smooth">
                <div className="p-6">
                  {/* Prompt Mode Toggle */}
                  <div className="border-b border-gray-200 mb-6">
                    <div className="flex space-x-8">
                      <button
                        onClick={() => setPromptMode('ai')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                          promptMode === 'ai'
                            ? 'border-slate-700 text-slate-700'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Wand2 className="w-4 h-4" />
                          <span>AI Suggested</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setPromptMode('custom')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                          promptMode === 'custom'
                            ? 'border-slate-700 text-slate-700'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Edit3 className="w-4 h-4" />
                          <span>Custom Prompt</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* AI Suggested Section */}
                  {promptMode === 'ai' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                          <Sparkles className="w-5 h-5 mr-3 text-teal-500" />
                          Example Images for Your Content
                        </h3>
                        
                        {/* Example Images */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="aspect-square bg-gradient-to-br from-slate-100 to-teal-100 rounded-xl border border-gray-200 flex items-center justify-center">
                            <div className="text-center">
                              <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                              <p className="text-xs text-gray-600">Sample Style 1</p>
                            </div>
                          </div>
                          <div className="aspect-square bg-gradient-to-br from-teal-100 to-slate-100 rounded-xl border border-gray-200 flex items-center justify-center">
                            <div className="text-center">
                              <BarChart3 className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                              <p className="text-xs text-gray-600">Sample Style 2</p>
                            </div>
                          </div>
                          <div className="aspect-square bg-gradient-to-br from-slate-200 to-teal-200 rounded-xl border border-gray-200 flex items-center justify-center">
                            <div className="text-center">
                              <Target className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                              <p className="text-xs text-gray-600">Sample Style 3</p>
                            </div>
                          </div>
                        </div>

                        {/* Generate Button & Text - Always Visible */}
                        <div className="text-center space-y-4">
                          <button
                            onClick={handleGenerateFromAI}
                            disabled={isGenerating}
                            className="px-8 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            {isGenerating ? (
                              <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                              <Sparkles className="w-5 h-5" />
                            )}
                            <span className="font-medium">Generate AI Images</span>
                          </button>
                          <p className="text-sm text-gray-600">
                            Our AI will create images perfectly matched to your {selectedContent?.content_type} content
                          </p>
                        </div>
                      </div>

                      {/* Generated Images for AI */}
                      {aiGeneratedImages.length > 0 && (
                        <div className="mt-8 space-y-6">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <ImageIcon className="w-5 h-5 mr-3 text-green-500" />
                            Generated Images
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {aiGeneratedImages.map((image, index) => (
                              <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                                <div className="aspect-square overflow-hidden cursor-pointer" onClick={() => setSelectedImagePreview(image.url)}>
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
                    </div>
                  )}

                  {/* Custom Prompt Section */}
                  {promptMode === 'custom' && (
                    <div className="space-y-6">
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

                      {/* Generated Images for Custom */}
                      {customGeneratedImages.length > 0 && (
                        <div className="mt-8 space-y-6">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <ImageIcon className="w-5 h-5 mr-3 text-green-500" />
                            Generated Images
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {customGeneratedImages.map((image, index) => (
                              <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                                <div className="aspect-square overflow-hidden cursor-pointer" onClick={() => setSelectedImagePreview(image.url)}>
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
                    </div>
                  )}

                  {/* Loading State */}
                  {isGenerating && aiGeneratedImages.length === 0 && customGeneratedImages.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <RefreshCw className="w-8 h-8 text-slate-600 animate-spin" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Generating Images</h3>
                      <p className="text-gray-600">Creating AI-powered visuals for your content...</p>
                    </div>
                  )}
                </div>
              </div>
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

      {/* Image Preview Modal */}
      {selectedImagePreview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImagePreview(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img
              src={selectedImagePreview}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedImagePreview(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <span className="text-xl leading-none">✕</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
