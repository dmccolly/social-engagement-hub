import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { 
  Home, MessageSquare, FileText, Mail, Users, Calendar, BarChart3, Settings,
  Plus, Send, Clock, Edit, Trash2, Heart, MessageCircle, Bookmark,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Upload,
  Eye, Copy, Check, Star, TrendingUp, Activity, Vote
} from 'lucide-react';

// Standalone News Feed Widget Component
const StandaloneNewsFeedWidget = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const settingsParam = urlParams.get('settings');
  const settings = settingsParam ? JSON.parse(decodeURIComponent(settingsParam)) : {
    primaryColor: '#10b981',
    showReplies: true,
    maxPosts: 5
  };

  // Sample news feed posts for the widget
  const newsFeedPosts = [
    {
      id: 1,
      author: 'Admin',
      content: 'Welcome to our community! Feel free to share your thoughts and engage with other members.',
      timestamp: '2 hours ago',
      likes: 5,
      comments: [
        { author: 'User1', content: 'Thanks for the warm welcome!', timestamp: '1 hour ago' }
      ]
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
      ]
    }
  ];

  const displayPosts = newsFeedPosts.slice(0, settings.maxPosts);
  
  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '0',
      overflow: 'visible',
      width: '100%',
      height: '100vh',
      boxShadow: 'none',
      position: 'relative'
    }}>
      {/* Widget Header */}
      <div style={{
        backgroundColor: settings.primaryColor,
        color: 'white',
        padding: '16px',
        fontWeight: '700',
        fontSize: '18px',
        textAlign: 'center',
        letterSpacing: '0.5px',
        borderRadius: '8px 8px 0 0'
      }}>
        💬 Community Feed
      </div>
      
      {/* News Feed Content */}
      <div style={{ 
        height: 'calc(100vh - 120px)', 
        overflowY: 'auto',
        backgroundColor: 'transparent',
        padding: '0'
      }}>
        {displayPosts.map((post, index) => (
          <article key={post.id} style={{
            padding: '20px',
            borderBottom: index < displayPosts.length - 1 ? `2px solid ${settings.primaryColor}20` : 'none',
            backgroundColor: 'transparent'
          }}>
            {/* Post Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: settings.primaryColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                marginRight: '12px'
              }}>
                {post.author[0]}
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#1a1a1a' }}>{post.author}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{post.timestamp}</div>
              </div>
            </div>
            
            {/* Post Content */}
            <div style={{
              color: '#333',
              fontSize: '15px',
              lineHeight: '1.6',
              marginBottom: '12px'
            }}>
              {post.content}
            </div>
            
            {/* Post Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '12px'
            }}>
              <button style={{
                background: 'none',
                border: 'none',
                color: settings.primaryColor,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                ❤️ {post.likes}
              </button>
              <button style={{
                background: 'none',
                border: 'none',
                color: settings.primaryColor,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                💬 {post.comments.length}
              </button>
            </div>
            
            {/* Comments */}
            {settings.showReplies && post.comments.length > 0 && (
              <div style={{
                marginLeft: '20px',
                paddingLeft: '16px',
                borderLeft: `2px solid ${settings.primaryColor}30`
              }}>
                {post.comments.slice(0, 2).map((comment, idx) => (
                  <div key={idx} style={{
                    marginBottom: '8px',
                    fontSize: '14px'
                  }}>
                    <span style={{ fontWeight: '600', color: '#1a1a1a' }}>{comment.author}</span>
                    <span style={{ color: '#333', marginLeft: '8px' }}>{comment.content}</span>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{comment.timestamp}</div>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
      
      {/* Widget Footer */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        backgroundColor: settings.primaryColor,
        color: 'white',
        padding: '8px',
        textAlign: 'center',
        fontSize: '12px',
        fontWeight: '600',
        borderRadius: '0 0 8px 8px'
      }}>
        Powered by Social Hub
      </div>
    </div>
  );
};

// Standalone Blog Widget Component
const StandaloneBlogWidget = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const settingsParam = urlParams.get('settings');
  const settings = settingsParam ? JSON.parse(decodeURIComponent(settingsParam)) : {
    primaryColor: '#3b82f6',
    showImages: true,
    maxPosts: 3
  };

  // Sample blog posts for the widget
  const posts = [
    { id: 1, title: 'Welcome to Our Platform', content: 'This is a featured post!', date: '9/23/2025', featured: true, published: true },
    { id: 2, title: 'Latest Updates', content: 'Check out our new features', date: '9/23/2025', featured: false, published: true }
  ];

  const blogPosts = posts.filter(post => post.published === true);
  const displayPosts = blogPosts.slice(0, settings.maxPosts);
  
  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '0',
      overflow: 'visible',
      width: '100%',
      height: '100vh',
      boxShadow: 'none',
      position: 'relative'
    }}>
      {/* Widget Header */}
      <div style={{
        backgroundColor: settings.primaryColor,
        color: 'white',
        padding: '16px',
        fontWeight: '700',
        fontSize: '18px',
        textAlign: 'center',
        letterSpacing: '0.5px',
        borderRadius: '8px 8px 0 0'
      }}>
        📝 Latest Blog Posts
      </div>
      
      {/* Blog Posts Content */}
      <div style={{ 
        height: 'calc(100vh - 120px)', 
        overflowY: 'auto',
        backgroundColor: 'transparent',
        padding: '0'
      }}>
        {displayPosts.length > 0 ? displayPosts.map((post, index) => (
          <article key={post.id} style={{
            padding: '20px',
            borderBottom: index < displayPosts.length - 1 ? `2px solid ${settings.primaryColor}20` : 'none',
            backgroundColor: 'transparent'
          }}>
            {/* Post Title */}
            <h3 style={{
              margin: '0 0 10px 0',
              fontSize: '18px',
              fontWeight: '700',
              color: '#1a1a1a',
              lineHeight: '1.3',
              cursor: 'pointer'
            }}>
              {post.title}
            </h3>
            
            {/* Post Date */}
            <div style={{
              color: '#666',
              fontSize: '13px',
              marginBottom: '12px',
              fontWeight: '500'
            }}>
              📅 {post.date}
            </div>
            
            {/* Post Content */}
            <div style={{
              color: '#333',
              fontSize: '15px',
              lineHeight: '1.6',
              marginBottom: '12px'
            }}>
              {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
            </div>
            
            {/* Featured Badge */}
            {post.featured && (
              <div style={{
                display: 'inline-block',
                backgroundColor: '#ff6b35',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                ⭐ Featured
              </div>
            )}
            
            {/* Read More Link */}
            <div style={{
              marginTop: '12px'
            }}>
              <a href="#" style={{
                color: settings.primaryColor,
                fontSize: '14px',
                fontWeight: '600',
                textDecoration: 'none',
                borderBottom: `2px solid ${settings.primaryColor}40`
              }}>
                Read More →
              </a>
            </div>
          </article>
        )) : (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: '#999',
            fontSize: '16px',
            backgroundColor: 'transparent'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <div>No blog posts yet</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>Check back soon for updates!</div>
          </div>
        )}
      </div>
      
      {/* Widget Footer */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        backgroundColor: settings.primaryColor,
        color: 'white',
        padding: '8px',
        textAlign: 'center',
        fontSize: '12px',
        fontWeight: '600',
        borderRadius: '0 0 8px 8px'
      }}>
        Powered by Social Hub
      </div>
    </div>
  );
};

// Main App Component
const MainApp = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isCreating, setIsCreating] = useState(false);
  const [contentType, setContentType] = useState('post');
  const [posts, setPosts] = useState([
    { id: 1, title: 'Welcome to Our Platform', content: 'This is a featured post!', date: '9/23/2025', featured: true, published: true },
    { id: 2, title: 'Latest Updates', content: 'Check out our new features', date: '9/23/2025', featured: false, published: true }
  ]);
  const [drafts, setDrafts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [members, setMembers] = useState([]);
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
    }
  ]);

  // Rich Blog Editor Component with ALL formatting tools
  const RichBlogEditor = ({ onSave, onCancel }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const contentRef = useRef(null);
    const fileInputRef = useRef(null);

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

    const addLink = () => {
      const url = document.getElementById('linkUrl').value;
      if (url) {
        document.execCommand('createLink', false, url);
        if (contentRef.current) {
          setContent(contentRef.current.innerHTML);
        }
        document.getElementById('linkUrl').value = '';
      }
    };

    const removeLink = () => {
      document.execCommand('unlink', false, null);
      if (contentRef.current) {
        setContent(contentRef.current.innerHTML);
      }
    };

    // Image handling functions
    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      setIsUploading(true);
      
      try {
        // Create local URL for immediate display
        const localUrl = URL.createObjectURL(file);
        const imageId = Date.now().toString();
        
        const img = document.createElement('img');
        img.src = localUrl;
        img.id = `img-${imageId}`;
        img.style.maxWidth = '400px';
        img.style.height = 'auto';
        img.style.border = '2px solid transparent';
        img.style.borderRadius = '4px';
        img.style.cursor = 'pointer';
        img.style.transition = 'border-color 0.2s';
        img.style.display = 'block';
        img.style.margin = '15px auto';
        
        // Add click handler for selection
        img.onclick = () => selectImage(imageId);
        
        // Insert into editor
        const editor = contentRef.current;
        if (editor) {
          editor.appendChild(img);
          setContent(editor.innerHTML);
        }
        
        console.log('Image inserted successfully');
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    };

    // Image selection and manipulation
    const selectImage = (imageId) => {
      console.log('Image selected:', imageId);
      setSelectedImageId(imageId);
      
      // Clean up previous selections
      document.querySelectorAll('.selected-image').forEach(el => {
        el.classList.remove('selected-image');
        el.style.border = '2px solid transparent';
        el.style.boxShadow = 'none';
      });
      
      document.querySelectorAll('.image-toolbar').forEach(el => el.remove());
      document.querySelectorAll('.resize-handle').forEach(el => el.remove());
      
      // Find and select the image
      const img = document.getElementById(`img-${imageId}`);
      if (!img) return;
      
      // Add selection styling
      img.classList.add('selected-image');
      img.style.border = '2px solid #4285f4';
      img.style.boxShadow = '0 0 0 2px rgba(66, 133, 244, 0.25)';
      
      // Create floating toolbar
      const rect = img.getBoundingClientRect();
      const toolbar = document.createElement('div');
      toolbar.className = 'image-toolbar';
      toolbar.style.position = 'fixed';
      toolbar.style.top = (rect.top - 50) + 'px';
      toolbar.style.left = rect.left + 'px';
      toolbar.style.background = '#333';
      toolbar.style.padding = '8px';
      toolbar.style.borderRadius = '6px';
      toolbar.style.zIndex = '1000';
      toolbar.style.display = 'flex';
      toolbar.style.gap = '4px';
      
      toolbar.innerHTML = `
        <button onclick="window.resizeImageTo('${imageId}', 'small')" style="background: #555; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">Small</button>
        <button onclick="window.resizeImageTo('${imageId}', 'medium')" style="background: #555; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">Medium</button>
        <button onclick="window.resizeImageTo('${imageId}', 'large')" style="background: #555; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">Large</button>
        <button onclick="window.resizeImageTo('${imageId}', 'full')" style="background: #555; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">Full</button>
        <div style="width: 1px; background: #666; margin: 0 4px;"></div>
        <button onclick="window.positionImageTo('${imageId}', 'left')" style="background: #555; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">Left</button>
        <button onclick="window.positionImageTo('${imageId}', 'center')" style="background: #555; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">Center</button>
        <button onclick="window.positionImageTo('${imageId}', 'right')" style="background: #555; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">Right</button>
      `;
      
      document.body.appendChild(toolbar);
      
      // Add corner handles
      addCornerHandles(img, imageId);
    };

    const addCornerHandles = (img, imageId) => {
      const rect = img.getBoundingClientRect();
      const handles = ['nw', 'ne', 'sw', 'se'];
      
      handles.forEach(handle => {
        const handleEl = document.createElement('div');
        handleEl.className = `resize-handle resize-${handle}`;
        handleEl.style.position = 'fixed';
        handleEl.style.width = '12px';
        handleEl.style.height = '12px';
        handleEl.style.background = '#4285f4';
        handleEl.style.border = '2px solid white';
        handleEl.style.borderRadius = '50%';
        handleEl.style.cursor = `${handle}-resize`;
        handleEl.style.zIndex = '1001';
        
        // Position handles
        if (handle.includes('n')) handleEl.style.top = (rect.top - 6) + 'px';
        if (handle.includes('s')) handleEl.style.top = (rect.bottom - 6) + 'px';
        if (handle.includes('w')) handleEl.style.left = (rect.left - 6) + 'px';
        if (handle.includes('e')) handleEl.style.left = (rect.right - 6) + 'px';
        
        document.body.appendChild(handleEl);
      });
    };

    // Global functions for toolbar buttons
    useEffect(() => {
      window.resizeImageTo = (imageId, size) => {
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
        setContent(contentRef.current.innerHTML);
      };

      window.positionImageTo = (imageId, position) => {
        const img = document.getElementById(`img-${imageId}`);
        if (!img) return;
        
        // Reset positioning
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
        
        setContent(contentRef.current.innerHTML);
      };
    }, []);

    // Handle content changes with cursor position fix
    const handleContentChange = () => {
      if (contentRef.current) {
        // Save cursor position
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        
        setContent(contentRef.current.innerHTML);
        
        // Restore cursor position
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

    // Clean up image toolbar when clicking elsewhere
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (!event.target.closest('.selected-image') && !event.target.closest('.image-toolbar')) {
          // Remove all toolbars and handles
          document.querySelectorAll('.image-toolbar').forEach(el => el.remove());
          document.querySelectorAll('.resize-handle').forEach(el => el.remove());
          document.querySelectorAll('.selected-image').forEach(el => {
            el.classList.remove('selected-image');
            el.style.border = '2px solid transparent';
            el.style.boxShadow = 'none';
          });
          setSelectedImageId(null);
        }
      };

      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create Blog Post</h2>
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-4 py-2 border rounded hover:bg-gray-50">
              Cancel
            </button>
            <button 
              onClick={() => onSave({ title, content, isDraft: true })}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Save Draft
            </button>
            <button 
              onClick={() => onSave({ title, content, isDraft: false })}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
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

          {/* Links */}
          <div className="flex flex-wrap gap-2">
            <input 
              type="url" 
              placeholder="https://example.com"
              className="px-3 py-1 border rounded flex-1 min-w-48"
              id="linkUrl"
            />
            <button onClick={addLink} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
              Add Link
            </button>
            <button onClick={removeLink} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
              Remove Link
            </button>
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
            Upload an image, then click on it to resize and position it.
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
    );
  };

  // News Feed Component
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

  // Dashboard Component
  const Dashboard = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Social Engagement Hub</h2>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => { setContentType('post'); setIsCreating(true); }}
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
          <h3 className="text-sm font-medium text-gray-600">Total Comments</h3>
          <p className="text-2xl font-bold text-green-600">0</p>
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
            <p className="text-gray-700">{post.content}</p>
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
              <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
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

  // Content Editor Router
  const ContentEditor = () => {
    if (contentType === 'post') {
      return (
        <RichBlogEditor
          onSave={(postData) => {
            const newPost = {
              id: Date.now(),
              title: postData.title,
              content: postData.content,
              date: new Date().toLocaleDateString(),
              featured: false,
              published: !postData.isDraft
            };
            
            if (postData.isDraft) {
              setDrafts(prev => [...prev, newPost]);
              alert('Draft saved successfully! You can find it in the Drafts section.');
            } else {
              setPosts(prev => [...prev, newPost]);
              alert('Post published successfully!');
            }
            
            setIsCreating(false);
          }}
          onCancel={() => setIsCreating(false)}
        />
      );
    } else if (contentType === 'email') {
      return (
        <RichBlogEditor
          onSave={(postData) => {
            const newCampaign = {
              id: Date.now(),
              title: postData.title,
              content: postData.content,
              date: new Date().toLocaleDateString(),
              type: 'email'
            };
            
            setCampaigns(prev => [...prev, newCampaign]);
            alert('Email campaign created successfully!');
            setIsCreating(false);
          }}
          onCancel={() => setIsCreating(false)}
        />
      );
    } else if (contentType === 'schedule') {
      return (
        <RichBlogEditor
          onSave={(postData) => {
            const scheduledPost = {
              id: Date.now(),
              title: postData.title,
              content: postData.content,
              date: new Date().toLocaleDateString(),
              scheduled: true,
              published: false
            };
            
            setPosts(prev => [...prev, scheduledPost]);
            alert('Content scheduled successfully!');
            setIsCreating(false);
          }}
          onCancel={() => setIsCreating(false)}
        />
      );
    }
    
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Content Editor</h2>
        <p>Please select a content type to continue.</p>
        <button
          onClick={() => setIsCreating(false)}
          className="mt-4 px-4 py-2 border rounded hover:bg-gray-50"
        >
          Back to Dashboard
        </button>
      </div>
    );
  };

  // Post Component
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

  // Blog Widget Preview Component - ONLY BLOG POSTS
  const BlogWidgetPreview = ({ settings }) => {
    // Get only published blog posts
    const blogPosts = posts.filter(post => post.published === true);
    const displayPosts = blogPosts.slice(0, settings.maxPosts);
    
    return (
      <div style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '0',
        overflow: 'visible',
        width: '320px',
        height: '480px',
        boxShadow: 'none',
        position: 'relative'
      }}>
        {/* Widget Header */}
        <div style={{
          backgroundColor: settings.primaryColor,
          color: 'white',
          padding: '16px',
          fontWeight: '700',
          fontSize: '18px',
          textAlign: 'center',
          letterSpacing: '0.5px',
          borderRadius: '8px 8px 0 0'
        }}>
          📝 Latest Blog Posts
        </div>
        
        {/* Blog Posts Content */}
        <div style={{ 
          height: '416px', 
          overflowY: 'auto',
          backgroundColor: 'transparent',
          padding: '0'
        }}>
          {displayPosts.length > 0 ? displayPosts.map((post, index) => (
            <article key={post.id} style={{
              padding: '20px',
              borderBottom: index < displayPosts.length - 1 ? `2px solid ${settings.primaryColor}20` : 'none',
              backgroundColor: 'transparent'
            }}>
              {/* Post Title */}
              <h3 style={{
                margin: '0 0 10px 0',
                fontSize: '18px',
                fontWeight: '700',
                color: '#1a1a1a',
                lineHeight: '1.3',
                cursor: 'pointer'
              }}>
                {post.title}
              </h3>
              
              {/* Post Date */}
              <div style={{
                color: '#666',
                fontSize: '13px',
                marginBottom: '12px',
                fontWeight: '500'
              }}>
                📅 {post.date}
              </div>
              
              {/* Post Content */}
              <div style={{
                color: '#333',
                fontSize: '15px',
                lineHeight: '1.6',
                marginBottom: '12px'
              }}>
                {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
              </div>
              
              {/* Featured Badge */}
              {post.featured && (
                <div style={{
                  display: 'inline-block',
                  backgroundColor: '#ff6b35',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  ⭐ Featured
                </div>
              )}
              
              {/* Read More Link */}
              <div style={{
                marginTop: '12px'
              }}>
                <a href="#" style={{
                  color: settings.primaryColor,
                  fontSize: '14px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  borderBottom: `2px solid ${settings.primaryColor}40`
                }}>
                  Read More →
                </a>
              </div>
            </article>
          )) : (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: '#999',
              fontSize: '16px',
              backgroundColor: 'transparent'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <div>No blog posts yet</div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>Check back soon for updates!</div>
            </div>
          )}
        </div>
        
        {/* Widget Footer */}
        <div style={{
          backgroundColor: settings.primaryColor,
          color: 'white',
          padding: '8px',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: '600',
          borderRadius: '0 0 8px 8px'
        }}>
          Powered by Social Hub
        </div>
      </div>
    );
  };

  // Settings Component - CLEAN WHITE BACKGROUNDS
  const Settings = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your widgets and platform settings</p>
      </div>

      {/* Widget Gallery Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Widget Gallery</h2>
        <p className="text-gray-600 mb-6">Embed these widgets on your website to extend your community reach</p>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex gap-3 flex-wrap">
            {widgetCategories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Widget Grid */}
        <div className="space-y-6">
          {filteredWidgets.map(widget => (
            <div key={widget.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Widget Header */}
              <div className="bg-gray-50 p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded">
                    <widget.icon size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{widget.name}</h3>
                    <p className="text-sm text-gray-600">{widget.description}</p>
                  </div>
                  <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                    {widget.category}
                  </span>
                </div>
              </div>

              {/* Widget Content */}
              <div className="p-6 bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Live Preview */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Live Preview</h4>
                    <div className="flex justify-center p-4 bg-gray-50 rounded">
                      {widget.id === 'blog' && <BlogWidgetPreview settings={widgetSettings[widget.id]} />}
                      {widget.id !== 'blog' && (
                        <div className="w-80 h-96 bg-white border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <widget.icon size={32} className="mx-auto mb-2 text-gray-400" />
                            <p className="text-sm">Preview for {widget.name}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Settings & Embed */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Customize & Embed</h4>
                    
                    {/* Settings */}
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={widgetSettings[widget.id].primaryColor}
                            onChange={(e) => setWidgetSettings(prev => ({
                              ...prev,
                              [widget.id]: { ...prev[widget.id], primaryColor: e.target.value }
                            }))}
                            className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <span className="text-sm text-gray-600">{widgetSettings[widget.id].primaryColor}</span>
                        </div>
                      </div>

                      {/* Widget-specific settings */}
                      {widget.id === 'blog' && (
                        <>
                          <div>
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={widgetSettings[widget.id].showImages}
                                onChange={(e) => setWidgetSettings(prev => ({
                                  ...prev,
                                  [widget.id]: { ...prev[widget.id], showImages: e.target.checked }
                                }))}
                                className="rounded"
                              />
                              Show Images
                            </label>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Max Posts to Display
                            </label>
                            <select
                              value={widgetSettings[widget.id].maxPosts}
                              onChange={(e) => setWidgetSettings(prev => ({
                                ...prev,
                                [widget.id]: { ...prev[widget.id], maxPosts: parseInt(e.target.value) }
                              }))}
                              className="w-full p-2 border border-gray-300 rounded"
                            >
                              <option value={1}>1 Post</option>
                              <option value={2}>2 Posts</option>
                              <option value={3}>3 Posts</option>
                              <option value={5}>5 Posts</option>
                            </select>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Embed Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Embed Code
                      </label>
                      <div className="relative">
                        <textarea
                          readOnly
                          value={generateEmbedCode(widget.id, widgetSettings[widget.id])}
                          className="w-full h-20 p-3 border border-gray-300 rounded bg-gray-50 text-xs font-mono resize-none"
                          onClick={(e) => e.target.select()}
                        />
                        <button
                          onClick={() => copyEmbedCode(widget.id)}
                          className={`absolute top-2 right-2 px-3 py-1 text-xs font-medium rounded transition ${
                            copiedWidget === widget.id
                              ? 'bg-green-600 text-white'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {copiedWidget === widget.id ? (
                            <>
                              <Check size={12} className="inline mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={12} className="inline mr-1" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Paste this code into your website's HTML where you want the widget to appear.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Other Settings */}
      <div className="border-t pt-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">General Settings</h2>
        <p className="text-gray-600">Account preferences and platform settings coming soon...</p>
      </div>
    </div>
  );

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
              <div className="space-y-6">
                {/* Drafts Section */}
                {drafts.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold mb-4 text-yellow-600">📝 Drafts ({drafts.length})</h3>
                    <div className="space-y-3">
                      {drafts.map(draft => (
                        <div key={draft.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full font-medium">
                                  DRAFT
                                </span>
                              </div>
                              <h4 className="font-semibold text-lg">{draft.title}</h4>
                              <p className="text-sm text-gray-500 mb-2">{draft.date}</p>
                              <p className="text-gray-700">{draft.content.length > 100 ? `${draft.content.substring(0, 100)}...` : draft.content}</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => {
                                  // Publish draft
                                  const publishedPost = { ...draft, published: true };
                                  setPosts(prev => [...prev, publishedPost]);
                                  setDrafts(prev => prev.filter(d => d.id !== draft.id));
                                  alert('Draft published successfully!');
                                }}
                                className="p-2 text-green-600 hover:bg-green-50 rounded"
                                title="Publish Draft"
                              >
                                <Eye size={16} />
                              </button>
                              <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Published Posts Section */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Published Posts ({posts.filter(p => p.published).length})</h2>
                    <button
                      onClick={() => { setContentType('post'); setIsCreating(true); }}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus size={20} /> New Post
                    </button>
                  </div>
                  <div className="space-y-3">
                    {posts.filter(post => post.published).map(post => <PostCard key={post.id} post={post} />)}
                  </div>
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
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">📅 Calendar</h2>
                  <button
                    onClick={() => { setContentType('scheduled'); setIsCreating(true); }}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Clock size={20} /> Schedule Content
                  </button>
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-3 text-center font-semibold text-gray-600 bg-gray-50 rounded">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 35 }, (_, i) => {
                    const date = i - 6; // Start from previous month
                    const isCurrentMonth = date > 0 && date <= 30;
                    const isToday = date === 23; // Today is 23rd
                    return (
                      <div
                        key={i}
                        className={`p-3 text-center border rounded cursor-pointer hover:bg-blue-50 ${
                          isCurrentMonth ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-400'
                        } ${isToday ? 'bg-blue-600 text-white font-bold' : ''}`}
                      >
                        {date > 0 ? date : date + 31}
                      </div>
                    );
                  })}
                </div>
                
                {/* Upcoming Events */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">📋 Upcoming Scheduled Content</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div>
                        <div className="font-medium">Weekly Newsletter</div>
                        <div className="text-sm text-gray-600">📧 Email Campaign • Tomorrow at 9:00 AM</div>
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
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <div className="font-medium">Product Update Post</div>
                        <div className="text-sm text-gray-600">📝 Blog Post • Friday at 2:00 PM</div>
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
                  </div>
                </div>
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
    </div>
  );



  // Store the main app JSX
  const mainApp = (
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
              onClick={() => {
                setActiveSection(item.id);
                setIsCreating(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg mb-2 transition ${
                activeSection === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon size={20} />
              {item.label}
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
              <div className="space-y-6">
                {/* Drafts Section */}
                {drafts.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold mb-4 text-yellow-600">📝 Drafts ({drafts.length})</h3>
                    <div className="space-y-3">
                      {drafts.map(draft => (
                        <div key={draft.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full font-medium">
                                  DRAFT
                                </span>
                              </div>
                              <h4 className="font-semibold text-lg">{draft.title}</h4>
                              <p className="text-sm text-gray-500 mb-2">{draft.date}</p>
                              <p className="text-gray-700">{draft.content.length > 100 ? `${draft.content.substring(0, 100)}...` : draft.content}</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => {
                                  // Publish draft
                                  const publishedPost = { ...draft, published: true };
                                  setPosts(prev => [...prev, publishedPost]);
                                  setDrafts(prev => prev.filter(d => d.id !== draft.id));
                                  alert('Draft published successfully!');
                                }}
                                className="p-2 text-green-600 hover:bg-green-50 rounded"
                                title="Publish Draft"
                              >
                                <Eye size={16} />
                              </button>
                              <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Published Posts Section */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Published Posts ({posts.filter(p => p.published).length})</h2>
                    <button
                      onClick={() => { setContentType('post'); setIsCreating(true); }}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus size={20} /> New Post
                    </button>
                  </div>
                  <div className="space-y-3">
                    {posts.filter(post => post.published).map(post => <PostCard key={post.id} post={post} />)}
                  </div>
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
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">📅 Calendar</h2>
                  <button
                    onClick={() => { setContentType('scheduled'); setIsCreating(true); }}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Clock size={20} /> Schedule Content
                  </button>
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-3 text-center font-semibold text-gray-600 bg-gray-50 rounded">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 35 }, (_, i) => {
                    const date = i - 6; // Start from previous month
                    const isCurrentMonth = date > 0 && date <= 30;
                    const isToday = date === 23; // Today is 23rd
                    return (
                      <div
                        key={i}
                        className={`p-3 text-center border rounded cursor-pointer hover:bg-blue-50 ${
                          isCurrentMonth ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-400'
                        } ${isToday ? 'bg-blue-600 text-white font-bold' : ''}`}
                      >
                        {date > 0 ? date : date + 31}
                      </div>
                    );
                  })}
                </div>
                
                {/* Upcoming Events */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">📋 Upcoming Scheduled Content</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div>
                        <div className="font-medium">Weekly Newsletter</div>
                        <div className="text-sm text-gray-600">📧 Email Campaign • Tomorrow at 9:00 AM</div>
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
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <div className="font-medium">Product Update Post</div>
                        <div className="text-sm text-gray-600">📝 Blog Post • Friday at 2:00 PM</div>
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
                  </div>
                </div>
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
    </div>
  );

  // Return main app
  return mainApp;
};

// App with Router
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/widget/blog" element={<StandaloneBlogWidget />} />
        <Route path="/widget/newsfeed" element={<StandaloneNewsFeedWidget />} />
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </Router>
  );
};

export default App;
