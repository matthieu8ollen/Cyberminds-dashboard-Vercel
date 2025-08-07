'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { createIdeationSession, updateIdeationSession, IdeationSession } from '../../lib/supabase'
import { REPURPOSE_CONFIG, isWebhookConfigured, getSourceBadge } from '../../lib/repurposeConfig'
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

  // Backend integration states
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
  const [currentStatus, setCurrentStatus] = useState('')
  const [showRetryButton, setShowRetryButton] = useState(false)
  const [lastProcessedInput, setLastProcessedInput] = useState<string | File | null>(null)

  // Webhook integration functions
  const callRepurposeAI = async (input: string | File, repurposeType: RepurposeType, sessionId: string) => {
    // Check if webhook is configured
    if (!isWebhookConfigured()) {
      console.warn('⚠️ Webhook URL not configured, using fallback')
      return { success: false, error: 'Backend not configured' }
    }
    
    try {
      console.log('🚀 Calling Repurpose AI webhook:', { input, repurposeType, sessionId });
      
      // Prepare payload based on input type
      let payload: any = {
        repurpose_type: repurposeType,
        user_id: user?.id,
        session_id: sessionId,
        callback_url: REPURPOSE_CONFIG.CALLBACK_URL,
        timestamp: new Date().toISOString()
      };

      if (typeof input === 'string') {
        // Text input (blog content or URLs)
        if (repurposeType === 'blog') {
          payload.content = input;
        } else {
          payload.source_url = input;
        }
      } else if (input && typeof input === 'object' && !('name' in input) && 'content' in input) {
        // Blog input with additional data
        payload.content = input.content;
        if (input.target_audience) {
          payload.target_audience = input.target_audience;
        }
        if (input.content_preferences && input.content_preferences.length > 0) {
          payload.content_preferences = input.content_preferences;
        }
        if (input.user_role) {
          payload.user_role = input.user_role;
        }
      } else {
        // File input (voice recording)
        payload.file_name = input.name;
        payload.file_size = input.size;
        // TODO: Handle file upload to storage and pass reference
        payload.file_reference = `temp_${sessionId}_${input.name}`;
      }

      const response = await fetch(REPURPOSE_CONFIG.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('✅ Repurpose AI response:', data);
      return data;
    } catch (error) {
      console.error('❌ Repurpose AI Error:', error);
      return { error: 'Processing failed, please try again' };
    }
  };

  // Poll for AI response from callback
  const pollForRepurposeResponse = async (sessionId: string) => {
    const { MAX_ATTEMPTS, INTERVAL_MS, FALLBACK_MESSAGE_AFTER } = REPURPOSE_CONFIG.POLLING;
    let attempts = 0;
    let fallbackMessageSent = false;
    
    const poll = async (): Promise<any> => {
      try {
        const response = await fetch(`/api/repurpose/callback?session_id=${sessionId}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          if (result.type === 'final') {
            console.log('📨 Received final repurpose response:', result.data);
            return result.data;
          } else if (result.type === 'status') {
            console.log('📝 Status update:', result.data);
            setCurrentStatus(result.data.message);
          }
        }
        
        attempts++;
        
        // Show fallback message after configured attempts
        if (attempts >= FALLBACK_MESSAGE_AFTER && !fallbackMessageSent) {
          setCurrentStatus('This is taking longer than usual...');
          fallbackMessageSent = true;
        }
        
        if (attempts >= MAX_ATTEMPTS) {
          console.log('⏱️ Repurpose response timeout');
          return 'TIMEOUT';
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, INTERVAL_MS));
        return poll();
      } catch (error) {
        console.error('❌ Error polling for repurpose response:', error);
        return 'ERROR';
      }
    };
    
    return poll();
  };

  // Reset state when changing tabs
  useEffect(() => {
    setCurrentError('')
    setCurrentStatus('')
    setShowRetryButton(false)
    setIsWaitingForResponse(false)
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

  const handleRetry = () => {
    setShowRetryButton(false)
    setCurrentError('')
    setCurrentStatus('')
    if (lastProcessedInput) {
      handleProcessContent(lastProcessedInput)
    }
  }

  const handleProcessContent = async (input: string | File | { content: string; target_audience?: string; content_preferences?: string[]; user_role?: string }) => {
    if (!user) return

    setCurrentError('')
    setLastProcessedInput(input)
    
    try {
      setProcessingStage('processing')
      setIsWaitingForResponse(true)
      
      // Generate unique session ID for this request
      const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
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
      } else if (input && typeof input === 'object' && !('name' in input) && 'content' in input) {
        // Blog input with additional data
        sessionUpdate.original_content = input.content
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

      // Call backend webhook
      setCurrentStatus('Analyzing your content...')
      const response = await callRepurposeAI(input, activeType, sessionId)
      
      if (response.message === "Workflow was started" || response.success) {
        console.log('🔄 Processing workflow started, polling for response...')
        
        // Poll for the actual AI response
        const aiResponse = await pollForRepurposeResponse(sessionId)
        
        if (aiResponse === 'TIMEOUT') {
          setCurrentStatus('')
          setProcessingStage('error')
          setCurrentError("Processing is taking longer than expected. Please try again.")
          setShowRetryButton(true)
        } else if (aiResponse === 'ERROR') {
          setCurrentStatus('')
          setProcessingStage('error')
          setCurrentError("Something went wrong while processing your content. Please try again.")
          setShowRetryButton(true)
        } else if (aiResponse && (aiResponse["Key Themes"] || aiResponse.content_ideas)) {
          setCurrentStatus('')
          setProcessingStage('completed')
          
          // Transform AI response to ideation output format
          const ideationResults = {
            topic: (typeof aiResponse.topic === 'string' ? JSON.parse(aiResponse.topic) : aiResponse.topic) || `Content ideas from ${activeType}`,
            angle: aiResponse.angle || 'Repurposed content perspective',
            takeaways: aiResponse["Key Themes"] || aiResponse.content_ideas || [
              'Key insight from original content',
              'Strategic takeaway for LinkedIn',
              'Actionable advice for audience'
            ],
            source_page: 'repurpose_content',
            session_id: session.id,
            repurpose_type: activeType,
            source_badges: getSourceBadge(activeType)
          }
          
          // Update session with results
          await updateIdeationSession(session.id, {
            status: 'completed',
            topic: ideationResults.topic,
            angle: ideationResults.angle,
            takeaways: ideationResults.takeaways
          })
          
          if (onIdeationComplete) {
            onIdeationComplete(ideationResults)
          }
        } else {
          // Fallback for when webhook is not configured or response is incomplete
          console.log('🔄 Using fallback processing...')
          setTimeout(() => {
            setCurrentStatus('')
            setProcessingStage('completed')
            const mockResults = {
              topic: `Content ideas from ${activeType}`,
              angle: 'Repurposed content perspective',
              takeaways: [
                'Key insight from original content',
                'Strategic takeaway for LinkedIn',
                'Actionable advice for audience'
              ],
              source_page: 'repurpose_content',
              session_id: session.id,
              repurpose_type: activeType,
              source_badges: getSourceBadge(activeType)
            }
            
            if (onIdeationComplete) {
              onIdeationComplete(mockResults)
            }
          }, 2000)
        }
      } else {
        throw new Error(response.error || 'Webhook call failed')
      }

    } catch (error) {
      console.error('Error processing content:', error)
      setCurrentStatus('')
      setProcessingStage('error')
      setCurrentError('Failed to process content. Please try again.')
      setShowRetryButton(true)
      setSessionData(prev => ({
        ...prev,
        processing_status: 'error',
        error_message: 'Failed to process content. Please try again.'
      }))
    } finally {
      setIsWaitingForResponse(false)
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
            <p className="text-blue-800 mb-2">
              Marcus is analyzing your {currentType.name.toLowerCase()} and generating content ideas...
            </p>
            {currentStatus && (
              <p className="text-sm text-blue-700 italic">
                {currentStatus}
              </p>
            )}
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
            <div className="space-x-3">
              <button
                onClick={handleRetry}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  setProcessingStage('input')
                  setCurrentError('')
                  setShowRetryButton(false)
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Start Over
              </button>
            </div>
          </div>
        )

      default:
        return null
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
        {processingStage === 'input' && renderInput()}

        {/* Processing States */}
        {processingStage !== 'input' && renderProcessingState()}
      </div>
    </div>
  )
}
