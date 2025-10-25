import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';

/**
 * Updated BlogPostView component
 *
 * This version extends the original BlogPostView by improving how
 * previously saved blog content is decoded and rendered. Some older
 * posts were created with an editor that wrapped images in a
 * <div class="image-wrapper-resizable"> along with resize handles and
 * floating toolbars. When rendered, these wrappers showed up as
 * literal HTML at the top of the post. The new decodeHtmlEntities
 * function not only decodes HTML entities but also strips out these
 * wrappers and any stray resize/toolbars, leaving only the actual
 * <img> elements. All other functionality and styling are preserved.
 */
const BlogPostView = ({ posts }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Decode HTML entities and remove obsolete wrappers.
   *
   * The original implementation simply created a textarea to decode
   * &lt; &gt; and &quot; sequences. We keep that behaviour but extend it
   * with a cleanup step: any <div> with the class
   * "image-wrapper-resizable" is unwrapped so only its children (the
   * <img> tags) remain. We also strip any <span> with class
   * "resize-handle" and any floating toolbar that may have been
   * inadvertently saved. This prevents stray HTML from appearing at
   * the top of posts.
   */
  const decodeHtmlEntities = (text) => {
    if (!text) return text;
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    let decoded = textarea.value;

    // Some posts may be doubly encoded; decode twice if necessary
    if (decoded.includes('&lt;') || decoded.includes('&gt;') || decoded.includes('&quot;')) {
      textarea.innerHTML = decoded;
      decoded = textarea.value;
    }

    // Remove wrappers and resize/toolbars while preserving images
    try {
      // Unwrap <div class="image-wrapper-resizable">...<\/div> preserving inner content
      decoded = decoded.replace(/<div class=\"image-wrapper-resizable\"[^>]*>([\s\S]*?)<\/div>/g, '$1');
      // Remove any <span class="resize-handle ...">...</span>
      decoded = decoded.replace(/<span class=\"resize-handle[^>]*>[\s\S]*?<\/span>/g, '');
      // Remove any floating toolbar that might have been saved
      decoded = decoded.replace(/<div id=\"floating-toolbar[^>]*>[\s\S]*?<\/div>/g, '');
    } catch (err) {
      // If a regex fails, log the error but still return the decoded string
      console.error('Error stripping wrapper markup:', err);
    }

    return decoded;
  };

  useEffect(() => {
    const loadPost = async () => {
      setIsLoading(true);

      // If posts are provided as props, try to find the post locally
      if (posts && posts.length > 0) {
        const foundPost = posts.find((p) => p.id === parseInt(id));
        if (foundPost) {
          setPost(foundPost);
          setIsLoading(false);
          return;
        }
      }

      // Otherwise fetch the post from Xano
      try {
        const response = await fetch(`${process.env.REACT_APP_XANO_BASE_URL}/blog_posts/${id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.post) {
            setPost(data.post);
          } else {
            setPost(null);
          }
        } else {
          setPost(null);
        }
      } catch (error) {
        console.error('Error loading post:', error);
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [id, posts]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post Not Found</h1>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft size={20} /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={20} /> Back to Blog
          </button>
        </div>
      </header>

      {/* Post Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Featured Image */}
          {post.featured_image && (
            <div className="w-full h-96 overflow-hidden">
              <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Post Header */}
          <div className="p-8">
            <div className="mb-6">
              {post.category && (
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-4">
                  {post.category}
                </span>
              )}

              <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User size={16} /> <span>{post.author || 'Admin'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <time>
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>

                {post.reading_time && (
                  <div className="flex items-center gap-2">
                    <Clock size={16} /> <span>{post.reading_time} min read</span>
                  </div>
                )}
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Post Excerpt */}
            {post.excerpt && (
              <div className="mb-6 p-4 bg-gray-50 border-l-4 border-blue-600 rounded">
                <p className="text-lg text-gray-700 italic">{post.excerpt}</p>
              </div>
            )}

            {/* Post Content */}
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(post.content) }}
              style={{
                lineHeight: '1.8',
                fontSize: '18px',
                color: '#374151',
              }}
            />
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <ArrowLeft size={20} /> Back to All Posts
          </button>
        </div>
      </article>

      {/* Prose styling for content */}
      <style>{`
        .prose img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1.5rem 0;
        }
        .prose img.size-small {
          width: 200px;
        }
        .prose img.size-medium {
          width: 400px;
        }
        .prose img.size-large {
          width: 600px;
        }
        .prose img.size-full {
          width: 100%;
        }
        .prose img.position-left {
          float: left;
          margin: 0 15px 15px 0;
          clear: left;
        }
        .prose img.position-right {
          float: right;
          margin: 0 0 15px 15px;
          clear: right;
        }
        .prose img.position-center {
          display: block;
          margin: 15px auto;
          float: none;
        }
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 700;
          line-height: 1.3;
          color: #111827;
        }
        .prose h2 {
          font-size: 2rem;
        }
        .prose h3 {
          font-size: 1.5rem;
        }
        .prose p {
          margin-bottom: 1.5rem;
        }
        .prose a {
          color: #2563eb;
          text-decoration: underline;
        }
        .prose a:hover {
          color: #1d4ed8;
        }
        .prose ul, .prose ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }
        .prose li {
          margin-bottom: 0.5rem;
        }
        .prose blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #6b7280;
        }
        .prose code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.9em;
          font-family: 'Courier New', monospace;
        }
        .prose pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        .prose pre code {
          background-color: transparent;
          padding: 0;
          color: inherit;
        }
      `}</style>
    </div>
  );
};

export default BlogPostView;
