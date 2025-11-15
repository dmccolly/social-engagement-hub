import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle } from 'lucide-react';

const BlogWidget = ({ settings = {} }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/xano/asset');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const assets = await response.json();
        
        // Filter to only blog posts (category_id === 11)
        const blogPosts = assets.filter(asset => asset.category_id === 11);
        
        const sortedPosts = blogPosts.sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          
          if (a.sort_order !== undefined && b.sort_order !== undefined) {
            if (a.sort_order !== b.sort_order) {
              return a.sort_order - b.sort_order;
            }
          }
          
          return new Date(b.created_at) - new Date(a.created_at);
        });
        
        const limitedPosts = sortedPosts.slice(0, settings.postCount || 5);
        
        setPosts(limitedPosts);
        setError('');
      } catch (err) {
        console.error('Error loading blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [settings.postCount]);

  const extractImage = (html) => {
    if (!html) return null;
    try {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const img = tmp.querySelector('img');
      return img ? img.src : null;
    } catch (e) {
      return null;
    }
  };

  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const createExcerpt = (content, maxLength = 200) => {
    const text = stripHtml(content);
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const canonicalBase = settings.canonical || window.location.origin;

  if (loading) {
    return (
      <div 
        className="bg-white rounded-lg shadow-lg overflow-hidden"
        style={{ borderRadius: `${settings.borderRadius || 8}px` }}
      >
        <div 
          className="p-6 text-white font-bold text-2xl"
          style={{ backgroundColor: settings.headerColor || '#2563eb' }}
        >
          {settings.headerText || '📋 Latest Blog Posts'}
        </div>
        <div className="p-6 flex items-center justify-center">
          <Loader className="animate-spin text-blue-600" size={32} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="bg-white rounded-lg shadow-lg overflow-hidden"
        style={{ borderRadius: `${settings.borderRadius || 8}px` }}
      >
        <div 
          className="p-6 text-white font-bold text-2xl"
          style={{ backgroundColor: settings.headerColor || '#2563eb' }}
        >
          {settings.headerText || '📋 Latest Blog Posts'}
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div 
        className="bg-white rounded-lg shadow-lg overflow-hidden"
        style={{ borderRadius: `${settings.borderRadius || 8}px` }}
      >
        <div 
          className="p-6 text-white font-bold text-2xl"
          style={{ backgroundColor: settings.headerColor || '#2563eb' }}
        >
          {settings.headerText || '📋 Latest Blog Posts'}
        </div>
        <div className="p-6 text-center text-gray-600">
          No blog posts found.
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden"
      style={{ borderRadius: `${settings.borderRadius || 8}px` }}
    >
      <div 
        className="p-6 text-white font-bold text-2xl"
        style={{ backgroundColor: settings.headerColor || '#2563eb' }}
      >
        {settings.headerText || '📋 Latest Blog Posts'}
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {posts.map((post) => {
            const imageUrl = settings.showImages !== false ? extractImage(post.description) : null;
            const excerpt = createExcerpt(post.description, 200);
            const date = new Date(post.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            return (
              <div key={post.id} className="border-b pb-6 last:border-b-0">
                {imageUrl && (
                  <img 
                    src={imageUrl}
                    alt={post.title || 'Blog post image'}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {post.title || 'Untitled'}
                  </h3>
                  {post.is_featured && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                      FEATURED
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  {post.submitted_by || 'Unknown'} • {date}
                </p>
                <p className="text-gray-600 mb-3">
                  {excerpt}
                </p>
                <a 
                  href={`${canonicalBase}/blog-post.html?id=${post.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
                >
                  Read More →
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BlogWidget;
