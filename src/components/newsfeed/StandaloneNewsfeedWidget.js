// src/components/newsfeed/StandaloneNewsfeedWidget.js

import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, User, Clock, TrendingUp, ExternalLink } from 'lucide-react';
import { getNewsfeedPosts, createNewsfeedPost, toggleNewsfeedLike, getNewsfeedAnalytics } from '../../services/newsfeedService';

const StandaloneNewsfeedWidget = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const headerColor = urlParams.get('headerColor') || '#10b981';
  const headerText = urlParams.get('headerText') || '💬 Community Feed';
  const maxPosts = parseInt(urlParams.get('maxPosts')) || 5;
  const showAvatars = urlParams.get('showAvatars') !== 'false';
  const showInteractions = urlParams.get('showInteractions') !== 'false';
  const showCreateButton = urlParams.get('showCreateButton') !== 'false';
  const borderRadius = urlParams.get('borderRadius') || '8';
  const debug = urlParams.get('debug') === 'true';
  const theme = urlParams.get('theme') || 'light'; // light, dark

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [visitorSession, setVisitorSession] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load visitor session from parent window
  useEffect(() => {
    // Listen for visitor session from parent window
    const handleMessage = (event) => {
      if (event.data.type === 'visitor_session') {
        setVisitorSession(event.data.session);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Request visitor session from parent
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
      } else {
        // Fallback to sample data
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

  const handlePostSubmit = async () => {
    if (!newPost.trim()) return;
    
    // Check if visitor is authenticated
    if (!visitorSession) {
      // Request authentication from parent window
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'request_authentication' }, '*');
      }
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const postData = {
        author_name: visitorSession.name,
        author_email: visitorSession.email,
        author_id: visitorSession.member_id || null,
        content: newPost,
        session_id: visitorSession.session_id || generateSessionId(),
        post_type: 'post'
      };
      
      const result = await createNewsfeedPost(postData);
      
      if (result.success) {
        setNewPost('');
        setShowCreateForm(false);
        loadPosts(); // Reload to show new post
        
        // Notify parent window
        if (window.parent !== window) {
          window.parent.postMessage({ 
            type: 'post_created',
            post: result.post 
          }, '*');
        }
      } else {
        alert('Failed to create post: ' + result.error);
      }
    } catch (error) {
      console.error('Widget: Post submit error', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    if (!visitorSession) {
      // Request authentication from parent window
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'request_authentication' }, '*');
      }
      return;
    }
    
    try {
      const authorEmail = visitorSession.email;
      const result = await toggleNewsfeedLike(postId, authorEmail);
      
      if (result.success) {
        // Update local state
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

  const handleViewFullFeed = () => {
    // Navigate to full newsfeed
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'navigate_to_feed' }, '*');
    } else {
      window.location.href = '/newsfeed';
    }
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

      {/* Post Creation (if enabled) */}
      {showCreateButton && visitorSession && (
        <div className="p-4 border-b bg-gray-50">
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
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's happening in your world?"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {newPost.length}/280 characters
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePostSubmit}
                    disabled={!newPost.trim() || isSubmitting || newPost.length > 280}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
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
            {visitorSession && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create First Post
              </button>
            )}
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                {showAvatars ? (
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="text-blue-600" size={20} />
                  </div>
                ) : null}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{post.author_name}</h4>
                    <span className="text-xs text-gray-500">
                      <Clock size={12} className="inline mr-1" />
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-800 text-sm leading-relaxed">{post.content}</p>
                </div>
              </div>

              {/* Post Actions */}
              {showInteractions && (
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        post.visitor_liked 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Heart size={12} className={post.visitor_liked ? 'fill-current' : ''} />
                      <span>{post.likes_count}</span>
                    </button>
                    
                    <span className="text-xs text-gray-500">
                      {post.comments_count} replies
                    </span>
                  </div>
                  
                  <button
                    onClick={handleViewFullFeed}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    View Full Discussion
                    <ExternalLink size={12} />
                  </button>
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

export default StandaloneNewsfeedWidget;
