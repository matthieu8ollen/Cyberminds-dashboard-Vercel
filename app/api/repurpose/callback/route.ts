import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Temporary storage for AI responses (in production, use Redis or database)
const responseCache = new Map<string, any>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Check if we have a response for this session
    const cachedResponse = responseCache.get(sessionId)
    
    if (cachedResponse) {
      // Remove from cache after retrieving
      responseCache.delete(sessionId)
      
      return NextResponse.json({
        success: true,
        type: 'final',
        data: cachedResponse
      })
    }

    // No response yet
    return NextResponse.json({
      success: false,
      message: 'No response available yet'
    })

  } catch (error) {
    console.error('Error in repurpose callback:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST endpoint for receiving webhook responses from backend
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, ...responseData } = body

    if (!session_id) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Store the response in cache for the polling GET request to retrieve
    responseCache.set(session_id, responseData)

    console.log('📨 Received repurpose webhook response:', {
      session_id,
      hasData: !!responseData
    })
    console.log('🔍 CALLBACK FULL DATA:', JSON.stringify(body, null, 2))

    // Optional: Update database with results
    if (responseData.content_ideas && responseData.ideation_session_id) {
      try {
        const { error: updateError } = await supabase
          .from('ideation_sessions')
          .update({
            status: 'completed',
            topic: responseData.topic,
            angle: responseData.angle,
            takeaways: responseData.content_ideas,
            updated_at: new Date().toISOString()
          })
          .eq('id', responseData.ideation_session_id)

        if (updateError) {
          console.error('Error updating ideation session:', updateError)
        }
      } catch (dbError) {
        console.error('Database update error:', dbError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Response received and cached'
    })

  } catch (error) {
    console.error('Error processing repurpose webhook:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

// DELETE endpoint for cleaning up cached responses (optional)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Remove from cache
    const wasDeleted = responseCache.delete(sessionId)

    return NextResponse.json({
      success: true,
      message: wasDeleted ? 'Session cleared' : 'Session not found'
    })

  } catch (error) {
    console.error('Error clearing repurpose session:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
