/**
 * HTML Sanitizer for Blog Posts
 * Removes Microsoft Word styling and cleans up HTML while preserving content and images
 */

export function sanitizeHTML(html) {
  if (!html) return '';
  
  // Create a temporary div to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Remove all style attributes
  const allElements = temp.querySelectorAll('*');
  allElements.forEach(el => {
    // Remove style attribute
    el.removeAttribute('style');
    
    // Remove data- and aria- attributes
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('data-') || attr.name.startsWith('aria-')) {
        el.removeAttribute(attr.name);
      }
    });
    
    // Remove Microsoft Word classes
    if (el.className) {
      const classes = el.className.split(' ').filter(c => 
        !c.includes('SCX') && !c.includes('BCX') && !c.includes('SCXW') && !c.includes('Mso')
      );
      if (classes.length > 0) {
        el.className = classes.join(' ');
      } else {
        el.removeAttribute('class');
      }
    }
    
    // Remove xml:lang attributes
    el.removeAttribute('xml:lang');
    el.removeAttribute('paraeid');
    el.removeAttribute('paraid');
  });
  
  // Simplify nested spans - unwrap spans that don't have meaningful attributes
  const spans = temp.querySelectorAll('span');
  spans.forEach(span => {
    if (!span.className && !span.id && span.attributes.length === 0) {
      // Unwrap the span - replace it with its contents
      const parent = span.parentNode;
      while (span.firstChild) {
        parent.insertBefore(span.firstChild, span);
      }
      parent.removeChild(span);
    }
  });
  
  return temp.innerHTML;
}

/**
 * Sanitize HTML before saving to database
 */
export function sanitizeBeforeSave(html) {
  const cleaned = sanitizeHTML(html);
  
  // Additional cleanup for saving
  // Remove empty paragraphs and divs
  const temp = document.createElement('div');
  temp.innerHTML = cleaned;
  
  const emptyElements = temp.querySelectorAll('p:empty, div:empty');
  emptyElements.forEach(el => el.remove());
  
  return temp.innerHTML;
}
