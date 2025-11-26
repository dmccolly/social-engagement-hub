// Updated App.js - Restored original news feed and added calendar

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Icons and services
import { Home as HomeIcon, FileText, MessageSquare, Mail, Shield, BarChart3, Settings, Calendar } from 'lucide-react';

// Blog services
import { getPublishedPosts, updateBlogPost, deleteBlogPost, createBlogPost } from './services/xanoService';

// Email components
import EmailDashboard from './components/email/EmailDashboard';
import EmailMarketingSystem from './components/email/EmailMarketingSystem';
import GroupManagement from './components/email/GroupManagement';

// Newsfeed components
import FacebookStyleNewsFeed from './components/newsfeed/FacebookStyleNewsFeed';
import NewsfeedPostView from './components/newsfeed/NewsfeedPostView';

// Admin components
import AdminDashboard from './components/admin/AdminDashboardIntegration';
import VisitorAuthManager from './components/admin/VisitorAuthManager';

// Calendar components
import EventListManager from './components/events/EventListManager';
import EventDetails from './components/events/EventDetails';

// Settings and widgets
import SettingsSection from './components/SettingsSection';
import WidgetPreview from './components/WidgetPreview';
// Import the enhanced newsfeed widget with rich text, attachments, and reply functionality
import EnhancedNewsfeedWidget from './components/newsfeed/EnhancedNewsfeedWidget';
import StandaloneNewsfeedWidget from './components/newsfeed/StandaloneNewsfeedWidget';

// Blog components
import BlogPostView from './components/BlogPostView';
import BlogSection from './components/BlogSection';

// Visitor profile
import VisitorProfileSettings from './components/VisitorProfileSettings';

// Navigation wrapper component that conditionally shows navigation
const AppContent = () => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeSection, setActiveSection] = useState('home');
  const [posts, setPosts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  
  // Load visitor session as current user
  useEffect(() => {
    const loadUserFromSession = () => {
      try {
        const savedSession = localStorage.getItem('visitor_session');
        if (savedSession) {
          const session = JSON.parse(savedSession);
          setCurrentUser({
            name: session.name || session.email,
            email: session.email,
            role: 'visitor',
            id: session.member_id || session.visitor_id
          });
        }
      } catch (error) {
        console.error('Error loading user session:', error);
      }
    };
    loadUserFromSession();
    
    // Listen for session changes
    window.addEventListener('storage', loadUserFromSession);
    return () => window.removeEventListener('storage', loadUserFromSession);
  }, []);
  
  // Check if we're on a blog post page, event detail page, or widget page
  const isBlogPostPage = location.pathname.startsWith('/blog/');
  const isEventDetailPage = location.pathname.startsWith('/events/');
  const isWidgetPage = location.pathname.startsWith('/widget/');

  // Load initial data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const postsResult = await getPublishedPosts(10, 0);
        if (postsResult.success && postsResult.posts) {
          setPosts(postsResult.posts);
        }
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
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'newsfeed', label: 'News Feed', icon: MessageSquare },
    { id: 'calendar', label: 'Events', icon: Calendar },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'admin', label: 'Admin', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Render the appropriate section based on activeSection
  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <HomeSection posts={posts} />;
      case 'blog':
        return <BlogSection />;
      case 'newsfeed':
        return <FacebookStyleNewsFeed currentUser={currentUser} />;
      case 'calendar':
        return <EventListManager currentUser={currentUser} />;
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
    <div className="min-h-screen bg-gray-50">
          {!isBlogPostPage && !isEventDetailPage && !isWidgetPage && (
          <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-8">
                  <h1 className="text-2xl font-bold text-gray-900">Social Engagement Hub</h1>
                  <div className="hidden md:flex space-x-4">
                    {navigationItems.map(item => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeSection === item.id
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Icon size={18} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowProfileSettings(true)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    title="Update your profile"
                  >
                    <Settings size={18} />
                    <span className="hidden md:inline">{currentUser?.name || 'Set Profile'}</span>
                  </button>
                </div>
              </div>
            </div>
          </nav>
          )}

          <main className={!isBlogPostPage && !isEventDetailPage && !isWidgetPage ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" : ""}>
              <Routes>
            <Route path="/" element={renderContent()} />
            <Route path="/blog/:id" element={<BlogPostView />} />
            <Route path="/newsfeed/post/:id" element={<NewsfeedPostView />} />
            <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/email/groups" element={<GroupManagement />} />
            <Route path="/admin/visitors" element={<VisitorAuthManager />} />
            <Route path="/widget/newsfeed" element={<EnhancedNewsfeedWidget />} />
            <Route path="/widget/newsfeed-simple" element={<StandaloneNewsfeedWidget />} />
            <Route path="/widget/:widgetType" element={<WidgetPreview />} />
          </Routes>
      </main>
      
      {/* Visitor Profile Settings Modal */}
      {showProfileSettings && (
        <VisitorProfileSettings onClose={() => setShowProfileSettings(false)} />
      )}
    </div>
  );
};

// Main App component wraps Router
const App = () => {
  return (
    <HelmetProvider>
      <Router>
        <AppContent />
      </Router>
    </HelmetProvider>
  );
};

// Placeholder components for other sections
const HomeSection = ({ posts }) => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-900">Welcome to Social Engagement Hub</h1>
    <p className="text-gray-600">Your complete platform for community engagement and content management.</p>
  </div>
);

// Placeholder blog section kept for backwards compatibility.
// It is unused now that we have a proper BlogSection component.
const BlogSectionPlaceholder = ({ posts, setPosts }) => {
  return <div>Blog Section Placeholder</div>;
};

const EmailSection = ({ campaigns, setCampaigns }) => {
  return <EmailMarketingSystem />;
};

const AnalyticsSection = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
    <p className="text-gray-600">Analytics content goes here.</p>
  </div>
);

export default App;
