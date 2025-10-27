import React, { useState } from 'react';
import RichTextEditor from './RichTextEditor';

/**
 * PatchedRichBlogEditor
 *
 * Provides a full‑featured editor for creating or editing blog posts.  It
 * supports editing the post title and body using the shared
 * RichTextEditor component.  When the user clicks Save, the
 * `onSave` callback is invoked with an object containing the title
 * and HTML content.  The parent can persist the post via an API call.
 */
const PatchedRichBlogEditor = ({ onSave, onCancel, initialTitle = '', initialContent = '' }) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="post-title">
          Post Title
        </label>
        <input
          id="post-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter post title..."
          className="w-full border rounded px-3 py-2"
        />
      </div>
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
          onClick={() => onSave?.({ title: title.trim(), content: content.trim() })}
          disabled={!title.trim() || !content.trim()}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default PatchedRichBlogEditor;