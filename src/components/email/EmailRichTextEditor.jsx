import React from 'react';
import RichTextEditor from '../feature-rich/RichTextEditor';

/**
 * Updated EmailRichTextEditor
 *
 * This component replaces the minimalist email editor with a full rich text
 * experience. It simply wraps the shared RichTextEditor component and
 * forwards the `value` and `onChange` props. Consumers can use it
 * wherever EmailRichTextEditor was previously used in the project.
 */
const EmailRichTextEditor = ({ value = '', onChange }) => {
  return <RichTextEditor value={value} onChange={onChange} />;
};

export default EmailRichTextEditor;