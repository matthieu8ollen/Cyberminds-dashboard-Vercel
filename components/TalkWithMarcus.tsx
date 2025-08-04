'use client'

import { useState, useEffect } from 'react'
import { User, ArrowRight, Send, Lightbulb, Target, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useWorkflow } from '../contexts/WorkflowContext'
import { 
  createIdeationSession, 
  updateIdeationSession, 
  IdeationSession, 
  IdeationOutput 
} from '../lib/supabase'

interface Message {
  id: string
  type: 'user' | 'marcus'
  content: string
  timestamp: Date
}

interface TalkWithMarcusProps {
  onIdeationComplete?: (ideation: IdeationOutput) => void
  onNavigateToCreate?: (mode: 'express' | 'standard' | 'power', ideationData: any) => void
}

export default function TalkWithMarcus({ onIdeationComplete, onNavigateToCreate }: TalkWithMarcusProps = {}) {
  const { user } = useAuth()
  const { startIdeation } = useWorkflow()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentSession, setCurrentSession] = useState<IdeationSession | null>(null)
  const [ideationOutput, setIdeationOutput] = useState<Partial<IdeationOutput>>({})
  const [conversationStage, setConversationStage] = useState<'initial' | 'topic-clarification' | 'angle-selection' | 'takeaways' | 'complete'>('initial')

  useEffect(() => {
    // Initialize conversation
    addMarcusMessage("👋 Hi! I'm Marcus, your ideation partner. I'm here to help you develop compelling LinkedIn content ideas.\n\nWhat would you like to write about today? You can be as specific or as general as you'd like - I'll help you refine it!")
  }, [])

  const addMessage = (type: 'user' | 'marcus', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const addMarcusMessage = (content: string) => {
    setIsTyping(true)
    setTimeout(() => {
      addMessage('marcus', content)
      setIsTyping(false)
    }, 1000)
  }

  const createOrUpdateSession = async (updates: Partial<IdeationSession>) => {
    if (!user) return

    try {
      if (!currentSession) {
        // Create new session
        const { data } = await createIdeationSession({
          user_id: user.id,
          page_type: 'talk_with_marcus',
          session_data: { messages, stage: conversationStage },
          status: 'in_progress',
          ...updates
        })
        if (data) setCurrentSession(data)
      } else {
        // Update existing session
        const { data } = await updateIdeationSession(currentSession.id, {
          session_data: { messages, stage: conversationStage },
          ...updates
        })
        if (data) setCurrentSession(data)
      }
    } catch (error) {
      console.error('Session management error:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    const userMessage = inputText.trim()
    addMessage('user', userMessage)
    setInputText('')
    setIsTyping(true)

    // Process message based on conversation stage
    setTimeout(() => {
      processUserInput(userMessage)
    }, 1500)
  }

  const processUserInput = async (input: string) => {
  switch (conversationStage) {
    case 'initial':
      handleInitialTopic(input)
      break
    case 'topic-clarification':
      handleTopicClarification(input)
      break
    case 'angle-selection':
      handleAngleSelection(input)
      break
    case 'takeaways':
      await handleTakeawaysConfirmation(input)
      break
  }
}

  const handleInitialTopic = (input: string) => {
    // Extract topic from user input
    const topic = input
    setIdeationOutput(prev => ({ ...prev, topic }))
    
    // Mock Marcus analysis - in real implementation, this would call Marcus RAG
    const clarificationQuestions = [
      "Great topic! Let me help you refine this.",
      "",
      "A few quick questions to nail the perfect angle:",
      "• Are you targeting CFOs, CMOs, CEOs, or a broader audience?",
      "• Do you want to take a tactical approach (how-to) or a contrarian stance (myth-busting)?",
      "• Are you looking to share insights from experience or data-driven analysis?",
      "",
      "Feel free to answer any or all of these - or just tell me what direction feels right to you!"
    ].join('\n')

    addMarcusMessage(clarificationQuestions)
    setConversationStage('topic-clarification')
    createOrUpdateSession({ topic })
  }

  const handleTopicClarification = (input: string) => {
    // Generate angles based on user input
    const angles = generateAngles(ideationOutput.topic || '', input)
    
    const anglePresentation = [
      "Perfect! Based on what you've shared, here are 3 strategic angles for your content:",
      "",
      ...angles.map((angle, index) => [
        `**${index + 1}. ${angle.title}**`,
        angle.description,
        `*${angle.preview}*`,
        ""
      ]).flat(),
      "Which angle resonates most with you? You can pick a number (1, 2, or 3) or tell me if you'd like to explore a different direction."
    ].join('\n')

    addMarcusMessage(anglePresentation)
    setConversationStage('angle-selection')
  }

  const handleAngleSelection = (input: string) => {
    // Parse angle selection
    let selectedAngle = ""
    if (input.includes('1') || input.toLowerCase().includes('first')) {
      selectedAngle = "Tactical/Implementation approach"
    } else if (input.includes('2') || input.toLowerCase().includes('second')) {
      selectedAngle = "Contrarian/Myth-busting perspective"
    } else if (input.includes('3') || input.toLowerCase().includes('third')) {
      selectedAngle = "Data-driven/Analytical approach"
    } else {
      selectedAngle = input // User provided custom angle
    }

    setIdeationOutput(prev => ({ ...prev, angle: selectedAngle }))

    // Generate takeaways
    const takeaways = generateTakeaways(ideationOutput.topic || '', selectedAngle)
    
    const takeawaysPresentation = [
  `Excellent choice! Here are the key takeaways for your "${selectedAngle}" approach:`,
  "",
  ...takeaways.map((takeaway, index) => `${index + 1}. ${takeaway}`),
  "",
  "These takeaways are designed to provide immediate value to your audience.",
  "",
  "✅ **Type 'yes' below** to proceed with this content foundation and unlock creation modes!",
  "",
  "Or let me know what you'd like to adjust."
].join('\n')

    addMarcusMessage(takeawaysPresentation)
    setIdeationOutput(prev => ({ ...prev, takeaways }))
    setConversationStage('takeaways')
  }

  const handleTakeawaysConfirmation = async (input: string) => {
  if (input.toLowerCase().includes('yes') || input.toLowerCase().includes('looks good') || input.toLowerCase().includes('perfect')) {
    // Complete ideation
    const completedIdeation: IdeationOutput = {
      topic: ideationOutput.topic || '',
      angle: ideationOutput.angle || '',
      takeaways: ideationOutput.takeaways || [],
      source_page: 'talk_with_marcus',
      session_id: currentSession?.id || ''
    }

    const completionMessage = [
  "🎉 Perfect! Your content foundation is ready:",
  "",
  `**Topic:** ${completedIdeation.topic}`,
  `**Angle:** ${completedIdeation.angle}`,
  `**Key Takeaways:** ${completedIdeation.takeaways.length} value points`,
  "",
  "Choose your creation mode below to get started!"
].join('\n')

addMarcusMessage(completionMessage)
setConversationStage('complete')

// Set the completed ideation data for the action buttons
setIdeationOutput(completedIdeation)
    
    // Update session first
    await createOrUpdateSession({ 
      status: 'completed',
      topic: completedIdeation.topic,
      angle: completedIdeation.angle,
      takeaways: completedIdeation.takeaways
    })

    // Save to workflow system
    try {
      await startIdeation(completedIdeation)
    } catch (error) {
      console.error('Error saving to workflow:', error)
    }

    // Trigger completion callback if provided
    if (onIdeationComplete) {
      onIdeationComplete(completedIdeation)
    }
  } else {
    addMarcusMessage("No problem! What would you like to adjust? I can help you refine the topic, explore a different angle, or modify the takeaways.")
  }
}

  // Mock functions - in real implementation, these would call Marcus RAG
  const generateAngles = (topic: string, context: string) => [
    {
      title: "Tactical Implementation",
      description: "Step-by-step framework your audience can immediately apply",
      preview: `"The 5-step framework for ${topic} that actually works"`
    },
    {
      title: "Contrarian Perspective", 
      description: "Challenge common beliefs and share a different viewpoint",
      preview: `"Why everything you know about ${topic} is wrong"`
    },
    {
      title: "Data-Driven Analysis",
      description: "Use statistics and insights to support your points",
      preview: `"The surprising data behind ${topic} (and what it means for you)"`
    }
  ]

  const generateTakeaways = (topic: string, angle: string) => [
    `Key insight about ${topic} that most professionals miss`,
    `Practical step you can implement immediately`,
    `Common mistake to avoid when dealing with ${topic}`,
    `Data point that changes how you think about this`,
    `Action item for next week`
  ]

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <User className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Talk with Marcus</h1>
        <p className="text-gray-600">Conversational ideation to develop your next LinkedIn post</p>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-slate-700 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {message.type === 'marcus' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-slate-700 to-teal-600 rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Marcus</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-slate-700 to-teal-600 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
              rows={2}
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                inputText.trim() && !isTyping
                  ? 'bg-slate-700 text-white hover:bg-slate-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      {conversationStage !== 'initial' && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-900">Progress</span>
            <span className="text-gray-600">
              {conversationStage === 'topic-clarification' && '1/3 - Refining topic'}
              {conversationStage === 'angle-selection' && '2/3 - Selecting angle'}
              {conversationStage === 'takeaways' && '3/3 - Finalizing takeaways'}
              {conversationStage === 'complete' && '✅ Complete'}
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
  className="bg-gradient-to-r from-slate-700 to-teal-600 h-2 rounded-full transition-all duration-500"
  style={{ 
    width: conversationStage === 'topic-clarification' ? '33%' : 
           conversationStage === 'angle-selection' ? '66%' : 
           conversationStage === 'takeaways' ? '100%' : 
           conversationStage === 'complete' ? '100%' : '0%'
  }}
></div>
          </div>
        </div>
      )}

      {/* Completion Actions */}
{conversationStage === 'complete' && (
        <div className="mt-6 bg-gradient-to-r from-slate-50 to-teal-50 rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to Create Content!</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <button 
  onClick={() => {
    if (onNavigateToCreate && ideationOutput.topic) {
      onNavigateToCreate('express', {
  topic: ideationOutput.topic,
  angle: ideationOutput.angle,
  takeaways: ideationOutput.takeaways,
  source_page: 'talk_with_marcus',
  session_id: currentSession?.id
})
    }
  }}
  className="flex items-center space-x-3 bg-white border border-gray-200 rounded-lg p-4 hover:border-slate-500 transition-colors"
>
  <Lightbulb className="w-5 h-5 text-yellow-600" />
  <div className="text-left">
    <div className="font-medium text-gray-900">Express Mode</div>
    <div className="text-sm text-gray-600">Quick generation</div>
  </div>
</button>

<button 
  onClick={() => {
    if (onNavigateToCreate && ideationOutput.topic) {
      onNavigateToCreate('standard', {
        topic: ideationOutput.topic,
        angle: ideationOutput.angle,
        takeaways: ideationOutput.takeaways,
        source_page: 'talk_with_marcus'
      })
    }
  }}
  className="flex items-center space-x-3 bg-white border border-gray-200 rounded-lg p-4 hover:border-slate-500 transition-colors"
>
  <Target className="w-5 h-5 text-blue-600" />
  <div className="text-left">
    <div className="font-medium text-gray-900">Standard Mode</div>
    <div className="text-sm text-gray-600">Full customization</div>
  </div>
</button>

<button 
  onClick={() => {
    if (onNavigateToCreate && ideationOutput.topic) {
      onNavigateToCreate('power', {
        topic: ideationOutput.topic,
        angle: ideationOutput.angle,
        takeaways: ideationOutput.takeaways,
        source_page: 'talk_with_marcus'
      })
    }
  }}
  className="flex items-center space-x-3 bg-white border border-gray-200 rounded-lg p-4 hover:border-slate-500 transition-colors"
>
  <TrendingUp className="w-5 h-5 text-green-600" />
  <div className="text-left">
    <div className="font-medium text-gray-900">Writer Suite</div>
    <div className="text-sm text-gray-600">Comprehensive</div>
  </div>
</button>
          </div>
        </div>
      )}
    </div>
  )
}
