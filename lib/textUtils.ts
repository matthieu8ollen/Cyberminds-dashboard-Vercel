/**
 * Text Formatting Utilities
 * Comprehensive text transformation utilities for the Writer Suite Dashboard
 */

/**
 * Formats database text by removing underscores and applying proper capitalization
 * Handles strings, arrays, objects, and null/undefined values
 */
export const formatDatabaseText = (text: any): string => {
  if (text === null || text === undefined || text === '') {
    return 'Not specified'
  }
  
  // Handle arrays
  if (Array.isArray(text)) {
    if (text.length === 0) return 'Not specified'
    return text.map(item => formatDatabaseText(item)).join(', ')
  }
  
  // Handle objects (convert to string representation)
  if (typeof text === 'object') {
    return formatDatabaseText(JSON.stringify(text))
  }
  
  // Convert to string and apply formatting
  return String(text)
    .replace(/_/g, ' ')                    // Replace underscores with spaces
    .replace(/\b\w/g, l => l.toUpperCase()) // Capitalize first letter of each word
    .trim()                                // Remove extra whitespace
}

/**
 * Formats an array of database texts with consistent formatting
 */
export const formatDatabaseTextArray = (textArray: any[]): string[] => {
  if (!Array.isArray(textArray) || textArray.length === 0) {
    return ['Not specified']
  }
  
  return textArray.map(item => formatDatabaseText(item))
}

/**
 * Formats category names specifically for display
 */
export const formatCategoryName = (category: string): string => {
  if (!category) return 'General'
  
  return category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Formats role names for user profiles
 */
export const formatRoleName = (role: string): string => {
  if (!role) return 'Professional'
  
  return role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim()
}

/**
 * Creates a readable sentence from database field values
 */
export const formatToSentence = (text: any): string => {
  const formatted = formatDatabaseText(text)
  
  if (formatted === 'Not specified') return formatted
  
  // Ensure the sentence ends with proper punctuation
  const trimmed = formatted.trim()
  if (trimmed && !trimmed.match(/[.!?]$/)) {
    return trimmed + '.'
  }
  
  return trimmed
}

/**
 * Type-safe formatter that preserves original value if formatting fails
 */
export const safeFormatDatabaseText = (text: any, fallback: string = ''): string => {
  try {
    const result = formatDatabaseText(text)
    return result === 'Not specified' && fallback ? fallback : result
  } catch (error) {
    console.warn('Text formatting failed:', error)
    return fallback || String(text || '')
  }
}
