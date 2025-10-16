// Updated App.js with Visitor System Integration
// Resolves merge conflict and adds visitor registration, admin dashboard, security features

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

// Email System Components (from your existing system)
import EmailDashboard from './components/email/EmailDashboard';
import ContactManagement from './components/email/ContactManagement';
import ContactForm from './components/email/ContactForm';
import CreateCampaignModal from './components/email/CreateCampaignModal';

// NEW: Visitor System Components
import EnhancedNewsFeedIntegration from './components/newsfeed/EnhancedNewsFeedIntegration';
import FacebookStyleNewsFeed from './components/newsfeed/FacebookStyleNewsFeed';
import AdminDashboardIntegration from './components/admin/AdminDashboardIntegration';
import VisitorRegistrationForm from './components/newsfeed/VisitorRegistrationForm';
import VisitorSecurityService from './services/security/visitorSecurityService';

// Enhanced Blog Widget with Rich Magazine-Style Output
const StandaloneBlogWidget = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');

  const urlParams = new URLSearchParams(window.location.search);
  const settingsParam = urlParams.get('settings');
  const settings = settingsParam ? JSON.parse(decodeURIComponent(settingsParam)) : {
    headerColor: '#2563eb',
    headerText: '📋 Latest Blog Posts',
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
              excerpt: post.excerpt || post.content.substring(0, 200) + '...',
              image: post.featured_image,
              author: post.author,
              date: post.created_at,
              readTime: post.reading_time || Math.ceil(post.content.split(' ').length / 200),
              tags: post.tags || [],
              category: post.category || 'General'
            }));
            setPosts(formattedPosts);
            setIsLoading(false);
            return;
          }
        } catch (apiError) {
          console.warn('XANO API failed, falling back to local data:', apiError);
        }

        // Fallback to local storage
        const localPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        if (localPosts.length > 0) {
          const formattedPosts = localPosts.slice(0, settings.postCount).map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            excerpt: post.excerpt || post.content.substring(0, 200) + '...',
            image: post.featured_image,
            author: post.author,
            date: post.created_at,
            readTime: post.reading_time || Math.ceil(post.content.split(' ').length / 200),
            tags: post.tags || [],
            category: post.category || 'General'
          }));
          setPosts(formattedPosts);
        } else {
          // Ultimate fallback - sample data
          setPosts([
            {
              id: 1,
              title: "Welcome to Our Blog",
              content: "Discover amazing content and insights from our community.",
              excerpt: "Discover amazing content and insights from our community.",
              image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800",
              author: "Admin",
              date: new Date().toISOString(),
              readTime: 3,
              tags: ["welcome", "community"],
              category: "General"
            }
          ]);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Widget: Error loading posts:', error);
        setDebugInfo('Error loading posts: ' + error.message);
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [settings.postCount]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading posts...</span>
      </div>
    );
  }

  if (settings.transparent) {
    return (
      <div className="w-full">
        {settings.headerText && (
          <div className="mb-6" style={{ backgroundColor: settings.headerColor, borderRadius: `${settings.borderRadius}px` }}>
            <h2 className="text-2xl font-bold text-white p-4">{settings.headerText}</h2>
          </div>
        )}
        
        <div className="space-y-6">
          {posts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
              {post.image && settings.showImages && (
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                      {post.category}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  {settings.showDates && (
                    <time>{new Date(post.date).toLocaleDateString()}</time>
                  )}
                  <span>•</span>
                  <span>{post.readTime} min read</span>
                  {post.tags.length > 0 && (
                    <>
                      <span>•</span>
                      <div className="flex gap-2">
                        {post.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition">
                  {post.title}
                </h3>
                
                {settings.showExcerpts && (
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {post.author.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{post.author}</span>
                  </div>
                  
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Read More →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${settings.transparent ? '' : 'border border-gray-200'}`} style={{ borderRadius: `${settings.borderRadius}px` }}>
      {settings.headerText && (
        <div className="px-6 py-4" style={{ backgroundColor: settings.headerColor }}>
          <h2 className="text-2xl font-bold text-white">{settings.headerText}</h2>
        </div>
      )}
      
      <div className="p-6">
        <div className="space-y-6">
          {posts.map((post) => (
            <article key={post.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                {settings.showDates && (
                  <time>{new Date(post.date).toLocaleDateString()}</time>
                )}
                <span>•</span>
                <span>{post.readTime} min read</span>
                {post.tags.length > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex gap-2">
                      {post.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition">
                {post.title}
              </h3>
              
              {settings.showExcerpts && (
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
              )}
              
              {post.image && settings.showImages && (
                <div className="mb-4">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {post.author.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{post.author}</span>
                </div>
                
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Read More →
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

// Enhanced NewsFeed with Visitor System Integration
const EnhancedNewsFeed = ({ currentUser }) => {
  const [visitorSession, setVisitorSession] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draftPost, setDraftPost] = useState('');

  // Load visitor session on mount
  useEffect(() => {
    initializeVisitorSession();
  }, []);

  // Load posts when visitor session is available
  useEffect(() => {
    if (visitorSession) {
      loadPostsFromXANO();
      loadDraftPost();
    }
  }, [visitorSession]);

  const initializeVisitorSession = async () => {
    try {
      // Check for existing session
      const savedSession = localStorage.getItem('visitor_session');
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        setVisitorSession(sessionData);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error initializing visitor session:', error);
      setIsLoading(false);
    }
  };

  const loadPostsFromXANO = async () => {
    try {
      setIsLoading(true);
      
      // Get posts from XANO backend
      const response = await fetch(`${process.env.REACT_APP_XANO_BASE_URL}/newsfeed_posts?limit=20&visitor_email=${visitorSession?.email || ''}`);
      const result = await response.json();
      
      if (result.success && result.posts) {
        setPosts(result.posts);
      } else {
        // Fallback to local posts if API fails
        setPosts([]);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDraftPost = () => {
    if (visitorSession?.id) {
      const savedDraft = localStorage.getItem(`draft_post_${visitorSession.id}`);
      if (savedDraft) {
        setDraftPost(savedDraft);
      }
    }
  };

  const handlePostSubmit = async (content) => {
    if (!content.trim()) return;
    
    // Check if visitor has session
    if (!visitorSession) {
      setShowRegistrationModal(true);
      return;
    }

    try {
      // Basic security checks
      const securityService = new VisitorSecurityService();
      
      // Check rate limiting
      const rateLimit = securityService.checkRateLimit(visitorSession.id, 'post');
      if (!rateLimit.allowed) {
        alert('You are posting too quickly. Please wait a moment.');
        return;
      }
      
      // Check content moderation (auto-approval)
      const moderation = securityService.moderateContent(content);
      
      // Create post data
      const postData = {
        content: content,
        author_email: visitorSession.email,
        author_name: visitorSession.name,
        session_id: visitorSession.id,
        type: 'visitor_post',
        moderation_score: moderation.score,
        moderation_status: moderation.approved ? 'approved' : 'pending'
      };

      // Submit to XANO backend
      const response = await fetch(`${process.env.REACT_APP_XANO_BASE_URL}/newsfeed_posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      });

      const result = await response.json();
      
      if (result.success) {
        // Add new post to feed
        setPosts(prev => [result.post, ...prev]);
        
        // Clear draft
        if (visitorSession?.id) {
          localStorage.removeItem(`draft_post_${visitorSession.id}`);
          setDraftPost('');
        }
        
        // Show appropriate message
        if (moderation.approved) {
          alert('Post published successfully!');
        } else {
          alert('Your post is under review and will appear shortly.');
        }
      } else {
        alert('Failed to publish post. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      alert('An error occurred. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading community feed...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EnhancedNewsFeedIntegration 
        currentUser={currentUser}
        visitorSession={visitorSession}
        onRegistrationRequired={() => setShowRegistrationModal(true)}
        posts={posts}
        onPostsUpdate={setPosts}
      />
      
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <VisitorRegistrationForm
              onSuccess={(session) => {
                setVisitorSession(session);
                setShowRegistrationModal(false);
              }}
              onClose={() => setShowRegistrationModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState('overview');
  
  return (
    <div className="admin-dashboard min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'moderation', label: 'Moderation', icon: Shield },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                  currentView === item.id
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <AdminDashboardIntegration currentView={currentView} />
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentUser] = useState({ name: 'Admin User', email: 'admin@example.com' });
  const [activeSection, setActiveSection] = useState('home');
  const [posts, setPosts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  // Load data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load blog posts
        const postsResult = await getPublishedPosts(10, 0);
        if (postsResult.success && postsResult.posts) {
          setPosts(postsResult.posts);
        }

        // Load email campaigns
        const { getCampaigns } = await import('./services/email/emailCampaignService');
        const campaignsResult = await getCampaigns();
        if (campaignsResult.success && campaignsResult.campaigns) {
          setCampaigns(campaignsResult.campaigns);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'newsfeed', label: 'News Feed', icon: MessageSquare },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'admin', label: 'Admin', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <HomeSection posts={posts} />;
      case 'blog':
        return <BlogSection posts={posts} setPosts={setPosts} />;
      case 'newsfeed':
        return <FacebookStyleNewsFeed currentUser={currentUser} />;
      case 'email':
        return <EmailSection campaigns={campaigns} setCampaigns={setCampaigns} />;
      case 'admin':
        return <AdminDashboard />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <HomeSection posts={posts} />;
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Social Engagement Hub</h1>
              </div>
              <div className="flex items-center space-x-4">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                      activeSection === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={renderContent()} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/widget/newsfeed" element={<FacebookStyleNewsFeed currentUser={currentUser} />} />
            <Route path="/widget/blog" element={<StandaloneBlogWidget />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

// Placeholder components for other sections
const HomeSection = ({ posts }) => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-900">Welcome to Social Engagement Hub</h1>
    <p className="text-gray-600">Your complete platform for community engagement and content management.</p>
  </div>
);

const BlogSection = ({ posts, setPosts }) => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
    <p className="text-gray-600">Create and manage your blog content.</p>
  </div>
);

const EmailSection = ({ campaigns, setCampaigns }) => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
    <p className="text-gray-600">Manage your email marketing campaigns.</p>
  </div>
);

const AnalyticsSection = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
    <p className="text-gray-600">View detailed analytics and insights.</p>
  </div>
);

const SettingsSection = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
    <p className="text-gray-600">Configure your platform settings.</p>
  </div>
);

export default App;