// Enhanced newsfeed with Facebook-style UI + XANO backend integration

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Heart,
  Share2,
  Send,
  User,
  Mail,
  Clock,
  MoreVertical,
  TrendingUp,
  Search,
  Image,
  Video,
  Smile,
  MapPin,
  X,
  Facebook as FacebookIcon,
  Twitter,
  Linkedin,
  Trash2
} from 'lucide-react';
import {
  getNewsfeedPosts,
  createNewsfeedPost,
  toggleNewsfeedLike,
  getNewsfeedReplies,
  getNewsfeedAnalytics,
  deleteNewsfeedPost
} from '../../services/newsfeedService';
import { createVisitorSession } from '../../services/newsfeedService';
import RichTextEditor from '../shared/RichTextEditor';

/**
 * FacebookStyleNewsFeed is a fully featured community feed component that includes:
 *  - Rich post composer with images, videos, feelings, and location attachments
 *  - Search bar to filter posts via backend search
 *  - Social share menu on each post (Facebook, Twitter, LinkedIn)
 *  - Replies and nested comments
 *  - Visitor registration with session support
 *  - Likes and analytics counts
 *
 * Note: This component requires a Xano backend with endpoints for posts, likes,
 *       replies, and analytics. It also depends on lucide-react icons.
 */
