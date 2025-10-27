import React, { useRef, useEffect } from 'react';

/**
 * RichTextEditor component
 *
 * A reusable rich‑text editor that exposes a contentEditable region
 * along with a simple toolbar for common formatting commands.  The
 * component accepts an initial `value` prop containing HTML and
 * invokes `onChange` whenever the content changes.  This editor
 * intentionally relies on the built‑in `document.execCommand` API
 * rather than an external dependency to keep it lightweight and
 * portable.  Consumers can style the toolbar and editor via
 * className overrides or global CSS.
 */
const RichTextEditor = ({ value = '', onChange }) => {
  const editorRef = useRef(null);

  // Keep the editor content in sync when `value` changes.
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  /**
   * Execute a formatting command on the current selection.
   */
  const exec = (command, arg = null) => {
    if (command === 'link') {
      const url = window.prompt('Enter link URL');
      if (!url) return;
      document.execCommand('createLink', false, url);
    } else if (command === 'image') {
      const url = window.prompt('Enter image URL');
      if (!url) return;
      document.execCommand('insertImage', false, url);
    } else {
      document.execCommand(command, false, arg);
    }
    if (typeof onChange === 'function' && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  /**
   * Handle input events to propagate changes to parent.
   */
  const handleInput = () => {
    if (typeof onChange === 'function' && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border rounded shadow-sm p-2">
      <div className="flex flex-wrap gap-1 mb-2">
        {/* Formatting buttons */}
        <button
          type="button"
          className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
          onClick={() => exec('bold')}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
          onClick={() => exec('italic')}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
          onClick={() => exec('underline')}
          title="Underline"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
          onClick={() => exec('insertOrderedList')}
          title="Numbered List"
        >
          1.
        </button>
        <button
          type="button"
          className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
          onClick={() => exec('insertUnorderedList')}
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
          onClick={() => exec('link')}
          title="Insert Link"
        >
          🔗
        </button>
        <button
          type="button"
          className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
          onClick={() => exec('image')}
          title="Insert Image"
        >
          🖼️
        </button>
        <button
          type="button"
          className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
          onClick={() => exec('formatBlock', '<h2>')}
          title="Heading"
        >
          H2
        </button>
        <button
          type="button"
          className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
          onClick={() => exec('formatBlock', '<p>')}
          title="Paragraph"
        >
          ¶
        </button>
      </div>
      <div
        ref={editorRef}
        className="min-h-[200px] border rounded p-2 focus:outline-none"
        contentEditable
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value || '' }}
        style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}
      />
    </div>
  );
};

export default RichTextEditor;