import React, { useState } from 'react';
import RichTextEditor from './RichTextEditor';

/**
 * PatchedRichNewsfeedEditor
 *
 * Provides a full‑featured editor for creating rich text posts in the
 * community newsfeed.  It leverages the shared RichTextEditor
 * component for formatting and exposes Post/Cancel controls.  When
 * the user clicks Post, the `onSave` callback is invoked with an
 * object containing the HTML content.  Parents can handle the
 * content (e.g. send to an API) and clear the editor when
 * appropriate.
 */
const PatchedRichNewsfeedEditor = ({ onSave, onCancel, initialContent = '' }) => {
  const [content, setContent] = useState(initialContent);

  const handlePost = () => {
    if (!content.trim()) return;
    if (onSave) {
      onSave({ content: content.trim() });
    }
    setContent('');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Post Content</label>
        <RichTextEditor value={content} onChange={setContent} />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => onCancel?.()}
          className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handlePost}
          disabled={!content.trim()}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Post
        </button>
      </div>
    </div>
  );
};

export default PatchedRichNewsfeedEditor;