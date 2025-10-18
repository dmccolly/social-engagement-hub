// Enhanced NewsFeed Integration - Built on your existing foundation
// Integrates visitor registration, XANO backend, and auto-approval moderation

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Heart, Share2, Send, User, Mail, Clock, 
  MoreVertical, TrendingUp, Search, Shield, AlertCircle 
} from 'lucide-react';
import { 
  getNewsfeedPosts, 
  createNewsfeedPost, 
  toggleVisitorLike, 
  getNewsfeedReplies,
  createVisitorSession,
  getVisitorPosts 
} from '../../services/newsfeedService';
import { getEnhancedVisitorData } from '../../services/newsfeed/visitorRetentionService';
import EnhancedVisitorRegistrationForm from './EnhancedVisitorRegistrationForm';

const EnhancedNewsFeedIntegration = ({ currentUser, onMembershipRequired, visitorSession: initialSession, posts: initialPosts, onPostsUpdate }) => {
  const [posts, setPosts] = useState(initialPosts || []);
  const [replies, setReplies] = useState({});
  const [newPost, setNewPost] = useState('');
  const [replyText, setReplyText] = useState({});
  const [showReplyForm, setShowReplyForm] = useState({});
  const [isLoading, setIsLoading] = useState(!initialPosts);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visitorSession, setVisitorSession] = useState(initialSession || null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [visitorActivity, setVisitorActivity] = useState(null);
  const [draftPost, setDraftPost] = useState('');

  // Auto-save draft functionality
  useEffect(() => {
    const saveDraft = setInterval(() => {
      if (draftPost && visitorSession) {
        localStorage.setItem(`draft_post_${visitorSession.id}`, draftPost);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(saveDraft);
  }, [draftPost, visitorSession]);

  // Load visitor session on component mount
  useEffect(() => {
    initializeVisitorSession();
  }, []);

  // Load posts and visitor activity
  useEffect(() => {
    if (visitorSession) {
      loadPosts();
      loadVisitorActivity();
      loadDraftPost();
    }
  }, [visitorSession]);

  const initializeVisitorSession = async () => {
    try {
      // Check for existing session
      const savedSession = localStorage.getItem('visitor_session');
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        setVisitorSession(sessionData);
        
        // Update session activity
        await updateVisitorActivity(sessionData.id);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error initializing visitor session:', error);
      setIsLoading(false);
    }
  };

  const createNewVisitorSession = async (visitorData) => {
    try {
      // Use the new registerVisitor function for Email Marketing API
      const registrationData = {
        email: visitorData.email,
        first_name: visitorData.first_name || visitorData.name?.split(" ")[0] || "",
        last_name: visitorData.last_name || visitorData.name?.split(" ").slice(1).join(" ") || "",
        name: visitorData.name || `${visitorData.first_name || ""} ${visitorData.last_name || ""}`.trim(),
        source: "newsfeed",
        ip_address: visitorData.ip_address || null,
        user_agent: visitorData.user_agent || null,
        referrer: document.referrer || null,
        landing_page: window.location.href
      };

      const result = await createVisitorSession(sessionData);
      
      if (result.success) {
        const session = result.visitor_session || result;
        setVisitorSession(session);
        localStorage.setItem('visitor_session', JSON.stringify(session));
        
        // Track visitor analytics
        trackVisitorEvent(session.id, 'registration', {
          source: 'newsfeed',
          method: 'email_only'
        });
        
        return session;
      }
    } catch (error) {
      console.error('Error creating visitor session:', error);
      return null;
    }
  };

  const updateVisitorActivity = async (sessionId) => {
    try {
      const result = await getEnhancedVisitorData(sessionId);
      if (result.success) {
        setVisitorActivity(result.data);
      }
    } catch (error) {
      console.error('Error loading visitor activity:', error);
    }
  };

  const loadVisitorActivity = async () => {
    if (visitorSession?.id) {
      await updateVisitorActivity(visitorSession.id);
    }
  };

  const loadDraftPost = () => {
    if (visitorSession?.id) {
      const savedDraft = localStorage.getItem(`draft_post_${visitorSession.id}`);
      if (savedDraft) {
        setDraftPost(savedDraft);
        setNewPost(savedDraft);
      }
    }
  };

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      
      // Get posts from XANO backend
      const result = await getNewsfeedPosts({
        limit: 20,
        visitor_email: visitorSession?.email
      });

      if (result.success) {
        const loadedPosts = result.posts || [];
        setPosts(loadedPosts);
        if (onPostsUpdate) {
          onPostsUpdate(loadedPosts);
        }
        
        // Load replies for posts
        const replyPromises = result.posts.map(post => 
          getNewsfeedReplies(post.id).then(replies => ({
            postId: post.id,
            replies: replies.success ? replies.replies : []
          }))
        );
        
        const repliesData = await Promise.all(replyPromises);
        const repliesMap = {};
        repliesData.forEach(({ postId, replies }) => {
          repliesMap[postId] = replies;
        });
        setReplies(repliesMap);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      // Fallback to local state if API fails
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostSubmit = async () => {
    if (!newPost.trim()) return;
    
    // Check if visitor has session
    if (!visitorSession) {
      setShowRegistrationModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Basic content validation
      if (newPost.length < 5) {
        alert('Post must be at least 5 characters long');
        return;
      }

      if (newPost.length > 2000) {
        alert('Post must be less than 2000 characters');
        return;
      }

      // Create post data
      const postData = {
        content: newPost,
        visitor_email: visitorSession.email,
        name: visitorSession.name,
        session_id: visitorSession.id,
        type: 'visitor_post',
        ip_address: visitorSession.ip_address,
        user_agent: navigator.userAgent
      };

      // Submit to XANO backend (auto-approved by default)
      const result = await createNewsfeedPost(postData);

      if (result.success) {
        // Add new post to feed
        const updatedPosts = [result.post, ...prev];
        setPosts(updatedPosts);
        if (onPostsUpdate) {
          onPostsUpdate(updatedPosts);
        }
        
        // Clear form and draft
        setNewPost('');
        setDraftPost('');
        localStorage.removeItem(`draft_post_${visitorSession.id}`);
        
        // Track visitor activity
        trackVisitorEvent(visitorSession.id, 'post_created', {
          post_id: result.post.id,
          content_length: newPost.length
        });
        
        // Show success message
        showNotification('Post published successfully!', 'success');
      } else {
        // Handle moderation flags
        if (result.status === 'pending') {
          showNotification('Your post is under review and will appear shortly.', 'info');
        } else {
          showNotification('Failed to publish post. Please try again.', 'error');
        }
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      showNotification('An error occurred. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    if (!visitorSession) {
      setShowRegistrationModal(true);
      return;
    }

    try {
      const result = await toggleVisitorLike(postId, {
        visitor_email: visitorSession.email,
        session_id: visitorSession.id,
        session_id: visitorSession.id
      });

      if (result.success) {
        // Update local post data
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes: result.likes_count || (post.likes + 1) }
            : post
        ));

        // Track like activity
        trackVisitorEvent(visitorSession.id, 'post_liked', {
          post_id: postId
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleReplySubmit = async (postId) => {
    const replyContent = replyText[postId];
    if (!replyContent?.trim()) return;

    if (!visitorSession) {
      setShowRegistrationModal(true);
      return;
    }

    try {
      // Submit reply through your existing reply system
      const result = await submitReplyToPost(postId, {
        content: replyContent,
        visitor_email: visitorSession.email,
        name: visitorSession.name,
        session_id: visitorSession.id
      });

      if (result.success) {
        // Update local replies
        setReplies(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), result.reply]
        }));

        // Clear reply form
        setReplyText(prev => ({ ...prev, [postId]: '' }));
        setShowReplyForm(prev => ({ ...prev, [postId]: false }));

        // Track reply activity
        trackVisitorEvent(visitorSession.id, 'reply_created', {
          post_id: postId,
          reply_id: result.reply.id
        });
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  const trackVisitorEvent = (sessionId, event, metadata = {}) => {
    // Track visitor events for analytics
    if (window.gtag) {
      window.gtag('event', event, {
        session_id: sessionId,
        ...metadata
      });
    }
  };

  const showNotification = (message, type = 'info') => {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  };

  const renderWelcomeBackMessage = () => {
    if (!visitorActivity || !visitorSession) return null;

    const lastVisit = visitorActivity.lastActivity;
    const daysSinceLastVisit = lastVisit ? 
      Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24)) : 0;

    if (daysSinceLastVisit > 1) {
      // Use first name for more personal welcome, fallback to full name
      const displayName = visitorSession.first_name || visitorSession.name?.split(' ')[0] || visitorSession.name || 'Visitor';
      
      return (
        <div className="welcome-back-banner bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <Heart className="text-blue-500" size={20} />
            <span className="font-medium text-blue-800">
              Welcome back, {visitorSession.first_name || visitorSession.name?.split(' ')[0] || visitorSession.name}!
            </span>
          </div>
          {visitorActivity.postsCount > 0 && (
            <p className="text-sm text-blue-600 mt-1">
              You've created {visitorActivity.postsCount} posts and received {visitorActivity.totalLikes} likes.
            </p>
          )}
          {visitorActivity.unreadNotifications > 0 && (
            <p className="text-sm text-blue-600 mt-1">
              You have {visitorActivity.unreadNotifications} new notifications.
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderRegistrationPrompt = () => {
    if (visitorSession) return null;

    return (
      <div className="registration-prompt bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">
              Join the Conversation!
            </h3>
            <p className="text-blue-700 text-sm">
              Register with your email to post updates, engage with the community, and receive notifications.
            </p>
          </div>
          <button
            onClick={() => setShowRegistrationModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Register Now
          </button>
        </div>
      </div>
    );
  };

  // Handle form changes for draft saving
  const handleContentChange = (e) => {
    const content = e.target.value;
    setNewPost(content);
    setDraftPost(content);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading community feed...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome back message for returning visitors */}
      {renderWelcomeBackMessage()}

      {/* Registration prompt for new visitors */}
      {renderRegistrationPrompt()}

      {/* Post Creation Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="text-blue-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">
            Community News Feed
          </h1>
          {visitorSession && (
            <span className="ml-auto text-sm text-gray-500">
              Posting as {visitorSession.name}
            </span>
          )}
        </div>

        <div className="space-y-4">
          <textarea
            value={newPost}
            onChange={handleContentChange}
            placeholder={
              visitorSession 
                ? "What's on your mind? Share updates, ask questions, or start a discussion..."
                : "Register to join the conversation and share your thoughts..."
            }
            className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            rows="4"
            disabled={!visitorSession}
          />
          
          {draftPost && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield size={14} />
              <span>Draft auto-saved</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {newPost.length}/2000 characters
            </div>
            <button
              onClick={handlePostSubmit}
              disabled={!newPost.trim() || isSubmitting || !visitorSession}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-600">
              {visitorSession 
                ? "Be the first to share something with the community!"
                : "Register to start the conversation."
              }
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
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
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical size={16} />
                </button>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <div 
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: post.content }} 
                />
              </div>

              {/* Post Actions */}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-2 hover:text-red-500 transition"
                >
                  <Heart size={16} />
                  <span>{post.likes_count || post.likes || 0} likes</span>
                </button>

                <button
                  onClick={() => setShowReplyForm(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
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

              {/* Reply Form */}
              {showReplyForm[post.id] && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex gap-3">
                    <textarea
                      value={replyText[post.id] || ''}
                      onChange={(e) => setReplyText(prev => ({ ...prev, [post.id]: e.target.value }))}
                      placeholder="Write a comment..."
                      className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="2"
                    />
                    <button
                      onClick={() => handleReplySubmit(post.id)}
                      disabled={!replyText[post.id]?.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}

              {/* Comments/Replies */}
              {replies[post.id] && replies[post.id].length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="space-y-3">
                    {replies[post.id].map((reply, index) => (
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
                          <p className="text-sm text-gray-700">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <EnhancedVisitorRegistrationForm
              onSuccess={async (sessionData) => {
                const session = await createNewVisitorSession(sessionData);
                if (session) {
                  setVisitorSession(session);
                  setShowRegistrationModal(false);
                  
                  // If user was trying to post, let them continue
                  if (newPost.trim()) {
                    showNotification('Registration complete! You can now post your update.', 'success');
                  }
                }
              }}
              onClose={() => setShowRegistrationModal(false)}
              prefillData={{
                content: newPost, // Save their draft content
                source: 'newsfeed_post'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedNewsFeedIntegration;