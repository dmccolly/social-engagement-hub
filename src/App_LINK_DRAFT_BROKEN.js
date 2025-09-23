import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, MessageSquare, FileText, Mail, Users, Calendar, BarChart3, Settings,
  Plus, Send, Clock, Edit, Trash2, Heart, MessageCircle, Bookmark,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Upload, Save, Eye
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
      content: 'This is a featured post!', 
      htmlContent: 'This is a featured post!',
      date: '9/23/2025', 
      featured: true,
      status: 'published'
    },
    { 
      id: 2, 
      title: 'Latest Updates', 
      content: 'Check out our new features', 
      htmlContent: 'Check out our new features',
      date: '9/23/2025', 
      featured: false,
      status: 'published'
    }
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

  // Rich Blog Editor Component with FIXED multi-image handling
  const RichBlogEditor = ({ onSave, onCancel, initialPost = null }) => {
    const [title, setTitle] = useState(initialPost?.title || '');
    const [content, setContent] = useState(initialPost?.htmlContent || '');
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [imageCounter, setImageCounter] = useState(0);
    const contentRef = useRef(null);
    const fileInputRef = useRef(null);

    // Initialize content if editing
    useEffect(() => {
      if (initialPost && contentRef.current) {
        contentRef.current.innerHTML = initialPost.htmlContent || '';
        setContent(initialPost.htmlContent || '');
      }
    }, [initialPost]);

    // IMPROVED cleanup function for multiple images
    const cleanupImageSelection = () => {
      console.log('Cleaning up image selection...');
      
      // Remove ALL floating toolbars
      const toolbars = document.querySelectorAll('.image-toolbar');
      toolbars.forEach(toolbar => {
        console.log('Removing toolbar:', toolbar);
        toolbar.remove();
      });
      
      // Remove ALL resize handles
      const handles = document.querySelectorAll('.resize-handle');
      handles.forEach(handle => {
        console.log('Removing handle:', handle);
        handle.remove();
      });
      
      // Remove selection styling from ALL images
      const selectedImages = document.querySelectorAll('.selected-image');
      selectedImages.forEach(img => {
        console.log('Deselecting image:', img.id);
        img.classList.remove('selected-image');
        img.style.border = '2px solid transparent';
        img.style.boxShadow = 'none';
      });
      
      // Clear selected image state
      setSelectedImageId(null);
      console.log('Cleanup complete');
    };

    // Clean up when component unmounts or section changes
    useEffect(() => {
      return () => {
        console.log('Component unmounting, cleaning up...');
        cleanupImageSelection();
      };
    }, []);

    // Clean up when switching sections
    useEffect(() => {
      if (!isCreating) {
        console.log('Not creating, cleaning up...');
        cleanupImageSelection();
      }
    }, [isCreating, activeSection]);

    // Text formatting functions (unchanged)
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
      const selection = window.getSelection();
      if (selection.rangeCount === 0) {
        alert('Please select some text first, then add a link.');
        return;
      }
      
      const url = prompt('Enter the URL:');
      if (url) {
        document.execCommand('createLink', false, url);
        if (contentRef.current) {
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

    // IMPROVED image handling for multiple images
    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      setIsUploading(true);
      
      try {
        // Create unique image ID using counter
        const imageId = `${Date.now()}_${imageCounter}`;
        setImageCounter(prev => prev + 1);
        
        // Create local URL for immediate display
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
        
        // IMPROVED click handler with better event handling
        img.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Image clicked:', imageId);
          selectImage(imageId);
        });
        
        // Insert into editor
        const editor = contentRef.current;
        if (editor) {
          editor.appendChild(img);
          setContent(editor.innerHTML);
        }
        
        console.log('Image inserted successfully with ID:', imageId);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setIsUploading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    // IMPROVED image selection with better multi-image support
    const selectImage = (imageId) => {
      console.log('Selecting image:', imageId);
      
      // Clean up any existing selections first
      cleanupImageSelection();
      
      setSelectedImageId(imageId);
      
      // Find and select the image
      const img = document.getElementById(`img-${imageId}`);
      if (!img) {
        console.error('Image not found:', `img-${imageId}`);
        return;
      }
      
      console.log('Found image:', img);
      
      // Add selection styling
      img.classList.add('selected-image');
      img.style.border = '2px solid #4285f4';
      img.style.boxShadow = '0 0 0 2px rgba(66, 133, 244, 0.25)';
      
      // Create floating toolbar with unique class
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
      
      // Create buttons with direct event listeners instead of onclick
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
      
      // Add resize buttons
      toolbar.appendChild(createButton('Small', () => resizeImageTo(imageId, 'small')));
      toolbar.appendChild(createButton('Medium', () => resizeImageTo(imageId, 'medium')));
      toolbar.appendChild(createButton('Large', () => resizeImageTo(imageId, 'large')));
      toolbar.appendChild(createButton('Full', () => resizeImageTo(imageId, 'full')));
      
      // Add separator
      const separator = document.createElement('div');
      separator.style.cssText = 'width: 1px; background: #666; margin: 0 4px;';
      toolbar.appendChild(separator);
      
      // Add position buttons
      toolbar.appendChild(createButton('Left', () => positionImageTo(imageId, 'left')));
      toolbar.appendChild(createButton('Center', () => positionImageTo(imageId, 'center')));
      toolbar.appendChild(createButton('Right', () => positionImageTo(imageId, 'right')));
      
      // Add close button
      toolbar.appendChild(createButton('✕', () => cleanupImageSelection(), '#d32f2f'));
      
      document.body.appendChild(toolbar);
      console.log('Toolbar created and added');
      
      // Add corner handles
      addCornerHandles(img, imageId);
    };

    // IMPROVED corner handles with unique classes
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
        
        // Position handles
        if (handle.includes('n')) handleEl.style.top = (rect.top - 6) + 'px';
        if (handle.includes('s')) handleEl.style.top = (rect.bottom - 6) + 'px';
        if (handle.includes('w')) handleEl.style.left = (rect.left - 6) + 'px';
        if (handle.includes('e')) handleEl.style.left = (rect.right - 6) + 'px';
        
        document.body.appendChild(handleEl);
        console.log('Handle added:', handle);
      });
    };

    // Image manipulation functions
    const resizeImageTo = (imageId, size) => {
      console.log('Resizing image:', imageId, 'to', size);
      const img = document.getElementById(`img-${imageId}`);
      if (!img) {
        console.error('Image not found for resize:', imageId);
        return;
      }
      
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
      
      // Update handles position after resize
      setTimeout(() => {
        if (selectedImageId === imageId) {
          cleanupImageSelection();
          selectImage(imageId);
        }
      }, 100);
    };

    const positionImageTo = (imageId, position) => {
      console.log('Positioning image:', imageId, 'to', position);
      const img = document.getElementById(`img-${imageId}`);
      if (!img) {
        console.error('Image not found for position:', imageId);
        return;
      }
      
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
      
      if (contentRef.current) {
        setContent(contentRef.current.innerHTML);
      }
      
      // Update handles position after positioning
      setTimeout(() => {
        if (selectedImageId === imageId) {
          cleanupImageSelection();
          selectImage(imageId);
        }
      }, 100);
    };

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

    // IMPROVED click outside handler
    useEffect(() => {
      const handleClickOutside = (event) => {
        // Don't deselect if clicking on toolbar or handles
        if (event.target.closest('.image-toolbar') || 
            event.target.closest('.resize-handle') ||
            event.target.classList.contains('editor-image')) {
          return;
        }
        
        // Only deselect if clicking outside the editor area
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

    // Convert HTML content to plain text for display
    const getPlainTextContent = (htmlContent) => {
      const div = document.createElement('div');
      div.innerHTML = htmlContent;
      return div.textContent || div.innerText || '';
    };

    const handleSaveDraft = () => {
      cleanupImageSelection(); // Clean up before saving
      const post = {
        id: initialPost?.id || Date.now(),
        title,
        content: getPlainTextContent(content),
        htmlContent: content,
        date: new Date().toLocaleDateString(),
        status: 'draft'
      };
      onSave(post, 'draft');
    };

    const handlePublishPost = () => {
      cleanupImageSelection(); // Clean up before saving
      const post = {
        id: initialPost?.id || Date.now(),
        title,
        content: getPlainTextContent(content),
        htmlContent: content,
        date: new Date().toLocaleDateString(),
        status: 'published'
      };
      onSave(post, 'published');
    };

    const handleCancel = () => {
      cleanupImageSelection(); // Clean up before canceling
      onCancel();
    };

    return (
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

          {/* Links */}
          <div className="flex flex-wrap gap-2">
            <button onClick={addLink} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
              Add Link
            </button>
            <button onClick={removeLink} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
              Remove Link
            </button>
            <span className="text-sm text-gray-600 px-2 py-1">Select text first, then click Add Link</span>
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
            <strong>Multiple Images Supported:</strong> Upload images one at a time. Click any image to resize and position it. Each image can be controlled independently.
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

  // Content Editor Router
  const ContentEditor = () => {
    if (contentType === 'post') {
      return (
        <RichBlogEditor
          initialPost={editingPost}
          onSave={(post, status) => {
            if (status === 'draft') {
              if (editingPost) {
                setDrafts(prev => prev.map(d => d.id === post.id ? post : d));
              } else {
                setDrafts(prev => [post, ...prev]);
              }
            } else {
              if (editingPost) {
                setPosts(prev => prev.map(p => p.id === post.id ? post : p));
                setDrafts(prev => prev.filter(d => d.id !== post.id));
              } else {
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

  // Settings Component
  const Settings = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <p className="text-gray-600">Settings panel coming soon...</p>
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
    </div>
  );
};

export default App;
