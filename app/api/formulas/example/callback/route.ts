import { NextRequest, NextResponse } from 'next/server'

// Store for pending example responses
const exampleResponses = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🎯 Received formula example from backend:', body)
    console.log('🔍 EXAMPLE CALLBACK TEMPLATE VARIABLE CHECK:')
    console.log('📦 Backend sent template_variables:', JSON.stringify(body.template_variables, null, 2))
    console.log('📊 Template variable count received:', Object.keys(body.template_variables || {}).length)
    console.log('📋 Raw template_variables object:', body.template_variables)
    
    const { session_id, response_type, writing_guidance_sections, total_sections, guidance_types_found, extraction_metadata } = body

if (!session_id) {
  return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
}

// Store the complete guidance response (new format)
exampleResponses.set(session_id, {
  response_type,
  writing_guidance_sections: writing_guidance_sections || [],
  total_sections,
  guidance_types_found: guidance_types_found || [],
  extraction_metadata: extraction_metadata || {},
  processing_status: body.processing_status,
  conversation_stage: body.conversation_stage,
  // Legacy fields for backward compatibility
  example_post: body.example_post || '',
  section_examples: body.section_examples || {},
  template_variables: body.template_variables || {},
  tips_and_guidance: body.tips_and_guidance || [],
  timestamp: body.timestamp || Date.now()
})
    
    console.log('✅ Stored example response for session:', session_id)
    // VERIFY TEMPLATE VARIABLES STORED CORRECTLY
    const storedData = exampleResponses.get(session_id)
    console.log('🔍 EXAMPLE STORAGE VERIFICATION:')
    console.log('📦 Stored template_variables:', JSON.stringify(storedData?.template_variables, null, 2))
    console.log('📊 Stored template variable count:', Object.keys(storedData?.template_variables || {}).length)
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
