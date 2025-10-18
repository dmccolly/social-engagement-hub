// Visitor Retention Enhancements for EnhancedNewsFeed

import { useEffect, useState } from 'react';
import { Bell, Bookmark, History, MessageCircle, TrendingUp } from 'lucide-react';

// Enhanced visitor session management
export const useEnhancedVisitorSession = (currentUser, visitorSession) => {
  const [enhancedSession, setEnhancedSession] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [draftPosts, setDraftPosts] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      // Member session - enhanced features
      loadMemberSession();
    } else if (visitorSession) {
      // Visitor session - enhanced retention
      loadEnhancedVisitorSession();
    } else {
      // Check for existing visitor data
      checkExistingVisitor();
    }
  }, [currentUser, visitorSession]);

  const loadMemberSession = async () => {
    // Enhanced member session with activity tracking
    try {
      const memberActivity = await getMemberActivity(currentUser.id);
      setRecentActivity(memberActivity);
      
      // Load member preferences
      const preferences = await getMemberPreferences(currentUser.id);
      setEnhancedSession({
        ...currentUser,
        type: 'member',
        preferences: preferences,
        lastActivity: memberActivity.lastSeen
      });
    } catch (error) {
      console.error('Enhanced member session error:', error);
    }
  };

  const loadEnhancedVisitorSession = async () => {
    try {
      // Get enhanced visitor data
      const enhancedData = await getEnhancedVisitorData(visitorSession.session_id);
      
      setEnhancedSession({
        ...visitorSession,
        type: 'visitor',
        ...enhancedData
      });

      // Load recent activity
      loadVisitorRecentActivity();
      
      // Load draft posts
      loadDraftPosts();
      
      // Check for unread notifications
      checkUnreadNotifications();
      
    } catch (error) {
      console.error('Enhanced visitor session error:', error);
    }
  };

  const checkExistingVisitor = () => {
    // Check for existing visitor without requiring login
    try {
      const savedSession = localStorage.getItem('visitor_session');
      const savedDrafts = localStorage.getItem('visitor_drafts');
      const savedActivity = localStorage.getItem('visitor_activity');
      
      if (savedSession) {
        const session = JSON.parse(savedSession);
        setEnhancedSession({
          ...session,
          type: 'returning_visitor'
        });
      }
      
      if (savedDrafts) {
        setDraftPosts(JSON.parse(savedDrafts));
      }
      
      if (savedActivity) {
        setRecentActivity(JSON.parse(savedActivity));
      }
      
    } catch (error) {
      console.error('Check existing visitor error:', error);
    }
  };

  const loadVisitorRecentActivity = async () => {
    try {
      const { getVisitorPosts } = await import('../../services/newsfeedService');
      const result = await getVisitorPosts(visitorSession.email);
      
      if (result.success && result.posts) {
        const recentPosts = result.posts.slice(0, 5); // Last 5 posts
        const recentReplies = result.posts.filter(p => p.post_type === 'reply').slice(0, 3);
        
        setRecentActivity({
          posts: recentPosts,
          replies: recentReplies,
          totalPosts: result.posts.length,
          lastActivity: recentPosts[0]?.created_at
        });
      }
    } catch (error) {
      console.error('Load visitor activity error:', error);
    }
  };

  const loadDraftPosts = () => {
    try {
      const savedDrafts = localStorage.getItem('visitor_drafts');
      if (savedDrafts) {
        setDraftPosts(JSON.parse(savedDrafts));
      }
    } catch (error) {
      console.error('Load draft posts error:', error);
    }
  };

  const checkUnreadNotifications = async () => {
    try {
      // Check for replies to visitor's posts
      if (visitorSession?.email) {
        const { getNewsfeedPosts } = await import('../../services/newsfeedService');
        const result = await getNewsfeedPosts({ 
          author_email: visitorSession.email,
          type: 'replies_to_visitor' 
        });
        
        if (result.success && result.posts) {
          const unreadReplies = result.posts.filter(post => 
            new Date(post.created_at) > new Date(visitorSession.last_seen || 0)
          );
          setUnreadCount(unreadReplies.length);
        }
      }
    } catch (error) {
      console.error('Check unread notifications error:', error);
    }
  };

  // Enhanced session management
  const updateSessionActivity = async () => {
    if (visitorSession && !currentUser) {
      try {
        // Update last seen timestamp
        const updatedSession = {
          ...visitorSession,
          last_seen: new Date().toISOString()
        };
        
        localStorage.setItem('visitor_session', JSON.stringify(updatedSession));
        setEnhancedSession(updatedSession);
        
        // Update in backend
        const { updateVisitorSession } = await import('../../services/newsfeedService');
        await updateVisitorSession(visitorSession.session_id, {
          last_seen: new Date().toISOString()
        });
        
      } catch (error) {
        console.error('Update session activity error:', error);
      }
    }
  };

  const saveDraftPost = (postId, content) => {
    try {
      const updatedDrafts = { ...draftPosts, [postId]: content };
      setDraftPosts(updatedDrafts);
      localStorage.setItem('visitor_drafts', JSON.stringify(updatedDrafts));
    } catch (error) {
      console.error('Save draft post error:', error);
    }
  };

  const clearDraftPost = (postId) => {
    try {
      const updatedDrafts = { ...draftPosts };
      delete updatedDrafts[postId];
      setDraftPosts(updatedDrafts);
      localStorage.setItem('visitor_drafts', JSON.stringify(updatedDrafts));
    } catch (error) {
      console.error('Clear draft post error:', error);
    }
  };

  return {
    enhancedSession,
    recentActivity,
    draftPosts,
    unreadCount,
    updateSessionActivity,
    saveDraftPost,
    clearDraftPost
  };
};

