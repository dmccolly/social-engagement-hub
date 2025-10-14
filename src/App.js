import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { 
  Home, FileText, Mail, Users, Settings, Calendar, BarChart3, 
  Plus, Edit, Trash2, Search, Bell, Upload, Send, Clock, 
  CheckCircle, X, ChevronDown, MessageSquare, Heart, BookmarkPlus,
  Image, Film, Music, Link, Bold, Italic, Underline, Type,
  Palette, AlignLeft, AlignCenter, AlignRight, List, Eye,
  Star, Sparkles, Crown, Copy, ExternalLink, Zap, TrendingUp,
  UserPlus, Award, Target, Activity, Download, Play, Shield
} from 'lucide-react';
import { uploadImageToCloudinary, uploadImageWithProgress } from './services/cloudinaryService';
import { uploadImageWithDeduplication, getImageStats } from './services/imageDeduplicationService';
import { createBlogPost, updateBlogPost, getPublishedPosts, publishBlogPost, deleteBlogPost } from './services/xanoService';

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
    const loadPosts = async () => {
      try {
        setDebugInfo('Loading posts from XANO...');
        console.log('Widget: Loading posts from XANO...');
        
        // Try to fetch from XANO first
        try {
          const result = await getPublishedPosts(settings.postCount, 0);
          if (result.success && result.posts && result.posts.length > 0) {
            const formattedPosts = result.posts.map(post => ({
              id: post.id,
              title: post.title,
              content: post.content,
              excerpt: (() => {
                   if (post.excerpt) return post.excerpt;
                   if (!post.content) return 'Read more to discover the full story...';
                   // Strip HTML tags and get first 300 characters
                   const tempDiv = document.createElement('div');
                   tempDiv.innerHTML = post.content;
                   const textContent = tempDiv.textContent || tempDiv.innerText || '';
                   return textContent.substring(0, 300).trim() + '...';
                 })(),
              date: new Date(post.published_at || post.created_at).toLocaleDateString(),
              isFeatured: post.featured || false,
              imageUrl: post.image_url,
              author: post.author,
              readTime: post.read_time || '3 min read'
            }));
            
            setPosts(formattedPosts);
            setDebugInfo(`Loaded ${formattedPosts.length} posts from XANO`);
            setIsLoading(false);
            return;
          }
        } catch (xanoError) {
          console.log('XANO fetch failed, falling back to localStorage:', xanoError);
        }
        
        // Fallback to localStorage
        console.log('Widget: Falling back to localStorage...');
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

    // Listen for storage changes (fallback)
    const handleStorageChange = (e) => {
      if (e.key && ['socialHubPosts', 'blogPosts', 'posts'].includes(e.key)) {
        loadPosts();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Widget: Page visible, refreshing posts...');
        loadPosts();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Refresh every 5 seconds
    const interval = setInterval(loadPosts, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: settings.transparent ? 'transparent' : '#ffffff',
      borderRadius: `${settings.borderRadius}px`,
      boxShadow: settings.transparent ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Header - Consistent with other widgets */}
      <div style={{
        backgroundColor: settings.headerColor,
        color: 'white',
        padding: '16px 20px',
        borderRadius: `${settings.borderRadius}px`,
        marginBottom: '24px',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: '18px'
      }}>
        {settings.headerText}
      </div>

      {/* Posts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {posts.map((post, index) => (
          <article key={post.id || index} style={{
            background: settings.transparent ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 250, 251, 0.95))' : 'linear-gradient(135deg, #ffffff, #f9fafb)',
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
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '12px',
                lineHeight: '1.4',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
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
                  fontSize: '15px',
                  color: '#6b7280'
                }}>
                  <span>📅 {post.date}</span>
                  {post.author && <span>✍️ {post.author}</span>}
                  {post.readTime && <span>⏱️ {post.readTime}</span>}
                </div>
              )}

                 {/* Excerpt */}
                 {settings.showExcerpts && (
                   <div 
                     style={{
                       fontSize: '15px',
                       lineHeight: '1.7',
                       color: '#4b5563',
                       marginBottom: '16px',
                       fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                     }}
                     dangerouslySetInnerHTML={{
                          __html: post.excerpt || ''
                     }}
                   />
                 )}

              {/* Read More Link */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <a href={post.url || `https://gleaming-cendol-417bf3.netlify.app/post/${post.id}`} target="_blank" rel="noopener noreferrer" style={{
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
                    fontSize: '15px',
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
          color: '#4b5563',
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
                
                <div className="text-gray-700 mb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />
                
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

// Standalone Social Hub Widget for Embedding
const StandaloneSocialHubWidget = () => {
  // State Management (simplified for embed)
  const [activeSection, setActiveSection] = useState('dashboard');
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load posts from XANO
    useEffect(() => {
      const loadPosts = async () => {
        try {
          const result = await getPublishedPosts(10, 0);
          if (result.success && result.posts && result.posts.length > 0) {
            const formattedPosts = result.posts.map(post => ({
              id: post.id,
              title: post.title,
              content: post.content,
              excerpt: post.excerpt || (post.content ? post.content.substring(0, 200) + '...' : ''),
              date: new Date(post.published_at || post.created_at).toLocaleDateString(),
              author: post.author || 'Admin User',
              readTime: post.read_time || '3 min read',
              isFeatured: post.featured || false,
              image: post.image_url || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop'
            }));
            setPosts(formattedPosts);
          }
        } catch (error) {
          console.error('Error loading posts for embedded hub:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadPosts();
      const interval = setInterval(loadPosts, 30000);
      return () => clearInterval(interval);
    }, []);

  // Navigation items for embed version
  const navigationItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'newsfeed', icon: MessageSquare, label: 'News Feed' },
    { id: 'posts', icon: FileText, label: 'Blog Posts' },
    { id: 'members', icon: Users, label: 'Members' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' }
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Compact Header for Embed */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-blue-600" size={20} />
            Social Hub
          </h1>
          <div className="text-xs text-gray-500">
            Powered by Social Engagement Platform
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-60px)]">
        {/* Compact Sidebar */}
        <div className="w-48 bg-white shadow-sm border-r border-gray-200">
          <nav className="p-3 space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                  activeSection === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <item.icon size={16} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 overflow-auto">
          {activeSection === 'dashboard' && <Dashboard />}
          {activeSection === 'newsfeed' && <NewsFeed />}
          {activeSection === 'posts' && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-bold mb-4">Blog Posts</h2>
              <div className="space-y-3">
                {posts.map((post, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex gap-4">
                      {post.image && (
                        <img src={post.image} alt={post.title} className="w-20 h-20 object-cover rounded" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
                        <div className="text-sm text-gray-600 mb-2" dangerouslySetInnerHTML={{ __html: post.content }} />
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{post.author}</span>
                          <span>{post.date}</span>
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeSection === 'members' && <MembersSection />}
          {activeSection === 'calendar' && <CalendarSection />}
          {activeSection === 'analytics' && <AnalyticsSection />}
        </div>
      </div>
    </div>
  );
};


// Single Post View Component - displays individual blog post
const SinglePostView = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Get post ID from URL path
    const pathParts = window.location.pathname.split('/');
    const postId = pathParts[pathParts.length - 1];
    
    if (!postId || postId === 'post') {
      setError('No post ID provided');
      setLoading(false);
      return;
    }
    
    // Fetch post from XANO
    const XANO_BASE_URL = 'https://xajo-bs7d-cagt.n7e.xano.io/api:pYeQctVX';
    
    fetch(`${XANO_BASE_URL}/asset/${postId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Post not found');
        }
        return response.json();
      })
      .then(data => {
        setPost(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading post:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600">Loading post...</div>
        </div>
      </div>
    );
  }
  
  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">
            {error || 'Post not found'}
          </div>
          <a 
            href="https://gleaming-cendol-417bf3.netlify.app/"
            className="text-blue-600 hover:underline"
          >
            ← Back to Social Hub
          </a>
        </div>
      </div>
    );
  }
  
  const date = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header with back link */}
        <div className="mb-6">
          <a 
            href="https://gleaming-cendol-417bf3.netlify.app/"
            className="text-blue-600 hover:underline flex items-center gap-2"
          >
            ← Back to Social Hub
          </a>
        </div>
        
        {/* Post content */}
        <article className="bg-white rounded-lg shadow-lg p-8">
          {/* Title and meta */}
          <header className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {post.title}
              {post.is_featured && (
                <span className="ml-3 inline-block bg-yellow-400 text-yellow-900 px-3 py-1 rounded text-sm font-semibold">
                  FEATURED
                </span>
              )}
            </h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span>{post.submitted_by || 'Editorial Team'}</span>
              <span>•</span>
              <span>{date}</span>
            </div>
          </header>
          
          {/* Post body with HTML formatting preserved */}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.description }}
            style={{
              lineHeight: '1.8',
              fontSize: '16px'
            }}
          />
        </article>
      </div>
    </div>
  );
};

const App = () => {
  // Check if this is a widget route
  const currentPath = window.location.pathname;
  
    // Individual post routing
    if (currentPath.startsWith('/post/')) {
      return <SinglePostView />;
    }
    
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
  if (currentPath === '/widget/socialhub') {
    return <StandaloneSocialHubWidget />;
  }

  // State Management
  const [activeSection, setActiveSection] = useState('dashboard');
     // Load posts from localStorage or use default posts
     const loadPostsFromStorage = () => {
       try {
         const stored = localStorage.getItem('socialHubPosts');
         if (stored) {
           const parsed = JSON.parse(stored);
           if (Array.isArray(parsed) && parsed.length > 0) {
             return parsed;
           }
         }
       } catch (err) {
         console.error('Failed to load posts from localStorage', err);
       }
       
       // Return empty array - posts will be loaded from Xano
          return [];
     };
     
     const [posts, setPosts] = useState(loadPostsFromStorage());

    // Load posts from XANO on mount
    useEffect(() => {
      const loadPostsFromXano = async () => {
        try {
            console.log("🚀 [TIMESTAMP] Loading posts at:", new Date().toISOString());
          const result = await getPublishedPosts(50, 0);
            console.log("🔍 XANO API Response:", JSON.stringify(result, null, 2));
            console.log("📊 Posts array:", result.posts);
          if (result.success && result.posts) {
            console.log("✨ Condition check - success:", result.success, "posts exists:", !!result.posts, "posts is array:", Array.isArray(result.posts));
            console.log('Loaded posts from XANO:', result.posts);
            setPosts(result.posts);
              console.log("🎯 setPosts called with", result.posts.length, "posts");
          }
        } catch (error) {
          console.error('Failed to load posts from XANO:', error);
        }
      };
      
      loadPostsFromXano();
    }, []);

  const [campaigns, setCampaigns] = useState([]);
  // Sync blog posts to localStorage so the /widget/blog iframe can read them
  const mapPostsForWidget = (list) =>
    (list || []).map((p, idx) => {
      const plainText = (p?.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      const words = plainText ? plainText.split(' ').filter(Boolean).length : 0;
      const readTime = `${Math.max(1, Math.ceil(words / 200))} min read`;
      return {
        id: p?.id ?? idx + 1,
        title: p?.title || 'Untitled',
        content: p?.content || '',
        excerpt: p?.excerpt || (plainText ? `${plainText.slice(0, 200)}...` : ''),
        date: p?.date || new Date().toLocaleDateString(),
        isFeatured: !!p?.isFeatured,
        imageUrl: p?.imageUrl || p?.image || null,
        author: p?.author || 'Editorial Team',
        readTime: p?.readTime || readTime,
      };
    });

  useEffect(() => {
    try {
      const mapped = mapPostsForWidget(posts);
      localStorage.setItem('socialHubPosts', JSON.stringify(mapped));
    } catch (err) {
      console.error('Failed to sync posts to localStorage', err);
    }
  }, [posts]);

  const [members, setMembers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
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
      },
      socialhub: {
        headerColor: '#1f2937',
        headerText: '🌐 Social Hub',
        borderRadius: 8,
        transparent: false,
        showBranding: true,
        compactMode: false
      }
    });

    const generateEmbedCode = (type, format = 'standard') => {
      const settings = widgetSettings[type];
      const settingsParam = encodeURIComponent(JSON.stringify(settings));
      
      // Use production URL - will be automatically updated when deployed
      const baseUrl = window.location.hostname === 'localhost' 
        ? 'https://your-netlify-app.netlify.app' 
        : window.location.origin;
      
      // Special handling for full social hub embed
      if (type === 'socialhub') {
        switch (format) {
          case 'standard':
            return `<iframe src="${baseUrl}" width="100%" height="800" frameborder="0" style="border-radius: 8px; border: 1px solid #e5e7eb;"></iframe>`;
          case 'responsive':
            return `<div style="position: relative; width: 100%; height: 0; padding-bottom: 100%; overflow: hidden; border-radius: 8px;">
  <iframe src="${baseUrl}" 
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 1px solid #e5e7eb;" 
          allowfullscreen>
  </iframe>
</div>`;
          case 'direct':
            return baseUrl;
          default:
            return '';
        }
      }
      
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
      { id: 'newsfeed', name: 'News Feed', icon: MessageSquare, description: 'Community posts and engagement feed' },
      { id: 'socialhub', name: 'Full Social Hub', icon: Users, description: 'Embed the complete social engagement platform' }
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
                  {selectedWidget === 'socialhub' && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Full Social Hub Embed</h4>
                      <p className="text-sm text-blue-700 mb-3">
                        This embeds the complete social engagement platform including dashboard, 
                        blog posts, calendar, members area, and all interactive features.
                      </p>
                      <div className="text-xs text-blue-600">
                        <strong>Recommended dimensions:</strong> 100% width × 800px height minimum
                      </div>
                    </div>
                  )}

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
                
                <div className="mb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />
                
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
  const RichBlogEditor = ({ onSave, onCancel, editingPost = null }) => {
    const [title, setTitle] = useState(editingPost?.title || '');
    const [content, setContent] = useState(editingPost?.content || '');
    const [isFeatured, setIsFeatured] = useState(editingPost?.isFeatured || false);
    const [isPinned, setIsPinned] = useState(editingPost?.isPinned || false);
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [showYouTubeDialog, setShowYouTubeDialog] = useState(false);
    const [showMediaDialog, setShowMediaDialog] = useState(false);
    const [showToolbar, setShowToolbar] = useState(true); // Always visible now
    const [showVimeoDialog, setShowVimeoDialog] = useState(false);
    const [vimeoUrl, setVimeoUrl] = useState('');
    const [previewSize, setPreviewSize] = useState('mobile');
    const [linkData, setLinkData] = useState({ text: '', url: '' });
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [mediaData, setMediaData] = useState({ type: 'audio', url: '', title: '' });
    const fileInputRef = useRef(null);
    const mediaInputRef = useRef(null);
    const contentRef = useRef(null);
    const savedRangeRef = useRef(null); // Store the selection range

    // Handle content change - FIXED for backwards typing
    const handleContentChange = (e) => {
      // Remove placeholder when user starts typing
      const placeholderElement = e.target.querySelector('.placeholder-text');
      if (placeholderElement) {
        placeholderElement.remove();
      }
      
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

       // Set initial content only once
       useEffect(() => {
         if (contentRef.current && !contentRef.current.innerHTML) {
           contentRef.current.innerHTML = content || '<p class="placeholder-text" style="color: #9ca3af; font-style: italic;">Start writing your blog post here...</p>';
         }
       }, []);
       
       // Update content only when editing post
       useEffect(() => {
         if (editingPost && contentRef.current) {
           contentRef.current.innerHTML = content || '<p class="placeholder-text" style="color: #9ca3af; font-style: italic;">Start writing your blog post here...</p>';
         }
       }, [editingPost]);


    // Handle file upload with Cloudinary
    const handleFileUpload = async (event) => {
      const files = Array.from(event.target.files);
      if (!files.length) return;

      console.log(`Uploading ${files.length} file(s)`);
      setIsUploading(true);

      // Validate file types and sizes
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes

      for (const file of files) {
        if (!validTypes.includes(file.type)) {
          alert(`${file.name}: Please upload a valid image file (JPG, PNG, GIF, or WEBP)`);
          setIsUploading(false);
          return;
        }

        if (file.size > maxSize) {
          alert(`${file.name}: File size must be less than 50MB`);
          setIsUploading(false);
          return;
        }
      }

      try {
        // Upload files sequentially
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          console.log(`Uploading file ${i + 1}/${files.length}: ${file.name}`);
          
          // Upload to Cloudinary
          const result = await uploadImageWithDeduplication(file);

          if (!result.success) {
            throw new Error(result.error || 'Upload failed');
          }

             // Log whether this was a duplicate or new upload
             if (result.isDuplicate) {
               console.log(`✓ Reused existing image (used ${result.useCount} times):`, result.url);
             } else {
               console.log('✓ New image uploaded:', result.url);
             }
             
             console.log('Upload result:', result);

          // Create image object with Cloudinary URL
          const newImage = {
            id: Date.now() + i, // Unique ID for each image
            src: result.url, // Permanent Cloudinary URL
            alt: file.name,
            size: 'medium',
            position: 'center',
            width: result.width,
            height: result.height,
          };
          
          console.log('Created image object:', newImage);
          insertImageIntoContent(newImage);
        }
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        console.log(`${files.length} image(s) uploaded successfully to Cloudinary!`);
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Upload failed: ${error.message}`);
      } finally {
        setIsUploading(false);
      }
    };

    // Insert image into content
    const insertImageIntoContent = (image) => {
      console.log('Inserting image into content:', image.id);
      const editor = contentRef.current;
      if (!editor) {
        console.error('Editor not found!');
        return;
      }
      
      console.log('Editor element:', editor);
      console.log('Editor innerHTML before:', editor.innerHTML);
      
      // Focus the editor first
      editor.focus();
      
      // Get current selection or create one at the end
      const selection = window.getSelection();
      let range;
      
      if (selection.rangeCount > 0 && editor.contains(selection.anchorNode)) {
        range = selection.getRangeAt(0);
        console.log('Using existing selection');
      } else {
        // Create range at end of editor content
        range = document.createRange();
        const lastChild = editor.lastChild;
        if (lastChild) {
          if (lastChild.nodeType === Node.TEXT_NODE) {
            range.setStart(lastChild, lastChild.textContent.length);
          } else {
            range.setStartAfter(lastChild);
          }
        } else {
          range.selectNodeContents(editor);
        }
        range.collapse(true);
        console.log('Created new range at end');
      }
      
      // Create image element with unique ID
      const imageId = image.id;
      const img = document.createElement('img');
      img.src = image.src;
      img.id = `img-${imageId}`;
      img.alt = image.alt || 'Uploaded image';
      img.style.cssText = `
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        display: block;
        margin: 10px 0;
        cursor: pointer;
        border: 2px solid transparent;
        transition: border-color 0.2s;
      `;
      
      console.log('=== CREATING IMAGE ===');
      console.log('Image ID:', imageId);
      console.log('Image element:', img);
      
         
         // Click handler will be attached via event delegation in useEffect
         console.log('Image created with ID:', imageId);
         
      
      // Insert image and line breaks
      const br1 = document.createElement('br');
      const br2 = document.createElement('br');
      
      range.insertNode(br2);
      range.insertNode(img);
      range.insertNode(br1);
      
      // Move cursor after image
      range.setStartAfter(br2);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Update content state
      setContent(editor.innerHTML);
      console.log('Image inserted successfully');
      console.log('Editor innerHTML after:', editor.innerHTML);
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
      
         // Store handles for position updates
         const handles = [];
         
         // Function to update handle and toolbar positions
         const updatePositions = () => {
           const rect = img.getBoundingClientRect();
           handles.forEach(({ pos, el }) => {
             if (pos.class.includes('n')) el.style.top = `${rect.top - 6}px`;
             if (pos.class.includes('s')) el.style.top = `${rect.bottom - 6}px`;
             if (pos.class.includes('w')) el.style.left = `${rect.left - 6}px`;
             if (pos.class.includes('e')) el.style.left = `${rect.right - 6}px`;
           });
           // Update toolbar position
           toolbar.style.top = `${rect.top - 50}px`;
           toolbar.style.left = `${rect.left}px`;
         };
         
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
           
           // Add drag-to-resize functionality
           handle.addEventListener('mousedown', (e) => {
             e.preventDefault();
             e.stopPropagation();
             
             const startX = e.clientX;
             const startWidth = img.offsetWidth;
             
             const onMouseMove = (moveEvt) => {
               const dx = moveEvt.clientX - startX;
               let newWidth;
               
               // Calculate new width based on which handle is being dragged
               if (pos.class.includes('e')) {
                 newWidth = startWidth + dx;
               } else if (pos.class.includes('w')) {
                 newWidth = startWidth - dx;
               } else {
                 newWidth = startWidth;
               }
               
               // Enforce minimum width
               newWidth = Math.max(newWidth, 50);
               
               // Apply new width
               img.style.width = `${newWidth}px`;
               img.style.height = 'auto';
               
               // Update handle and toolbar positions
               updatePositions();
             };
             
             const onMouseUp = () => {
               window.removeEventListener('mousemove', onMouseMove);
               window.removeEventListener('mouseup', onMouseUp);
               
               // Save updated content after resizing
               if (contentRef.current) {
                 setContent(contentRef.current.innerHTML);
               }
               
               console.log('Resize complete, content saved');
             };
             
             window.addEventListener('mousemove', onMouseMove);
             window.addEventListener('mouseup', onMouseUp);
           });
           
           document.body.appendChild(handle);
           handles.push({ pos, el: handle });
           console.log(`Created ${pos.class} handle at`, pos.top, pos.left);
         });

      
      console.log('=== SELECT IMAGE COMPLETE ===');
    };

       // Make functions globally available and set up event delegation
       useEffect(() => {
         console.log('Setting up global image functions and event delegation...');
         
         // Event delegation for image clicks
         const editor = contentRef.current;
         let handleImageClick = null;
         
         if (editor) {
           handleImageClick = (e) => {
             // Check if clicked element is an image with our ID format
             if (e.target.tagName === 'IMG' && e.target.id && e.target.id.startsWith('img-')) {
               e.preventDefault();
               e.stopPropagation();
               const imageId = e.target.id.replace('img-', '');
               console.log('Image clicked via delegation! ID:', imageId);
               selectImage(parseInt(imageId));
             }
           };
           
           editor.addEventListener('click', handleImageClick);
           console.log('Event delegation set up for image clicks');
         }
         
         // Set up global functions
         window.selectImage = selectImage;
         
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
                  img.style.display = 'inline-block';
                  img.style.clear = 'left';
                } else if (position === 'right') {
                  img.style.float = 'right';
                  img.style.margin = '0 0 15px 15px';
                  img.style.display = 'inline-block';
                  img.style.clear = 'right';
                } else {
                  img.style.float = 'none';
                  img.style.margin = '15px auto';
                  img.style.display = 'block';
                  img.style.clear = 'both';
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
         
         // Cleanup function
         return () => {
           // Remove event delegation listener
           if (editor && handleImageClick) {
             editor.removeEventListener('click', handleImageClick);
           }
           
           // Clean up global functions
           delete window.selectImage;
           delete window.resizeImageTo;
           delete window.positionImageTo;
           delete window.deselectImage;
           
           // Clean up any leftover UI elements
           document.querySelectorAll('.image-toolbar').forEach(el => el.remove());
           document.querySelectorAll('.image-handle').forEach(el => el.remove());
         };
       }, [selectImage]);

    // Enhanced Link Dialog Functions
    const openLinkDialog = () => {
      const selection = window.getSelection();
      const selectedText = selection.toString();
      
      // Save the current range so we can restore it when inserting the link
      if (selection.rangeCount > 0) {
        savedRangeRef.current = selection.getRangeAt(0).cloneRange();
      }
      
      setLinkData({ text: selectedText || '', url: '' });
      setShowLinkDialog(true);
    };

    const insertLink = () => {
      if (!linkData.text || !linkData.url) return;
      
      const editor = contentRef.current;
      if (editor) {
        const selection = window.getSelection();
        let range;
        
        // Use the saved range if available, otherwise create a new one
        if (savedRangeRef.current) {
          range = savedRangeRef.current;
          selection.removeAllRanges();
          selection.addRange(range);
        } else if (selection.rangeCount > 0) {
          range = selection.getRangeAt(0);
        } else {
          range = document.createRange();
          range.selectNodeContents(editor);
          range.collapse(false);
        }
        
        // Create link element
        const link = document.createElement('a');
        link.href = linkData.url;
        link.textContent = linkData.text;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.style.color = '#2563eb';
        link.style.textDecoration = 'underline';
        
        range.deleteContents();
        range.insertNode(link);
        
        // Add space after link
        const textNode = document.createTextNode(' ');
        range.setStartAfter(link);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        
        setContent(editor.innerHTML);
        
        // Clear the saved range
        savedRangeRef.current = null;
      }
      
      setShowLinkDialog(false);
      setLinkData({ text: '', url: '' });
    };

    // YouTube Embed Functions
    const extractYouTubeId = (url) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    };

    const insertYouTubeVideo = () => {
      const videoId = extractYouTubeId(youtubeUrl);
      if (!videoId) {
        alert('Please enter a valid YouTube URL');
        return;
      }
      
      const editor = contentRef.current;
      if (editor) {
        const selection = window.getSelection();
        let range;
        
        // Use the saved range if available
        if (savedRangeRef.current) {
          range = savedRangeRef.current;
          selection.removeAllRanges();
          selection.addRange(range);
        } else if (selection.rangeCount > 0) {
          range = selection.getRangeAt(0);
        } else {
          range = document.createRange();
          range.selectNodeContents(editor);
          range.collapse(false);
        }
        
        // Create YouTube embed container
        const container = document.createElement('div');
        container.style.cssText = `
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 56.25%;
          margin: 20px 0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        `;
        iframe.allowFullscreen = true;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        
        container.appendChild(iframe);
        
        range.deleteContents();
        range.insertNode(container);
        
        // Add space after video
        const textNode = document.createTextNode('\n\n');
        range.setStartAfter(container);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        
        setContent(editor.innerHTML);
      }
      
      setShowYouTubeDialog(false);
      setYoutubeUrl('');
      savedRangeRef.current = null;
    };

    // Extract Vimeo video ID from URL
    const extractVimeoId = (url) => {
      const regExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
      const match = url.match(regExp);
      return match ? match[1] : null;
    };

    const insertVimeoVideo = () => {
      const videoId = extractVimeoId(vimeoUrl);
      if (!videoId) {
        alert('Please enter a valid Vimeo URL');
        return;
      }
      
      const editor = contentRef.current;
      if (editor) {
        const selection = window.getSelection();
        let range;
        
        // Use the saved range if available
        if (savedRangeRef.current) {
          range = savedRangeRef.current;
          selection.removeAllRanges();
          selection.addRange(range);
        } else if (selection.rangeCount > 0) {
          range = selection.getRangeAt(0);
        } else {
          range = document.createRange();
          range.selectNodeContents(editor);
          range.collapse(false);
        }
        
        // Create Vimeo embed container
        const container = document.createElement('div');
        container.style.cssText = `
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 56.25%;
          margin: 20px 0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        
        const iframe = document.createElement('iframe');
        iframe.src = `https://player.vimeo.com/video/${videoId}`;
        iframe.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        `;
        iframe.allowFullscreen = true;
        iframe.allow = 'autoplay; fullscreen; picture-in-picture';
        
        container.appendChild(iframe);
        
        range.deleteContents();
        range.insertNode(container);
        
        // Add space after video
        const textNode = document.createTextNode('\n\n');
        range.setStartAfter(container);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        
        setContent(editor.innerHTML);
      }
      
      setShowVimeoDialog(false);
      setVimeoUrl('');
      savedRangeRef.current = null;
    };

    // Media File Functions
    const handleMediaUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file size (50MB max)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        alert(`${file.name}: File size must be less than 50MB`);
        return;
      }

      setIsUploading(true);
      
      try {
        const mediaUrl = URL.createObjectURL(file);
        const isVideo = file.type.startsWith('video/');
        const isAudio = file.type.startsWith('audio/');
        
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
          
          // Create media container
          const container = document.createElement('div');
          container.style.cssText = `
            margin: 20px 0;
            padding: 15px;
            border: 2px dashed #d1d5db;
            border-radius: 8px;
            background-color: #f9fafb;
            text-align: center;
          `;
          
          if (isVideo) {
            const video = document.createElement('video');
            video.src = mediaUrl;
            video.controls = true;
            video.style.cssText = `
              max-width: 100%;
              height: auto;
              border-radius: 8px;
            `;
            container.appendChild(video);
          } else if (isAudio) {
            const audio = document.createElement('audio');
            audio.src = mediaUrl;
            audio.controls = true;
            audio.style.cssText = `
              width: 100%;
              margin: 10px 0;
            `;
            
            const title = document.createElement('p');
            title.textContent = file.name;
            title.style.cssText = `
              margin: 10px 0 5px 0;
              font-weight: 600;
              color: #374151;
            `;
            
            container.appendChild(title);
            container.appendChild(audio);
          }
          
          range.deleteContents();
          range.insertNode(container);
          
          // Add space after media
          const textNode = document.createTextNode('\n\n');
          range.setStartAfter(container);
          range.insertNode(textNode);
          range.setStartAfter(textNode);
          range.setEndAfter(textNode);
          selection.removeAllRanges();
          selection.addRange(range);
          
          setContent(editor.innerHTML);
        }
        
        if (mediaInputRef.current) {
          mediaInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Media upload error:', error);
        alert('Media upload failed. Please try again.');
      } finally {
        setIsUploading(false);
      }
    };

    // Text formatting functions
    const applyFormat = (command) => {
      document.execCommand(command, false, null);
      if (contentRef.current) {
        setContent(contentRef.current.innerHTML);
      }
    };

    const handleSave = async (status = 'draft') => {
      console.log('Saving post...');
      
      const postData = {
        title,
        content: contentRef.current?.innerHTML || content,
        author: 'Admin User', // Replace with actual user
        author_avatar: '', // Replace with actual avatar
        category: 'General',
        tags: '',
        image_url: '', // Add featured image if needed
        status: status,
        featured: isFeatured,
        isPinned: isPinned,
      };

      try {
        let result;
        if (editingPost && editingPost.id) {
          // Update existing post
          result = await updateBlogPost(editingPost.id, postData);
          console.log('Post updated:', result);
        } else {
          // Create new post
          result = await createBlogPost(postData);
          console.log('Post created:', result);
        }
        
        // Check if the operation was successful
        if (result && result.success) {
          alert('Post saved successfully!');
        } else {
          // Handle XANO service error
          const errorMessage = result?.error || 'Unknown error occurred';
          console.error('XANO service error:', errorMessage);
          throw new Error(errorMessage);
        }
        
        // Call the original onSave callback
        onSave?.({
          title,
          content: contentRef.current?.innerHTML || content,
          isFeatured: isFeatured,
          isPinned: isPinned,
          status: status
        });
      } catch (error) {
        console.error('Save error:', error);
        alert('Failed to save post. Saving locally instead.');
        
        // Fallback to local save
        onSave?.({
          title,
          content: contentRef.current?.innerHTML || content,
          isFeatured: isFeatured,
          isPinned: isPinned,
          status: status
        });
      }
    };

    const handlePublish = async () => {
      await handleSave('published');
    };

    return (
      <div className="max-w-full mx-auto p-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6 min-h-screen">
            <h2 className="text-2xl font-bold mb-6">Create Blog Post</h2>
          
          <input
            type="text"
            className="w-full p-3 border rounded-lg mb-4"
            placeholder="Enter post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Featured Post Toggle */}
          <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500"
              />
              <Star className={`w-5 h-5 ${isFeatured ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
              <span className="text-sm font-medium text-gray-700">Featured Post</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <Crown className={`w-5 h-5 ${isPinned ? 'text-blue-500 fill-current' : 'text-gray-400'}`} />
              <span className="text-sm font-medium text-gray-700">Pin to Top</span>
            </label>
          </div>

          {/* Enhanced Text Formatting Toolbar - Always Visible */}
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500 transition-all duration-200 toolbar-area">
            {/* Font Controls */}
            <select 
              onChange={(e) => {
                document.execCommand('fontName', false, e.target.value);
                if (contentRef.current) {
                  setContent(contentRef.current.innerHTML);
                }
              }}
              className="px-2 py-1 bg-white border rounded text-sm"
              title="Font Family"
            >
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Verdana">Verdana</option>
              <option value="Courier New">Courier</option>
              <option value="Impact">Impact</option>
              <option value="Comic Sans MS">Comic Sans</option>
            </select>
            
            <select 
              onChange={(e) => {
                document.execCommand('fontSize', false, e.target.value);
                if (contentRef.current) {
                  setContent(contentRef.current.innerHTML);
                }
              }}
              className="px-2 py-1 bg-white border rounded text-sm"
              title="Font Size"
            >
              <option value="1">8pt</option>
              <option value="2">10pt</option>
              <option value="3" selected>12pt</option>
              <option value="4">14pt</option>
              <option value="5">18pt</option>
              <option value="6">24pt</option>
              <option value="7">36pt</option>
            </select>
            
            <div className="border-l mx-2"></div>
            
            {/* Text Formatting */}
            <button onClick={() => applyFormat('bold')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Bold">
              <Bold size={16} />
            </button>
            <button onClick={() => applyFormat('italic')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Italic">
              <Italic size={16} />
            </button>
            <button onClick={() => applyFormat('underline')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Underline">
              <Underline size={16} />
            </button>
            
            <div className="border-l mx-2"></div>
            
            {/* Lists */}
            <button onClick={() => applyFormat('insertUnorderedList')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Bullet Points">
              <span className="text-sm font-bold">•</span>
            </button>
            <button onClick={() => applyFormat('insertOrderedList')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Numbered List">
              <span className="text-sm font-bold">1.</span>
            </button>
            
            <div className="border-l mx-2"></div>
            
            {/* Text Color */}
            <div className="relative">
              <input
                type="color"
                onChange={(e) => {
                  document.execCommand('foreColor', false, e.target.value);
                  if (contentRef.current) {
                    setContent(contentRef.current.innerHTML);
                  }
                }}
                className="w-8 h-8 border rounded cursor-pointer"
                title="Text Color"
              />
            </div>
            <div className="relative">
              <input
                type="color"
                onChange={(e) => {
                  document.execCommand('hiliteColor', false, e.target.value);
                  if (contentRef.current) {
                    setContent(contentRef.current.innerHTML);
                  }
                }}
                className="w-8 h-8 border rounded cursor-pointer"
                title="Highlight Color"
              />
            </div>
            
            <div className="border-l mx-2"></div>
            
            {/* Alignment */}
            <button onClick={() => applyFormat('justifyLeft')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Align Left">
              <AlignLeft size={16} />
            </button>
            <button onClick={() => applyFormat('justifyCenter')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Center">
              <AlignCenter size={16} />
            </button>
            <button onClick={() => applyFormat('justifyRight')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Align Right">
              <AlignRight size={16} />
            </button>
            
            <div className="border-l mx-2"></div>
            
            {/* Links and Media */}
            <button onClick={openLinkDialog} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Insert Link">
              <ExternalLink size={16} />
            </button>
            <button onClick={() => {
             const selection = window.getSelection();
             if (selection.rangeCount > 0) {
               savedRangeRef.current = selection.getRangeAt(0).cloneRange();
             }
             setShowYouTubeDialog(true);
           }} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Insert YouTube Video">
              <Play size={16} />
            </button>
            <button onClick={() => {
             const selection = window.getSelection();
             if (selection.rangeCount > 0) {
               savedRangeRef.current = selection.getRangeAt(0).cloneRange();
             }
             setShowVimeoDialog(true);
           }} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Insert Vimeo Video">
              <Film size={16} />
            </button>
            <button onClick={() => mediaInputRef.current?.click()} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Insert Audio/Video File">
              <Music size={16} />
            </button>
            </div>
          )}

          {/* File Upload Inputs */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
            />
            <input
              type="file"
              ref={mediaInputRef}
              onChange={handleMediaUpload}
              accept="audio/*,video/*,.mp4,.mp3,.wav,.avi,.mov,.wmv,.flv,.webm,.ogg"
              style={{ display: 'none' }}
            />
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 mr-3"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload size={16} />
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Upload images, audio, or video files. Use the toolbar buttons for links and YouTube videos.
            </p>
          </div>

          {/* Content Editor */}
          <div
            ref={contentRef}
            className="w-full max-w-6xl min-h-[800px] p-8 border rounded-lg bg-white focus:border-blue-500 transition-colors text-lg leading-relaxed"
            contentEditable
            suppressContentEditableWarning={true}
            onInput={handleContentChange}
            onFocus={() => {
              // Remove placeholder on focus
              const placeholderElement = contentRef.current?.querySelector('.placeholder-text');
              if (placeholderElement) {
                placeholderElement.remove();
              }
            }}
            style={{
              direction: 'ltr',
              textAlign: 'left',
              unicodeBidi: 'normal',
              writingMode: 'horizontal-tb'
            }}
          />

          {/* Link Dialog Modal */}
          {showLinkDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link Text</label>
                    <input
                      type="text"
                      value={linkData.text}
                      onChange={(e) => setLinkData(prev => ({ ...prev, text: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter the text to display"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                    <input
                      type="url"
                      value={linkData.url}
                      onChange={(e) => setLinkData(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={insertLink}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Insert Link
                  </button>
                  <button
                    onClick={() => setShowLinkDialog(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* YouTube Dialog Modal */}
          {showYouTubeDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Insert YouTube Video</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Paste any YouTube URL (watch, share, or embed format)
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={insertYouTubeVideo}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Insert Video
                  </button>
                  <button
                    onClick={() => setShowYouTubeDialog(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Vimeo Video Dialog */}
          {showVimeoDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Insert Vimeo Video</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vimeo URL</label>
                    <input
                      type="url"
                      value={vimeoUrl}
                      onChange={(e) => setVimeoUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://vimeo.com/123456789"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Paste any Vimeo URL
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={insertVimeoVideo}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Insert Video
                  </button>
                  <button
                    onClick={() => setShowVimeoDialog(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button 
              onClick={() => handleSave('draft')}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2"
            >
              <Edit size={16} />
              Save Draft
            </button>
            <button 
              onClick={handlePublish}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <Send size={16} />
              Publish Post
            </button>
            <button 
              onClick={onCancel}
              className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 min-h-screen">
          <h3 className="text-xl font-bold mb-4">Live Preview</h3>
          
          {/* Preview Size Controls */}
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => setPreviewSize('mobile')}
              className={`px-3 py-1 text-xs rounded ${previewSize === 'mobile' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Mobile
            </button>
            <button 
              onClick={() => setPreviewSize('tablet')}
              className={`px-3 py-1 text-xs rounded ${previewSize === 'tablet' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Tablet
            </button>
            <button 
              onClick={() => setPreviewSize('desktop')}
              className={`px-3 py-1 text-xs rounded ${previewSize === 'desktop' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Desktop
            </button>
          </div>

          {/* Preview Content */}
          <div className={`border rounded-lg p-6 bg-gray-50 min-h-[500px] transition-all duration-200 ${
            previewSize === 'mobile' ? 'max-w-sm mx-auto' : 
            previewSize === 'tablet' ? 'max-w-2xl mx-auto' : 
            'max-w-full'
          }`}>
            {title && (
              <h1 className={`font-bold mb-4 text-gray-900 ${
                previewSize === 'mobile' ? 'text-xl' : 
                previewSize === 'tablet' ? 'text-2xl' : 
                'text-3xl'
              }`}>{title}</h1>
            )}
            <div 
              className={`prose max-w-none ${
                previewSize === 'mobile' ? 'prose-sm' : 
                previewSize === 'tablet' ? 'prose-base' : 
                'prose-lg'
              }`}
              dangerouslySetInnerHTML={{ 
                __html: content || '<p class="text-gray-500">Start writing to see preview...</p>' 
              }}
            />
          </div>

          {/* Preview Stats */}
          <div className="mt-4 text-sm text-gray-600 space-y-1">
            <div>Word count: {content ? content.replace(/<[^>]*>/g, '').split(' ').filter(word => word.length > 0).length : 0}</div>
            <div>Character count: {content ? content.replace(/<[^>]*>/g, '').length : 0}</div>
            <div>Estimated read time: {Math.max(1, Math.ceil((content ? content.replace(/<[^>]*>/g, '').split(' ').filter(word => word.length > 0).length : 0) / 200))} min</div>
          </div>
        </div>
      </div>
      </div>
    );
  };





// Email Campaigns Section Component with Rich Text Editor
const EmailCampaignsSection = () => {
  const [emailCampaigns, setEmailCampaigns] = useState([
    {
      id: 1,
      name: 'Welcome Series',
      subject: 'Welcome to our community!',
      status: 'Active',
      recipients: 156,
      sent: 142,
      opened: 89,
      clicked: 23,
      created: '2025-09-20',
      lastSent: '2025-09-25',
      type: 'Automated'
    },
    {
      id: 2,
      name: 'Monthly Newsletter',
      subject: 'Your monthly update is here',
      status: 'Sent',
      recipients: 203,
      sent: 203,
      opened: 156,
      clicked: 45,
      created: '2025-09-15',
      lastSent: '2025-09-24',
      type: 'Newsletter'
    },
    {
      id: 3,
      name: 'Product Launch',
      subject: 'Exciting new features just launched!',
      status: 'Draft',
      recipients: 0,
      sent: 0,
      opened: 0,
      clicked: 0,
      created: '2025-09-25',
      lastSent: null,
      type: 'Promotional'
    }
  ]);

  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'Newsletter'
  });

  // Rich text editor state
  const [emailContent, setEmailContent] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showYouTubeDialog, setShowYouTubeDialog] = useState(false);
  const [linkData, setLinkData] = useState({ text: '', url: '' });
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isUploadingEmail, setIsUploadingEmail] = useState(false);
  const emailContentRef = useRef(null);
  const emailFileInputRef = useRef(null);

  const statusColors = {
    'Active': 'bg-green-100 text-green-800',
    'Sent': 'bg-blue-100 text-blue-800',
    'Draft': 'bg-yellow-100 text-yellow-800',
    'Paused': 'bg-red-100 text-red-800'
  };

  const typeColors = {
    'Newsletter': 'bg-purple-100 text-purple-800',
    'Promotional': 'bg-orange-100 text-orange-800',
    'Automated': 'bg-indigo-100 text-indigo-800'
  };

  // Initialize email content
  useEffect(() => {
    if (emailContentRef.current && !emailContentRef.current.innerHTML) {
      emailContentRef.current.innerHTML = '<p class="placeholder-text" style="color: #9ca3af; font-style: italic;">Start writing your email content here...</p>';
    }
  }, [isCreatingCampaign]);

  // Handle email content change
  const handleEmailContentChange = () => {
    if (emailContentRef.current) {
      const content = emailContentRef.current.innerHTML;
      setEmailContent(content);
      setNewCampaign(prev => ({ ...prev, content }));
    }
  };

  // Apply formatting to email content
  const applyEmailFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    if (emailContentRef.current) {
      setEmailContent(emailContentRef.current.innerHTML);
      setNewCampaign(prev => ({ ...prev, content: emailContentRef.current.innerHTML }));
    }
  };

  // Handle email image upload
  const handleEmailFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    setIsUploadingEmail(true);

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        alert(`${file.name}: Please upload a valid image file (JPG, PNG, GIF, or WEBP)`);
        setIsUploadingEmail(false);
        return;
      }

      if (file.size > maxSize) {
        alert(`${file.name}: File size must be less than 50MB`);
        setIsUploadingEmail(false);
        return;
      }
    }

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await uploadImageWithDeduplication(file);

        if (!result.success) {
          throw new Error(result.error || 'Upload failed');
        }

        const newImage = {
          id: Date.now() + i,
          src: result.url,
          alt: file.name,
          width: result.width,
          height: result.height,
        };

        insertEmailImage(newImage);
      }

      if (emailFileInputRef.current) {
        emailFileInputRef.current.value = '';
      }

      setIsUploadingEmail(false);
    } catch (error) {
      console.error('Email image upload error:', error);
      alert('Failed to upload image: ' + error.message);
      setIsUploadingEmail(false);
    }
  };

  // Insert image into email content
  const insertEmailImage = (imageData) => {
    if (!emailContentRef.current) return;

    const imgHtml = `
      <img 
        src="${imageData.src}" 
        alt="${imageData.alt}" 
        style="max-width: 100%; height: auto; border-radius: 8px; margin: 15px 0;"
        id="img-${imageData.id}"
      />
    `;

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const fragment = range.createContextualFragment(imgHtml);
      range.insertNode(fragment);
    } else {
      emailContentRef.current.innerHTML += imgHtml;
    }

    handleEmailContentChange();
  };

  // Insert link into email content
  const insertEmailLink = () => {
    if (!linkData.text || !linkData.url) {
      alert('Please enter both link text and URL');
      return;
    }

    const linkHtml = `<a href="${linkData.url}" style="color: #3b82f6; text-decoration: underline;" target="_blank">${linkData.text}</a>`;
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const fragment = range.createContextualFragment(linkHtml);
      range.deleteContents();
      range.insertNode(fragment);
    }

    setShowLinkDialog(false);
    setLinkData({ text: '', url: '' });
    handleEmailContentChange();
  };

  // Insert YouTube video into email content
  const insertEmailYouTube = () => {
    if (!youtubeUrl) {
      alert('Please enter a YouTube URL');
      return;
    }

    let videoId = '';
    if (youtubeUrl.includes('youtube.com/watch?v=')) {
      videoId = youtubeUrl.split('v=')[1]?.split('&')[0];
    } else if (youtubeUrl.includes('youtu.be/')) {
      videoId = youtubeUrl.split('youtu.be/')[1]?.split('?')[0];
    }

    if (!videoId) {
      alert('Invalid YouTube URL');
      return;
    }

    const embedHtml = `
      <div style="position: relative; padding-bottom: 56.25%; height: 0; margin: 20px 0;">
        <iframe 
          src="https://www.youtube.com/embed/${videoId}" 
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; border-radius: 8px;"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>
    `;

    if (emailContentRef.current) {
      emailContentRef.current.innerHTML += embedHtml;
    }

    setShowYouTubeDialog(false);
    setYoutubeUrl('');
    handleEmailContentChange();
  };

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.subject) {
      alert('Please enter campaign name and subject');
      return;
    }

    const campaign = {
      id: Date.now(),
      ...newCampaign,
      content: emailContent,
      status: 'Draft',
      recipients: 0,
      sent: 0,
      opened: 0,
      clicked: 0,
      created: new Date().toISOString().split('T')[0],
      lastSent: null
    };

    setEmailCampaigns(prev => [campaign, ...prev]);
    setNewCampaign({ name: '', subject: '', content: '', type: 'Newsletter' });
    setEmailContent('');
    setIsCreatingCampaign(false);
    
    // Reset editor
    if (emailContentRef.current) {
      emailContentRef.current.innerHTML = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Mail className="text-green-600" />
              Email Campaigns
            </h1>
            <p className="text-gray-600 mt-2">Manage and track your email marketing campaigns</p>
          </div>
          <button
            onClick={() => setIsCreatingCampaign(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus size={20} /> New Campaign
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{emailCampaigns.length}</p>
            </div>
            <Mail className="text-blue-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {emailCampaigns.reduce((sum, c) => sum + c.sent, 0)}
              </p>
            </div>
            <Send className="text-green-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Opens</p>
              <p className="text-2xl font-bold text-gray-900">
                {emailCampaigns.reduce((sum, c) => sum + c.opened, 0)}
              </p>
            </div>
            <Eye className="text-purple-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900">
                {emailCampaigns.reduce((sum, c) => sum + c.clicked, 0)}
              </p>
            </div>
            <ExternalLink className="text-orange-500" size={32} />
          </div>
        </div>
      </div>

      {/* Create Campaign Modal with Rich Text Editor */}
      {isCreatingCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New Email Campaign</h3>
            
            <div className="space-y-4">
              {/* Campaign Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter campaign name"
                />
              </div>
              
              {/* Email Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
                <input
                  type="text"
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter email subject"
                />
              </div>
              
              {/* Campaign Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type</label>
                <select
                  value={newCampaign.type}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Newsletter">Newsletter</option>
                  <option value="Promotional">Promotional</option>
                  <option value="Automated">Automated</option>
                </select>
              </div>
              
              {/* Rich Text Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Content</label>
                
                {/* Toolbar */}
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-green-500">
                  {/* Font Controls */}
                  <select 
                    onChange={(e) => applyEmailFormat('fontName', e.target.value)}
                    className="px-2 py-1 bg-white border rounded text-sm"
                    title="Font Family"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                  
                  <select 
                    onChange={(e) => applyEmailFormat('fontSize', e.target.value)}
                    className="px-2 py-1 bg-white border rounded text-sm"
                    title="Font Size"
                  >
                    <option value="1">8pt</option>
                    <option value="2">10pt</option>
                    <option value="3" selected>12pt</option>
                    <option value="4">14pt</option>
                    <option value="5">18pt</option>
                    <option value="6">24pt</option>
                    <option value="7">36pt</option>
                  </select>
                  
                  <div className="border-l mx-2"></div>
                  
                  {/* Text Formatting */}
                  <button onClick={() => applyEmailFormat('bold')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Bold">
                    <Bold size={16} />
                  </button>
                  <button onClick={() => applyEmailFormat('italic')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Italic">
                    <Italic size={16} />
                  </button>
                  <button onClick={() => applyEmailFormat('underline')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Underline">
                    <Underline size={16} />
                  </button>
                  
                  <div className="border-l mx-2"></div>
                  
                  {/* Lists */}
                  <button onClick={() => applyEmailFormat('insertUnorderedList')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Bullet Points">
                    <span className="text-sm font-bold">•</span>
                  </button>
                  <button onClick={() => applyEmailFormat('insertOrderedList')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Numbered List">
                    <span className="text-sm font-bold">1.</span>
                  </button>
                  
                  <div className="border-l mx-2"></div>
                  
                  {/* Colors */}
                  <input
                    type="color"
                    onChange={(e) => applyEmailFormat('foreColor', e.target.value)}
                    className="w-8 h-8 border rounded cursor-pointer"
                    title="Text Color"
                  />
                  <input
                    type="color"
                    onChange={(e) => applyEmailFormat('hiliteColor', e.target.value)}
                    className="w-8 h-8 border rounded cursor-pointer"
                    title="Highlight Color"
                  />
                  
                  <div className="border-l mx-2"></div>
                  
                  {/* Alignment */}
                  <button onClick={() => applyEmailFormat('justifyLeft')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Align Left">
                    <AlignLeft size={16} />
                  </button>
                  <button onClick={() => applyEmailFormat('justifyCenter')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Align Center">
                    <AlignCenter size={16} />
                  </button>
                  <button onClick={() => applyEmailFormat('justifyRight')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Align Right">
                    <AlignRight size={16} />
                  </button>
                  
                  <div className="border-l mx-2"></div>
                  
                  {/* Media */}
                  <button 
                    onClick={() => emailFileInputRef.current?.click()} 
                    className="px-3 py-1 bg-white border rounded hover:bg-gray-100 flex items-center gap-1"
                    title="Upload Image"
                    disabled={isUploadingEmail}
                  >
                    <Image size={16} />
                    {isUploadingEmail && <span className="text-xs">Uploading...</span>}
                  </button>
                  <button 
                    onClick={() => setShowLinkDialog(true)} 
                    className="px-3 py-1 bg-white border rounded hover:bg-gray-100"
                    title="Insert Link"
                  >
                    <Link size={16} />
                  </button>
                  <button 
                    onClick={() => setShowYouTubeDialog(true)} 
                    className="px-3 py-1 bg-white border rounded hover:bg-gray-100"
                    title="Insert YouTube Video"
                  >
                    <Film size={16} />
                  </button>
                </div>
                
                {/* Hidden file input */}
                <input
                  ref={emailFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleEmailFileUpload}
                  className="hidden"
                />
                
                {/* Content Editor */}
                <div
                  ref={emailContentRef}
                  className="w-full min-h-[400px] p-4 border rounded-lg bg-white focus:border-green-500 transition-colors"
                  contentEditable
                  suppressContentEditableWarning={true}
                  onInput={handleEmailContentChange}
                  onFocus={() => {
                    const placeholderElement = emailContentRef.current?.querySelector('.placeholder-text');
                    if (placeholderElement) {
                      placeholderElement.remove();
                    }
                  }}
                  style={{
                    direction: 'ltr',
                    textAlign: 'left',
                    unicodeBidi: 'normal',
                    writingMode: 'horizontal-tb'
                  }}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateCampaign}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Campaign
              </button>
              <button
                onClick={() => {
                  setIsCreatingCampaign(false);
                  setEmailContent('');
                  if (emailContentRef.current) {
                    emailContentRef.current.innerHTML = '';
                  }
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Dialog Modal */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Text</label>
                <input
                  type="text"
                  value={linkData.text}
                  onChange={(e) => setLinkData(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter the text to display"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={linkData.url}
                  onChange={(e) => setLinkData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={insertEmailLink}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Insert Link
              </button>
              <button
                onClick={() => setShowLinkDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YouTube Dialog Modal */}
      {showYouTubeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Insert YouTube Video</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={insertEmailYouTube}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Insert Video
              </button>
              <button
                onClick={() => setShowYouTubeDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">All Campaigns</h2>
          
          {emailCampaigns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No campaigns yet. Create your first campaign to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {emailCampaigns.map(campaign => (
                <div key={campaign.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{campaign.name}</h3>
                      <p className="text-gray-600 text-sm">{campaign.subject}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[campaign.status]}`}>
                        {campaign.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[campaign.type]}`}>
                        {campaign.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Recipients</p>
                      <p className="font-semibold">{campaign.recipients}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Sent</p>
                      <p className="font-semibold">{campaign.sent}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Opened</p>
                      <p className="font-semibold">{campaign.opened}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Clicked</p>
                      <p className="font-semibold">{campaign.clicked}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t flex justify-between items-center text-sm text-gray-500">
                    <span>Created: {campaign.created}</span>
                    {campaign.lastSent && <span>Last sent: {campaign.lastSent}</span>}
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
                  <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: post.content }} />
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
                      <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: post.content }} />
                    </div>
                    <div className="flex gap-2 ml-4">
                         <button 
                           onClick={() => {
                             setEditingPost(post);
                             setIsCreating(true);
                           }}
                           className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                           title="Edit post"
                         >
                        <Edit size={16} />
                      </button>
                         <button 
                           onClick={async () => {
                             if (confirm('Are you sure you want to delete this post?')) {
                               try {
                                 const result = await deleteBlogPost(post.id);
                                 if (result.success) {
                                   setPosts(prev => prev.filter(p => p.id !== post.id));
                                   console.log('Post deleted successfully');
                                 } else {
                                   throw new Error(result.error || 'Failed to delete post');
                                 }
                               } catch (error) {
                                 console.error('Delete error:', error);
                                 alert(`Failed to delete post: ${error.message}`);
                               }
                             }
                           }}
                           className="p-1 text-red-600 hover:bg-red-50 rounded"
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
        </div>
      </div>
    </div>
  );

  // Content Editor Router
  const ContentEditor = () => {
    if (contentType === 'post') {
      return (
        <RichBlogEditor
          editingPost={editingPost}
          onSave={(postData) => {
            if (editingPost) {
              // Update existing post
              setPosts(prev => prev.map(post => 
                post === editingPost 
                  ? { ...postData, date: editingPost.date, id: editingPost.id }
                  : post
              ));
              setEditingPost(null);
            } else {
              // Create new post
              setPosts(prev => [{ 
                ...postData, 
                date: new Date().toLocaleDateString(),
                id: Date.now()
              }, ...prev]);
            }
            setIsCreating(false);
          }}
          onCancel={() => {
            setIsCreating(false);
            setEditingPost(null);
          }}
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
  const PostCard = ({ post, onEdit, onDelete }) => (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg">{post.title}</h3>
            {post.status === 'draft' && (
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">Draft</span>
            )}
            {post.status === 'published' && (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Published</span>
            )}
          </div>
          <div className="text-gray-600 text-sm mb-2" dangerouslySetInnerHTML={{ __html: post.content?.substring(0, 150) + '...' }} />
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{post.date}</span>
            <span>{post.author || 'Admin'}</span>
            <span>{Math.max(1, Math.ceil((post.content ? post.content.replace(/<[^>]*>/g, '').split(' ').filter(word => word.length > 0).length : 0) / 200))} min read</span>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <button 
            onClick={() => onEdit?.(post)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit Post"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => onDelete?.(post)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
            title="Delete Post"
          >
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
                    onClick={() => { setContentType('post'); setEditingPost(null); setIsCreating(true); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus size={20} /> New Post
                  </button>
                </div>
                <div className="space-y-4">
                  {posts.map((post, index) => (
                    <PostCard 
                      key={post.id || index} 
                      post={post} 
                      onEdit={(post) => {
                        setEditingPost(post);
                        setIsCreating(true);
                      }}
                      onDelete={async (post) => {
                           if (confirm('Are you sure you want to delete this post?')) {
                             try {
                               // Call API to delete from Xano
                               const result = await deleteBlogPost(post.id);
                               
                               if (result.success) {
                                 // Remove from local state only after successful API deletion
                                 setPosts(prev => prev.filter(p => p.id !== post.id));
                                 console.log('Post deleted successfully');
                               } else {
                                 throw new Error(result.error || 'Failed to delete post');
                               }
                             } catch (error) {
                               console.error('Delete error:', error);
                               alert(`Failed to delete post: ${error.message}`);
                             }
                           }
                         }}
                    />
                  ))}
                </div>
              </div>
            )}
            {activeSection === 'campaigns' && <EmailCampaignsSection />}
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
