// Professional News Feed - Modern, Functional Design
import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Heart, Share2, Send, MoreVertical, Image as ImageIcon,
  Video, Smile, MapPin, X, Edit, Trash2, ThumbsUp, Bookmark,
  TrendingUp, Users, Clock, Eye
} from 'lucide-react';
import memberService from '../../services/memberService';
import RichTextEditor from './RichTextEditor';

const ProfessionalNewsFeed = ({ currentUser = { name: 'Admin User', email: 'admin@example.com' } }) => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});

  // Load posts from localStorage on mount
  useEffect(() => {
    const savedPosts = localStorage.getItem('newsfeed_posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      // Sample posts
      setPosts([
        {
          id: 1,
          author: { name: 'John Doe', avatar: null },
          content: 'Just launched our new feature! Check it out and let me know what you think. 🚀',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          likes: 12,
          comments: [
            { id: 1, author: 'Jane Smith', content: 'This looks amazing!', timestamp: new Date(Date.now() - 1800000).toISOString() }
          ],
          likedBy: [],
          image: null
        }
      ]);
    }
  }, []);

  // Save posts to localStorage whenever they change
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('newsfeed_posts', JSON.stringify(posts));
    }
  }, [posts]);

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    setIsPosting(true);
    
    const newPost = {
      id: Date.now(),
      author: { 
        name: currentUser.name,
        email: currentUser.email,
        avatar: null 
      },
      content: newPostContent,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: [],
      likedBy: [],
      image: null
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setIsPosting(false);

    // Track member activity
    memberService.trackNewsFeedPost(currentUser.email);
  };

  const handleLikePost = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const alreadyLiked = post.likedBy.includes(currentUser.email);
        return {
          ...post,
          likes: alreadyLiked ? post.likes - 1 : post.likes + 1,
          likedBy: alreadyLiked 
            ? post.likedBy.filter(email => email !== currentUser.email)
            : [...post.likedBy, currentUser.email]
        };
      }
      return post;
    }));
  };

  const handleAddComment = (postId) => {
    const comment = commentText[postId];
    if (!comment || !comment.trim()) return;

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: Date.now(),
              author: currentUser.name,
              email: currentUser.email,
              content: comment,
              timestamp: new Date().toISOString()
            }
          ]
        };
      }
      return post;
    }));

    setCommentText({ ...commentText, [postId]: '' });

    // Track member activity
    memberService.trackComment(currentUser.email);
  };

  const handleDeletePost = (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setPosts(posts.filter(post => post.id !== postId));
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffMs = now - postTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postTime.toLocaleDateString();
  };

  const stats = {
    totalPosts: posts.length,
    totalLikes: posts.reduce((sum, post) => sum + post.likes, 0),
    totalComments: posts.reduce((sum, post) => sum + post.comments.length, 0),
    activeUsers: new Set(posts.map(p => p.author.name)).size
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="text-blue-600" size={28} />
              Community Feed
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Users size={16} />
                {stats.activeUsers} active
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp size={16} />
                {stats.totalPosts} posts
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-gray-200">
            {['all', 'trending', 'following'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 font-medium transition ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Create Post Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {currentUser.name.charAt(0)}
              </div>
            </div>
            <div className="flex-1">
                <RichTextEditor
                  value={newPostContent}
                  onChange={setNewPostContent}
                  placeholder="What's on your mind?"
                />
                <div className="flex items-center justify-end mt-4">
                  <button
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim() || isPosting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                  >
                    {isPosting ? 'Posting...' : 'Post'}
                  </button>
                </div>
            </div>
          </div>
        </div>
        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600">Be the first to share something with the community!</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                {/* Post Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {post.author.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock size={14} />
                          {formatTimestamp(post.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {post.author.name === currentUser.name && (
                        <>
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeletePost(post.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="text-gray-900 leading-relaxed mb-4 prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

                  {/* Post Image */}
                  {post.image && (
                    <img src={post.image} alt="Post" className="w-full rounded-lg mb-4" />
                  )}

                  {/* Engagement Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 py-3 border-t border-gray-100">
                    <span>{post.likes} likes</span>
                    <span>{post.comments.length} comments</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center gap-2">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition ${
                      post.likedBy.includes(currentUser.email)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Heart size={20} fill={post.likedBy.includes(currentUser.email) ? 'currentColor' : 'none'} />
                    Like
                  </button>
                  <button
                    onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
                  >
                    <MessageSquare size={20} />
                    Comment
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition">
                    <Share2 size={20} />
                    Share
                  </button>
                </div>

                {/* Comments Section */}
                {showComments[post.id] && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    {/* Existing Comments */}
                    {post.comments.length > 0 && (
                      <div className="space-y-4 mb-4">
                        {post.comments.map(comment => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                              {comment.author.charAt(0)}
                            </div>
                            <div className="flex-1 bg-white rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-sm text-gray-900">{comment.author}</span>
                                <span className="text-xs text-gray-500">{formatTimestamp(comment.timestamp)}</span>
                              </div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {currentUser.name.charAt(0)}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={commentText[post.id] || ''}
                          onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          placeholder="Write a comment..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={!commentText[post.id]?.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalNewsFeed;