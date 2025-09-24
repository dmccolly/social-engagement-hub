import React, { useState, useEffect, useRef } from 'react';
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
  Vote,
  Save,
  Send
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
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const contentRef = useRef(null);

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

  // Enhanced Content Editor with Rich Text Functionality
  const ContentEditor = () => {
    // Handle content change - FIXED to prevent backwards typing
    const handleContentChange = (e) => {
      // Store cursor position before updating state
      const selection = window.getSelection();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      const startOffset = range ? range.startOffset : 0;
      const endOffset = range ? range.endOffset : 0;
      const startContainer = range ? range.startContainer : null;
      
      // Update content state
      setEditorContent(e.target.innerHTML);
      
      // Restore cursor position after React re-render
      setTimeout(() => {
        if (startContainer && contentRef.current && contentRef.current.contains(startContainer)) {
          try {
            const newRange = document.createRange();
            newRange.setStart(startContainer, Math.min(startOffset, startContainer.textContent?.length || 0));
            newRange.setEnd(startContainer, Math.min(endOffset, startContainer.textContent?.length || 0));
            selection.removeAllRanges();
            selection.addRange(newRange);
          } catch (e) {
            // Fallback: place cursor at end
            const newRange = document.createRange();
            newRange.selectNodeContents(contentRef.current);
            newRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        }
      }, 0);
    };

    // Handle file upload
    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      setIsUploading(true);
      
      try {
        // Create a simple data URL for demo purposes
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            id: Date.now(),
            src: e.target.result,
            alt: file.name,
            size: 'medium',
            position: 'center',
            width: 400,
            height: 'auto'
          };
          
          setImages(prev => [...prev, newImage]);
          insertImageIntoContent(newImage);
          
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed. Please try again.');
        setIsUploading(false);
      }
    };

    // Insert image into content
    const insertImageIntoContent = (image) => {
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

        const imageElement = document.createElement('div');
        imageElement.className = 'image-container';
        imageElement.style.cssText = `
          position: relative;
          display: inline-block;
          margin: 16px 0;
          max-width: 100%;
          text-align: ${image.position};
        `;
        imageElement.innerHTML = `
          <img 
            src="${image.src}" 
            alt="${image.alt}"
            data-image-id="${image.id}"
            style="
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              cursor: pointer;
              width: ${image.width}px;
            "
          />
        `;

        range.insertNode(imageElement);
        range.setStartAfter(imageElement);
        range.setEndAfter(imageElement);
        selection.removeAllRanges();
        selection.addRange(range);

        // Add click handler for image selection
        const img = imageElement.querySelector('img');
        img.addEventListener('click', () => {
          setSelectedImage(image.id);
        });
      }
    };

    // Format text functions
    const formatText = (command, value = null) => {
      document.execCommand(command, false, value);
      contentRef.current.focus();
    };

    // Handle link insertion
    const handleLinkInsert = () => {
      if (linkText && linkUrl) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const linkElement = document.createElement('a');
          linkElement.href = linkUrl;
          linkElement.textContent = linkText;
          linkElement.style.color = '#3b82f6';
          linkElement.style.textDecoration = 'underline';
          
          range.deleteContents();
          range.insertNode(linkElement);
          range.setStartAfter(linkElement);
          range.setEndAfter(linkElement);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        setShowLinkDialog(false);
        setLinkText('');
        setLinkUrl('');
        contentRef.current.focus();
      }
    };

    // Save post function
    const handleSave = (isDraft = false) => {
      if (!postTitle.trim()) {
        alert('Please enter a post title');
        return;
      }

      const newPost = {
        id: editingPost ? editingPost.id : Date.now(),
        title: postTitle,
        content: editorContent,
        date: new Date().toLocaleDateString(),
        featured: false,
        published: !isDraft,
        image: images.length > 0 ? images[0].src : null
      };

      if (isDraft) {
        if (editingPost) {
          setDrafts(prev => prev.map(draft => 
            draft.id === editingPost.id ? newPost : draft
          ));
        } else {
          setDrafts(prev => [...prev, newPost]);
        }
      } else {
        if (editingPost) {
          if (editingPost.published) {
            setPosts(prev => prev.map(post => 
              post.id === editingPost.id ? newPost : post
            ));
          } else {
            // Moving from draft to published
            setDrafts(prev => prev.filter(draft => draft.id !== editingPost.id));
            setPosts(prev => [...prev, newPost]);
          }
        } else {
          setPosts(prev => [...prev, newPost]);
        }
      }

      // Reset editor
      setIsCreating(false);
      setEditingPost(null);
      setPostTitle('');
      setEditorContent('');
      setImages([]);
      setSelectedImage(null);
    };

    return (
      <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
              {editingPost ? 'Edit Post' : 'Create New Post'}
            </h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Write and format your blog post with rich text editing
            </p>
          </div>
          <button
            onClick={() => {
              setIsCreating(false);
              setEditingPost(null);
              setPostTitle('');
              setEditorContent('');
              setImages([]);
            }}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <X size={20} />
            Cancel
          </button>
        </div>

        {/* Title Input */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>
            Post Title
          </label>
          <input
            type="text"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            placeholder="Enter your post title..."
            style={{
              width: '100%',
              padding: '16px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Toolbar */}
        <div style={{
          backgroundColor: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '8px 8px 0 0',
          padding: '16px',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Text Formatting */}
          <button
            onClick={() => formatText('bold')}
            style={{
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => formatText('italic')}
            style={{
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => formatText('underline')}
            style={{
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Underline size={16} />
          </button>

          <div style={{ width: '1px', height: '24px', backgroundColor: '#d1d5db', margin: '0 8px' }} />

          {/* Alignment */}
          <button
            onClick={() => formatText('justifyLeft')}
            style={{
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <AlignLeft size={16} />
          </button>
          <button
            onClick={() => formatText('justifyCenter')}
            style={{
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <AlignCenter size={16} />
          </button>
          <button
            onClick={() => formatText('justifyRight')}
            style={{
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <AlignRight size={16} />
          </button>

          <div style={{ width: '1px', height: '24px', backgroundColor: '#d1d5db', margin: '0 8px' }} />

          {/* Link */}
          <button
            onClick={() => setShowLinkDialog(true)}
            style={{
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Link size={16} />
          </button>

          {/* Image Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={{
              backgroundColor: isUploading ? '#d1d5db' : '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              padding: '8px',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Upload size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>

        {/* Content Editor */}
        <div
          ref={contentRef}
          contentEditable
          onInput={handleContentChange}
          dangerouslySetInnerHTML={{ __html: editorContent }}
          style={{
            minHeight: '400px',
            padding: '24px',
            border: '2px solid #e5e7eb',
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            backgroundColor: 'white',
            fontSize: '16px',
            lineHeight: '1.6',
            outline: 'none'
          }}
          placeholder="Start writing your post..."
        />

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => handleSave(true)}
            style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Save size={20} />
            Save as Draft
          </button>
          <button
            onClick={() => handleSave(false)}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Send size={20} />
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
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '12px',
              width: '400px',
              maxWidth: '90vw'
            }}>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                Insert Link
              </h3>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
                  Text to Display
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Enter link text..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowLinkDialog(false);
                    setLinkText('');
                    setLinkUrl('');
                  }}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLinkInsert}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontSize: '16px',
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

  // Dashboard Component
  const Dashboard = () => (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
        Social Engagement Hub
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '32px' }}>
        Welcome back! Here's what's happening in your community.
      </p>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <button
          onClick={() => {
            setActiveSection('blog');
            setIsCreating(true);
          }}
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
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Plus size={24} />
          Create Post
        </button>
        
        <button
          onClick={() => setActiveSection('newsfeed')}
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
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <MessageSquare size={24} />
          View News Feed
        </button>
        
        <button
          onClick={() => setActiveSection('settings')}
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
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <SettingsIcon size={24} />
          Manage Widgets
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px', fontWeight: 'bold' }}>Total Posts</h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
            {posts.filter(post => post.published).length}
          </p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px', fontWeight: 'bold' }}>Featured Posts</h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
            {posts.filter(post => post.featured && post.published).length}
          </p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px', fontWeight: 'bold' }}>Draft Posts</h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
            {drafts.length}
          </p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px', fontWeight: 'bold' }}>Community Posts</h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
            {newsFeed.length}
          </p>
        </div>
      </div>

      {/* Featured Posts */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Star size={20} color="#f59e0b" />
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>Featured Posts</h2>
        </div>
        
        {posts.filter(post => post.featured && post.published).length > 0 ? (
          posts.filter(post => post.featured && post.published).map(post => (
            <div key={post.id} style={{
              backgroundColor: 'white',
              border: '2px solid #fbbf24',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Star size={16} color="#fbbf24" />
                <span style={{ backgroundColor: '#fbbf24', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                  FEATURED POST
                </span>
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                {post.title}
              </h3>
              <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>{post.date}</p>
              <p style={{ margin: '0 0 16px 0', color: '#374151', lineHeight: '1.6' }}>{post.content}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
                <MessageSquare size={16} />
                <span>0 Comments</span>
              </div>
            </div>
          ))
        ) : (
          <div style={{
            backgroundColor: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <Star size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
            <p style={{ margin: 0, fontSize: '18px' }}>No featured posts yet. Create your first featured post!</p>
          </div>
        )}
      </div>

      {/* Recent Posts */}
      <div>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>Recent Posts</h2>
        
        {posts.filter(post => post.published && !post.featured).length > 0 ? (
          posts.filter(post => post.published && !post.featured).map(post => (
            <div key={post.id} style={{
              backgroundColor: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                  {post.title}
                </h3>
                <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>{post.date}</p>
                <p style={{ margin: 0, color: '#374151', lineHeight: '1.6' }}>
                  {post.content.length > 100 ? `${post.content.substring(0, 100)}...` : post.content}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
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
                    borderRadius: '6px',
                    padding: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Eye size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{
            backgroundColor: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <FileText size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
            <p style={{ margin: 0, fontSize: '18px' }}>No posts yet. Create your first post to get started!</p>
          </div>
        )}
      </div>
    </div>
  );

  // News Feed Component
  const NewsFeed = () => {
    const [newPost, setNewPost] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    const addPost = () => {
      if (newPost.trim()) {
        const post = {
          id: Date.now(),
          author: "You",
          content: newPost,
          timestamp: "Just now",
          likes: 0,
          comments: []
        };
        setNewsFeed([post, ...newsFeed]);
        setNewPost('');
      }
    };

    const likePost = (postId) => {
      setNewsFeed(newsFeed.map(post => 
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      ));
    };

    const addReply = (postId) => {
      if (replyText.trim()) {
        const reply = {
          author: "You",
          content: replyText,
          timestamp: "Just now"
        };
        
        setNewsFeed(newsFeed.map(post => 
          post.id === postId 
            ? { ...post, comments: [...post.comments, reply] }
            : post
        ));
        
        setReplyText('');
        setReplyingTo(null);
      }
    };

    return (
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
          News Feed
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '32px' }}>
          Share updates and engage with your community
        </p>

        {/* Create Post */}
        <div style={{
          backgroundColor: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
            Share an Update
          </h3>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '16px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '16px',
              resize: 'vertical',
              marginBottom: '16px',
              boxSizing: 'border-box'
            }}
          />
          <button
            onClick={addPost}
            disabled={!newPost.trim()}
            style={{
              backgroundColor: newPost.trim() ? '#10b981' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              cursor: newPost.trim() ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Send size={20} />
            Post Update
          </button>
        </div>

        {/* News Feed Posts */}
        {newsFeed.map(post => (
          <div key={post.id} style={{
            backgroundColor: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
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
                <div style={{ color: '#6b7280', fontSize: '14px' }}>{post.timestamp}</div>
              </div>
            </div>
            
            <p style={{ margin: '0 0 16px 0', color: '#374151', lineHeight: '1.6' }}>
              {post.content}
            </p>
            
            <div style={{ display: 'flex', gap: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={() => likePost(post.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}
              >
                ❤️ {post.likes} Likes
              </button>
              <button 
                onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}
              >
                💬 {post.comments.length} Comments
              </button>
              <button style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}>
                🔄 Share
              </button>
            </div>

            {/* Reply Section */}
            {replyingTo === post.id && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    style={{
                      flex: 1,
                      minHeight: '60px',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                  <button
                    onClick={() => addReply(post.id)}
                    disabled={!replyText.trim()}
                    style={{
                      backgroundColor: replyText.trim() ? '#3b82f6' : '#d1d5db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    Reply
                  </button>
                </div>
              </div>
            )}

            {/* Comments */}
            {post.comments.length > 0 && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                {post.comments.map((comment, index) => (
                  <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>
                      {comment.author.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1f2937' }}>
                        {comment.author}
                      </div>
                      <div style={{ color: '#374151', fontSize: '14px', lineHeight: '1.5' }}>
                        {comment.content}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
                        {comment.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Blog Posts Component
  const BlogPosts = () => {
    const publishedPosts = posts.filter(post => post.published);
    
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
              Blog Posts
            </h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Manage your blog content and create new posts
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '16px',
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

        {/* Drafts Section */}
        {drafts.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
              Drafts
            </h2>
            {drafts.map(post => (
              <div key={post.id} style={{
                backgroundColor: '#fffbeb',
                border: '2px solid #fbbf24',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ backgroundColor: '#fbbf24', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                      DRAFT
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                    {post.title}
                  </h3>
                  <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>{post.date}</p>
                  <p style={{ margin: 0, color: '#374151', lineHeight: '1.6' }}>
                    {post.content.length > 100 ? `${post.content.substring(0, 100)}...` : post.content}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
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
                      borderRadius: '6px',
                      padding: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      setDrafts(prev => prev.filter(d => d.id !== post.id));
                    }}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Published Posts */}
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
            Published Posts
          </h2>
          
          {publishedPosts.map(post => (
            <div key={post.id} style={{
              backgroundColor: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div style={{ flex: 1 }}>
                {post.featured && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Star size={16} color="#fbbf24" />
                    <span style={{ backgroundColor: '#fbbf24', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                      FEATURED POST
                    </span>
                  </div>
                )}
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                  {post.title}
                </h3>
                <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>{post.date}</p>
                <div style={{ margin: '0 0 16px 0', color: '#374151', lineHeight: '1.6' }} 
                     dangerouslySetInnerHTML={{ __html: post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
                  <MessageSquare size={16} />
                  <span>0 Comments</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
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
                    borderRadius: '6px',
                    padding: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Eye size={16} />
                </button>
                <button 
                  onClick={() => {
                    setPosts(prev => prev.map(p => 
                      p.id === post.id ? { ...p, featured: !p.featured } : p
                    ));
                  }}
                  style={{
                    backgroundColor: post.featured ? '#fbbf24' : '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Star size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Widget Preview Components
  const renderWidgetPreview = (widgetId, settings) => {
    switch (widgetId) {
      case 'blog':
        return <BlogWidgetPreview settings={settings} />;
      case 'newsfeed':
        return <NewsFeedWidgetPreview settings={settings} />;
      case 'signup':
        return <SignupWidgetPreview settings={settings} />;
      case 'featured':
        return <FeaturedWidgetPreview settings={settings} />;
      case 'stats':
        return <StatsWidgetPreview settings={settings} />;
      case 'poll':
        return <PollWidgetPreview settings={settings} />;
      case 'activity':
        return <ActivityWidgetPreview settings={settings} />;
      default:
        return <div>Widget preview not available</div>;
    }
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

  // Other widget preview components
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

  const FeaturedWidgetPreview = ({ settings }) => {
    const featuredPost = posts.find(post => post.featured && post.published);
    
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
          Featured Post
        </div>
        {featuredPost ? (
          <div style={{ padding: '20px' }}>
            {settings.showImage && featuredPost.image && (
              <img 
                src={featuredPost.image} 
                alt={featuredPost.title}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}
              />
            )}
            <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
              {featuredPost.title}
            </h3>
            <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>
              {featuredPost.date}
            </div>
            <div style={{ color: '#374151', fontSize: '16px', lineHeight: '1.6' }}>
              {featuredPost.content.substring(0, 150)}...
            </div>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            <Star size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
            <p>No featured post available</p>
          </div>
        )}
      </div>
    );
  };

  const StatsWidgetPreview = ({ settings }) => (
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
        Community Stats
      </div>
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: settings.primaryColor }}>
            {posts.filter(post => post.published).length}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Published Posts</div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: settings.primaryColor }}>
            {newsFeed.length}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Community Updates</div>
        </div>
        <div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: settings.primaryColor }}>
            {posts.filter(post => post.featured).length}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Featured Content</div>
        </div>
      </div>
    </div>
  );

  const PollWidgetPreview = ({ settings }) => (
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
        Quick Poll
      </div>
      <div style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '18px' }}>
          {settings.question}
        </h3>
        <div style={{ marginBottom: '12px' }}>
          <button style={{
            width: '100%',
            padding: '12px',
            border: `2px solid ${settings.primaryColor}`,
            backgroundColor: 'white',
            color: settings.primaryColor,
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '8px'
          }}>
            Option A
          </button>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <button style={{
            width: '100%',
            padding: '12px',
            border: `2px solid ${settings.primaryColor}`,
            backgroundColor: 'white',
            color: settings.primaryColor,
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '8px'
          }}>
            Option B
          </button>
        </div>
        <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
          23 votes so far
        </div>
      </div>
    </div>
  );

  const ActivityWidgetPreview = ({ settings }) => (
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
        Recent Activity
      </div>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
            New post published
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>
            {settings.showTimestamps && '2 hours ago'}
          </div>
        </div>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
            Community member joined
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>
            {settings.showTimestamps && '4 hours ago'}
          </div>
        </div>
        <div style={{ padding: '16px' }}>
          <div style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
            New comment added
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>
            {settings.showTimestamps && '6 hours ago'}
          </div>
        </div>
      </div>
    </div>
  );

  // Settings Page Component
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
        return (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <Mail size={64} color="#d1d5db" style={{ marginBottom: '16px' }} />
            <h2 style={{ color: '#1f2937', marginBottom: '8px' }}>Email Campaigns</h2>
            <p style={{ color: '#6b7280' }}>Coming soon - Create and manage email campaigns</p>
          </div>
        );
      case 'members':
        return (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <Users size={64} color="#d1d5db" style={{ marginBottom: '16px' }} />
            <h2 style={{ color: '#1f2937', marginBottom: '8px' }}>Members</h2>
            <p style={{ color: '#6b7280' }}>Coming soon - Manage community members</p>
          </div>
        );
      case 'calendar':
        return (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <Calendar size={64} color="#d1d5db" style={{ marginBottom: '16px' }} />
            <h2 style={{ color: '#1f2937', marginBottom: '8px' }}>Calendar</h2>
            <p style={{ color: '#6b7280' }}>Coming soon - Schedule and manage events</p>
          </div>
        );
      case 'analytics':
        return (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <BarChart3 size={64} color="#d1d5db" style={{ marginBottom: '16px' }} />
            <h2 style={{ color: '#1f2937', marginBottom: '8px' }}>Analytics</h2>
            <p style={{ color: '#6b7280' }}>Coming soon - View detailed analytics and insights</p>
          </div>
        );
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
                        marginLeft: '8px'
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

      {/* Full Post Modal */}
      {selectedPost && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '800px',
            maxHeight: '90vh',
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
