import { NextRequest, NextResponse } from 'next/server'

// Store for pending content responses
const contentResponses = new Map<string, any>()

export async function POST(request: NextRequest) {
  console.log('🚨 CALLBACK ROUTE ACCESSED - REQUEST RECEIVED')
  console.log('📍 Timestamp:', new Date().toISOString())
  try {
    const body = await request.json()
    console.log('🎯 Received backend response:', body)
    console.log('🔍 FULL BACKEND PAYLOAD:', JSON.stringify(body, null, 2))
    console.log('🔍 RESPONSE DETAILS:', {
      response_type: body.response_type,
      has_writing_guidance_sections: !!body.writing_guidance_sections,
      guidance_sections_length: body.writing_guidance_sections?.length || 0,
      has_generated_content: !!body.generated_content,
      complete_post_length: body.generated_content?.complete_post?.length || 0,
      has_all_filled_variables: !!body.all_filled_variables,
      variables_count: Object.keys(body.all_filled_variables || {}).length
    })
    
    const { session_id, response_type } = body

    if (!session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    }

    // Get existing response for this session (if any)
const existingResponse = contentResponses.get(session_id) || {
  response_type: 'content_with_guidance',
  processing_status: 'partial',
  timestamp: Date.now(),
  conversation_stage: 'processing',
  guidance: null,
  generatedContent: null
}

console.log('🔄 EXISTING RESPONSE CHECK:', {
  session_id,
  hasExistingResponse: !!contentResponses.get(session_id),
  currentData: contentResponses.get(session_id) ? 'exists' : 'new'
})

    // Handle writing guidance response
    if (response_type === 'writing_guidance_extracted') {
      console.log('📝 Processing writing guidance response...')
      
      existingResponse.guidance = {
        writing_guidance_sections: body.writing_guidance_sections || [],
        total_sections: body.total_sections || '',
        total_guidance_types: body.total_guidance_types || '',
        processing_status: body.processing_status || '',
        guidance_types_found: body.guidance_types_found || [],
        extraction_metadata: body.extraction_metadata || {},
        field_analysis: body.field_analysis || {}
      }
      
      existingResponse.conversation_stage = body.conversation_stage
      console.log('✅ Stored guidance data for session:', session_id)
      console.log('📝 GUIDANCE DATA STORED:', existingResponse.guidance)
    }
    
    // Handle content generation response
    else if (response_type === 'content_generation_complete') {
      console.log('📊 Processing generated content response...')
      
      existingResponse.generatedContent = {
        generated_content: {
          complete_post: body.generated_content?.complete_post || '',
          post_analytics: body.generated_content?.post_analytics || {}
        },
        sections_data: body.sections_data || [],
        all_filled_variables: body.all_filled_variables || {},
        template_validation: body.template_validation || {},
        total_sections: body.total_sections || '',
        total_variables_filled: body.total_variables_filled || '',
        validation_score: body.validation_score || '',
        processing_status: body.processing_status || '',
        extraction_timestamp: body.extraction_timestamp || ''
      }
      
      existingResponse.conversation_stage = body.conversation_stage
      console.log('✅ Stored content data for session:', session_id)
      console.log('📊 CONTENT DATA STORED:', existingResponse.generatedContent)
    }

    // Check if both responses received
    const hasGuidance = !!existingResponse.guidance
    const hasContent = !!existingResponse.generatedContent
    
    if (hasGuidance && hasContent) {
      existingResponse.processing_status = 'complete'
      console.log('🎉 BOTH responses received - ready for overlay display:', session_id)
      console.log('📊 Content ready:', !!existingResponse.generatedContent?.generated_content?.complete_post)
      console.log('📝 Guidance ready:', existingResponse.guidance?.writing_guidance_sections?.length || 0, 'sections')
    } else {
      existingResponse.processing_status = 'partial'
      console.log('⏳ Waiting for complete dataset - current status:', { 
        hasGuidance, 
        hasContent,
        waitingFor: !hasGuidance ? 'guidance' : 'content'
      })
    }

    // Update stored response
    contentResponses.set(session_id, existingResponse)
    
    return NextResponse.json({ success: true, received: true })
  } catch (error) {
    console.error('❌ Error processing content callback:', error)
    return NextResponse.json({ error: 'Failed to process callback' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const session_id = searchParams.get('session_id')
  
  if (!session_id) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }
  
  const response = contentResponses.get(session_id)
  if (response && response.processing_status === 'complete') {
    // Only return when both guidance and content received
    contentResponses.delete(session_id) // One-time use
    return NextResponse.json({ success: true, data: response, type: 'final' })
  } else if (response && response.processing_status === 'partial') {
    // Still waiting for second response
    return NextResponse.json({ success: false, data: null, status: 'waiting_for_complete_data' })
  }
  
  return NextResponse.json({ success: false, data: null })
}
