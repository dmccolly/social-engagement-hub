import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, X } from 'lucide-react';
import PatchedRichBlogEditor from '../PatchedRichBlogEditor';
import {
  getPublishedPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from '../services/xanoService';
import { createVisitorSession } from '../services/newsfeed/newsfeedService';

/**
 * BlogSection component with Visitor Session Support
 *
 * This component renders a list of blog posts fetched from the Xano backend
 * and provides UI to create a new post, edit an existing post, and delete posts.
 * It now includes visitor session support to attribute posts to actual users
 * instead of generic "Admin" credits.
 */
const BlogSection = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  
  // Visitor session state
  const [visitorSession, setVisitorSession] = useState(null);
  const [showVisitorForm, setShowVisitorForm] = useState(false);
  const [visitorData, setVisitorData] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load visitor session on mount
  useEffect(() => {
    const loadVisitorSession = async () => {
      try {
        const savedSession = localStorage.getItem('visitor_session');
        if (savedSession) {
          const session = JSON.parse(savedSession);
          setVisitorSession(session);
          console.log('Loaded visitor session:', session);
        }
      } catch (error) {
        console.error('Load visitor session error:', error);
      }
    };
    loadVisitorSession();
  }, []);

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

  // Generate a unique session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Handle visitor form submission
  const handleVisitorFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!visitorData.name.trim() || !visitorData.email.trim()) {
      alert('Please fill in both name and email');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(visitorData.email)) {
      alert('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const sessionData = {
        session_id: generateSessionId(),
        email: visitorData.email,
        name: visitorData.name,
        is_member: false,
        member_id: null
      };
      
      const result = await createVisitorSession(sessionData);
      
      if (result.success) {
        localStorage.setItem('visitor_session', JSON.stringify(result.session));
        setVisitorSession(result.session);
        setShowVisitorForm(false);
        setVisitorData({ name: '', email: '' });
        alert('Welcome! You can now create blog posts with your name.');
      } else {
        alert('Failed to create visitor session: ' + result.error);
      }
    } catch (error) {
      console.error('Visitor form submit error:', error);
      alert('Failed to create visitor session: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle creating a new post.
   * Check for visitor session first.
   */
  const handleCreateNew = () => {
    // Check if visitor has a session
    if (!visitorSession) {
      setShowVisitorForm(true);
      return;
    }
    
    setEditingPost(null);
    setShowEditor(true);
  };

  /**
   * Handle editing an existing post.
   */
  const handleEdit = (post) => {
    setEditingPost(post);
    setShowEditor(true);
  };

  /**
   * Handle saving a new or edited post. On save, call the appropriate
   * Xano service and update the local posts state.
   * Now uses visitor session for author attribution.
   */
  const handleSavePost = async ({ title, content, status, scheduled_datetime }) => {
    try {
      let tags = editingPost?.tags || '';
      
      tags = tags.split(',').filter(tag => !tag.trim().startsWith('status:')).join(',');
      
      if (status === 'draft') {
        tags = tags ? `${tags},status:draft` : 'status:draft';
      }
      
      const isScheduled = status === 'scheduled' && scheduled_datetime;
      
      // Determine author name from visitor session or use existing author for edits
      const authorName = editingPost 
        ? editingPost.author 
        : (visitorSession?.name || 'Anonymous');
      
      let response;
      if (editingPost) {
        // Updating an existing post - keep original author
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
        // Creating a new post - use visitor session name
        response = await createBlogPost({
          title,
          content,
          author: authorName,  // Use visitor's actual name
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
        {visitorSession && !editingPost && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Posting as:</strong> {visitorSession.name} ({visitorSession.email})
            </p>
          </div>
        )}
        <PatchedRichBlogEditor
          initialTitle={editingPost?.title || ''}
          initialContent={editingPost?.content || ''}
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
      {/* Visitor registration modal */}
      {showVisitorForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <User className="text-blue-600" /> Join to Post
              </h2>
              <button
                onClick={() => setShowVisitorForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleVisitorFormSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={visitorData.name}
                    onChange={(e) => setVisitorData({ ...visitorData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={visitorData.email}
                    onChange={(e) => setVisitorData({ ...visitorData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="your-email@domain.com"
                    required
                  />
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-blue-800">
                    <strong>Why we need this:</strong> Your name will be credited on your blog posts. We use your email to recognize you on return visits.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowVisitorForm(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition-colors"
                >
                  {isSubmitting ? 'Creating...' : 'Continue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <div className="flex items-center gap-4">
          {visitorSession && (
            <span className="text-sm text-gray-600">
              Signed in as: <strong>{visitorSession.name}</strong>
            </span>
          )}
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            New Post
          </button>
        </div>
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
                    <Link to={`/blog/${post.id}`} className="text-blue-600 hover:underline">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()} • {post.author || 'Anonymous'}
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
                    onClick={() => handleEdit(post)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
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