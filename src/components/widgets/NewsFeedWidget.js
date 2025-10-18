// Standalone News Feed Widget - Embeddable
import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, Send, Clock, Users } from 'lucide-react';

const NewsFeedWidget = ({ 
  headerText = "Community Feed",
  headerColor = "#2563eb",
  postCount = 5,
  showComments = true,
  allowPosting = false,
  compact = false,
  theme = "light"
}) => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [commentText, setCommentText] = useState({});
  const [showCommentBox, setShowCommentBox] = useState({});

  useEffect(() => {
    // Load posts from localStorage or use sample data
    const savedPosts = localStorage.getItem('newsfeed_posts');
    if (savedPosts) {
      const allPosts = JSON.parse(savedPosts);
      setPosts(allPosts.slice(0, postCount));
    } else {
      setPosts([
        {
          id: 1,
          author: { name: 'John Doe' },
          content: 'Welcome to our community! 🎉',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          likes: 5,
          comments: [],
          likedBy: []
        }
      ]);
    }
  }, [postCount]);

  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const liked = post.likedBy.includes('widget-user');
        return {
          ...post,
          likes: liked ? post.likes - 1 : post.likes + 1,
          likedBy: liked 
            ? post.likedBy.filter(u => u !== 'widget-user')
            : [...post.likedBy, 'widget-user']
        };
      }
      return post;
    }));
  };

  const handleAddComment = (postId) => {
    const comment = commentText[postId];
    if (!comment?.trim()) return;

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: Date.now(),
              author: 'Guest',
              content: comment,
              timestamp: new Date().toISOString()
            }
          ]
        };
      }
      return post;
    }));

    setCommentText({ ...commentText, [postId]: '' });
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  return (
    <div className={`${compact ? 'max-w-md' : 'max-w-2xl'} mx-auto bg-white rounded-lg shadow-lg overflow-hidden`}>
      {/* Header */}
      <div 
        className="p-4 text-white"
        style={{ backgroundColor: headerColor }}
      >
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare size={24} />
          {headerText}
        </h2>
      </div>

      {/* Posts */}
      <div className={`${compact ? 'max-h-96' : 'max-h-[600px]'} overflow-y-auto`}>
        {posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare className="mx-auto mb-2 text-gray-400" size={32} />
            <p>No posts yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {posts.map(post => (
              <div key={post.id} className="p-4">
                {/* Post Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {post.author.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{post.author.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} />
                      {formatTime(post.timestamp)} ago
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-gray-800 mb-3">{post.content}</p>

                {/* Post Actions */}
                <div className="flex items-center gap-4 text-sm">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1 ${
                      post.likedBy.includes('widget-user') ? 'text-red-600' : 'text-gray-600'
                    } hover:text-red-600 transition`}
                  >
                    <Heart size={16} fill={post.likedBy.includes('widget-user') ? 'currentColor' : 'none'} />
                    {post.likes}
                  </button>
                  {showComments && (
                    <button
                      onClick={() => setShowCommentBox({ ...showCommentBox, [post.id]: !showCommentBox[post.id] })}
                      className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition"
                    >
                      <MessageSquare size={16} />
                      {post.comments.length}
                    </button>
                  )}
                </div>

                {/* Comments */}
                {showComments && showCommentBox[post.id] && (
                  <div className="mt-3 space-y-2">
                    {post.comments.map(comment => (
                      <div key={comment.id} className="bg-gray-50 rounded p-2">
                        <p className="text-xs font-semibold text-gray-900">{comment.author}</p>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={commentText[post.id] || ''}
                        onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
        <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View all posts →
        </a>
      </div>
    </div>
  );
};

export default NewsFeedWidget;