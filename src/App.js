import React, { useState, useEffect, useRef } from 'react';
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
  const [showPreview, setShowPreview] = useState(true); // Changed to true by default
  const [currentUser, setCurrentUser] = useState(null);

  // API Configuration - Fix environment variable loading
  const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL || '';
  const XANO_API_KEY = process.env.REACT_APP_XANO_API_KEY || '';
  const CLOUDINARY_CLOUD = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || '';
  const CLOUDINARY_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || '';

  // Debug log to check if variables are loaded
  useEffect(() => {
    console.log('Environment Variables Check:');
    console.log('Cloudinary Cloud:', CLOUDINARY_CLOUD ? 'Configured' : 'Missing');
    console.log('Cloudinary Preset:', CLOUDINARY_PRESET ? 'Configured' : 'Missing');
    console.log('Xano URL:', XANO_BASE_URL ? 'Configured' : 'Missing');
  }, []);

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

  // Content Editor Component - WITH PROPER RICH TEXT EDITING
  const ContentEditor = () => {
    // Use refs for editors
    const titleEditorRef = useRef(null);
    const contentEditorRef = useRef(null);
    const fileInputRef = useRef(null);
    
    // Local state
    const [isFeatured, setIsFeatured] = useState(false);
    const [media, setMedia] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(null);
    const [previewContent, setPreviewContent] = useState({
      title: '',
      content: ''
    });

    // Update preview with debouncing
    useEffect(() => {
      const updatePreview = () => {
        setPreviewContent({
          title: titleEditorRef.current?.innerHTML || '',
          content: contentEditorRef.current?.innerHTML || ''
        });
      };

      const interval = setInterval(updatePreview, 500);
      return () => clearInterval(interval);
    }, []);

    // Format selected text
    const formatSelection = (command, value = null) => {
      // Save selection first
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      
      // Execute formatting command
      document.execCommand(command, false, value);
      
      // Keep focus
      if (selection.anchorNode) {
        const range = selection.getRangeAt(0);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    };

    // Insert link
    const insertLink = () => {
      const url = window.prompt('Enter URL:');
      if (url) {
        formatSelection('createLink', url);
      }
    };

    // Handle paste - clean up formatting
    const handlePaste = (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    };

    // Handle file processing with better Cloudinary integration
    const processFile = async (file) => {
      // Validate file type
      const validTypes = ['image/', 'video/', 'audio/'];
      const isValid = validTypes.some(type => file.type.startsWith(type));
      
      if (!isValid) {
        alert('Please upload an image, video, or audio file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      // Create local preview first
      const localUrl = URL.createObjectURL(file);
      const mediaType = file.type.startsWith('audio') ? 'audio' : 
                       file.type.startsWith('video') ? 'video' : 'image';
      
      setUploadProgress('Processing...');
      
      // Check if Cloudinary is configured (variables should be loaded now after redeploy)
      if (CLOUDINARY_CLOUD && CLOUDINARY_PRESET) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', CLOUDINARY_PRESET);
          
          setUploadProgress('Uploading to Cloudinary...');
          
          const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`;
          console.log('Uploading to Cloudinary:', uploadUrl);
          
          const response = await fetch(uploadUrl, { 
            method: 'POST', 
            body: formData 
          });
          
          const responseData = await response.json();
          
          if (response.ok && responseData.secure_url) {
            setMedia(prev => [...prev, { 
              type: mediaType, 
              url: responseData.secure_url, 
              id: Date.now(),
              name: file.name
            }]);
            setUploadProgress(null);
            console.log('Upload successful!');
          } else {
            throw new Error(responseData.error?.message || 'Upload failed');
          }
        } catch (error) {
          console.error('Upload error:', error);
          // Fall back to local preview
          setMedia(prev => [...prev, { 
            type: mediaType, 
            url: localUrl, 
            id: Date.now(),
            name: file.name,
            local: true
          }]);
          setUploadProgress(null);
          alert(`Upload failed: ${error.message}\n\nUsing local preview instead.`);
        }
      } else {
        // No Cloudinary configured
        console.log('Cloudinary not configured');
        setMedia(prev => [...prev, { 
          type: mediaType, 
          url: localUrl, 
          id: Date.now(),
          name: file.name,
          local: true
        }]);
        setUploadProgress(null);
      }
    };

    // Drag and drop handlers
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

    const handleDrop = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      for (const file of files) {
        await processFile(file);
      }
    };

    // File input handler
    const handleFileSelect = async (e) => {
      const files = Array.from(e.target.files);
      for (const file of files) {
        await processFile(file);
      }
      // Reset input
      e.target.value = '';
    };

    // Open file browser
    const openFileBrowser = () => {
      fileInputRef.current?.click();
    };

    const handleSave = async (isDraft = false) => {
      const contentData = {
        title: titleEditorRef.current?.innerHTML || '',
        content: contentEditorRef.current?.innerHTML || '',
        media: JSON.stringify(media.filter(m => !m.local)), // Only save non-local media
        isFeatured: isFeatured,
        status: isDraft ? 'draft' : 'published',
        created_at: new Date().toISOString(),
        type: contentType
      };

      try {
        if (XANO_BASE_URL && XANO_API_KEY) {
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
            // Clear form
            if (titleEditorRef.current) titleEditorRef.current.innerHTML = '';
            if (contentEditorRef.current) contentEditorRef.current.innerHTML = '';
            setMedia([]);
            setIsFeatured(false);
          } else {
            throw new Error('Save failed');
          }
        } else {
          // Save locally if no Xano
          const newPost = { ...contentData, id: Date.now() };
          setPosts(prev => [newPost, ...prev]);
          alert('Saved locally!');
          setIsCreating(false);
        }
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
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
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
            {/* Rich Text Formatting Toolbar */}
            <div className="mb-4 p-3 border rounded bg-gray-50">
              <p className="text-xs text-gray-500 mb-2">Select text to format it:</p>
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  type="button"
                  onClick={() => formatSelection('bold')}
                  className="p-2 border bg-white rounded hover:bg-gray-100"
                  title="Bold (Ctrl+B)"
                >
                  <Bold size={18} />
                </button>
                
                <button
                  type="button"
                  onClick={() => formatSelection('italic')}
                  className="p-2 border bg-white rounded hover:bg-gray-100"
                  title="Italic (Ctrl+I)"
                >
                  <Italic size={18} />
                </button>
                
                <button
                  type="button"
                  onClick={() => formatSelection('underline')}
                  className="p-2 border bg-white rounded hover:bg-gray-100"
                  title="Underline (Ctrl+U)"
                >
                  <Underline size={18} />
                </button>
                
                <div className="w-px h-6 bg-gray-300"></div>
                
                <select 
                  onChange={(e) => formatSelection('fontSize', e.target.value)}
                  className="px-2 py-1 border bg-white rounded"
                  defaultValue=""
                >
                  <option value="">Size</option>
                  <option value="1">Small</option>
                  <option value="3">Normal</option>
                  <option value="5">Large</option>
                  <option value="7">Huge</option>
                </select>
                
                <input
                  type="color"
                  onChange={(e) => formatSelection('foreColor', e.target.value)}
                  className="w-10 h-8 border rounded cursor-pointer"
                  title="Text Color"
                />
                
                <div className="w-px h-6 bg-gray-300"></div>
                
                <button
                  type="button"
                  onClick={() => formatSelection('justifyLeft')}
                  className="p-2 border bg-white rounded hover:bg-gray-100"
                  title="Align Left"
                >
                  <AlignLeft size={18} />
                </button>
                
                <button
                  type="button"
                  onClick={() => formatSelection('justifyCenter')}
                  className="p-2 border bg-white rounded hover:bg-gray-100"
                  title="Align Center"
                >
                  <AlignCenter size={18} />
                </button>
                
                <button
                  type="button"
                  onClick={() => formatSelection('justifyRight')}
                  className="p-2 border bg-white rounded hover:bg-gray-100"
                  title="Align Right"
                >
                  <AlignRight size={18} />
                </button>
                
                <div className="w-px h-6 bg-gray-300"></div>
                
                <button
                  type="button"
                  onClick={() => formatSelection('insertUnorderedList')}
                  className="p-2 border bg-white rounded hover:bg-gray-100"
                  title="Bullet List"
                >
                  <List size={18} />
                </button>
                
                <button
                  type="button"
                  onClick={insertLink}
                  className="p-2 border bg-white rounded hover:bg-gray-100"
                  title="Insert Link"
                >
                  <Link size={18} />
                </button>
              </div>
            </div>

            {/* Title Editor */}
            <div className="mb-4">
              <div
                ref={titleEditorRef}
                contentEditable
                className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ minHeight: '50px', fontSize: '24px', fontWeight: 'bold' }}
                data-placeholder="Enter title..."
                onPaste={handlePaste}
                suppressContentEditableWarning={true}
              />
            </div>

            {/* Content Editor */}
            <div className="mb-4">
              <div
                ref={contentEditorRef}
                contentEditable
                className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ minHeight: '200px' }}
                data-placeholder="Enter your content... Select any text to format it!"
                onPaste={handlePaste}
                suppressContentEditableWarning={true}
              />
            </div>

            <style>{`
              [contenteditable]:empty:before {
                content: attr(data-placeholder);
                color: #999;
              }
              [contenteditable]:focus {
                outline: none;
              }
            `}</style>

    // Drag and drop handlers
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

    const handleDrop = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      for (const file of files) {
        await processFile(file);
      }
    };

    // File input handler
    const handleFileSelect = async (e) => {
      const files = Array.from(e.target.files);
      for (const file of files) {
        await processFile(file);
      }
      // Reset input
      e.target.value = '';
    };

    // Open file browser
    const openFileBrowser = () => {
      fileInputRef.current?.click();
    };

    const handleSave = async (isDraft = false) => {
      const contentData = {
        title: titleInputRef.current?.value || '',
        content: contentInputRef.current?.value || '',
        media: JSON.stringify(media.filter(m => !m.local)), // Only save non-local media
        titleFormatting: JSON.stringify(titleFormatting),
        contentFormatting: JSON.stringify(contentFormatting),
        isFeatured: isFeatured,
        status: isDraft ? 'draft' : 'published',
        created_at: new Date().toISOString(),
        type: contentType
      };

      try {
        if (XANO_BASE_URL && XANO_API_KEY) {
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
            // Clear form
            if (titleInputRef.current) titleInputRef.current.value = '';
            if (contentInputRef.current) contentInputRef.current.value = '';
            setMedia([]);
            setIsFeatured(false);
          }
        } else {
          // Save locally if no Xano configured
          const newPost = { ...contentData, id: Date.now() };
          setPosts(prev => [newPost, ...prev]);
          alert(isDraft ? 'Saved as draft locally!' : 'Published locally!');
          setIsCreating(false);
        }
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
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
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
            {/* Media Upload - Drag & Drop Zone */}
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                mb-4 p-6 border-2 border-dashed rounded-lg text-center transition-all
                ${isDragging ? 
                  'border-blue-500 bg-blue-50' : 
                  'border-gray-300 hover:border-gray-400 bg-gray-50'
                }
              `}
            >
              <div className="space-y-2">
                <div className="flex justify-center">
                  <Upload size={40} className={isDragging ? 'text-blue-500' : 'text-gray-400'} />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    {isDragging ? 'Drop files here!' : 'Drag & drop media files here'}
                  </p>
                  <p className="text-sm text-gray-500">or</p>
                  <button
                    type="button"
                    onClick={openFileBrowser}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Browse Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Supports: Images, Videos, Audio (Max 10MB per file)
                </p>
              </div>
              
              {uploadProgress && (
                <div className="mt-4 p-2 bg-blue-100 text-blue-700 rounded">
                  {uploadProgress}
                </div>
              )}
            </div>

            {/* Media Preview in Editor */}
            {media.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Attached Media:</h3>
                <div className="space-y-2">
                  {media.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          {item.type === 'image' && <Image size={20} className="text-green-600" />}
                          {item.type === 'video' && <Film size={20} className="text-purple-600" />}
                          {item.type === 'audio' && <Music size={20} className="text-indigo-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.name || 'Media file'}</p>
                          <p className="text-xs text-gray-500">
                            {item.local ? 'Local preview (not saved)' : 'Uploaded to Cloudinary'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setMedia(prev => prev.filter(m => m.id !== item.id))}
                        className="text-red-500 hover:text-red-700 p-1"
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
                onClick={() => handleSave(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {contentType === 'email' ? 'Send Campaign' : 'Publish'}
              </button>
              <button
                onClick={() => handleSave(true)}
                className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Save as Draft
              </button>
            </div>
          </div>

            {/* Media Upload - Drag & Drop Zone */}
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                mb-4 p-6 border-2 border-dashed rounded-lg text-center transition-all
                ${isDragging ? 
                  'border-blue-500 bg-blue-50' : 
                  'border-gray-300 hover:border-gray-400 bg-gray-50'
                }
              `}
            >
              <div className="space-y-2">
                <div className="flex justify-center">
                  <Upload size={40} className={isDragging ? 'text-blue-500' : 'text-gray-400'} />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    {isDragging ? 'Drop files here!' : 'Drag & drop media files here'}
                  </p>
                  <p className="text-sm text-gray-500">or</p>
                  <button
                    type="button"
                    onClick={openFileBrowser}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Browse Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Supports: Images, Videos, Audio (Max 10MB per file)
                </p>
              </div>
              
              {uploadProgress && (
                <div className="mt-4 p-2 bg-blue-100 text-blue-700 rounded">
                  {uploadProgress}
                </div>
              )}
            </div>

            {/* Media Preview in Editor */}
            {media.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Attached Media:</h3>
                <div className="space-y-2">
                  {media.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          {item.type === 'image' && <Image size={20} className="text-green-600" />}
                          {item.type === 'video' && <Film size={20} className="text-purple-600" />}
                          {item.type === 'audio' && <Music size={20} className="text-indigo-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.name || 'Media file'}</p>
                          <p className="text-xs text-gray-500">
                            {item.local ? 'Local preview (not saved)' : 'Uploaded'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setMedia(prev => prev.filter(m => m.id !== item.id))}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
                {media.some(m => m.local) && (
                  <p className="text-xs text-orange-600 mt-2">
                    ⚠️ Local files shown for preview only. Configure Cloudinary to save permanently.
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleSave(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {contentType === 'email' ? 'Send Campaign' : 'Publish'}
              </button>
              <button
                onClick={() => handleSave(true)}
                className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Save as Draft
              </button>
            </div>
          </div>

          {/* Live Preview Panel */}
          {showPreview && (
            <div className="border rounded p-4 bg-gray-50 overflow-y-auto max-h-screen">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Live Preview</h3>
              <div className={`
                rounded-lg p-6 mb-4
                ${isFeatured ? 
                  'bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50 border-2 border-orange-300 shadow-xl' : 
                  'bg-white border shadow'
                }
              `}>
                {isFeatured && (
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="text-orange-500" size={20} />
                    <span className="text-orange-600 font-semibold text-sm">FEATURED POST</span>
                  </div>
                )}
                
                {/* Preview uses innerHTML to show formatted content */}
                <h2 
                  className={`mb-3 ${isFeatured ? 'text-3xl' : 'text-2xl'}`}
                  dangerouslySetInnerHTML={{ __html: previewContent.title || 'Your Title Here' }}
                />
                
                <p className="text-sm text-gray-500 mb-4">
                  {new Date().toLocaleDateString()}
                </p>
                
                <div 
                  className="mb-4"
                  dangerouslySetInnerHTML={{ __html: previewContent.content || 'Your content will appear here...' }}
                />

                {/* Media Preview */}
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
              </div>
            </div>
          )}
        </div>
      </div>
    );
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
    }, [post.id]);

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

    const formatContent = post.formatting ? 
      (typeof post.formatting === 'string' ? JSON.parse(post.formatting) : post.formatting) : 
      {};
    const media = post.media ? 
      (typeof post.media === 'string' ? JSON.parse(post.media) : post.media) : 
      [];

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
            fontFamily: formatContent.fontFamily || 'Arial',
            color: formatContent.fontColor || '#000000',
            fontWeight: formatContent.fontWeight || 'bold',
            fontStyle: formatContent.fontStyle || 'normal',
            textAlign: formatContent.textAlign || 'left'
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
            fontFamily: formatContent.fontFamily || 'Arial',
            fontSize: formatContent.fontSize || '16px',
            color: formatContent.fontColor || '#000000',
            fontWeight: formatContent.fontWeight || 'normal',
            fontStyle: formatContent.fontStyle || 'normal',
            textAlign: formatContent.textAlign || 'left'
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
            <p><span className="font-medium">Cloudinary Cloud:</span> {CLOUDINARY_CLOUD || 'Not configured'}</p>
            <p><span className="font-medium">Cloudinary Preset:</span> {CLOUDINARY_PRESET || 'Not configured'}</p>
          </div>
          
          {(!CLOUDINARY_CLOUD || !CLOUDINARY_PRESET) && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Cloudinary Setup Required</h4>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li>1. Go to Netlify Dashboard → Site Settings → Environment Variables</li>
                <li>2. Add REACT_APP_CLOUDINARY_CLOUD_NAME (from Cloudinary dashboard)</li>
                <li>3. Add REACT_APP_CLOUDINARY_UPLOAD_PRESET (create unsigned preset in Cloudinary)</li>
                <li>4. Redeploy the site</li>
              </ol>
            </div>
          )}
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
