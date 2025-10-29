import React, { useState, useEffect } from 'react';
import {
  getPendingVisitorPosts,
  approveVisitorPost,
  rejectVisitorPost,
} from '../services/xanoService';

/**
 * Admin Moderation Component
 * Allows admins to approve or reject visitor posts
 */
const AdminModeration = () => {
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPendingPosts();
  }, []);

  // Load pending posts
  const loadPendingPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const posts = await getPendingVisitorPosts();
      setPendingPosts(Array.isArray(posts) ? posts : []);
    } catch (err) {
      setError('Failed to load pending posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Approve a post
  const handleApprove = async (postId) => {
    if (!window.confirm('Approve this post?')) return;

    try {
      await approveVisitorPost(postId);
      alert('Post approved!');
      // Remove from pending list
      setPendingPosts(pendingPosts.filter((p) => p.id !== postId));
    } catch (err) {
      alert('Failed to approve post');
      console.error(err);
    }
  };

  // Reject a post
  const handleReject = async (postId) => {
    if (!window.confirm('Reject this post?')) return;

    try {
      await rejectVisitorPost(postId);
      alert('Post rejected');
      // Remove from pending list
      setPendingPosts(pendingPosts.filter((p) => p.id !== postId));
    } catch (err) {
      alert('Failed to reject post');
      console.error(err);
    }
  };

  return (
    <div className="admin-moderation max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Post Moderation</h1>
        <button
          onClick={loadPendingPosts}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading pending posts...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!loading && pendingPosts.length === 0 && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p className="font-semibold">All caught up!</p>
          <p className="text-sm">No posts pending approval.</p>
        </div>
      )}

      <div className="space-y-4">
        {pendingPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <div className="flex justify-between items-start mb-2">
                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                  Pending Approval
                </span>
                <span className="text-sm text-gray-500">
                  Post ID: {post.id}
                </span>
              </div>
              
              <p className="text-gray-800 mt-3 whitespace-pre-wrap">{post.content}</p>
              
              <div className="mt-3 text-sm text-gray-600">
                <p>
                  <strong>Visitor ID:</strong> {post.visitor_id}
                </p>
                <p>
                  <strong>Submitted:</strong>{' '}
                  {new Date(post.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex gap-3 border-t pt-4">
              <button
                onClick={() => handleApprove(post.id)}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => handleReject(post.id)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium"
              >
                ✗ Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {pendingPosts.length > 0 && (
        <div className="mt-6 text-center text-gray-600">
          <p>{pendingPosts.length} post(s) awaiting moderation</p>
        </div>
      )}
    </div>
  );
};

export default AdminModeration;
