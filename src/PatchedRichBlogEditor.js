import React, { useState, useCallback } from 'react';
import RichTextEditor from './components/shared/RichTextEditor';

/**
 * BlogPostEditor — wrapper around RichTextEditor for blog post creation/editing.
 *
 * Improvements over the previous version:
 *  - Live word count + estimated read time
 *  - Unsaved-changes indicator
 *  - Confirmation before cancelling with unsaved changes
 *  - Cleaner action bar layout
 */
const PatchedRichBlogEditor = ({
  onSave,
  onCancel,
  initialTitle = '',
  initialContent = '',
  initialFeatured = false,
  initialPinned = false,
  initialSortOrder = 0,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [featured, setFeatured] = useState(initialFeatured);
  const [pinned, setPinned] = useState(initialPinned);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setIsDirty(true);
  };

  const handleContentChange = useCallback((html) => {
    setContent(html);
    setIsDirty(true);
  }, []);

  // Word count: strip HTML tags then count whitespace-separated tokens
  const wordCount = content
    ? content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length
    : 0;

  const canSave = title.trim().length > 0 && content.replace(/<[^>]+>/g, '').trim().length > 0;

  const buildPayload = (status, scheduled_datetime = null) => ({
    title: title.trim(),
    content: content.trim(),
    status,
    scheduled_datetime,
    featured,
    pinned,
    sort_order: sortOrder,
  });

  const handleSaveAsDraft = () => { if (onSave) onSave(buildPayload('draft')); };
  const handlePublishNow  = () => { if (onSave) onSave(buildPayload('published')); };

  const handleSchedule = () => {
    if (!scheduledDateTime) return;
    if (onSave) onSave(buildPayload('scheduled', scheduledDateTime));
    setShowScheduleModal(false);
    setScheduledDateTime('');
  };

  const handleCancel = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Leave without saving?')) return;
    onCancel?.();
  };

  return (
    <div className="space-y-5">

      {/* Title row */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="post-title">
            Post Title
          </label>
          {isDirty && (
            <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
              Unsaved changes
            </span>
          )}
        </div>
        <input
          id="post-title"
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Give your post a title…"
          className="w-full px-4 py-3 text-xl font-bold border border-gray-300 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-300"
        />
      </div>

      {/* Post options */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Post Options
        </p>
        <div className="flex flex-wrap gap-6 items-center">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => { setFeatured(e.target.checked); setIsDirty(true); }}
              className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 font-medium">Featured (premium listing)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => { setPinned(e.target.checked); setIsDirty(true); }}
              className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 font-medium">Pin to top</span>
          </label>
          <div className="flex items-center gap-2">
            <label htmlFor="sort-order" className="text-sm font-medium text-gray-700">
              Sort order:
            </label>
            <input
              id="sort-order"
              type="number"
              value={sortOrder}
              onChange={(e) => { setSortOrder(parseInt(e.target.value, 10) || 0); setIsDirty(true); }}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
            <span className="text-xs text-gray-400">(lower = earlier)</span>
          </div>
        </div>
      </div>

      {/* Editor with word count header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">Content</label>
          <span className="text-xs text-gray-400">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
            {wordCount > 0 && (
              <span className="ml-2 text-gray-300">
                ~{Math.max(1, Math.ceil(wordCount / 200))} min read
              </span>
            )}
          </span>
        </div>
        <RichTextEditor
          value={content}
          onChange={handleContentChange}
          placeholder="Write your post here…"
        />
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t border-gray-100">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-300
            text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSaveAsDraft}
            disabled={!canSave}
            title="Save without publishing — only visible to you"
            className="px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-300
              text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => setShowScheduleModal(true)}
            disabled={!canSave}
            title="Choose a future date and time to publish"
            className="px-4 py-2.5 text-sm font-medium rounded-xl border border-blue-300
              text-blue-700 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Schedule…
          </button>
          <button
            type="button"
            onClick={handlePublishNow}
            disabled={!canSave}
            title="Publish immediately"
            className="px-4 py-2.5 text-sm font-medium rounded-xl bg-green-600 text-white
              hover:bg-green-700 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Publish Now
          </button>
        </div>
      </div>

      {/* Schedule modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Schedule Post</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Publish date &amp; time
              </label>
              <input
                type="datetime-local"
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Uses your local timezone.</p>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setShowScheduleModal(false); setScheduledDateTime(''); }}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSchedule}
                disabled={!scheduledDateTime}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700
                  disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatchedRichBlogEditor;
