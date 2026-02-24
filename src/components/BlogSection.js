import React, { useState, useEffect, useCallback } from 'react';
import { sanitizeBeforeSave } from '../utils/htmlSanitizer';
import { Link } from 'react-router-dom';
import { User, X, ChevronUp, ChevronDown, Share2, CheckCircle, AlertCircle, Info } from 'lucide-react';
import PatchedRichBlogEditor from '../PatchedRichBlogEditor';
import SocialShareButtons from './SocialShareButtons';
import {
  getPublishedPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from '../services/xanoService';
import { createVisitorSession } from '../services/newsfeedService';

// ------------------------------------------------------------------
// Toast notification system (replaces alert())
// ------------------------------------------------------------------
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);

  return { toasts, addToast };
};

const TOAST_STYLES = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error:   'bg-red-50 border-red-200 text-red-800',
  info:    'bg-blue-50 border-blue-200 text-blue-800',
};

const TOAST_ICONS = {
  success: CheckCircle,
  error:   AlertCircle,
  info:    Info,
};

const ToastContainer = ({ toasts }) => (
  <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
    {toasts.map(({ id, message, type }) => {
      const Icon = TOAST_ICONS[type] || Info;
      return (
        <div
          key={id}
          className={`flex items-start gap-2 px-4 py-3 rounded-xl border shadow-lg
            text-sm font-medium animate-fade-in pointer-events-auto ${TOAST_STYLES[type]}`}
        >
          <Icon size={16} className="mt-0.5 flex-shrink-0" />
          <span>{message}</span>
        </div>
      );
    })}
  </div>
);

