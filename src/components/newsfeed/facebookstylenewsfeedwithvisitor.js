import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Heart,
  Send,
  User,
  Clock,
  AlertCircle
} from 'lucide-react';
import useVisitorAuth from '../../hooks/useVisitorAuth';
import VisitorAuthModal from '../VisitorAuthModal';
import {
  getVisitorPosts,
  createVisitorPost,
  likeVisitorPost,
  replyToVisitorPost
} from '../services/xanoService';

/**
 * FacebookStyleNewsFeedWithVisitor
 * Enhanced news feed with visitor authentication
 * - Prompts visitors for name/email on first interaction
 * - Remembers visitors via token
 * - Posts go through approval workflow
 * - Integrates with existing UI
 */
const FacebookStyleNewsFeedWithVisitor = ({ currentUser }) => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [replyContent, setReplyContent] = useState({});
  const [showReplyForm, setShowReplyForm] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const {
    visitorToken,
    visitorProfile,
    isAuthenticated,
    showAuthPrompt,
    setShowAuthPrompt,
    authenticate,
    requireAuth
  } = useVisitorAuth();

  // Load posts on mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const result = await getVisitorPosts();
      setPosts(result || []);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    try {
      // Require authentication before posting
      if (!isAuthenticated) {
        setPendingAction({ type: 'create_post', content: newPostContent });
        setShowAuthPrompt(true);
        return;
      }

      setIsSubmitting(true);

      const result = await createVisitorPost(visitorToken, newPostContent);
      
      if (result) {
        setNewPostContent('');
        // Show success message
        alert('Your post has been submitted and is awaiting approval!');
        loadPosts();
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      // Require authentication before liking
      if (!isAuthenticated) {
        setPendingAction({ type: 'like_post', postId });
        setShowAuthPrompt(true);
        return;
      }

      await likeVisitorPost(visitorToken, postId);
      loadPosts(); // Refresh to show updated like count
    } catch (error) {
      console.error('Failed to like post:', error);
      alert('Failed to like post: ' + error.message);
    }
  };

  const handleReplyToPost = async (postId) => {
    const content = replyContent[postId];
    if (!content || !content.trim()) return;

    try {
      // Require authentication before replying
      if (!isAuthenticated) {
        setPendingAction({ type: 'reply_post', postId, content });
        setShowAuthPrompt(true);
        return;
      }

      await replyToVisitorPost(visitorToken, postId, content);
      
      setReplyContent({ ...replyContent, [postId]: '' });
      setShowReplyForm({ ...showReplyForm, [postId]: false });
      alert('Your reply has been submitted and is awaiting approval!');
      loadPosts();
    } catch (error) {
      console.error('Failed to reply to post:', error);
      alert('Failed to reply: ' + error.message);
    }
  };

  const handleAuthentication = async (firstName, lastName, email) => {
    const result = await authenticate(firstName, lastName, email);
    
    if (result.success && pendingAction) {
      // Execute pending action after authentication
      switch (pendingAction.type) {
        case 'create_post':
          setNewPostContent(pendingAction.content);
          setTimeout(() => handleCreatePost(), 100);
          break;
        case 'like_post':
          setTimeout(() => handleLikePost(pendingAction.postId), 100);
          break;
        case 'reply_post':
          setReplyContent({ ...replyContent, [pendingAction.postId]: pendingAction.content });
          setTimeout(() => handleReplyToPost(pendingAction.postId), 100);
          break;
      }
      setPendingAction(null);
    }
    
    return result;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Visitor Auth Modal */}
      <VisitorAuthModal
        isOpen={showAuthPrompt}
        onClose={() => {
          setShowAuthPrompt(false);
          setPendingAction(null);
        }}
        onAuthenticate={handleAuthentication}
      />

      {/* Welcome Message for Authenticated Visitors */}
      {isAuthenticated && visitorProfile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <User className="text-blue-600 mr-2" size={20} />
            <p className="text-blue-800">
              Welcome back, <strong>{visitorProfile.first_name}</strong>!
            </p>
          </div>
        </div>
      )}

      {/* Post Composer */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {isAuthenticated && visitorProfile 
              ? visitorProfile.first_name[0].toUpperCase()
              : <User size={20} />
            }
          </div>
          <div className="flex-1">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex justify-between items-center mt-3">
              <div className="text-sm text-gray-500">
                {!isAuthenticated && (
                  <span className="flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    You'll be asked to sign in before posting
                  </span>
                )}
              </div>
              <button
                onClick={handleCreatePost}
                disabled={isSubmitting || !newPostContent.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts yet</h3>
          <p className="text-gray-600">Be the first to start a conversation!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
              {/* Post Header */}
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                  {post.visitor?.first_name?.[0]?.toUpperCase() || 'V'}
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-800">
                    {post.visitor?.first_name} {post.visitor?.last_name}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Clock size={14} className="mr-1" />
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>

              {/* Post Actions */}
              <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleLikePost(post.id)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Heart size={20} />
                  <span>{post.like_count || 0}</span>
                </button>
                <button
                  onClick={() => setShowReplyForm({ ...showReplyForm, [post.id]: !showReplyForm[post.id] })}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <MessageSquare size={20} />
                  <span>{post.reply_count || 0} Replies</span>
                </button>
              </div>

              {/* Reply Form */}
              {showReplyForm[post.id] && (
                <div className="mt-4 pl-12">
                  <textarea
                    value={replyContent[post.id] || ''}
                    onChange={(e) => setReplyContent({ ...replyContent, [post.id]: e.target.value })}
                    placeholder="Write a reply..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                  <div className="flex justify-end mt-2 space-x-2">
                    <button
                      onClick={() => setShowReplyForm({ ...showReplyForm, [post.id]: false })}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReplyToPost(post.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Send size={16} className="inline mr-1" />
                      Reply
                    </button>
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

export default FacebookStyleNewsFeedWithVisitor;
