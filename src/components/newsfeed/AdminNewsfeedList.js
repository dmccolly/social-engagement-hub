/*
 * AdminNewsfeedList.js
 *
 * A minimal newsfeed list component for the Social Engagement Hub admin area.
 * This component fetches posts from the Xano‑backed newsfeed and renders
 * their HTML content safely using DOMPurify.  It is intended to replace
 * whatever widget is currently used on the admin newsfeed list page that
 * displays raw markup.  By sanitising the HTML and injecting it via
 * `dangerouslySetInnerHTML`, the admin list will render rich text and
 * images instead of showing the underlying tags.
 * 
 * Install DOMPurify if you haven’t already:
 *    npm install dompurify
 */

import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { getNewsfeedPosts } from '../../services/newsfeedService';

const AdminNewsfeedList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        // Fetch up to 50 posts; adjust the limit as needed.
        const result = await getNewsfeedPosts({ type: 'post', limit: 50 });
        if (result.success && result.posts) {
          setPosts(result.posts);
        } else {
          setError(result.error || 'Failed to load posts');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return <div>Loading posts…</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <div key={post.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500 mb-1">
            <strong>{post.author_name}</strong> – {new Date(post.created_at).toLocaleString()}
          </div>
          <div
            className="prose max-w-none"
            // Sanitize the HTML before injecting it into the DOM.
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          />
        </div>
      ))}
    </div>
  );
};

export default AdminNewsfeedList;
