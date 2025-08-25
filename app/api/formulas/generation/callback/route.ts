import { NextRequest, NextResponse } from 'next/server'

// Store for pending generation responses
const generationResponses = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🎯 Received formula generation from backend:', body)
    
    const { session_id, generated_content, full_post, linkedin_ready } = body
    
    if (!session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    }
    
    // Store the complete generation response
    generationResponses.set(session_id, {
      generated_content,
      full_post: full_post || generated_content,
      linkedin_ready: linkedin_ready || generated_content,
      timestamp: body.timestamp || Date.now()
    })
    
    console.log('✅ Stored generation response for session:', session_id)
    return NextResponse.json({ success: true, received: true })
  } catch (error) {
    console.error('❌ Error processing generation callback:', error)
    return NextResponse.json({ error: 'Failed to process callback' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const session_id = searchParams.get('session_id')
  
  if (!session_id) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }
  
  const response = generationResponses.get(session_id)
  if (response) {
    generationResponses.delete(session_id) // One-time use
    return NextResponse.json({ success: true, data: response, type: 'final' })
  }
  
  return NextResponse.json({ success: false, data: null })
}
