import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PatchedRichBlogEditor from '../PatchedRichBlogEditor';
import {
  getPublishedPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from '../services/xanoService';

/**
 * BlogSection component
 *
 * This component renders a list of blog posts fetched from the Xano backend
 * and provides UI to create a new post, edit an existing post, and delete posts.
 * It leverages the PatchedRichBlogEditor for the post editor UI and the
 * existing xanoService functions to communicate with the backend. When the
 * editor is active, the list is hidden. Once a post is saved, the list
 * refreshes to include the new or updated post.
 */
const BlogSection = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  // Load posts on mount
  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      setLoadError(null);
      const result = await getPublishedPosts(100, 0);
      if (result.success) {
        setPosts(result.posts);
      } else {
        setLoadError(result.error || 'Failed to load posts');
      }
      setIsLoading(false);
    };
    loadPosts();
  }, []);

  /**
   * Handle creating a new post.
   */
  const handleCreateNew = () => {
    setEditingPost(null);
    setShowEditor(true);
  };

  /**
   * Handle saving a new or edited post. On save, call the appropriate
   * Xano service and update the local posts state.
   */
  const handleSavePost = async ({ title, content, status, scheduled_datetime }) => {
    try {
      let tags = editingPost?.tags || '';
      
      tags = tags.split(',').filter(tag => !tag.trim().startsWith('status:')).join(',');
      
      if (status === 'draft') {
        tags = tags ? `${tags},status:draft` : 'status:draft';
      }
      
      const isScheduled = status === 'scheduled' && scheduled_datetime;
      
      let response;
      if (editingPost) {
        // Updating an existing post
        response = await updateBlogPost(editingPost.id, {
          title,
          content,
          author: editingPost.author,
          tags: tags.trim(),
          featured: editingPost.featured,
          pinned: editingPost.pinned,
          sort_order: editingPost.sort_order,
          is_scheduled: isScheduled,
          scheduled_datetime: isScheduled ? scheduled_datetime : null,
        });
      } else {
        // Creating a new post
        response = await createBlogPost({
          title,
          content,
          author: 'Admin',
          tags: tags.trim(),
          featured: false,
          pinned: false,
          is_scheduled: isScheduled,
          scheduled_datetime: isScheduled ? scheduled_datetime : null,
        });
      }
      if (response.success) {
        // Reload posts to include the new/updated entry
        const postsResult = await getPublishedPosts(100, 0);
        if (postsResult.success) {
          setPosts(postsResult.posts);
        }
        setShowEditor(false);
        setEditingPost(null);
        
        if (status === 'draft') {
          alert('Post saved as draft successfully!');
        } else if (status === 'scheduled') {
          alert('Post scheduled successfully!');
        } else {
          alert('Post published successfully!');
        }
      } else {
        alert(response.error || 'Failed to save post');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Error saving post. See console for details.');
    }
  };


  /**
   * Handle deleting a post. Calls the deleteBlogPost service and removes
   * the post from the local state on success.
   */
  const handleDelete = async (post) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    const response = await deleteBlogPost(post.id);
    if (response.success) {
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } else {
      alert(response.error || 'Failed to delete post');
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading posts...</p>
      </div>
    );
  }

  // If editor is open, render the editor
  if (showEditor) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          {editingPost ? 'Edit Post' : 'Create New Post'}
        </h1>
        <PatchedRichBlogEditor
          onSave={handleSavePost}
          onCancel={() => {
            setShowEditor(false);
            setEditingPost(null);
          }}
        />
      </div>
    );
  }

  // Default view: show list of posts
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          New Post
        </button>
      </div>
      {loadError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold">Failed to load blog posts</p>
          <p className="text-red-600 text-sm mt-1">{loadError}</p>
          <p className="text-red-600 text-sm mt-2">
            This is usually caused by CORS configuration. Check the browser console for details.
          </p>
        </div>
      ) : posts.length === 0 ? (
        <p>No blog posts yet. Click "New Post" to create one.</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.id} className="bg-white shadow p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold mb-1">
                    <Link to={`/post/${post.id}`} className="text-blue-600 hover:underline">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()} • {post.author || 'Admin'}
                  </p>
                  {post.excerpt && (
                    <div
                      className="mt-2 text-gray-700"
                      dangerouslySetInnerHTML={{ __html: post.excerpt }}
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(post)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BlogSection;
