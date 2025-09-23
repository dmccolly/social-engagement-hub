import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, FileText, Mail, Users, Settings, Calendar, BarChart3, 
  Plus, Edit, Trash2, Search, Bell, Upload, Send, Clock, 
  CheckCircle, X, ChevronDown, MessageSquare, Heart, BookmarkPlus,
  Image, Film, Music, Link, Bold, Italic, Underline, Type,
  Palette, AlignLeft, AlignCenter, AlignRight, List, Eye,
  Star, Sparkles, Crown
} from 'lucide-react';

const App = () => {
  // State Management
  const [activeSection, setActiveSection] = useState('dashboard');
  const [posts, setPosts] = useState([
    {
      title: 'Welcome to Our Platform',
      content: 'This is a featured post!',
      date: '9/23/2025',
      isFeatured: true
    },
    {
      title: 'Latest Updates',
      content: 'Check out our new features',
      date: '9/23/2025',
      isFeatured: false
    }
  ]);
  const [campaigns, setCampaigns] = useState([]);
  const [members, setMembers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [contentType, setContentType] = useState('post');
  const [currentUser] = useState({ name: 'Admin User', email: 'admin@example.com' });

  // News Feed Component - User Engagement Feed
  const NewsFeed = () => {
    const [newPost, setNewPost] = useState('');
    const [newsFeedPosts, setNewsFeedPosts] = useState([
      {
        id: 1,
        author: 'Admin',
        content: 'Welcome to our community news feed! Share updates, ask questions, and engage with other members.',
        timestamp: new Date().toISOString(),
        likes: 5,
        comments: []
      },
      {
        id: 2,
        author: 'Community Manager',
        content: 'Don\'t forget to check out our latest blog posts and upcoming events. What topics would you like to see covered?',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        likes: 3,
        comments: [
          { author: 'User1', content: 'Great question! I\'d love to see more tech tutorials.', timestamp: new Date().toISOString() }
        ]
      }
    ]);

    const handlePostSubmit = () => {
      if (!newPost.trim()) return;
      
      const post = {
        id: Date.now(),
        author: currentUser?.name || 'Anonymous',
        content: newPost,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: []
      };
      
      setNewsFeedPosts(prev => [post, ...prev]);
      setNewPost('');
    };

    const handleLike = (postId) => {
      setNewsFeedPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      ));
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <MessageSquare className="text-blue-600" />
            Community News Feed
          </h1>
          
          {/* Post Creation */}
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-3">Share an update</h3>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind? Share news, ask questions, or start a discussion..."
              className="w-full p-3 border rounded-lg resize-none"
              rows="3"
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-gray-500">
                {currentUser ? `Posting as ${currentUser.name}` : 'Sign up to post'}
              </span>
              <button
                onClick={handlePostSubmit}
                disabled={!newPost.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Post Update
              </button>
            </div>
          </div>

          {/* News Feed Posts */}
          <div className="space-y-4">
            {newsFeedPosts.map((post) => (
              <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-blue-600">
                        {post.author.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{post.author}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(post.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="mb-3 leading-relaxed">{post.content}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition"
                  >
                    <Heart size={16} />
                    <span>{post.likes} likes</span>
                  </button>
                  
                  <button className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition">
                    <MessageSquare size={16} />
                    <span>{post.comments.length} comments</span>
                  </button>
                  
                  <button className="flex items-center gap-1 text-gray-600 hover:text-green-500 transition">
                    <BookmarkPlus size={16} />
                    <span>Save</span>
                  </button>
                </div>
                
                {/* Comments */}
                {post.comments.length > 0 && (
                  <div className="mt-4 pl-4 border-l-2 border-gray-200">
                    {post.comments.map((comment, index) => (
                      <div key={index} className="mb-2 last:mb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.author}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Rich Blog Editor Component
  const RichBlogEditor = ({ onSave, onCancel }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const contentRef = useRef(null);

    // Handle content change - FIXED for backwards typing
    const handleContentChange = (e) => {
      const selection = window.getSelection();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      const startOffset = range ? range.startOffset : 0;
      const endOffset = range ? range.endOffset : 0;
      const startContainer = range ? range.startContainer : null;
      
      setContent(e.target.innerHTML);
      
      setTimeout(() => {
        if (startContainer && contentRef.current && contentRef.current.contains(startContainer)) {
          try {
            const newRange = document.createRange();
            newRange.setStart(startContainer, Math.min(startOffset, startContainer.textContent?.length || 0));
            newRange.setEnd(startContainer, Math.min(endOffset, startContainer.textContent?.length || 0));
            selection.removeAllRanges();
            selection.addRange(newRange);
          } catch (e) {
            console.log('Cursor restore fallback');
          }
        }
      }, 0);
    };

    // Handle file upload
    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      console.log('Starting file upload:', file.name);
      setIsUploading(true);
      
      try {
        // For demo purposes, create a local URL
        const imageUrl = URL.createObjectURL(file);
        
        const newImage = {
          id: Date.now(),
          src: imageUrl,
          alt: file.name,
          size: 'medium',
          position: 'center'
        };
        
        console.log('Created image object:', newImage);
        insertImageIntoContent(newImage);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed. Please try again.');
      } finally {
        setIsUploading(false);
      }
    };

    // Insert image into content
    const insertImageIntoContent = (image) => {
      console.log('Inserting image into content:', image.id);
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
        
        // Create image element
        const img = document.createElement('img');
        img.id = `img-${image.id}`;
        img.src = image.src;
        img.alt = image.alt;
        img.className = `editor-image size-${image.size} position-${image.position}`;
        img.setAttribute('data-size', image.size);
        img.setAttribute('data-position', image.position);
        img.style.cssText = `
          cursor: pointer; 
          border-radius: 8px; 
          max-width: 100%; 
          height: auto;
          border: 2px solid transparent;
          transition: all 0.2s ease;
          width: 400px;
        `;
        
        // Add click handler for selection
        img.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('Image clicked! ID:', image.id);
          selectImage(image.id);
          return false;
        };
        
        // Insert image
        range.deleteContents();
        range.insertNode(img);
        
        // Add space after image
        const textNode = document.createTextNode(' ');
        range.setStartAfter(img);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        
        setContent(editor.innerHTML);
        console.log('Image inserted successfully');
      }
    };

    // Select image - WORKING VERSION
    const selectImage = (imageId) => {
      console.log('=== SELECT IMAGE CALLED ===');
      console.log('Image ID:', imageId);
      
      setSelectedImageId(imageId);
      
      // Clean up previous selections
      document.querySelectorAll('.selected-image').forEach(el => {
        el.classList.remove('selected-image');
        el.style.border = '2px solid transparent';
        el.style.boxShadow = 'none';
      });
      
      document.querySelectorAll('.image-toolbar').forEach(el => el.remove());
      document.querySelectorAll('.image-handle').forEach(el => el.remove());
      
      // Find the image
      const img = document.getElementById(`img-${imageId}`);
      console.log('Found image element:', img);
      
      if (!img) {
        console.error('Image not found!');
        return;
      }
      
      // Add selection styling
      img.classList.add('selected-image');
      img.style.border = '2px solid #4285f4';
      img.style.boxShadow = '0 0 0 2px rgba(66, 133, 244, 0.25)';
      console.log('Added selection styling');
      
      // Get image position
      const rect = img.getBoundingClientRect();
      console.log('Image rect:', rect);
      
      // Create toolbar
      const toolbar = document.createElement('div');
      toolbar.className = 'image-toolbar';
      toolbar.innerHTML = `
        <button onclick="window.resizeImageTo('${imageId}', 'small')" style="background: #333; color: white; border: none; padding: 4px 8px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">Small</button>
        <button onclick="window.resizeImageTo('${imageId}', 'medium')" style="background: #333; color: white; border: none; padding: 4px 8px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">Medium</button>
        <button onclick="window.resizeImageTo('${imageId}', 'large')" style="background: #333; color: white; border: none; padding: 4px 8px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">Large</button>
        <button onclick="window.resizeImageTo('${imageId}', 'full')" style="background: #333; color: white; border: none; padding: 4px 8px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">Full</button>
        <span style="color: #666; margin: 0 8px;">|</span>
        <button onclick="window.positionImageTo('${imageId}', 'left')" style="background: #333; color: white; border: none; padding: 4px 8px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">← Left</button>
        <button onclick="window.positionImageTo('${imageId}', 'center')" style="background: #333; color: white; border: none; padding: 4px 8px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">Center</button>
        <button onclick="window.positionImageTo('${imageId}', 'right')" style="background: #333; color: white; border: none; padding: 4px 8px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">Right →</button>
        <button onclick="window.deselectImage()" style="background: #d32f2f; color: white; border: none; padding: 4px 8px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">×</button>
      `;
      
      toolbar.style.cssText = `
        position: fixed;
        top: ${rect.top - 50}px;
        left: ${rect.left}px;
        background: rgba(0,0,0,0.9);
        padding: 8px;
        border-radius: 6px;
        z-index: 10000;
        display: flex;
        align-items: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      
      document.body.appendChild(toolbar);
      console.log('Toolbar created and added to body');
      
      // Create handles
      const handlePositions = [
        { class: 'nw', top: rect.top - 6, left: rect.left - 6 },
        { class: 'ne', top: rect.top - 6, left: rect.right - 6 },
        { class: 'sw', top: rect.bottom - 6, left: rect.left - 6 },
        { class: 'se', top: rect.bottom - 6, left: rect.right - 6 }
      ];
      
      handlePositions.forEach(pos => {
        const handle = document.createElement('div');
        handle.className = `image-handle handle-${pos.class}`;
        handle.style.cssText = `
          position: fixed;
          top: ${pos.top}px;
          left: ${pos.left}px;
          width: 12px;
          height: 12px;
          background: #4285f4;
          border: 2px solid white;
          border-radius: 50%;
          cursor: ${pos.class}-resize;
          z-index: 10001;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(handle);
        console.log(`Created ${pos.class} handle at`, pos.top, pos.left);
      });
      
      console.log('=== SELECT IMAGE COMPLETE ===');
    };

    // Make functions globally available
    useEffect(() => {
      window.resizeImageTo = (imageId, size) => {
        console.log('Resizing image', imageId, 'to', size);
        const img = document.getElementById(`img-${imageId}`);
        if (img) {
          const sizeMap = {
            small: '200px',
            medium: '400px', 
            large: '600px',
            full: '100%'
          };
          img.style.width = sizeMap[size];
          
          if (contentRef.current) {
            setContent(contentRef.current.innerHTML);
          }
          
          // Refresh selection
          setTimeout(() => selectImage(imageId), 10);
        }
      };
      
      window.positionImageTo = (imageId, position) => {
        console.log('Positioning image', imageId, 'to', position);
        const img = document.getElementById(`img-${imageId}`);
        if (img) {
          if (position === 'left') {
            img.style.float = 'left';
            img.style.margin = '0 15px 15px 0';
            img.style.display = 'block';
          } else if (position === 'right') {
            img.style.float = 'right';
            img.style.margin = '0 0 15px 15px';
            img.style.display = 'block';
          } else {
            img.style.float = 'none';
            img.style.margin = '15px auto';
            img.style.display = 'block';
          }
          
          if (contentRef.current) {
            setContent(contentRef.current.innerHTML);
          }
          
          // Refresh selection
          setTimeout(() => selectImage(imageId), 10);
        }
      };
      
      window.deselectImage = () => {
        console.log('Deselecting image');
        setSelectedImageId(null);
        document.querySelectorAll('.selected-image').forEach(el => {
          el.classList.remove('selected-image');
          el.style.border = '2px solid transparent';
          el.style.boxShadow = 'none';
        });
        document.querySelectorAll('.image-toolbar').forEach(el => el.remove());
        document.querySelectorAll('.image-handle').forEach(el => el.remove());
      };
      
      // Cleanup
      return () => {
        delete window.resizeImageTo;
        delete window.positionImageTo;
        delete window.deselectImage;
        document.querySelectorAll('.image-toolbar').forEach(el => el.remove());
        document.querySelectorAll('.image-handle').forEach(el => el.remove());
      };
    }, []);

    // Text formatting functions
    const applyFormat = (command) => {
      document.execCommand(command, false, null);
      if (contentRef.current) {
        setContent(contentRef.current.innerHTML);
      }
    };

    const handleSave = () => {
      console.log('Saving post...');
      onSave?.({
        title,
        content: contentRef.current?.innerHTML || content,
        isFeatured: false
      });
    };

    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Create Blog Post</h2>
          
          <input
            type="text"
            className="w-full p-3 border rounded-lg mb-4"
            placeholder="Enter post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Text Formatting Toolbar */}
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
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
            <button onClick={() => applyFormat('justifyLeft')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100">
              <AlignLeft size={16} />
            </button>
            <button onClick={() => applyFormat('justifyCenter')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100">
              <AlignCenter size={16} />
            </button>
            <button onClick={() => applyFormat('justifyRight')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100">
              <AlignRight size={16} />
            </button>
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
            className="w-full min-h-96 p-4 border rounded-lg bg-white"
            contentEditable
            suppressContentEditableWarning={true}
            onInput={handleContentChange}
            dangerouslySetInnerHTML={{ __html: content || '<p>Start writing your blog post here...</p>' }}
            style={{
              direction: 'ltr',
              textAlign: 'left',
              unicodeBidi: 'normal',
              writingMode: 'horizontal-tb'
            }}
          />

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button 
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Post
            </button>
            <button 
              onClick={onCancel}
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Dashboard Component
  const Dashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-6">Social Engagement Hub</h1>
        
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button 
            onClick={() => { setContentType('post'); setIsCreating(true); }}
            className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center gap-3"
          >
            <Plus size={24} />
            <span className="font-semibold">Create Post</span>
          </button>
          
          <button 
            onClick={() => { setContentType('email'); setIsCreating(true); }}
            className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center gap-3"
          >
            <Send size={24} />
            <span className="font-semibold">Send Campaign</span>
          </button>
          
          <button 
            onClick={() => { setContentType('scheduled'); setIsCreating(true); }}
            className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center gap-3"
          >
            <Clock size={24} />
            <span className="font-semibold">Schedule Content</span>
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Posts</h3>
            <p className="text-2xl font-bold text-blue-600">{posts.length}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Featured Posts</h3>
            <p className="text-2xl font-bold text-orange-600">{posts.filter(p => p.isFeatured).length}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Members</h3>
            <p className="text-2xl font-bold text-purple-600">{members.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Comments</h3>
            <p className="text-2xl font-bold text-green-600">0</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Star className="text-yellow-500" />
              Featured Posts
            </h2>
            <div className="space-y-3">
              {posts.filter(post => post.isFeatured).map((post, index) => (
                <div key={index} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="text-yellow-600" size={16} />
                    <span className="text-xs font-semibold text-yellow-600 uppercase">Featured Post</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{post.date}</p>
                  <p className="text-gray-700">{post.content}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MessageSquare size={14} />
                      0 Comments
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Recent Posts</h2>
            <div className="space-y-3">
              {posts.filter(post => !post.isFeatured).map((post, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition">
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Content Editor Router
  const ContentEditor = () => {
    if (contentType === 'post') {
      return (
        <RichBlogEditor
          onSave={(postData) => {
            setPosts(prev => [{ ...postData, date: new Date().toLocaleDateString() }, ...prev]);
            setIsCreating(false);
          }}
          onCancel={() => setIsCreating(false)}
        />
      );
    }
    return <div>Other content types coming soon...</div>;
  };

  // Handle save functionality
  const handleSave = (data) => {
    if (contentType === 'post') {
      setPosts(prev => [{ ...data, date: new Date().toLocaleDateString() }, ...prev]);
    }
    setIsCreating(false);
  };

  // Post Card Component
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

  // Settings Section
  const SettingsSection = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <p className="text-gray-600">Settings panel coming soon...</p>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800">Social Hub</h2>
        </div>
        
        <nav className="px-4 pb-6">
          {[
            { id: 'dashboard', icon: Home, label: 'Dashboard' },
            { id: 'newsfeed', icon: MessageSquare, label: 'News Feed' },
            { id: 'posts', icon: FileText, label: 'Blog Posts' },
            { id: 'campaigns', icon: Mail, label: 'Email Campaigns' },
            { id: 'members', icon: Users, label: 'Members' },
            { id: 'calendar', icon: Calendar, label: 'Calendar' },
            { id: 'analytics', icon: BarChart3, label: 'Analytics' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map((item) => (
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

      <div className="flex-1 p-8">
        {isCreating ? (
          <ContentEditor />
        ) : (
          <>
            {activeSection === 'dashboard' && <Dashboard />}
            {activeSection === 'newsfeed' && <NewsFeed />}
            {activeSection === 'settings' && <SettingsSection />}
            {activeSection === 'posts' && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Blog Posts</h2>
                  <button
                    onClick={() => { setContentType('post'); setIsCreating(true); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus size={20} /> New Post
                  </button>
                </div>
                <div className="space-y-3">
                  {posts.map((post, index) => (
                    <PostCard key={index} post={post} />
                  ))}
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
                  {members.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
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
