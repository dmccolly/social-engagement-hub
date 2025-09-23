import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, MessageSquare, FileText, Mail, Users, Calendar, BarChart3, Settings,
  Plus, Send, Clock, Edit, Trash2, Heart, MessageCircle, Bookmark,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Upload, Save, Eye, X,
  Copy, Code, Palette, Monitor, Smartphone, Tablet, ExternalLink, TrendingUp, UserPlus
} from 'lucide-react';

const App = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isCreating, setIsCreating] = useState(false);
  const [contentType, setContentType] = useState('post');
  const [editingPost, setEditingPost] = useState(null);
  const [posts, setPosts] = useState([
    { 
      id: 1, 
      title: 'Welcome to Our Platform', 
      content: 'This is a featured post! We are excited to have you join our community. Here you can share your thoughts, engage with other members, and stay updated with the latest news and updates from our platform.', 
      htmlContent: 'This is a featured post! We are excited to have you join our community. Here you can share your thoughts, engage with other members, and stay updated with the latest news and updates from our platform.',
      date: '9/23/2025', 
      featured: true,
      status: 'published'
    },
    { 
      id: 2, 
      title: 'Latest Updates and New Features', 
      content: 'Check out our new features including the widget system, improved editor, and enhanced community engagement tools. We have been working hard to bring you the best experience possible.', 
      htmlContent: 'Check out our new features including the widget system, improved editor, and enhanced community engagement tools. We have been working hard to bring you the best experience possible.',
      date: '9/23/2025', 
      featured: false,
      status: 'published'
    },
    { 
      id: 3, 
      title: 'Community Guidelines and Best Practices', 
      content: 'Learn about our community guidelines and how to make the most of your experience on our platform. We believe in fostering a positive and inclusive environment for all members.', 
      htmlContent: 'Learn about our community guidelines and how to make the most of your experience on our platform. We believe in fostering a positive and inclusive environment for all members.',
      date: '9/22/2025', 
      featured: false,
      status: 'published'
    }
  ]);
  const [drafts, setDrafts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [members, setMembers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', joinDate: '9/20/2025' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', joinDate: '9/21/2025' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', joinDate: '9/22/2025' }
  ]);
  const [newsFeedPosts, setNewsFeedPosts] = useState([
    {
      id: 1,
      author: 'Admin',
      content: 'Welcome to our community! Feel free to share your thoughts and engage with other members.',
      timestamp: '2 hours ago',
      likes: 5,
      comments: [
        { author: 'User1', content: 'Thanks for the warm welcome!', timestamp: '1 hour ago' }
      ],
      saved: false
    },
    {
      id: 2,
      author: 'Community Manager',
      content: 'What features would you like to see added to our platform? Let us know in the comments!',
      timestamp: '4 hours ago',
      likes: 12,
      comments: [
        { author: 'User2', content: 'More customization options would be great!', timestamp: '3 hours ago' },
        { author: 'User3', content: 'I agree with User2!', timestamp: '2 hours ago' }
      ],
      saved: true
    },
    {
      id: 3,
      author: 'Sarah Wilson',
      content: 'Just published a new blog post about community engagement. Check it out!',
      timestamp: '6 hours ago',
      likes: 8,
      comments: [],
      saved: false
    }
  ]);

  // Widget System State
  const [selectedWidget, setSelectedWidget] = useState('blog');
  const [widgetConfig, setWidgetConfig] = useState({
    blog: {
      maxPosts: 3,
      showExcerpt: true,
      excerptLength: 150,
      backgroundColor: 'transparent',
      textColor: '#333333',
      accentColor: '#2563eb',
      borderRadius: 8,
      showDate: true,
      showAuthor: false
    },
    signup: {
      title: 'Join Our Community',
      description: 'Stay updated with our latest posts and community discussions.',
      buttonText: 'Sign Up',
      backgroundColor: 'transparent',
      textColor: '#333333',
      accentColor: '#2563eb',
      borderRadius: 8,
      style: 'minimal'
    },
    newsfeed: {
      maxPosts: 5,
      showReplies: true,
      allowReplies: true,
      backgroundColor: 'transparent',
      textColor: '#333333',
      accentColor: '#2563eb',
      borderRadius: 8,
      showSignupPrompt: true
    },
    featured: {
      postId: 1,
      showFullContent: false,
      backgroundColor: 'transparent',
      textColor: '#333333',
      accentColor: '#2563eb',
      borderRadius: 8,
      showDate: true
    },
    stats: {
      showMembers: true,
      showPosts: true,
      showActivity: true,
      backgroundColor: 'transparent',
      textColor: '#333333',
      accentColor: '#2563eb',
      borderRadius: 8,
      layout: 'horizontal'
    },
    activity: {
      maxItems: 5,
      showTimestamps: true,
      backgroundColor: 'transparent',
      textColor: '#333333',
      accentColor: '#2563eb',
      borderRadius: 8
    }
  });
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  // Widget Components
  const BlogWidget = ({ config, isPreview = false }) => {
    const displayPosts = posts.slice(0, config.maxPosts);
    
    const truncateText = (text, length) => {
      if (text.length <= length) return text;
      return text.substring(0, length) + '...';
    };

    const openModal = (post) => {
      if (isPreview) return;
      setModalContent(post);
      setShowModal(true);
    };

    return (
      <div 
        className="widget-container p-4 rounded-lg border"
        style={{
          backgroundColor: config.backgroundColor,
          color: config.textColor,
          borderRadius: `${config.borderRadius}px`,
          borderColor: config.accentColor + '20'
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: config.accentColor }}>
          Latest Blog Posts
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {displayPosts.map(post => (
            <div key={post.id} className="border-b pb-3 last:border-b-0">
              <h4 className="font-medium mb-1 hover:underline cursor-pointer" 
                  onClick={() => openModal(post)}
                  style={{ color: config.textColor }}>
                {post.title}
              </h4>
              {config.showDate && (
                <p className="text-xs opacity-70 mb-2">{post.date}</p>
              )}
              <p className="text-sm opacity-80">
                {config.showExcerpt 
                  ? truncateText(post.content, config.excerptLength)
                  : post.content
                }
              </p>
              {config.showExcerpt && post.content.length > config.excerptLength && (
                <button 
                  className="text-xs mt-1 hover:underline"
                  style={{ color: config.accentColor }}
                  onClick={() => openModal(post)}
                >
                  Read More
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SignupWidget = ({ config, isPreview = false }) => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (isPreview) return;
      // Add to members list
      const newMember = {
        id: Date.now(),
        email: email,
        name: email.split('@')[0],
        joinDate: new Date().toLocaleDateString()
      };
      setMembers(prev => [...prev, newMember]);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail('');
      }, 3000);
    };

    return (
      <div 
        className="widget-container p-6 rounded-lg border text-center"
        style={{
          backgroundColor: config.backgroundColor,
          color: config.textColor,
          borderRadius: `${config.borderRadius}px`,
          borderColor: config.accentColor + '20'
        }}
      >
        <h3 className="text-xl font-semibold mb-2" style={{ color: config.accentColor }}>
          {config.title}
        </h3>
        <p className="text-sm opacity-80 mb-4">{config.description}</p>
        
        {isSubmitted ? (
          <div className="text-green-600 font-medium">
            ✅ Thanks for signing up!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded text-gray-900"
              style={{ borderRadius: `${config.borderRadius}px` }}
              required
            />
            <button
              type="submit"
              className="w-full p-2 text-white rounded font-medium hover:opacity-90 transition"
              style={{ 
                backgroundColor: config.accentColor,
                borderRadius: `${config.borderRadius}px`
              }}
            >
              {config.buttonText}
            </button>
          </form>
        )}
      </div>
    );
  };

  const NewsFeedWidget = ({ config, isPreview = false }) => {
    const [newReply, setNewReply] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const displayPosts = newsFeedPosts.slice(0, config.maxPosts);

    const handleReply = (postId) => {
      if (isPreview || !newReply.trim()) return;
      
      setNewsFeedPosts(prev => prev.map(post => 
        post.id === postId 
          ? {
              ...post,
              comments: [...post.comments, {
                author: 'You',
                content: newReply,
                timestamp: 'Just now'
              }]
            }
          : post
      ));
      setNewReply('');
      setReplyingTo(null);
    };

    return (
      <div 
        className="widget-container p-4 rounded-lg border"
        style={{
          backgroundColor: config.backgroundColor,
          color: config.textColor,
          borderRadius: `${config.borderRadius}px`,
          borderColor: config.accentColor + '20'
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: config.accentColor }}>
          Community Feed
        </h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {displayPosts.map(post => (
            <div key={post.id} className="border-b pb-3 last:border-b-0">
              <div className="flex items-start gap-2 mb-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: config.accentColor }}
                >
                  {post.author[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{post.author}</span>
                    <span className="text-xs opacity-60">{post.timestamp}</span>
                  </div>
                  <p className="text-sm">{post.content}</p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <button className="flex items-center gap-1 text-xs opacity-70 hover:opacity-100">
                      <Heart size={12} />
                      {post.likes}
                    </button>
                    {config.allowReplies && (
                      <button 
                        className="flex items-center gap-1 text-xs opacity-70 hover:opacity-100"
                        onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                      >
                        <MessageCircle size={12} />
                        Reply
                      </button>
                    )}
                  </div>

                  {config.showReplies && post.comments.length > 0 && (
                    <div className="mt-2 pl-3 border-l-2 space-y-1" style={{ borderColor: config.accentColor + '30' }}>
                      {post.comments.map((comment, idx) => (
                        <div key={idx} className="text-xs">
                          <span className="font-medium">{comment.author}</span>
                          <span className="opacity-60 ml-1">{comment.timestamp}</span>
                          <p className="opacity-80">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {replyingTo === post.id && config.allowReplies && (
                    <div className="mt-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Write a reply..."
                          value={newReply}
                          onChange={(e) => setNewReply(e.target.value)}
                          className="flex-1 p-1 text-xs border rounded text-gray-900"
                          style={{ borderRadius: `${config.borderRadius}px` }}
                        />
                        <button
                          onClick={() => handleReply(post.id)}
                          className="px-2 py-1 text-xs text-white rounded"
                          style={{ backgroundColor: config.accentColor }}
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {config.showSignupPrompt && (
          <div className="mt-4 p-3 border rounded text-center" style={{ borderColor: config.accentColor + '30' }}>
            <p className="text-sm opacity-80 mb-2">Join the conversation!</p>
            <button 
              className="px-4 py-1 text-sm text-white rounded"
              style={{ backgroundColor: config.accentColor }}
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    );
  };

  const FeaturedWidget = ({ config, isPreview = false }) => {
    const post = posts.find(p => p.id === config.postId) || posts[0];
    
    const openModal = () => {
      if (isPreview) return;
      setModalContent(post);
      setShowModal(true);
    };

    return (
      <div 
        className="widget-container p-6 rounded-lg border"
        style={{
          backgroundColor: config.backgroundColor,
          color: config.textColor,
          borderRadius: `${config.borderRadius}px`,
          borderColor: config.accentColor + '20'
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 text-xs font-medium rounded" 
                style={{ backgroundColor: config.accentColor + '20', color: config.accentColor }}>
            FEATURED
          </span>
        </div>
        <h3 className="text-xl font-semibold mb-2 hover:underline cursor-pointer" 
            onClick={openModal}
            style={{ color: config.accentColor }}>
          {post.title}
        </h3>
        {config.showDate && (
          <p className="text-sm opacity-70 mb-3">{post.date}</p>
        )}
        <p className="text-sm opacity-90 mb-4">
          {config.showFullContent ? post.content : post.content.substring(0, 200) + '...'}
        </p>
        {!config.showFullContent && (
          <button 
            className="text-sm font-medium hover:underline"
            style={{ color: config.accentColor }}
            onClick={openModal}
          >
            Read Full Post →
          </button>
        )}
      </div>
    );
  };

  const StatsWidget = ({ config, isPreview = false }) => {
    const stats = [
      { label: 'Members', value: members.length, show: config.showMembers },
      { label: 'Posts', value: posts.length, show: config.showPosts },
      { label: 'Active Today', value: 12, show: config.showActivity }
    ].filter(stat => stat.show);

    return (
      <div 
        className="widget-container p-4 rounded-lg border"
        style={{
          backgroundColor: config.backgroundColor,
          color: config.textColor,
          borderRadius: `${config.borderRadius}px`,
          borderColor: config.accentColor + '20'
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: config.accentColor }}>
          Community Stats
        </h3>
        <div className={`grid gap-4 ${config.layout === 'horizontal' ? 'grid-cols-3' : 'grid-cols-1'}`}>
          {stats.map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold" style={{ color: config.accentColor }}>
                {stat.value}
              </div>
              <div className="text-sm opacity-70">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ActivityWidget = ({ config, isPreview = false }) => {
    const activities = [
      { type: 'post', user: 'John Doe', action: 'published a new post', time: '2 hours ago' },
      { type: 'comment', user: 'Jane Smith', action: 'commented on a post', time: '3 hours ago' },
      { type: 'join', user: 'Mike Johnson', action: 'joined the community', time: '5 hours ago' },
      { type: 'like', user: 'Sarah Wilson', action: 'liked a post', time: '6 hours ago' },
      { type: 'post', user: 'Admin', action: 'published an announcement', time: '1 day ago' }
    ].slice(0, config.maxItems);

    const getIcon = (type) => {
      switch (type) {
        case 'post': return <FileText size={12} />;
        case 'comment': return <MessageCircle size={12} />;
        case 'join': return <UserPlus size={12} />;
        case 'like': return <Heart size={12} />;
        default: return <TrendingUp size={12} />;
      }
    };

    return (
      <div 
        className="widget-container p-4 rounded-lg border"
        style={{
          backgroundColor: config.backgroundColor,
          color: config.textColor,
          borderRadius: `${config.borderRadius}px`,
          borderColor: config.accentColor + '20'
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: config.accentColor }}>
          Recent Activity
        </h3>
        <div className="space-y-3">
          {activities.map((activity, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: config.accentColor }}
              >
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 text-sm">
                <span className="font-medium">{activity.user}</span>
                <span className="opacity-80"> {activity.action}</span>
                {config.showTimestamps && (
                  <div className="text-xs opacity-60">{activity.time}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Widget Configuration Panel
  const WidgetConfig = ({ widgetType, config, onChange }) => {
    const updateConfig = (key, value) => {
      onChange(widgetType, { ...config, [key]: value });
    };

    const commonControls = (
      <>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Background</label>
            <input
              type="color"
              value={config.backgroundColor === 'transparent' ? '#ffffff' : config.backgroundColor}
              onChange={(e) => updateConfig('backgroundColor', e.target.value)}
              className="w-full h-8 rounded border"
            />
            <button
              onClick={() => updateConfig('backgroundColor', 'transparent')}
              className="text-xs text-blue-600 hover:underline mt-1"
            >
              Make Transparent
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Text Color</label>
            <input
              type="color"
              value={config.textColor}
              onChange={(e) => updateConfig('textColor', e.target.value)}
              className="w-full h-8 rounded border"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Accent Color</label>
            <input
              type="color"
              value={config.accentColor}
              onChange={(e) => updateConfig('accentColor', e.target.value)}
              className="w-full h-8 rounded border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Border Radius</label>
            <input
              type="range"
              min="0"
              max="20"
              value={config.borderRadius}
              onChange={(e) => updateConfig('borderRadius', parseInt(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{config.borderRadius}px</span>
          </div>
        </div>
      </>
    );

    return (
      <div className="space-y-4">
        {widgetType === 'blog' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Max Posts</label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.maxPosts}
                onChange={(e) => updateConfig('maxPosts', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.showExcerpt}
                  onChange={(e) => updateConfig('showExcerpt', e.target.checked)}
                />
                Show Excerpt
              </label>
            </div>
            {config.showExcerpt && (
              <div>
                <label className="block text-sm font-medium mb-1">Excerpt Length</label>
                <input
                  type="number"
                  min="50"
                  max="500"
                  value={config.excerptLength}
                  onChange={(e) => updateConfig('excerptLength', parseInt(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.showDate}
                  onChange={(e) => updateConfig('showDate', e.target.checked)}
                />
                Show Date
              </label>
            </div>
          </>
        )}

        {widgetType === 'signup' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => updateConfig('title', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={config.description}
                onChange={(e) => updateConfig('description', e.target.value)}
                className="w-full p-2 border rounded"
                rows="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Button Text</label>
              <input
                type="text"
                value={config.buttonText}
                onChange={(e) => updateConfig('buttonText', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </>
        )}

        {widgetType === 'newsfeed' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Max Posts</label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.maxPosts}
                onChange={(e) => updateConfig('maxPosts', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.showReplies}
                  onChange={(e) => updateConfig('showReplies', e.target.checked)}
                />
                Show Replies
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.allowReplies}
                  onChange={(e) => updateConfig('allowReplies', e.target.checked)}
                />
                Allow Replies
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.showSignupPrompt}
                  onChange={(e) => updateConfig('showSignupPrompt', e.target.checked)}
                />
                Show Signup Prompt
              </label>
            </div>
          </>
        )}

        {widgetType === 'featured' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Featured Post</label>
              <select
                value={config.postId}
                onChange={(e) => updateConfig('postId', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              >
                {posts.map(post => (
                  <option key={post.id} value={post.id}>{post.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.showFullContent}
                  onChange={(e) => updateConfig('showFullContent', e.target.checked)}
                />
                Show Full Content
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.showDate}
                  onChange={(e) => updateConfig('showDate', e.target.checked)}
                />
                Show Date
              </label>
            </div>
          </>
        )}

        {widgetType === 'stats' && (
          <>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.showMembers}
                  onChange={(e) => updateConfig('showMembers', e.target.checked)}
                />
                Show Members Count
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.showPosts}
                  onChange={(e) => updateConfig('showPosts', e.target.checked)}
                />
                Show Posts Count
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.showActivity}
                  onChange={(e) => updateConfig('showActivity', e.target.checked)}
                />
                Show Activity Count
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Layout</label>
              <select
                value={config.layout}
                onChange={(e) => updateConfig('layout', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </select>
            </div>
          </>
        )}

        {widgetType === 'activity' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Max Items</label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.maxItems}
                onChange={(e) => updateConfig('maxItems', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.showTimestamps}
                  onChange={(e) => updateConfig('showTimestamps', e.target.checked)}
                />
                Show Timestamps
              </label>
            </div>
          </>
        )}

        {commonControls}
      </div>
    );
  };

  // Generate embed code
  const generateEmbedCode = (widgetType, config) => {
    const baseUrl = window.location.origin;
    const configStr = encodeURIComponent(JSON.stringify(config));
    
    return `<iframe 
  src="${baseUrl}/widget/${widgetType}?config=${configStr}" 
  width="100%" 
  height="400" 
  frameborder="0" 
  style="border: none; border-radius: ${config.borderRadius}px;">
</iframe>`;
  };

  // Link Dialog Component (unchanged from previous version)
  const LinkDialog = ({ isOpen, onClose, onInsert, selectedText = '' }) => {
    const [displayText, setDisplayText] = useState(selectedText);
    const [url, setUrl] = useState('');

    useEffect(() => {
      if (isOpen) {
        setDisplayText(selectedText);
        setUrl('');
      }
    }, [isOpen, selectedText]);

    const handleInsert = () => {
      if (displayText.trim() && url.trim()) {
        onInsert(displayText.trim(), url.trim());
        onClose();
      }
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Add Link</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text to Display
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the text that will appear as a link"
                value={displayText}
                onChange={(e) => setDisplayText(e.target.value)}
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="url"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              disabled={!displayText.trim() || !url.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Insert Link
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Rich Blog Editor Component (unchanged from previous version)
  const RichBlogEditor = ({ onSave, onCancel, initialPost = null }) => {
    const [title, setTitle] = useState(initialPost?.title || '');
    const [content, setContent] = useState(initialPost?.htmlContent || '');
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [imageCounter, setImageCounter] = useState(0);
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [selectedText, setSelectedText] = useState('');
    const contentRef = useRef(null);
    const fileInputRef = useRef(null);

    // Initialize content if editing
    useEffect(() => {
      if (initialPost && contentRef.current) {
        contentRef.current.innerHTML = initialPost.htmlContent || '';
        setContent(initialPost.htmlContent || '');
      }
    }, [initialPost]);

    // Cleanup function for images (unchanged)
    const cleanupImageSelection = () => {
      console.log('Cleaning up image selection...');
      
      const toolbars = document.querySelectorAll('.image-toolbar');
      toolbars.forEach(toolbar => toolbar.remove());
      
      const handles = document.querySelectorAll('.resize-handle');
      handles.forEach(handle => handle.remove());
      
      const selectedImages = document.querySelectorAll('.selected-image');
      selectedImages.forEach(img => {
        img.classList.remove('selected-image');
        img.style.border = '2px solid transparent';
        img.style.boxShadow = 'none';
      });
      
      setSelectedImageId(null);
    };

    useEffect(() => {
      return () => {
        cleanupImageSelection();
      };
    }, []);

    useEffect(() => {
      if (!isCreating) {
        cleanupImageSelection();
      }
    }, [isCreating, activeSection]);

    // Text formatting functions
    const applyFormat = (command) => {
      document.execCommand(command, false, null);
      if (contentRef.current) {
        setContent(contentRef.current.innerHTML);
      }
    };

    const applyFontFamily = (fontFamily) => {
      document.execCommand('fontName', false, fontFamily);
      if (contentRef.current) {
        setContent(contentRef.current.innerHTML);
      }
    };

    const applyFontSize = (fontSize) => {
      document.execCommand('fontSize', false, '7');
      const fontElements = document.querySelectorAll('font[size="7"]');
      fontElements.forEach(el => {
        el.removeAttribute('size');
        el.style.fontSize = fontSize;
      });
      if (contentRef.current) {
        setContent(contentRef.current.innerHTML);
      }
    };

    const applyTextColor = (color) => {
      document.execCommand('foreColor', false, color);
      if (contentRef.current) {
        setContent(contentRef.current.innerHTML);
      }
    };

    const applyHeading = (heading) => {
      if (heading === 'normal') {
        document.execCommand('formatBlock', false, 'div');
      } else {
        document.execCommand('formatBlock', false, heading);
      }
      if (contentRef.current) {
        setContent(contentRef.current.innerHTML);
      }
    };

    const applyAlignment = (alignment) => {
      document.execCommand('justify' + alignment.charAt(0).toUpperCase() + alignment.slice(1), false, null);
      if (contentRef.current) {
        setContent(contentRef.current.innerHTML);
      }
    };

    // IMPROVED link functions with proper dialog
    const addLink = () => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      
      if (selectedText) {
        setSelectedText(selectedText);
      } else {
        setSelectedText('');
      }
      
      setShowLinkDialog(true);
    };

    const insertLink = (displayText, url) => {
      const selection = window.getSelection();
      
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // Create the link element
        const link = document.createElement('a');
        link.href = url;
        link.textContent = displayText;
        link.target = '_blank'; // Open in new tab
        link.style.color = '#2563eb';
        link.style.textDecoration = 'underline';
        
        // If there's selected text, replace it
        if (selection.toString().trim()) {
          range.deleteContents();
        }
        
        // Insert the link
        range.insertNode(link);
        
        // Move cursor after the link
        range.setStartAfter(link);
        range.setEndAfter(link);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Update content
        if (contentRef.current) {
          setContent(contentRef.current.innerHTML);
        }
      } else {
        // No selection, insert at cursor position or end
        const link = document.createElement('a');
        link.href = url;
        link.textContent = displayText;
        link.target = '_blank';
        link.style.color = '#2563eb';
        link.style.textDecoration = 'underline';
        
        if (contentRef.current) {
          contentRef.current.appendChild(document.createTextNode(' '));
          contentRef.current.appendChild(link);
          contentRef.current.appendChild(document.createTextNode(' '));
          setContent(contentRef.current.innerHTML);
        }
      }
    };

    const removeLink = () => {
      document.execCommand('unlink', false, null);
      if (contentRef.current) {
        setContent(contentRef.current.innerHTML);
      }
    };

    // Image handling (unchanged from previous version)
    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      setIsUploading(true);
      
      try {
        const imageId = `${Date.now()}_${imageCounter}`;
        setImageCounter(prev => prev + 1);
        
        const localUrl = URL.createObjectURL(file);
        
        const img = document.createElement('img');
        img.src = localUrl;
        img.id = `img-${imageId}`;
        img.className = 'editor-image';
        img.style.maxWidth = '400px';
        img.style.height = 'auto';
        img.style.border = '2px solid transparent';
        img.style.borderRadius = '4px';
        img.style.cursor = 'pointer';
        img.style.transition = 'border-color 0.2s';
        img.style.display = 'block';
        img.style.margin = '15px auto';
        
        img.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          selectImage(imageId);
        });
        
        const editor = contentRef.current;
        if (editor) {
          editor.appendChild(img);
          setContent(editor.innerHTML);
        }
        
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    const selectImage = (imageId) => {
      cleanupImageSelection();
      setSelectedImageId(imageId);
      
      const img = document.getElementById(`img-${imageId}`);
      if (!img) return;
      
      img.classList.add('selected-image');
      img.style.border = '2px solid #4285f4';
      img.style.boxShadow = '0 0 0 2px rgba(66, 133, 244, 0.25)';
      
      const rect = img.getBoundingClientRect();
      const toolbar = document.createElement('div');
      toolbar.className = `image-toolbar toolbar-${imageId}`;
      toolbar.style.position = 'fixed';
      toolbar.style.top = Math.max(10, rect.top - 50) + 'px';
      toolbar.style.left = Math.max(10, rect.left) + 'px';
      toolbar.style.background = '#333';
      toolbar.style.padding = '8px';
      toolbar.style.borderRadius = '6px';
      toolbar.style.zIndex = '10000';
      toolbar.style.display = 'flex';
      toolbar.style.gap = '4px';
      toolbar.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
      
      const createButton = (text, action, bgColor = '#555') => {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.style.cssText = `
          background: ${bgColor}; 
          color: white; 
          border: none; 
          padding: 4px 8px; 
          border-radius: 3px; 
          cursor: pointer; 
          font-size: 11px;
          font-family: inherit;
        `;
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          action();
        });
        return btn;
      };
      
      toolbar.appendChild(createButton('Small', () => resizeImageTo(imageId, 'small')));
      toolbar.appendChild(createButton('Medium', () => resizeImageTo(imageId, 'medium')));
      toolbar.appendChild(createButton('Large', () => resizeImageTo(imageId, 'large')));
      toolbar.appendChild(createButton('Full', () => resizeImageTo(imageId, 'full')));
      
      const separator = document.createElement('div');
      separator.style.cssText = 'width: 1px; background: #666; margin: 0 4px;';
      toolbar.appendChild(separator);
      
      toolbar.appendChild(createButton('Left', () => positionImageTo(imageId, 'left')));
      toolbar.appendChild(createButton('Center', () => positionImageTo(imageId, 'center')));
      toolbar.appendChild(createButton('Right', () => positionImageTo(imageId, 'right')));
      toolbar.appendChild(createButton('✕', () => cleanupImageSelection(), '#d32f2f'));
      
      document.body.appendChild(toolbar);
      addCornerHandles(img, imageId);
    };

    const addCornerHandles = (img, imageId) => {
      const rect = img.getBoundingClientRect();
      const handles = ['nw', 'ne', 'sw', 'se'];
      
      handles.forEach(handle => {
        const handleEl = document.createElement('div');
        handleEl.className = `resize-handle resize-${handle} handle-${imageId}`;
        handleEl.style.position = 'fixed';
        handleEl.style.width = '12px';
        handleEl.style.height = '12px';
        handleEl.style.background = '#4285f4';
        handleEl.style.border = '2px solid white';
        handleEl.style.borderRadius = '50%';
        handleEl.style.cursor = `${handle}-resize`;
        handleEl.style.zIndex = '10001';
        handleEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        
        if (handle.includes('n')) handleEl.style.top = (rect.top - 6) + 'px';
        if (handle.includes('s')) handleEl.style.top = (rect.bottom - 6) + 'px';
        if (handle.includes('w')) handleEl.style.left = (rect.left - 6) + 'px';
        if (handle.includes('e')) handleEl.style.left = (rect.right - 6) + 'px';
        
        document.body.appendChild(handleEl);
      });
    };

    const resizeImageTo = (imageId, size) => {
      const img = document.getElementById(`img-${imageId}`);
      if (!img) return;
      
      const sizes = {
        small: '200px',
        medium: '400px', 
        large: '600px',
        full: '100%'
      };
      
      img.style.width = sizes[size];
      img.style.maxWidth = sizes[size];
      
      if (contentRef.current) {
        setContent(contentRef.current.innerHTML);
      }
      
      setTimeout(() => {
        if (selectedImageId === imageId) {
          cleanupImageSelection();
          selectImage(imageId);
        }
      }, 100);
    };

    const positionImageTo = (imageId, position) => {
      const img = document.getElementById(`img-${imageId}`);
      if (!img) return;
      
      img.style.float = 'none';
      img.style.display = 'block';
      img.style.margin = '15px auto';
      
      if (position === 'left') {
        img.style.float = 'left';
        img.style.margin = '0 15px 15px 0';
      } else if (position === 'right') {
        img.style.float = 'right';
        img.style.margin = '0 0 15px 15px';
      }
      
      if (contentRef.current) {
        setContent(contentRef.current.innerHTML);
      }
      
      setTimeout(() => {
        if (selectedImageId === imageId) {
          cleanupImageSelection();
          selectImage(imageId);
        }
      }, 100);
    };

    const handleContentChange = () => {
      if (contentRef.current) {
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        
        setContent(contentRef.current.innerHTML);
        
        if (range) {
          setTimeout(() => {
            try {
              selection.removeAllRanges();
              selection.addRange(range);
            } catch (e) {
              // Ignore errors if range is no longer valid
            }
          }, 0);
        }
      }
    };

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (event.target.closest('.image-toolbar') || 
            event.target.closest('.resize-handle') ||
            event.target.classList.contains('editor-image')) {
          return;
        }
        
        if (!event.target.closest('[contenteditable]')) {
          cleanupImageSelection();
        }
      };

      document.addEventListener('click', handleClickOutside, true);
      return () => {
        document.removeEventListener('click', handleClickOutside, true);
        cleanupImageSelection();
      };
    }, []);

    const getPlainTextContent = (htmlContent) => {
      const div = document.createElement('div');
      div.innerHTML = htmlContent;
      return div.textContent || div.innerText || '';
    };

    // FIXED save functions with proper draft/published logic
    const handleSaveDraft = () => {
      cleanupImageSelection();
      const post = {
        id: initialPost?.id || Date.now(),
        title,
        content: getPlainTextContent(content),
        htmlContent: content,
        date: new Date().toLocaleDateString(),
        status: 'draft'
      };
      
      console.log('Saving draft:', post);
      onSave(post, 'draft');
    };

    const handlePublishPost = () => {
      cleanupImageSelection();
      const post = {
        id: initialPost?.id || Date.now(),
        title,
        content: getPlainTextContent(content),
        htmlContent: content,
        date: new Date().toLocaleDateString(),
        status: 'published'
      };
      
      console.log('Publishing post:', post);
      onSave(post, 'published');
    };

    const handleCancel = () => {
      cleanupImageSelection();
      onCancel();
    };

    return (
      <>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {initialPost ? 'Edit Post' : 'Create Blog Post'}
            </h2>
            <div className="flex gap-2">
              <button onClick={handleCancel} className="px-4 py-2 border rounded hover:bg-gray-50">
                Cancel
              </button>
              <button 
                onClick={handleSaveDraft}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2"
              >
                <Save size={16} />
                Save Draft
              </button>
              <button 
                onClick={handlePublishPost}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
              >
                <Eye size={16} />
                Publish Post
              </button>
            </div>
          </div>

          {/* Title Input */}
          <input
            type="text"
            className="w-full p-3 border rounded-lg mb-4"
            placeholder="Enter post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Complete Formatting Toolbar */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            {/* Font Controls */}
            <div className="flex flex-wrap gap-2 mb-3">
              <select 
                className="px-3 py-1 border rounded"
                onChange={(e) => applyFontFamily(e.target.value)}
                defaultValue="Arial"
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Verdana">Verdana</option>
                <option value="Courier New">Courier New</option>
              </select>
              
              <select 
                className="px-3 py-1 border rounded"
                onChange={(e) => applyFontSize(e.target.value)}
                defaultValue="16px"
              >
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
                <option value="24px">24px</option>
                <option value="28px">28px</option>
                <option value="32px">32px</option>
              </select>

              <input 
                type="color" 
                className="w-10 h-8 border rounded cursor-pointer"
                onChange={(e) => applyTextColor(e.target.value)}
                title="Text Color"
              />
            </div>

            {/* Text Formatting */}
            <div className="flex flex-wrap gap-2 mb-3">
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
              
              <button onClick={() => applyAlignment('left')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100">
                <AlignLeft size={16} />
              </button>
              <button onClick={() => applyAlignment('center')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100">
                <AlignCenter size={16} />
              </button>
              <button onClick={() => applyAlignment('right')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100">
                <AlignRight size={16} />
              </button>
            </div>

            {/* Headings */}
            <div className="flex flex-wrap gap-2 mb-3">
              <select 
                className="px-3 py-1 border rounded"
                onChange={(e) => applyHeading(e.target.value)}
                defaultValue="normal"
              >
                <option value="normal">Normal Text</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
              </select>
            </div>

            {/* IMPROVED Links with proper dialog */}
            <div className="flex flex-wrap gap-2">
              <button onClick={addLink} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                Add Link
              </button>
              <button onClick={removeLink} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                Remove Link
              </button>
              <span className="text-sm text-gray-600 px-2 py-1">Click Add Link to open dialog with Text and URL fields</span>
            </div>
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
              <strong>Multiple Images Supported:</strong> Upload images one at a time. Click any image to resize and position it.
            </p>
          </div>

          {/* Content Editor */}
          <div
            ref={contentRef}
            contentEditable
            className="min-h-96 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ lineHeight: '1.6' }}
            onInput={handleContentChange}
            suppressContentEditableWarning={true}
          />

          {/* Live Preview */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Live Preview</h3>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h4 className="text-xl font-bold mb-3">{title || 'Post Title'}</h4>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: content || 'Start typing to see preview...' }}
              />
            </div>
          </div>
        </div>

        {/* Link Dialog */}
        <LinkDialog
          isOpen={showLinkDialog}
          onClose={() => setShowLinkDialog(false)}
          onInsert={insertLink}
          selectedText={selectedText}
        />
      </>
    );
  };

  // News Feed Component (unchanged)
  const NewsFeed = () => {
    const [newPost, setNewPost] = useState('');

    const handleCreatePost = () => {
      if (newPost.trim()) {
        const post = {
          id: Date.now(),
          author: 'You',
          content: newPost,
          timestamp: 'Just now',
          likes: 0,
          comments: [],
          saved: false
        };
        setNewsFeedPosts([post, ...newsFeedPosts]);
        setNewPost('');
      }
    };

    const toggleLike = (postId) => {
      setNewsFeedPosts(posts => posts.map(post => 
        post.id === postId ? { ...post, likes: post.likes + (post.liked ? -1 : 1), liked: !post.liked } : post
      ));
    };

    const toggleSave = (postId) => {
      setNewsFeedPosts(posts => posts.map(post => 
        post.id === postId ? { ...post, saved: !post.saved } : post
      ));
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">News Feed</h2>
        
        {/* Create Post */}
        <div className="mb-6 p-4 border rounded-lg">
          <textarea
            className="w-full p-3 border rounded-lg resize-none"
            rows="3"
            placeholder="What's on your mind? Share with the community..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handleCreatePost}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              disabled={!newPost.trim()}
            >
              <Send size={16} />
              Share
            </button>
          </div>
        </div>

        {/* News Feed Posts */}
        <div className="space-y-4">
          {newsFeedPosts.map(post => (
            <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {post.author[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{post.author}</span>
                    <span className="text-sm text-gray-500">{post.timestamp}</span>
                  </div>
                  <p className="text-gray-700 mb-3">{post.content}</p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full transition ${
                        post.liked ? 'bg-red-50 text-red-600' : 'hover:bg-gray-100'
                      }`}
                    >
                      <Heart size={16} fill={post.liked ? 'currentColor' : 'none'} />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100">
                      <MessageCircle size={16} />
                      <span>{post.comments.length}</span>
                    </button>
                    <button
                      onClick={() => toggleSave(post.id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full transition ${
                        post.saved ? 'bg-yellow-50 text-yellow-600' : 'hover:bg-gray-100'
                      }`}
                    >
                      <Bookmark size={16} fill={post.saved ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  {post.comments.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-gray-200">
                      {post.comments.map((comment, idx) => (
                        <div key={idx} className="mb-2">
                          <span className="font-medium text-sm">{comment.author}</span>
                          <span className="text-xs text-gray-500 ml-2">{comment.timestamp}</span>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Dashboard Component (unchanged)
  const Dashboard = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Social Engagement Hub</h2>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => { setContentType('post'); setIsCreating(true); setEditingPost(null); }}
          className="p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-3"
        >
          <Plus size={24} />
          Create Post
        </button>
        <button
          onClick={() => { setContentType('email'); setIsCreating(true); }}
          className="p-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-3"
        >
          <Send size={24} />
          Send Campaign
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
          <h3 className="text-sm font-medium text-gray-600">Drafts</h3>
          <p className="text-2xl font-bold text-green-600">{drafts.length}</p>
        </div>
      </div>

      {/* Featured Posts */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          ⭐ Featured Posts
        </h3>
        {posts.filter(post => post.featured).map(post => (
          <div key={post.id} className="border rounded-lg p-4 mb-4 bg-orange-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full font-medium">
                👑 FEATURED POST
              </span>
            </div>
            <h4 className="font-semibold text-lg mb-1">{post.title}</h4>
            <p className="text-sm text-gray-500 mb-2">{post.date}</p>
            <div 
              className="text-gray-700 prose max-w-none"
              dangerouslySetInnerHTML={{ __html: post.htmlContent || post.content }}
            />
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
              <MessageCircle size={16} />
              <span>0 Comments</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Posts</h3>
        {posts.filter(post => !post.featured).map(post => (
          <div key={post.id} className="flex justify-between items-center p-3 border rounded mb-2 hover:bg-gray-50">
            <div>
              <h4 className="font-medium">{post.title}</h4>
              <p className="text-sm text-gray-500">{post.date}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setEditingPost(post);
                  setContentType('post');
                  setIsCreating(true);
                }}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              >
                <Edit size={16} />
              </button>
              <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Content Editor Router with FIXED save logic
  const ContentEditor = () => {
    if (contentType === 'post') {
      return (
        <RichBlogEditor
          initialPost={editingPost}
          onSave={(post, status) => {
            console.log('ContentEditor onSave called:', { post, status, editingPost });
            
            if (status === 'draft') {
              // Saving as draft
              if (editingPost) {
                // Editing existing post/draft
                if (editingPost.status === 'draft') {
                  // Update existing draft
                  setDrafts(prev => prev.map(d => d.id === post.id ? post : d));
                } else {
                  // Converting published post to draft (unusual but possible)
                  setPosts(prev => prev.filter(p => p.id !== post.id));
                  setDrafts(prev => [post, ...prev]);
                }
              } else {
                // Creating new draft
                setDrafts(prev => [post, ...prev]);
              }
            } else {
              // Publishing post
              if (editingPost) {
                // Editing existing post/draft
                if (editingPost.status === 'draft') {
                  // Publishing draft - remove from drafts, add to posts
                  setDrafts(prev => prev.filter(d => d.id !== post.id));
                  setPosts(prev => [post, ...prev]);
                } else {
                  // Updating published post
                  setPosts(prev => prev.map(p => p.id === post.id ? post : p));
                }
              } else {
                // Creating new published post
                setPosts(prev => [post, ...prev]);
              }
            }
            
            setIsCreating(false);
            setEditingPost(null);
          }}
          onCancel={() => {
            setIsCreating(false);
            setEditingPost(null);
          }}
        />
      );
    }
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Other Content Types</h2>
        <p>Email campaigns and scheduled content coming soon...</p>
        <button
          onClick={() => setIsCreating(false)}
          className="mt-4 px-4 py-2 border rounded hover:bg-gray-50"
        >
          Back to Dashboard
        </button>
      </div>
    );
  };

  // Post Component - renders HTML properly
  const PostCard = ({ post }) => (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold">{post.title}</h3>
          <p className="text-sm text-gray-500 mb-2">{post.date}</p>
          <div 
            className="text-gray-700 prose max-w-none"
            dangerouslySetInnerHTML={{ __html: post.htmlContent || post.content }}
          />
        </div>
        <div className="flex gap-2 ml-4">
          <button 
            onClick={() => {
              setEditingPost(post);
              setContentType('post');
              setIsCreating(true);
            }}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit size={16} />
          </button>
          <button className="p-1 text-red-600 hover:bg-red-50 rounded">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  // WIDGET SYSTEM - Settings Component
  const Settings = () => {
    const [copiedWidget, setCopiedWidget] = useState('');

    const widgets = [
      { id: 'blog', name: 'Blog Posts', icon: FileText, description: 'Display latest blog posts with read more functionality' },
      { id: 'signup', name: 'Newsletter Signup', icon: UserPlus, description: 'Email capture form for growing your community' },
      { id: 'newsfeed', name: 'Community Feed', icon: MessageSquare, description: 'Live community posts with engagement features' },
      { id: 'featured', name: 'Featured Post', icon: TrendingUp, description: 'Highlight your most important content' },
      { id: 'stats', name: 'Community Stats', icon: BarChart3, description: 'Show member count and activity metrics' },
      { id: 'activity', name: 'Recent Activity', icon: Clock, description: 'Display latest community activity' }
    ];

    const copyEmbedCode = (widgetType) => {
      const code = generateEmbedCode(widgetType, widgetConfig[widgetType]);
      navigator.clipboard.writeText(code);
      setCopiedWidget(widgetType);
      setTimeout(() => setCopiedWidget(''), 2000);
    };

    const getWidgetComponent = (widgetType) => {
      switch (widgetType) {
        case 'blog': return <BlogWidget config={widgetConfig.blog} isPreview={true} />;
        case 'signup': return <SignupWidget config={widgetConfig.signup} isPreview={true} />;
        case 'newsfeed': return <NewsFeedWidget config={widgetConfig.newsfeed} isPreview={true} />;
        case 'featured': return <FeaturedWidget config={widgetConfig.featured} isPreview={true} />;
        case 'stats': return <StatsWidget config={widgetConfig.stats} isPreview={true} />;
        case 'activity': return <ActivityWidget config={widgetConfig.activity} isPreview={true} />;
        default: return null;
      }
    };

    const getDeviceClass = () => {
      switch (previewDevice) {
        case 'mobile': return 'max-w-sm';
        case 'tablet': return 'max-w-md';
        default: return 'max-w-lg';
      }
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Embeddable Widgets</h2>
        <p className="text-gray-600 mb-8">Create embeddable widgets to showcase your content on any website. Customize the appearance and copy the embed code.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Widget Selection */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Choose Widget</h3>
            <div className="space-y-2">
              {widgets.map(widget => (
                <button
                  key={widget.id}
                  onClick={() => setSelectedWidget(widget.id)}
                  className={`w-full p-3 text-left border rounded-lg transition ${
                    selectedWidget === widget.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <widget.icon size={20} className={selectedWidget === widget.id ? 'text-blue-600' : 'text-gray-500'} />
                    <div>
                      <div className="font-medium">{widget.name}</div>
                      <div className="text-sm text-gray-500">{widget.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Configuration Panel */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Customize</h3>
              <WidgetConfig
                widgetType={selectedWidget}
                config={widgetConfig[selectedWidget]}
                onChange={(type, newConfig) => {
                  setWidgetConfig(prev => ({
                    ...prev,
                    [type]: newConfig
                  }));
                }}
              />
            </div>

            {/* Embed Code */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Embed Code</h3>
              <div className="relative">
                <textarea
                  readOnly
                  value={generateEmbedCode(selectedWidget, widgetConfig[selectedWidget])}
                  className="w-full p-3 border rounded-lg bg-gray-50 text-sm font-mono"
                  rows="6"
                />
                <button
                  onClick={() => copyEmbedCode(selectedWidget)}
                  className="absolute top-2 right-2 p-2 bg-white border rounded hover:bg-gray-50"
                  title="Copy to clipboard"
                >
                  {copiedWidget === selectedWidget ? (
                    <span className="text-green-600 text-sm">✓ Copied!</span>
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Live Preview</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-2 border rounded ${previewDevice === 'desktop' ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}
                >
                  <Monitor size={16} />
                </button>
                <button
                  onClick={() => setPreviewDevice('tablet')}
                  className={`p-2 border rounded ${previewDevice === 'tablet' ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}
                >
                  <Tablet size={16} />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-2 border rounded ${previewDevice === 'mobile' ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}
                >
                  <Smartphone size={16} />
                </button>
              </div>
            </div>
            
            <div className="border rounded-lg p-6 bg-gray-50 min-h-96">
              <div className={`mx-auto ${getDeviceClass()}`}>
                {getWidgetComponent(selectedWidget)}
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">How to Use</h4>
              <ol className="text-sm text-gray-700 space-y-1">
                <li>1. Customize your widget using the controls on the left</li>
                <li>2. Copy the embed code from the textarea</li>
                <li>3. Paste the code into any HTML page where you want the widget to appear</li>
                <li>4. The widget will automatically load with your customized settings</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800">Social Hub</h2>
        </div>
        <nav className="px-4 pb-6">
          {navItems.map(item => (
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

      {/* Main Content */}
      <div className="flex-1 p-8">
        {isCreating ? (
          <ContentEditor />
        ) : (
          <>
            {activeSection === 'dashboard' && <Dashboard />}
            {activeSection === 'newsfeed' && <NewsFeed />}
            {activeSection === 'settings' && <Settings />}
            {activeSection === 'posts' && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Blog Posts</h2>
                  <button
                    onClick={() => { setContentType('post'); setIsCreating(true); setEditingPost(null); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus size={20} /> New Post
                  </button>
                </div>
                
                {/* Drafts Section */}
                {drafts.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-600">📝 Drafts</h3>
                    <div className="space-y-3">
                      {drafts.map(post => (
                        <div key={post.id} className="border rounded-lg p-4 bg-yellow-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full font-medium">
                                  DRAFT
                                </span>
                              </div>
                              <h3 className="font-semibold">{post.title}</h3>
                              <p className="text-sm text-gray-500 mb-2">{post.date}</p>
                              <div 
                                className="text-gray-700 prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: post.htmlContent || post.content }}
                              />
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button 
                                onClick={() => {
                                  setEditingPost(post);
                                  setContentType('post');
                                  setIsCreating(true);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              >
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
                )}

                {/* Published Posts */}
                <h3 className="text-lg font-semibold mb-3">📰 Published Posts</h3>
                <div className="space-y-3">
                  {posts.map(post => <PostCard key={post.id} post={post} />)}
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
            {activeSection === 'members' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-6">Members ({members.length})</h2>
                <div className="space-y-2">
                  {members.map((member, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{member.name || member.email}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                        <p className="text-xs text-gray-400">Joined: {member.joinDate}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit size={16} />
                        </button>
                        <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {members.length === 0 && (
                    <p className="text-gray-500">No members yet.</p>
                  )}
                </div>
              </div>
            )}
            {activeSection === 'calendar' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-6">Calendar</h2>
                <p className="text-gray-600">Calendar functionality coming soon...</p>
              </div>
            )}
            {activeSection === 'analytics' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-6">Analytics</h2>
                <p className="text-gray-600">Analytics dashboard coming soon...</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal for blog post content */}
      {showModal && modalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{modalContent.title}</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">{modalContent.date}</p>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: modalContent.htmlContent || modalContent.content }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
