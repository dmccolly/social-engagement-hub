import React from 'react';
import RichTextEditor from '../shared/RichTextEditor';

/**
 * EmailRichTextEditor
 *
 * A rich text editor wrapper for composing email bodies.
 * This component wraps the shared RichTextEditor and provides
 * full formatting capabilities (bold, italic, underline, lists,
 * links, images, videos, headings, alignment).
 *
 * Props:
 *  - value: initial HTML content for the editor. When this changes,
 *    the editor updates its content accordingly.
 *  - onChange: callback fired whenever the editor content changes.
 *    Receives the current HTML string as its argument.
 *
 * Note: For email deliverability, you may want to sanitize the HTML
 * output to remove certain tags (like iframes for video embeds) that
 * are not supported by email clients.
 */
export default function EmailRichTextEditor({ value = '', onChange }) {
  return (
    <RichTextEditor 
      value={value} 
      onChange={onChange}
      placeholder="Compose your email message..."
    />
  );
}
