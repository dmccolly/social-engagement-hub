import React, { useState } from 'react';
import RichTextEditor from './components/shared/RichTextEditor';

/**
 * PatchedRichBlogEditor provides a rich blog-post editing
 * experience with full formatting toolbar and Cloudinary image uploads.
 * 
 * This component uses the shared RichTextEditor which includes a complete
 * formatting toolbar with built-in Cloudinary image upload functionality.
 * Images are inserted at the cursor position with full control options
 * (resize, position, delete).
 *
 * To persist the result, supply onSave and onCancel callbacks.
 */
const PatchedRichBlogEditor = ({ 
  onSave, 
  onCancel, 
  initialTitle = '', 
  initialContent = '',
  initialFeatured = false,
  initialPinned = false,
  initialSortOrder = 0
}) => {
  // Title and content state
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  
  const [featured, setFeatured] = useState(initialFeatured);
  const [pinned, setPinned] = useState(initialPinned);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);

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
        featured,
        pinned,
        sort_order: sortOrder,
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
        featured,
        pinned,
        sort_order: sortOrder,
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
        featured,
        pinned,
        sort_order: sortOrder,
      });
    }
    setShowScheduleModal(false);
    setScheduledDateTime('');
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

      {/* Premium Listing and Ordering Controls */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Post Options</h3>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Premium Listing (Featured)
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Pin to Top
            </span>
          </label>
          <div className="flex items-center gap-2">
            <label htmlFor="sort-order" className="text-sm font-medium text-gray-700">
              Sort Order:
            </label>
            <input
              id="sort-order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
            <span className="text-xs text-gray-500">(lower numbers appear first)</span>
          </div>
        </div>
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
