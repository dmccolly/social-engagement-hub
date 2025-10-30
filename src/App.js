// Updated App.js - Restored original news feed and added calendar

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Icons and services
import { Home as HomeIcon, FileText, MessageSquare, Mail, Shield, BarChart3, Settings, Calendar } from 'lucide-react';

// Blog services
import { getPublishedPosts, updateBlogPost, deleteBlogPost, createBlogPost } from './services/xanoService';

// Email components
import EmailDashboard from './components/email/EmailDashboard';
import EmailMarketingSystem from './components/email/EmailMarketingSystem';

// Newsfeed components
import FacebookStyleNewsFeed from './components/newsfeed/FacebookStyleNewsFeed';

// Admin components
import AdminDashboard from './components/admin/AdminDashboardIntegration';

// Calendar components
import EventListManager from './components/events/EventListManager';

// Settings and widgets
import SettingsSection from './components/SettingsSection';
import WidgetPreview from './components/WidgetPreview';
// Import the enhanced newsfeed widget with rich text, attachments, and reply functionality
import EnhancedNewsfeedWidget from './components/newsfeed/EnhancedNewsfeedWidget';
import StandaloneNewsfeedWidget from './components/newsfeed/StandaloneNewsfeedWidget';

// Blog components
import BlogPostView from './components/BlogPostView';
import BlogSection from './components/BlogSection';

// Main App component
const App = () => {
  // current user for role-based permissions (simplified)
  const [currentUser] = useState({ name: 'Admin User', email: 'admin@example.com', role: 'admin' });
  const [activeSection, setActiveSection] = useState('home');
  const [posts, setPosts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

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
    { id: 'calendar', label: 'Calendar', icon: Calendar },
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
        return <EventListManager />;
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
      <Router>
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
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
            <Route path="/" element={renderContent()} />
            <Route path="/blog/:id" element={<BlogPostView />} />
            <Route path="/widget/newsfeed" element={<EnhancedNewsfeedWidget />} />
            <Route path="/widget/newsfeed-simple" element={<StandaloneNewsfeedWidget />} />
            <Route path="/widget/:widgetType" element={<WidgetPreview />} />
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
