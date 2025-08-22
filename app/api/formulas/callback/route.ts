import { NextRequest, NextResponse } from 'next/server'

// Store for pending formula responses (in production, use Redis or database)
const formulaResponses = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🎯 Received formula response from backend:', body)
    
    const { session_id, response_type, recommended_formulas } = body
    
    if (!session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    }
    
    // Store the complete formula response
    formulaResponses.set(session_id, {
  response_type,
  recommended_formulas: recommended_formulas || [],
  success: body.success,
      timestamp: body.timestamp || Date.now(),
      summary: body.summary,
      processing_metadata: body.processing_metadata,
      conversation_stage: body.conversation_stage
    })
    
    console.log('✅ Stored formula response for session:', session_id)
    return NextResponse.json({ success: true, received: true })
  } catch (error) {
    console.error('❌ Error processing formula callback:', error)
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
  
  const response = formulaResponses.get(session_id)
  if (response) {
    // Remove after retrieving (one-time use)
    formulaResponses.delete(session_id)
    return NextResponse.json({ success: true, data: response, type: 'final' })
  }
  
  return NextResponse.json({ success: false, data: null })
}
