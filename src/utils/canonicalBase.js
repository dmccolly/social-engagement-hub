
/**
 * Get the canonical base URL for the application.
 * Prioritizes REACT_APP_BASE_URL environment variable, falls back to window.location.origin.
 * Strips trailing slashes to prevent double slashes in constructed URLs.
 * 
 * @returns {string} The canonical base URL (e.g., "https://gleaming-cendol-417bf3.netlify.app")
 */
export const CANONICAL_BASE = (
  (process.env.REACT_APP_BASE_URL || '').replace(/\/+$/, '') ||
  (typeof window !== 'undefined' ? window.location.origin.replace(/\/+$/, '') : '')
);

/**
 * Build a full URL using the canonical base.
 * 
 * @param {string} path - The path to append (e.g., "/widget/blog" or "widget/blog")
 * @returns {string} The full canonical URL
 * 
 * @example
 * buildCanonicalUrl('/widget/blog') // "https://gleaming-cendol-417bf3.netlify.app/widget/blog"
 * buildCanonicalUrl('widget/blog')  // "https://gleaming-cendol-417bf3.netlify.app/widget/blog"
 */
export const buildCanonicalUrl = (path) => {
  const cleanPath = path.replace(/^\/+/, ''); // Remove leading slashes
  return `${CANONICAL_BASE}/${cleanPath}`;
};

export default CANONICAL_BASE;
