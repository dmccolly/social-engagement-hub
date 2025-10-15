// src/components/newsfeed/EnhancedNewsFeed.js

import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, Share2, Send, User, Mail, Clock, MoreVertical, TrendingUp, Search } from 'lucide-react';
import { getNewsfeedPosts, createNewsfeedPost, toggleNewsfeedLike, getNewsfeedReplies, getNewsfeedAnalytics, getVisitorPosts } from '../../services/newsfeedService';
import { createVisitorSession } from '../../services/newsfeedService';

const EnhancedNewsFeed = ({ currentUser, onMembershipRequired }) => {
  const [posts, setPosts] = useState([]);
  const [replies, setReplies] = useState({});
  const [newPost, setNewPost] = useState('');
  const [replyText, setReplyText] = useState({});
  const [showReplyForm, setShowReplyForm] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visitorSession, setVisitorSession] = useState(null);
  const [showVisitorForm, setShowVisitorForm] = useState(false);
  const [visitorData, setVisitorData] = useState({ name: '', email: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // recent, popular, trending
  const [analytics, setAnalytics] = useState(null);

  // Load visitor session on mount
  useEffect(() => {
    loadVisitorSession();
    loadPosts();
    loadAnalytics();
  }, []);

  // Load visitor session
  const loadVisitorSession = async () => {
    try {
      // Check for existing session or current user
      if (currentUser) {
        setVisitorSession({
          name: currentUser.name,
          email: currentUser.email,
          is_member: true,
          member_id: currentUser.id
        });
      } else {
        // Check localStorage for visitor session
        const savedSession = localStorage.getItem('visitor_session');
        if (savedSession) {
          setVisitorSession(JSON.parse(savedSession));
        }
      }
    } catch (error) {
      console.error('Load visitor session error:', error);
    }
  };

  // Save visitor session
  const saveVisitorSession = async (sessionData) => {
    try {
      const { createVisitorSession } = await import('../services/newsfeedService');
      const result = await createVisitorSession(sessionData);
      
      if (result.success) {
        localStorage.setItem('visitor_session', JSON.stringify(result.session));
        setVisitorSession(result.session);
      }
      return result;
    } catch (error) {
      console.error('Save visitor session error:', error);
      return { success: false, error: error.message };
    }
  };

  // Load posts from XANO
  const loadPosts = async () => {
    try {
      setIsLoading(true);
      
      const filters = {
        type: 'posts_only',
        limit: 50,
        visitor_email: visitorSession?.email
      };
      
      const result = await getNewsfeedPosts(filters);
      
      if (result.success && result.posts) {
        setPosts(result.posts);
      } else {
        // Fallback to sample data
        const { getSampleNewsfeedData } = await import('../services/newsfeedService');
        const sampleData = getSampleNewsfeedData();
        setPosts(sampleData.posts);
      }
    } catch (error) {
      console.error('Load posts error:', error);
      // Fallback to sample data
      const { getSampleNewsfeedData } = await import('../services/newsfeedService');
      const sampleData = getSampleNewsfeedData();
      setPosts(sampleData.posts);
    } finally {
      setIsLoading(false);
    }
  };

  // Load analytics
  const loadAnalytics = async () => {
    try {
      const result = await getNewsfeedAnalytics('7d');
      if (result.success) {
        setAnalytics(result.analytics);
      }
    } catch (error) {
      console.error('Load analytics error:', error);
    }
  };

  // Handle visitor form submission
  const handleVisitorFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!visitorData.name.trim() || !visitorData.email.trim()) {
      alert('Please fill in both name and email');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(visitorData.email)) {
      alert('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const sessionData = {
        session_id: generateSessionId(),
        email: visitorData.email,
        name: visitorData.name,
        is_member: false,
        member_id: null
      };
      
      const result = await saveVisitorSession(sessionData);
      
      if (result.success) {
        setShowVisitorForm(false);
        setVisitorData({ name: '', email: '' });
        alert('Welcome! You can now post and interact with the community.');
      } else {
        alert('Failed to create visitor session: ' + result.error);
      }
    } catch (error) {
      console.error('Visitor form submit error:', error);
      alert('Failed to create visitor session: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle new post submission
  const handlePostSubmit = async () => {
    if (!newPost.trim()) return;
    
    // Check if visitor needs to register
    if (!visitorSession && !currentUser) {
      setShowVisitorForm(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const postData = {
        author_name: currentUser?.name || visitorSession.name,
        author_email: currentUser?.email || visitorSession.email,
        author_id: currentUser?.id || visitorSession.member_id || null,
        content: newPost,
        session_id: visitorSession?.session_id || generateSessionId(),
        ip_address: null, // Would be set by XANO backend
        user_agent: navigator.userAgent,
        parent_id: null,
        post_type: 'post'
      };
      
      const result = await createNewsfeedPost(postData);
      
      if (result.success) {
        setNewPost('');
        loadPosts(); // Reload to show new post
        alert('Post created successfully!');
      } else {
        alert('Failed to create post: ' + result.error);
      }
    } catch (error) {
      console.error('Post submit error:', error);
      alert('Failed to create post: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reply submission
  const handleReplySubmit = async (postId) => {
    const replyContent = replyText[postId];
    if (!replyContent || !replyContent.trim()) return;
    
    // Check if visitor needs to register
    if (!visitorSession && !currentUser) {
      setShowVisitorForm(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const replyData = {
        author_name: currentUser?.name || visitorSession.name,
        author_email: currentUser?.email || visitorSession.email,
        author_id: currentUser?.id || visitorSession.member_id || null,
        content: replyContent,
        session_id: visitorSession?.session_id || generateSessionId(),
        ip_address: null,
        user_agent: navigator.userAgent,
        parent_id: postId,
        post_type: 'reply'
      };
      
      const result = await createNewsfeedPost(replyData);
      
      if (result.success) {
        // Clear reply text and hide form
        setReplyText(prev => ({ ...prev, [postId]: '' }));
        setShowReplyForm(prev => ({ ...prev, [postId]: false }));
        
        // Reload replies for this post
        await loadReplies(postId);
        alert('Reply posted successfully!');
      } else {
        alert('Failed to post reply: ' + result.error);
      }
    } catch (error) {
      console.error('Reply submit error:', error);
      alert('Failed to post reply: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle like toggle
  const handleLike = async (postId) => {
    if (!visitorSession && !currentUser) {
      setShowVisitorForm(true);
      return;
    }
    
    try {
      const visitorData = {
        author_email: currentUser?.email || visitorSession.email,
        author_id: currentUser?.id || visitorSession.member_id || null,
        ip_address: null,
        user_agent: navigator.userAgent
      };
      
      const result = await toggleNewsfeedLike(postId, visitorData);
      
      if (result.success) {
        // Update local state
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: result.likes_count, visitor_liked: result.liked }
            : post
        ));
      } else {
        alert('Failed to like post: ' + result.error);
      }
    } catch (error) {
      console.error('Like error:', error);
      alert('Failed to like post: ' + error.message);
    }
  };

  // Load replies for a post
  const loadReplies = async (postId) => {
    try {
      const result = await getNewsfeedReplies(postId);
      if (result.success) {
        setReplies(prev => ({ ...prev, [postId]: result.replies }));
      }
    } catch (error) {
      console.error('Load replies error:', error);
    }
  };

  // Toggle reply form visibility
  const toggleReplyForm = (postId) => {
    setShowReplyForm(prev => ({ ...prev, [postId]: !prev[postId] }));
    if (!showReplyForm[postId]) {
      // Load replies when opening form
      loadReplies(postId);
    }
  };

  // Handle search
  const handleSearch = async (query) => {
    if (!query.trim()) {
      loadPosts();
      return;
    }
    
    try {
      const result = await searchNewsfeedPosts(query);
      if (result.success) {
        setPosts(result.posts);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Generate session ID
  const generateSessionId = () => {
    return 'session_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <MessageSquare className="text-blue-600" />
              Community News Feed
            </h1>
            <div className="flex items-center gap-2 text-gray-500">
              <Clock size={20} className="animate-spin" />
              Loading feed...
            </div>
          </div>
          <div className="text-center py-8">
            <div className="text-gray-500">Loading community discussions...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Analytics */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MessageSquare className="text-blue-600" />
            Community News Feed
          </h1>
          {analytics && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <TrendingUp size={16} className="text-green-600" />
                {analytics.overview.engagement_rate}% engagement
              </span>
              <span>{analytics.overview.total_posts} posts</span>
              <span>{analytics.overview.total_replies} replies</span>
            </div>
          )}
        </div>
        
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              placeholder="Search posts and discussions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Post Creation - Visitor Registration Required */}
      {(!visitorSession && !currentUser) ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <MessageSquare size={48} className="mx-auto mb-4 text-blue-300" />
            <h3 className="text-xl font-semibold mb-2">Join the Conversation!</h3>
            <p className="text-gray-600 mb-4">
              Share your thoughts, ask questions, and connect with our community. 
              Quick registration required to prevent spam.
            </p>
            <button
              onClick={() => setShowVisitorForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
            >
              <User size={20} />
              Quick Sign-up to Post
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Only name and email required • No password needed
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <MessageSquare size={20} />
            Share an update
            {visitorSession && !currentUser && (
              <span className="text-sm text-gray-500 ml-auto">
                Posting as {visitorSession.name}
              </span>
            )}
          </h3>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind? Share news, ask questions, or start a discussion..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-gray-500">
              {newPost.length}/500 characters
            </span>
            <button
              onClick={handlePostSubmit}
              disabled={!newPost.trim() || isSubmitting || newPost.length > 500}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Posting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Post Update
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Visitor Registration Form Modal */}
      {showVisitorForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User className="text-blue-600" />
                Quick Community Sign-up
              </h2>
              <button
                onClick={() => setShowVisitorForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleVisitorFormSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={visitorData.name}
                    onChange={(e) => setVisitorData({...visitorData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={visitorData.email}
                    onChange={(e) => setVisitorData({...visitorData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your-email@domain.com"
                    required
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Why we need this:</strong> To prevent spam and build a trusted community. 
                    We'll never share your email and you can unsubscribe at any time.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <button
                  type="button"
                  onClick={() => setShowVisitorForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !visitorData.name.trim() || !visitorData.email.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing Up...
                    </>
                  ) : (
                    <>
                      <User size={16} />
                      Join Community
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-4">
              Be the first to start a conversation! Share your thoughts, ask questions, or introduce yourself.
            </p>
            {visitorSession && (
              <button
                onClick={() => setNewPost("Hello everyone! I'm new here and excited to be part of this community. 👋")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Start the Conversation
              </button>
            )}
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              {/* Post Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{post.author_name}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-gray-800 leading-relaxed">{post.content}</p>
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                        post.visitor_liked 
                          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Heart size={16} className={post.visitor_liked ? 'fill-current' : ''} />
                      <span>{post.likes_count}</span>
                    </button>
                    
                    <button
                      onClick={() => toggleReplyForm(post.id)}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                    >
                      <MessageSquare size={16} />
                      <span>{post.comments_count} replies</span>
                    </button>
                    
                    <button className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                      <Share2 size={16} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Reply Form */}
              {showReplyForm[post.id] && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-3">Reply to {post.author_name}</h5>
                    <textarea
                      value={replyText[post.id] || ''}
                      onChange={(e) => setReplyText(prev => ({ ...prev, [post.id]: e.target.value }))}
                      placeholder="Write your reply..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm text-gray-500">
                        {replyText[post.id]?.length || 0}/300 characters
                      </span>
                      <button
                        onClick={() => handleReplySubmit(post.id)}
                        disabled={!replyText[post.id]?.trim() || isSubmitting || replyText[post.id]?.length > 300}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Send size={16} />
                        )}
                        Post Reply
                      </button>
                    </div>
                  </div>

                  {/* Replies List */}
                  {replies[post.id] && replies[post.id].length > 0 && (
                    <div className="mt-4 space-y-3">
                      {replies[post.id].map(reply => (
                        <div key={reply.id} className="bg-white border border-gray-200 rounded-lg p-4 ml-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="text-gray-600" size={16} />
                            </div>
                            <div>
                              <h6 className="font-medium text-gray-900 text-sm">{reply.author_name}</h6>
                              <p className="text-xs text-gray-500">
                                {new Date(reply.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <p className="text-gray-800 text-sm">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Analytics Footer */}
      {analytics && (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-600" />
            Community Activity This Week
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics.overview.total_posts}</div>
              <div className="text-sm text-gray-600">New Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analytics.overview.total_replies}</div>
              <div className="text-sm text-gray-600">Replies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{analytics.overview.total_likes}</div>
              <div className="text-sm text-gray-600">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{analytics.overview.engagement_rate}%</div>
              <div className="text-sm text-gray-600">Engagement Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to generate session ID
const generateSessionId = () => {
  return 'session_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

export default EnhancedNewsFeed;