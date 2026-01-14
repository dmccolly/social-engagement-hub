import React, { useState } from 'react';
import { X } from 'lucide-react';
import { convertEventToEmailCampaign } from './EventToEmailConverter_Simple';

/**
 * Modal for configuring Event-to-Email conversion with full preview
 */
const EventToEmailModal = ({ event, blogPosts, onConvert, onCancel }) => {
  const [selectedBlogPostId, setSelectedBlogPostId] = useState('');
  const [includeBlog, setIncludeBlog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const selectedBlogPost = includeBlog && selectedBlogPostId
    ? blogPosts.find(p => p.id === parseInt(selectedBlogPostId))
    : null;

  // Generate preview campaign data
  const previewCampaign = convertEventToEmailCampaign(event, selectedBlogPost);

  const handleConvert = () => {
    onConvert(selectedBlogPost);
  };

  const renderEmailPreview = () => {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
        <div className="mb-4 pb-4 border-b border-gray-200">
          <p className="text-sm text-gray-600 mb-1"><strong>Subject:</strong> {previewCampaign.subject}</p>
          <p className="text-sm text-gray-600 mb-1"><strong>From:</strong> {previewCampaign.fromName} &lt;{previewCampaign.fromEmail}&gt;</p>
        </div>
        
        {previewCampaign.blocks.map((block, index) => {
          if (block.type === 'html') {
            return (
              <div key={block.id || index} dangerouslySetInnerHTML={{ __html: block.content.html }} />
            );
          } else if (block.type === 'button') {
            return (
              <div key={block.id || index} style={{ textAlign: 'center', margin: '20px 0' }}>
                <a
                  href={block.content.url}
                  style={{
                    display: 'inline-block',
                    padding: '12px 32px',
                    backgroundColor: block.content.color,
                    color: block.content.textColor,
                    textDecoration: 'none',
                    borderRadius: `${block.content.borderRadius}px`,
                    fontSize: `${block.content.fontSize}px`,
                    fontWeight: 'bold'
                  }}
                >
                  {block.content.text}
                </a>
              </div>
            );
          } else if (block.type === 'spacer') {
            return <div key={block.id || index} style={{ height: `${block.content.height}px` }} />;
          } else if (block.type === 'divider') {
            return (
              <hr
                key={block.id || index}
                style={{
                  border: 'none',
                  borderTop: `${block.content.thickness}px solid ${block.content.color}`,
                  margin: '20px 0'
                }}
              />
            );
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-hidden flex flex-col" style={{ maxWidth: showPreview ? '1200px' : '600px' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Convert Event to Email Campaign</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className={showPreview ? "grid grid-cols-2 gap-6 p-6" : "p-6"}>
            {/* Left side: Configuration */}
            <div className="space-y-6">
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

              {/* Content Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Email Content</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Event details with image and description</li>
                  {includeBlog && selectedBlogPostId && (
                    <>
                      <li>✓ Blog post with full formatting and images</li>
                      <li>✓ "Read Full Article" button</li>
                    </>
                  )}
                  {event.rsvp_enabled && <li>✓ "RSVP Now" call-to-action button</li>}
                </ul>
              </div>

              {/* Preview Toggle */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700"
              >
                {showPreview ? '← Hide Full Preview' : 'Show Full Preview →'}
              </button>
            </div>

            {/* Right side: Full Email Preview (only shown when toggled) */}
            {showPreview && (
              <div className="border-l pl-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">Email Preview</h3>
                <div className="bg-gray-100 p-4 rounded-lg overflow-y-auto" style={{ maxHeight: '600px' }}>
                  {renderEmailPreview()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 flex-shrink-0">
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
