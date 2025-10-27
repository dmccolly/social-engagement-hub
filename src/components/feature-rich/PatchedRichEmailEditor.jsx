import React, { useState } from 'react';
import RichTextEditor from './RichTextEditor';

/**
 * PatchedRichEmailEditor
 *
 * A reusable editor for composing full email bodies.  It exposes a
 * RichTextEditor and simple Save/Cancel controls.  Consumers can
 * provide an initial HTML string via `initialContent` and receive the
 * updated HTML on save.  Subject lines and other campaign metadata
 * should be handled outside this component.
 */
const PatchedRichEmailEditor = ({ onSave, onCancel, initialContent = '' }) => {
  const [content, setContent] = useState(initialContent);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email Content</label>
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
          onClick={() => onSave?.({ content: content.trim() })}
          disabled={!content.trim()}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default PatchedRichEmailEditor;