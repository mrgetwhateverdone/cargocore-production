/**
 * Safe formatting utilities to prevent null/undefined crashes
 * Replaces duplicated formatting functions across API files
 */

/**
 * This part of the code safely cleans markdown formatting from AI responses
 * Handles null/undefined inputs without crashing
 */
export function safeCleanMarkdown(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    // Remove bold markers
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove italic markers  
    .replace(/\*(.*?)\*/g, '$1')
    // Remove any remaining asterisks
    .replace(/\*/g, '')
    // Remove "Executive Summary:" prefix (case insensitive)
    .replace(/^Executive Summary:\s*/i, '')
    // Clean up extra spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * This part of the code safely fixes dollar impact formatting in AI responses
 * Removes unnecessary .00 decimals and ensures proper spacing before "impact"
 */
export function safeDollarFormat(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    // Fix dollar amounts followed by "impact" (e.g., "$3,149,821.00impact" → "$3,149,821 impact")
    .replace(/\$([0-9,]+)\.00impact/g, '$$$1 impact')
    // Fix dollar amounts with cents followed by "impact" (preserve cents)
    .replace(/\$([0-9,]+\.[0-9]{1,2})impact/g, '$$$1 impact')
    // Fix dollar amounts with no decimal followed by "impact" (e.g., "$1,028,350impact" → "$1,028,350 impact")
    .replace(/\$([0-9,]+)impact/g, '$$$1 impact')
    // Fix cases where there's already a space but .00 needs removal
    .replace(/\$([0-9,]+)\.00\s+impact/g, '$$$1 impact');
}

/**
 * This part of the code safely processes array of suggested actions
 * Handles cases where suggestedActions might be undefined or not an array
 */
export function safeSuggestedActions(actions: string[] | null | undefined): string[] {
  if (!actions || !Array.isArray(actions)) {
    return [];
  }
  
  return actions
    .filter(action => action && typeof action === 'string')
    .map(action => safeDollarFormat(safeCleanMarkdown(action)));
}

/**
 * This part of the code combines both formatting functions safely
 * Most common use case - clean markdown then fix dollar formatting
 */
export function safeFormatAIText(text: string | null | undefined): string {
  return safeDollarFormat(safeCleanMarkdown(text));
}
