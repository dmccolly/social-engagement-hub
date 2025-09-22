import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Home, FileText, Mail, Users, Settings, Calendar, BarChart3, 
  Plus, Edit, Trash2, Search, Bell, Upload, Send, Clock, 
  CheckCircle, X, ChevronDown, MessageSquare, Heart, BookmarkPlus,
  Image, Film, Music, Link, Bold, Italic, Underline, Type,
  Palette, AlignLeft, AlignCenter, AlignRight, List, Eye,
  Star, Sparkles, Crown, Cloud, FileImage
} from 'lucide-react';

// Move PostCard outside of App component to prevent recreation
const PostCard = ({ post, isWidget = false, isPreview = false }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [postComments, setPostComments] = useState([]);
  const [commenterName, setCommenterName] = useState('');
  const [commenterEmail, setCommenterEmail] = useState('');

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    if (!commenterEmail) {
      alert('Please enter your email to comment');
      return;
    }

    const commentData = {
      id: Date.now(),
      content: newComment,
      author_name: commenterName || 'Anonymous',
      author_email: commenterEmail,
      created_at: new Date().toISOString()
    };

    setPostComments([...postComments, commentData]);
    setNewComment('');
  };

  const formatContent = post.formatting || {
    fontFamily: 'Arial',
    fontSize: '16px',
    fontColor: '#000000',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left'
  };
  
  const media = post.media || [];

  return (
    <div className={`
      rounded-lg p-6 mb-4 transition-all
      ${post.isFeatured ? 
        'bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50 border-2 border-orange-300 shadow-xl' : 
        'bg-white border shadow'
      }
      ${isWidget ? 'mx-auto max-w-2xl' : ''}
    `}>
      {post.isFeatured && (
        <div className="flex items-center gap-2 mb-3">
          <Crown className="text-orange-500" size={20} />
          <span className="text-orange-600 font-semibold text-sm">FEATURED POST</span>
        </div>
      )}
      
      <h2 
        className={`mb-3 ${post.isFeatured ? 'text-3xl' : 'text-2xl'}`}
        style={{
          fontFamily: formatContent.fontFamily,
          color: formatContent.fontColor,
          fontWeight: formatContent.fontWeight || 'bold',
          fontStyle: formatContent.fontStyle,
          textAlign: formatContent.textAlign
        }}
      >
        {post.title}
      </h2>
      
      <p className="text-sm text-gray-500 mb-4">
        {new Date(post.created_at).toLocaleDateString()}
      </p>
      
      <div 
        className="mb-4 whitespace-pre-wrap"
        style={{
          fontFamily: formatContent.fontFamily,
          fontSize: formatContent.fontSize,
          color: formatContent.fontColor,
          fontWeight: formatContent.fontWeight,
          fontStyle: formatContent.fontStyle,
          textAlign: formatContent.textAlign
        }}
      >
        {post.content}
      </div>

      {/* Media Display */}
      {media.length > 0 && media.map((item) => (
        <div key={item.id} className="mb-4">
          {item.type === 'image' && (
            <img src={item.url} alt="Embedded" className="max-w-full rounded" />
          )}
          {item.type === 'video' && (
            <div className="aspect-video">
              {item.url.includes('youtube') ? (
                <iframe
                  src={`https://www.youtube.com/embed/${item.url.split('v=')[1]?.split('&')[0]}`}
                  className="w-full h-full rounded"
                  allowFullScreen
                />
              ) : (
                <video src={item.url} controls className="w-full rounded" />
              )}
            </div>
          )}
          {item.type === 'audio' && (
            <audio src={item.url} controls className="w-full" />
          )}
        </div>
      ))}

      {/* Comments Section */}
      {!isPreview && (
        <div className="border-t pt-4 mt-4">
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <MessageSquare size={20} />
            <span>{postComments.length} Comments</span>
          </button>

          {showComments && (
            <div className="mt-4 space-y-3">
              {postComments.map((comment, idx) => (
                <div key={idx} className="pl-4 border-l-2 border-gray-200">
                  <p className="font-medium text-sm">{comment.author_name}</p>
                  <p className="text-gray-700">{comment.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}

              <div className="mt-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={commenterName}
                    onChange={(e) => setCommenterName(e.target.value)}
                    className="px-3 py-2 border rounded text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Your email (required)"
                    value={commenterEmail}
                    onChange={(e) => setCommenterEmail(e.target.value)}
                    className="px-3 py-2 border rounded text-sm"
                  />
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    className="flex-1 px-3 py-2 border rounded"
                  />
                  <button
                    onClick={handleAddComment}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const App = () => {
  // State Management
  const [activeSection, setActiveSection] = useState('dashboard');
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [comments, setComments] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [contentType, setContentType] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Content Editor State - Keep these at the top level to prevent focus loss
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorMedia, setEditorMedia] = useState([]);
  const [editorIsFeatured, setEditorIsFeatured] = useState(false);
  const [editorFormatting, setEditorFormatting] = useState({
    fontFamily: 'Arial',
    fontSize: '16px',
    fontColor: '#000000',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left'
  });

  // Drag and Drop State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);

  // File input ref
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);

  // API Configuration
  const XANO_BASE_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_XANO_BASE_URL) || '';
  const XANO_API_KEY = (typeof process !== 'undefined' && process.env?.REACT_APP_XANO_API_KEY) || '';
  const CLOUDINARY_CLOUD = (typeof process !== 'undefined' && process.env?.REACT_APP_CLOUDINARY_CLOUD_NAME) || 'demo';
  const CLOUDINARY_PRESET = (typeof process !== 'undefined' && process.env?.REACT_APP_CLOUDINARY_UPLOAD_PRESET) || 'unsigned';

  // Initialize data
  useEffect(() => {
    fetchData();
    if (window.location.pathname.includes('/widget/')) {
      document.body.style.margin = '0';
      document.body.style.padding = '0';
    }
  }, []);

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${XANO_API_KEY}` };
      
      const [postsRes, membersRes, commentsRes] = await Promise.all([
        fetch(`${XANO_BASE_URL}/post`, { headers }),
        fetch(`${XANO_BASE_URL}/member`, { headers }),
        fetch(`${XANO_BASE_URL}/post_comment`, { headers })
      ]);
      
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData);
      }
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData);
      }
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json();
        setComments(commentsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setPosts([
        { id: 1, title: 'Welcome to Our Platform', content: 'This is a featured post!', isFeatured: true, created_at: new Date().toISOString() },
        { id: 2, title: 'Latest Updates', content: 'Check out what\'s new...', isFeatured: false, created_at: new Date().toISOString() }
      ]);
    }
  };

  // File Upload Functions
  const uploadToCloudinary = async (file) => {
    // Add to uploading queue
    setUploadingFiles(prev => [...prev, file.name]);
    
    try {
      // Always use local file reader for now to avoid Cloudinary issues
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const mediaType = file.type.startsWith('audio') ? 'audio' : 
                         file.type.startsWith('video') ? 'video' : 'image';
        
        setEditorMedia(prev => [...prev, { 
          type: mediaType, 
          url: reader.result, // This will be a base64 data URL
          id: Date.now(),
          name: file.name,
          size: file.size
        }]);
        
        setUploadingFiles(prev => prev.filter(name => name !== file.name));
      };
      
      reader.onerror = () => {
        alert(`Failed to read file: ${file.name}`);
        setUploadingFiles(prev => prev.filter(name => name !== file.name));
      };
      
      // Read the file as data URL (base64)
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
      setUploadingFiles(prev => prev.filter(name => name !== file.name));
    }
  };

  const handleFileSelect = (files, type = 'auto') => {
    const fileArray = Array.from(files);
    
    fileArray.forEach(file => {
      // Validate file type
      if (type === 'image' && !file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return;
      }
      if (type === 'video' && !file.type.startsWith('video/')) {
        alert(`${file.name} is not a video file`);
        return;
      }
      if (type === 'audio' && !file.type.startsWith('audio/')) {
        alert(`${file.name} is not an audio file`);
        return;
      }
      
      uploadToCloudinary(file);
    });
  };

  // Drag and Drop Handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  // Content Editor Component
  const ContentEditor = () => {
    const applyFormatting = (format, value) => {
      setEditorFormatting(prev => ({
        ...prev,
        [format]: value
      }));
    };

    const saveContent = async (isDraft = false) => {
      const contentData = {
        title: editorTitle,
        content: editorContent,
        media: JSON.stringify(editorMedia),
        formatting: JSON.stringify(editorFormatting),
        isFeatured: editorIsFeatured,
        status: isDraft ? 'draft' : 'published',
        created_at: new Date().toISOString(),
        type: contentType
      };

      try {
        if (XANO_BASE_URL) {
          const response = await fetch(`${XANO_BASE_URL}/post`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${XANO_API_KEY}`
            },
            body: JSON.stringify(contentData)
          });

          if (response.ok) {
            alert(isDraft ? 'Saved as draft!' : 'Published successfully!');
          }
        } else {
          // Local save for demo
          setPosts(prev => [contentData, ...prev]);
          alert(isDraft ? 'Saved as draft!' : 'Published successfully!');
        }
        
        setIsCreating(false);
        fetchData();
        // Reset editor state
        setEditorTitle('');
        setEditorContent('');
        setEditorMedia([]);
        setEditorIsFeatured(false);
        setEditorFormatting({
          fontFamily: 'Arial',
          fontSize: '16px',
          fontColor: '#000000',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textAlign: 'left'
        });
      } catch (error) {
        alert('Error saving: ' + error.message);
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Create {contentType === 'post' ? 'Blog Post' : contentType === 'email' ? 'Email Campaign' : 'Content'}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
            >
              <Eye size={20} />
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Featured Post Toggle */}
        {contentType === 'post' && (
          <div className="mb-6 p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="text-orange-500" size={24} />
                <div>
                  <h3 className="font-semibold">Featured Post</h3>
                  <p className="text-sm text-gray-600">Make this post stand out with special styling</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editorIsFeatured}
                  onChange={(e) => setEditorIsFeatured(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>
        )}

        <div className={`grid ${showPreview ? 'grid-cols-2 gap-6' : 'grid-cols-1'}`}>
          {/* Editor Panel */}
          <div>
            {/* Formatting Toolbar */}
            <div className="mb-4 p-3 border rounded flex flex-wrap gap-2 items-center">
              <select 
                value={editorFormatting.fontFamily}
                onChange={(e) => applyFormatting('fontFamily', e.target.value)}
                className="px-2 py-1 border rounded"
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Courier New">Courier New</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
              </select>

              <select 
                value={editorFormatting.fontSize}
                onChange={(e) => applyFormatting('fontSize', e.target.value)}
                className="px-2 py-1 border rounded"
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
                value={editorFormatting.fontColor}
                onChange={(e) => applyFormatting('fontColor', e.target.value)}
                className="w-10 h-8 border rounded cursor-pointer"
              />

              <button
                onClick={() => applyFormatting('fontWeight', editorFormatting.fontWeight === 'bold' ? 'normal' : 'bold')}
                className={`p-1 border rounded ${editorFormatting.fontWeight === 'bold' ? 'bg-gray-200' : ''}`}
              >
                <Bold size={20} />
              </button>

              <button
                onClick={() => applyFormatting('fontStyle', editorFormatting.fontStyle === 'italic' ? 'normal' : 'italic')}
                className={`p-1 border rounded ${editorFormatting.fontStyle === 'italic' ? 'bg-gray-200' : ''}`}
              >
                <Italic size={20} />
              </button>

              <button
                onClick={() => applyFormatting('textAlign', 'left')}
                className={`p-1 border rounded ${editorFormatting.textAlign === 'left' ? 'bg-gray-200' : ''}`}
              >
                <AlignLeft size={20} />
              </button>

              <button
                onClick={() => applyFormatting('textAlign', 'center')}
                className={`p-1 border rounded ${editorFormatting.textAlign === 'center' ? 'bg-gray-200' : ''}`}
              >
                <AlignCenter size={20} />
              </button>

              <button
                onClick={() => applyFormatting('textAlign', 'right')}
                className={`p-1 border rounded ${editorFormatting.textAlign === 'right' ? 'bg-gray-200' : ''}`}
              >
                <AlignRight size={20} />
              </button>
            </div>

            {/* Title Input */}
            <input
              type="text"
              placeholder="Enter title..."
              value={editorTitle}
              onChange={(e) => setEditorTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded mb-4"
              style={{
                fontFamily: editorFormatting.fontFamily,
                fontSize: '24px',
                color: editorFormatting.fontColor,
                fontWeight: editorFormatting.fontWeight,
                fontStyle: editorFormatting.fontStyle
              }}
            />

            {/* Content Textarea */}
            <textarea
              placeholder="Enter content..."
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              rows="10"
              className="w-full px-4 py-2 border rounded mb-4"
              style={{
                fontFamily: editorFormatting.fontFamily,
                fontSize: editorFormatting.fontSize,
                color: editorFormatting.fontColor,
                fontWeight: editorFormatting.fontWeight,
                fontStyle: editorFormatting.fontStyle,
                textAlign: editorFormatting.textAlign
              }}
            />

            {/* Drag and Drop Zone */}
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 mb-4 text-center transition-all
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
              `}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Cloud className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-semibold mb-2">
                {isDragging ? 'Drop files here!' : 'Drag & Drop Media Files'}
              </h3>
              <p className="text-gray-600 mb-4">
                or click the buttons below to browse
              </p>
              
              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files, 'image')}
                className="hidden"
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files, 'video')}
                className="hidden"
              />
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files, 'audio')}
                className="hidden"
              />
              
              {/* Media Buttons */}
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
                >
                  <Image size={20} /> Browse Images
                </button>
                
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-2"
                >
                  <Film size={20} /> Browse Videos
                </button>

                <button
                  onClick={() => audioInputRef.current?.click()}
                  className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 flex items-center gap-2"
                >
                  <Music size={20} /> Browse Audio
                </button>
              </div>
            </div>

            {/* Uploading Files Status */}
            {uploadingFiles.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm font-semibold text-blue-700 mb-2">Uploading...</p>
                {uploadingFiles.map(filename => (
                  <div key={filename} className="text-sm text-blue-600">
                    {filename}
                  </div>
                ))}
              </div>
            )}

            {/* Media Preview */}
            {editorMedia.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Uploaded Media:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {editorMedia.map((item) => (
                    <div key={item.id} className="relative group border rounded p-2">
                      {item.type === 'image' && (
                        <img 
                          src={item.url} 
                          alt={item.name} 
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                      {item.type === 'video' && (
                        <video 
                          src={item.url} 
                          className="w-full h-32 object-cover rounded"
                          controls
                        />
                      )}
                      {item.type === 'audio' && (
                        <div className="flex items-center justify-center h-32 bg-gray-100 rounded">
                          <Music size={32} className="text-gray-400" />
                          <audio src={item.url} controls className="absolute bottom-2 left-2 right-2" />
                        </div>
                      )}
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => {
                            setEditorMedia(prev => prev.filter(m => m.id !== item.id));
                          }}
                          className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 truncate mt-1">{item.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
