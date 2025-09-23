
import React, { useState } from 'react';
import ReactQuill from 'react-quill';


const QuillEditor = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSave = () => {
    onSave?.({
      title,
      content,
    });
  };

  return (
    <div className="quill-editor">
        <input
            type="text"
            placeholder="Enter post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 text-2xl font-bold border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
        />
        <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            className="w-full min-h-[300px] p-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end gap-2 mt-4">
            <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
                Cancel
            </button>
            <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Save
            </button>
        </div>
    </div>
  );
};

export default QuillEditor;

