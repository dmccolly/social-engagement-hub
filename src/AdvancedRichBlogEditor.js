import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Heading from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, Italic, Underline, Type, Link as LinkIcon, 
  Upload, Download, Save, Palette, X, Film, Music, Image as ImageIcon,
  Eye, Layout, AlignLeft, AlignCenter, AlignRight, Move, RotateCcw,
  Maximize2, Minimize2, Square, ArrowLeft, ArrowRight
} from 'lucide-react';

const AdvancedRichBlogEditor = ({ 
  initialHTML = '<p>Start writing your blog post...</p>',
  folder = 'social-hub',
  onSave,
  CLOUDINARY_CLOUD,
  CLOUDINARY_PRESET 
}) => {
  const [status, setStatus] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [previewContent, setPreviewContent] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [selectedElement, setSelectedElement] = useState(null);
  const [mediaSize, setMediaSize] = useState('medium');
  const [mediaAlign, setMediaAlign] = useState('center');
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'nofollow noopener',
        },
      }),
      Color.configure({ types: [TextStyle.name] }),
      TextStyle,
      Heading.configure({
        levels: [2, 3],
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'arbe-image',
        },
      }),
      Youtube.configure({
        controls: false,
        nocookie: true,
        HTMLAttributes: {
          class: 'arbe-youtube',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: initialHTML,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      // Update preview content in real-time
      const html = editor.getHTML();
      setPreviewContent(html);
    },
  });

  // Initialize preview content
  useEffect(() => {
    if (editor) {
      setPreviewContent(editor.getHTML());
    }
  }, [editor]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  // Toolbar functions
  const setHeading = (level) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const toggleBold = () => {
    editor.chain().focus().toggleBold().run();
  };

  const toggleItalic = () => {
    editor.chain().focus().toggleItalic().run();
  };

  const toggleUnderline = () => {
    editor.chain().focus().toggleMark('underline').run();
  };

  const setColor = () => {
    editor.chain().focus().setColor(textColor).run();
  };

  const clearColor = () => {
    editor.chain().focus().unsetColor().run();
  };

  const setAlignment = (alignment) => {
    editor.chain().focus().setTextAlign(alignment).run();
  };

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const embedYouTube = () => {
    if (youtubeUrl) {
      let videoId = '';
      
      // Extract video ID from various YouTube URL formats
      if (youtubeUrl.includes('youtu.be/')) {
        videoId = youtubeUrl.split('youtu.be/')[1].split('?')[0];
      } else if (youtubeUrl.includes('youtube.com/watch?v=')) {
        videoId = youtubeUrl.split('v=')[1].split('&')[0];
      } else if (youtubeUrl.includes('youtube.com/embed/')) {
        videoId = youtubeUrl.split('embed/')[1].split('?')[0];
      }

      if (videoId) {
        // Create YouTube embed with positioning controls
        const sizeClass = mediaSize === 'small' ? 'arbe-media-small' : 
                         mediaSize === 'large' ? 'arbe-media-large' : 'arbe-media-medium';
        const alignClass = `arbe-align-${mediaAlign}`;
        
        editor.chain().focus().setYoutubeVideo({
          src: youtubeUrl,
          width: mediaSize === 'small' ? 320 : mediaSize === 'large' ? 800 : 560,
          height: mediaSize === 'small' ? 180 : mediaSize === 'large' ? 450 : 315,
        }).run();
        
        // Add custom classes after insertion
        setTimeout(() => {
          const youtubeElements = editor.view.dom.querySelectorAll('iframe[src*="youtube"]');
          const lastYoutube = youtubeElements[youtubeElements.length - 1];
          if (lastYoutube) {
            lastYoutube.className = `arbe-youtube ${sizeClass} ${alignClass}`;
          }
        }, 100);
        
        setYoutubeUrl('');
        setStatus('YouTube video embedded successfully!');
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus('Invalid YouTube URL. Please check the format.');
        setTimeout(() => setStatus(''), 3000);
      }
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/', 'video/', 'audio/'];
    const isValid = validTypes.some(type => file.type.startsWith(type));
    
    if (!isValid) {
      setStatus('Please upload an image, video, or audio file');
      setTimeout(() => setStatus(''), 3000);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setStatus('File size must be less than 10MB');
      setTimeout(() => setStatus(''), 3000);
      return;
    }

    setStatus('Uploading...');

    try {
      let mediaUrl;
      
      if (CLOUDINARY_CLOUD && CLOUDINARY_PRESET) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_PRESET);
        formData.append('folder', folder);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        const data = await response.json();

        if (response.ok && data.secure_url) {
          mediaUrl = data.secure_url;
        } else {
          throw new Error(data.error?.message || 'Upload failed');
        }
      } else {
        // Demo mode - use local URL
        mediaUrl = URL.createObjectURL(file);
      }

      // Insert media with positioning controls
      const sizeClass = mediaSize === 'small' ? 'arbe-media-small' : 
                       mediaSize === 'large' ? 'arbe-media-large' : 'arbe-media-medium';
      const alignClass = `arbe-align-${mediaAlign}`;
      
      if (file.type.startsWith('image')) {
        editor.chain().focus().setImage({ 
          src: mediaUrl, 
          alt: caption || 'Uploaded image',
          class: `arbe-image ${sizeClass} ${alignClass}`
        }).run();
      } else if (file.type.startsWith('video')) {
        const videoHtml = `<video src="${mediaUrl}" controls class="arbe-video ${sizeClass} ${alignClass}"></video>`;
        editor.chain().focus().insertContent(videoHtml).run();
      } else if (file.type.startsWith('audio')) {
        const audioHtml = `<audio src="${mediaUrl}" controls class="arbe-audio ${alignClass}"></audio>`;
        editor.chain().focus().insertContent(audioHtml).run();
      }
      
      setCaption('');
      setStatus('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      setStatus(`Upload failed: ${error.message}`);
    }

    setTimeout(() => setStatus(''), 3000);
    event.target.value = '';
  };

  const insertThumbnailYouTube = () => {
    if (youtubeUrl) {
      let videoId = '';
      
      if (youtubeUrl.includes('youtu.be/')) {
        videoId = youtubeUrl.split('youtu.be/')[1].split('?')[0];
      } else if (youtubeUrl.includes('youtube.com/watch?v=')) {
        videoId = youtubeUrl.split('v=')[1].split('&')[0];
      } else if (youtubeUrl.includes('youtube.com/embed/')) {
        videoId = youtubeUrl.split('embed/')[1].split('?')[0];
      }

      if (videoId) {
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        const sizeClass = mediaSize === 'small' ? 'arbe-media-small' : 
                         mediaSize === 'large' ? 'arbe-media-large' : 'arbe-media-medium';
        const alignClass = `arbe-align-${mediaAlign}`;
        
        // Insert as clickable thumbnail
        const thumbnailHtml = `<a href="${youtubeUrl}" target="_blank" class="arbe-youtube-thumbnail ${alignClass}"><img src="${thumbnailUrl}" alt="YouTube Video Thumbnail" class="arbe-image ${sizeClass} ${alignClass}" style="cursor: pointer; border: 2px solid #ff0000; border-radius: 8px;"/></a>`;
        editor.chain().focus().insertContent(thumbnailHtml).run();
        
        setYoutubeUrl('');
        setStatus('YouTube thumbnail inserted successfully!');
        setTimeout(() => setStatus(''), 3000);
      }
    }
  };

  const exportHTML = () => {
    const html = editor.getHTML();
    navigator.clipboard.writeText(html).then(() => {
      setStatus('HTML copied to clipboard!');
      setTimeout(() => setStatus(''), 3000);
    });
  };

  const handleSave = async () => {
    const html = editor.getHTML();
    
    if (onSave) {
      try {
        await onSave(html);
        setStatus('Saved successfully!');
      } catch (error) {
        setStatus('Save failed: ' + error.message);
      }
    } else {
      setStatus('Content saved!');
    }
    
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="arbe-container">
      <style>
        {`
          .arbe-container {
            max-width: 100%;
            margin: 0 auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          
          .arbe-layout {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            min-height: 600px;
          }
          
          .arbe-editor-panel {
            display: flex;
            flex-direction: column;
          }
          
          .arbe-preview-panel {
            display: flex;
            flex-direction: column;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background: white;
          }
          
          .arbe-preview-header {
            background: #f8fafc;
            padding: 12px 16px;
            border-bottom: 1px solid #e2e8f0;
            border-radius: 8px 8px 0 0;
            display: flex;
            align-items: center;
            justify-content: between;
            gap: 8px;
          }
          
          .arbe-preview-content {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            background: white;
          }
          
          .arbe-toolbar {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px 8px 0 0;
            padding: 12px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
            align-items: center;
          }
          
          .arbe-toolbar-group {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }
          
          .arbe-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            background: white;
            cursor: pointer;
            transition: all 0.2s;
            min-width: 36px;
            height: 36px;
            font-size: 12px;
          }
          
          .arbe-btn:hover {
            background: #f3f4f6;
            border-color: #9ca3af;
          }
          
          .arbe-btn.active {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
          }
          
          .arbe-input {
            padding: 6px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            flex: 1;
            min-width: 120px;
          }
          
          .arbe-select {
            padding: 6px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            background: white;
            cursor: pointer;
          }
          
          .arbe-input:focus, .arbe-select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          
          .arbe-editor {
            border: 1px solid #e2e8f0;
            border-top: none;
            border-radius: 0 0 8px 8px;
            min-height: 400px;
            background: white;
            flex: 1;
          }
          
          .arbe-editor .ProseMirror {
            outline: none;
            padding: 16px;
            min-height: 350px;
          }
          
          .arbe-editor .ProseMirror h2 {
            font-size: 1.5em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
            color: #1f2937;
          }
          
          .arbe-editor .ProseMirror h3 {
            font-size: 1.25em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
            color: #374151;
          }
          
          .arbe-editor .ProseMirror p {
            margin: 0.75em 0;
            line-height: 1.6;
          }
          
          .arbe-editor .ProseMirror a {
            color: #3b82f6;
            text-decoration: underline;
          }
          
          /* Media Positioning Classes */
          .arbe-align-left {
            float: left;
            margin: 0 16px 16px 0;
            clear: left;
          }
          
          .arbe-align-right {
            float: right;
            margin: 0 0 16px 16px;
            clear: right;
          }
          
          .arbe-align-center {
            display: block;
            margin: 16px auto;
            clear: both;
          }
          
          /* Media Size Classes */
          .arbe-media-small {
            max-width: 200px;
          }
          
          .arbe-media-medium {
            max-width: 400px;
          }
          
          .arbe-media-large {
            max-width: 600px;
          }
          
          .arbe-image, .arbe-video {
            height: auto;
            border-radius: 8px;
            transition: all 0.2s;
          }
          
          .arbe-image:hover, .arbe-video:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          .arbe-youtube {
            border-radius: 8px;
          }
          
          .arbe-youtube-thumbnail {
            display: inline-block;
            position: relative;
          }
          
          .arbe-youtube-thumbnail:after {
            content: '▶';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.8);
            color: white;
            width: 60px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            font-size: 18px;
            pointer-events: none;
          }
          
          .arbe-preview-content h2 {
            font-size: 1.5em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
            color: #1f2937;
          }
          
          .arbe-preview-content h3 {
            font-size: 1.25em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
            color: #374151;
          }
          
          .arbe-preview-content p {
            margin: 0.75em 0;
            line-height: 1.6;
          }
          
          .arbe-preview-content a {
            color: #3b82f6;
            text-decoration: underline;
          }
          
          .arbe-preview-content .arbe-align-left {
            float: left;
            margin: 0 16px 16px 0;
            clear: left;
          }
          
          .arbe-preview-content .arbe-align-right {
            float: right;
            margin: 0 0 16px 16px;
            clear: right;
          }
          
          .arbe-preview-content .arbe-align-center {
            display: block;
            margin: 16px auto;
            clear: both;
          }
          
          .arbe-preview-content .arbe-media-small {
            max-width: 200px;
          }
          
          .arbe-preview-content .arbe-media-medium {
            max-width: 400px;
          }
          
          .arbe-preview-content .arbe-media-large {
            max-width: 600px;
          }
          
          .arbe-preview-content img, .arbe-preview-content video {
            height: auto;
            border-radius: 8px;
          }
          
          .arbe-preview-content audio {
            width: 100%;
            margin: 1em 0;
          }
          
          .arbe-preview-content iframe {
            border-radius: 8px;
          }
          
          .arbe-status {
            padding: 8px 12px;
            margin-top: 8px;
            border-radius: 6px;
            font-size: 14px;
            text-align: center;
          }
          
          .arbe-status.success {
            background: #dcfce7;
            color: #166534;
            border: 1px solid #bbf7d0;
          }
          
          .arbe-status.error {
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
          }
          
          .arbe-color-input {
            width: 36px;
            height: 36px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            cursor: pointer;
            background: none;
            padding: 0;
          }
          
          .arbe-file-input {
            display: none;
          }
          
          .arbe-toggle-btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          
          .arbe-toggle-btn:hover {
            background: #2563eb;
          }
          
          @media (max-width: 768px) {
            .arbe-layout {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      {/* Configuration Status */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Advanced Editor with Inline Media Positioning</span>
          <div className="flex gap-4">
            <span className={`px-2 py-1 rounded ${CLOUDINARY_CLOUD ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              Cloudinary: {CLOUDINARY_CLOUD ? 'Configured' : 'Not configured'}
            </span>
            <span className="px-2 py-1 rounded bg-green-100 text-green-700">
              Layout Tools: Active
            </span>
          </div>
        </div>
      </div>

      <div className="arbe-layout">
        {/* Editor Panel */}
        <div className="arbe-editor-panel">
          {/* Toolbar */}
          <div className="arbe-toolbar">
            {/* Typography Controls */}
            <div className="arbe-toolbar-group">
              <button
                onClick={() => setHeading(2)}
                className={`arbe-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
                title="Heading 2"
              >
                H2
              </button>
              <button
                onClick={() => setHeading(3)}
                className={`arbe-btn ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
                title="Heading 3"
              >
                H3
              </button>
              <button
                onClick={toggleBold}
                className={`arbe-btn ${editor.isActive('bold') ? 'active' : ''}`}
                title="Bold"
              >
                <Bold size={16} />
              </button>
              <button
                onClick={toggleItalic}
                className={`arbe-btn ${editor.isActive('italic') ? 'active' : ''}`}
                title="Italic"
              >
                <Italic size={16} />
              </button>
              <button
                onClick={toggleUnderline}
                className={`arbe-btn ${editor.isActive('underline') ? 'active' : ''}`}
                title="Underline"
              >
                <Underline size={16} />
              </button>
            </div>

            {/* Text Alignment */}
            <div className="arbe-toolbar-group">
              <button
                onClick={() => setAlignment('left')}
                className={`arbe-btn ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
                title="Align Left"
              >
                <AlignLeft size={16} />
              </button>
              <button
                onClick={() => setAlignment('center')}
                className={`arbe-btn ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
                title="Align Center"
              >
                <AlignCenter size={16} />
              </button>
              <button
                onClick={() => setAlignment('right')}
                className={`arbe-btn ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
                title="Align Right"
              >
                <AlignRight size={16} />
              </button>
            </div>

            {/* Color Controls */}
            <div className="arbe-toolbar-group">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="arbe-color-input"
                title="Text color"
              />
              <button onClick={setColor} className="arbe-btn" title="Apply color">
                <Palette size={16} />
              </button>
              <button onClick={clearColor} className="arbe-btn" title="Clear color">
                Clear
              </button>
            </div>

            {/* Link Controls */}
            <div className="arbe-toolbar-group">
              <input
                type="url"
                placeholder="https:// Add link…"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="arbe-input"
              />
              <button onClick={addLink} className="arbe-btn" title="Add Link">
                <LinkIcon size={16} />
              </button>
              <button onClick={removeLink} className="arbe-btn" title="Remove Link">
                <X size={16} />
              </button>
            </div>

            {/* Media Positioning Controls */}
            <div className="arbe-toolbar-group">
              <select
                value={mediaSize}
                onChange={(e) => setMediaSize(e.target.value)}
                className="arbe-select"
                title="Media Size"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
              <select
                value={mediaAlign}
                onChange={(e) => setMediaAlign(e.target.value)}
                className="arbe-select"
                title="Media Position"
              >
                <option value="left">Float Left</option>
                <option value="center">Center</option>
                <option value="right">Float Right</option>
              </select>
            </div>

            {/* YouTube Controls */}
            <div className="arbe-toolbar-group">
              <input
                type="url"
                placeholder="YouTube URL…"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="arbe-input"
              />
              <button onClick={embedYouTube} className="arbe-btn" title="Embed Full Video">
                <Film size={16} />
              </button>
              <button onClick={insertThumbnailYouTube} className="arbe-btn" title="Insert Thumbnail">
                <ImageIcon size={16} />
              </button>
            </div>

            {/* File Upload */}
            <div className="arbe-toolbar-group">
              <input
                type="text"
                placeholder="Caption (optional)"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="arbe-input"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,audio/*"
                onChange={handleFileUpload}
                className="arbe-file-input"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="arbe-btn"
                title="Upload Media"
              >
                <Upload size={16} />
              </button>
            </div>

            {/* Action Controls */}
            <div className="arbe-toolbar-group">
              <button onClick={exportHTML} className="arbe-btn" title="Export HTML">
                <Download size={16} />
              </button>
              <button onClick={handleSave} className="arbe-btn" title="Save">
                <Save size={16} />
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="arbe-editor">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="arbe-preview-panel">
          <div className="arbe-preview-header">
            <Eye size={16} />
            <span className="font-medium">Live Preview with Layout</span>
            <div className="flex-1"></div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="arbe-toggle-btn"
            >
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
          </div>
          {showPreview && (
            <div 
              className="arbe-preview-content"
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          )}
        </div>
      </div>

      {/* Status Messages */}
      {status && (
        <div className={`arbe-status ${status.includes('failed') || status.includes('error') ? 'error' : 'success'}`}>
          {status}
        </div>
      )}
    </div>
  );
};

export default AdvancedRichBlogEditor;
