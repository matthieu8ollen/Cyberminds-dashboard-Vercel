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
  Archive,
  BarChart3,
  Target,
  TrendingUp,
  AlertCircle,
  User,
  Zap,
  FileText
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
    publishedContent,
    archivedContent,
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
  const [activeTab, setActiveTab] = useState<'scheduled' | 'draft' | 'published' | 'archived'>('scheduled')

  // Combine all content
  const allContent = {
    scheduled: scheduledContent,
    draft: draftContent,
    published: publishedContent,
    archived: archivedContent
  }

  const currentContent = allContent[activeTab]

  useEffect(() => {
    if (selectedContent) {
      const prompts = generatePromptSuggestions(selectedContent)
      setSuggestedPrompts(prompts)
    }
  }, [selectedContent])

  const handleContentSelect = (content: any) => {
    setSelectedContent(content)
    setGeneratedImages([])
    setCustomPrompt('')
    setOptimizedPrompt('')
  }

  const handleOptimizePrompt = () => {
    if (customPrompt.trim()) {
      const optimized = optimizePrompt(customPrompt)
      setOptimizedPrompt(optimized)
    }
  }

  const handleGenerateImages = async (prompt: string) => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const response = await generateImagesMock({ prompt, n: 3 })
      setGeneratedImages(response.data)
      showToast('success', 'Images generated successfully!')
    } catch (error) {
      showToast('error', 'Failed to generate images')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAttachImage = async (imageUrl: string, prompt: string) => {
    if (!selectedContent || !user) return

    try {
      // Update content with image URL
      const success = await updateContent(selectedContent.id, {
        image_url: imageUrl
      })

      if (success) {
        // Save to generated_images table
        await saveGeneratedImage({
          user_id: user.id,
          content_id: selectedContent.id,
          image_url: imageUrl,
          original_prompt: prompt,
          optimized_prompt: prompt
        })

        showToast('success', 'Image attached to content!')
        refreshContent()
        
        // Update local state
        setSelectedContent(prev => ({ ...prev, image_url: imageUrl }))
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit3 className="w-4 h-4" />
      case 'scheduled': return <Clock className="w-4 h-4" />
      case 'published': return <CheckCircle className="w-4 h-4" />
      case 'archived': return <Archive className="w-4 h-4" />
      default: return <Edit3 className="w-4 h-4" />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Content Selection */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Image Generation</h1>
          <p className="text-sm text-gray-600">Generate AI images for your content</p>
        </div>

        {/* Content Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {(['scheduled', 'draft', 'published', 'archived'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? 'text-slate-700 border-b-2 border-slate-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {currentContent.map((content) => (
              <div
                key={content.id}
                onClick={() => handleContentSelect(content)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedContent?.id === content.id
                    ? 'border-slate-700 bg-slate-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getContentTypeIcon(content.content_type)}
                    {getCreationModeIcon(content)}
                  </div>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(content.status)}
                    {content.image_url && (
                      <Camera className="w-4 h-4 text-teal-500" />
                    )}
                  </div>
                </div>
                
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                  {content.title || content.content_text.split('\n')[0].substring(0, 50) + '...'}
                </h3>
                
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {content.content_text.substring(0, 100) + '...'}
                </p>
              </div>
            ))}
          </div>

          {currentContent.length === 0 && (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
              <p className="text-gray-600">No {activeTab} content available for image generation.</p>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Generate Image for Content
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {getContentTypeIcon(selectedContent.content_type)}
                <span className="capitalize">{selectedContent.content_type}</span>
                <span>•</span>
                <span className="capitalize">{selectedContent.status}</span>
                {selectedContent.image_url && (
                  <>
                    <span>•</span>
                    <Camera className="w-4 h-4 text-teal-500" />
                    <span className="text-teal-600">Has Image</span>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* AI Suggested Prompts */}
              <div className="mb-8">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-teal-500" />
                  AI Suggested Prompts
                </h3>
                <div className="space-y-3">
                  {suggestedPrompts.map((prompt, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 flex-1 mr-4">{prompt}</p>
                      <button
                        onClick={() => handleGenerateImages(prompt)}
                        disabled={isGenerating}
                        className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isGenerating ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                        <span>Generate</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Prompt */}
              <div className="mb-8">
                <h3 className="font-medium text-gray-900 mb-4">Custom Prompt</h3>
                <div className="space-y-3">
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Describe the image you want to generate..."
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none h-24"
                  />
                  
                  {optimizedPrompt && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Optimized Prompt:</h4>
                      <p className="text-sm text-blue-800">{optimizedPrompt}</p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={handleOptimizePrompt}
                      disabled={!customPrompt.trim()}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Optimize</span>
                    </button>
                    
                    <button
                      onClick={() => handleGenerateImages(optimizedPrompt || customPrompt)}
                      disabled={!customPrompt.trim() || isGenerating}
                      className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isGenerating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      <span>Generate</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Generated Images */}
              {generatedImages.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Generated Images</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {generatedImages.map((image, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={image.url}
                          alt={`Generated ${index + 1}`}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => window.open(image.url, '_blank')}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download</span>
                            </button>
                            
                            <button
                              onClick={() => handleAttachImage(image.url, image.revised_prompt || '')}
                              className="flex-1 px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 flex items-center justify-center space-x-2"
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
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 text-slate-700 animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Generating Images</h3>
                  <p className="text-gray-600">This may take a few moments...</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select Content</h3>
              <p className="text-gray-600">Choose content from the left panel to generate images</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
