import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [comments, setComments] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [contentType, setContentType] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Content Editor State
  const [editorContent, setEditorContent] = useState({
    title: '',
    content: '',
    media: [],
    isFeatured: false,
    formatting: {
      fontFamily: 'Arial',
      fontSize: '16px',
      fontColor: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left'
    }
  });

  // Editor refs to prevent backwards typing
  const titleRef = useRef(null);
  const contentRef = useRef(null);

  // API Configuration
  const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL || '';
  const XANO_API_KEY = process.env.REACT_APP_XANO_API_KEY || '';
  const CLOUDINARY_CLOUD = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || '';
  const CLOUDINARY_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || '';

  // Initialize data
  useEffect(() => {
    fetchData();
    // Check for embedded widget mode
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
      // Initialize with sample data if API fails
      setPosts([
        { id: 1, title: 'Welcome to Our Platform', content: 'This is a featured post!', isFeatured: true, created_at: new Date().toISOString() },
        { id: 2, title: 'Latest Updates', content: 'Check out what\'s new...', isFeatured: false, created_at: new Date().toISOString() }
      ]);
    }
  };

  // Enhanced Content Editor with Featured Post Toggle
  const ContentEditor = () => {
    const handleTitleChange = useCallback((e) => {
      const value = e.target.value;
      const cursorPos = e.target.selectionStart;
      
      setEditorContent(prev => ({
        ...prev,
        title: value
      }));
      
      setTimeout(() => {
        if (titleRef.current) {
          titleRef.current.setSelectionRange(cursorPos, cursorPos);
        }
      }, 0);
    }, []);

    const handleContentChange = useCallback((e) => {
      const value = e.target.value;
      const cursorPos = e.target.selectionStart;
      
      setEditorContent(prev => ({
        ...prev,
        content: value
      }));
      
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.setSelectionRange(cursorPos, cursorPos);
        }
      }, 0);
    }, []);

    const applyFormatting = (format, value) => {
      setEditorContent(prev => ({
        ...prev,
        formatting: {
          ...prev.formatting,
          [format]: value
        }
      }));
    };

    const embedMedia = (type) => {
      let url = '';
      
      switch(type) {
        case 'image':
          url = prompt('Enter image URL:');
          break;
        case 'video':
          url = prompt('Enter YouTube/Vimeo URL:');
          break;
        case 'audio':
          url = prompt('Enter audio file URL (MP3, WAV, OGG):');
          break;
        default:
          return;
      }
      
      if (url) {
        setEditorContent(prev => ({
          ...prev,
          media: [...prev.media, { type, url, id: Date.now() }]
        }));
      }
    };

    const uploadToCloudinary = async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_PRESET);
      
      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`,
          { method: 'POST', body: formData }
        );
        
        const data = await response.json();
        
        const mediaType = file.type.startsWith('audio') ? 'audio' : 
                         file.type.startsWith('video') ? 'video' : 'image';
        
        setEditorContent(prev => ({
          ...prev,
          media: [...prev.media, { 
            type: mediaType, 
            url: data.secure_url, 
            id: Date.now() 
          }]
        }));
      } catch (error) {
        alert('Upload failed: ' + error.message);
      }
    };

    const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        uploadToCloudinary(file);
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
                  checked={editorContent.isFeatured}
                  onChange={(e) => setEditorContent(prev => ({ ...prev, isFeatured: e.target.checked }))}
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
                value={editorContent.formatting.fontFamily}
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
                value={editorContent.formatting.fontSize}
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
                value={editorContent.formatting.fontColor}
                onChange={(e) => applyFormatting('fontColor', e.target.value)}
                className="w-10 h-8 border rounded cursor-pointer"
              />

              <button
                onClick={() => applyFormatting('fontWeight', editorContent.formatting.fontWeight === 'bold' ? 'normal' : 'bold')}
                className={`p-1 border rounded ${editorContent.formatting.fontWeight === 'bold' ? 'bg-gray-200' : ''}`}
              >
                <Bold size={20} />
              </button>

              <button
                onClick={() => applyFormatting('fontStyle', editorContent.formatting.fontStyle === 'italic' ? 'normal' : 'italic')}
                className={`p-1 border rounded ${editorContent.formatting.fontStyle === 'italic' ? 'bg-gray-200' : ''}`}
              >
                <Italic size={20} />
              </button>

              <button
                onClick={() => applyFormatting('textAlign', 'left')}
                className={`p-1 border rounded ${editorContent.formatting.textAlign === 'left' ? 'bg-gray-200' : ''}`}
              >
                <AlignLeft size={20} />
              </button>

              <button
                onClick={() => applyFormatting('textAlign', 'center')}
                className={`p-1 border rounded ${editorContent.formatting.textAlign === 'center' ? 'bg-gray-200' : ''}`}
              >
                <AlignCenter size={20} />
              </button>

              <button
                onClick={() => applyFormatting('textAlign', 'right')}
                className={`p-1 border rounded ${editorContent.formatting.textAlign === 'right' ? 'bg-gray-200' : ''}`}
              >
                <AlignRight size={20} />
              </button>
            </div>

            {/* Title Input */}
            <input
              ref={titleRef}
              type="text"
              placeholder="Enter title..."
              value={editorContent.title}
              onChange={handleTitleChange}
              className="w-full px-4 py-2 border rounded mb-4"
              style={{
                fontFamily: editorContent.formatting.fontFamily,
                fontSize: '24px',
                color: editorContent.formatting.fontColor,
                fontWeight: editorContent.formatting.fontWeight,
                fontStyle: editorContent.formatting.fontStyle
              }}
            />

            {/* Content Textarea */}
            <textarea
              ref={contentRef}
              placeholder="Enter content..."
              value={editorContent.content}
              onChange={handleContentChange}
              rows="10"
              className="w-full px-4 py-2 border rounded mb-4"
              style={{
                fontFamily: editorContent.formatting.fontFamily,
                fontSize: editorContent.formatting.fontSize,
                color: editorContent.formatting.fontColor,
                fontWeight: editorContent.formatting.fontWeight,
                fontStyle: editorContent.formatting.fontStyle,
                textAlign: editorContent.formatting.textAlign
              }}
            />

            {/* Media Embedding */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => embedMedia('image')}
                className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
              >
                <Image size={20} /> Add Image
              </button>
              
              <button
                onClick={() => embedMedia('video')}
                className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-2"
              >
                <Film size={20} /> Add Video
              </button>

              <button
                onClick={() => embedMedia('audio')}
                className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 flex items-center gap-2"
              >
                <Music size={20} /> Add Audio
              </button>

              <label className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 cursor-pointer">
                <Upload size={20} /> Upload Media
                <input
                  type="file"
                  accept="image/*,video/*,audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Media Preview in Editor */}
            {editorContent.media.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Embedded Media:</h3>
                <div className="space-y-2">
                  {editorContent.media.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                      <span>{item.type}: {item.url.substring(0, 50)}...</span>
                      <button
                        onClick={() => {
                          setEditorContent(prev => ({
                            ...prev,
                            media: prev.media.filter(m => m.id !== item.id)
                          }));
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={saveContent}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {contentType === 'email' ? 'Send Campaign' : 'Publish'}
              </button>
              <button
                onClick={() => saveContent(true)}
                className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Save as Draft
              </button>
            </div>
          </div>

          {/* Live Preview Panel */}
          {showPreview && (
            <div className="border rounded p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Live Preview</h3>
              <PostCard 
                post={{
                  title: editorContent.title || 'Your Title Here',
                  content: editorContent.content || 'Your content will appear here...',
                  media: editorContent.media,
                  isFeatured: editorContent.isFeatured,
                  formatting: editorContent.formatting,
                  created_at: new Date().toISOString()
                }}
                isPreview={true}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const saveContent = async (isDraft = false) => {
    const contentData = {
      title: editorContent.title,
      content: editorContent.content,
      media: JSON.stringify(editorContent.media),
      formatting: JSON.stringify(editorContent.formatting),
      isFeatured: editorContent.isFeatured,
      status: isDraft ? 'draft' : 'published',
      created_at: new Date().toISOString(),
      type: contentType
    };

    try {
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
        setIsCreating(false);
        fetchData();
        setEditorContent({
          title: '',
          content: '',
          media: [],
          isFeatured: false,
          formatting: {
            fontFamily: 'Arial',
            fontSize: '16px',
            fontColor: '#000000',
            fontWeight: 'normal',
            fontStyle: 'normal',
            textAlign: 'left'
          }
        });
      }
    } catch (error) {
      alert('Error saving: ' + error.message);
    }
  };

  // Post Card Component with Featured Styling and Comments
  const PostCard = ({ post, isWidget = false, isPreview = false }) => {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [postComments, setPostComments] = useState([]);
    const [commenterName, setCommenterName] = useState('');
    const [commenterEmail, setCommenterEmail] = useState('');

    useEffect(() => {
      if (post.id && comments.length > 0) {
        setPostComments(comments.filter(c => c.post_id === post.id));
      }
    }, [post.id, comments]);

    const handleAddComment = async () => {
      if (!newComment.trim()) return;
      
      if (!commenterEmail) {
        alert('Please enter your email to comment');
        return;
      }

      const commentData = {
        post_id: post.id,
        content: newComment,
        author_name: commenterName || 'Anonymous',
        author_email: commenterEmail,
        created_at: new Date().toISOString()
      };

      try {
        const response = await fetch(`${XANO_BASE_URL}/post_comment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${XANO_API_KEY}`
          },
          body: JSON.stringify(commentData)
        });

        if (response.ok) {
          setPostComments([...postComments, commentData]);
          setNewComment('');
        }
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    };

    const formatContent = post.formatting ? JSON.parse(post.formatting) : editorContent.formatting;
    const media = post.media ? (typeof post.media === 'string' ? JSON.parse(post.media) : post.media) : [];

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
                {/* Existing Comments */}
                {postComments.map((comment, idx) => (
                  <div key={idx} className="pl-4 border-l-2 border-gray-200">
                    <p className="font-medium text-sm">{comment.author_name}</p>
                    <p className="text-gray-700">{comment.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}

                {/* Add Comment Form */}
                <div className="mt-4 space-y-2">
                  {!currentUser && (
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
                  )}
                  
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

  // Widget Components with Transparent Backgrounds
  const BlogWidget = () => (
    <div style={{ backgroundColor: 'transparent', minHeight: '100vh', padding: '20px' }}>
      <style>{`
        body { 
          background: transparent !important; 
          margin: 0;
          padding: 0;
        }
        :root {
          background: transparent !important;
        }
      `}</style>
      <div className="space-y-4">
        {posts.filter(p => p.status !== 'draft').map((post, idx) => (
          <PostCard key={idx} post={post} isWidget={true} />
        ))}
      </div>
    </div>
  );

  const SignupWidget = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSignup = async () => {
      if (!email) return;

      try {
        const response = await fetch(`${XANO_BASE_URL}/member`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${XANO_API_KEY}`
          },
          body: JSON.stringify({ email, name, created_at: new Date().toISOString() })
        });

        if (response.ok) {
          setSubmitted(true);
          setCurrentUser({ email, name });
        }
      } catch (error) {
        console.error('Signup error:', error);
      }
    };

    return (
      <div style={{ backgroundColor: 'transparent', padding: '20px', minHeight: '400px' }}>
        <style>{`
          body { 
            background: transparent !important; 
            margin: 0;
            padding: 0;
          }
          :root {
            background: transparent !important;
          }
        `}</style>
        <div className="bg-white/90 backdrop-blur rounded-lg shadow-lg p-6 max-w-md mx-auto">
          {!submitted ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
              <p className="text-gray-600 mb-6">Get updates and comment on posts!</p>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded"
                />
                <button
                  onClick={handleSignup}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Sign Up
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold mb-2">Welcome!</h3>
              <p className="text-gray-600">You can now comment on all posts.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const CalendarWidget = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    return (
      <div style={{ backgroundColor: 'transparent', padding: '20px' }}>
        <style>{`
          body { 
            background: transparent !important; 
            margin: 0;
            padding: 0;
          }
          :root {
            background: transparent !important;
          }
        `}</style>
        <div className="bg-white/90 backdrop-blur rounded-lg shadow-lg p-6 max-w-md mx-auto">
          <h3 className="text-xl font-bold mb-4">
            {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-600 p-2">
                {day}
              </div>
            ))}
            
            {[...Array(firstDay)].map((_, i) => (
              <div key={`empty-${i}`} className="p-2"></div>
            ))}
            
            {[...Array(daysInMonth)].map((_, i) => (
              <div
                key={i + 1}
                className={`
                  p-2 text-center rounded cursor-pointer hover:bg-blue-50
                  ${i + 1 === currentDate.getDate() ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                `}
              >
                {i + 1}
              </div>
            ))}
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
        
        {/* Quick Actions */}
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

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Total Posts</p>
            <p className="text-2xl font-bold text-blue-600">{posts.length}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Featured Posts</p>
            <p className="text-2xl font-bold text-orange-600">
              {posts.filter(p => p.isFeatured).length}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Total Members</p>
            <p className="text-2xl font-bold text-purple-600">{members.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Total Comments</p>
            <p className="text-2xl font-bold text-green-600">{comments.length}</p>
          </div>
        </div>
      </div>

      {/* Recent Featured Posts */}
      {posts.filter(p => p.isFeatured).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Star className="text-orange-500" />
            Featured Posts
          </h2>
          <div className="space-y-3">
            {posts.filter(p => p.isFeatured).map((post, index) => (
              <PostCard key={index} post={post} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Posts</h2>
        <div className="space-y-3">
          {posts.filter(p => !p.isFeatured).slice(0, 5).map((post, index) => (
            <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
              <div>
                <p className="font-medium">{post.title || `Post ${index + 1}`}</p>
                <p className="text-sm text-gray-500">{new Date(post.created_at || Date.now()).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <button className="text-blue-500 hover:text-blue-700">
                  <Edit size={18} />
                </button>
                <button className="text-red-500 hover:text-red-700">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Settings Component with Widget Codes
  const SettingsSection = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Settings & Integration</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Widget Embed Codes</h3>
          <p className="text-gray-600 mb-4">Copy these codes to embed widgets in your Webflow site. All widgets have transparent backgrounds.</p>
          
          <div className="space-y-4">
            <div className="border rounded p-4 bg-gray-50">
              <h4 className="font-medium mb-2">Signup Widget (Transparent)</h4>
              <pre className="text-sm bg-white p-2 rounded overflow-x-auto">
{`<iframe src="${window.location.origin}/widget/signup" 
        width="400" height="500" 
        frameborder="0"
        style="background: transparent;"></iframe>`}
              </pre>
            </div>
            
            <div className="border rounded p-4 bg-gray-50">
              <h4 className="font-medium mb-2">Blog Feed Widget with Comments (Transparent)</h4>
              <pre className="text-sm bg-white p-2 rounded overflow-x-auto">
{`<iframe src="${window.location.origin}/widget/blog" 
        width="100%" height="600" 
        frameborder="0"
        style="background: transparent;"></iframe>`}
              </pre>
            </div>
            
            <div className="border rounded p-4 bg-gray-50">
              <h4 className="font-medium mb-2">Calendar Widget (Transparent)</h4>
              <pre className="text-sm bg-white p-2 rounded overflow-x-auto">
{`<iframe src="${window.location.origin}/widget/calendar" 
        width="100%" height="400" 
        frameborder="0"
        style="background: transparent;"></iframe>`}
              </pre>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">API Configuration</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Xano URL:</span> {XANO_BASE_URL || 'Not configured'}</p>
            <p><span className="font-medium">Cloudinary:</span> {CLOUDINARY_CLOUD || 'Not configured'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Route handling for widgets
  if (window.location.pathname === '/widget/blog') {
    return <BlogWidget />;
  }
  
  if (window.location.pathname === '/widget/signup') {
    return <SignupWidget />;
  }
  
  if (window.location.pathname === '/widget/calendar') {
    return <CalendarWidget />;
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800">Social Hub</h2>
        </div>
        
        <nav className="px-4 pb-6">
          {[
            { id: 'dashboard', icon: Home, label: 'Dashboard' },
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

      {/* Main Content */}
      <div className="flex-1 p-8">
        {isCreating ? (
          <ContentEditor />
        ) : (
          <>
            {activeSection === 'dashboard' && <Dashboard />}
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
                      <p className="text-xs text-gray-400">
                        Joined {new Date(member.created_at || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default App;
