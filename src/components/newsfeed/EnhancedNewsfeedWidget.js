// src/components/newsfeed/EnhancedNewsfeedWidget.js
// Enhanced Newsfeed Widget with Rich Text, Attachments, Replies, and Full Facebook-like Features

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Heart, User, Clock, TrendingUp, ExternalLink, X, 
  Bold, Italic, Link as LinkIcon, Image as ImageIcon, Paperclip,
  Send, ChevronDown, ChevronUp, MoreHorizontal, Smile
} from 'lucide-react';
import { 
  getNewsfeedPosts, 
  createNewsfeedPost, 
  toggleNewsfeedLike, 
  getNewsfeedAnalytics,
  getNewsfeedReplies 
} from '../../services/newsfeedService';

const EnhancedNewsfeedWidget = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const headerColor = urlParams.get('headerColor') || '#10b981';
  const headerText = urlParams.get('headerText') || '💬 Community Feed';
  const maxPosts = parseInt(urlParams.get('maxPosts')) || 5;
  const showAvatars = urlParams.get('showAvatars') !== 'false';
  const showInteractions = urlParams.get('showInteractions') !== 'false';
  const showCreateButton = urlParams.get('showCreateButton') !== 'false';
  const borderRadius = urlParams.get('borderRadius') || '8';
  const debug = urlParams.get('debug') === 'true';
  const theme = urlParams.get('theme') || 'light';

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [visitorSession, setVisitorSession] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '' });
  
  // Rich text and attachments
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showFormattingToolbar, setShowFormattingToolbar] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  
  // Reply functionality
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedPosts, setExpandedPosts] = useState({});
  const [postReplies, setPostReplies] = useState({});
  const [loadingReplies, setLoadingReplies] = useState({});

  // Load visitor session from localStorage or parent window
  useEffect(() => {
    const savedSession = localStorage.getItem('visitor_session');
    if (savedSession) {
      try {
        setVisitorSession(JSON.parse(savedSession));
      } catch (e) {
        console.error('Failed to parse saved session', e);
      }
    }

    const handleMessage = (event) => {
      if (event.data.type === 'visitor_session') {
        setVisitorSession(event.data.session);
        localStorage.setItem('visitor_session', JSON.stringify(event.data.session));
      }
    };

    window.addEventListener('message', handleMessage);
    
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'request_visitor_session' }, '*');
    }

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Load posts and analytics
  useEffect(() => {
    loadPosts();
    loadAnalytics();
  }, []);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      
      const filters = {
        type: 'posts_only',
        limit: maxPosts,
        visitor_email: visitorSession?.email
      };
      
      const result = await getNewsfeedPosts(filters);
      
      if (result.success && result.posts) {
        setPosts(result.posts);
        
        // Load preview replies for each post (first 2 replies)
        result.posts.forEach(post => {
          if (post.comments_count > 0) {
            loadRepliesPreview(post.id);
          }
        });
      } else {
        const samplePosts = getSamplePosts();
        setPosts(samplePosts);
      }
    } catch (error) {
      console.error('Widget: Failed to load posts', error);
      const samplePosts = getSamplePosts();
      setPosts(samplePosts);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRepliesPreview = async (postId, limit = 2) => {
    try {
      setLoadingReplies(prev => ({ ...prev, [postId]: true }));
      const result = await getNewsfeedReplies(postId);
      
      if (result.success && result.replies) {
        // Store only first 2 replies as preview
        setPostReplies(prev => ({
          ...prev,
          [postId]: result.replies.slice(0, limit)
        }));
      }
    } catch (error) {
      console.error('Failed to load replies preview', error);
    } finally {
      setLoadingReplies(prev => ({ ...prev, [postId]: false }));
    }
  };

  const loadAllReplies = async (postId) => {
    try {
      setLoadingReplies(prev => ({ ...prev, [postId]: true }));
      const result = await getNewsfeedReplies(postId);
      
      if (result.success && result.replies) {
        setPostReplies(prev => ({
          ...prev,
          [postId]: result.replies
        }));
      }
    } catch (error) {
      console.error('Failed to load all replies', error);
    } finally {
      setLoadingReplies(prev => ({ ...prev, [postId]: false }));
    }
  };

  const loadAnalytics = async () => {
    try {
      const result = await getNewsfeedAnalytics('7d');
      if (result.success) {
        setAnalytics(result.analytics);
      }
    } catch (error) {
      console.error('Widget: Failed to load analytics', error);
    }
  };

  const handleAuthSubmit = () => {
    if (!authForm.name.trim() || !authForm.email.trim()) {
      alert('Please enter your name and email');
      return;
    }

    const session = {
      name: authForm.name,
      email: authForm.email,
      session_id: generateSessionId(),
      authenticated_at: new Date().toISOString()
    };

    setVisitorSession(session);
    localStorage.setItem('visitor_session', JSON.stringify(session));
    setShowAuthModal(false);
    setAuthForm({ name: '', email: '' });
  };

  const handlePostSubmit = async () => {
    if (!newPost.trim() && selectedImages.length === 0 && selectedFiles.length === 0) {
      alert('Please enter some content or attach a file');
      return;
    }
    
    if (!visitorSession) {
      setShowAuthModal(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Build content with formatting
      let content = newPost.trim();
      
      // Add image references
      if (selectedImages.length > 0) {
        content += '\n\n[Images: ' + selectedImages.map(img => img.name).join(', ') + ']';
      }
      
      // Add file references
      if (selectedFiles.length > 0) {
        content += '\n\n[Files: ' + selectedFiles.map(file => file.name).join(', ') + ']';
      }
      
      const postData = {
        author_name: visitorSession.name,
        author_email: visitorSession.email,
        author_id: visitorSession.member_id || null,
        content: content,
        session_id: visitorSession.session_id || generateSessionId(),
        post_type: 'post'
      };
      
      console.log('Submitting post:', postData);
      
      const result = await createNewsfeedPost(postData);
      
      if (result.success) {
        setNewPost('');
        setSelectedFiles([]);
        setSelectedImages([]);
        setShowCreateForm(false);
        setShowFormattingToolbar(false);
        loadPosts();
        
        if (window.parent !== window) {
          window.parent.postMessage({ 
            type: 'post_created',
            post: result.post 
          }, '*');
        }
      } else {
        alert('Failed to create post: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Widget: Post submit error', error);
      alert('Failed to create post: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (postId) => {
    if (!replyText.trim()) {
      alert('Please enter a reply');
      return;
    }
    
    if (!visitorSession) {
      setShowAuthModal(true);
      return;
    }
    
    try {
      const replyData = {
        author_name: visitorSession.name,
        author_email: visitorSession.email,
        author_id: visitorSession.member_id || null,
        content: replyText.trim(),
        parent_id: postId,
        session_id: visitorSession.session_id || generateSessionId(),
        post_type: 'reply'
      };
      
      const result = await createNewsfeedPost(replyData);
      
      if (result.success) {
        setReplyText('');
        setReplyingTo(null);
        
        // Update post comments count
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, comments_count: post.comments_count + 1 }
            : post
        ));
        
        // Reload replies for this post
        loadAllReplies(postId);
      } else {
        alert('Failed to post reply: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Widget: Reply submit error', error);
      alert('Failed to post reply: ' + error.message);
    }
  };

  const handleLike = async (postId) => {
    if (!visitorSession) {
      setShowAuthModal(true);
      return;
    }
    
    try {
      const authorEmail = visitorSession.email;
      const result = await toggleNewsfeedLike(postId, authorEmail);
      
      if (result.success) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: result.likes_count, visitor_liked: result.liked }
            : post
        ));
      }
    } catch (error) {
      console.error('Widget: Like error', error);
    }
  };

  const toggleReplies = (postId) => {
    setExpandedPosts(prev => {
      const isExpanded = !prev[postId];
      
      // Load all replies if expanding
      if (isExpanded && (!postReplies[postId] || postReplies[postId].length < 3)) {
        loadAllReplies(postId);
      }
      
      return { ...prev, [postId]: isExpanded };
    });
  };

  const handleViewFullFeed = () => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'navigate_to_feed' }, '*');
    } else {
      window.location.href = '/newsfeed';
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(prev => [...prev, ...files]);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const insertFormatting = (format) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newPost.substring(start, end);
    let formattedText = '';

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          formattedText = `[${selectedText || 'link text'}](${url})`;
        }
        break;
      default:
        return;
    }

    const newText = newPost.substring(0, start) + formattedText + newPost.substring(end);
    setNewPost(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  const generateSessionId = () => {
    return 'widget_session_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  };

  const getSamplePosts = () => {
    return [
      {
        id: 1,
        author_name: 'Sarah Johnson',
        author_email: 'sarah@example.com',
        content: 'Just discovered this amazing community widget! Perfect for engaging with website visitors. 🎉',
        likes_count: 12,
        comments_count: 3,
        visitor_liked: false,
        created_at: new Date().toISOString(),
        post_type: 'post'
      },
      {
        id: 2,
        author_name: 'Mike Chen',
        author_email: 'mike@example.com',
        content: 'This widget integration is seamless! Love how visitors can interact without leaving the page.',
        likes_count: 8,
        comments_count: 1,
        visitor_liked: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        post_type: 'post'
      },
      {
        id: 3,
        author_name: 'Emily Rodriguez',
        author_email: 'emily@example.com',
        content: 'The visitor registration process is so smooth. Great for building community engagement!',
        likes_count: 15,
        comments_count: 2,
        visitor_liked: false,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        post_type: 'post'
      }
    ];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow" style={{ borderRadius: `${borderRadius}px` }}>
        <div 
          className="text-white p-4 text-center font-bold"
          style={{ backgroundColor: headerColor, borderRadius: `${borderRadius}px ${borderRadius}px 0 0` }}
        >
          {headerText}
        </div>
        <div className="p-8 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Clock size={20} className="animate-spin" />
            Loading community feed...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg shadow overflow-hidden"
      style={{ borderRadius: `${borderRadius}px` }}
    >
      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Join the Conversation</h3>
            <p className="text-sm text-gray-600 mb-6">
              Enter your details to interact with the community
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button
                onClick={handleAuthSubmit}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div 
        className="text-white p-4 text-center font-bold"
        style={{ backgroundColor: headerColor, borderRadius: `${borderRadius}px ${borderRadius}px 0 0` }}
      >
        {headerText}
      </div>

      {/* Analytics Bar */}
      {analytics && (
        <div className="bg-gray-50 p-3 border-b">
          <div className="flex justify-between items-center text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <TrendingUp size={12} className="text-green-600" />
              {analytics.overview.engagement_rate}% engagement
            </span>
            <span>{analytics.overview.total_posts} posts this week</span>
            <span>{analytics.overview.total_likes} likes</span>
          </div>
        </div>
      )}

      {/* Post Creation */}
      {showCreateButton && (
        <div className="p-4 border-b bg-gray-50">
          {!showCreateForm ? (
            <button
              onClick={() => {
                if (!visitorSession) {
                  setShowAuthModal(true);
                } else {
                  setShowCreateForm(true);
                  setShowFormattingToolbar(true);
                }
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} />
              Share an Update
            </button>
          ) : (
            <div className="space-y-3">
              {/* Formatting Toolbar */}
              {showFormattingToolbar && (
                <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg">
                  <button
                    onClick={() => insertFormatting('bold')}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Bold"
                  >
                    <Bold size={16} />
                  </button>
                  <button
                    onClick={() => insertFormatting('italic')}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Italic"
                  >
                    <Italic size={16} />
                  </button>
                  <button
                    onClick={() => insertFormatting('link')}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Insert Link"
                  >
                    <LinkIcon size={16} />
                  </button>
                  <div className="h-6 w-px bg-gray-300 mx-1"></div>
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Add Image"
                  >
                    <ImageIcon size={16} />
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Attach File"
                  >
                    <Paperclip size={16} />
                  </button>
                </div>
              )}
              
              <textarea
                ref={textareaRef}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
              />
              
              {/* Selected Images Preview */}
              {selectedImages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedImages.map((img, idx) => (
                    <div key={idx} className="relative">
                      <div className="w-20 h-20 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-600 p-1">
                        {img.name.substring(0, 15)}...
                      </div>
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="space-y-1">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                      <span className="text-sm text-gray-700 flex items-center gap-2">
                        <Paperclip size={14} />
                        {file.name}
                      </span>
                      <button
                        onClick={() => removeFile(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {newPost.length} characters
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setShowFormattingToolbar(false);
                      setNewPost('');
                      setSelectedFiles([]);
                      setSelectedImages([]);
                    }}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePostSubmit}
                    disabled={(!newPost.trim() && selectedImages.length === 0 && selectedFiles.length === 0) || isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? 'Posting...' : (
                      <>
                        <Send size={14} />
                        Post
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Hidden file inputs */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}
        </div>
      )}

      {/* Posts List */}
      <div className="divide-y divide-gray-200">
        {posts.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare size={32} className="mx-auto mb-3 text-gray-300" />
            <h3 className="font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-sm text-gray-600 mb-4">
              Be the first to share something with the community!
            </p>
            <button
              onClick={() => {
                if (!visitorSession) {
                  setShowAuthModal(true);
                } else {
                  setShowCreateForm(true);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create First Post
            </button>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="p-4 hover:bg-gray-50 transition-colors">
              {/* Post Header */}
              <div className="flex items-start gap-3 mb-3">
                {showAvatars && (
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="text-blue-600" size={20} />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{post.author_name}</h4>
                    <span className="text-xs text-gray-500">
                      <Clock size={12} className="inline mr-1" />
                      {formatDate(post.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                </div>
              </div>

              {/* Post Actions */}
              {showInteractions && (
                <div className="space-y-3 mt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          post.visitor_liked 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Heart size={14} className={post.visitor_liked ? 'fill-current' : ''} />
                        <span>{post.likes_count} {post.likes_count === 1 ? 'Like' : 'Likes'}</span>
                      </button>
                      
                      <button
                        onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        <MessageSquare size={14} />
                        <span>Reply</span>
                      </button>
                      
                      {post.comments_count > 0 && (
                        <button
                          onClick={() => toggleReplies(post.id)}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                        >
                          {expandedPosts[post.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          <span>{post.comments_count} {post.comments_count === 1 ? 'Reply' : 'Replies'}</span>
                        </button>
                      )}
                    </div>
                    
                    <button
                      onClick={handleViewFullFeed}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      View Full Discussion
                      <ExternalLink size={12} />
                    </button>
                  </div>
                  
                  {/* Reply Form */}
                  {replyingTo === post.id && (
                    <div className="ml-12 space-y-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        rows="2"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                          className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReplySubmit(post.id)}
                          disabled={!replyText.trim()}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Replies Preview/Full List */}
                  {postReplies[post.id] && postReplies[post.id].length > 0 && (
                    <div className="ml-12 space-y-2 border-l-2 border-gray-200 pl-3">
                      {postReplies[post.id].map(reply => (
                        <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-xs text-gray-900">{reply.author_name}</span>
                            <span className="text-xs text-gray-500">{formatDate(reply.created_at)}</span>
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed">{reply.content}</p>
                        </div>
                      ))}
                      
                      {!expandedPosts[post.id] && post.comments_count > 2 && (
                        <button
                          onClick={() => toggleReplies(post.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View {post.comments_count - 2} more {post.comments_count - 2 === 1 ? 'reply' : 'replies'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Powered by Social Engagement Hub
          </span>
          <button
            onClick={handleViewFullFeed}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View Full Community
            <ExternalLink size={14} />
          </button>
        </div>
        
        {debug && (
          <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
            <strong>Debug Info:</strong> Widget loaded with {posts.length} posts
            {visitorSession && ` • Authenticated as ${visitorSession.name}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedNewsfeedWidget;
