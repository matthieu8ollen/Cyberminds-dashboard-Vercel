import { NextRequest, NextResponse } from 'next/server'

// Store for pending content responses
const contentResponses = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🎯 Received consolidated content from backend:', body)
    console.log('🔍 CONSOLIDATED CALLBACK VERIFICATION:')
    console.log('📦 Backend sent guidance data:', !!body.guidance)
    console.log('📊 Backend sent content data:', !!body.content)
    
    const { session_id } = body

    if (!session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    }

    // Store the complete consolidated response
    contentResponses.set(session_id, {
      response_type: body.response_type || 'content_with_guidance',
      processing_status: body.processing_status,
      timestamp: body.timestamp || Date.now(),
      conversation_stage: body.conversation_stage,
      
      // Consolidated guidance data
      guidance: {
        writing_guidance_sections: body.guidance?.writing_guidance_sections || [],
        total_sections: body.guidance?.total_sections || '',
        guidance_types_found: body.guidance?.guidance_types_found || [],
        extraction_metadata: body.guidance?.extraction_metadata || {},
        // Legacy compatibility fields
        example_post: body.guidance?.example_post || '',
        section_examples: body.guidance?.section_examples || {},
        template_variables: body.guidance?.template_variables || {},
        tips_and_guidance: body.guidance?.tips_and_guidance || []
      },
      
      // Consolidated content data  
      content: {
        generated_content: {
          complete_post: body.content?.generated_content?.complete_post || '',
          post_analytics: body.content?.generated_content?.post_analytics || {}
        },
        sections_data: body.content?.sections_data || [],
        all_filled_variables: body.content?.all_filled_variables || {},
        template_validation: body.content?.template_validation || {},
        total_variables_filled: body.content?.total_variables_filled || '',
        validation_score: body.content?.validation_score || '',
        extraction_timestamp: body.content?.extraction_timestamp || '',
        extraction_metadata: body.content?.extraction_metadata || {}
      }
    })
    
    console.log('✅ Stored consolidated content response for session:', session_id)
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
  if (response) {
    contentResponses.delete(session_id) // One-time use
    return NextResponse.json({ success: true, data: response, type: 'final' })
  }
  
  return NextResponse.json({ success: false, data: null })
}
