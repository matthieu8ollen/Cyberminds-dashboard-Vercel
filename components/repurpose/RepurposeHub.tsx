'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { createIdeationSession, updateIdeationSession, IdeationSession } from '../../lib/supabase'
import BlogInput from './BlogInput'
import VoiceUpload from './VoiceUpload'
import YouTubeInput from './YouTubeInput'
import LinkedInInput from './LinkedInInput'
import { 
  FileText, 
  Mic, 
  Youtube, 
  Linkedin,
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
  const [currentError, setCurrentError] = useState('')

  // Reset state when changing tabs
  useEffect(() => {
    setCurrentError('')
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

  const handleProcessContent = async (input: string | File) => {
    if (!user) return

    setCurrentError('')
    
    try {
      setProcessingStage('processing')
      
      // Prepare session data based on input type
      let sessionUpdate: Partial<RepurposeSession> = {
        repurpose_type: activeType,
        processing_status: 'processing'
      }

      if (typeof input === 'string') {
        // Text input (blog content or URLs)
        if (activeType === 'blog') {
          sessionUpdate.original_content = input
        } else {
          sessionUpdate.source_url = input
        }
      } else {
        // File input (voice recording)
        sessionUpdate.file_reference = input.name
        sessionUpdate.source_title = input.name
      }

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
      setCurrentError('Failed to process content. Please try again.')
      setSessionData(prev => ({
        ...prev,
        processing_status: 'error',
        error_message: 'Failed to process content. Please try again.'
      }))
    }
  }

  const currentType = REPURPOSE_TYPES.find(t => t.id === activeType)!

  const renderInput = () => {
    const isProcessing = processingStage === 'processing'
    
    switch (activeType) {
      case 'blog':
        return (
          <BlogInput
            onProcess={handleProcessContent}
            isProcessing={isProcessing}
            error={currentError}
          />
        )

      case 'voice':
        return (
          <VoiceUpload
            onProcess={handleProcessContent}
            isProcessing={isProcessing}
            error={currentError}
          />
        )

      case 'youtube':
        return (
          <YouTubeInput
            onProcess={handleProcessContent}
            isProcessing={isProcessing}
            error={currentError}
          />
        )

      case 'linkedin':
        return (
          <LinkedInInput
            onProcess={handleProcessContent}
            isProcessing={isProcessing}
            error={currentError}
          />
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
              {currentError || 'Something went wrong. Please try again.'}
            </p>
            <button
              onClick={() => {
                setProcessingStage('input')
                setCurrentError('')
              }}
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
    // This is now handled by individual input components
    return true
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
        {processingStage === 'input' && renderInput()}

        {/* Processing States */}
        {processingStage !== 'input' && renderProcessingState()}
      </div>
    </div>
  )
}
