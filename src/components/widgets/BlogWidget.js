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
        
        // Filter to only blog posts (category_id === 11) and exclude drafts/archived
        const blogPosts = assets.filter(asset => {
          if (asset.category_id !== 11) return false;
          const tags = asset.tags || '';
          if (tags.includes('status:draft') || tags.includes('status:archived')) return false;
          return true;
        });
        
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

  /**
   * Extract first video embed (YouTube or Vimeo) from HTML content
   * Returns video thumbnail URL if found, null otherwise
   */
  const extractVideoThumbnail = (html) => {
    if (!html) return null;
    try {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      
      // Look for YouTube iframe
      const youtubeIframe = tmp.querySelector('iframe[src*="youtube.com"], iframe[src*="youtu.be"]');
      if (youtubeIframe) {
        const src = youtubeIframe.getAttribute('src');
        // Extract video ID from YouTube URL
        const videoIdMatch = src.match(/(?:embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (videoIdMatch && videoIdMatch[1]) {
          return `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
        }
      }
      
      // Look for Vimeo iframe
      const vimeoIframe = tmp.querySelector('iframe[src*="vimeo.com"]');
      if (vimeoIframe) {
        const src = vimeoIframe.getAttribute('src');
        const videoIdMatch = src.match(/vimeo\.com\/video\/(\d+)/);
        if (videoIdMatch && videoIdMatch[1]) {
          // Note: Vimeo thumbnails require an API call, so we'll use a placeholder
          // For production, you'd want to fetch this from Vimeo's API
          return `https://vumbnail.com/${videoIdMatch[1]}.jpg`;
        }
      }
      
      return null;
    } catch (e) {
      console.error('Error extracting video thumbnail:', e);
      return null;
    }
  };

  /**
   * Extract first image from HTML content
   */
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

  /**
   * Get the best preview media for a post
   * Priority: Video thumbnail > First image > null
   */
  const getPreviewMedia = (html) => {
    if (!html) return null;
    
    // Try video thumbnail first
    const videoThumb = extractVideoThumbnail(html);
    if (videoThumb) return videoThumb;
    
    // Fall back to first image
    return extractImage(html);
  };

  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  /**
   * Extract the first paragraph from HTML content
   * This ensures we show the actual first paragraph, not random text
   */
  const createExcerpt = (content, maxLength = 200) => {
    if (!content) return '';
    
    try {
      const tmp = document.createElement('div');
      tmp.innerHTML = content;
      
      // Find all <p> tags and get the first one with actual TEXT content
      // Skip paragraphs that only contain iframes, videos, or other embedded media
      const allParagraphs = tmp.querySelectorAll('p');
      for (let i = 0; i < allParagraphs.length; i++) {
        const para = allParagraphs[i];
        
        // Check if this paragraph contains only iframes/videos
        const hasIframe = para.querySelector('iframe');
        const hasVideo = para.querySelector('video');
        
        // Get the text content
        const text = para.textContent || para.innerText || '';
        const trimmedText = text.trim();
        
        // Skip if:
        // 1. Paragraph is empty
        // 2. Paragraph only contains iframe/video (no meaningful text)
        if (trimmedText.length === 0) continue;
        if ((hasIframe || hasVideo) && trimmedText.length < 20) continue;
        
        // Found the first paragraph with actual text content!
        if (trimmedText.length <= maxLength) return trimmedText;
        return trimmedText.substring(0, maxLength).trim() + '...';
      }
      
      // Fallback: get all text content and find first meaningful paragraph
      const allText = tmp.textContent || tmp.innerText || '';
      const lines = allText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      if (lines.length > 0) {
        const firstLine = lines[0];
        if (firstLine.length <= maxLength) return firstLine;
        return firstLine.substring(0, maxLength).trim() + '...';
      }
      
      return '';
    } catch (e) {
      console.error('Error creating excerpt:', e);
      const text = stripHtml(content);
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength).trim() + '...';
    }
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
            // Get preview media (video thumbnail or image)
            const previewUrl = settings.showImages !== false ? getPreviewMedia(post.description) : null;
            const excerpt = createExcerpt(post.description, 500);
            const date = new Date(post.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            return (
              <div key={post.id} className="border-b pb-6 last:border-b-0">
                {previewUrl && (
                  <div className="relative mb-4">
                    <img 
                      src={previewUrl}
                      alt={post.title || 'Blog post preview'}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        // If video thumbnail fails to load, try to get a regular image instead
                        e.target.style.display = 'none';
                      }}
                    />
                    {/* Add play button overlay if it's a video thumbnail */}
                    {previewUrl.includes('youtube.com') || previewUrl.includes('vumbnail.com') ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black bg-opacity-60 rounded-full p-4">
                          <svg 
                            className="w-12 h-12 text-white" 
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    ) : null}
                  </div>
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
