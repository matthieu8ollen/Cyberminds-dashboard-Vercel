import { NextRequest, NextResponse } from 'next/server'

// Store for pending AI responses (in production, use Redis or database)
const pendingResponses = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🎯 Received from N8N:', body)
    
    const { session_id, status, response_type, topics, content_category, user_id, tools_used, conversation_stage, message, questions } = body
    
    if (!session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    }
    
    // Handle status updates vs final responses
    if (status && status !== 'complete') {
      // This is a status update - store it temporarily
      pendingResponses.set(`${session_id}_status`, {
        status,
        message,
        timestamp: body.timestamp || Date.now()
      })
      console.log(`📝 Status update for ${session_id}: ${status}`)
    } else {
      // This is the final response - store the complete data
      pendingResponses.set(session_id, {
        response_type,
        topics,
        content_category,
        user_id,
        tools_used,
        conversation_stage,
        message,
        questions,
        timestamp: body.timestamp || Date.now()
      })
      console.log('✅ Stored final AI response for session:', session_id)
    }
    
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
  
  // Check for final response first
const finalResponse = pendingResponses.get(session_id)
if (finalResponse) {
  
  // Remove after retrieving (one-time use)
  pendingResponses.delete(session_id)
  pendingResponses.delete(`${session_id}_status`) // Clean up status too
  return NextResponse.json({ success: true, data: finalResponse, type: 'final' })
}
  
  // Check for status updates
  const statusUpdate = pendingResponses.get(`${session_id}_status`)
  if (statusUpdate) {
    // Don't remove status updates, just return them
    return NextResponse.json({ success: true, data: statusUpdate, type: 'status' })
  }
  
  return NextResponse.json({ success: false, data: null })
}
