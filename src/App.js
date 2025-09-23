import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, MessageSquare, FileText, Mail, Users, Calendar, BarChart3, Settings,
  Plus, Send, Clock, Edit, Trash2, Heart, MessageCircle, Bookmark,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Upload,
  Eye, Copy, Check, Star, TrendingUp, Activity, Vote
} from 'lucide-react';

const App = () => {
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

  // Blog Widget Preview Component
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

  // Settings Component with Widget Gallery
  const Settings = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Settings & Widgets</h2>
        
        {/* Widget Gallery Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Widget Gallery</h3>
          <p className="text-gray-600 mb-6">Embed these widgets on your website to extend your community reach</p>

          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex gap-2 flex-wrap">
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
          <div className="grid gap-8">
            {filteredWidgets.map(widget => (
              <div key={widget.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                {/* Widget Header */}
                <div className="p-6 border-b bg-gray-50">
                  <div className="flex items-center gap-3 mb-2">
                    <widget.icon size={24} className="text-blue-600" />
                    <h4 className="text-lg font-semibold">{widget.name}</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      {widget.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{widget.description}</p>
                </div>

                {/* Widget Content */}
                <div className="p-6 flex gap-8">
                  {/* Preview */}
                  <div className="flex-1">
                    <h5 className="font-medium mb-4 text-gray-700">Live Preview</h5>
                    <div className="flex justify-center">
                      {widget.id === 'blog' && <BlogWidgetPreview settings={widgetSettings[widget.id]} />}
                      {widget.id !== 'blog' && (
                        <div className="w-80 h-96 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                          Preview for {widget.name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customization */}
                  <div className="flex-1">
                    <h5 className="font-medium mb-4 text-gray-700">Customization</h5>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Color
                        </label>
                        <input
                          type="color"
                          value={widgetSettings[widget.id].primaryColor}
                          onChange={(e) => setWidgetSettings(prev => ({
                            ...prev,
                            [widget.id]: { ...prev[widget.id], primaryColor: e.target.value }
                          }))}
                          className="w-full h-10 border rounded cursor-pointer"
                        />
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
                              />
                              Show Images
                            </label>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Max Posts
                            </label>
                            <select
                              value={widgetSettings[widget.id].maxPosts}
                              onChange={(e) => setWidgetSettings(prev => ({
                                ...prev,
                                [widget.id]: { ...prev[widget.id], maxPosts: parseInt(e.target.value) }
                              }))}
                              className="w-full p-2 border rounded"
                            >
                              <option value={1}>1</option>
                              <option value={2}>2</option>
                              <option value={3}>3</option>
                              <option value={5}>5</option>
                            </select>
                          </div>
                        </>
                      )}

                      {/* Embed Code */}
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Embed Code
                        </label>
                        <div className="relative">
                          <textarea
                            readOnly
                            value={generateEmbedCode(widget.id, widgetSettings[widget.id])}
                            className="w-full h-20 p-3 border rounded bg-gray-50 text-xs font-mono resize-none"
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Other Settings */}
        <div className="border-t pt-8">
          <h3 className="text-xl font-semibold mb-4">General Settings</h3>
          <p className="text-gray-600">Account preferences and platform settings coming soon...</p>
        </div>
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
