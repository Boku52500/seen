/**
 * Convert a product name to a URL-friendly slug
 * Example: "Black Halter Peplum Top" -> "black-halter-peplum-top"
 */
export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  
  // If slug is empty or too short, use 'product' as fallback
  return slug.length > 0 ? slug : 'product';
}

/**
 * Generate a unique slug for a product using name and ID
 * This ensures uniqueness even if product names are similar
 */
export function generateProductSlug(name: string, id: string): string {
  const baseSlug = slugify(name);
  // Use the full UUID for uniqueness, replacing hyphens with underscores to avoid conflicts
  const cleanId = id.replace(/-/g, '_');
  return `${baseSlug}--${cleanId}`;
}

/**
 * Extract product ID from a slug
 * Example: "black-halter-peplum-top--6dd9fa67_4fd4_4cc6_81d3_37c65936f880" -> "6dd9fa67-4fd4-4cc6-81d3-37c65936f880"
 */
export function extractIdFromSlug(slug: string): string | null {
  // Look for the double hyphen separator
  const parts = slug.split('--');
  if (parts.length === 2) {
    const idPart = parts[1];
    // Convert underscores back to hyphens for UUID format
    const uuid = idPart.replace(/_/g, '-');
    // Validate UUID format (basic check)
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)) {
      return uuid;
    }
  }
  return null;
}
