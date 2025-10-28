import React, { useState, useRef } from 'react';
import RichTextEditor from './components/shared/RichTextEditor';

/**
 * PatchedRichBlogEditor provides a rich blog-post editing
 * experience with full formatting toolbar and Cloudinary image uploads.
 * 
 * This component combines the shared RichTextEditor (with formatting toolbar)
 * and Cloudinary image upload functionality for a complete blog editing experience.
 *
 * To persist the result, supply onSave and onCancel callbacks.
 */
const PatchedRichBlogEditor = ({ onSave, onCancel, initialTitle = '', initialContent = '' }) => {
  // Title and content state
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');

  /**
   * Handle save as draft
   */
  const handleSaveAsDraft = () => {
    if (onSave) {
      onSave({
        title: title.trim(),
        content: content.trim(),
        status: 'draft',
        scheduled_datetime: null,
      });
    }
  };

  /**
   * Handle publish now
   */
  const handlePublishNow = () => {
    if (onSave) {
      onSave({
        title: title.trim(),
        content: content.trim(),
        status: 'published',
        scheduled_datetime: null,
      });
    }
  };

  /**
   * Handle schedule post
   */
  const handleSchedule = () => {
    if (!scheduledDateTime) {
      alert('Please select a date and time to schedule the post.');
      return;
    }
    if (onSave) {
      onSave({
        title: title.trim(),
        content: content.trim(),
        status: 'scheduled',
        scheduled_datetime: scheduledDateTime,
      });
    }
    setShowScheduleModal(false);
    setScheduledDateTime('');
  };

  /**
   * Handle image uploads. Sends a POST request to Cloudinary
   * and, on success, inserts the uploaded image URL into the editor content.
   */
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append(
        'upload_preset',
        process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'demo-preset'
      );
      const cloudName =
        process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'demo-cloud-name';
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      const data = await response.json();
      // Insert the uploaded image into the content
      const imageHtml = `<div class="my-4"><img src="${data.secure_url}" alt="${file.name}" class="max-w-full h-auto rounded-lg shadow-md" /></div>`;
      setContent(content + imageHtml);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error(error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div className="space-y-4">
      {/* Title Input */}
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
          className="w-full px-4 py-3 text-2xl font-bold border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Cloudinary Image Upload */}
      <div className="mb-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Image from Computer'}
        </button>
        <p className="text-xs text-gray-500 mt-1">
          Upload images from your computer via Cloudinary. You can also insert images by URL using the toolbar below.
        </p>
      </div>

      {/* Rich Text Editor for Content */}
      <div>
        <label className="block text-sm font-medium mb-1">Post Content</label>
        <RichTextEditor 
          value={content} 
          onChange={setContent}
          placeholder="Write your blog post content here..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-between items-center">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
        >
          Cancel
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSaveAsDraft}
            disabled={!title.trim() || !content.trim()}
            className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500 disabled:opacity-50"
            title="Save as draft (not visible to public)"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={handlePublishNow}
            disabled={!title.trim() || !content.trim()}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            title="Publish immediately to live site"
          >
            Publish Now
          </button>
          <button
            type="button"
            onClick={() => setShowScheduleModal(true)}
            disabled={!title.trim() || !content.trim()}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            title="Schedule for future publication"
          >
            Schedule...
          </button>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Schedule Post</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publish Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Post will be published automatically at this time (your local timezone)
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setShowScheduleModal(false); setScheduledDateTime(''); }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={!scheduledDateTime}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Schedule Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatchedRichBlogEditor;
