import React, { useState, useEffect } from 'react';
import {
  getOrCreateVisitorToken,
  getVisitorProfile,
  updateVisitorProfile,
  createVisitorPost,
  getApprovedVisitorPosts,
  replyToVisitorPost,
  likeVisitorPost,
} from '../services/xanoService';

/**
 * Visitor Engagement Component
 * Handles visitor posts, replies, and likes
 */
const VisitorEngagement = () => {
  const [visitorToken, setVisitorToken] = useState('');
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [replyContent, setReplyContent] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize visitor token on mount
  useEffect(() => {
    const token = getOrCreateVisitorToken();
    setVisitorToken(token);
    loadProfile(token);
    loadPosts();
  }, []);

  // Load visitor profile
  const loadProfile = async (token) => {
    try {
      const profileData = await getVisitorProfile(token);
      setProfile(profileData);
    } catch (err) {
      console.error('Failed to load profile:', err);
      // Profile might not exist yet, that's okay
    }
  };

  // Load approved posts
  const loadPosts = async () => {
    try {
      setLoading(true);
      const postsData = await getApprovedVisitorPosts();
      setPosts(Array.isArray(postsData) ? postsData : []);
    } catch (err) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const handleUpdateProfile = async (firstName, lastName) => {
    try {
      const updated = await updateVisitorProfile(visitorToken, firstName, lastName);
      setProfile(updated);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile');
      console.error(err);
    }
  };

  // Create new post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      setLoading(true);
      await createVisitorPost(visitorToken, newPostContent);
      setNewPostContent('');
      alert('Post submitted! It will appear after admin approval.');
    } catch (err) {
      alert('Failed to create post');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Like a post
  const handleLike = async (postId) => {
    try {
      await likeVisitorPost(postId, visitorToken);
      alert('Post liked!');
      // Optionally reload posts to show updated like count
      loadPosts();
    } catch (err) {
      alert('Failed to like post');
      console.error(err);
    }
  };

  // Reply to a post
  const handleReply = async (postId) => {
    const content = replyContent[postId];
    if (!content || !content.trim()) return;

    try {
      await replyToVisitorPost(postId, visitorToken, content);
      setReplyContent({ ...replyContent, [postId]: '' });
      alert('Reply posted!');
      loadPosts();
    } catch (err) {
      alert('Failed to post reply');
      console.error(err);
    }
  };

  return (
    <div className="visitor-engagement max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Community Engagement</h1>

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
        {profile ? (
          <div>
            <p className="mb-2">
              <strong>Name:</strong> {profile.first_name} {profile.last_name}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Visitor ID: {visitorToken.substring(0, 20)}...
            </p>
          </div>
        ) : (
          <p className="text-gray-600 mb-4">No profile set up yet</p>
        )}
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="First Name"
            className="border rounded px-3 py-2 flex-1"
            id="firstName"
          />
          <input
            type="text"
            placeholder="Last Name"
            className="border rounded px-3 py-2 flex-1"
            id="lastName"
          />
          <button
            onClick={() => {
              const firstName = document.getElementById('firstName').value;
              const lastName = document.getElementById('lastName').value;
              handleUpdateProfile(firstName, lastName);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update Profile
          </button>
        </div>
      </div>

      {/* Create Post Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Share Your Thoughts</h2>
        <form onSubmit={handleCreatePost}>
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full border rounded px-3 py-2 mb-3 h-32"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Posting...' : 'Post (Requires Approval)'}
          </button>
        </form>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Community Posts</h2>
        
        {loading && <p className="text-center py-8">Loading posts...</p>}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {!loading && posts.length === 0 && (
          <p className="text-center py-8 text-gray-600">
            No posts yet. Be the first to share!
          </p>
        )}
        
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <p className="text-gray-800">{post.content}</p>
              <p className="text-sm text-gray-500 mt-2">
                Posted {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex gap-4 border-t pt-4">
              <button
                onClick={() => handleLike(post.id)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                👍 Like
              </button>
              
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Write a reply..."
                  value={replyContent[post.id] || ''}
                  onChange={(e) =>
                    setReplyContent({ ...replyContent, [post.id]: e.target.value })
                  }
                  className="border rounded px-3 py-1 w-full"
                />
              </div>
              
              <button
                onClick={() => handleReply(post.id)}
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
              >
                Reply
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisitorEngagement;
