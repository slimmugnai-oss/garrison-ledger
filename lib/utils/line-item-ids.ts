/**
 * LINE ITEM ID GENERATION
 *
 * Shared utility for generating unique IDs for dynamic line items
 */

export function generateLineItemId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
