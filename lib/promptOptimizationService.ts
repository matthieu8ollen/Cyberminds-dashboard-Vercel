import { GeneratedContent } from './supabase'

export const generatePromptSuggestions = (content: GeneratedContent): string[] => {
  const basePrompts = []
  
  switch (content.content_type) {
    case 'framework':
      basePrompts.push(
        `Professional business diagram showing strategic framework with clean corporate design, blue and teal colors, suitable for LinkedIn`,
        `Minimalist infographic illustrating process steps with modern typography and professional styling`,
        `Clean data visualization chart for business professionals with corporate color scheme`
      )
      break
      
    case 'story':
      basePrompts.push(
        `Inspirational quote card with modern typography, professional business theme, clean design for LinkedIn`,
        `Behind-the-scenes business illustration in modern professional style with motivational elements`,
        `Personal branding image with inspiring business message and clean corporate design`
      )
      break
      
    case 'trend':
      basePrompts.push(
        `Modern business trend visualization with sleek design and professional color palette`,
        `Industry trend infographic with clean corporate styling suitable for LinkedIn professionals`,
        `Contemporary business chart showing market trends with minimalist professional design`
      )
      break
      
    case 'mistake':
      basePrompts.push(
        `Professional business warning illustration with clean design and corporate colors`,
        `Educational business infographic about common mistakes with modern styling`,
        `Cautionary business chart with professional design suitable for LinkedIn`
      )
      break
      
    case 'metrics':
      basePrompts.push(
        `Professional business metrics dashboard with clean data visualization`,
        `Corporate KPI chart with blue and teal color scheme for LinkedIn professionals`,
        `Business analytics infographic with modern design and professional styling`
      )
      break
      
    default:
      basePrompts.push(
        `Professional business illustration with clean corporate design`,
        `Modern LinkedIn-style business graphic with blue and teal colors`,
        `Clean professional infographic suitable for business social media`
      )
  }
  
  return basePrompts
}

export const optimizePrompt = (userPrompt: string): string => {
  // Basic prompt optimization - add professional context
  const optimized = `Professional ${userPrompt.toLowerCase()} with clean modern design, suitable for LinkedIn business post, high quality, corporate blue and teal color scheme, minimalist professional style`
  
  return optimized
}

// Mock AI optimization with multiple suggestions
export const getOptimizedPromptSuggestions = (userPrompt: string): string[] => {
  const base = userPrompt.toLowerCase()
  
  return [
    `Professional ${base} with clean modern design, suitable for LinkedIn business post, high quality, corporate styling`,
    `Minimalist ${base} with blue and teal corporate colors, professional photography style, clean composition`,
    `Modern business ${base} with sleek design, professional color palette, suitable for social media marketing`
  ]
}
