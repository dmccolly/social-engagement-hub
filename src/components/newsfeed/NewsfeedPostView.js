import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Clock, Heart, MessageSquare, Share2 } from 'lucide-react';
import { getNewsfeedPosts, toggleNewsfeedLike, getNewsfeedReplies } from '../../services/newsfeedService';
import { sanitizePostHtml } from '../../utils/sanitizePostHtml';

/**
 * NewsfeedPostView - Individual post page for sharing
 * 
 * Displays a single newsfeed post with its replies and engagement options.
 * Used when sharing posts on social media to show only that specific post.
 */
const NewsfeedPostView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visitorSession, setVisitorSession] = useState(null);

  useEffect(() => {
    loadPost();
    loadVisitorSession();
  }, [id]);

  const loadVisitorSession = () => {
    try {
      const savedSession = localStorage.getItem('visitor_session');
      if (savedSession) {
        setVisitorSession(JSON.parse(savedSession));
      }
    } catch (error) {
      console.error('Load visitor session error:', error);
    }
  };

  const loadPost = async () => {
    setIsLoading(true);
    try {
      // Fetch all posts and find the specific one
      const result = await getNewsfeedPosts({ type: 'posts_only', limit: 1000 });
      if (result.success && result.posts) {
        const foundPost = result.posts.find(p => p.id === parseInt(id));
        if (foundPost) {
          setPost(foundPost);
          // Load replies for this post
          const repliesResult = await getNewsfeedReplies(id);
          if (repliesResult.success && repliesResult.replies) {
            setReplies(repliesResult.replies);
          }
        } else {
          setPost(null);
        }
      }
    } catch (error) {
      console.error('Error loading post:', error);
      setPost(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!visitorSession) {
      alert('Please register to like posts');
      return;
    }
    try {
      const result = await toggleNewsfeedLike(post.id, visitorSession.email);
      if (result.success) {
        setPost(prev => ({
          ...prev,
          likes_count: result.likes_count,
          visitor_liked: result.liked
        }));
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    const text = `Check out this post: ${post.content.substring(0, 100)}...`;
    
    if (navigator.share) {
      navigator.share({ title: 'Newsfeed Post', text, url });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h2>
          <p className="text-gray-600 mb-6">The post you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Feed</span>
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Post Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <User className="text-white" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{post.author_name}</h4>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock size={14} />
                  {new Date(post.created_at).toLocaleDateString()} at{' '}
                  {new Date(post.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Post Body */}
          <div className="p-6">
            <div 
              className="prose max-w-none post-content"
              dangerouslySetInnerHTML={{ __html: sanitizePostHtml(post.content || '') }}
            />
          </div>

          {/* Post Actions */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                post.visitor_liked
                  ? 'bg-red-50 text-red-600'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Heart size={20} fill={post.visitor_liked ? 'currentColor' : 'none'} />
              <span className="font-semibold">{post.likes_count || 0}</span>
            </button>

            <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
              <MessageSquare size={20} />
              <span className="font-semibold">{replies.length}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Share2 size={20} />
              <span className="font-semibold">Share</span>
            </button>
          </div>

          {/* Replies Section */}
          {replies.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <h5 className="font-bold text-gray-900 mb-4">Replies ({replies.length})</h5>
              <div className="space-y-4">
                {replies.map(reply => (
                  <div key={reply.id} className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="text-gray-600" size={16} />
                    </div>
                    <div className="flex-1 bg-white rounded-2xl p-3">
                      <h6 className="font-semibold text-sm text-gray-900">{reply.author_name}</h6>
                      <div 
                        className="text-gray-800 text-sm mt-1 post-content"
                        dangerouslySetInnerHTML={{ __html: sanitizePostHtml(reply.content || '') }}
                      />
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(reply.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Want to join the conversation?</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            Visit Our Community
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsfeedPostView;