// ------------------------------------------------------------------
// BlogSection component with Visitor Session Support
// ------------------------------------------------------------------
const BlogSection = () => {
  const [posts, setPosts] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [archivedPosts, setArchivedPosts] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  // Visitor session state
  const [visitorSession, setVisitorSession] = useState(null);
  const [showVisitorForm, setShowVisitorForm] = useState(false);
  const [visitorData, setVisitorData] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toasts, addToast } = useToast();

  // Load visitor session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('visitor_session');
      if (saved) {
        const session = JSON.parse(saved);
        if (session.name) session.name = session.name.trim();
        if (session.email) session.email = session.email.trim();
        setVisitorSession(session);
      }
    } catch (err) {
      console.error('Load visitor session error:', err);
    }
  }, []);

  // Load published posts
  useEffect(() => {
    const load = async () => {
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
    load();
  }, []);

  // Load archived posts when the archived tab is opened
  const loadArchivedPosts = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_XANO_PROXY_BASE || '/xano'}/asset`);
      if (!response.ok) { console.error('Failed to fetch archived posts'); return; }
      const assets = await response.json();
      const archived = assets
        .filter(asset => {
          const catId = asset.category_id ?? asset.category?.id ?? asset.category;
          if (Number(catId) !== 11) return false;
          return (asset.tags || '').includes('status:archived');
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
          status: 'archived',
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setArchivedPosts(archived);
    } catch (err) {
      console.error('Load archived posts error:', err);
    }
  }, []);

  useEffect(() => {
    if (showArchived) loadArchivedPosts();
  }, [showArchived, loadArchivedPosts]);

  // Load drafts when the drafts tab is opened
  useEffect(() => {
    if (!showDrafts) return;
    const load = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_XANO_PROXY_BASE || '/xano'}/asset`);
        if (!response.ok) return;
        const assets = await response.json();
        const draftPosts = assets
          .filter(asset => {
            const catId = asset.category_id ?? asset.category?.id ?? asset.category;
            if (Number(catId) !== 11) return false;
            if (!(asset.tags || '').includes('status:draft')) return false;
            const submittedBy = (asset.submitted_by || '').trim();
            if (submittedBy.includes('@')) return true;
            if (visitorSession) return submittedBy === visitorSession.name.trim();
            return true;
          })
          .map(asset => ({
            id: asset.id,
            title: asset.title || 'Untitled',
            content: asset.description || '',
            author: asset.submitted_by || 'Unknown',
            created_at: asset.created_at,
            featured: asset.is_featured || false,
            tags: asset.tags || '',
            status: 'draft',
          }))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setDrafts(draftPosts);
      } catch (err) {
        console.error('Load drafts error:', err);
      }
    };
    load();
  }, [showDrafts, visitorSession]);

  const generateSessionId = () =>
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Handle visitor form submission
  const handleVisitorFormSubmit = async (e) => {
    e.preventDefault();
    if (!visitorData.name.trim() || !visitorData.email.trim()) {
      addToast('Please fill in both name and email.', 'error');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(visitorData.email)) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const sessionData = {
        session_id: generateSessionId(),
        email: visitorData.email.trim(),
        name: visitorData.name.trim(),
        is_member: false,
        member_id: null,
      };
      const result = await createVisitorSession(sessionData);
      if (result.success) {
        const session = result.session || result;
        localStorage.setItem('visitor_session', JSON.stringify(session));
        setVisitorSession(session);
        setShowVisitorForm(false);
        setVisitorData({ name: '', email: '' });
        setShowEditor(true);
        addToast(`Welcome, ${session.name}! You can now create blog posts.`, 'success');
      } else {
        addToast('Failed to create session: ' + result.error, 'error');
      }
    } catch (err) {
      console.error('Visitor form submit error:', err);
      addToast('Failed to create session: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNew = () => {
    if (!visitorSession) { setShowVisitorForm(true); return; }
    setEditingPost(null);
    setShowEditor(true);
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setShowEditor(true);
  };

  const handleSavePost = async ({ title, content, status, scheduled_datetime, featured, pinned, sort_order }) => {
    try {
      if (status === 'draft' && !visitorSession && !editingPost) {
        addToast('Please sign in to save drafts.', 'info');
        setShowVisitorForm(true);
        return;
      }

      let tags = editingPost?.tags || '';
      tags = tags.split(',').filter(tag => !tag.trim().startsWith('status:')).join(',');
      if (status === 'draft') {
        tags = tags ? `${tags},status:draft` : 'status:draft';
      } else {
        tags = tags ? `${tags},status:published` : 'status:published';
      }

      const isScheduled = status === 'scheduled' && scheduled_datetime;
      const authorName = editingPost
        ? editingPost.author
        : (visitorSession?.name?.trim() || visitorSession?.email?.trim() || 'Anonymous');

      let response;
      if (editingPost) {
        response = await updateBlogPost(editingPost.id, {
          title,
          content: sanitizeBeforeSave(content),
          author: editingPost.author,
          tags: tags.trim(),
          featured: featured !== undefined ? featured : editingPost.featured,
          pinned: pinned !== undefined ? pinned : editingPost.pinned,
          sort_order: sort_order !== undefined ? sort_order : editingPost.sort_order,
          is_scheduled: isScheduled,
          scheduled_datetime: isScheduled ? scheduled_datetime : null,
        });
      } else {
        response = await createBlogPost({
          title,
          content: sanitizeBeforeSave(content),
          author: authorName,
          tags: tags.trim(),
          featured: featured !== undefined ? featured : false,
          pinned: pinned !== undefined ? pinned : false,
          sort_order: sort_order !== undefined ? sort_order : 0,
          is_scheduled: isScheduled,
          scheduled_datetime: isScheduled ? scheduled_datetime : null,
        });
      }

      if (response.success) {
        const postsResult = await getPublishedPosts(1000, 0);
        if (postsResult.success) setPosts(postsResult.posts);

        if (status === 'draft') {
          setShowDrafts(true);
          addToast('Saved as draft.', 'info');
        } else if (status === 'scheduled') {
          addToast('Post scheduled successfully!', 'success');
        } else {
          addToast('Post published!', 'success');
        }

        setShowEditor(false);
        setEditingPost(null);
      } else {
        addToast(response.error || 'Failed to save post.', 'error');
      }
    } catch (err) {
      console.error('Error saving post:', err);
      addToast('Error saving post. See console for details.', 'error');
    }
  };

  const handleDelete = async (post) => {
    if (!window.confirm('Delete this post permanently?')) return;
    const response = await deleteBlogPost(post.id);
    if (response.success) {
      setPosts(prev => prev.filter(p => p.id !== post.id));
      setArchivedPosts(prev => prev.filter(p => p.id !== post.id));
      addToast('Post deleted.', 'info');
    } else {
      addToast(response.error || 'Failed to delete post.', 'error');
    }
  };

  const handleArchive = async (post) => {
    if (!window.confirm('Archive this post? It will be hidden from the feed but not deleted.')) return;
    let tags = (post.tags || '').split(',').filter(t => !t.trim().startsWith('status:')).join(',');
    tags = tags ? `${tags},status:archived` : 'status:archived';
    const response = await updateBlogPost(post.id, {
      title: post.title, content: post.content, author: post.author,
      tags: tags.trim(), featured: post.featured, pinned: post.pinned,
      sort_order: post.sort_order, is_scheduled: post.is_scheduled,
      scheduled_datetime: post.scheduled_datetime,
    });
    if (response.success) {
      setPosts(prev => prev.filter(p => p.id !== post.id));
      addToast('Post archived.', 'info');
      if (showArchived) loadArchivedPosts();
    } else {
      addToast(response.error || 'Failed to archive post.', 'error');
    }
  };

  const handleUnarchive = async (post) => {
    if (!window.confirm('Restore this post to the public feed?')) return;
    let tags = (post.tags || '').split(',').filter(t => !t.trim().startsWith('status:')).join(',');
    tags = tags ? `${tags},status:published` : 'status:published';
    const response = await updateBlogPost(post.id, {
      title: post.title, content: post.content, author: post.author,
      tags: tags.trim(), featured: post.featured, pinned: post.pinned,
      sort_order: post.sort_order, is_scheduled: post.is_scheduled,
      scheduled_datetime: post.scheduled_datetime,
    });
    if (response.success) {
      setArchivedPosts(prev => prev.filter(p => p.id !== post.id));
      const postsResult = await getPublishedPosts(1000, 0);
      if (postsResult.success) setPosts(postsResult.posts);
      addToast('Post restored to feed.', 'success');
    } else {
      addToast(response.error || 'Failed to unarchive post.', 'error');
    }
  };

  const handleMoveUp = async (post, index) => {
    if (index === 0) return;
    const prevPost = posts[index - 1];
    const response = await updateBlogPost(post.id, {
      title: post.title, content: post.content, author: post.author,
      tags: post.tags, featured: post.featured, pinned: post.pinned,
      sort_order: prevPost.sort_order - 1,
      is_scheduled: post.is_scheduled, scheduled_datetime: post.scheduled_datetime,
    });
    if (response.success) {
      const r = await getPublishedPosts(100, 0);
      if (r.success) setPosts(r.posts);
    } else {
      addToast(response.error || 'Failed to reorder post.', 'error');
    }
  };

  const handleMoveDown = async (post, index) => {
    if (index === posts.length - 1) return;
    const nextPost = posts[index + 1];
    const response = await updateBlogPost(post.id, {
      title: post.title, content: post.content, author: post.author,
      tags: post.tags, featured: post.featured, pinned: post.pinned,
      sort_order: nextPost.sort_order + 1,
      is_scheduled: post.is_scheduled, scheduled_datetime: post.scheduled_datetime,
    });
    if (response.success) {
      const r = await getPublishedPosts(100, 0);
      if (r.success) setPosts(r.posts);
    } else {
      addToast(response.error || 'Failed to reorder post.', 'error');
    }
  };

  // ---- Render states ----

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading posts…</p>
        </div>
      </div>
    );
  }

  if (showEditor) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Breadcrumb / context header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {editingPost ? 'Edit Post' : 'New Post'}
          </h1>
          {visitorSession && !editingPost && (
            <span className="text-sm text-gray-500">
              Posting as <strong>{visitorSession.name}</strong>
            </span>
          )}
        </div>
        <PatchedRichBlogEditor
          initialTitle={editingPost?.title || ''}
          initialContent={editingPost?.content || ''}
          initialFeatured={editingPost?.featured || false}
          initialPinned={editingPost?.pinned || false}
          initialSortOrder={editingPost?.sort_order || 0}
          onSave={handleSavePost}
          onCancel={() => { setShowEditor(false); setEditingPost(null); }}
        />
        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  // ---- Main list view ----

  const currentList = showArchived ? archivedPosts : showDrafts ? drafts : posts;

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} />

      {/* Visitor registration modal */}
      {showVisitorForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User size={20} className="text-blue-600" /> Join to Post
              </h2>
              <button
                onClick={() => setShowVisitorForm(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleVisitorFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                <input
                  type="text"
                  value={visitorData.name}
                  onChange={(e) => setVisitorData({ ...visitorData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <input
                  type="email"
                  value={visitorData.email}
                  onChange={(e) => setVisitorData({ ...visitorData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 bg-blue-50 rounded-lg px-3 py-2">
                Your name will appear on your posts. We use your email to recognise you on return visits.
              </p>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowVisitorForm(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700
                    disabled:bg-gray-300 font-medium transition-colors"
                >
                  {isSubmitting ? 'Joining…' : 'Continue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {visitorSession && (
            <span className="text-sm text-gray-500 mr-1">
              Signed in as <strong>{visitorSession.name}</strong>
            </span>
          )}
          <button
            onClick={() => { setShowDrafts(!showDrafts); setShowArchived(false); }}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              showDrafts
                ? 'bg-gray-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showDrafts ? 'View Published' : 'My Drafts'}
          </button>
          <button
            onClick={() => { setShowArchived(!showArchived); setShowDrafts(false); }}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              showArchived
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showArchived ? 'View Published' : 'Archived'}
          </button>
          <button
            onClick={handleCreateNew}
            className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            + New Post
          </button>
        </div>
      </div>

      {/* Status banners */}
      {showArchived && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
          <p className="text-sm font-semibold text-orange-800">Archived Posts</p>
          <p className="text-xs text-orange-600 mt-0.5">Hidden from the public feed but not deleted</p>
        </div>
      )}
      {showDrafts && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <p className="text-sm font-semibold text-blue-800">My Drafts</p>
          <p className="text-xs text-blue-600 mt-0.5">
            {visitorSession ? `Drafts by ${visitorSession.name}` : 'All drafts (admin view)'}
          </p>
        </div>
      )}

      {/* Error state */}
      {!showArchived && !showDrafts && loadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-800">Failed to load posts</p>
          <p className="text-xs text-red-600 mt-1">{loadError}</p>
        </div>
      )}

      {/* Empty state */}
      {currentList.length === 0 && !loadError && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">
            {showArchived ? 'No archived posts.' : showDrafts ? 'No drafts saved yet.' : 'No posts yet.'}
          </p>
          {!showArchived && !showDrafts && (
            <button
              onClick={handleCreateNew}
              className="mt-4 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Write your first post
            </button>
          )}
        </div>
      )}

      {/* Post list */}
      {currentList.length > 0 && (
        <ul className="space-y-3">
          {currentList.map((post, index) => (
            <li
              key={post.id}
              className={`bg-white rounded-xl shadow-sm border transition-shadow hover:shadow-md ${
                showArchived ? 'border-l-4 border-l-orange-400' :
                showDrafts   ? 'border-l-4 border-l-yellow-400' :
                'border-gray-100'
              }`}
            >
              <div className="flex justify-between items-start gap-4 p-4">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  {/* Reorder controls (published list only) */}
                  {!showArchived && !showDrafts && (
                    <div className="flex flex-col gap-0.5 mt-0.5 flex-shrink-0">
                      <button
                        onClick={() => handleMoveUp(post, index)}
                        disabled={index === 0}
                        className="p-0.5 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => handleMoveDown(post, index)}
                        disabled={index === posts.length - 1}
                        className="p-0.5 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <Link
                        to={`/blog/${post.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate"
                      >
                        {post.title}
                      </Link>
                      {post.pinned && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md font-medium">
                          Pinned
                        </span>
                      )}
                      {post.featured && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-md font-medium">
                          Featured
                        </span>
                      )}
                      {showDrafts && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-md font-medium">
                          Draft
                        </span>
                      )}
                      {showArchived && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-md font-medium">
                          Archived
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(post.created_at).toLocaleDateString()} · {post.author || 'Anonymous'}
                    </p>
                    {post.excerpt && (
                      <div
                        className="mt-1.5 text-sm text-gray-600 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: post.excerpt }}
                      />
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {!showArchived && !showDrafts && (
                    <SocialShareButtons
                      url={`${window.location.origin}/blog/${post.id}`}
                      title={post.title}
                      description={post.excerpt || ''}
                      size="sm"
                      showLabels={false}
                    />
                  )}
                  {showArchived && (
                    <button
                      onClick={() => handleUnarchive(post)}
                      className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      Restore
                    </button>
                  )}
                  {!showArchived && (
                    <button
                      onClick={() => handleArchive(post)}
                      className="px-2.5 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                    >
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(post)}
                    className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post)}
                    className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
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
