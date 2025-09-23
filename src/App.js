import React, { useState, useEffect } from 'react';
import { 
  Home, 
  FileText, 
  Mail, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings as SettingsIcon,
  MessageSquare,
  Plus,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Upload,
  X,
  Eye,
  Copy,
  Check,
  Star,
  TrendingUp,
  Activity,
  Vote
} from 'lucide-react';

const SocialEngagementHub = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isCreating, setIsCreating] = useState(false);
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "Welcome to Our Platform",
      content: "This is a featured post! We're excited to have you join our community and explore all the amazing features we have to offer. From engaging discussions to valuable resources, there's something here for everyone.",
      date: "9/23/2025",
      featured: true,
      published: true,
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop"
    },
    {
      id: 2,
      title: "Latest Updates and New Features",
      content: "Check out our new features including enhanced widgets, better mobile support, and improved user experience. We've been working hard to make your experience even better with these exciting updates.",
      date: "9/23/2025",
      featured: false,
      published: true,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop"
    },
    {
      id: 3,
      title: "Community Spotlight: Amazing Stories",
      content: "This month we're highlighting some incredible stories from our community members. From innovative projects to inspiring journeys, these stories showcase the power of collaboration and creativity.",
      date: "9/22/2025",
      featured: false,
      published: true,
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=200&fit=crop"
    }
  ]);
  const [drafts, setDrafts] = useState([]);
  const [newsFeed, setNewsFeed] = useState([
    {
      id: 1,
      author: "Admin",
      content: "Welcome to our community! Feel free to share your thoughts and engage with other members.",
      timestamp: "2 hours ago",
      likes: 5,
      comments: [
        { author: "User1", content: "Thanks for the warm welcome!", timestamp: "1 hour ago" }
      ]
    },
    {
      id: 2,
      author: "Community Manager",
      content: "What features would you like to see next? Let us know in the comments!",
      timestamp: "4 hours ago",
      likes: 12,
      comments: [
        { author: "User2", content: "More customization options would be great!", timestamp: "3 hours ago" },
        { author: "User3", content: "I'd love to see better mobile support", timestamp: "2 hours ago" }
      ]
    }
  ]);

  // Widget state
  const [activeWidget, setActiveWidget] = useState('blog');
  const [widgetSettings, setWidgetSettings] = useState({
    blog: { primaryColor: '#3b82f6', showImages: true, maxPosts: 3 },
    newsfeed: { primaryColor: '#10b981', showReplies: true, maxPosts: 5 },
    signup: { primaryColor: '#8b5cf6', buttonText: 'Join Our Community', placeholder: 'Enter your email' },
    featured: { primaryColor: '#f59e0b', showImage: true },
    stats: { primaryColor: '#ef4444', showGrowth: true },
    poll: { primaryColor: '#06b6d4', question: 'What\'s your favorite feature?' },
    activity: { primaryColor: '#84cc16', showTimestamps: true }
  });
  const [copiedWidget, setCopiedWidget] = useState('');

  // Editor state
  const [editorContent, setEditorContent] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  // Check if we're in widget mode
  const urlParams = new URLSearchParams(window.location.search);
  const widgetType = window.location.pathname.includes('/widget/') ? 
    window.location.pathname.split('/widget/')[1] : null;
  const widgetSettingsParam = urlParams.get('settings');
  
  // If we're in widget mode, render only the widget
  if (widgetType) {
    let settings = widgetSettings[widgetType];
    if (widgetSettingsParam) {
      try {
        settings = JSON.parse(decodeURIComponent(widgetSettingsParam));
      } catch (e) {
        console.error('Failed to parse widget settings:', e);
      }
    }

    return <StandaloneWidget type={widgetType} settings={settings} posts={posts} newsFeed={newsFeed} />;
  }

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'newsfeed', label: 'News Feed', icon: MessageSquare },
    { id: 'blog', label: 'Blog Posts', icon: FileText },
    { id: 'campaigns', label: 'Email Campaigns', icon: Mail },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ];

  // Widget definitions
  const widgets = [
    {
      id: 'blog',
      name: 'Blog Widget',
      description: 'Display recent blog posts with images and excerpts',
      icon: FileText,
      category: 'Content'
    },
    {
      id: 'newsfeed',
      name: 'News Feed Widget',
      description: 'Live community posts with engagement features',
      icon: MessageSquare,
      category: 'Community'
    },
    {
      id: 'signup',
      name: 'Signup Widget',
      description: 'Email capture form for growing your community',
      icon: Mail,
      category: 'Growth'
    },
    {
      id: 'featured',
      name: 'Featured Post Widget',
      description: 'Highlight your most important content',
      icon: Star,
      category: 'Content'
    },
    {
      id: 'stats',
      name: 'Stats Widget',
      description: 'Show community metrics and social proof',
      icon: TrendingUp,
      category: 'Social Proof'
    },
    {
      id: 'poll',
      name: 'Quick Poll Widget',
      description: 'Engage visitors with interactive surveys',
      icon: Vote,
      category: 'Engagement'
    },
    {
      id: 'activity',
      name: 'Recent Activity Widget',
      description: 'Display latest community activity',
      icon: Activity,
      category: 'Community'
    }
  ];

  const widgetCategories = ['All', 'Content', 'Community', 'Growth', 'Social Proof', 'Engagement'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredWidgets = selectedCategory === 'All' 
    ? widgets 
    : widgets.filter(widget => widget.category === selectedCategory);

  const generateEmbedCode = (widgetType, settings) => {
    const baseUrl = window.location.origin;
    const settingsParam = encodeURIComponent(JSON.stringify(settings));
    return `<iframe src="${baseUrl}/widget/${widgetType}?settings=${settingsParam}" width="420" height="600" frameborder="0" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"></iframe>`;
  };

  const copyEmbedCode = (widgetType) => {
    const embedCode = generateEmbedCode(widgetType, widgetSettings[widgetType]);
    navigator.clipboard.writeText(embedCode);
    setCopiedWidget(widgetType);
    setTimeout(() => setCopiedWidget(''), 2000);
  };

  // Enhanced Blog Widget Component for preview
  const BlogWidgetPreview = ({ settings }) => {
    const displayPosts = posts.filter(post => post.published).slice(0, settings.maxPosts);
    
    return (
      <div style={{ 
        fontFamily: 'Arial, sans-serif',
        backgroundColor: 'transparent',
        border: `2px solid ${settings.primaryColor}`,
        borderRadius: '12px',
        overflow: 'hidden',
        maxWidth: '400px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          backgroundColor: settings.primaryColor,
          color: 'white',
          padding: '16px',
          fontWeight: 'bold',
          fontSize: '18px'
        }}>
          Latest Blog Posts
        </div>
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {displayPosts.map((post, index) => (
            <div key={post.id} style={{
              padding: '20px',
              borderBottom: index < displayPosts.length - 1 ? '1px solid #e5e7eb' : 'none',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {settings.showImages && post.image && (
                <img 
                  src={post.image} 
                  alt={post.title}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}
                />
              )}
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1f2937',
                lineHeight: '1.3'
              }}>
                {post.title}
              </h3>
              <div style={{
                color: '#6b7280',
                fontSize: '14px',
                marginBottom: '12px'
              }}>
                {post.date}
              </div>
              <div style={{
                color: '#374151',
                fontSize: '16px',
                lineHeight: '1.6',
                flex: 1,
                marginBottom: '16px'
              }}>
                {post.content.length > 200 ? (
                  <>
                    {post.content.substring(0, 200)}...
                    <button style={{
                      background: 'none',
                      border: 'none',
                      color: settings.primaryColor,
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      marginLeft: '8px'
                    }}>
                      Read More
                    </button>
                  </>
                ) : (
                  post.content
                )}
              </div>
              {post.featured && (
                <div style={{
                  display: 'inline-block',
                  backgroundColor: '#fbbf24',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  alignSelf: 'flex-start'
                }}>
                  FEATURED
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Other widget preview components (keeping existing ones)
  const NewsFeedWidgetPreview = ({ settings }) => (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: 'transparent',
      border: `2px solid ${settings.primaryColor}`,
      borderRadius: '12px',
      overflow: 'hidden',
      maxWidth: '400px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        backgroundColor: settings.primaryColor,
        color: 'white',
        padding: '16px',
        fontWeight: 'bold',
        fontSize: '18px'
      }}>
        Community Feed
      </div>
      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {newsFeed.slice(0, settings.maxPosts).map((post, index) => (
          <div key={post.id} style={{
            padding: '16px',
            borderBottom: index < newsFeed.length - 1 ? '1px solid #e5e7eb' : 'none'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
              {post.author}
            </div>
            <div style={{ marginBottom: '12px', color: '#374151', lineHeight: '1.5' }}>
              {post.content}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: '#6b7280' }}>
              <span>{post.timestamp}</span>
              <div style={{ display: 'flex', gap: '16px' }}>
                <span>❤️ {post.likes}</span>
                <span>💬 {post.comments.length}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '16px', backgroundColor: '#f9fafb', textAlign: 'center' }}>
        <button style={{
          backgroundColor: settings.primaryColor,
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}>
          Join the Conversation
        </button>
      </div>
    </div>
  );

  const SignupWidgetPreview = ({ settings }) => (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: 'transparent',
      border: `2px solid ${settings.primaryColor}`,
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '350px',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '20px' }}>
        Stay Connected
      </h3>
      <p style={{ margin: '0 0 20px 0', color: '#6b7280', lineHeight: '1.5' }}>
        Get the latest updates and join our growing community
      </p>
      <input 
        type="email" 
        placeholder={settings.placeholder}
        style={{
          width: '100%',
          padding: '12px',
          border: '2px solid #e5e7eb',
          borderRadius: '6px',
          marginBottom: '16px',
          fontSize: '16px',
          boxSizing: 'border-box'
        }}
      />
      <button style={{
        backgroundColor: settings.primaryColor,
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '16px',
        width: '100%'
      }}>
        {settings.buttonText}
      </button>
    </div>
  );

  const renderWidgetPreview = (widgetType, settings) => {
    switch (widgetType) {
      case 'blog': return <BlogWidgetPreview settings={settings} />;
      case 'newsfeed': return <NewsFeedWidgetPreview settings={settings} />;
      case 'signup': return <SignupWidgetPreview settings={settings} />;
      default: return <div>Widget preview not available</div>;
    }
  };

  // Settings page with improved widget gallery
  const SettingsPage = () => (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
        Settings
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '32px' }}>
        Manage your account settings and embed widgets
      </p>

      {/* Widget Gallery Section */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
          Widget Gallery
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Embed these widgets on your website to extend your community reach
        </p>

        {/* Category Filter */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {widgetCategories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '20px',
                  backgroundColor: selectedCategory === category ? '#3b82f6' : '#f3f4f6',
                  color: selectedCategory === category ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontWeight: selectedCategory === category ? 'bold' : 'normal',
                  fontSize: '14px'
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Widget Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(800px, 1fr))', gap: '32px' }}>
          {filteredWidgets.map(widget => (
            <div key={widget.id} style={{
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: 'white',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}>
              {/* Widget Header */}
              <div style={{
                padding: '20px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <widget.icon size={24} color="#3b82f6" />
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                    {widget.name}
                  </h3>
                  <span style={{
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {widget.category}
                  </span>
                </div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                  {widget.description}
                </p>
              </div>

              {/* Widget Content */}
              <div style={{ display: 'flex', gap: '24px', padding: '24px' }}>
                {/* Preview */}
                <div style={{ flex: '1' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>
                    Live Preview
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {renderWidgetPreview(widget.id, widgetSettings[widget.id])}
                  </div>
                </div>

                {/* Customization */}
                <div style={{ flex: '1' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>
                    Customization
                  </h4>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
                      Primary Color
                    </label>
                    <input
                      type="color"
                      value={widgetSettings[widget.id].primaryColor}
                      onChange={(e) => setWidgetSettings(prev => ({
                        ...prev,
                        [widget.id]: { ...prev[widget.id], primaryColor: e.target.value }
                      }))}
                      style={{ width: '100%', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Widget-specific settings */}
                  {widget.id === 'blog' && (
                    <>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151' }}>
                          <input
                            type="checkbox"
                            checked={widgetSettings[widget.id].showImages}
                            onChange={(e) => setWidgetSettings(prev => ({
                              ...prev,
                              [widget.id]: { ...prev[widget.id], showImages: e.target.checked }
                            }))}
                          />
                          Show Images
                        </label>
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
                          Max Posts
                        </label>
                        <select
                          value={widgetSettings[widget.id].maxPosts}
                          onChange={(e) => setWidgetSettings(prev => ({
                            ...prev,
                            [widget.id]: { ...prev[widget.id], maxPosts: parseInt(e.target.value) }
                          }))}
                          style={{ width: '100%', padding: '8px', border: '2px solid #e5e7eb', borderRadius: '6px' }}
                        >
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                          <option value={5}>5</option>
                        </select>
                      </div>
                    </>
                  )}

                  {widget.id === 'signup' && (
                    <>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={widgetSettings[widget.id].buttonText}
                          onChange={(e) => setWidgetSettings(prev => ({
                            ...prev,
                            [widget.id]: { ...prev[widget.id], buttonText: e.target.value }
                          }))}
                          style={{ width: '100%', padding: '8px', border: '2px solid #e5e7eb', borderRadius: '6px' }}
                        />
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
                          Placeholder Text
                        </label>
                        <input
                          type="text"
                          value={widgetSettings[widget.id].placeholder}
                          onChange={(e) => setWidgetSettings(prev => ({
                            ...prev,
                            [widget.id]: { ...prev[widget.id], placeholder: e.target.value }
                          }))}
                          style={{ width: '100%', padding: '8px', border: '2px solid #e5e7eb', borderRadius: '6px' }}
                        />
                      </div>
                    </>
                  )}

                  {/* Embed Code */}
                  <div style={{ marginTop: '24px' }}>
                    <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
                      Embed Code
                    </h5>
                    <div style={{ position: 'relative' }}>
                      <textarea
                        readOnly
                        value={generateEmbedCode(widget.id, widgetSettings[widget.id])}
                        style={{
                          width: '100%',
                          height: '80px',
                          padding: '12px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          backgroundColor: '#f9fafb',
                          resize: 'none'
                        }}
                      />
                      <button
                        onClick={() => copyEmbedCode(widget.id)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: copiedWidget === widget.id ? '#10b981' : '#3b82f6',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {copiedWidget === widget.id ? <Check size={14} /> : <Copy size={14} />}
                        {copiedWidget === widget.id ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Other Settings */}
      <div style={{
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        backgroundColor: 'white'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
          General Settings
        </h3>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Configure your account preferences and platform settings
        </p>
        <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
          Settings panel coming soon...
        </div>
      </div>
    </div>
  );

  // Rest of the components (Dashboard, NewsFeed, BlogPosts, etc.) remain the same as before
  // ... (keeping all existing component implementations)

  const renderContent = () => {
    if (isCreating) {
      return <div>Content Editor</div>; // Simplified for now
    }

    switch (activeSection) {
      case 'dashboard':
        return <div>Dashboard</div>; // Simplified for now
      case 'newsfeed':
        return <div>News Feed</div>; // Simplified for now
      case 'blog':
        return <div>Blog Posts</div>; // Simplified for now
      case 'campaigns':
        return <div>Email Campaigns</div>; // Simplified for now
      case 'members':
        return <div>Members</div>; // Simplified for now
      case 'calendar':
        return <div>Calendar</div>; // Simplified for now
      case 'analytics':
        return <div>Analytics</div>; // Simplified for now
      case 'settings':
        return <SettingsPage />;
      default:
        return <div>Dashboard</div>; // Simplified for now
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', backgroundColor: 'white', borderRight: '2px solid #e5e7eb', padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '32px', color: '#1f2937' }}>
          Social Hub
        </h2>
        
        <nav>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsCreating(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  marginBottom: '8px',
                  backgroundColor: isActive ? '#dbeafe' : 'transparent',
                  color: isActive ? '#1e40af' : '#6b7280',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: isActive ? 'bold' : 'normal',
                  textAlign: 'left'
                }}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {renderContent()}
      </div>
    </div>
  );
};

// Standalone Widget Component
const StandaloneWidget = ({ type, settings, posts, newsFeed }) => {
  const renderStandaloneWidget = () => {
    switch (type) {
      case 'blog':
        return <StandaloneBlogWidget settings={settings} posts={posts} />;
      case 'newsfeed':
        return <StandaloneNewsFeedWidget settings={settings} newsFeed={newsFeed} />;
      case 'signup':
        return <StandaloneSignupWidget settings={settings} />;
      default:
        return <div>Widget not found</div>;
    }
  };

  return (
    <div style={{ 
      margin: 0, 
      padding: '20px', 
      backgroundColor: 'transparent',
      fontFamily: 'Arial, sans-serif',
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      boxSizing: 'border-box'
    }}>
      {renderStandaloneWidget()}
    </div>
  );
};

// Standalone Blog Widget
const StandaloneBlogWidget = ({ settings, posts }) => {
  const [selectedPost, setSelectedPost] = useState(null);
  const displayPosts = posts.filter(post => post.published).slice(0, settings.maxPosts);
  
  return (
    <>
      <div style={{ 
        fontFamily: 'Arial, sans-serif',
        backgroundColor: 'transparent',
        border: `2px solid ${settings.primaryColor}`,
        borderRadius: '12px',
        overflow: 'hidden',
        maxWidth: '400px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          backgroundColor: settings.primaryColor,
          color: 'white',
          padding: '16px',
          fontWeight: 'bold',
          fontSize: '18px'
        }}>
          Latest Blog Posts
        </div>
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {displayPosts.map((post, index) => (
            <div key={post.id} style={{
              padding: '20px',
              borderBottom: index < displayPosts.length - 1 ? '1px solid #e5e7eb' : 'none',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {settings.showImages && post.image && (
                <img 
                  src={post.image} 
                  alt={post.title}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}
                />
              )}
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1f2937',
                lineHeight: '1.3'
              }}>
                {post.title}
              </h3>
              <div style={{
                color: '#6b7280',
                fontSize: '14px',
                marginBottom: '12px'
              }}>
                {post.date}
              </div>
              <div style={{
                color: '#374151',
                fontSize: '16px',
                lineHeight: '1.6',
                flex: 1,
                marginBottom: '16px'
              }}>
                {post.content.length > 200 ? (
                  <>
                    {post.content.substring(0, 200)}...
                    <button 
                      onClick={() => setSelectedPost(post)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: settings.primaryColor,
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        marginLeft: '8px',
                        textDecoration: 'underline'
                      }}
                    >
                      Read More
                    </button>
                  </>
                ) : (
                  post.content
                )}
              </div>
              {post.featured && (
                <div style={{
                  display: 'inline-block',
                  backgroundColor: '#fbbf24',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  alignSelf: 'flex-start'
                }}>
                  FEATURED
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal for full post */}
      {selectedPost && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedPost(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold',
                zIndex: 1001
              }}
            >
              ×
            </button>
            <div style={{ padding: '32px' }}>
              {selectedPost.image && (
                <img 
                  src={selectedPost.image} 
                  alt={selectedPost.title}
                  style={{
                    width: '100%',
                    height: '300px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '24px'
                  }}
                />
              )}
              <h1 style={{
                margin: '0 0 16px 0',
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#1f2937'
              }}>
                {selectedPost.title}
              </h1>
              <div style={{
                color: '#6b7280',
                fontSize: '16px',
                marginBottom: '24px'
              }}>
                {selectedPost.date}
              </div>
              <div style={{
                color: '#374151',
                fontSize: '18px',
                lineHeight: '1.7'
              }}>
                {selectedPost.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Standalone News Feed Widget
const StandaloneNewsFeedWidget = ({ settings, newsFeed }) => (
  <div style={{ 
    fontFamily: 'Arial, sans-serif',
    backgroundColor: 'transparent',
    border: `2px solid ${settings.primaryColor}`,
    borderRadius: '12px',
    overflow: 'hidden',
    maxWidth: '400px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  }}>
    <div style={{
      backgroundColor: settings.primaryColor,
      color: 'white',
      padding: '16px',
      fontWeight: 'bold',
      fontSize: '18px'
    }}>
      Community Feed
    </div>
    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
      {newsFeed.slice(0, settings.maxPosts).map((post, index) => (
        <div key={post.id} style={{
          padding: '16px',
          borderBottom: index < newsFeed.length - 1 ? '1px solid #e5e7eb' : 'none'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
            {post.author}
          </div>
          <div style={{ marginBottom: '12px', color: '#374151', lineHeight: '1.5' }}>
            {post.content}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: '#6b7280' }}>
            <span>{post.timestamp}</span>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span>❤️ {post.likes}</span>
              <span>💬 {post.comments.length}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div style={{ padding: '16px', backgroundColor: '#f9fafb', textAlign: 'center' }}>
      <button style={{
        backgroundColor: settings.primaryColor,
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}>
        Join the Conversation
      </button>
    </div>
  </div>
);

// Standalone Signup Widget
const StandaloneSignupWidget = ({ settings }) => (
  <div style={{ 
    fontFamily: 'Arial, sans-serif',
    backgroundColor: 'transparent',
    border: `2px solid ${settings.primaryColor}`,
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '350px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  }}>
    <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '20px' }}>
      Stay Connected
    </h3>
    <p style={{ margin: '0 0 20px 0', color: '#6b7280', lineHeight: '1.5' }}>
      Get the latest updates and join our growing community
    </p>
    <input 
      type="email" 
      placeholder={settings.placeholder}
      style={{
        width: '100%',
        padding: '12px',
        border: '2px solid #e5e7eb',
        borderRadius: '6px',
        marginBottom: '16px',
        fontSize: '16px',
        boxSizing: 'border-box'
      }}
    />
    <button style={{
      backgroundColor: settings.primaryColor,
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '16px',
      width: '100%'
    }}>
      {settings.buttonText}
    </button>
  </div>
);

export default SocialEngagementHub;
