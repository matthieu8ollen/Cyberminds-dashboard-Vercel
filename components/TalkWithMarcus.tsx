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
  onNavigateToCreate?: (mode: 'standard' | 'power', ideationData: any) => void
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
  const [showTopicOverlay, setShowTopicOverlay] = useState(false)

  // NEW: Add these state variables for AI agent responses
const [conversationState, setConversationState] = useState({
  stage: 'initial',
  context: [] as Array<{ user: string; marcus: any }>,
  currentTopic: null as string | null,
  contentPreference: 'auto' as string
})

const [showClarificationQuestions, setShowClarificationQuestions] = useState(false)
const [clarificationData, setClarificationData] = useState<{
  questions?: string[];
  suggestions?: string[];
  message?: string;
} | null>(null)
const [showTopics, setShowTopics] = useState(false)
const [topicsData, setTopicsData] = useState([])
const [contentCategory, setContentCategory] = useState('')
const [showRetryButton, setShowRetryButton] = useState(false)
const [lastUserInput, setLastUserInput] = useState('')
const [currentStatus, setCurrentStatus] = useState('')

// Webhook integration functions
const callMarcusAI = async (userInput: string, conversationContext: any, contentPreference: string, sessionId: string) => {
  const N8N_WEBHOOK_URL = 'https://testcyber.app.n8n.cloud/webhook-test/74cc6b41-dc95-4bb4-b0ea-adc8f6fa56b1';
  
  try {
    console.log('🚀 Calling Marcus AI webhook:', { userInput, conversationContext, contentPreference });
    
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_input: userInput,
        conversation_context: conversationContext,
        user_id: user?.id,
        content_type_preference: contentPreference,
        session_id: sessionId,
        timestamp: new Date().toISOString()
      })
    });

    const data = await response.json();
    console.log('✅ Marcus AI response:', data);
    return data;
  } catch (error) {
    console.error('❌ Marcus AI Error:', error);
    return { error: 'Marcus is thinking too hard, try again' };
  }
};