const FacebookStyleNewsFeed = ({ currentUser }) => {
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
  const [activeTab, setActiveTab] = useState('posts');
  const [analytics, setAnalytics] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeShareMenu, setActiveShareMenu] = useState(null);
  const [activePostMenu, setActivePostMenu] = useState(null);
  const editorRef = useRef(null);

  // Load visitor session and posts on mount
  useEffect(() => {
    loadVisitorSession();
    loadPosts();
    loadAnalytics();
  }, []);

  const loadVisitorSession = async () => {
    try {
      if (currentUser) {
        setVisitorSession({
          name: currentUser.name,
          email: currentUser.email,
          is_member: true,
          member_id: currentUser.id
        });
      } else {
        const savedSession = localStorage.getItem('visitor_session');
        if (savedSession) {
          setVisitorSession(JSON.parse(savedSession));
        }
      }
    } catch (error) {
      console.error('Load visitor session error:', error);
    }
  };

  // Save visitor session via backend
  const saveVisitorSession = async (sessionData) => {
    try {
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

  // Load posts from Xano, optionally with search filters
  const loadPosts = async (overrideFilters = {}) => {
    try {
      setIsLoading(true);
      const filters = {
        type: 'posts_only',
        limit: 50,
        visitor_email: visitorSession?.email,
        ...overrideFilters
      };
      const result = await getNewsfeedPosts(filters);
      if (result.success && result.posts) {
        const topLevelPosts = result.posts.filter(p => 
          (p.parent_id == null || p.parent_id === undefined) && 
          p.post_type !== 'reply'
        );
        // Sort posts by created_at descending (newest first)
        const sortedPosts = [...topLevelPosts].sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateB - dateA;
        });
        setPosts(sortedPosts);
      }
    } catch (error) {
      console.error('Load posts error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadPosts();
      return;
    }
    try {
      setIsLoading(true);
      const result = await getNewsfeedPosts({
        type: 'posts_only',
        limit: 50,
        search: searchTerm.trim(),
        visitor_email: visitorSession?.email
      });
      if (result.success && result.posts) {
        const topLevelPosts = result.posts.filter(p => 
          (p.parent_id == null || p.parent_id === undefined) && 
          p.post_type !== 'reply'
        );
        // Sort posts by created_at descending (newest first)
        const sortedPosts = [...topLevelPosts].sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateB - dateA;
        });
        setPosts(sortedPosts);
      }
    } catch (error) {
      console.error('Search posts error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShareMenu = (postId) => {
    setActiveShareMenu((prev) => (prev === postId ? null : postId));
  };

  const togglePostMenu = (postId) => {
    setActivePostMenu((prev) => (prev === postId ? null : postId));
  };

  const handleDeletePost = async (postId) => {
    console.log('handleDeletePost called with postId:', postId, 'type:', typeof postId);
    
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await deleteNewsfeedPost(postId);
      console.log('Delete result:', result);
      
      if (result.success) {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
        setActivePostMenu(null);
        alert('Post deleted successfully');
      } else {
        const errorMsg = result.error ? String(result.error) : 'Unknown error';
        alert(`Failed to delete post: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Delete post error:', error);
      const errorMsg = error.message || String(error) || 'An error occurred';
      alert(`An error occurred while deleting the post: ${errorMsg}`);
    }
  };

  const shareToNetwork = (post, network) => {
    const url = `${window.location.origin}${window.location.pathname}#post-${post.id}`;
    const snippet =
      post.content && post.content.length > 120
        ? `${post.content.slice(0, 117)}...`
        : post.content;
    let shareUrl = '';
    if (network === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    } else if (network === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
        snippet || ''
      )}`;
    } else if (network === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    }
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    setActiveShareMenu(null);
  };

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

  const handleVisitorFormSubmit = async (e) => {
    e.preventDefault();
    if (!visitorData.name.trim() || !visitorData.email.trim()) {
      alert('Please fill in both name and email');
      return;
    }
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

  const handlePostSubmit = async () => {
    if (!newPost.trim()) return;
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
        ip_address: null,
        user_agent: navigator.userAgent,
        parent_id: null,
        post_type: 'post'
      };
      console.log('Submitting post data:', postData);
      const result = await createNewsfeedPost(postData);
      console.log('Post creation result:', result);
      if (result.success) {
        setNewPost('');
        if (editorRef.current) {
          editorRef.current.innerHTML = '';
        }
        loadPosts();
      } else {
        const errorMsg = result.error || result.message || JSON.stringify(result) || 'Unknown error';
        console.error('Post creation failed:', errorMsg);
        alert('Failed to create post: ' + errorMsg);
      }
    } catch (error) {
      console.error('Post submit error:', error);
      alert('Failed to create post: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    if (!visitorSession && !currentUser) {
      setShowVisitorForm(true);
      return;
    }
    try {
      const authorEmail = currentUser?.email || visitorSession.email;
      const result = await toggleNewsfeedLike(postId, authorEmail);
      if (result.success) {
        loadPosts();
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const toggleReplyForm = async (postId) => {
    setShowReplyForm((prev) => ({ ...prev, [postId]: !prev[postId] }));
    if (!replies[postId]) {
      try {
        const result = await getNewsfeedReplies(postId);
        if (result.success) {
          setReplies((prev) => ({ ...prev, [postId]: result.replies }));
        }
      } catch (error) {
        console.error('Load replies error:', error);
      }
    }
  };

  const handleReplySubmit = async (postId) => {
    if (!replyText[postId]?.trim()) return;
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
        content: replyText[postId],
        session_id: visitorSession?.session_id || generateSessionId(),
        ip_address: null,
        user_agent: navigator.userAgent,
        parent_id: postId,
        post_type: 'reply'
      };
      const result = await createNewsfeedPost(replyData);
      if (result.success) {
        setReplyText((prev) => ({ ...prev, [postId]: '' }));
        const repliesResult = await getNewsfeedReplies(postId);
        if (repliesResult.success) {
          setReplies((prev) => ({ ...prev, [postId]: repliesResult.replies }));
        }
        setShowReplyForm((prev) => ({ ...prev, [postId]: true }));
        loadPosts();
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

  // Helper to generate unique session IDs
  const generateSessionId = () => {
    return 'session_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Header with tab buttons */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare size={28} /> Social Feed
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 rounded-full transition-all ${
                activeTab === 'posts' ? 'bg-white text-blue-600 font-semibold' : 'bg-blue-500 hover:bg-blue-400'
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('stories')}
              className={`px-4 py-2 rounded-full transition-all ${
                activeTab === 'stories' ? 'bg-white text-blue-600 font-semibold' : 'bg-blue-500 hover:bg-blue-400'
              }`}
            >
              Stories
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`px-4 py-2 rounded-full transition-all ${
                activeTab === 'live' ? 'bg-white text-blue-600 font-semibold' : 'bg-blue-500 hover:bg-blue-400'
              }`}
            >
              Live
            </button>
          </div>
        </div>
        {visitorSession && (
          <p className="text-blue-100 text-sm">
            Posting as <span className="font-semibold">{visitorSession.name}</span>
          </p>
        )}
      </div>

      {/* Post composer */}
      {!visitorSession && !currentUser ? (
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <User size={48} className="mx-auto mb-4 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Join the Conversation</h3>
          <p className="text-gray-600 mb-4">Sign up to post, comment, and engage with the community</p>
          <button
            onClick={() => setShowVisitorForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-semibold"
          >
            Get Started
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <RichTextEditor
                ref={editorRef}
                value={newPost}
                onChange={setNewPost}
                placeholder="What's on your mind?"
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button 
                onClick={() => editorRef.current?.openImageModal()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <Image size={18} className="text-green-600" /> <span className="text-sm font-medium">Photo</span>
              </button>
              <button 
                onClick={() => editorRef.current?.openVideoModal()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <Video size={18} className="text-red-600" /> <span className="text-sm font-medium">Video</span>
              </button>
            </div>
            <button
              onClick={handlePostSubmit}
              disabled={!newPost.trim() || isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className="bg-white rounded-xl shadow-lg p-4 flex items-center gap-2">
        <Search size={20} className="text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          placeholder="Search posts..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={!searchTerm.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Search
        </button>
      </div>

      {/* Visitor registration modal */}
      {showVisitorForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <User className="text-blue-600" /> Join Community
              </h2>
              <button
                onClick={() => setShowVisitorForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleVisitorFormSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={visitorData.name}
                    onChange={(e) => setVisitorData({ ...visitorData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={visitorData.email}
                    onChange={(e) => setVisitorData({ ...visitorData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="your-email@domain.com"
                    required
                  />
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-blue-800">
                    <strong>Why we need this:</strong> To prevent spam and build a trusted community.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowVisitorForm(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !visitorData.name.trim() || !visitorData.email.trim()}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
                >
                  {isSubmitting ? 'Joining...' : 'Join Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Posts list */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <MessageSquare size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600">Be the first to start a conversation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} id={`post-${post.id}`} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              {/* Post header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="text-white" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{post.author_name}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()} at{' '}
                        {new Date(post.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => togglePostMenu(post.id)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <MoreVertical size={20} className="text-gray-400" />
                    </button>
                    {activePostMenu === post.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} /> Delete Post
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-gray-800 leading-relaxed text-lg">{post.content}</p>
                </div>
                {/* Post stats */}
                <div className="flex items-center justify-between py-3 border-t border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">❤️</div>
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">👍</div>
                      <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs">😮</div>
                    </div>
                    <span className="text-sm text-gray-600">{post.likes_count}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{post.comments_count} comments</span>
                    <span>0 shares</span>
                  </div>
                </div>
                {/* Post actions */}
                <div className="flex items-center justify-around pt-2">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-gray-100 ${
                      post.visitor_liked ? 'text-red-600 font-semibold' : 'text-gray-600'
                    }`}
                  >
                    <Heart size={20} className={post.visitor_liked ? 'fill-current' : ''} />
                    <span>{post.visitor_liked ? 'Liked' : 'Like'}</span>
                  </button>
                  <button
                    onClick={() => toggleReplyForm(post.id)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-all"
                  >
                    <MessageSquare size={20} /> <span>Comment</span>
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => toggleShareMenu(post.id)}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      <Share2 size={20} /> <span>Share</span>
                    </button>
                    {activeShareMenu === post.id && (
                      <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => shareToNetwork(post, 'facebook')}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          <FacebookIcon size={16} className="text-blue-600" /> Facebook
                        </button>
                        <button
                          onClick={() => shareToNetwork(post, 'twitter')}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          <Twitter size={16} className="text-blue-400" /> Twitter
                        </button>
                        <button
                          onClick={() => shareToNetwork(post, 'linkedin')}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          <Linkedin size={16} className="text-blue-700" /> LinkedIn
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Reply section */}
              {showReplyForm[post.id] && (
                <div className="px-6 pb-6 bg-gray-50 border-t border-gray-100">
                  <div className="pt-4">
                    <div className="flex gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="text-white" size={16} />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={replyText[post.id] || ''}
                          onChange={(e) => setReplyText((prev) => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleReplySubmit(post.id);
                            }
                          }}
                          placeholder="Write a comment..."
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-full focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <button
                        onClick={() => handleReplySubmit(post.id)}
                        disabled={!replyText[post.id]?.trim() || isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                    {replies[post.id] && replies[post.id].length > 0 && (
                      <div className="space-y-3 mt-4">
                        {replies[post.id].map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="text-gray-600" size={16} />
                            </div>
                            <div className="flex-1 bg-white rounded-2xl p-3">
                              <h6 className="font-semibold text-sm text-gray-900">{reply.author_name}</h6>
                              <p className="text-gray-800 text-sm mt-1">{reply.content}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <button className="hover:underline">Like</button>
                                <button className="hover:underline">Reply</button>
                                <span>{new Date(reply.created_at).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacebookStyleNewsFeed;
