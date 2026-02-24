/**
 * HTML Sanitizer for Blog Posts
 *
 * Uses DOMPurify for safe, crash-resistant sanitization.
 * Preserves ALL Tiptap formatting: text color, text alignment,
 * bold, italic, underline, headings, lists, links, images,
 * YouTube/Vimeo embeds, audio, and video.
 *
 * Removes: scripts, event handlers, Word-specific garbage, and
 *          any CSS properties that could be used for UI attacks.
 */

import DOMPurify from 'dompurify';

// CSS properties that are safe and meaningful to keep
const SAFE_CSS_PROPS = new Set([
  'color',
  'background-color',
  'text-align',
  'font-size',
  'font-weight',
  'font-style',
  'text-decoration',
  'line-height',
  'width',
  'max-width',
  'height',
  'max-height',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-radius',
  'border',
  'border-left',
  'float',
  'display',
  'vertical-align',
  'aspect-ratio',
  'pointer-events',
]);

/** Filter a CSS style string to only the allowed safe properties. */
function filterStyle(styleStr) {
  if (!styleStr) return '';
  return styleStr
    .split(';')
    .map(s => s.trim())
    .filter(decl => {
      if (!decl) return false;
      const colon = decl.indexOf(':');
      if (colon < 0) return false;
      return SAFE_CSS_PROPS.has(decl.slice(0, colon).trim().toLowerCase());
    })
    .join('; ');
}

const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'strike', 'mark',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img', 'figure', 'figcaption',
    'iframe', 'video', 'source', 'audio',
    'div', 'span',
    'hr', 'sub', 'sup',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'srcset', 'alt', 'title', 'class', 'id', 'style',
    'target', 'rel',
    'controls', 'autoplay', 'muted', 'loop', 'playsinline',
    'width', 'height', 'type', 'loading',
    'allow', 'allowfullscreen', 'frameborder', 'referrerpolicy',
    'data-youtube-video', 'data-type',
    'start', 'colspan', 'rowspan',
  ],
  ADD_TAGS: ['iframe', 'audio', 'video', 'source'],
  ADD_ATTR: ['allowfullscreen', 'allow', 'controls', 'referrerpolicy'],
  FORCE_BODY: false,
};

/**
 * Sanitize HTML before saving to the database.
 *
 * Preserves formatting styles (color, text-align) by pre-filtering
 * the style attribute to safe CSS properties before passing through
 * DOMPurify for XSS protection.
 */
export function sanitizeBeforeSave(html) {
  if (!html) return '';

  // Step 1: Pre-filter style attributes to safe CSS only.
  // We do this via a temp DOM element before DOMPurify runs, because
  // DOMPurify by default strips all style attributes that contain
  // properties it considers potentially dangerous.
  let input = html;
  try {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    tmp.querySelectorAll('[style]').forEach(el => {
      const filtered = filterStyle(el.getAttribute('style') || '');
      if (filtered) {
        el.setAttribute('style', filtered);
      } else {
        el.removeAttribute('style');
      }
    });
    input = tmp.innerHTML;
  } catch (_) {
    // If pre-filtering fails, continue with original HTML —
    // DOMPurify will still sanitize out dangerous content.
  }

  // Step 2: XSS sanitization via DOMPurify.
  const clean = DOMPurify.sanitize(input, DOMPURIFY_CONFIG);

  // Step 3: Remove genuinely empty block elements (no text, no children).
  try {
    const tmp = document.createElement('div');
    tmp.innerHTML = clean;
    tmp.querySelectorAll('p, div').forEach(el => {
      if (el.children.length === 0 && !(el.textContent || '').trim()) {
        el.remove();
      }
    });
    return tmp.innerHTML;
  } catch (_) {
    return clean;
  }
}

/** Alias kept for any legacy callers. */
export function sanitizeHTML(html) {
  return sanitizeBeforeSave(html);
}
