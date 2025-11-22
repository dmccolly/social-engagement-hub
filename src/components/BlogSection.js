import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, X, ChevronUp, ChevronDown, Share2 } from 'lucide-react';
import PatchedRichBlogEditor from '../PatchedRichBlogEditor';
import {
  getPublishedPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from '../services/xanoService';
import { createVisitorSession } from '../services/newsfeedService';

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
  const [drafts, setDrafts] = useState([]);
  const [showDrafts, setShowDrafts] = useState(false);
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

  useEffect(() => {
    const loadDrafts = async () => {
      if (!showDrafts || !visitorSession) return;
      
      try {
        const response = await fetch(`${process.env.REACT_APP_XANO_PROXY_BASE || '/xano'}/asset`);
        if (!response.ok) {
          console.error('Failed to fetch drafts');
          return;
        }
        
        const assets = await response.json();
        const draftPosts = assets
          .filter(asset => {
            const catId = asset.category_id ?? asset.category?.id ?? asset.category;
            if (Number(catId) !== 11) return false;
            
            const tags = asset.tags || '';
            if (!tags.includes('status:draft')) return false;
            
            const submittedBy = asset.submitted_by || '';
            if (submittedBy !== visitorSession.name) return false;
            
            return true;
          })
          .map(asset => ({
            id: asset.id,
            title: asset.title || 'Untitled',
            content: asset.description || '',
            author: asset.submitted_by || 'Unknown',
            created_at: asset.created_at,
            featured: asset.is_featured || false,
            pinned: asset.pinned || false,
            sort_order: asset.sort_order || 0,
            tags: asset.tags || '',
            status: 'draft'
          }))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        setDrafts(draftPosts);
      } catch (error) {
        console.error('Load drafts error:', error);
      }
    };
    
    loadDrafts();
  }, [showDrafts, visitorSession]);

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
      
      console.log('createVisitorSession result:', result);
      
      if (result.success) {
        // Handle both response formats: {success, session} or direct session object
        const session = result.session || result;
        console.log('Storing visitor session:', session);
        localStorage.setItem('visitor_session', JSON.stringify(session));
        setVisitorSession(session);
        setShowVisitorForm(false);
        setVisitorData({ name: '', email: '' });
        setShowEditor(true);
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
  const handleSavePost = async ({ title, content, status, scheduled_datetime, featured, pinned, sort_order }) => {
    try {
      let tags = editingPost?.tags || '';
      
      tags = tags.split(',').filter(tag => !tag.trim().startsWith('status:')).join(',');
      
      if (status === 'draft') {
        tags = tags ? `${tags},status:draft` : 'status:draft';
      }
      
      const isScheduled = status === 'scheduled' && scheduled_datetime;
      
      // Determine author name from visitor session with email fallback
      const authorName = editingPost 
        ? editingPost.author 
        : (visitorSession?.name?.trim() || visitorSession?.email?.trim() || 'Anonymous');
      
      console.log('Saving post with author:', authorName, 'visitorSession:', visitorSession);
      
      let response;
      if (editingPost) {
        // Updating an existing post - use values from editor
        response = await updateBlogPost(editingPost.id, {
          title,
          content,
          author: editingPost.author,
          tags: tags.trim(),
          featured: featured !== undefined ? featured : editingPost.featured,
          pinned: pinned !== undefined ? pinned : editingPost.pinned,
          sort_order: sort_order !== undefined ? sort_order : editingPost.sort_order,
          is_scheduled: isScheduled,
          scheduled_datetime: isScheduled ? scheduled_datetime : null,
        });
      } else {
        // Creating a new post - use values from editor
        response = await createBlogPost({
          title,
          content,
          author: authorName,  // Use visitor's actual name
          tags: tags.trim(),
          featured: featured !== undefined ? featured : false,
          pinned: pinned !== undefined ? pinned : false,
          sort_order: sort_order !== undefined ? sort_order : 0,
          is_scheduled: isScheduled,
          scheduled_datetime: isScheduled ? scheduled_datetime : null,
        });
      }
      
      if (response.success) {
        // Reload posts to include the new/updated entry (increased limit to 1000)
        const postsResult = await getPublishedPosts(1000, 0);
        if (postsResult.success) {
          console.log('Loaded posts after save:', postsResult.posts.length);
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

  /**
   * Handle moving a post up in the sort order
   */
  const handleMoveUp = async (post, index) => {
    if (index === 0) return; // Already at top
    
    const prevPost = posts[index - 1];
    const newSortOrder = prevPost.sort_order - 1;
    
    const response = await updateBlogPost(post.id, {
      title: post.title,
      content: post.content,
      author: post.author,
      tags: post.tags,
      featured: post.featured,
      pinned: post.pinned,
      sort_order: newSortOrder,
      is_scheduled: post.is_scheduled,
      scheduled_datetime: post.scheduled_datetime,
    });
    
    if (response.success) {
      const postsResult = await getPublishedPosts(100, 0);
      if (postsResult.success) {
        setPosts(postsResult.posts);
      }
    } else {
      alert(response.error || 'Failed to reorder post');
    }
  };

  /**
   * Handle moving a post down in the sort order
   */
  const handleMoveDown = async (post, index) => {
    if (index === posts.length - 1) return; // Already at bottom
    
    const nextPost = posts[index + 1];
    const newSortOrder = nextPost.sort_order + 1;
    
    const response = await updateBlogPost(post.id, {
      title: post.title,
      content: post.content,
      author: post.author,
      tags: post.tags,
      featured: post.featured,
      pinned: post.pinned,
      sort_order: newSortOrder,
      is_scheduled: post.is_scheduled,
      scheduled_datetime: post.scheduled_datetime,
    });
    
    if (response.success) {
      const postsResult = await getPublishedPosts(100, 0);
      if (postsResult.success) {
        setPosts(postsResult.posts);
      }
    } else {
      alert(response.error || 'Failed to reorder post');
    }
  };

  const handleShareToFacebook = (post) => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
    window.open(shareUrl, 'facebook-share-dialog', 'width=626,height=436');
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
          initialFeatured={editingPost?.featured || false}
          initialPinned={editingPost?.pinned || false}
          initialSortOrder={editingPost?.sort_order || 0}
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
            <>
              <span className="text-sm text-gray-600">
                Signed in as: <strong>{visitorSession.name}</strong>
              </span>
              <button
                onClick={() => setShowDrafts(!showDrafts)}
                className={`px-4 py-2 rounded transition ${
                  showDrafts
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showDrafts ? 'Show Published' : 'Show My Drafts'}
              </button>
            </>
          )}
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            New Post
          </button>
        </div>
      </div>
      
      {showDrafts && visitorSession ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-semibold">My Drafts</p>
            <p className="text-blue-600 text-sm mt-1">
              Showing draft posts saved by {visitorSession.name}
            </p>
          </div>
          {drafts.length === 0 ? (
            <p className="text-gray-600">No drafts found. Save a post as draft to see it here.</p>
          ) : (
            <ul className="space-y-4">
              {drafts.map((post) => (
                <li key={post.id} className="bg-white shadow p-4 rounded-lg border-l-4 border-yellow-400">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold mb-1">
                        {post.title}
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          DRAFT
                        </span>
                      </h2>
                      <p className="text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()} • {post.author || 'Anonymous'}
                      </p>
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
      ) : loadError ? (
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
          {posts.map((post, index) => (
            <li key={post.id} className="bg-white shadow p-4 rounded-lg">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col gap-1 mt-1">
                      <button
                        onClick={() => handleMoveUp(post, index)}
                        disabled={index === 0}
                        className="p-1 text-gray-600 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        onClick={() => handleMoveDown(post, index)}
                        disabled={index === posts.length - 1}
                        className="p-1 text-gray-600 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold mb-1">
                        <Link to={`/post/${post.id}`} className="text-blue-600 hover:underline">
                          {post.title}
                        </Link>
                        {post.pinned && (
                          <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            PINNED
                          </span>
                        )}
                        {post.featured && (
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            FEATURED
                          </span>
                        )}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()} • {post.author || 'Anonymous'}
                        {post.sort_order !== 0 && (
                          <span className="ml-2 text-xs text-gray-400">
                            (Order: {post.sort_order})
                          </span>
                        )}
                      </p>
                      {post.excerpt && (
                        <div
                          className="mt-2 text-gray-700"
                          dangerouslySetInnerHTML={{ __html: post.excerpt }}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShareToFacebook(post)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                    title="Share to Facebook"
                  >
                    <Share2 size={14} />
                    Share
                  </button>
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
