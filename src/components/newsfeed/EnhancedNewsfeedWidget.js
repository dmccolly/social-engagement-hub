// src/components/newsfeed/EnhancedNewsfeedWidget.js
// Enhanced Newsfeed Widget with Rich Text, Attachments, Replies, and Full Facebook-like Features
// Updated: 2026-01-01 - Trigger rebuild to deploy reply functionality

import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { 
  MessageSquare, Heart, User, Clock, TrendingUp, ExternalLink, X, 
  Bold, Italic, Link as LinkIcon, Image as ImageIcon, Paperclip,
  Send, ChevronDown, ChevronUp, MoreHorizontal, Smile, MessageCircle, Trash2, Archive,
  Share2, Copy, Check, Edit2
} from 'lucide-react';
import { 
  getNewsfeedPosts, 
  createNewsfeedPost, 
  updateNewsfeedPost,
  toggleNewsfeedLike, 
  getNewsfeedAnalytics,
  getNewsfeedReplies,
  deleteNewsfeedPost,
  archiveNewsfeedPost 
} from '../../services/newsfeedService';
import RichTextEditor from '../shared/RichTextEditor';

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

  useEffect(() => {
    const styleId = 'newsfeed-widget-media-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* Media wrapper base styles */
        .media-wrapper {
          display: block;
          margin: 0 0 0.6em;
          max-width: 100%;
        }
        
        /* Media size classes */
        .size-small { width: 25%; }
        .size-medium { width: 50%; }
        .size-large { width: 75%; }
        .size-full { width: 100%; }
        
        /* Media position classes */
        .position-left { margin-left: 0; margin-right: auto; }
        .position-center { margin-left: auto; margin-right: auto; }
        .position-right { margin-left: auto; margin-right: 0; }
        
        /* Media wrap classes for text wrapping */
        .position-wrap-left {
          float: left;
          margin-right: 1em;
          margin-bottom: 0.6em;
        }
        .position-wrap-right {
          float: right;
          margin-left: 1em;
          margin-bottom: 0.6em;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [visitorSession, setVisitorSession] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '' });
  
  // Reply functionality
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedPosts, setExpandedPosts] = useState({});
  const [postReplies, setPostReplies] = useState({});
  const [loadingReplies, setLoadingReplies] = useState({});
  
  // Admin moderation
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  
  // Share functionality
  const [copiedPostId, setCopiedPostId] = useState(null);
  
  // Admin email list - users with these emails have admin privileges
  const ADMIN_EMAILS = [
    'dmccolly@gmail.com',
    'danmccolly@gmail.com',
    'admin@historyofidahobroadcasting.org',
    'dan@historyofidahobroadcasting.org',
    'contact@historyofidahobroadcasting.org', // Dan's alias
    'art@historyofidahobroadcasting.org',
    'info@historyofidahobroadcasting.org' // Art's alias
  ];
  
  // Check if current visitor is an admin
  const isAdmin = visitorSession && visitorSession.email && ADMIN_EMAILS.includes(visitorSession.email.toLowerCase());

  const sanitizeHTML = (html) => {
    if (!html) return '';
    
    const config = {
      ADD_TAGS: ['iframe', 'audio'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'controls', 'class', 'style', 'id', 'data-size', 'data-position', 'referrerpolicy']
    };
    
    let sanitized = DOMPurify.sanitize(html, config);
    
    const allowedIframeDomains = ['youtube.com', 'youtu.be', 'vimeo.com', 'player.vimeo.com'];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitized;
    
    const iframes = tempDiv.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      const src = iframe.getAttribute('src');
      if (src) {
        const isAllowed = allowedIframeDomains.some(domain => src.includes(domain));
        if (!isAllowed) {
          iframe.remove();
        } else {
          let normalizedSrc = src;
          
          if (src.includes('youtube.com/watch')) {
            const url = new URL(src);
            const videoId = url.searchParams.get('v');
            if (videoId) {
              normalizedSrc = `https://www.youtube.com/embed/${videoId}?controls=1&modestbranding=1&rel=0`;
            }
          } else if (src.includes('youtu.be/')) {
            const videoId = src.split('youtu.be/')[1]?.split('?')[0];
            if (videoId) {
              normalizedSrc = `https://www.youtube.com/embed/${videoId}?controls=1&modestbranding=1&rel=0`;
            }
          }
          
          iframe.setAttribute('src', normalizedSrc);
          
          iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen');
          iframe.setAttribute('allowfullscreen', '');
          iframe.setAttribute('frameborder', '0');
          iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
          
          iframe.style.pointerEvents = 'auto';
        }
      }
    });
    
    return tempDiv.innerHTML;
  };

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
        // Sort posts by created_at descending (newest first)
        const sortedPosts = [...result.posts].sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateB - dateA; // Descending order (newest first)
        });
        
        const filteredPosts = sortedPosts.filter(p => 
          !p.parent_id && (p.post_type === 'post' || !p.post_type)
        );
        
        setPosts(filteredPosts);
        
        // Load preview replies for each post (first 2 replies)
        // Load for all posts to get accurate count even if comments_count is 0
        filteredPosts.forEach(post => {
          loadRepliesPreview(post.id);
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
        // Sort replies by created_at ascending (oldest first)
        const sortedReplies = [...result.replies].sort((a, b) => 
          new Date(a.created_at) - new Date(b.created_at)
        );
        
        // Store only first 2 replies as preview
        setPostReplies(prev => ({
          ...prev,
          [postId]: sortedReplies.slice(0, limit)
        }));
        
        // Update the post's comments_count to reflect actual reply count
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, comments_count: sortedReplies.length }
            : post
        ));
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
        // Sort replies by created_at ascending (oldest first)
        const sortedReplies = [...result.replies].sort((a, b) => 
          new Date(a.created_at) - new Date(b.created_at)
        );
        
        setPostReplies(prev => ({
          ...prev,
          [postId]: sortedReplies
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

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleAuthSubmit = async () => {
    if (!authForm.name.trim() || !authForm.email.trim()) {
      alert('Please enter your name and email');
      return;
    }
    
    const session = {
      name: authForm.name,
      email: authForm.email,
      session_id: generateSessionId(),
      timestamp: new Date().toISOString()
    };
    
    setVisitorSession(session);
    localStorage.setItem('visitor_session', JSON.stringify(session));
    setShowAuthModal(false);
    setAuthForm({ name: '', email: '' });
  };

  const handlePostSubmit = async () => {
    const strippedContent = newPost.replace(/<[^>]*>/g, '').trim();
    const hasMedia = /<img|<iframe|<audio|<video/i.test(newPost);
    
    if (!strippedContent && !hasMedia) {
      alert('Please enter some content');
      return;
    }
    
    if (!visitorSession) {
      setShowAuthModal(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editingPostId) {
        // Update existing post
        const result = await updateNewsfeedPost(editingPostId, { content: newPost });
        console.log('Post update result:', result);
        
        if (result.success) {
          setNewPost('');
          setEditingPostId(null);
          setShowCreateForm(false);
          loadPosts();
          
          if (window.parent !== window) {
            window.parent.postMessage({ 
              type: 'post_updated',
              post: result 
            }, '*');
          }
        } else {
          alert('Failed to update post: ' + (result.error || 'Unknown error'));
        }
      } else {
        // Create new post
        const postData = {
          author_name: visitorSession.name,
          author_email: visitorSession.email,
          author_id: visitorSession.member_id || null,
          content: newPost,
          session_id: visitorSession.session_id || generateSessionId(),
          post_type: 'post'
        };
        
        console.log('Submitting post:', postData);
        
        const result = await createNewsfeedPost(postData);
        
        if (result.success) {
          setNewPost('');
          setShowCreateForm(false);
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
      }
    } catch (error) {
      console.error('Widget: Post submit error', error);
      alert(`Failed to ${editingPostId ? 'update' : 'create'} post: ` + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (postId) => {
    const strippedContent = replyText.replace(/<[^>]*>/g, '').trim();
    const hasMedia = /<img|<iframe|<audio|<video/i.test(replyText);
    
    if (!strippedContent && !hasMedia) {
      alert('Please enter some content');
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
        content: replyText,
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

  const handleDelete = async (postId, isReply = false) => {
    if (!isAdmin) {
      alert('Only administrators can delete posts and replies.');
      return;
    }
    
    // Show confirmation dialog
    const itemType = isReply ? 'reply' : 'post';
    const confirmed = window.confirm(`Are you sure you want to delete this ${itemType}? This action cannot be undone.`);
    
    if (!confirmed) {
      return;
    }
    
    try {
      const result = await deleteNewsfeedPost(postId);
      
      if (result.success) {
        if (isReply) {
          // Remove reply from postReplies state
          setPostReplies(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(parentId => {
              updated[parentId] = updated[parentId].filter(reply => reply.id !== postId);
            });
            return updated;
          });
          
          // Update comments count for parent post
          setPosts(prev => prev.map(post => {
            const replies = postReplies[post.id] || [];
            const wasReplyOfThisPost = replies.some(r => r.id === postId);
            return wasReplyOfThisPost
              ? { ...post, comments_count: Math.max(0, post.comments_count - 1) }
              : post;
          }));
        } else {
          // Remove post from posts state
          setPosts(prev => prev.filter(post => post.id !== postId));
          
          // Remove associated replies
          setPostReplies(prev => {
            const updated = { ...prev };
            delete updated[postId];
            return updated;
          });
        }
        
        alert(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully.`);
      } else {
        alert(`Failed to delete ${itemType}: ` + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(`Failed to delete ${itemType}: ` + error.message);
    }
  };

  const handleArchive = async (postId, isReply = false) => {
    if (!isAdmin) {
      alert('Only administrators can archive posts and replies.');
      return;
    }
    
    // Show confirmation dialog
    const itemType = isReply ? 'reply' : 'post';
    const confirmed = window.confirm(`Are you sure you want to archive this ${itemType}? It will be hidden from the feed but can be restored later.`);
    
    if (!confirmed) {
      return;
    }
    
    try {
      const result = await archiveNewsfeedPost(postId);
      
      if (result.success) {
        if (isReply) {
          // Remove reply from postReplies state
          setPostReplies(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(parentId => {
              updated[parentId] = updated[parentId].filter(reply => reply.id !== postId);
            });
            return updated;
          });
          
          // Update comments count for parent post
          setPosts(prev => prev.map(post => {
            const replies = postReplies[post.id] || [];
            const wasReplyOfThisPost = replies.some(r => r.id === postId);
            return wasReplyOfThisPost
              ? { ...post, comments_count: Math.max(0, post.comments_count - 1) }
              : post;
          }));
        } else {
          // Remove post from posts state
          setPosts(prev => prev.filter(post => post.id !== postId));
          
          // Remove associated replies
          setPostReplies(prev => {
            const updated = { ...prev };
            delete updated[postId];
            return updated;
          });
        }
        
        alert(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} archived successfully.`);
      } else {
        alert(`Failed to archive ${itemType}: ` + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Archive error:', error);
      alert(`Failed to archive ${itemType}: ` + error.message);
    }
  };

  const handleEditPost = (post) => {
    setEditingPostId(post.id);
    setNewPost(post.content);
    setShowCreateForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setNewPost('');
    setShowCreateForm(false);
  };

  const handleShare = async (postId) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      const shareUrl = `${window.location.origin}${window.location.pathname}?post=${postId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${post.author_name}`,
          text: post.content.replace(/<[^>]*>/g, '').substring(0, 100),
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedPostId(postId);
        setTimeout(() => setCopiedPostId(null), 2000);
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const toggleReplies = (postId) => {
    setExpandedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    
    // Load all replies when expanding
    if (!expandedPosts[postId]) {
      loadAllReplies(postId);
    }
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

  const getSamplePosts = () => {
    return [
      {
        id: 1,
        author_name: 'Sample User',
        author_email: 'sample@example.com',
        content: '<p>Welcome to the community newsfeed! This is a sample post to show how the feed works.</p>',
        created_at: new Date().toISOString(),
        likes_count: 0,
        comments_count: 0,
        post_type: 'post'
      }
    ];
  };

  return (
    <div 
      className={`newsfeed-widget ${theme === 'dark' ? 'dark' : ''}`}
      style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        borderRadius: `${borderRadius}px`,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div 
        className="p-4 text-white font-bold text-lg flex items-center justify-between"
        style={{ backgroundColor: headerColor }}
      >
        <span>{headerText}</span>
        {analytics && (
          <div className="flex items-center gap-3 text-sm font-normal">
            <span className="flex items-center gap-1">
              <TrendingUp size={14} />
              {analytics.overview?.total_posts || 0} posts
            </span>
          </div>
        )}
      </div>

      {/* Create Post Form */}
      {showCreateButton && (
        <div className="p-4 bg-white border-b border-gray-200">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} />
              Share an Update
            </button>
          ) : (
            <div className="space-y-3">
              <RichTextEditor
                value={newPost}
                onChange={setNewPost}
                placeholder="What's on your mind? Share text, images, videos, and more..."
              />
              <div className="flex justify-between items-center">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePostSubmit}
                  disabled={!newPost.trim() || isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (editingPostId ? 'Updating...' : 'Posting...') : (
                    <>
                      <Send size={14} />
                      {editingPostId ? 'Update' : 'Post'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Posts List */}
      <div className="divide-y divide-gray-200">
        {posts.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          posts.map((post) => {
            const replies = postReplies[post.id] || [];
            const isExpanded = expandedPosts[post.id];
            const hasMoreReplies = post.comments_count > 2 && !isExpanded;
            
            return (
              <div key={post.id} className="p-4 bg-white hover:bg-gray-50 transition-colors">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {showAvatars && (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {post.author_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">{post.author_name}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{formatDate(post.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Admin Actions Menu */}
                  {isAdmin && (
                    <div className="relative">
                      <button
                        onClick={() => setDeleteConfirm(deleteConfirm === post.id ? null : post.id)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <MoreHorizontal size={18} className="text-gray-600" />
                      </button>
                      
                      {deleteConfirm === post.id && (
                        <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                          <button
                            onClick={() => {
                              handleEditPost(post);
                              setDeleteConfirm(null);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Edit2 size={16} /> Edit Post
                          </button>
                          <button
                            onClick={() => {
                              handleArchive(post.id);
                              setDeleteConfirm(null);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50 transition-colors"
                          >
                            <Archive size={16} /> Archive
                          </button>
                          <button
                            onClick={() => {
                              handleDelete(post.id);
                              setDeleteConfirm(null);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Post Content */}
                <div 
                  className="text-gray-800 mb-3 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(post.content) }}
                />

                {/* Interaction Buttons */}
                {showInteractions && (
                  <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                        post.visitor_liked 
                          ? 'text-red-600 bg-red-50' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Heart size={16} fill={post.visitor_liked ? 'currentColor' : 'none'} />
                      <span className="text-sm">{post.likes_count || 0}</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        const newReplyingTo = replyingTo === post.id ? null : post.id;
                        setReplyingTo(newReplyingTo);
                        // If opening reply form, also expand replies to show context
                        if (newReplyingTo === post.id && !expandedPosts[post.id]) {
                          toggleReplies(post.id);
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <MessageCircle size={16} />
                      <span className="text-sm">{post.comments_count || 0}</span>
                    </button>
                    
                    <button
                      onClick={() => handleShare(post.id)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      {copiedPostId === post.id ? (
                        <>
                          <Check size={16} className="text-green-600" />
                          <span className="text-sm text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 size={16} />
                          <span className="text-sm">Share</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Replies Section */}
                {(isExpanded || replies.length > 0) && (
                  <div className="mt-4 space-y-3">
                    {/* Show More Replies Button */}
                    {hasMoreReplies && (
                      <button
                        onClick={() => toggleReplies(post.id)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <ChevronDown size={16} />
                        View all {post.comments_count} replies
                      </button>
                    )}
                    
                    {/* Replies List */}
                    {replies.map((reply) => (
                      <div key={reply.id} className="ml-12 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                              {reply.author_name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-gray-900">{reply.author_name}</div>
                              <div className="text-xs text-gray-500">{formatDate(reply.created_at)}</div>
                            </div>
                          </div>
                          
                          {/* Admin Actions for Replies */}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(reply.id, true)}
                              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            >
                              <Trash2 size={14} className="text-red-600" />
                            </button>
                          )}
                        </div>
                        
                        <div 
                          className="text-sm text-gray-700 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: sanitizeHTML(reply.content) }}
                        />
                      </div>
                    ))}
                    
                    {/* Show Less Button */}
                    {isExpanded && post.comments_count > 2 && (
                      <button
                        onClick={() => {
                          toggleReplies(post.id);
                          loadRepliesPreview(post.id);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <ChevronUp size={16} />
                        Show less
                      </button>
                    )}
                  </div>
                )}

                {/* Reply Form */}
                {replyingTo === post.id && (
                  <div className="ml-12 space-y-2">
                    <RichTextEditor
                      key={`reply-editor-${post.id}`}
                      value={replyText}
                      onChange={setReplyText}
                      placeholder="Write a reply with text, images, videos, or audio..."
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReplySubmit(post.id)}
                        disabled={!replyText.trim()}
                        className="px-4 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Send size={12} />
                        Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Sign in to continue</h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
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

      {/* Loading State */}
      {isLoading && (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading posts...</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedNewsfeedWidget;
