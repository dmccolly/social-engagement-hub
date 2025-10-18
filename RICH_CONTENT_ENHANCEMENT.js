// Rich Content Enhancement - Link Support for Posts & Replies
// Adds link insertion, URL detection, and enhanced content formatting

import React, { useState, useRef, useEffect } from 'react';
import { Link, ExternalLink, X, Bold, Italic, Link2, Hash, AtSign } from 'lucide-react';

const RichContentEditor = ({ 
  content, 
  onChange, 
  placeholder = "Write your content...",
  showToolbar = true,
  className = "",
  maxLength = 2000,
  onUrlDetect = null
}) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [detectedUrls, setDetectedUrls] = useState([]);
  const editorRef = useRef(null);

  // Rich text formatting commands
  const formatCommands = {
    bold: () => document.execCommand('bold', false, null),
    italic: () => document.execCommand('italic', false, null),
    insertLink: () => setShowLinkDialog(true),
    insertMention: () => insertText('@'),
    insertHashtag: () => insertText('#')
  };

  // Auto-detect and format URLs in content
  const formatContent = (html) => {
    if (!html) return html;
    
    // Detect URLs and convert to clickable links
    let formatted = html.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>'
    );
    
    // Format @mentions
    formatted = formatted.replace(
      /@([a-zA-Z0-9_]+)/g,
      '<span class="text-blue-600 font-medium bg-blue-50 px-1 rounded">@$1</span>'
    );
    
    // Format #hashtags
    formatted = formatted.replace(
      /#([a-zA-Z0-9_]+)/g,
      '<span class="text-blue-600 font-medium bg-blue-50 px-1 rounded">#$1</span>'
    );
    
    return formatted;
  };

  const insertLink = () => {
    if (!linkUrl.trim()) return;
    
    // Clean and validate URL
    let cleanUrl = linkUrl.trim();
    if (!cleanUrl.startsWith('http')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    
    // Create link HTML
    const linkHtml = `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${linkText || cleanUrl}</a>`;
    
    // Insert at cursor position
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const fragment = range.createContextualFragment(linkHtml);
        range.deleteContents();
        range.insertNode(fragment);
        
        // Trigger onChange with updated content
        onChange(editorRef.current.innerHTML);
      } else {
        // Fallback: append to end
        const newContent = content + linkHtml;
        onChange(newContent);
      }
    }
    
    // Reset dialog
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  };

  const insertText = (text) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.innerHTML;
    onChange(newContent);
    
    // Auto-detect URLs for external processing
    const urls = detectUrls(newContent);
    if (urls.length > 0 && onUrlDetect) {
      onUrlDetect(urls);
    }
  };

  const detectUrls = (text) => {
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    return text.match(urlRegex) || [];
  };

  const processContent = () => {
    if (editorRef.current) {
      const rawContent = editorRef.current.innerHTML;
      const processedContent = formatContent(rawContent);
      
      if (processedContent !== rawContent) {
        editorRef.current.innerHTML = processedContent;
        onChange(processedContent);
      }
    }
  };

  // Process content on mount and when content changes
  useEffect(() => {
    processContent();
  }, [content]);

  // Character count
  const charCount = content.replace(/<[^>]*>/g, '').length;

  return (
    <div className={`rich-content-editor ${className}`}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
          <button
            type="button"
            onClick={formatCommands.bold}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition"
            title="Bold"
          >
            <Bold size={16} />
          </button>
          
          <button
            type="button"
            onClick={formatCommands.italic}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition"
            title="Italic"
          >
            <Italic size={16} />
          </button>
          
          <button
            type="button"
            onClick={formatCommands.insertLink}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition"
            title="Insert Link"
          >
            <Link2 size={16} />
          </button>
          
          <button
            type="button"
            onClick={formatCommands.insertMention}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition"
            title="Insert Mention"
          >
            <AtSign size={16} />
          </button>
          
          <button
            type="button"
            onClick={formatCommands.insertHashtag}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition"
            title="Insert Hashtag"
          >
            <Hash size={16} />
          </button>
          
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {charCount}/{maxLength}
            </span>
          </div>
        </div>
      )}

      {/* Content Editor */}
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        dangerouslySetInnerHTML={{ __html: content }}
        className="min-h-[120px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
        style={{ minHeight: '120px' }}
        data-placeholder={placeholder}
      />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Insert Link</h3>
              <button
                onClick={() => setShowLinkDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL *
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Text (optional)
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Link text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowLinkDialog(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={insertLink}
                  disabled={!linkUrl.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Insert Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* URL Detection Display */}
      {detectedUrls.length > 0 && (
        <div className="p-2 bg-blue-50 border-t border-blue-200">
          <p className="text-sm text-blue-700">
            Detected {detectedUrls.length} URL{detectedUrls.length > 1 ? 's' : ''}:
            {detectedUrls.map((url, i) => (
              <span key={i} className="ml-1">
                <ExternalLink size={12} className="inline mr-1" />
                {url}
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
};

// Enhanced NewsFeed Post Component with Rich Content Support
const EnhancedNewsFeedPost = ({ post, onLike, onReply, currentUser }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [detectedUrls, setDetectedUrls] = useState([]);

  const handleReplySubmit = () => {
    if (!replyContent.trim()) return;
    
    onReply(post.id, replyContent);
    setReplyContent('');
    setShowReplyForm(false);
  };

  const handleUrlDetect = (urls) => {
    setDetectedUrls(urls);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="font-semibold text-blue-600">
              {post.author_name?.charAt(0).toUpperCase() || 'V'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {post.author_name || 'Visitor'}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(post.created_at || post.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Post Content with Rich Formatting */}
      <div className="mb-4">
        <div 
          className="prose prose-sm max-w-none text-gray-700 rich-content"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(post.content) 
          }} 
        />
        
        {/* Detected URLs */}
        {detectedUrls.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
            <p className="text-sm text-blue-700 font-medium mb-2">Links in this post:</p>
            <div className="space-y-1">
              {detectedUrls.map((url, i) => (
                <a 
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink size={12} className="mr-1" />
                  {url.length > 50 ? `${url.substring(0, 50)}...` : url}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
        <button
          onClick={() => onLike(post.id)}
          className="flex items-center gap-2 hover:text-red-500 transition"
        >
          <Heart size={16} />
          <span>{post.likes_count || post.likes || 0} likes</span>
        </button>
        
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="flex items-center gap-2 hover:text-blue-500 transition"
        >
          <MessageSquare size={16} />
          <span>{post.replies_count || post.comments?.length || 0} comments</span>
        </button>
        
        <button className="flex items-center gap-2 hover:text-green-500 transition">
          <Share2 size={16} />
          <span>Share</span>
        </button>
      </div>

      {/* Reply Form with Rich Content */}
      {showReplyForm && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-3">
            <RichContentEditor
              content={replyContent}
              onChange={setReplyContent}
              placeholder="Write a reply..."
              showToolbar={true}
              maxLength={500}
              onUrlDetect={handleUrlDetect}
              className="mb-3"
            />
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReplyForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReplySubmit}
                disabled={!replyContent.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                Post Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replies Display */}
      {post.replies && post.replies.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-3">
            {post.replies.map((reply, index) => (
              <div key={reply.id || index} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-gray-600">
                    {reply.author_name?.charAt(0).toUpperCase() || 'R'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-900">
                      {reply.author_name || 'Visitor'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(reply.created_at || reply.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div 
                    className="text-sm text-gray-700"
                    dangerouslySetInnerHTML={{ 
                      __html: formatContent(reply.content) 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Content Types and Mechanisms Analysis
const ContentMechanismsAnalysis = {
  userContent: {
    types: [
      {
        type: 'posts',
        description: 'Main community posts with rich content support',
        features: [
          'Rich text formatting (bold, italic)',
          'Link insertion and auto-detection',
          'Mention support (@username)',
          'Hashtag support (#topic)',
          'URL auto-formatting',
          'Character counting',
          'Rich reply system'
        ],
        maxLength: 2000,
        supports: ['links', 'mentions', 'hashtags', 'formatting']
      },
      {
        type: 'replies',
        description: 'Comments on posts with rich content',
        features: [
          'Rich text formatting',
          'Link insertion',
          'Mention support',
          'URL detection',
          'Nested replies'
        ],
        maxLength: 500,
        supports: ['links', 'mentions', 'formatting']
      }
    ],
    contentTypes: [
      'text',
      'links',
      'mentions',
      'hashtags',
      'formatted text'
    ]
  },
  
  administrativeContent: {
    types: [
      {
        type: 'announcements',
        description: 'Admin announcements and updates',
        features: [
          'Rich formatting',
          'Link support',
          'Priority display',
          'Scheduling options'
        ],
        supports: ['rich formatting', 'links', 'scheduling']
      },
      {
        type: 'moderation_notices',
        description: 'Content moderation messages',
        features: [
          'Rich formatting',
          'Link to policies',
          'Action buttons'
        ],
        supports: ['rich formatting', 'links']
      }
    ]
  },
  
  technicalFeatures: {
    urlHandling: {
      autoDetect: true,
      formatAsLinks: true,
      openInNewTab: true,
      noFollow: true,
      maxLength: 200
    },
    mentionSystem: {
      autoComplete: true,
      userSuggestions: true,
      format: '@username',
      linkToProfile: true
    },
    hashtagSystem: {
      autoComplete: true,
      trendingDetection: true,
      format: '#topic',
      linkToSearch: true
    },
    richFormatting: {
      bold: true,
      italic: true,
      underline: false, // Keep it clean
      links: true,
      mentions: true,
      hashtags: true
    }
  }
};

export { RichContentEditor, EnhancedNewsFeedPost, ContentMechanismsAnalysis };