// Poll for AI response from callback
  const pollForAIResponse = async (sessionId: string) => {
  const maxAttempts = 40; // 40 attempts = 60 seconds max wait
  let attempts = 0;
  let fallbackMessageSent = false;
  
  const poll = async (): Promise<any> => {
    try {
      const response = await fetch(`/api/marcus/callback?session_id=${sessionId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        if (result.type === 'final') {
          console.log('📨 Received final AI response:', result.data);
          return result.data;
        } else if (result.type === 'status') {
          console.log('📝 Status update:', result.data);
          setCurrentStatus(result.data.message);
        }
      }
      
      attempts++;
      
      // Show fallback message after 40 seconds (26-27 attempts)
      if (attempts >= 26 && !fallbackMessageSent) {
        addMessage('marcus', 'This is taking longer than usual...');
        fallbackMessageSent = true;
      }
      
      if (attempts >= maxAttempts) {
        console.log('⏱️ AI response timeout');
        return 'TIMEOUT';
      }
      
      // Wait 1.5 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 1500));
      return poll();
    } catch (error) {
      console.error('❌ Error polling for AI response:', error);
      return 'ERROR';
    }
  };
  
  return poll();
};

  const [questionFlow, setQuestionFlow] = useState<{
  stage: 'none' | 'q1' | 'q2' | 'processing';
  questions: string[];
  answers: string[];
}>({
  stage: 'none',
  questions: [],
  answers: []
});
  
  const handleRetry = () => {
  setShowRetryButton(false);
  if (lastUserInput) {
    handleUserInput(lastUserInput);
  }
};
  
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
  handleUserInput(userMessage)
}, 1500)
  }

  const handleUserInput = async (userInput: string) => {
  setIsTyping(true);
  setShowRetryButton(false);
  setLastUserInput(userInput);

  // Handle sequential question flow
  if (questionFlow.stage === 'q1') {
    // Store answer to question 1, ask question 2
    setQuestionFlow(prev => ({
      ...prev,
      stage: 'q2',
      answers: [userInput]
    }));
    
    setTimeout(() => {
      addMessage('marcus', questionFlow.questions[1]);
      setIsTyping(false);
    }, 1000);
    
    return; // Exit early, don't process as normal input
  }
  
  if (questionFlow.stage === 'q2') {
    // Store answer to question 2, send to backend
    const bothAnswers = [...questionFlow.answers, userInput];
    
    setQuestionFlow(prev => ({
      ...prev,
      stage: 'processing',
      answers: bothAnswers
    }));
    
    // Send conversation history + answers to backend
    const conversationContext = {
      previous_messages: conversationState.context,
      current_stage: 'clarification_answered',
      topic_focus: conversationState.currentTopic,
      user_preferences: {},
      clarification_answers: bothAnswers
    };

    // Generate unique session ID for this request
    const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // Send to N8N webhook
    const response = await callMarcusAI(
      `Clarification complete. Q1: "${questionFlow.questions[0]}" A1: "${bothAnswers[0]}" Q2: "${questionFlow.questions[1]}" A2: "${bothAnswers[1]}"`,
      conversationContext,
      conversationState.contentPreference,
      sessionId
    );
    
    if (response.message === "Workflow was started") {
      console.log('🔄 Processing clarification answers...');
      setCurrentStatus('Processing your answers...');
      
      const aiResponse = await pollForAIResponse(sessionId);
      
      if (aiResponse === 'TIMEOUT') {
        setCurrentStatus('');
        addMessage('marcus', "I'm having trouble processing your answers right now. Please try again.");
        setShowRetryButton(true);
        setQuestionFlow({ stage: 'none', questions: [], answers: [] });
      } else if (aiResponse === 'ERROR') {
        setCurrentStatus('');
        addMessage('marcus', "Something went wrong while processing your answers. Please try again.");
        setShowRetryButton(true);
        setQuestionFlow({ stage: 'none', questions: [], answers: [] });
      } else if (aiResponse) {
        setCurrentStatus('');
        setQuestionFlow({ stage: 'none', questions: [], answers: [] });
        handleAIResponse(aiResponse);
        
        setConversationState(prev => ({
          ...prev,
          context: [...prev.context, { user: `Q&A Complete: ${bothAnswers.join(', ')}`, marcus: aiResponse }],
          stage: 'clarification_answered'
        }));
      }
    }
    
    setIsTyping(false);
    return; // Exit early, don't process as normal input
  }
  
  const conversationContext = {
    previous_messages: conversationState.context,
    current_stage: conversationState.stage,
    topic_focus: conversationState.currentTopic,
    user_preferences: {}
  };

  try {
    // Generate unique session ID for this request
    const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // Send to N8N webhook
    const response = await callMarcusAI(userInput, conversationContext, conversationState.contentPreference, sessionId);
    
    if (response.message === "Workflow was started") {
  console.log('🔄 Workflow started, polling for AI response...');
  
  // Set initial status
  setCurrentStatus('Analyzing your request...');
  
  // Poll for the actual AI response
  const aiResponse = await pollForAIResponse(sessionId);
  
  if (aiResponse === 'TIMEOUT') {
    // Clear status and show timeout error with retry button
    setCurrentStatus('');
    addMessage('marcus', "I'm having trouble processing your request right now. This might be due to high demand or a temporary issue.");
    setShowRetryButton(true);
  } else if (aiResponse === 'ERROR') {
    // Clear status and show error with retry button
    setCurrentStatus('');
    addMessage('marcus', "Something went wrong while processing your request. Please try again.");
    setShowRetryButton(true);
  } else if (aiResponse) {
    // Clear status
    setCurrentStatus('');
    // Process the successful AI response
    handleAIResponse(aiResponse);
    
    setConversationState(prev => ({
      ...prev,
      context: [...prev.context, { user: userInput, marcus: aiResponse }],
      stage: aiResponse.conversation_stage || prev.stage
    }));
  } else {
    // Clear status and show fallback error
    setCurrentStatus('');
    addMessage('marcus', "I'm experiencing some technical difficulties. Please try again in a moment.");
    setShowRetryButton(true);
  }
} else {
      // Direct response (shouldn't happen with new setup, but just in case)
      handleAIResponse(response);
      
      setConversationState(prev => ({
        ...prev,
        context: [...prev.context, { user: userInput, marcus: response }],
        stage: response.conversation_stage || prev.stage
      }));
    }

  } catch (error) {
    console.log('❌ Error with AI webhook, using fallback');
    processUserInputMock(userInput);
  } finally {
    setIsTyping(false);
  }
};

// New function to handle AI responses
const handleAIResponse = (response: any) => {
  switch (response.response_type) {
    case 'clarification':
      handleClarificationResponse(response);
      break;
    case 'content_ready':
    case 'topic_ready':  // Add this line to handle the AI's response type
      handleContentResponse(response);
      break;
    case 'error':
      handleErrorResponse(response);
      break;
    default:
      console.log('⚠️ Unknown response type:', response.response_type, 'using fallback');
      // Will use fallback in calling function
  }
};

// Rename existing function as fallback
const processUserInputMock = async (input: string) => {
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

// NEW: AI Response Handlers
const handleClarificationResponse = (response: any) => {
  addMessage('marcus', response.message);
  
  // Start sequential question flow
  if (response.questions && response.questions.length > 0) {
    setQuestionFlow({
      stage: 'q1',
      questions: response.questions,
      answers: []
    });
    
    // Ask first question immediately
    setTimeout(() => {
      addMessage('marcus', response.questions[0]);
    }, 1000);
  }
};

const handleContentResponse = (response: any) => {
  addMessage('marcus', "I've got some great topic ideas for you! Check them out:");
  setShowTopicOverlay(true);
  setTopicsData(response.topics);
  setContentCategory(response.content_category);
};

const handleErrorResponse = (response: any) => {
  addMessage('marcus', response.message);
};

const sendToWritersSuite = (topic: any) => {
  console.log('Sending to Writer Suite:', topic);
  if (onNavigateToCreate) {
    onNavigateToCreate('power', {
      topic: topic.title,
      angle: topic.selectedHook || topic.hooks?.[0] || '',
      takeaways: topic.key_takeaways || [],
      selectedHookIndex: topic.selectedHookIndex,
      source_page: 'talk_with_marcus_ai',
      session_id: currentSession?.id
    });
  }
};
  
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
          
          {/* Status Indicator with Circular Loader */}
{isTyping && (
  <div className="flex justify-start">
    <div className="bg-gray-100 px-4 py-3 rounded-lg">
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-gradient-to-br from-slate-700 to-teal-600 rounded-full flex items-center justify-center">
          <User className="w-3 h-3 text-white" />
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-teal-600 rounded-full animate-spin"></div>
          <span className="text-sm text-gray-600">
            {currentStatus || 'Marcus is thinking...'}
          </span>
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

      {/* Topic Selection Overlay */}
      {showTopicOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-5xl max-h-[80vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Choose Your Content Hook</h3>
                <button
                  onClick={() => setShowTopicOverlay(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-2">Select the hook that resonates most with your message:</p>
            </div>

            {/* Content */}
            <div className="p-6">
              {topicsData.map((topic: any, topicIndex: number) => (
                <div key={topicIndex} className="mb-8">
                  {/* Topic Title */}
                  <h4 className="text-lg font-semibold text-gray-900 mb-6">
                    {topic.title}
                  </h4>

                  {/* Hook Options */}
                  <div className="space-y-4 mb-6">
                    <h5 className="text-sm font-medium text-gray-700">Choose your hook:</h5>
                    {topic.hooks?.map((hook: string, hookIndex: number) => (
                      <div key={hookIndex} className="border border-gray-200 rounded-lg p-4 hover:border-teal-500 hover:bg-teal-50 transition-colors cursor-pointer group">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-teal-100 group-hover:bg-teal-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-teal-700">
                              {hookIndex + 1}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium mb-2">
                              Option {hookIndex + 1}
                            </p>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              "{hook}"
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              // Create modified topic with selected hook
                              const selectedTopic = {
                                ...topic,
                                selectedHook: hook,
                                selectedHookIndex: hookIndex
                              };
                              sendToWritersSuite(selectedTopic);
                              setShowTopicOverlay(false);
                            }}
                            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition font-medium opacity-0 group-hover:opacity-100"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Key Takeaways (Read-only) */}
                  {topic.key_takeaways && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Key takeaways for this topic:</h5>
                      <div className="space-y-2">
                        {topic.key_takeaways.map((takeaway: string, i: number) => (
                          <div key={i} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-gray-700">{takeaway}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Separator for multiple topics */}
                  {topicIndex < topicsData.length - 1 && (
                    <hr className="mt-8 border-gray-200" />
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-xl">
              <div className="flex justify-center">
                <button
                  onClick={() => setShowTopicOverlay(false)}
                  className="text-gray-600 hover:text-gray-800 font-medium flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Retry Button */}
      {showRetryButton && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-center">
            <p className="text-yellow-800 mb-4">Would you like to try again?</p>
            <div className="space-x-3">
              <button
                onClick={handleRetry}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => setShowRetryButton(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
      onNavigateToCreate('standard', {
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
        source_page: 'talk_with_marcus',
        session_id: currentSession?.id
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
