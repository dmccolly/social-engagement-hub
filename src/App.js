import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { 
  Home, FileText, Mail, Users, Settings, Calendar, BarChart3, 
  Plus, Edit, Trash2, Search, Bell, Upload, Send, Clock, 
  CheckCircle, X, ChevronDown, MessageSquare, Heart, BookmarkPlus,
  Image, Film, Music, Link, Bold, Italic, Underline, Type,
  Palette, AlignLeft, AlignCenter, AlignRight, List, Eye,
  Star, Sparkles, Crown, Copy, ExternalLink, Zap, TrendingUp,
  UserPlus, Award, Target, Activity
} from 'lucide-react';

// Enhanced Blog Widget with Rich Magazine-Style Output
const StandaloneBlogWidget = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');

  const urlParams = new URLSearchParams(window.location.search);
  const settingsParam = urlParams.get('settings');
  const settings = settingsParam ? JSON.parse(decodeURIComponent(settingsParam)) : {
    headerColor: '#2563eb',
    headerText: '📝 Latest Blog Posts',
    postCount: 3,
    showDates: true,
    showExcerpts: true,
    showImages: true,
    borderRadius: 8,
    transparent: true
  };

  useEffect(() => {
    const loadPosts = () => {
      try {
        setDebugInfo('Loading posts...');
        
        // Try multiple localStorage keys for compatibility
        const possibleKeys = ['socialHubPosts', 'blogPosts', 'posts'];
        let foundPosts = [];
        
        for (const key of possibleKeys) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              foundPosts = parsed;
              setDebugInfo(`Found ${parsed.length} posts from ${key}`);
              break;
            }
          }
        }

        // If no posts found, create sample posts with images
        if (foundPosts.length === 0) {
          foundPosts = [
            {
              id: 1,
              title: 'Welcome to Our Blog',
              content: 'This is a featured post showcasing our latest updates and news. We\'re excited to share our journey with you and provide valuable insights into our industry. Stay tuned for more exciting content, tutorials, and behind-the-scenes stories that will help you grow and succeed.',
              excerpt: 'This is a featured post showcasing our latest updates and news. We\'re excited to share our journey with you and provide valuable insights...',
              date: '9/24/2025',
              isFeatured: true,
              imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=200&fit=crop',
              author: 'Editorial Team',
              readTime: '3 min read'
            },
            {
              id: 2,
              title: 'Getting Started Guide',
              content: 'Learn how to make the most of our platform with this comprehensive getting started guide. We\'ll walk you through all the essential features, best practices, and pro tips that will help you achieve your goals faster and more efficiently.',
              excerpt: 'Learn how to make the most of our platform with this comprehensive getting started guide. We\'ll walk you through all the essential features...',
              date: '9/23/2025',
              isFeatured: false,
              imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
              author: 'Support Team',
              readTime: '5 min read'
            },
            {
              id: 3,
              title: 'Industry Insights & Trends',
              content: 'Discover the latest trends and insights in our industry. Our expert analysis covers emerging technologies, market shifts, and opportunities that could impact your business. Stay ahead of the curve with our in-depth research and actionable recommendations.',
              excerpt: 'Discover the latest trends and insights in our industry. Our expert analysis covers emerging technologies, market shifts, and opportunities...',
              date: '9/22/2025',
              isFeatured: false,
              imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop',
              author: 'Research Team',
              readTime: '7 min read'
            }
          ];
          setDebugInfo('Created sample posts with rich content');
        }

        // Sort by featured first, then by date
        foundPosts.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return new Date(b.date) - new Date(a.date);
        });

        setPosts(foundPosts.slice(0, settings.postCount));
        setIsLoading(false);
      } catch (error) {
        setDebugInfo(`Error loading posts: ${error.message}`);
        setIsLoading(false);
      }
    };

    loadPosts();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key && ['socialHubPosts', 'blogPosts', 'posts'].includes(e.key)) {
        loadPosts();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Refresh every 5 seconds
    const interval = setInterval(loadPosts, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [settings.postCount]);

  if (isLoading) {
    return (
      <div style={{
        fontFamily: 'Georgia, serif',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: settings.transparent ? 'transparent' : '#ffffff',
        borderRadius: `${settings.borderRadius}px`
      }}>
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <div style={{ fontSize: '18px' }}>Loading latest posts...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: 'Georgia, serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: settings.transparent ? 'transparent' : '#ffffff',
      borderRadius: `${settings.borderRadius}px`,
      boxShadow: settings.transparent ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        borderBottom: '3px solid ' + settings.headerColor,
        paddingBottom: '15px'
      }}>
        <h2 style={{
          color: settings.headerColor,
          fontSize: '28px',
          fontWeight: 'bold',
          margin: '0',
          letterSpacing: '-0.5px'
        }}>
          {settings.headerText}
        </h2>
      </div>

      {/* Posts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {posts.map((post, index) => (
          <article key={post.id || index} style={{
            backgroundColor: settings.transparent ? 'rgba(255, 255, 255, 0.95)' : '#ffffff',
            borderRadius: `${settings.borderRadius}px`,
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
            border: post.isFeatured ? '2px solid #f59e0b' : '1px solid #e5e7eb'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
          }}>
            
            {/* Featured Badge */}
            {post.isFeatured && (
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                zIndex: 2,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }}>
                ⭐ FEATURED
              </div>
            )}

            {/* Image */}
            {settings.showImages && post.imageUrl && (
              <div style={{ position: 'relative', height: '250px', overflow: 'hidden' }}>
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                {post.isFeatured && (
                  <div style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
                    height: '60px'
                  }} />
                )}
              </div>
            )}

            {/* Content */}
            <div style={{ padding: '25px' }}>
              {/* Title */}
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '12px',
                lineHeight: '1.3',
                fontFamily: 'Georgia, serif'
              }}>
                {post.title}
              </h3>

              {/* Meta Information */}
              {settings.showDates && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  marginBottom: '15px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <span>📅 {post.date}</span>
                  {post.author && <span>✍️ {post.author}</span>}
                  {post.readTime && <span>⏱️ {post.readTime}</span>}
                </div>
              )}

              {/* Excerpt */}
              {settings.showExcerpts && (
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: '#4b5563',
                  marginBottom: '20px',
                  fontFamily: 'Georgia, serif'
                }}>
                  {post.excerpt || (post.content ? post.content.substring(0, 200) + '...' : '')}
                </p>
              )}

              {/* Read More Link */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <a href="#" style={{
                  color: settings.headerColor,
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  Read Full Article →
                </a>
                
                {post.isFeatured && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: '#f59e0b',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    <span>⭐</span>
                    <span>Featured</span>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Debug Info */}
      {debugInfo && (
        <div style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#f3f4f6',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#6b7280',
          fontFamily: 'monospace'
        }}>
          Debug: {debugInfo}
        </div>
      )}

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '30px',
        padding: '20px',
        borderTop: '1px solid #e5e7eb',
        color: '#9ca3af',
        fontSize: '14px'
      }}>
        Powered by Social Engagement Hub
      </div>
    </div>
  );
};
// Standalone Calendar Widget
const StandaloneCalendarWidget = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const headerColor = urlParams.get('headerColor') || '#3b82f6';
  const headerText = urlParams.get('headerText') || '📅 Upcoming Events';
  const maxEvents = parseInt(urlParams.get('maxEvents')) || 5;
  const showDates = urlParams.get('showDates') !== 'false';
  const showCategories = urlParams.get('showCategories') !== 'false';
  const borderRadius = urlParams.get('borderRadius') || '8';
  const debug = urlParams.get('debug') === 'true';

  const [events] = useState([
    {
      id: 1,
      title: 'Team Meeting',
      date: '2025-09-26',
      time: '10:00 AM',
      category: 'Meeting',
      location: 'Conference Room A',
      attendees: 8
    },
    {
      id: 2,
      title: 'Product Launch',
      date: '2025-09-28',
      time: '2:00 PM',
      category: 'Event',
      location: 'Main Auditorium',
      attendees: 150
    },
    {
      id: 3,
      title: 'Training Session',
      date: '2025-09-30',
      time: '9:00 AM',
      category: 'Training',
      location: 'Training Room B',
      attendees: 25
    },
    {
      id: 4,
      title: 'Company Newsletter',
      date: '2025-10-01',
      time: '12:00 PM',
      category: 'Newsletter',
      location: 'Email Distribution',
      attendees: 500
    },
    {
      id: 5,
      title: 'Quarterly Review',
      date: '2025-10-05',
      time: '3:00 PM',
      category: 'Meeting',
      location: 'Executive Boardroom',
      attendees: 12
    }
  ]);

  const categoryColors = {
    'Meeting': 'bg-blue-100 text-blue-800',
    'Event': 'bg-green-100 text-green-800',
    'Training': 'bg-purple-100 text-purple-800',
    'Newsletter': 'bg-orange-100 text-orange-800',
    'Announcement': 'bg-red-100 text-red-800'
  };

  const categoryIcons = {
    'Meeting': '👥',
    'Event': '🎉',
    'Training': '📚',
    'Newsletter': '📧',
    'Announcement': '📢'
  };

  const displayEvents = events.slice(0, maxEvents);

  return (
    <div 
      className="max-w-2xl mx-auto bg-transparent p-6 font-sans"
      style={{ borderRadius: `${borderRadius}px` }}
    >
      <div 
        className="text-center mb-6 p-4 rounded-lg text-white font-bold text-xl"
        style={{ backgroundColor: headerColor }}
      >
        {headerText}
      </div>

      {debug && (
        <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
          <strong>Debug Info:</strong> Showing {displayEvents.length} events, 
          Header: "{headerText}", Color: {headerColor}
        </div>
      )}

      <div className="space-y-4">
        {displayEvents.map(event => (
          <div key={event.id} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                
                {showDates && (
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center gap-1">
                      📅 {new Date(event.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      🕐 {event.time}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    📍 {event.location}
                  </span>
                  <span className="flex items-center gap-1">
                    👥 {event.attendees} attendees
                  </span>
                </div>
              </div>

              {showCategories && (
                <div className="ml-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[event.category] || 'bg-gray-100 text-gray-800'}`}>
                    {categoryIcons[event.category]} {event.category}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {displayEvents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No upcoming events at this time.</p>
        </div>
      )}

      <div className="text-center mt-6">
        <a 
          href="#" 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View All Events →
        </a>
      </div>
    </div>
  );
};

// Standalone News Feed Widget
const StandaloneNewsFeedWidget = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const headerColor = urlParams.get('headerColor') || '#10b981';
  const headerText = urlParams.get('headerText') || '💬 Community Feed';
  const maxPosts = parseInt(urlParams.get('maxPosts')) || 5;
  const showAvatars = urlParams.get('showAvatars') !== 'false';
  const showInteractions = urlParams.get('showInteractions') !== 'false';
  const borderRadius = urlParams.get('borderRadius') || '8';
  const debug = urlParams.get('debug') === 'true';

  const [posts] = useState([
    {
      id: 1,
      author: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      content: 'Just finished reading an amazing article about sustainable web development. The future of eco-friendly coding is here! 🌱',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 8,
      shares: 3
    },
    {
      id: 2,
      author: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      content: 'Excited to announce our new community project! We\'re building a resource hub for developers. Who wants to contribute?',
      timestamp: '4 hours ago',
      likes: 42,
      comments: 15,
      shares: 7
    },
    {
      id: 3,
      author: 'Emily Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      content: 'Pro tip: Always test your responsive designs on actual devices, not just browser dev tools. The difference is real! 📱',
      timestamp: '6 hours ago',
      likes: 18,
      comments: 5,
      shares: 12
    },
    {
      id: 4,
      author: 'David Park',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      content: 'Coffee break thoughts: The best code is the code that doesn\'t need comments because it\'s self-explanatory. ☕',
      timestamp: '8 hours ago',
      likes: 31,
      comments: 9,
      shares: 4
    },
    {
      id: 5,
      author: 'Lisa Wang',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      content: 'Shoutout to everyone who helped debug that tricky CSS issue yesterday. Community support is everything! 🙌',
      timestamp: '12 hours ago',
      likes: 56,
      comments: 23,
      shares: 8
    }
  ]);

  const displayPosts = posts.slice(0, maxPosts);

  return (
    <div 
      className="max-w-2xl mx-auto bg-transparent p-6 font-sans"
      style={{ borderRadius: `${borderRadius}px` }}
    >
      <div 
        className="text-center mb-6 p-4 rounded-lg text-white font-bold text-xl"
        style={{ backgroundColor: headerColor }}
      >
        {headerText}
      </div>

      {debug && (
        <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
          <strong>Debug Info:</strong> Showing {displayPosts.length} posts, 
          Header: "{headerText}", Color: {headerColor}
        </div>
      )}

      <div className="space-y-4">
        {displayPosts.map(post => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
            <div className="flex items-start gap-3">
              {showAvatars && (
                <img
                  src={post.avatar}
                  alt={post.author}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}&background=10b981&color=fff`;
                  }}
                />
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{post.author}</h4>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{post.timestamp}</span>
                </div>
                
                <p className="text-gray-700 mb-3 leading-relaxed">{post.content}</p>
                
                {showInteractions && (
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <button className="flex items-center gap-1 hover:text-red-600 transition">
                      ❤️ {post.likes}
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-600 transition">
                      💬 {post.comments}
                    </button>
                    <button className="flex items-center gap-1 hover:text-green-600 transition">
                      🔄 {post.shares}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {displayPosts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No posts to display at this time.</p>
        </div>
      )}

      <div className="text-center mt-6">
        <a 
          href="#" 
          className="text-green-600 hover:text-green-800 text-sm font-medium"
        >
          View All Posts →
        </a>
      </div>
    </div>
  );
};

const App = () => {
  // Check if this is a widget route
  const currentPath = window.location.pathname;
  
  // Widget routing - render standalone widgets
  if (currentPath === '/widget/blog') {
    return <StandaloneBlogWidget />;
  }
  if (currentPath === '/widget/calendar') {
    return <StandaloneCalendarWidget />;
  }
  if (currentPath === '/widget/newsfeed') {
    return <StandaloneNewsFeedWidget />;
  }

  // State Management
  const [activeSection, setActiveSection] = useState('dashboard');
  const [posts, setPosts] = useState([
    {
      title: 'Welcome to Our Platform',
      content: 'This is a featured post!',
      date: '9/23/2025',
      isFeatured: true
    },
    {
      title: 'Latest Updates',
      content: 'Check out our new features',
      date: '9/23/2025',
      isFeatured: false
    }
  ]);
  const [campaigns, setCampaigns] = useState([]);
  const [members, setMembers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [contentType, setContentType] = useState('post');
  const [currentUser] = useState({ name: 'Admin User', email: 'admin@example.com' });

  // Comprehensive Settings Section with Widget Creation Tools
  const SettingsSection = () => {
    const [selectedWidget, setSelectedWidget] = useState('blog');
    const [widgetSettings, setWidgetSettings] = useState({
      blog: {
        headerColor: '#2563eb',
        headerText: '📝 Latest Blog Posts',
        postCount: 3,
        showDates: true,
        showExcerpts: true,
        showImages: true,
        borderRadius: 8,
        transparent: true
      },
      calendar: {
        headerColor: '#059669',
        headerText: '📅 Upcoming Events',
        eventCount: 5,
        showDates: true,
        showCategories: true,
        borderRadius: 8,
        transparent: true
      },
      newsfeed: {
        headerColor: '#7c3aed',
        headerText: '💬 Community Feed',
        postCount: 4,
        showAuthor: true,
        showTimestamp: true,
        showLikes: true,
        borderRadius: 8,
        transparent: true
      }
    });

    const generateEmbedCode = (type, format = 'standard') => {
      const settings = widgetSettings[type];
      const settingsParam = encodeURIComponent(JSON.stringify(settings));
      const baseUrl = window.location.origin;
      
      switch (format) {
        case 'standard':
          return `<iframe src="${baseUrl}/widget/${type}?settings=${settingsParam}" width="100%" height="600" frameborder="0" style="border-radius: ${settings.borderRadius}px;"></iframe>`;
        
        case 'responsive':
          return `<div style="position: relative; width: 100%; height: 0; padding-bottom: 75%; overflow: hidden; border-radius: ${settings.borderRadius}px;">
  <iframe src="${baseUrl}/widget/${type}?settings=${settingsParam}" 
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" 
          allowfullscreen>
  </iframe>
</div>`;
        
        case 'direct':
          return `${baseUrl}/widget/${type}?settings=${settingsParam}`;
        
        default:
          return '';
      }
    };

    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text).then(() => {
        alert('Embed code copied to clipboard!');
      });
    };

    const updateSetting = (widget, key, value) => {
      setWidgetSettings(prev => ({
        ...prev,
        [widget]: {
          ...prev[widget],
          [key]: value
        }
      }));
    };

    const widgets = [
      { id: 'blog', name: 'Blog Posts', icon: FileText, description: 'Display latest blog posts with rich formatting' },
      { id: 'calendar', name: 'Calendar Events', icon: Calendar, description: 'Show upcoming events and schedules' },
      { id: 'newsfeed', name: 'News Feed', icon: MessageSquare, description: 'Community posts and engagement feed' }
    ];

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="text-blue-600" />
            Widget Creation & Embed Tools
          </h1>
          <p className="text-gray-600 mt-2">Create customizable widgets for your website with live preview and embed codes</p>
        </div>

        <div className="flex">
          {/* Widget Selection Sidebar */}
          <div className="w-1/4 border-r border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Widget Types</h3>
            <div className="space-y-2">
              {widgets.map(widget => (
                <button
                  key={widget.id}
                  onClick={() => setSelectedWidget(widget.id)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedWidget === widget.id 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <widget.icon size={20} />
                    <div>
                      <div className="font-medium">{widget.name}</div>
                      <div className="text-sm text-gray-500">{widget.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Widget Configuration */}
          <div className="flex-1 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Settings Panel */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Customize {widgets.find(w => w.id === selectedWidget)?.name}</h3>
                
                <div className="space-y-6">
                  {/* Header Settings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Header Text</label>
                    <input
                      type="text"
                      value={widgetSettings[selectedWidget].headerText}
                      onChange={(e) => updateSetting(selectedWidget, 'headerText', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Header Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={widgetSettings[selectedWidget].headerColor}
                        onChange={(e) => updateSetting(selectedWidget, 'headerColor', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={widgetSettings[selectedWidget].headerColor}
                        onChange={(e) => updateSetting(selectedWidget, 'headerColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Widget-specific settings */}
                  {selectedWidget === 'blog' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Number of Posts</label>
                        <select
                          value={widgetSettings.blog.postCount}
                          onChange={(e) => updateSetting('blog', 'postCount', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {[1,2,3,4,5,6,7,8,9,10].map(num => (
                            <option key={num} value={num}>{num} post{num > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={widgetSettings.blog.showImages}
                            onChange={(e) => updateSetting('blog', 'showImages', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Show featured images</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={widgetSettings.blog.showExcerpts}
                            onChange={(e) => updateSetting('blog', 'showExcerpts', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Show post excerpts</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={widgetSettings.blog.showDates}
                            onChange={(e) => updateSetting('blog', 'showDates', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Show publish dates</span>
                        </label>
                      </div>
                    </>
                  )}

                  {selectedWidget === 'calendar' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Number of Events</label>
                        <select
                          value={widgetSettings.calendar.eventCount}
                          onChange={(e) => updateSetting('calendar', 'eventCount', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {[1,2,3,4,5,6,7,8,9,10].map(num => (
                            <option key={num} value={num}>{num} event{num > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={widgetSettings.calendar.showCategories}
                            onChange={(e) => updateSetting('calendar', 'showCategories', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Show event categories</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={widgetSettings.calendar.showDates}
                            onChange={(e) => updateSetting('calendar', 'showDates', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Show event dates</span>
                        </label>
                      </div>
                    </>
                  )}

                  {selectedWidget === 'newsfeed' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Number of Posts</label>
                        <select
                          value={widgetSettings.newsfeed.postCount}
                          onChange={(e) => updateSetting('newsfeed', 'postCount', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {[1,2,3,4,5,6,7,8,9,10].map(num => (
                            <option key={num} value={num}>{num} post{num > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={widgetSettings.newsfeed.showAuthor}
                            onChange={(e) => updateSetting('newsfeed', 'showAuthor', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Show post authors</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={widgetSettings.newsfeed.showTimestamp}
                            onChange={(e) => updateSetting('newsfeed', 'showTimestamp', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Show timestamps</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={widgetSettings.newsfeed.showLikes}
                            onChange={(e) => updateSetting('newsfeed', 'showLikes', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Show like counts</span>
                        </label>
                      </div>
                    </>
                  )}

                  {/* Common Settings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={widgetSettings[selectedWidget].borderRadius}
                      onChange={(e) => updateSetting(selectedWidget, 'borderRadius', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-500 mt-1">{widgetSettings[selectedWidget].borderRadius}px</div>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={widgetSettings[selectedWidget].transparent}
                        onChange={(e) => updateSetting(selectedWidget, 'transparent', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Transparent background</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <iframe
                    src={`/widget/${selectedWidget}?settings=${encodeURIComponent(JSON.stringify(widgetSettings[selectedWidget]))}`}
                    width="100%"
                    height="400"
                    frameBorder="0"
                    className="rounded-lg"
                    title={`${selectedWidget} widget preview`}
                  />
                </div>
              </div>
            </div>

            {/* Embed Codes */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h3 className="text-xl font-semibold mb-4">Embed Codes</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Standard Embed */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Standard Embed</h4>
                    <button
                      onClick={() => copyToClipboard(generateEmbedCode(selectedWidget, 'standard'))}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Copy to clipboard"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <textarea
                    value={generateEmbedCode(selectedWidget, 'standard')}
                    readOnly
                    className="w-full h-24 text-xs font-mono bg-white border border-gray-300 rounded p-2 resize-none"
                  />
                </div>

                {/* Responsive Embed */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Responsive Embed</h4>
                    <button
                      onClick={() => copyToClipboard(generateEmbedCode(selectedWidget, 'responsive'))}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Copy to clipboard"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <textarea
                    value={generateEmbedCode(selectedWidget, 'responsive')}
                    readOnly
                    className="w-full h-24 text-xs font-mono bg-white border border-gray-300 rounded p-2 resize-none"
                  />
                </div>

                {/* Direct URL */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Direct URL</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(generateEmbedCode(selectedWidget, 'direct'))}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Copy to clipboard"
                      >
                        <Copy size={16} />
                      </button>
                      <a
                        href={generateEmbedCode(selectedWidget, 'direct')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Open in new tab"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </div>
                  <textarea
                    value={generateEmbedCode(selectedWidget, 'direct')}
                    readOnly
                    className="w-full h-24 text-xs font-mono bg-white border border-gray-300 rounded p-2 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Calendar Section with Event Management
  const CalendarSection = () => {
    const [events, setEvents] = useState([
      {
        id: 1,
        title: 'Team Meeting',
        date: '2025-09-26',
        time: '10:00 AM',
        category: 'Meeting',
        description: 'Weekly team sync and project updates',
        location: 'Conference Room A',
        attendees: ['John Doe', 'Jane Smith', 'Mike Johnson']
      },
      {
        id: 2,
        title: 'Product Launch',
        date: '2025-09-28',
        time: '2:00 PM',
        category: 'Event',
        description: 'Official launch of our new product line',
        location: 'Main Auditorium',
        attendees: ['All Staff', 'Media', 'Partners']
      },
      {
        id: 3,
        title: 'Training Workshop',
        date: '2025-09-30',
        time: '9:00 AM',
        category: 'Training',
        description: 'Advanced skills development workshop',
        location: 'Training Center',
        attendees: ['Development Team', 'QA Team']
      },
      {
        id: 4,
        title: 'Client Presentation',
        date: '2025-10-02',
        time: '3:00 PM',
        category: 'Meeting',
        description: 'Quarterly review with key clients',
        location: 'Executive Boardroom',
        attendees: ['Sales Team', 'Account Managers']
      },
      {
        id: 5,
        title: 'Company Retreat',
        date: '2025-10-05',
        time: '9:00 AM',
        category: 'Event',
        description: 'Annual company retreat and team building',
        location: 'Mountain Resort',
        attendees: ['All Employees']
      }
    ]);

    const [isCreatingEvent, setIsCreatingEvent] = useState(false);
    const [newEvent, setNewEvent] = useState({
      title: '',
      date: '',
      time: '',
      category: 'Meeting',
      description: '',
      location: '',
      attendees: ''
    });

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

    const categories = ['Meeting', 'Event', 'Training', 'Deadline', 'Holiday'];
    const categoryColors = {
      'Meeting': 'bg-blue-100 text-blue-800',
      'Event': 'bg-green-100 text-green-800',
      'Training': 'bg-purple-100 text-purple-800',
      'Deadline': 'bg-red-100 text-red-800',
      'Holiday': 'bg-yellow-100 text-yellow-800'
    };

    const handleCreateEvent = () => {
      if (!newEvent.title || !newEvent.date || !newEvent.time) return;

      const event = {
        id: Date.now(),
        ...newEvent,
        attendees: newEvent.attendees.split(',').map(a => a.trim()).filter(a => a)
      };

      setEvents(prev => [...prev, event].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setNewEvent({
        title: '',
        date: '',
        time: '',
        category: 'Meeting',
        description: '',
        location: '',
        attendees: ''
      });
      setIsCreatingEvent(false);
    };

    const handleDeleteEvent = (eventId) => {
      setEvents(prev => prev.filter(event => event.id !== eventId));
    };

    const filteredEvents = selectedCategory === 'all' 
      ? events 
      : events.filter(event => event.category === selectedCategory);

    const upcomingEvents = events.filter(event => new Date(event.date) >= new Date()).slice(0, 5);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Calendar className="text-green-600" />
              Event Calendar
            </h1>
            <div className="flex gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                >
                  List View
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-1 rounded ${viewMode === 'calendar' ? 'bg-white shadow' : ''}`}
                >
                  Calendar View
                </button>
              </div>
              <button
                onClick={() => setIsCreatingEvent(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus size={20} /> New Event
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Calendar className="text-blue-600" size={24} />
                <div>
                  <div className="text-2xl font-bold text-blue-900">{events.length}</div>
                  <div className="text-sm text-blue-600">Total Events</div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Clock className="text-green-600" size={24} />
                <div>
                  <div className="text-2xl font-bold text-green-900">{upcomingEvents.length}</div>
                  <div className="text-sm text-green-600">Upcoming</div>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="text-purple-600" size={24} />
                <div>
                  <div className="text-2xl font-bold text-purple-900">
                    {events.filter(e => e.category === 'Meeting').length}
                  </div>
                  <div className="text-sm text-purple-600">Meetings</div>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Award className="text-yellow-600" size={24} />
                <div>
                  <div className="text-2xl font-bold text-yellow-900">
                    {events.filter(e => e.category === 'Event').length}
                  </div>
                  <div className="text-sm text-yellow-600">Events</div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === 'all' 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Events ({events.length})
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === category 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category} ({events.filter(e => e.category === category).length})
              </button>
            ))}
          </div>
        </div>

        {/* Event Creation Modal */}
        {isCreatingEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Create New Event</h3>
                <button
                  onClick={() => setIsCreatingEvent(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter event title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Event location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows="3"
                    placeholder="Event description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attendees</label>
                  <input
                    type="text"
                    value={newEvent.attendees}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, attendees: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Comma-separated list of attendees"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreateEvent}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Create Event
                  </button>
                  <button
                    onClick={() => setIsCreatingEvent(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">
              {selectedCategory === 'all' ? 'All Events' : `${selectedCategory} Events`}
            </h2>
            
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No events found for the selected category.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map(event => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[event.category]}`}>
                            {event.category}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar size={16} />
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={16} />
                            {event.time}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              📍 {event.location}
                            </span>
                          )}
                        </div>
                        
                        {event.description && (
                          <p className="text-gray-700 mb-2">{event.description}</p>
                        )}
                        
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users size={16} />
                            <span>Attendees: {event.attendees.join(', ')}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete event"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Analytics Section with Comprehensive Dashboard
  const AnalyticsSection = () => {
    const [timeRange, setTimeRange] = useState('7d');
    const [selectedMetric, setSelectedMetric] = useState('overview');

    // Sample analytics data
    const analyticsData = {
      overview: {
        totalUsers: 12847,
        activeUsers: 8934,
        pageViews: 45621,
        bounceRate: 34.2,
        avgSessionDuration: '4:32',
        conversionRate: 12.8
      },
      traffic: {
        organic: 45.2,
        direct: 28.7,
        social: 15.3,
        referral: 8.1,
        email: 2.7
      },
      topPages: [
        { page: '/dashboard', views: 8934, uniqueViews: 6721, avgTime: '5:23' },
        { page: '/blog', views: 7456, uniqueViews: 5892, avgTime: '3:45' },
        { page: '/calendar', views: 5234, uniqueViews: 4123, avgTime: '2:18' },
        { page: '/members', views: 3456, uniqueViews: 2789, avgTime: '4:12' },
        { page: '/settings', views: 2345, uniqueViews: 1987, avgTime: '6:34' }
      ],
      devices: {
        desktop: 58.3,
        mobile: 35.2,
        tablet: 6.5
      },
      browsers: [
        { name: 'Chrome', percentage: 68.4, users: 8787 },
        { name: 'Safari', percentage: 18.2, users: 2338 },
        { name: 'Firefox', percentage: 8.1, users: 1041 },
        { name: 'Edge', percentage: 4.3, users: 552 },
        { name: 'Other', percentage: 1.0, users: 129 }
      ],
      engagement: {
        emailOpens: 24.5,
        emailClicks: 3.2,
        socialShares: 156,
        comments: 89,
        likes: 1247
      }
    };

    const timeRanges = [
      { value: '1d', label: 'Last 24 hours' },
      { value: '7d', label: 'Last 7 days' },
      { value: '30d', label: 'Last 30 days' },
      { value: '90d', label: 'Last 90 days' }
    ];

    const metrics = [
      { value: 'overview', label: 'Overview', icon: BarChart3 },
      { value: 'traffic', label: 'Traffic Sources', icon: TrendingUp },
      { value: 'engagement', label: 'Engagement', icon: Users },
      { value: 'content', label: 'Content Performance', icon: FileText }
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="text-blue-600" />
              Analytics Dashboard
            </h1>
            <div className="flex gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Download size={20} /> Export Report
              </button>
            </div>
          </div>

          {/* Metric Tabs */}
          <div className="flex gap-2 mb-6">
            {metrics.map(metric => {
              const IconComponent = metric.icon;
              return (
                <button
                  key={metric.value}
                  onClick={() => setSelectedMetric(metric.value)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    selectedMetric === metric.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent size={18} />
                  {metric.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Overview Metrics */}
        {selectedMetric === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalUsers.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </div>
                </div>
                <div className="text-sm text-green-600">↗ +12.5% from last period</div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Eye className="text-green-600" size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.pageViews.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Page Views</div>
                  </div>
                </div>
                <div className="text-sm text-green-600">↗ +8.3% from last period</div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Clock className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.avgSessionDuration}</div>
                    <div className="text-sm text-gray-600">Avg Session Duration</div>
                  </div>
                </div>
                <div className="text-sm text-green-600">↗ +15.2% from last period</div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <TrendingUp className="text-yellow-600" size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.bounceRate}%</div>
                    <div className="text-sm text-gray-600">Bounce Rate</div>
                  </div>
                </div>
                <div className="text-sm text-red-600">↘ -5.1% from last period</div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Target className="text-red-600" size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.conversionRate}%</div>
                    <div className="text-sm text-gray-600">Conversion Rate</div>
                  </div>
                </div>
                <div className="text-sm text-green-600">↗ +3.7% from last period</div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <Activity className="text-indigo-600" size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.activeUsers.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </div>
                </div>
                <div className="text-sm text-green-600">↗ +18.9% from last period</div>
              </div>
            </div>

            {/* Top Pages */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Top Performing Pages</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Page</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Views</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Unique Views</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Avg Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.topPages.map((page, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-blue-600">{page.page}</td>
                        <td className="py-3 px-4">{page.views.toLocaleString()}</td>
                        <td className="py-3 px-4">{page.uniqueViews.toLocaleString()}</td>
                        <td className="py-3 px-4">{page.avgTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Traffic Sources */}
        {selectedMetric === 'traffic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Traffic Sources</h3>
              <div className="space-y-4">
                {Object.entries(analyticsData.traffic).map(([source, percentage]) => (
                  <div key={source} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span className="capitalize font-medium">{source}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Device Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(analyticsData.devices).map(([device, percentage]) => (
                  <div key={device} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="capitalize font-medium">{device}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <h3 className="text-xl font-bold mb-4">Browser Usage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {analyticsData.browsers.map((browser, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{browser.percentage}%</div>
                    <div className="text-sm text-gray-600 mb-1">{browser.name}</div>
                    <div className="text-xs text-gray-500">{browser.users.toLocaleString()} users</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Engagement Metrics */}
        {selectedMetric === 'engagement' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Mail className="text-blue-600" size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{analyticsData.engagement.emailOpens}%</div>
                  <div className="text-sm text-gray-600">Email Open Rate</div>
                </div>
              </div>
              <div className="text-sm text-green-600">↗ +2.3% from last period</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <MousePointer className="text-green-600" size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{analyticsData.engagement.emailClicks}%</div>
                  <div className="text-sm text-gray-600">Email Click Rate</div>
                </div>
              </div>
              <div className="text-sm text-green-600">↗ +0.8% from last period</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Share2 className="text-purple-600" size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{analyticsData.engagement.socialShares}</div>
                  <div className="text-sm text-gray-600">Social Shares</div>
                </div>
              </div>
              <div className="text-sm text-green-600">↗ +12.1% from last period</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <MessageCircle className="text-yellow-600" size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{analyticsData.engagement.comments}</div>
                  <div className="text-sm text-gray-600">Comments</div>
                </div>
              </div>
              <div className="text-sm text-green-600">↗ +5.7% from last period</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Heart className="text-red-600" size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{analyticsData.engagement.likes}</div>
                  <div className="text-sm text-gray-600">Likes</div>
                </div>
              </div>
              <div className="text-sm text-green-600">↗ +8.9% from last period</div>
            </div>
          </div>
        )}

        {/* Content Performance */}
        {selectedMetric === 'content' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Content Performance Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Top Performing Content</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-900">Welcome to Our Blog</div>
                    <div className="text-sm text-green-600">2,847 views • 4.2 avg rating</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-900">Getting Started Guide</div>
                    <div className="text-sm text-blue-600">1,923 views • 4.5 avg rating</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="font-medium text-purple-900">Feature Updates</div>
                    <div className="text-sm text-purple-600">1,456 views • 4.1 avg rating</div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Content Engagement Trends</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span>Blog Posts</span>
                    <span className="font-medium">↗ +15.3%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span>News Updates</span>
                    <span className="font-medium">↗ +8.7%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span>Event Announcements</span>
                    <span className="font-medium">↗ +12.1%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Members Section with Comprehensive Member Management
  const MembersSection = () => {
    const [members, setMembers] = useState([
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Admin',
        status: 'Active',
        joinDate: '2024-01-15',
        lastActive: '2025-09-25',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        posts: 23,
        comments: 45,
        likes: 156
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'Editor',
        status: 'Active',
        joinDate: '2024-02-20',
        lastActive: '2025-09-24',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        posts: 18,
        comments: 32,
        likes: 89
      },
      {
        id: 3,
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        role: 'Member',
        status: 'Active',
        joinDate: '2024-03-10',
        lastActive: '2025-09-23',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        posts: 12,
        comments: 28,
        likes: 67
      },
      {
        id: 4,
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
        role: 'Member',
        status: 'Inactive',
        joinDate: '2024-04-05',
        lastActive: '2025-09-15',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        posts: 8,
        comments: 15,
        likes: 34
      },
      {
        id: 5,
        name: 'David Brown',
        email: 'david.brown@example.com',
        role: 'Moderator',
        status: 'Active',
        joinDate: '2024-05-12',
        lastActive: '2025-09-25',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        posts: 31,
        comments: 67,
        likes: 203
      }
    ]);

    const [isAddingMember, setIsAddingMember] = useState(false);
    const [selectedRole, setSelectedRole] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [newMember, setNewMember] = useState({
      name: '',
      email: '',
      role: 'Member'
    });

    const roles = ['Admin', 'Editor', 'Moderator', 'Member'];
    const statuses = ['Active', 'Inactive', 'Pending'];
    
    const roleColors = {
      'Admin': 'bg-red-100 text-red-800',
      'Editor': 'bg-blue-100 text-blue-800',
      'Moderator': 'bg-green-100 text-green-800',
      'Member': 'bg-gray-100 text-gray-800'
    };

    const statusColors = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Pending': 'bg-yellow-100 text-yellow-800'
    };

    const handleAddMember = () => {
      if (!newMember.name || !newMember.email) return;

      const member = {
        id: Date.now(),
        ...newMember,
        status: 'Active',
        joinDate: new Date().toISOString().split('T')[0],
        lastActive: new Date().toISOString().split('T')[0],
        avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`,
        posts: 0,
        comments: 0,
        likes: 0
      };

      setMembers(prev => [...prev, member]);
      setNewMember({ name: '', email: '', role: 'Member' });
      setIsAddingMember(false);
    };

    const handleDeleteMember = (memberId) => {
      setMembers(prev => prev.filter(member => member.id !== memberId));
    };

    const handleUpdateMemberRole = (memberId, newRole) => {
      setMembers(prev => prev.map(member => 
        member.id === memberId ? { ...member, role: newRole } : member
      ));
    };

    const handleUpdateMemberStatus = (memberId, newStatus) => {
      setMembers(prev => prev.map(member => 
        member.id === memberId ? { ...member, status: newStatus } : member
      ));
    };

    const filteredMembers = members.filter(member => {
      const matchesRole = selectedRole === 'all' || member.role === selectedRole;
      const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRole && matchesStatus && matchesSearch;
    });

    const memberStats = {
      total: members.length,
      active: members.filter(m => m.status === 'Active').length,
      admins: members.filter(m => m.role === 'Admin').length,
      newThisMonth: members.filter(m => {
        const joinDate = new Date(m.joinDate);
        const now = new Date();
        return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
      }).length
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="text-purple-600" />
              Member Management
            </h1>
            <button
              onClick={() => setIsAddingMember(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Plus size={20} /> Add Member
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="text-blue-600" size={24} />
                <div>
                  <div className="text-2xl font-bold text-blue-900">{memberStats.total}</div>
                  <div className="text-sm text-blue-600">Total Members</div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Activity className="text-green-600" size={24} />
                <div>
                  <div className="text-2xl font-bold text-green-900">{memberStats.active}</div>
                  <div className="text-sm text-green-600">Active Members</div>
                </div>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Shield className="text-red-600" size={24} />
                <div>
                  <div className="text-2xl font-bold text-red-900">{memberStats.admins}</div>
                  <div className="text-sm text-red-600">Administrators</div>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <UserPlus className="text-yellow-600" size={24} />
                <div>
                  <div className="text-2xl font-bold text-yellow-900">{memberStats.newThisMonth}</div>
                  <div className="text-sm text-yellow-600">New This Month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Add Member Modal */}
        {isAddingMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Add New Member</h3>
                <button
                  onClick={() => setIsAddingMember(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddMember}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Add Member
                  </button>
                  <button
                    onClick={() => setIsAddingMember(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Members List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">
              Members ({filteredMembers.length})
            </h2>
            
            {filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No members found matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMembers.map(member => (
                  <div key={member.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=6366f1&color=fff`;
                          }}
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[member.role]}`}>
                              {member.role}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[member.status]}`}>
                              {member.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">{member.posts}</div>
                          <div className="text-xs text-gray-600">Posts</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">{member.comments}</div>
                          <div className="text-xs text-gray-600">Comments</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">{member.likes}</div>
                          <div className="text-xs text-gray-600">Likes</div>
                        </div>
                        
                        <div className="flex gap-2">
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateMemberRole(member.id, e.target.value)}
                            className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            {roles.map(role => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                          <select
                            value={member.status}
                            onChange={(e) => handleUpdateMemberStatus(member.id, e.target.value)}
                            className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            {statuses.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Delete member"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
                      <span>Joined: {new Date(member.joinDate).toLocaleDateString()}</span>
                      <span>Last active: {new Date(member.lastActive).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // News Feed Component - User Engagement Feed
  const NewsFeed = () => {
    const [newPost, setNewPost] = useState('');
    const [newsFeedPosts, setNewsFeedPosts] = useState([
      {
        id: 1,
        author: 'Admin',
        content: 'Welcome to our community news feed! Share updates, ask questions, and engage with other members.',
        timestamp: new Date().toISOString(),
        likes: 5,
        comments: []
      },
      {
        id: 2,
        author: 'Community Manager',
        content: 'Don\'t forget to check out our latest blog posts and upcoming events. What topics would you like to see covered?',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        likes: 3,
        comments: [
          { author: 'User1', content: 'Great question! I\'d love to see more tech tutorials.', timestamp: new Date().toISOString() }
        ]
      }
    ]);

    const handlePostSubmit = () => {
      if (!newPost.trim()) return;
      
      const post = {
        id: Date.now(),
        author: currentUser?.name || 'Anonymous',
        content: newPost,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: []
      };
      
      setNewsFeedPosts(prev => [post, ...prev]);
      setNewPost('');
    };

    const handleLike = (postId) => {
      setNewsFeedPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      ));
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <MessageSquare className="text-blue-600" />
            Community News Feed
          </h1>
          
          {/* Post Creation */}
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-3">Share an update</h3>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind? Share news, ask questions, or start a discussion..."
              className="w-full p-3 border rounded-lg resize-none"
              rows="3"
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-gray-500">
                {currentUser ? `Posting as ${currentUser.name}` : 'Sign up to post'}
              </span>
              <button
                onClick={handlePostSubmit}
                disabled={!newPost.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Post Update
              </button>
            </div>
          </div>

          {/* News Feed Posts */}
          <div className="space-y-4">
            {newsFeedPosts.map((post) => (
              <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-blue-600">
                        {post.author.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{post.author}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(post.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="mb-3 leading-relaxed">{post.content}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition"
                  >
                    <Heart size={16} />
                    <span>{post.likes} likes</span>
                  </button>
                  
                  <button className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition">
                    <MessageSquare size={16} />
                    <span>{post.comments.length} comments</span>
                  </button>
                  
                  <button className="flex items-center gap-1 text-gray-600 hover:text-green-500 transition">
                    <BookmarkPlus size={16} />
                    <span>Save</span>
                  </button>
                </div>
                
                {/* Comments */}
                {post.comments.length > 0 && (
                  <div className="mt-4 pl-4 border-l-2 border-gray-200">
                    {post.comments.map((comment, index) => (
                      <div key={index} className="mb-2 last:mb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.author}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Rich Blog Editor Component
  const RichBlogEditor = ({ onSave, onCancel }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const contentRef = useRef(null);

    // Handle content change - FIXED for backwards typing
    const handleContentChange = (e) => {
      const selection = window.getSelection();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      const startOffset = range ? range.startOffset : 0;
      const endOffset = range ? range.endOffset : 0;
      const startContainer = range ? range.startContainer : null;
      
      setContent(e.target.innerHTML);
      
      setTimeout(() => {
        if (startContainer && contentRef.current && contentRef.current.contains(startContainer)) {
          try {
            const newRange = document.createRange();
            newRange.setStart(startContainer, Math.min(startOffset, startContainer.textContent?.length || 0));
            newRange.setEnd(startContainer, Math.min(endOffset, startContainer.textContent?.length || 0));
            selection.removeAllRanges();
            selection.addRange(newRange);
          } catch (e) {
            console.log('Cursor restore fallback');
          }
        }
      }, 0);
    };

    // Handle file upload
    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      console.log('Starting file upload:', file.name);
      setIsUploading(true);
      
      try {
        // For demo purposes, create a local URL
        const imageUrl = URL.createObjectURL(file);
        
        const newImage = {
          id: Date.now(),
          src: imageUrl,
          alt: file.name,
          size: 'medium',
          position: 'center'
        };
        
        console.log('Created image object:', newImage);
        insertImageIntoContent(newImage);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed. Please try again.');
      } finally {
        setIsUploading(false);
      }
    };

    // Insert image into content
    const insertImageIntoContent = (image) => {
      console.log('Inserting image into content:', image.id);
      const editor = contentRef.current;
      if (editor) {
        const selection = window.getSelection();
        let range;
        
        if (selection.rangeCount > 0) {
          range = selection.getRangeAt(0);
        } else {
          range = document.createRange();
          range.selectNodeContents(editor);
          range.collapse(false);
        }
        
        // Create image element
        const img = document.createElement('img');
        img.id = `img-${image.id}`;
        img.src = image.src;
        img.alt = image.alt;
        img.className = `editor-image size-${image.size} position-${image.position}`;
        img.setAttribute('data-size', image.size);
        img.setAttribute('data-position', image.position);
        img.style.cssText = `
          cursor: pointer; 
          border-radius: 8px; 
          max-width: 100%; 
          height: auto;
          border: 2px solid transparent;
          transition: all 0.2s ease;
          width: 400px;
        `;
        
        // Add click handler for selection
        img.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('Image clicked! ID:', image.id);
          selectImage(image.id);
          return false;
        };
        
        // Insert image
        range.deleteContents();
        range.insertNode(img);
        
        // Add space after image
        const textNode = document.createTextNode(' ');
        range.setStartAfter(img);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        
        setContent(editor.innerHTML);
        console.log('Image inserted successfully');
      }
    };

    // Select image - WORKING VERSION
    const selectImage = (imageId) => {
      console.log('=== SELECT IMAGE CALLED ===');
      console.log('Image ID:', imageId);
      
      setSelectedImageId(imageId);
      
      // Clean up previous selections
      document.querySelectorAll('.selected-image').forEach(el => {
        el.classList.remove('selected-image');
        el.style.border = '2px solid transparent';
        el.style.boxShadow = 'none';
      });
      
      document.querySelectorAll('.image-toolbar').forEach(el => el.remove());
      document.querySelectorAll('.image-handle').forEach(el => el.remove());
      
      // Find the image
      const img = document.getElementById(`img-${imageId}`);
      console.log('Found image element:', img);
      
      if (!img) {
        console.error('Image not found!');
        return;
      }
      
      // Add selection styling
      img.classList.add('selected-image');
      img.style.border = '2px solid #4285f4';
      img.style.boxShadow = '0 0 0 2px rgba(66, 133, 244, 0.25)';
      console.log('Added selection styling');
      
      // Get image position
      const rect = img.getBoundingClientRect();
      console.log('Image rect:', rect);
      
      // Create toolbar
      const toolbar = document.createElement('div');
      toolbar.className = 'image-toolbar';
      toolbar.innerHTML = `
        <button onclick="window.resizeImageTo('${imageId}', 'small')" style="background: #333; color: white; border: none; padding: 4px 8px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">Small</button>
        <button onclick="window.resizeImageTo('${imageId}', 'medium')" style="background: #333; color: white; border: none; padding: 4px 8px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">Medium</button>
        <button onclick="window.resizeImageTo('${imageId}', 'large')" style="background: #333; color: white; border: none; padding: 4px 8px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">Large</button>
        <button onclick="window.resizeImageTo('${imageId}', 'full')" style="background: #333; color: white; border: none; padding: 4px 8px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">Full</button>
        <span style="color: #666; margin: 0 8px;">|</span>
        <button onclick="window.positionImageTo('${imageId}', 'left')" style="background: #333; color: white; border: none; padding: 4px 8px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">← Left</button>
        <button onclick="window.positionImageTo('${imageId}', 'center')" style="background: #333; color: white; border: none; padding: 4px 8px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">Center</button>
        <button onclick="window.positionImageTo('${imageId}', 'right')" style="background: #333; color: white; border: none; padding: 4px 8px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">Right →</button>
        <button onclick="window.deselectImage()" style="background: #d32f2f; color: white; border: none; padding: 4px 8px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">×</button>
      `;
      
      toolbar.style.cssText = `
        position: fixed;
        top: ${rect.top - 50}px;
        left: ${rect.left}px;
        background: rgba(0,0,0,0.9);
        padding: 8px;
        border-radius: 6px;
        z-index: 10000;
        display: flex;
        align-items: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      
      document.body.appendChild(toolbar);
      console.log('Toolbar created and added to body');
      
      // Create handles
      const handlePositions = [
        { class: 'nw', top: rect.top - 6, left: rect.left - 6 },
        { class: 'ne', top: rect.top - 6, left: rect.right - 6 },
        { class: 'sw', top: rect.bottom - 6, left: rect.left - 6 },
        { class: 'se', top: rect.bottom - 6, left: rect.right - 6 }
      ];
      
      handlePositions.forEach(pos => {
        const handle = document.createElement('div');
        handle.className = `image-handle handle-${pos.class}`;
        handle.style.cssText = `
          position: fixed;
          top: ${pos.top}px;
          left: ${pos.left}px;
          width: 12px;
          height: 12px;
          background: #4285f4;
          border: 2px solid white;
          border-radius: 50%;
          cursor: ${pos.class}-resize;
          z-index: 10001;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(handle);
        console.log(`Created ${pos.class} handle at`, pos.top, pos.left);
      });
      
      console.log('=== SELECT IMAGE COMPLETE ===');
    };

    // Make functions globally available
    useEffect(() => {
      window.resizeImageTo = (imageId, size) => {
        console.log('Resizing image', imageId, 'to', size);
        const img = document.getElementById(`img-${imageId}`);
        if (img) {
          const sizeMap = {
            small: '200px',
            medium: '400px', 
            large: '600px',
            full: '100%'
          };
          img.style.width = sizeMap[size];
          
          if (contentRef.current) {
            setContent(contentRef.current.innerHTML);
          }
          
          // Refresh selection
          setTimeout(() => selectImage(imageId), 10);
        }
      };
      
      window.positionImageTo = (imageId, position) => {
        console.log('Positioning image', imageId, 'to', position);
        const img = document.getElementById(`img-${imageId}`);
        if (img) {
          if (position === 'left') {
            img.style.float = 'left';
            img.style.margin = '0 15px 15px 0';
            img.style.display = 'block';
          } else if (position === 'right') {
            img.style.float = 'right';
            img.style.margin = '0 0 15px 15px';
            img.style.display = 'block';
          } else {
            img.style.float = 'none';
            img.style.margin = '15px auto';
            img.style.display = 'block';
          }
          
          if (contentRef.current) {
            setContent(contentRef.current.innerHTML);
          }
          
          // Refresh selection
          setTimeout(() => selectImage(imageId), 10);
        }
      };
      
      window.deselectImage = () => {
        console.log('Deselecting image');
        setSelectedImageId(null);
        document.querySelectorAll('.selected-image').forEach(el => {
          el.classList.remove('selected-image');
          el.style.border = '2px solid transparent';
          el.style.boxShadow = 'none';
        });
        document.querySelectorAll('.image-toolbar').forEach(el => el.remove());
        document.querySelectorAll('.image-handle').forEach(el => el.remove());
      };
      
      // Cleanup
      return () => {
        delete window.resizeImageTo;
        delete window.positionImageTo;
        delete window.deselectImage;
        document.querySelectorAll('.image-toolbar').forEach(el => el.remove());
        document.querySelectorAll('.image-handle').forEach(el => el.remove());
      };
    }, []);

    // Text formatting functions
    const applyFormat = (command) => {
      document.execCommand(command, false, null);
      if (contentRef.current) {
        setContent(contentRef.current.innerHTML);
      }
    };

    const handleSave = () => {
      console.log('Saving post...');
      onSave?.({
        title,
        content: contentRef.current?.innerHTML || content,
        isFeatured: false
      });
    };

    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Create Blog Post</h2>
          
          <input
            type="text"
            className="w-full p-3 border rounded-lg mb-4"
            placeholder="Enter post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Text Formatting Toolbar */}
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
            <button onClick={() => applyFormat('bold')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100">
              <Bold size={16} />
            </button>
            <button onClick={() => applyFormat('italic')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100">
              <Italic size={16} />
            </button>
            <button onClick={() => applyFormat('underline')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100">
              <Underline size={16} />
            </button>
            <div className="border-l mx-2"></div>
            <button onClick={() => applyFormat('justifyLeft')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100">
              <AlignLeft size={16} />
            </button>
            <button onClick={() => applyFormat('justifyCenter')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100">
              <AlignCenter size={16} />
            </button>
            <button onClick={() => applyFormat('justifyRight')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100">
              <AlignRight size={16} />
            </button>
          </div>

          {/* Image Upload */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload size={16} />
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Upload an image, then click on it to resize and position it.
            </p>
          </div>

          {/* Content Editor */}
          <div
            ref={contentRef}
            className="w-full min-h-96 p-4 border rounded-lg bg-white"
            contentEditable
            suppressContentEditableWarning={true}
            onInput={handleContentChange}
            dangerouslySetInnerHTML={{ __html: content || '<p>Start writing your blog post here...</p>' }}
            style={{
              direction: 'ltr',
              textAlign: 'left',
              unicodeBidi: 'normal',
              writingMode: 'horizontal-tb'
            }}
          />

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button 
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Post
            </button>
            <button 
              onClick={onCancel}
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };





  // Dashboard Component
  const Dashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-6">Social Engagement Hub</h1>
        
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button 
            onClick={() => { setContentType('post'); setIsCreating(true); }}
            className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center gap-3"
          >
            <Plus size={24} />
            <span className="font-semibold">Create Post</span>
          </button>
          
          <button 
            onClick={() => { setContentType('email'); setIsCreating(true); }}
            className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center gap-3"
          >
            <Send size={24} />
            <span className="font-semibold">Send Campaign</span>
          </button>
          
          <button 
            onClick={() => { setContentType('scheduled'); setIsCreating(true); }}
            className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center gap-3"
          >
            <Clock size={24} />
            <span className="font-semibold">Schedule Content</span>
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Posts</h3>
            <p className="text-2xl font-bold text-blue-600">{posts.length}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Featured Posts</h3>
            <p className="text-2xl font-bold text-orange-600">{posts.filter(p => p.isFeatured).length}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Members</h3>
            <p className="text-2xl font-bold text-purple-600">{members.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Comments</h3>
            <p className="text-2xl font-bold text-green-600">0</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Star className="text-yellow-500" />
              Featured Posts
            </h2>
            <div className="space-y-3">
              {posts.filter(post => post.isFeatured).map((post, index) => (
                <div key={index} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="text-yellow-600" size={16} />
                    <span className="text-xs font-semibold text-yellow-600 uppercase">Featured Post</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{post.date}</p>
                  <p className="text-gray-700">{post.content}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MessageSquare size={14} />
                      0 Comments
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Recent Posts</h2>
            <div className="space-y-3">
              {posts.filter(post => !post.isFeatured).map((post, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{post.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">{post.date}</p>
                      <p className="text-gray-700">{post.content}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit size={16} />
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Content Editor Router
  const ContentEditor = () => {
    if (contentType === 'post') {
      return (
        <RichBlogEditor
          onSave={(postData) => {
            setPosts(prev => [{ ...postData, date: new Date().toLocaleDateString() }, ...prev]);
            setIsCreating(false);
          }}
          onCancel={() => setIsCreating(false)}
        />
      );
    }
    return <div>Other content types coming soon...</div>;
  };

  // Handle save functionality
  const handleSave = (data) => {
    if (contentType === 'post') {
      setPosts(prev => [{ ...data, date: new Date().toLocaleDateString() }, ...prev]);
    }
    setIsCreating(false);
  };

  // Post Card Component
  const PostCard = ({ post }) => (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold">{post.title}</h3>
          <p className="text-sm text-gray-500 mb-2">{post.date}</p>
          <p className="text-gray-700">{post.content}</p>
        </div>
        <div className="flex gap-2 ml-4">
          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
            <Edit size={16} />
          </button>
          <button className="p-1 text-red-600 hover:bg-red-50 rounded">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );



  // Main render
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800">Social Hub</h2>
        </div>
        
        <nav className="px-4 pb-6">
          {[
            { id: 'dashboard', icon: Home, label: 'Dashboard' },
            { id: 'newsfeed', icon: MessageSquare, label: 'News Feed' },
            { id: 'posts', icon: FileText, label: 'Blog Posts' },
            { id: 'campaigns', icon: Mail, label: 'Email Campaigns' },
            { id: 'members', icon: Users, label: 'Members' },
            { id: 'calendar', icon: Calendar, label: 'Calendar' },
            { id: 'analytics', icon: BarChart3, label: 'Analytics' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeSection === item.id 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 p-8">
        {isCreating ? (
          <ContentEditor />
        ) : (
          <>
            {activeSection === 'dashboard' && <Dashboard />}
            {activeSection === 'newsfeed' && <NewsFeed />}
            {activeSection === 'settings' && <SettingsSection />}
            {activeSection === 'posts' && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Blog Posts</h2>
                  <button
                    onClick={() => { setContentType('post'); setIsCreating(true); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus size={20} /> New Post
                  </button>
                </div>
                <div className="space-y-3">
                  {posts.map((post, index) => (
                    <PostCard key={index} post={post} />
                  ))}
                </div>
              </div>
            )}
            {activeSection === 'campaigns' && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Email Campaigns</h2>
                  <button
                    onClick={() => { setContentType('email'); setIsCreating(true); }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                  >
                    <Send size={20} /> New Campaign
                  </button>
                </div>
                {campaigns.length === 0 && (
                  <p className="text-gray-500">No campaigns yet. Create your first one!</p>
                )}
              </div>
            )}
            {activeSection === 'members' && <MembersSection />}


            {activeSection === 'calendar' && <CalendarSection />}
            {activeSection === 'analytics' && <AnalyticsSection />}
          </>
        )}
      </div>
    </div>
  );
};

export default App;