// Enhanced Visitor Welcome Component
export const EnhancedVisitorWelcome = ({ visitorSession, recentActivity }) => {
  if (!visitorSession) return null;

  const isReturning = visitorSession.type === 'returning_visitor' || visitorSession.last_seen;
  const timeSinceLastVisit = visitorSession.last_seen ? 
    new Date() - new Date(visitorSession.last_seen) : null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="text-blue-600" size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900">
            {isReturning ? `Welcome back, ${visitorSession.name}!` : `Welcome, ${visitorSession.name}!`}
          </h3>
          
          {recentActivity && (
            <div className="mt-2 space-y-1">
              {recentActivity.posts.length > 0 && (
                <p className="text-sm text-blue-800">
                  You've shared {recentActivity.totalPosts} posts with our community.
                </p>
              )}
              
              {recentActivity.replies.length > 0 && (
                <p className="text-sm text-blue-800">
                  You've replied to {recentActivity.replies.length} discussions recently.
                </p>
              )}
              
              {timeSinceLastVisit && timeSinceLastVisit < 24 * 60 * 60 * 1000 && (
                <p className="text-sm text-blue-700">
                  Great to see you again! You've been active today.
                </p>
              )}
            </div>
          )}
          
          <p className="text-xs text-blue-600 mt-2">
            Your posts and activity are saved. Come back anytime to continue the conversation!
          </p>
        </div>
      </div>
    </div>
  );
};

// Smart Reply Suggestions Component
export const SmartReplySuggestions = ({ postContent, onSelectSuggestion, visitorSession }) => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (postContent && visitorSession) {
      generateReplySuggestions(postContent, visitorSession);
    }
  }, [postContent, visitorSession]);

  const generateReplySuggestions = (content, session) => {
    // Generate contextual reply suggestions based on post content and visitor history
    const baseSuggestions = [
      "Thanks for sharing this!",
      "Great point! I hadn't considered that.",
      "This is really helpful, thanks!",
      "I completely agree with this.",
      "Interesting perspective! Here's what I think..."
    ];

    // Add personalized suggestions based on visitor's previous posts
    if (session.recentActivity?.posts) {
      const visitorStyle = analyzeVisitorStyle(session.recentActivity.posts);
      
      if (visitorStyle === 'analytical') {
        baseSuggestions.push(
          "Let me add some context to this...",
          "From my experience, I've found that...",
          "This raises an interesting point about..."
        );
      } else if (visitorStyle === 'supportive') {
        baseSuggestions.push(
          "I really appreciate you sharing this!",
          "This is such valuable insight!",
          "Thank you for bringing this up!"
        );
      }
    }

    setSuggestions(baseSuggestions.slice(0, 3));
  };

  const analyzeVisitorStyle = (posts) => {
    // Simple analysis of posting style
    const avgLength = posts.reduce((sum, p) => sum + p.content.length, 0) / posts.length;
    const hasQuestions = posts.some(p => p.content.includes('?'));
    const hasExclamations = posts.some(p => p.content.includes('!'));
    
    if (avgLength > 200) return 'analytical';
    if (hasExclamations && !hasQuestions) return 'enthusiastic';
    if (hasQuestions) return 'inquisitive';
    return 'supportive';
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="bg-gray-50 p-3 rounded-lg mt-3">
      <p className="text-xs text-gray-600 mb-2">Quick reply suggestions:</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelectSuggestion(suggestion)}
            className="px-3 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-100 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

// Draft Post Preservation Component
export const DraftPostPreservation = ({ 
  content, 
  onContentChange, 
  onSaveDraft, 
  onClearDraft,
  visitorSession 
}) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [draftKey, setDraftKey] = useState('');

  useEffect(() => {
    if (visitorSession?.session_id) {
      setDraftKey(`draft_${visitorSession.session_id}_${Date.now()}`);
    }
  }, [visitorSession]);

  useEffect(() => {
    if (content && content.length > 10) {
      setHasUnsavedChanges(true);
      onSaveDraft(draftKey, content);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [content, draftKey]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (hasUnsavedChanges && visitorSession) {
      const interval = setInterval(() => {
        onSaveDraft(draftKey, content);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [hasUnsavedChanges, content, draftKey, visitorSession]);

  return (
    <div className="flex items-center justify-between mt-2">
      {hasUnsavedChanges && (
        <span className="text-xs text-orange-600 flex items-center gap-1">
          <Bookmark size={12} />
          Auto-saved draft
        </span>
      )}
      
      {hasUnsavedChanges && (
        <button
          onClick={() => onClearDraft(draftKey)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Clear draft
        </button>
      )}
    </div>
  );
};

// Activity Notifications Component
export const ActivityNotifications = ({ unreadCount, recentActivity, onViewAll }) => {
  if (unreadCount === 0 && !recentActivity) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="text-yellow-600" size={16} />
          <span className="text-sm font-medium text-yellow-800">
            {unreadCount > 0 ? `${unreadCount} new updates` : 'Recent activity'}
          </span>
        </div>
        
        <button
          onClick={onViewAll}
          className="text-xs text-yellow-700 hover:text-yellow-800"
        >
          View all
        </button>
      </div>
      
      {recentActivity && recentActivity.posts.length > 0 && (
        <div className="mt-2 space-y-1">
          {recentActivity.posts.slice(0, 2).map(post => (
            <div key={post.id} className="text-xs text-yellow-700">
              • {post.author_name} posted: {post.content.substring(0, 50)}...
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Export all enhanced components
export {
  useEnhancedVisitorSession,
  EnhancedVisitorWelcome,
  SmartReplySuggestions,
  DraftPostPreservation,
  ActivityNotifications
};