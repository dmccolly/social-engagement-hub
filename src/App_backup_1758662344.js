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
      content: "This is a featured post!",
      date: "9/23/2025",
      featured: true,
      published: true,
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop"
    },
    {
      id: 2,
      title: "Latest Updates",
      content: "Check out our new features",
      date: "9/23/2025",
      featured: false,
      published: true,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop"
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

  // Enhanced Blog Widget Component
  const BlogWidget = ({ settings }) => {
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

  // Other widget components (keeping existing ones but improving layout)
  const NewsFeedWidget = ({ settings }) => (
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

  const SignupWidget = ({ settings }) => (
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

  const FeaturedPostWidget = ({ settings }) => {
    const featuredPost = posts.find(post => post.featured && post.published);
    if (!featuredPost) return null;

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
        {settings.showImage && featuredPost.image && (
          <img 
            src={featuredPost.image} 
            alt={featuredPost.title}
            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
          />
        )}
        <div style={{ padding: '20px' }}>
          <div style={{
            backgroundColor: settings.primaryColor,
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'inline-block',
            marginBottom: '12px'
          }}>
            FEATURED
          </div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#1f2937' }}>
            {featuredPost.title}
          </h3>
          <p style={{ margin: '0 0 16px 0', color: '#6b7280', lineHeight: '1.5' }}>
            {featuredPost.content}
          </p>
          <button style={{
            backgroundColor: settings.primaryColor,
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            Read More
          </button>
        </div>
      </div>
    );
  };

  const StatsWidget = ({ settings }) => (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: 'transparent',
      border: `2px solid ${settings.primaryColor}`,
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '300px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#1f2937', textAlign: 'center' }}>
        Community Stats
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: settings.primaryColor }}>
            {posts.filter(p => p.published).length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Posts</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: settings.primaryColor }}>
            1,234
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Members</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: settings.primaryColor }}>
            5,678
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Comments</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: settings.primaryColor }}>
            98%
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Active</div>
        </div>
      </div>
    </div>
  );

  const PollWidget = ({ settings }) => (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: 'transparent',
      border: `2px solid ${settings.primaryColor}`,
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '350px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
        {settings.question}
      </h3>
      <div style={{ marginBottom: '16px' }}>
        {['Option A', 'Option B', 'Option C'].map((option, index) => (
          <div key={index} style={{ marginBottom: '8px' }}>
            <button style={{
              width: '100%',
              padding: '12px',
              border: `2px solid ${settings.primaryColor}`,
              borderRadius: '6px',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              textAlign: 'left'
            }}>
              {option}
            </button>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>
        123 votes so far
      </div>
    </div>
  );

  const ActivityWidget = ({ settings }) => (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: 'transparent',
      border: `2px solid ${settings.primaryColor}`,
      borderRadius: '12px',
      overflow: 'hidden',
      maxWidth: '350px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        backgroundColor: settings.primaryColor,
        color: 'white',
        padding: '16px',
        fontWeight: 'bold',
        fontSize: '18px'
      }}>
        Recent Activity
      </div>
      <div style={{ padding: '16px' }}>
        {[
          { action: 'New member joined', time: '2 min ago' },
          { action: 'Post liked by 5 people', time: '5 min ago' },
          { action: 'New comment added', time: '10 min ago' },
          { action: 'Poll created', time: '15 min ago' }
        ].map((activity, index) => (
          <div key={index} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: index < 3 ? '1px solid #e5e7eb' : 'none'
          }}>
            <span style={{ color: '#374151' }}>{activity.action}</span>
            {settings.showTimestamps && (
              <span style={{ color: '#6b7280', fontSize: '12px' }}>{activity.time}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const generateEmbedCode = (widgetType, settings) => {
    const baseUrl = 'https://gleaming-cendol-417bf3.netlify.app';
    const settingsParam = encodeURIComponent(JSON.stringify(settings));
    return `<iframe src="${baseUrl}/widget/${widgetType}?settings=${settingsParam}" width="400" height="600" frameborder="0" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"></iframe>`;
  };

  const copyEmbedCode = (widgetType) => {
    const embedCode = generateEmbedCode(widgetType, widgetSettings[widgetType]);
    navigator.clipboard.writeText(embedCode);
    setCopiedWidget(widgetType);
    setTimeout(() => setCopiedWidget(''), 2000);
  };

  const renderWidget = (widgetType, settings) => {
    switch (widgetType) {
      case 'blog': return <BlogWidget settings={settings} />;
      case 'newsfeed': return <NewsFeedWidget settings={settings} />;
      case 'signup': return <SignupWidget settings={settings} />;
      case 'featured': return <FeaturedPostWidget settings={settings} />;
      case 'stats': return <StatsWidget settings={settings} />;
      case 'poll': return <PollWidget settings={settings} />;
      case 'activity': return <ActivityWidget settings={settings} />;
      default: return null;
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
                    {renderWidget(widget.id, widgetSettings[widget.id])}
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

  // Rest of the components remain the same...
  // (Dashboard, NewsFeed, BlogPosts, etc. - keeping existing implementations)

  const Dashboard = () => (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px', color: '#1f2937' }}>
        Social Engagement Hub
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <button
          onClick={() => setActiveSection('blog')}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '24px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            minHeight: '80px'
          }}
        >
          <Plus size={24} />
          Create Post
        </button>
        
        <button
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '24px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            minHeight: '80px'
          }}
        >
          <Mail size={24} />
          Send Campaign
        </button>
        
        <button
          style={{
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '24px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            minHeight: '80px'
          }}
        >
          <Calendar size={24} />
          Schedule Content
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#dbeafe', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e40af', marginBottom: '8px' }}>
            {posts.filter(p => p.published).length}
          </div>
          <div style={{ color: '#1e40af', fontWeight: 'bold' }}>Total Posts</div>
        </div>
        
        <div style={{ backgroundColor: '#fef3c7', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#92400e', marginBottom: '8px' }}>
            {posts.filter(p => p.featured).length}
          </div>
          <div style={{ color: '#92400e', fontWeight: 'bold' }}>Featured Posts</div>
        </div>
        
        <div style={{ backgroundColor: '#ede9fe', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#7c3aed', marginBottom: '8px' }}>0</div>
          <div style={{ color: '#7c3aed', fontWeight: 'bold' }}>Total Members</div>
        </div>
        
        <div style={{ backgroundColor: '#d1fae5', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#065f46', marginBottom: '8px' }}>0</div>
          <div style={{ color: '#065f46', fontWeight: 'bold' }}>Total Comments</div>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star size={24} color="#f59e0b" />
          Featured Posts
        </h2>
        {posts.filter(post => post.featured && post.published).map(post => (
          <div key={post.id} style={{
            backgroundColor: '#fef3c7',
            border: '2px solid #f59e0b',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Star size={16} color="#f59e0b" />
              <span style={{ backgroundColor: '#f59e0b', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                FEATURED POST
              </span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
              {post.title}
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '8px' }}>{post.date}</p>
            <p style={{ color: '#374151' }}>{post.content}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
              <MessageSquare size={16} color="#6b7280" />
              <span style={{ color: '#6b7280', fontSize: '14px' }}>0 Comments</span>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
          Recent Posts
        </h2>
        {posts.filter(post => !post.featured && post.published).map(post => (
          <div key={post.id} style={{
            backgroundColor: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
              {post.title}
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '8px' }}>{post.date}</p>
            <p style={{ color: '#374151' }}>{post.content}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
              <button style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                ✏️
              </button>
              <button style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // NewsFeed Component
  const NewsFeed = () => (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px', color: '#1f2937' }}>
        News Feed
      </h1>
      
      <div style={{ marginBottom: '32px', backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '2px solid #e5e7eb' }}>
        <textarea
          placeholder="What's on your mind? Share with the community..."
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '16px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '16px',
            marginBottom: '16px',
            resize: 'vertical'
          }}
        />
        <button style={{
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}>
          Share Update
        </button>
      </div>

      {newsFeed.map(post => (
        <div key={post.id} style={{
          backgroundColor: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              {post.author.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{post.author}</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>{post.timestamp}</div>
            </div>
          </div>
          
          <p style={{ marginBottom: '16px', color: '#374151', lineHeight: '1.6' }}>
            {post.content}
          </p>
          
          <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
            <button style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ❤️ {post.likes}
            </button>
            <button style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              💬 {post.comments.length}
            </button>
            <button style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer'
            }}>
              🔖 Save
            </button>
          </div>
          
          {post.comments.length > 0 && (
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
              {post.comments.map((comment, index) => (
                <div key={index} style={{ marginBottom: '12px', paddingLeft: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#1f2937' }}>
                      {comment.author}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {comment.timestamp}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // BlogPosts Component
  const BlogPosts = () => (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
          Blog Posts
        </h1>
        <button
          onClick={() => setIsCreating(true)}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={20} />
          New Post
        </button>
      </div>

      {drafts.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
            Drafts
          </h2>
          {drafts.map(post => (
            <div key={post.id} style={{
              backgroundColor: '#fef3c7',
              border: '2px solid #f59e0b',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ backgroundColor: '#f59e0b', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                  DRAFT
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                {post.title}
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '8px' }}>{post.date}</p>
              <div style={{ color: '#374151', marginBottom: '16px' }} dangerouslySetInnerHTML={{ __html: post.content }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  onClick={() => {
                    setEditingPost(post);
                    setPostTitle(post.title);
                    setEditorContent(post.content);
                    setIsCreating(true);
                  }}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ✏️
                </button>
                <button style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
          Published Posts
        </h2>
        {posts.filter(post => post.published).map(post => (
          <div key={post.id} style={{
            backgroundColor: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
              {post.title}
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '8px' }}>{post.date}</p>
            <div style={{ color: '#374151', marginBottom: '16px' }} dangerouslySetInnerHTML={{ __html: post.content }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => {
                  setEditingPost(post);
                  setPostTitle(post.title);
                  setEditorContent(post.content);
                  setIsCreating(true);
                }}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ✏️
              </button>
              <button style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Other placeholder components
  const EmailCampaigns = () => (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px', color: '#1f2937' }}>
        Email Campaigns
      </h1>
      <p style={{ color: '#6b7280' }}>Email campaign management coming soon...</p>
    </div>
  );

  const Members = () => (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px', color: '#1f2937' }}>
        Members
      </h1>
      <p style={{ color: '#6b7280' }}>Member management coming soon...</p>
    </div>
  );

  const CalendarView = () => (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px', color: '#1f2937' }}>
        Calendar
      </h1>
      <p style={{ color: '#6b7280' }}>Calendar view coming soon...</p>
    </div>
  );

  const Analytics = () => (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px', color: '#1f2937' }}>
        Analytics
      </h1>
      <p style={{ color: '#6b7280' }}>Analytics dashboard coming soon...</p>
    </div>
  );

  // Content Editor Component (keeping existing functionality)
  const ContentEditor = () => {
    const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Simulate upload to Cloudinary
      const imageUrl = URL.createObjectURL(file);
      const timestamp = Date.now();
      const imageId = `img-${timestamp}`;
      
      const imgElement = `<img src="${imageUrl}" id="${imageId}" style="max-width: 400px; border: 2px solid transparent; border-radius: 4px; cursor: pointer; transition: border-color 0.25s; margin: 0px 0px 15px 15px; box-shadow: rgba(66, 133, 244, 0.25) 0px 0px 2px 2px; float: right;" class="selected-image" onclick="selectImage('${imageId}')" />`;
      
      setEditorContent(prev => prev + imgElement);
    };

    const selectImage = (imageId) => {
      // Remove any existing toolbars and handles
      const existingToolbars = document.querySelectorAll('.image-toolbar');
      const existingHandles = document.querySelectorAll('.resize-handle');
      existingToolbars.forEach(toolbar => toolbar.remove());
      existingHandles.forEach(handle => handle.remove());

      const img = document.getElementById(imageId);
      if (!img) return;

      // Add blue border to selected image
      const allImages = document.querySelectorAll('#editor-content img');
      allImages.forEach(image => {
        image.style.border = '2px solid transparent';
      });
      img.style.border = '2px solid #3b82f6';

      // Create floating toolbar
      const toolbar = document.createElement('div');
      toolbar.className = 'image-toolbar';
      toolbar.style.cssText = `
        position: absolute;
        background: #1f2937;
        border-radius: 8px;
        padding: 8px;
        display: flex;
        gap: 4px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;

      // Position toolbar above image
      const rect = img.getBoundingClientRect();
      toolbar.style.left = rect.left + 'px';
      toolbar.style.top = (rect.top - 50) + 'px';

      // Add resize buttons
      ['Small', 'Medium', 'Large', 'Full'].forEach(size => {
        const btn = document.createElement('button');
        btn.textContent = size;
        btn.style.cssText = `
          background: #374151;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
        `;
        btn.onclick = () => resizeImage(imageId, size);
        toolbar.appendChild(btn);
      });

      // Add position buttons
      ['Left', 'Center', 'Right'].forEach(position => {
        const btn = document.createElement('button');
        btn.textContent = position;
        btn.style.cssText = `
          background: #374151;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
        `;
        btn.onclick = () => positionImage(imageId, position);
        toolbar.appendChild(btn);
      });

      // Add close button
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '✕';
      closeBtn.style.cssText = `
        background: #ef4444;
        color: white;
        border: none;
        padding: 6px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: bold;
      `;
      closeBtn.onclick = () => {
        toolbar.remove();
        img.style.border = '2px solid transparent';
      };
      toolbar.appendChild(closeBtn);

      document.body.appendChild(toolbar);

      // Add corner handles
      addResizeHandles(img);
    };

    const resizeImage = (imageId, size) => {
      const img = document.getElementById(imageId);
      if (!img) return;

      const sizes = {
        'Small': '200px',
        'Medium': '300px',
        'Large': '400px',
        'Full': '100%'
      };

      img.style.maxWidth = sizes[size];
      img.style.width = sizes[size];
    };

    const positionImage = (imageId, position) => {
      const img = document.getElementById(imageId);
      if (!img) return;

      const positions = {
        'Left': 'left',
        'Center': 'none',
        'Right': 'right'
      };

      img.style.float = positions[position];
      if (position === 'Center') {
        img.style.display = 'block';
        img.style.margin = '0 auto 15px auto';
      } else {
        img.style.display = 'inline';
        img.style.margin = '0px 0px 15px 15px';
      }
    };

    const addResizeHandles = (img) => {
      const positions = ['nw', 'ne', 'sw', 'se'];
      
      positions.forEach(pos => {
        const handle = document.createElement('div');
        handle.className = 'resize-handle';
        handle.style.cssText = `
          position: absolute;
          width: 10px;
          height: 10px;
          background: #3b82f6;
          border: 2px solid white;
          border-radius: 50%;
          cursor: ${pos.includes('n') ? (pos.includes('w') ? 'nw' : 'ne') : (pos.includes('w') ? 'sw' : 'se')}-resize;
          z-index: 1001;
        `;

        const rect = img.getBoundingClientRect();
        if (pos.includes('n')) handle.style.top = (rect.top - 5) + 'px';
        if (pos.includes('s')) handle.style.top = (rect.bottom - 5) + 'px';
        if (pos.includes('w')) handle.style.left = (rect.left - 5) + 'px';
        if (pos.includes('e')) handle.style.left = (rect.right - 5) + 'px';

        document.body.appendChild(handle);
      });
    };

    // Make functions globally available
    window.selectImage = selectImage;

    const handleSaveDraft = () => {
      const newPost = {
        id: editingPost ? editingPost.id : Date.now(),
        title: postTitle,
        content: editorContent,
        date: new Date().toLocaleDateString(),
        featured: false,
        published: false
      };

      if (editingPost) {
        setDrafts(prev => prev.map(post => post.id === editingPost.id ? newPost : post));
      } else {
        setDrafts(prev => [...prev, newPost]);
      }

      setPostTitle('');
      setEditorContent('');
      setEditingPost(null);
      setIsCreating(false);
    };

    const handlePublishPost = () => {
      const newPost = {
        id: editingPost ? editingPost.id : Date.now(),
        title: postTitle,
        content: editorContent,
        date: new Date().toLocaleDateString(),
        featured: false,
        published: true
      };

      if (editingPost) {
        if (editingPost.published) {
          setPosts(prev => prev.map(post => post.id === editingPost.id ? newPost : post));
        } else {
          setDrafts(prev => prev.filter(post => post.id !== editingPost.id));
          setPosts(prev => [...prev, newPost]);
        }
      } else {
        setPosts(prev => [...prev, newPost]);
      }

      setPostTitle('');
      setEditorContent('');
      setEditingPost(null);
      setIsCreating(false);
    };

    const addLink = () => {
      setShowLinkDialog(true);
    };

    const insertLink = () => {
      if (linkText && linkUrl) {
        const linkHtml = `<a href="${linkUrl}" target="_blank" style="color: #3b82f6; text-decoration: underline;">${linkText}</a>`;
        setEditorContent(prev => prev + linkHtml);
        setLinkText('');
        setLinkUrl('');
        setShowLinkDialog(false);
      }
    };

    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
            {editingPost ? 'Edit Post' : 'Create New Post'}
          </h1>
          <button
            onClick={() => {
              setIsCreating(false);
              setEditingPost(null);
              setPostTitle('');
              setEditorContent('');
            }}
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Enter post title..."
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '16px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          />
        </div>

        {/* Formatting Toolbar */}
        <div style={{
          backgroundColor: '#f3f4f6',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center'
        }}>
          <select style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}>
            <option>Arial</option>
            <option>Times New Roman</option>
            <option>Georgia</option>
            <option>Helvetica</option>
            <option>Verdana</option>
            <option>Courier New</option>
          </select>

          <select style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}>
            <option>12px</option>
            <option>14px</option>
            <option>16px</option>
            <option>18px</option>
            <option>20px</option>
            <option>24px</option>
            <option>32px</option>
          </select>

          <input type="color" style={{ width: '40px', height: '32px', border: 'none', borderRadius: '4px' }} />

          <button style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
            <Bold size={16} />
          </button>
          <button style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer' }}>
            <Italic size={16} />
          </button>
          <button style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer' }}>
            <Underline size={16} />
          </button>

          <div style={{ width: '1px', height: '24px', backgroundColor: '#d1d5db' }}></div>

          <button style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer' }}>
            <AlignLeft size={16} />
          </button>
          <button style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer' }}>
            <AlignCenter size={16} />
          </button>
          <button style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer' }}>
            <AlignRight size={16} />
          </button>

          <div style={{ width: '1px', height: '24px', backgroundColor: '#d1d5db' }}></div>

          <select style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}>
            <option>Normal</option>
            <option>H1</option>
            <option>H2</option>
            <option>H3</option>
          </select>

          <button
            onClick={addLink}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer' }}
          >
            <Link size={16} />
          </button>

          <div style={{ width: '1px', height: '24px', backgroundColor: '#d1d5db' }}></div>

          <label style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 'bold'
          }}>
            <Upload size={16} />
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Editor */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div>
            <h3 style={{ marginBottom: '12px', color: '#374151' }}>Content Editor</h3>
            <div
              id="editor-content"
              contentEditable
              style={{
                minHeight: '400px',
                padding: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white',
                fontSize: '16px',
                lineHeight: '1.6'
              }}
              dangerouslySetInnerHTML={{ __html: editorContent }}
              onInput={(e) => setEditorContent(e.target.innerHTML)}
            />
          </div>

          <div>
            <h3 style={{ marginBottom: '12px', color: '#374151' }}>Live Preview</h3>
            <div style={{
              minHeight: '400px',
              padding: '16px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#f9fafb',
              fontSize: '16px',
              lineHeight: '1.6'
            }}>
              <h2 style={{ marginBottom: '16px', color: '#1f2937' }}>{postTitle || 'Post Title'}</h2>
              <div dangerouslySetInnerHTML={{ __html: editorContent || 'Start typing to see your content here...' }} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSaveDraft}
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Save Draft
          </button>
          <button
            onClick={handlePublishPost}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Publish Post
          </button>
        </div>

        {/* Link Dialog */}
        {showLinkDialog && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              width: '400px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
            }}>
              <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>Add Link</h3>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                  Text to Display
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Enter link text"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowLinkDialog(false)}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={insertLink}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Insert Link
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (isCreating) {
      return <ContentEditor />;
    }

    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'newsfeed':
        return <NewsFeed />;
      case 'blog':
        return <BlogPosts />;
      case 'campaigns':
        return <EmailCampaigns />;
      case 'members':
        return <Members />;
      case 'calendar':
        return <CalendarView />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
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

export default SocialEngagementHub;
