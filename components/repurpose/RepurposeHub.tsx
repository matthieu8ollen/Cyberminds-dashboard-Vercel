'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { createIdeationSession, updateIdeationSession, IdeationSession } from '../../lib/supabase'
import { 
  FileText, 
  Mic, 
  Youtube, 
  Linkedin,
  Upload,
  Link,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

type RepurposeType = 'blog' | 'voice' | 'youtube' | 'linkedin'
type ProcessingStage = 'input' | 'processing' | 'completed' | 'error'

interface RepurposeHubProps {
  onIdeationComplete?: (ideation: any) => void
  onNavigateToCreate?: (mode: 'standard' | 'power', ideationData: any) => void
}

interface RepurposeSession {
  repurpose_type: RepurposeType
  source_url?: string
  source_title?: string
  original_content?: string
  file_reference?: string
  processing_status: ProcessingStage
  generated_ideas_count?: number
  error_message?: string
}

const REPURPOSE_TYPES = [
  {
    id: 'blog' as RepurposeType,
    name: 'Blog/Articles',
    description: 'Paste your blog content to generate LinkedIn ideas',
    icon: FileText,
    placeholder: 'Paste your blog article or written content here...',
    inputType: 'textarea'
  },
  {
    id: 'voice' as RepurposeType,
    name: 'Voice Notes',
    description: 'Upload audio files to transform into content ideas',
    icon: Mic,
    placeholder: 'Upload your voice recording (MP3, WAV, M4A, OGG - Max 25MB)',
    inputType: 'file'
  },
  {
    id: 'youtube' as RepurposeType,
    name: 'YouTube Videos',
    description: 'Extract ideas from YouTube video content',
    icon: Youtube,
    placeholder: 'https://youtube.com/watch?v=...',
    inputType: 'url'
  },
  {
    id: 'linkedin' as RepurposeType,
    name: 'LinkedIn Posts',
    description: 'Transform LinkedIn posts into new content formulas',
    icon: Linkedin,
    placeholder: 'https://linkedin.com/posts/...',
    inputType: 'url'
  }
]

export default function RepurposeHub({ onIdeationComplete, onNavigateToCreate }: RepurposeHubProps) {
  const { user } = useAuth()
  const [activeType, setActiveType] = useState<RepurposeType>('blog')
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('input')
  const [currentSession, setCurrentSession] = useState<IdeationSession | null>(null)
  const [sessionData, setSessionData] = useState<RepurposeSession>({
    repurpose_type: 'blog',
    processing_status: 'input'
  })
  
  // Input states
  const [textInput, setTextInput] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [urlError, setUrlError] = useState('')

  // Reset state when changing tabs
  useEffect(() => {
    setTextInput('')
    setUrlInput('')
    setSelectedFile(null)
    setUrlError('')
    setProcessingStage('input')
    setSessionData(prev => ({
      ...prev,
      repurpose_type: activeType,
      processing_status: 'input',
      source_url: undefined,
      original_content: undefined,
      file_reference: undefined,
      error_message: undefined
    }))
  }, [activeType])

  const validateUrl = (url: string, type: RepurposeType): boolean => {
    setUrlError('')
    
    if (!url.trim()) {
      setUrlError('Please enter a URL')
      return false
    }

    try {
      const urlObj = new URL(url)
      
      if (type === 'youtube') {
        const isYoutube = urlObj.hostname.includes('youtube.com') || 
                         urlObj.hostname.includes('youtu.be')
        if (!isYoutube) {
          setUrlError('Please enter a valid YouTube URL')
          return false
        }
      }
      
      if (type === 'linkedin') {
        const isLinkedIn = urlObj.hostname.includes('linkedin.com')
        if (!isLinkedIn) {
          setUrlError('Please enter a valid LinkedIn URL')
          return false
        }
      }
      
      return true
    } catch {
      setUrlError('Please enter a valid URL')
      return false
    }
  }

  const handleFileUpload = (file: File) => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/ogg']
    const maxSize = 25 * 1024 * 1024 // 25MB

    if (!validTypes.includes(file.type)) {
      setUrlError('Please upload MP3, WAV, M4A, or OGG files only')
      return
    }

    if (file.size > maxSize) {
      setUrlError('File size must be less than 25MB')
      return
    }

    setSelectedFile(file)
    setUrlError('')
  }

  const handleDragEvents = {
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(true)
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      
      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileUpload(files[0])
      }
    }
  }

  const handleProcess = async () => {
    if (!user) return

    // Validate input based on type
    let isValid = false
    let sessionUpdate: Partial<RepurposeSession> = {
      repurpose_type: activeType,
      processing_status: 'processing'
    }

    switch (activeType) {
      case 'blog':
        if (textInput.trim().length < 50) {
          setUrlError('Please enter at least 50 characters of content')
          return
        }
        sessionUpdate.original_content = textInput.trim()
        isValid = true
        break
        
      case 'voice':
        if (!selectedFile) {
          setUrlError('Please select an audio file to upload')
          return
        }
        sessionUpdate.file_reference = selectedFile.name
        sessionUpdate.source_title = selectedFile.name
        isValid = true
        break
        
      case 'youtube':
      case 'linkedin':
        if (!validateUrl(urlInput, activeType)) {
          return
        }
        sessionUpdate.source_url = urlInput.trim()
        isValid = true
        break
    }

    if (!isValid) return

    try {
      setProcessingStage('processing')
      
      // Create ideation session
      const { data: session, error } = await createIdeationSession({
        user_id: user.id,
        page_type: 'repurpose_content',
        session_data: sessionUpdate,
        status: 'in_progress'
      })

      if (error) throw error
      
      setCurrentSession(session)
      setSessionData(prev => ({ ...prev, ...sessionUpdate }))

      // TODO: Send to AI agent for processing
      // For now, simulate processing
      setTimeout(() => {
        setProcessingStage('completed')
        // Simulate successful processing
        const mockResults = {
          topic: `Content ideas from ${activeType}`,
          angle: 'Repurposed content perspective',
          takeaways: [
            'Key insight from original content',
            'Strategic takeaway for LinkedIn',
            'Actionable advice for audience'
          ],
          source_page: 'repurpose_content',
          session_id: session.id
        }
        
        if (onIdeationComplete) {
          onIdeationComplete(mockResults)
        }
      }, 3000)

    } catch (error) {
      console.error('Error processing content:', error)
      setProcessingStage('error')
      setSessionData(prev => ({
        ...prev,
        processing_status: 'error',
        error_message: 'Failed to process content. Please try again.'
      }))
    }
  }

  const currentType = REPURPOSE_TYPES.find(t => t.id === activeType)!

  const renderInput = () => {
    switch (activeType) {
      case 'blog':
        return (
          <div className="space-y-4">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={currentType.placeholder}
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-vertical"
              disabled={processingStage === 'processing'}
            />
            <div className="text-sm text-gray-500">
              {textInput.length}/50 characters minimum
            </div>
          </div>
        )

      case 'voice':
        return (
          <div className="space-y-4">
            <div
              {...handleDragEvents}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${processingStage === 'processing' ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  {selectedFile ? selectedFile.name : 'Drop your audio file here'}
                </p>
                <p className="text-gray-600">
                  {selectedFile 
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB - Ready to process`
                    : 'or click to browse files'
                  }
                </p>
                <input
                  type="file"
                  accept="audio/mpeg,audio/wav,audio/m4a,audio/ogg"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                  className="hidden"
                  id="audio-upload"
                  disabled={processingStage === 'processing'}
                />
                <label
                  htmlFor="audio-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  Choose File
                </label>
              </div>
              <div className="text-xs text-gray-500 mt-4">
                Supported: MP3, WAV, M4A, OGG (Max 25MB)
              </div>
            </div>
          </div>
        )

      case 'youtube':
      case 'linkedin':
        return (
          <div className="space-y-4">
            <div className="relative">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={currentType.placeholder}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                disabled={processingStage === 'processing'}
              />
            </div>
            <div className="text-sm text-gray-600">
              {activeType === 'youtube' 
                ? 'Paste the full YouTube video URL to extract content ideas'
                : 'Paste the LinkedIn post URL to generate new content formulas and ideas'
              }
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const renderProcessingState = () => {
    switch (processingStage) {
      case 'processing':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Processing Your Content
            </h3>
            <p className="text-blue-800">
              Marcus is analyzing your {currentType.name.toLowerCase()} and generating content ideas...
            </p>
          </div>
        )

      case 'completed':
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Content Ideas Generated!
            </h3>
            <p className="text-green-800 mb-4">
              Successfully transformed your content into LinkedIn-ready ideas.
            </p>
            <button
              onClick={() => {
                // Navigation will be handled by parent component
                console.log('Navigate to ideas or content creation')
              }}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              View Ideas
            </button>
          </div>
        )

      case 'error':
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Processing Failed
            </h3>
            <p className="text-red-800 mb-4">
              {sessionData.error_message || 'Something went wrong. Please try again.'}
            </p>
            <button
              onClick={() => setProcessingStage('input')}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        )

      default:
        return null
    }
  }

  const canProcess = () => {
    switch (activeType) {
      case 'blog':
        return textInput.trim().length >= 50
      case 'voice':
        return selectedFile !== null
      case 'youtube':
      case 'linkedin':
        return urlInput.trim().length > 0
      default:
        return false
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <currentType.icon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Repurpose Content
        </h1>
        <p className="text-gray-600">
          Transform existing content into LinkedIn-ready ideas
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {REPURPOSE_TYPES.map((type) => {
            const Icon = type.icon
            const isActive = activeType === type.id
            
            return (
              <button
                key={type.id}
                onClick={() => setActiveType(type.id)}
                disabled={processingStage === 'processing'}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition ${
                  isActive
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } ${processingStage === 'processing' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon className="w-4 h-4" />
                <span>{type.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {processingStage === 'input' && (
          <>
            {/* Input Description */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                {currentType.name}
              </h3>
              <p className="text-gray-600 text-sm">
                {currentType.description}
              </p>
            </div>

            {/* Input Component */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              {renderInput()}
              
              {/* Error Message */}
              {urlError && (
                <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {urlError}
                </div>
              )}

              {/* Process Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleProcess}
                  disabled={!canProcess() || processingStage === 'processing'}
                  className="bg-teal-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Generate Ideas
                </button>
              </div>
            </div>
          </>
        )}

        {/* Processing States */}
        {processingStage !== 'input' && renderProcessingState()}
      </div>
    </div>
  )
}
