import React, { useState, useEffect } from 'react';
import { FileText, Mail, ArrowRight, Check } from 'lucide-react';
import { getPublishedPosts } from '../../services/xanoService';

const BlogToEmailConverter = ({ onConvert, onCancel }) => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emailSettings, setEmailSettings] = useState({
    includeImages: true,
    includeExcerpt: true,
    addCallToAction: true,
    ctaText: 'Read Full Article',
    ctaUrl: ''
  });

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    setIsLoading(true);
    try {
      const result = await getPublishedPosts();
      if (result.success) setBlogPosts(result.posts || []);
    } catch (error) {
      console.error('Failed to load blog posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const convertToEmail = () => {
    if (!selectedPost) return;
    const emailBlocks = [];
    emailBlocks.push({ id: Date.now(), type: 'heading', content: { text: selectedPost.title, level: 1 } });
    if (emailSettings.includeExcerpt && selectedPost.excerpt) emailBlocks.push({ id: Date.now() + 1, type: 'text', content: { text: selectedPost.excerpt } });
    if (emailSettings.includeImages && selectedPost.featured_image) emailBlocks.push({ id: Date.now() + 2, type: 'image', content: { src: selectedPost.featured_image, alt: selectedPost.title } });
    if (selectedPost.content) emailBlocks.push({ id: Date.now() + 3, type: 'text', content: { text: selectedPost.content } });
    if (emailSettings.addCallToAction) emailBlocks.push({ id: Date.now() + 4, type: 'button', content: { text: emailSettings.ctaText, url: emailSettings.ctaUrl || `https://yourblog.com/posts/${selectedPost.id}`, color: '#2563eb' } });
    const campaignData = { name: `Newsletter: ${selectedPost.title}`, subject: selectedPost.title, fromName: 'Your Blog', fromEmail: 'blog@yourcompany.com', blocks: emailBlocks };
    onConvert(campaignData);
  };

  if (isLoading) return <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Loading blog posts...</p></div>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2"><FileText className="text-blue-600" />Convert Blog Post to Email</h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Select Blog Post</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {blogPosts.length === 0 ? <p className="text-gray-500 text-center py-8">No published blog posts found</p> : blogPosts.map(post => (
              <div key={post.id} onClick={() => setSelectedPost(post)} className={`p-4 border rounded-lg cursor-pointer transition ${selectedPost?.id === post.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                {post.featured_image && <img src={post.featured_image} alt={post.title} className="w-full h-32 object-cover rounded mb-2" />}
                <h4 className="font-semibold">{post.title}</h4>
                {post.excerpt && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.excerpt}</p>}
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <span>{new Date(post.published_at).toLocaleDateString()}</span>
                  {selectedPost?.id === post.id && <Check size={16} className="text-blue-600 ml-auto" />}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Email Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-2"><input type="checkbox" checked={emailSettings.includeImages} onChange={(e) => setEmailSettings({...emailSettings, includeImages: e.target.checked})} className="rounded" /><span>Include featured image</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={emailSettings.includeExcerpt} onChange={(e) => setEmailSettings({...emailSettings, includeExcerpt: e.target.checked})} className="rounded" /><span>Include excerpt</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={emailSettings.addCallToAction} onChange={(e) => setEmailSettings({...emailSettings, addCallToAction: e.target.checked})} className="rounded" /><span>Add call-to-action button</span></label>
            {emailSettings.addCallToAction && (
              <div className="ml-6 space-y-2">
                <div><label className="block text-sm font-medium mb-1">Button Text</label><input type="text" value={emailSettings.ctaText} onChange={(e) => setEmailSettings({...emailSettings, ctaText: e.target.value})} className="w-full p-2 border rounded" /></div>
                <div><label className="block text-sm font-medium mb-1">Button URL (optional)</label><input type="text" value={emailSettings.ctaUrl} onChange={(e) => setEmailSettings({...emailSettings, ctaUrl: e.target.value})} placeholder="Leave empty for auto-generated URL" className="w-full p-2 border rounded" /></div>
              </div>
            )}
            {selectedPost && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">Preview</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Subject:</strong> {selectedPost.title}</p>
                  <p><strong>Blocks:</strong> {1 + (emailSettings.includeExcerpt ? 1 : 0) + (emailSettings.includeImages ? 1 : 0) + 1 + (emailSettings.addCallToAction ? 1 : 0)} content blocks</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onCancel} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
        <button onClick={convertToEmail} disabled={!selectedPost} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"><Mail size={18} />Convert to Email<ArrowRight size={18} /></button>
      </div>
    </div>
  );
};

export default BlogToEmailConverter;
