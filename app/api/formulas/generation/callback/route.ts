import { NextRequest, NextResponse } from 'next/server'

// Store for pending generation responses
const generationResponses = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🎯 Received formula generation from backend:', body)
    
    const { 
  session_id, 
  response_type, 
  processing_status,
  total_sections,
  total_variables_filled,
  validation_score,
  generated_content,
  sections_data,
  all_filled_variables,
  template_validation,
  extraction_metadata
} = body

if (!session_id) {
  return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
}

// Store the complete generation response (new comprehensive format)
generationResponses.set(session_id, {
  response_type,
  processing_status,
  total_sections,
  total_variables_filled,
  validation_score,
  extraction_timestamp: body.extraction_timestamp,
  
  // Complete generated content
  generated_content: {
    complete_post: generated_content?.complete_post || '',
    post_analytics: generated_content?.post_analytics || {}
  },
  
  // Sections and variables data
  sections_data: sections_data || [],
  all_filled_variables: all_filled_variables || {},
  
  // Template validation results
  template_validation: template_validation || {},
  extraction_metadata: extraction_metadata || {},
  
  // System fields
  conversation_stage: body.conversation_stage,
  timestamp: body.timestamp || Date.now(),
  
  // Legacy compatibility fields
  full_post: generated_content?.complete_post || '',
  linkedin_ready: generated_content?.complete_post || ''
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
