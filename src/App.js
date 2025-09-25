import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  Home, MessageSquare, FileText, Mail, Users, Calendar, BarChart3, Settings,
  Plus, Send, Clock, Edit, Trash2, Heart, MessageCircle, Bookmark, 
  Star, Eye, EyeOff, Copy, Check
} from 'lucide-react';

// Standalone Blog Widget Component
const StandaloneBlogWidget = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');
  
  const urlParams = new URLSearchParams(window.location.search);
  const settingsParam = urlParams.get('settings');
  const settings = settingsParam ? JSON.parse(decodeURIComponent(settingsParam)) : {
    primaryColor: '#3b82f6',
    backgroundColor: 'transparent',
    maxPosts: 5,
    showImages: true,
    showDates: true,
    showExcerpts: true,
    borderRadius: 8,
    headerText: '📝 Latest Blog Posts'
  };

  // Load published posts from localStorage with enhanced cross-origin handling
  useEffect(() => {
    const loadPosts = () => {
      try {
        setIsLoading(true);
        let debugMessages = [];
        
        // Try multiple localStorage keys for compatibility
        const possibleKeys = ['socialHubPosts', 'blogPosts', 'posts'];
        let foundPosts = [];
        
        for (const key of possibleKeys) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed) && parsed.length > 0) {
                foundPosts = parsed.filter(post => post.published);
                debugMessages.push(`✅ Found ${foundPosts.length} published posts from key: ${key}`);
                break;
              }
            }
          } catch (e) {
            debugMessages.push(`❌ Error reading ${key}: ${e.message}`);
          }
        }
        
        // If no posts found, create sample posts
        if (foundPosts.length === 0) {
          foundPosts = [
            {
              id: 1,
              title: 'Welcome to Our Blog',
              content: 'This is a featured post showcasing our latest updates and news. Stay tuned for more exciting content!',
              date: '9/24/2025',
              featured: true,
              published: true
            },
            {
              id: 2,
              title: 'Getting Started Guide',
              content: 'Learn how to make the most of our platform with this comprehensive getting started guide.',
              date: '9/23/2025',
              featured: false,
              published: true
            }
          ];
          debugMessages.push(`🔄 Created ${foundPosts.length} sample posts`);
        }
        
        setPosts(foundPosts.slice(0, settings.maxPosts));
        setDebugInfo(debugMessages.join(' | '));
        setIsLoading(false);
        
      } catch (error) {
        console.error('Error loading posts:', error);
        setDebugInfo(`❌ Error: ${error.message}`);
        setIsLoading(false);
      }
    };

    loadPosts();
    
    // Listen for storage events to update when posts change
    const handleStorageChange = (e) => {
      if (e.key && e.key.includes('Posts')) {
        loadPosts();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Refresh every 5 seconds to catch updates
    const interval = setInterval(loadPosts, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [settings.maxPosts]);

  if (isLoading) {
    return (
      <div style={{ 
        backgroundColor: settings.backgroundColor,
        borderRadius: `${settings.borderRadius}px`,
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ color: settings.primaryColor, fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
          {settings.headerText}
        </div>
        <div style={{ color: '#666', fontSize: '14px' }}>Loading posts...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: settings.backgroundColor,
      borderRadius: `${settings.borderRadius}px`,
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '600px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Widget Header */}
      <div style={{ 
        color: settings.primaryColor, 
        fontSize: '24px', 
        fontWeight: 'bold', 
        marginBottom: '24px',
        borderBottom: `3px solid ${settings.primaryColor}`,
        paddingBottom: '12px',
        textAlign: 'center'
      }}>
        {settings.headerText}
      </div>

      {/* Posts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {posts.map(post => (
          <article key={post.id} style={{
            padding: '20px',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            background: post.featured 
              ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' 
              : '#ffffff',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}>
            {/* Featured Badge */}
            {post.featured && (
              <div style={{
                display: 'inline-block',
                backgroundColor: '#f59e0b',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                padding: '6px 12px',
                borderRadius: '16px',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                ⭐ FEATURED
              </div>
            )}
            
            {/* Post Image */}
            {settings.showImages && post.image && (
              <div style={{ marginBottom: '16px' }}>
                <img 
                  src={post.image} 
                  alt={post.title}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            {/* Post Title */}
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '12px',
              lineHeight: '1.3',
              fontFamily: 'Georgia, serif'
            }}>
              {post.title}
            </h3>
            
            {/* Post Date */}
            {settings.showDates && (
              <div style={{
                fontSize: '13px',
                color: '#6b7280',
                marginBottom: '12px',
                fontWeight: '500'
              }}>
                📅 {post.date}
              </div>
            )}
            
            {/* Post Content - Magazine Style Excerpt */}
            {settings.showExcerpts && (
              <div style={{
                fontSize: '15px',
                color: '#374151',
                lineHeight: '1.6',
                marginBottom: '16px',
                fontFamily: 'Georgia, serif'
              }}>
                {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
              </div>
            )}
            
            {/* Read More Link */}
            <div style={{
              borderTop: '1px solid #e5e7eb',
              paddingTop: '12px',
              textAlign: 'right'
            }}>
              <a 
                href="#" 
                style={{
                  color: settings.primaryColor,
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
              >
                Read Full Article →
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

// Standalone Calendar Widget Component
const StandaloneCalendarWidget = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const settingsParam = urlParams.get('settings');
  const settings = settingsParam ? JSON.parse(decodeURIComponent(settingsParam)) : {
    primaryColor: '#8b5cf6',
    backgroundColor: 'transparent',
    maxEvents: 5,
    showTime: true,
    showEventTypes: true,
    borderRadius: 8,
    headerText: '📅 Upcoming Events'
  };

  // Sample calendar events for the widget
  const calendarEvents = [
    {
      id: 1,
      title: 'Community Meetup',
      date: '2025-09-25',
      time: '2:00 PM',
      type: 'event'
    },
    {
      id: 2,
      title: 'Product Launch',
      date: '2025-09-26',
      time: '10:00 AM',
      type: 'announcement'
    },
    {
      id: 3,
      title: 'Weekly Newsletter',
      date: '2025-09-27',
      time: '9:00 AM',
      type: 'newsletter'
    },
    {
      id: 4,
      title: 'Team Workshop',
      date: '2025-09-28',
      time: '3:00 PM',
      type: 'event'
    },
    {
      id: 5,
      title: 'Monthly Review',
      date: '2025-09-30',
      time: '11:00 AM',
      type: 'announcement'
    }
  ].slice(0, settings.maxEvents);

  const getEventIcon = (type) => {
    switch (type) {
      case 'event': return '🎉';
      case 'announcement': return '📢';
      case 'newsletter': return '📧';
      default: return '📅';
    }
  };

  return (
    <div style={{ 
      backgroundColor: settings.backgroundColor,
      borderRadius: `${settings.borderRadius}px`,
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '400px'
    }}>
      {/* Widget Header */}
      <div style={{ 
        color: settings.primaryColor, 
        fontSize: '18px', 
        fontWeight: 'bold', 
        marginBottom: '16px',
        borderBottom: `2px solid ${settings.primaryColor}`,
        paddingBottom: '8px'
      }}>
        {settings.headerText}
      </div>

      {/* Events */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {calendarEvents.map(event => (
          <div key={event.id} style={{
            padding: '12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* Event Icon */}
            {settings.showEventTypes && (
              <div style={{ fontSize: '20px' }}>
                {getEventIcon(event.type)}
              </div>
            )}
            
            {/* Event Details */}
            <div style={{ flex: 1 }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '4px'
              }}>
                {event.title}
              </h4>
              <div style={{
                fontSize: '12px',
                color: '#6b7280'
              }}>
                {event.date} {settings.showTime && event.time && `• ${event.time}`}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Widget Footer */}
      <div style={{
        marginTop: '16px',
        textAlign: 'center',
        fontSize: '11px',
        color: '#9ca3af'
      }}>
        Powered by Social Hub
      </div>
    </div>
  );
};

// Standalone News Feed Widget Component
const StandaloneNewsFeedWidget = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const settingsParam = urlParams.get('settings');
  const settings = settingsParam ? JSON.parse(decodeURIComponent(settingsParam)) : {
    primaryColor: '#10b981',
    backgroundColor: 'transparent',
    maxPosts: 5,
    showReplies: true,
    showAvatars: true,
    borderRadius: 8,
    headerText: '💬 Community Feed'
  };

  // Sample news feed posts
  const feedPosts = [
    {
      id: 1,
      author: 'John Smith',
      avatar: 'JS',
      content: 'Excited to share our latest project updates! The new features are looking amazing.',
      timestamp: '2 hours ago',
      likes: 12,
      comments: 3
    },
    {
      id: 2,
      author: 'Sarah Johnson',
      avatar: 'SJ',
      content: 'Thanks everyone for the warm welcome! Looking forward to contributing to this community.',
      timestamp: '4 hours ago',
      likes: 8,
      comments: 1
    },
    {
      id: 3,
      author: 'Mike Chen',
      avatar: 'MC',
      content: 'Just finished reading the latest blog post. Great insights on the future of our platform!',
      timestamp: '6 hours ago',
      likes: 15,
      comments: 5
    }
  ].slice(0, settings.maxPosts);

  return (
    <div style={{ 
      backgroundColor: settings.backgroundColor,
      borderRadius: `${settings.borderRadius}px`,
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '400px'
    }}>
      {/* Widget Header */}
      <div style={{ 
        color: settings.primaryColor, 
        fontSize: '18px', 
        fontWeight: 'bold', 
        marginBottom: '16px',
        borderBottom: `2px solid ${settings.primaryColor}`,
        paddingBottom: '8px'
      }}>
        {settings.headerText}
      </div>

      {/* Feed Posts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {feedPosts.map(post => (
          <div key={post.id} style={{
            padding: '16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#ffffff'
          }}>
            {/* Post Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              {settings.showAvatars && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: settings.primaryColor,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {post.avatar}
                </div>
              )}
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937' }}>
                  {post.author}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {post.timestamp}
                </div>
              </div>
            </div>
            
            {/* Post Content */}
            <p style={{
              fontSize: '14px',
              color: '#4b5563',
              lineHeight: '1.5',
              marginBottom: '12px'
            }}>
              {post.content}
            </p>
            
            {/* Post Actions */}
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280' }}>
              <span>❤️ {post.likes}</span>
              {settings.showReplies && <span>💬 {post.comments}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Widget Footer */}
      <div style={{
        marginTop: '16px',
        textAlign: 'center',
        fontSize: '11px',
        color: '#9ca3af'
      }}>
        Powered by Social Hub
      </div>
    </div>
  );
};

  // Main App Component
const MainApp = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [contentType, setContentType] = useState('post');
  const [posts, setPosts] = useState(() => {
    const savedPosts = localStorage.getItem('socialHubPosts');
    return savedPosts ? JSON.parse(savedPosts) : [
      { 
        id: 1, 
        title: 'Welcome to Our Platform', 
        content: 'This is a featured post showcasing our latest updates and news. Stay tuned for more exciting content!', 
        date: '9/23/2025', 
        featured: true, 
        published: true,
        image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=200&fit=crop'
      },
      { 
        id: 2, 
        title: 'Latest Updates', 
        content: 'Check out our new features and improvements that make our platform even better for your needs.', 
        date: '9/23/2025', 
        featured: false, 
        published: true,
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop'
      }
    ];
  });

  // Save posts to localStorage whenever posts change
  useEffect(() => {
    localStorage.setItem('socialHubPosts', JSON.stringify(posts));
  }, [posts]);

  const [members] = useState([
    { id: 1, name: 'John Smith', email: 'john.smith@example.com', role: 'admin', status: 'active', joinDate: '2025-09-15' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah.johnson@example.com', role: 'moderator', status: 'active', joinDate: '2025-09-18' },
    { id: 3, name: 'Mike Chen', email: 'mike.chen@example.com', role: 'member', status: 'pending', joinDate: '2025-09-22' },
    { id: 4, name: 'Emily Davis', email: 'emily.davis@example.com', role: 'member', status: 'active', joinDate: '2025-09-20' }
  ]);

  // Navigation items
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'newsfeed', icon: MessageSquare, label: 'News Feed' },
    { id: 'posts', icon: FileText, label: 'Blog Posts' },
    { id: 'campaigns', icon: Mail, label: 'Email Campaigns' },
    { id: 'members', icon: Users, label: 'Members' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  // Widget Creator State
  const [selectedWidget, setSelectedWidget] = useState('blog');
  const [widgetConfig, setWidgetConfig] = useState({
    blog: {
      primaryColor: '#3b82f6',
      backgroundColor: 'transparent',
      maxPosts: 5,
      showImages: true,
      showDates: true,
      showExcerpts: true,
      borderRadius: 8,
      headerText: '📝 Latest Blog Posts'
    },
    calendar: {
      primaryColor: '#8b5cf6',
      backgroundColor: 'transparent',
      maxEvents: 5,
      showTime: true,
      showEventTypes: true,
      borderRadius: 8,
      headerText: '📅 Upcoming Events'
    },
    newsfeed: {
      primaryColor: '#10b981',
      backgroundColor: 'transparent',
      maxPosts: 5,
      showReplies: true,
      showAvatars: true,
      borderRadius: 8,
      headerText: '💬 Community Feed'
    }
  });

  const [copiedCode, setCopiedCode] = useState('');

  // Generate embed code
  const generateEmbedCode = (type = 'standard') => {
    const config = widgetConfig[selectedWidget];
    const baseUrl = window.location.origin;
    const widgetUrl = `${baseUrl}/widget/${selectedWidget}?settings=${encodeURIComponent(JSON.stringify(config))}`;
    
    if (type === 'direct') {
      return widgetUrl;
    }
    
    const width = type === 'responsive' ? '100%' : '400';
    const height = '600';
    
    if (type === 'responsive') {
      return `<div style="position: relative; width: 100%; max-width: 400px; height: 600px;">
  <iframe 
    src="${widgetUrl}" 
    width="100%" 
    height="100%"
    frameborder="0"
    style="border-radius: ${config.borderRadius}px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"
    title="${config.headerText}">
  </iframe>
</div>`;
    }
    
    return `<iframe 
  src="${widgetUrl}" 
  width="${width}" 
  height="${height}"
  frameborder="0"
  style="border-radius: ${config.borderRadius}px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"
  title="${config.headerText}">
</iframe>`;
  };

  // Copy to clipboard
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  // Delete post function
  const deletePost = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  // Toggle post featured status
  const toggleFeatured = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, featured: !post.featured } : post
    ));
  };

  // Toggle post published status
  const togglePublished = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, published: !post.published } : post
    ));
  };

  // Edit post function
  const editPost = (post) => {
    setEditingPost(post);
    setIsEditing(true);
    setContentType('post');
  };

  // Update post function
  const updatePost = (updatedPost) => {
    setPosts(posts.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
    setIsEditing(false);
    setEditingPost(null);
  };

  // Create new post function
  const createPost = (newPost) => {
    const post = {
      ...newPost,
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      featured: false,
      published: false
    };
    setPosts([post, ...posts]);
    setIsCreating(false);
  };

  // Post Editor Component
  const PostEditor = ({ post, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      title: post?.title || '',
      content: post?.content || '',
      image: post?.image || '',
      featured: post?.featured || false,
      published: post?.published || false
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (formData.title.trim() && formData.content.trim()) {
        onSave(post ? { ...post, ...formData } : formData);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            {post ? 'Edit Post' : 'Create New Post'}
          </h1>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
          >
            Cancel
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter post title..."
                required
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image URL
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
              {formData.image && (
                <div className="mt-2">
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="w-32 h-20 object-cover rounded border"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write your post content here..."
                required
              />
            </div>

            {/* Options */}
            <div className="flex gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="featured" className="text-sm text-gray-700">
                  ⭐ Featured Post
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="published" className="text-sm text-gray-700">
                  📢 Publish Immediately
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {post ? 'Update Post' : 'Create Post'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Dashboard Component
  const Dashboard = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Social Engagement Hub</h2>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => { setContentType('post'); setIsCreating(true); }}
          className="p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-3"
        >
          <Plus size={24} />
          Create Post
        </button>
        <button
          onClick={() => setActiveSection('settings')}
          className="p-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-3"
        >
          <Settings size={24} />
          Widget Creator
        </button>
        <button
          onClick={() => { setContentType('schedule'); setIsCreating(true); }}
          className="p-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-3"
        >
          <Clock size={24} />
          Schedule Content
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600">Total Posts</h3>
          <p className="text-2xl font-bold text-blue-600">{posts.length}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600">Featured Posts</h3>
          <p className="text-2xl font-bold text-orange-600">{posts.filter(p => p.featured).length}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600">Total Members</h3>
          <p className="text-2xl font-bold text-purple-600">{members.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600">Published Posts</h3>
          <p className="text-2xl font-bold text-green-600">{posts.filter(p => p.published).length}</p>
        </div>
      </div>

      {/* Featured Posts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          ⭐ Featured Posts
        </h3>
        {posts.filter(post => post.featured).length === 0 ? (
          <p className="text-gray-500">No featured posts yet.</p>
        ) : (
          posts.filter(post => post.featured).map(post => (
            <div key={post.id} className="border rounded-lg p-4 mb-4 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full font-medium">
                  ⭐ FEATURED POST
                </span>
              </div>
              <h4 className="font-semibold text-gray-900">{post.title}</h4>
              <p className="text-gray-600 text-sm mt-1">{post.content}</p>
              <p className="text-xs text-gray-500 mt-2">📅 {post.date}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Settings Component - Widget Creator
  const WidgetCreator = () => (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Settings size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Widget Creator</h1>
            <p className="text-gray-600">Create and customize embeddable widgets for your website</p>
          </div>
        </div>
      </div>

      {/* Widget Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">🎨 Select Widget Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'blog', name: 'Blog Posts', icon: '📝', description: 'Display latest blog posts' },
            { id: 'calendar', name: 'Calendar Events', icon: '📅', description: 'Show upcoming events' },
            { id: 'newsfeed', name: 'News Feed', icon: '💬', description: 'Community posts and updates' }
          ].map(widget => (
            <button
              key={widget.id}
              onClick={() => setSelectedWidget(widget.id)}
              className={`p-4 border-2 rounded-lg text-left transition ${
                selectedWidget === widget.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{widget.icon}</div>
              <h3 className="font-semibold text-gray-900">{widget.name}</h3>
              <p className="text-sm text-gray-600">{widget.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Widget Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">⚙️ Widget Settings</h3>
          
          <div className="space-y-4">
            {/* Header Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Header Text</label>
              <input
                type="text"
                value={widgetConfig[selectedWidget].headerText}
                onChange={(e) => setWidgetConfig(prev => ({
                  ...prev,
                  [selectedWidget]: { ...prev[selectedWidget], headerText: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={widgetConfig[selectedWidget].primaryColor}
                  onChange={(e) => setWidgetConfig(prev => ({
                    ...prev,
                    [selectedWidget]: { ...prev[selectedWidget], primaryColor: e.target.value }
                  }))}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={widgetConfig[selectedWidget].primaryColor}
                  onChange={(e) => setWidgetConfig(prev => ({
                    ...prev,
                    [selectedWidget]: { ...prev[selectedWidget], primaryColor: e.target.value }
                  }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Max Items */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {selectedWidget === 'blog' ? 'Max Posts' : selectedWidget === 'calendar' ? 'Max Events' : 'Max Posts'}
              </label>
              <select
                value={selectedWidget === 'blog' ? widgetConfig[selectedWidget].maxPosts : 
                       selectedWidget === 'calendar' ? widgetConfig[selectedWidget].maxEvents : 
                       widgetConfig[selectedWidget].maxPosts}
                onChange={(e) => {
                  const key = selectedWidget === 'calendar' ? 'maxEvents' : 'maxPosts';
                  setWidgetConfig(prev => ({
                    ...prev,
                    [selectedWidget]: { ...prev[selectedWidget], [key]: parseInt(e.target.value) }
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            {/* Border Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius (px)</label>
              <input
                type="range"
                min="0"
                max="20"
                value={widgetConfig[selectedWidget].borderRadius}
                onChange={(e) => setWidgetConfig(prev => ({
                  ...prev,
                  [selectedWidget]: { ...prev[selectedWidget], borderRadius: parseInt(e.target.value) }
                }))}
                className="w-full"
              />
              <div className="text-sm text-gray-500 mt-1">{widgetConfig[selectedWidget].borderRadius}px</div>
            </div>

            {/* Widget-specific options */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Display Options</h4>
              
              {selectedWidget === 'blog' && (
                <>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showImages"
                      checked={widgetConfig[selectedWidget].showImages}
                      onChange={(e) => setWidgetConfig(prev => ({
                        ...prev,
                        [selectedWidget]: { ...prev[selectedWidget], showImages: e.target.checked }
                      }))}
                      className="mr-2"
                    />
                    <label htmlFor="showImages" className="text-sm text-gray-700">Show Images</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showDates"
                      checked={widgetConfig[selectedWidget].showDates}
                      onChange={(e) => setWidgetConfig(prev => ({
                        ...prev,
                        [selectedWidget]: { ...prev[selectedWidget], showDates: e.target.checked }
                      }))}
                      className="mr-2"
                    />
                    <label htmlFor="showDates" className="text-sm text-gray-700">Show Dates</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showExcerpts"
                      checked={widgetConfig[selectedWidget].showExcerpts}
                      onChange={(e) => setWidgetConfig(prev => ({
                        ...prev,
                        [selectedWidget]: { ...prev[selectedWidget], showExcerpts: e.target.checked }
                      }))}
                      className="mr-2"
                    />
                    <label htmlFor="showExcerpts" className="text-sm text-gray-700">Show Excerpts</label>
                  </div>
                </>
              )}

            {selectedWidget === 'calendar' && (
              <>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showTime"
                    checked={widgetConfig[selectedWidget].showTime}
                    onChange={(e) => setWidgetConfig(prev => ({
                      ...prev,
                      [selectedWidget]: { ...prev[selectedWidget], showTime: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  <label htmlFor="showTime" className="text-sm text-gray-700">Show Time</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showEventTypes"
                    checked={widgetConfig[selectedWidget].showEventTypes}
                    onChange={(e) => setWidgetConfig(prev => ({
                      ...prev,
                      [selectedWidget]: { ...prev[selectedWidget], showEventTypes: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  <label htmlFor="showEventTypes" className="text-sm text-gray-700">Show Event Types</label>
                </div>
              </>
            )}

            {selectedWidget === 'newsfeed' && (
              <>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showReplies"
                    checked={widgetConfig[selectedWidget].showReplies}
                    onChange={(e) => setWidgetConfig(prev => ({
                      ...prev,
                      [selectedWidget]: { ...prev[selectedWidget], showReplies: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  <label htmlFor="showReplies" className="text-sm text-gray-700">Show Replies</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showAvatars"
                    checked={widgetConfig[selectedWidget].showAvatars}
                    onChange={(e) => setWidgetConfig(prev => ({
                      ...prev,
                      [selectedWidget]: { ...prev[selectedWidget], showAvatars: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  <label htmlFor="showAvatars" className="text-sm text-gray-700">Show Avatars</label>
                </div>
              </>
            )}
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">👀 Live Preview</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <iframe
              src={`/widget/${selectedWidget}?settings=${encodeURIComponent(JSON.stringify(widgetConfig[selectedWidget]))}`}
              width="100%"
              height="400"
              frameBorder="0"
              style={{ borderRadius: `${widgetConfig[selectedWidget].borderRadius}px` }}
              title="Widget Preview"
            />
          </div>
        </div>
      </div>

      {/* Embed Codes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">📋 Embed Codes</h3>
        
        <div className="space-y-6">
          {/* Standard Embed */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Standard Embed (400x600)</h4>
              <button
                onClick={() => copyToClipboard(generateEmbedCode('standard'), 'standard')}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                {copiedCode === 'standard' ? <Check size={16} /> : <Copy size={16} />}
                {copiedCode === 'standard' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <textarea
              value={generateEmbedCode('standard')}
              readOnly
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
            />
          </div>

          {/* Responsive Embed */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Responsive Embed</h4>
              <button
                onClick={() => copyToClipboard(generateEmbedCode('responsive'), 'responsive')}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                {copiedCode === 'responsive' ? <Check size={16} /> : <Copy size={16} />}
                {copiedCode === 'responsive' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <textarea
              value={generateEmbedCode('responsive')}
              readOnly
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
            />
          </div>

          {/* Direct URL */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Direct Widget URL</h4>
              <button
                onClick={() => copyToClipboard(generateEmbedCode('direct'), 'direct')}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                {copiedCode === 'direct' ? <Check size={16} /> : <Copy size={16} />}
                {copiedCode === 'direct' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <input
              value={generateEmbedCode('direct')}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Blog Posts Component
  const BlogPosts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
        <button
          onClick={() => { setContentType('post'); setIsCreating(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          New Post
        </button>
      </div>

      <div className="grid gap-4">
        {posts.map(post => (
          <div key={post.id} className={`border rounded-lg p-6 transition-all duration-300 ${
            post.featured 
              ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-amber-200 shadow-lg' 
              : 'bg-white border-gray-200 hover:shadow-md'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {post.featured && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs rounded-full font-bold shadow-sm">
                      ⭐ FEATURED POST
                    </span>
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                {post.image && (
                  <div className="mb-3">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <p className="text-gray-600 mb-3">{post.content}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    📅 {post.date}
                  </span>
                  <span className={`flex items-center gap-1 ${post.published ? 'text-green-600' : 'text-orange-600'}`}>
                    {post.published ? <Eye size={16} /> : <EyeOff size={16} />}
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => toggleFeatured(post.id)}
                  className={`p-2 rounded-lg transition ${
                    post.featured 
                      ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={post.featured ? 'Remove from featured' : 'Mark as featured'}
                >
                  <Star size={16} fill={post.featured ? 'currentColor' : 'none'} />
                </button>
                
                <button
                  onClick={() => togglePublished(post.id)}
                  className={`p-2 rounded-lg transition ${
                    post.published 
                      ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                      : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                  }`}
                  title={post.published ? 'Unpublish' : 'Publish'}
                >
                  {post.published ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                
                <button
                  onClick={() => editPost(post)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Edit post"
                >
                  <Edit size={16} />
                </button>
                
                <button
                  onClick={() => deletePost(post.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Delete post"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800">Social Hub</h2>
        </div>
        
        <nav className="mt-6">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left transition ${
                activeSection === item.id
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeSection === 'dashboard' && <Dashboard />}
        {activeSection === 'posts' && <BlogPosts />}
        {activeSection === 'settings' && <WidgetCreator />}
        {activeSection === 'newsfeed' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">News Feed</h1>
            <p className="text-gray-600">News feed functionality coming soon...</p>
          </div>
        )}
        {activeSection === 'campaigns' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Email Campaigns</h1>
            <p className="text-gray-600">Email campaign functionality coming soon...</p>
          </div>
        )}
        {activeSection === 'members' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Members</h1>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid gap-4">
                {members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <p className="text-xs text-gray-500">{member.role} • {member.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeSection === 'calendar' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Calendar</h1>
            <p className="text-gray-600">Calendar functionality coming soon...</p>
          </div>
        )}
        {activeSection === 'analytics' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics</h1>
            <p className="text-gray-600">Analytics functionality coming soon...</p>
          </div>
        )}
        {activeSection === 'settings' && <WidgetCreator />}
        {(isCreating || isEditing) && (
          <PostEditor 
            post={isEditing ? editingPost : null}
            onSave={isEditing ? updatePost : createPost}
            onCancel={() => {
              setIsCreating(false);
              setIsEditing(false);
              setEditingPost(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// App with Router - Fixed Widget Isolation
const App = () => {
  const location = window.location.pathname;
  
  // Direct widget routing without React Router interference
  if (location === '/widget/blog') {
    return <StandaloneBlogWidget />;
  }
  
  if (location === '/widget/calendar') {
    return <StandaloneCalendarWidget />;
  }
  
  if (location === '/widget/newsfeed') {
    return <StandaloneNewsFeedWidget />;
  }
  
  // For all other routes, use React Router with MainApp
  return (
    <Router>
      <Routes>
        <Route path="*" element={<MainApp />} />
      </Routes>
    </Router>
  );
};

export default App;
