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
  UserPlus, Award, Target, Activity, Download, Play, Shield, Save
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

const BlogSection = ({ posts, setPosts }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [WorkingEditor, setWorkingEditor] = useState(null);

  useEffect(() => {
    import('./WorkingRichBlogEditor').then(module => {
      setWorkingEditor(() => module.default);
    });
  }, []);

  const handleSavePost = async (postData) => {
    try {
      if (editingPost) {
        // Update existing post
        const result = await updateBlogPost(editingPost.id, postData);
        if (result.success) {
          setPosts(prev => prev.map(p => p.id === editingPost.id ? result.post : p));
        }
      } else {
        // Create new post
        const result = await createBlogPost(postData);
        if (result.success) {
          setPosts(prev => [result.post, ...prev]);
        }
      }
      setIsCreating(false);
      setEditingPost(null);
    } catch (error) {
      console.error('Failed to save post:', error);
    }
  };

  const handleDeletePost = async (post) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const result = await deleteBlogPost(post.id);
      if (result.success) {
        setPosts(prev => prev.filter(p => p.id !== post.id));
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  if (isCreating && WorkingEditor) {
    return (
      <WorkingEditor
        editingPost={editingPost}
        onSave={handleSavePost}
        onCancel={() => {
          setIsCreating(false);
          setEditingPost(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="text-blue-600" />
              Blog Management
            </h1>
            <p className="text-gray-600 mt-2">Create and manage your blog content</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} /> New Post
          </button>
        </div>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>No blog posts yet. Create your first post!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex gap-4">
                  {post.featured_image && (
                    <img 
                      src={post.featured_image} 
                      alt={post.title} 
                      className="w-32 h-32 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg mb-2">{post.title}</h3>
                        <div 
                          className="text-sm text-gray-600 mb-3 line-clamp-2" 
                          dangerouslySetInnerHTML={{ __html: post.excerpt || post.content?.substring(0, 150) + '...' }} 
                        />
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{post.author || 'Admin'}</span>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          <span className={`px-2 py-1 rounded ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {post.status || 'draft'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingPost(post);
                            setIsCreating(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const EmailSection = ({ campaigns, setCampaigns }) => {
  // Import and use the full EmailMarketingSystem component
  const [EmailMarketingSystemComponent, setEmailMarketingSystemComponent] = useState(null);
  
  useEffect(() => {
    import('./components/email/EmailMarketingSystem').then(module => {
      setEmailMarketingSystemComponent(() => module.default);
    });
  }, []);
  
  if (!EmailMarketingSystemComponent) {
    return <div className="text-center py-8">Loading email system...</div>;
  }
  
  return <EmailMarketingSystemComponent />;
};

const AnalyticsSection = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-6">
        <BarChart3 className="text-purple-600" />
        Analytics Dashboard
      </h1>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-600">Total Views</span>
            <Eye className="text-blue-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-blue-900">12,458</p>
          <p className="text-sm text-blue-600 mt-1">+23% from last month</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-600">Engagement Rate</span>
            <TrendingUp className="text-green-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-green-900">68.4%</p>
          <p className="text-sm text-green-600 mt-1">+5.2% from last month</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-600">Active Users</span>
            <Users className="text-purple-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-purple-900">3,247</p>
          <p className="text-sm text-purple-600 mt-1">+12% from last month</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-600">Conversion Rate</span>
            <Target className="text-orange-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-orange-900">4.8%</p>
          <p className="text-sm text-orange-600 mt-1">+0.8% from last month</p>
        </div>
      </div>
      
      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <BarChart3 className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Traffic Overview</h3>
          <p className="text-sm text-gray-500">Chart visualization would go here</p>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Activity className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">User Activity</h3>
          <p className="text-sm text-gray-500">Chart visualization would go here</p>
        </div>
      </div>
    </div>
  </div>
);

const SettingsSection = () => {
  const [activeTab, setActiveTab] = useState('widgets');
  const [selectedWidget, setSelectedWidget] = useState('blog');
  const [widgetSettings, setWidgetSettings] = useState({
    blog: {
      headerColor: '#2563eb',
      headerText: '📋 Latest Blog Posts',
      postCount: 3,
      showDates: true,
      showExcerpts: true,
      showImages: true,
      borderRadius: 8,
      transparent: false
    },
    newsfeed: {
      headerColor: '#10b981',
      headerText: '💬 Community Feed',
      postCount: 5,
      showAvatars: true,
      showTimestamps: true,
      allowComments: true,
      borderRadius: 8,
      transparent: false
    },
    calendar: {
      headerColor: '#f59e0b',
      headerText: '📅 Upcoming Events',
      eventCount: 5,
      showTime: true,
      showLocation: true,
      borderRadius: 8,
      transparent: false
    },
    socialhub: {
      headerColor: '#8b5cf6',
      headerText: '🌟 Social Hub',
      showBlog: true,
      showNewsfeed: true,
      showCalendar: true,
      borderRadius: 8,
      transparent: false
    }
  });

  const generateEmbedCode = (widgetType) => {
    const settings = widgetSettings[widgetType];
    const encodedSettings = encodeURIComponent(JSON.stringify(settings));
    const baseUrl = window.location.origin;
    return `<iframe src="${baseUrl}/widget/${widgetType}?settings=${encodedSettings}" width="100%" height="600" frameborder="0"></iframe>`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Embed code copied to clipboard!');
  };

  const widgets = [
    { id: 'blog', name: 'Blog Widget', icon: FileText, color: 'blue' },
    { id: 'newsfeed', name: 'News Feed Widget', icon: MessageSquare, color: 'green' },
    { id: 'calendar', name: 'Calendar Widget', icon: Calendar, color: 'orange' },
    { id: 'socialhub', name: 'Social Hub Widget', icon: Sparkles, color: 'purple' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-6">
          <Settings className="text-blue-600" />
          Settings & Widget Builder
        </h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('widgets')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'widgets'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Widget Builder
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'general'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            General Settings
          </button>
        </div>

        {/* Widget Builder Tab */}
        {activeTab === 'widgets' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Widget Selection */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-semibold mb-4">Select Widget</h2>
              <div className="space-y-2">
                {widgets.map((widget) => (
                  <button
                    key={widget.id}
                    onClick={() => setSelectedWidget(widget.id)}
                    className={`w-full p-4 rounded-lg border-2 transition flex items-center gap-3 ${
                      selectedWidget === widget.id
                        ? `border-${widget.color}-500 bg-${widget.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <widget.icon size={24} className={`text-${widget.color}-600`} />
                    <span className="font-medium">{widget.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Widget Configuration */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4">Configure Widget</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Header Text</label>
                  <input
                    type="text"
                    value={widgetSettings[selectedWidget].headerText}
                    onChange={(e) => setWidgetSettings(prev => ({
                      ...prev,
                      [selectedWidget]: { ...prev[selectedWidget], headerText: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Header Color</label>
                  <input
                    type="color"
                    value={widgetSettings[selectedWidget].headerColor}
                    onChange={(e) => setWidgetSettings(prev => ({
                      ...prev,
                      [selectedWidget]: { ...prev[selectedWidget], headerColor: e.target.value }
                    }))}
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius (px)</label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={widgetSettings[selectedWidget].borderRadius}
                    onChange={(e) => setWidgetSettings(prev => ({
                      ...prev,
                      [selectedWidget]: { ...prev[selectedWidget], borderRadius: parseInt(e.target.value) }
                    }))}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-600">{widgetSettings[selectedWidget].borderRadius}px</span>
                </div>

                {selectedWidget === 'blog' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Number of Posts</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={widgetSettings.blog.postCount}
                        onChange={(e) => setWidgetSettings(prev => ({
                          ...prev,
                          blog: { ...prev.blog, postCount: parseInt(e.target.value) }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={widgetSettings.blog.showDates}
                          onChange={(e) => setWidgetSettings(prev => ({
                            ...prev,
                            blog: { ...prev.blog, showDates: e.target.checked }
                          }))}
                          className="rounded"
                        />
                        <span className="text-sm">Show Dates</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={widgetSettings.blog.showExcerpts}
                          onChange={(e) => setWidgetSettings(prev => ({
                            ...prev,
                            blog: { ...prev.blog, showExcerpts: e.target.checked }
                          }))}
                          className="rounded"
                        />
                        <span className="text-sm">Show Excerpts</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={widgetSettings.blog.showImages}
                          onChange={(e) => setWidgetSettings(prev => ({
                            ...prev,
                            blog: { ...prev.blog, showImages: e.target.checked }
                          }))}
                          className="rounded"
                        />
                        <span className="text-sm">Show Images</span>
                      </label>
                    </div>
                  </>
                )}
              </div>

              {/* Embed Code */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-900">Embed Code</h3>
                  <button
                    onClick={() => copyToClipboard(generateEmbedCode(selectedWidget))}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Copy size={16} />
                    Copy
                  </button>
                </div>
                <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
                  {generateEmbedCode(selectedWidget)}
                </pre>
              </div>

              {/* Preview Link */}
              <div className="mt-4">
                <a
                  href={`/widget/${selectedWidget}?settings=${encodeURIComponent(JSON.stringify(widgetSettings[selectedWidget]))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <ExternalLink size={20} />
                  Preview Widget
                </a>
              </div>
            </div>
          </div>
        )}

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Platform Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                  <input
                    type="text"
                    defaultValue="Social Engagement Hub"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                  <textarea
                    defaultValue="Your complete platform for community engagement"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;