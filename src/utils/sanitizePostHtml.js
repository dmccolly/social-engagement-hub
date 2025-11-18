import createDOMPurify from 'dompurify';

const DOMPurify = createDOMPurify(window);

DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
  if (node.nodeName?.toLowerCase() === 'iframe' && data.attrName === 'src') {
    const isAllowed = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|player\.vimeo\.com)\//i.test(data.attrValue);
    if (!isAllowed) {
      data.keepAttr = false;
    }
  }
});

const config = {
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['src', 'allow', 'allowfullscreen', 'frameborder', 'class', 'data-position', 'data-size', 'data-media-type', 'width', 'height', 'loading'],
  FORBID_TAGS: ['script']
};

/**
 * Sanitizes post HTML content while preserving YouTube/Vimeo iframes and necessary classes
 * @param {string} html - The HTML content to sanitize
 * @returns {string} - The sanitized HTML
 */
export const sanitizePostHtml = (html) => {
  return DOMPurify.sanitize(html ?? '', config);
};
