import { NextRequest, NextResponse } from 'next/server'

// Store for pending example responses
const exampleResponses = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🎯 Received formula example from backend:', body)
    
    const { session_id, example_post, section_examples, template_variables, tips_and_guidance } = body
    
    if (!session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    }
    
    // Store the complete example response
    exampleResponses.set(session_id, {
      example_post,
      section_examples: section_examples || {},
      template_variables: template_variables || {},
      tips_and_guidance: tips_and_guidance || [],
      timestamp: body.timestamp || Date.now()
    })
    
    console.log('✅ Stored example response for session:', session_id)
    return NextResponse.json({ success: true, received: true })
  } catch (error) {
    console.error('❌ Error processing example callback:', error)
    return NextResponse.json({ error: 'Failed to process callback' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const session_id = searchParams.get('session_id')
  
  if (!session_id) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }
  
  const response = exampleResponses.get(session_id)
  if (response) {
    exampleResponses.delete(session_id) // One-time use
    return NextResponse.json({ success: true, data: response, type: 'final' })
  }
  
  return NextResponse.json({ success: false, data: null })
}
