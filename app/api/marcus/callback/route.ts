import { NextRequest, NextResponse } from 'next/server'

// Store for pending AI responses (in production, use Redis or database)
const pendingResponses = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🎯 Received AI response from N8N:', body)
    
    const { session_id, response_type, message, questions, suggested_inputs, topics, content_category } = body
    
    if (!session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    }
    
    // Store the response for the frontend to pick up
    pendingResponses.set(session_id, {
      response_type,
      message,
      questions,
      suggested_inputs,
      topics,
      content_category,
      conversation_stage: body.conversation_stage,
      timestamp: Date.now()
    })
    
    console.log('✅ Stored AI response for session:', session_id)
    
    return NextResponse.json({ success: true, received: true })
  } catch (error) {
    console.error('❌ Error processing AI callback:', error)
    return NextResponse.json({ error: 'Failed to process callback' }, { status: 500 })
  }
}

// GET endpoint for frontend to poll for responses
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const session_id = searchParams.get('session_id')
  
  if (!session_id) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }
  
  const response = pendingResponses.get(session_id)
  
  if (response) {
    // Remove after retrieving (one-time use)
    pendingResponses.delete(session_id)
    return NextResponse.json({ success: true, data: response })
  }
  
  return NextResponse.json({ success: false, data: null })
}
