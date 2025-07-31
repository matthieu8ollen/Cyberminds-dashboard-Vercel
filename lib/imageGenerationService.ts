interface ImageGenerationRequest {
  prompt: string
  n?: number // number of images to generate
  size?: '1024x1024' | '1792x1024' | '1024x1792'
  quality?: 'standard' | 'hd'
}

interface ImageGenerationResponse {
  data: Array<{
    url: string
    revised_prompt?: string
  }>
}

export const generateImages = async (request: ImageGenerationRequest): Promise<ImageGenerationResponse> => {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt,
        n: request.n || 3,
        size: request.size || '1024x1024',
        quality: request.quality || 'standard'
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate images')
    }

    return await response.json()
  } catch (error) {
    console.error('Error generating images:', error)
    throw error
  }
}

// Mock service for development
export const generateImagesMock = async (request: ImageGenerationRequest): Promise<ImageGenerationResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  return {
    data: [
      { url: 'https://picsum.photos/1024/1024?random=1', revised_prompt: request.prompt },
      { url: 'https://picsum.photos/1024/1024?random=2', revised_prompt: request.prompt },
      { url: 'https://picsum.photos/1024/1024?random=3', revised_prompt: request.prompt }
    ]
  }
}
