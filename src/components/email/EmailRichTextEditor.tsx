import React, { useRef, useEffect } from 'react';

export interface EmailRichTextEditorProps {
  /**
   * Initial HTML content for the editor. When the value changes from
   * outside the component, the editor content is updated accordingly.
   */
  value?: string;
  /**
   * Callback fired whenever the editor content changes. The callback
   * receives the current HTML string as its argument.
   */
  onChange?: (html: string) => void;
}

/**
 * EmailRichTextEditor
 *
 * A very simple rich text editor tailored for composing email bodies.
 * It uses the built-in `document.execCommand` API to apply basic
 * formatting commands such as bold, italic and underline. The
 * component is intentionally minimalist and can be enhanced with
 * additional commands or UI as needed. Consumers should persist
 * the HTML output via the onChange callback.
 */
const EmailRichTextEditor: React.FC<EmailRichTextEditorProps> = ({ value = '', onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update the editor content if the `value` prop changes
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    // After executing a command, trigger an onChange with the updated HTML
    if (editorRef.current) {
      onChange?.(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange?.(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border rounded-lg p-2 bg-white">
      {/* Toolbar */}
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          className="px-2 py-1 border rounded text-sm hover:bg-gray-100"
          onClick={() => execCommand('bold')}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className="px-2 py-1 border rounded text-sm italic hover:bg-gray-100"
          onClick={() => execCommand('italic')}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className="px-2 py-1 border rounded text-sm underline hover:bg-gray-100"
          onClick={() => execCommand('underline')}
        >
          <span style={{ textDecoration: 'underline' }}>U</span>
        </button>
        <button
          type="button"
          className="px-2 py-1 border rounded text-sm hover:bg-gray-100"
          onClick={() => {
            const url = prompt('Enter URL');
            if (url) execCommand('createLink', url);
          }}
        >
          Link
        </button>
      </div>
      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        onInput={handleInput}
      />
    </div>
  );
};

export default EmailRichTextEditor;