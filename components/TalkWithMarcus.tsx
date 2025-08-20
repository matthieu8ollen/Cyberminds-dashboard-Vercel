'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useWorkflow } from '../contexts/WorkflowContext'
import { saveIdeaFromSession, createContentIdea } from '../lib/supabase'
import { User, ArrowRight, Send, Lightbulb, Target, TrendingUp } from 'lucide-react'
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

export default function TalkWithMarcus({ onIdeationComplete, onNavigateToCreate }: TalkWithMarcusProps) {
  const { user } = useAuth()
  const { startIdeation } = useWorkflow()
  const [messages, setMessages] = useState<Message[]>([])
  
  const saveIdeaToLibrary = async (title: string, description: string, tags: string[]) => {
    if (!user) return false
    
    try {
      const { data, error } = await createContentIdea({
        user_id: user.id,
        title,
        description,
        tags,
        content_pillar: 'ai_generated',
        source_type: 'ai_generated',
        status: 'active'
      })
      
      if (error) throw error
      console.log('Idea saved to library:', data)
      return true
    } catch (error) {
      console.error('Error saving idea:', error)
      return false
    }
  }
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentSession, setCurrentSession] = useState<IdeationSession | null>(null)
  const [ideationOutput, setIdeationOutput] = useState<Partial<IdeationOutput>>({})
  const [showTopicOverlay, setShowTopicOverlay] = useState(false)
  const [selectedHook, setSelectedHook] = useState('')
  const [selectedHookIndex, setSelectedHookIndex] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

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
  const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_MARCUS_WEBHOOK_URL || 'https://testcyber.app.n8n.cloud/webhook/74cc6b41-dc95-4bb4-b0ea-adc8f6fa56b1';
  
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
    
    // Smart scroll for new messages
    setTimeout(() => scrollToBottom(type === 'user'), 50);
  }

  const addMarcusMessage = (content: string) => {
    setIsTyping(true)
    setTimeout(() => {
      addMessage('marcus', content)
      setIsTyping(false)
    }, 1000)
  }

  const scrollToBottom = (force: boolean = false) => {
    if (!messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    
    // Auto-scroll if user is near bottom or force is true
    if (isNearBottom || force) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const createOrUpdateSession = async (updates: Partial<IdeationSession>) => {
  if (!user) return

  try {
    if (!currentSession) {
      // Create new session
      const { data } = await createIdeationSession({
        user_id: user.id,
        page_type: 'talk_with_marcus',
        session_data: { messages },
        status: 'in_progress',
        ...updates
      })
      if (data) setCurrentSession(data)
    } else {
      // Update existing session
      const { data } = await updateIdeationSession(currentSession.id, {
        session_data: { messages },
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
  console.log('❌ Error with AI webhook');
  addMessage('marcus', "I'm experiencing some technical difficulties. Please try again in a moment.");
  setShowRetryButton(true);
} finally {
  setIsTyping(false);
}
};

// New function to handle AI responses
const handleAIResponse = (response: any) => {
  console.log('🔍 Processing AI response:', response); // Add debugging
  
  // Handle missing or undefined response_type
  if (!response || !response.response_type) {
    console.warn('⚠️ Response missing response_type:', response);
    if (response && response.message) {
      addMessage('marcus', response.message);
    } else {
      addMessage('marcus', "I'm having trouble understanding that. Could you rephrase?");
    }
    return;
  }

  switch (response.response_type) {
    case 'clarification':
      handleClarificationResponse(response);
      break;
    case 'content_ready':
    case 'topic_ready':
      handleContentResponse(response);
      break;
    case 'error':
      handleErrorResponse(response);
      break;
    case 'conversation': // Add this case for general conversation
      addMessage('marcus', response.message);
      break;
    default:
      console.warn('⚠️ Unknown response type:', response.response_type);
      // Try to extract message anyway
      if (response.message) {
        addMessage('marcus', response.message);
      } else {
        addMessage('marcus', "I'm having trouble processing that. Could you try again?");
      }
  }
};

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
  // Reset selection states
  setSelectedHook(response.topics?.[0]?.hooks?.[0] || '');
  setSelectedHookIndex(0);
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

  // LinkedIn Preview Component
  const LinkedInPreviewCard = ({ hook, topic }: { hook: string; topic: string }) => (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      {/* LinkedIn Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-teal-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">You</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Your Name</p>
            <p className="text-sm text-gray-500">Your Title • Now</p>
          </div>
        </div>
      </div>
      
      {/* LinkedIn Content */}
      <div className="p-4">
        <p className="text-gray-900 text-sm leading-relaxed">
          {hook.length > 150 ? (
            <>
              {hook.substring(0, 150)}
              <span className="text-blue-600 cursor-pointer">...more</span>
            </>
          ) : (
            hook
          )}
        </p>
      </div>
      
      {/* LinkedIn Actions */}
      <div className="px-4 pb-4">
        <div className="flex items-center space-x-6 text-gray-500 text-sm">
          <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>Like</span>
          </div>
          <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Comment</span>
          </div>
          <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span>Share</span>
          </div>
        </div>
      </div>
    </div>
  );

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
        <div ref={messagesContainerRef} className="h-96 overflow-y-auto p-6 space-y-4">
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
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
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
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
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

            {/* Content */}
<div className="flex-1 overflow-y-auto">
  {topicsData.map((topic: any, topicIndex: number) => (
    <div key={topicIndex} className="p-6 flex flex-col">
                  {/* Key Takeaways - Teal Box at Top */}
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-teal-900">Key Takeaways for This Content</h4>
                    </div>
                    <div className="text-sm text-teal-800">
                      {topic.key_takeaways?.map((takeaway: string, i: number) => (
                        <div key={i} className="mb-1">
                          • {takeaway}
                        </div>
                      ))}
                    </div>
                  </div>

                 {/* Main Content Area */}
<div className="flex space-x-6 mb-6">
  {/* LinkedIn Preview - Left Side */}
<div className="flex-1">
    <h5 className="text-lg font-semibold text-gray-900 mb-4">LinkedIn Preview</h5>
    <LinkedInPreviewCard 
      hook={selectedHook || topic.hooks?.[0]}
      topic={topic.title}
    />
  </div>

  {/* Hook Selection - Right Side */}
  <div className="flex-1">
    <h5 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Hook</h5>
                      <div className="space-y-3">
                        {topic.hooks?.map((hook: string, hookIndex: number) => (
                          <div 
                            key={hookIndex}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              selectedHookIndex === hookIndex 
                                ? 'border-teal-500 bg-teal-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => {
                              setSelectedHook(hook);
                              setSelectedHookIndex(hookIndex);
                            }}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                selectedHookIndex === hookIndex 
                                  ? 'bg-teal-500 text-white' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {hookIndex + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 mb-1">Option {hookIndex + 1}</p>
                                <p className="text-sm text-gray-600">"{hook}"</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
<div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
  <div className="flex justify-between items-center mb-4">
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
  
  <div className="grid grid-cols-2 gap-3">
    <button
      onClick={async () => {
  // Save idea to library without starting workflow
  if (user && topicsData?.[0]) {
    const topicData = topicsData[0] as any
    const success = await saveIdeaToLibrary(
      topicData?.title || 'AI Generated Topic',
      selectedHook || topicData?.hooks?.[0] || '',
      topicData?.key_takeaways || []
    )
    if (success) {
      console.log('💾 Idea saved to library, exiting without workflow')
      setShowTopicOverlay(false)
      // Stay in normal navigation - don't start workflow
    }
  }
}}
      className="flex items-center justify-center space-x-2 bg-slate-100 text-slate-700 px-4 py-3 rounded-lg hover:bg-slate-200 transition font-medium border border-slate-300"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <span>💾 Save Idea & Exit</span>
    </button>
    
    <button
      onClick={() => {
  const selectedTopic = {
    ...(topicsData[0] as any),
    selectedHook: selectedHook || (topicsData[0] as any)?.hooks?.[0],
    selectedHookIndex: selectedHookIndex || 0
  };
  sendToWritersSuite(selectedTopic);
  setShowTopicOverlay(false);
}}
      className="bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700 transition font-medium"
    >
      Use This Content
    </button>
  </div>
</div>
                </div>
              ))}
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
    </div>
  )
}
