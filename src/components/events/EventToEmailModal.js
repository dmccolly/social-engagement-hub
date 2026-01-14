import React, { useState } from 'react';
import { X } from 'lucide-react';

/**
 * Modal for configuring Event-to-Email conversion
 * Takes blog posts as props to avoid async loading issues
 */
const EventToEmailModal = ({ event, blogPosts, onConvert, onCancel }) => {
  const [selectedBlogPostId, setSelectedBlogPostId] = useState('');
  const [includeBlog, setIncludeBlog] = useState(false);

  const handleConvert = () => {
    const selectedBlogPost = includeBlog && selectedBlogPostId
      ? blogPosts.find(p => p.id === parseInt(selectedBlogPostId))
      : null;

    onConvert(selectedBlogPost);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Convert Event to Email Campaign</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Event Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">{event.title}</h3>
            <p className="text-sm text-gray-600">
              {new Date(event.start_time).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
            {event.location && (
              <p className="text-sm text-gray-600 mt-1">{event.location}</p>
            )}
          </div>

          {/* Blog Post Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="includeBlog"
                checked={includeBlog}
                onChange={(e) => setIncludeBlog(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <label htmlFor="includeBlog" className="text-lg font-medium text-gray-900">
                Include Blog Post
              </label>
            </div>

            {includeBlog && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Blog Post
                </label>
                <select
                  value={selectedBlogPostId}
                  onChange={(e) => setSelectedBlogPostId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select a blog post --</option>
                  {blogPosts.map(post => (
                    <option key={post.id} value={post.id}>
                      {post.title}
                    </option>
                  ))}
                </select>

                {selectedBlogPostId && (
                  <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-sm text-gray-600">
                      Selected: <strong>{blogPosts.find(p => p.id === parseInt(selectedBlogPostId))?.title}</strong>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Email Preview</h4>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Subject:</strong> {event.title}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>From:</strong> {event.organizer_name || 'History of Idaho Broadcasting'}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Content Blocks:</strong>
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside mt-1">
              <li>Event details with image and description</li>
              {includeBlog && selectedBlogPostId && (
                <li>Blog post: {blogPosts.find(p => p.id === parseInt(selectedBlogPostId))?.title}</li>
              )}
              {event.rsvp_enabled && <li>Call-to-action button: "RSVP Now"</li>}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConvert}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            Convert to Email Campaign →
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventToEmailModal;
