import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Heading from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { 
  Bold, Italic, Underline, Type, Link as LinkIcon, 
  Upload, Download, Save, Palette, X, Film, Music, Image as ImageIcon,
  Eye, Layout, AlignLeft, AlignCenter, AlignRight, Move
} from 'lucide-react';

const EnhancedRichBlogEditor = ({ 
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
          class: 'rbe-image',
        },
      }),
      Youtube.configure({
        controls: false,
        nocookie: true,
        HTMLAttributes: {
          class: 'rbe-youtube',
        },
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
        editor.chain().focus().setYoutubeVideo({
          src: youtubeUrl,
          width: 640,
          height: 480,
        }).run();
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
          if (file.type.startsWith('image')) {
            editor.chain().focus().setImage({ src: data.secure_url, alt: caption || 'Uploaded image' }).run();
          } else if (file.type.startsWith('video')) {
            const videoHtml = `<video src="${data.secure_url}" controls style="width:100%;max-width:640px;border-radius:8px;"></video>`;
            editor.chain().focus().insertContent(videoHtml).run();
          } else if (file.type.startsWith('audio')) {
            const audioHtml = `<audio src="${data.secure_url}" controls style="width:100%;"></audio>`;
            editor.chain().focus().insertContent(audioHtml).run();
          }
          
          setCaption('');
          setStatus('File uploaded successfully!');
        } else {
          throw new Error(data.error?.message || 'Upload failed');
        }
      } else {
        // Demo mode - use local URL
        const localUrl = URL.createObjectURL(file);
        
        if (file.type.startsWith('image')) {
          editor.chain().focus().setImage({ src: localUrl, alt: caption || 'Uploaded image' }).run();
        } else if (file.type.startsWith('video')) {
          const videoHtml = `<video src="${localUrl}" controls style="width:100%;max-width:640px;border-radius:8px;"></video>`;
          editor.chain().focus().insertContent(videoHtml).run();
        } else if (file.type.startsWith('audio')) {
          const audioHtml = `<audio src="${localUrl}" controls style="width:100%;"></audio>`;
          editor.chain().focus().insertContent(audioHtml).run();
        }

        setCaption('');
        setStatus('File added (demo mode - configure Cloudinary for production)');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setStatus(`Upload failed: ${error.message}`);
    }

    setTimeout(() => setStatus(''), 3000);
    event.target.value = '';
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
    <div className="erbe-container">
      <style>
        {`
          .erbe-container {
            max-width: 100%;
            margin: 0 auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          
          .erbe-layout {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            min-height: 600px;
          }
          
          .erbe-editor-panel {
            display: flex;
            flex-direction: column;
          }
          
          .erbe-preview-panel {
            display: flex;
            flex-direction: column;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background: white;
          }
          
          .erbe-preview-header {
            background: #f8fafc;
            padding: 12px 16px;
            border-bottom: 1px solid #e2e8f0;
            border-radius: 8px 8px 0 0;
            display: flex;
            align-items: center;
            justify-content: between;
            gap: 8px;
          }
          
          .erbe-preview-content {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            background: white;
          }
          
          .erbe-toolbar {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px 8px 0 0;
            padding: 12px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
            align-items: center;
          }
          
          .erbe-toolbar-group {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }
          
          .erbe-btn {
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
          
          .erbe-btn:hover {
            background: #f3f4f6;
            border-color: #9ca3af;
          }
          
          .erbe-btn.active {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
          }
          
          .erbe-input {
            padding: 6px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            flex: 1;
            min-width: 120px;
          }
          
          .erbe-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          
          .erbe-editor {
            border: 1px solid #e2e8f0;
            border-top: none;
            border-radius: 0 0 8px 8px;
            min-height: 400px;
            background: white;
            flex: 1;
          }
          
          .erbe-editor .ProseMirror {
            outline: none;
            padding: 16px;
            min-height: 350px;
          }
          
          .erbe-editor .ProseMirror h2 {
            font-size: 1.5em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
            color: #1f2937;
          }
          
          .erbe-editor .ProseMirror h3 {
            font-size: 1.25em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
            color: #374151;
          }
          
          .erbe-editor .ProseMirror p {
            margin: 0.75em 0;
            line-height: 1.6;
          }
          
          .erbe-editor .ProseMirror a {
            color: #3b82f6;
            text-decoration: underline;
          }
          
          .erbe-editor .ProseMirror img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 1em 0;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .erbe-editor .ProseMirror img:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          .erbe-editor .ProseMirror .rbe-youtube {
            border-radius: 8px;
            margin: 1em 0;
          }
          
          .erbe-preview-content h2 {
            font-size: 1.5em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
            color: #1f2937;
          }
          
          .erbe-preview-content h3 {
            font-size: 1.25em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
            color: #374151;
          }
          
          .erbe-preview-content p {
            margin: 0.75em 0;
            line-height: 1.6;
          }
          
          .erbe-preview-content a {
            color: #3b82f6;
            text-decoration: underline;
          }
          
          .erbe-preview-content img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 1em 0;
          }
          
          .erbe-preview-content video {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 1em 0;
          }
          
          .erbe-preview-content audio {
            width: 100%;
            margin: 1em 0;
          }
          
          .erbe-preview-content iframe {
            border-radius: 8px;
            margin: 1em 0;
          }
          
          .erbe-status {
            padding: 8px 12px;
            margin-top: 8px;
            border-radius: 6px;
            font-size: 14px;
            text-align: center;
          }
          
          .erbe-status.success {
            background: #dcfce7;
            color: #166534;
            border: 1px solid #bbf7d0;
          }
          
          .erbe-status.error {
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
          }
          
          .erbe-color-input {
            width: 36px;
            height: 36px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            cursor: pointer;
            background: none;
            padding: 0;
          }
          
          .erbe-file-input {
            display: none;
          }
          
          .erbe-toggle-btn {
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
          
          .erbe-toggle-btn:hover {
            background: #2563eb;
          }
          
          @media (max-width: 768px) {
            .erbe-layout {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      {/* Configuration Status */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Enhanced Editor with Live Preview</span>
          <div className="flex gap-4">
            <span className={`px-2 py-1 rounded ${CLOUDINARY_CLOUD ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              Cloudinary: {CLOUDINARY_CLOUD ? 'Configured' : 'Not configured'}
            </span>
            <span className="px-2 py-1 rounded bg-green-100 text-green-700">
              Live Preview: Active
            </span>
          </div>
        </div>
      </div>

      <div className="erbe-layout">
        {/* Editor Panel */}
        <div className="erbe-editor-panel">
          {/* Toolbar */}
          <div className="erbe-toolbar">
            {/* Typography Controls */}
            <div className="erbe-toolbar-group">
              <button
                onClick={() => setHeading(2)}
                className={`erbe-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
                title="Heading 2"
              >
                H2
              </button>
              <button
                onClick={() => setHeading(3)}
                className={`erbe-btn ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
                title="Heading 3"
              >
                H3
              </button>
              <button
                onClick={toggleBold}
                className={`erbe-btn ${editor.isActive('bold') ? 'active' : ''}`}
                title="Bold"
              >
                <Bold size={16} />
              </button>
              <button
                onClick={toggleItalic}
                className={`erbe-btn ${editor.isActive('italic') ? 'active' : ''}`}
                title="Italic"
              >
                <Italic size={16} />
              </button>
              <button
                onClick={toggleUnderline}
                className={`erbe-btn ${editor.isActive('underline') ? 'active' : ''}`}
                title="Underline"
              >
                <Underline size={16} />
              </button>
            </div>

            {/* Color Controls */}
            <div className="erbe-toolbar-group">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="erbe-color-input"
                title="Text color"
              />
              <button onClick={setColor} className="erbe-btn" title="Apply color">
                <Palette size={16} />
              </button>
              <button onClick={clearColor} className="erbe-btn" title="Clear color">
                Clear
              </button>
            </div>

            {/* Link Controls */}
            <div className="erbe-toolbar-group">
              <input
                type="url"
                placeholder="https:// Add link…"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="erbe-input"
              />
              <button onClick={addLink} className="erbe-btn" title="Add Link">
                <LinkIcon size={16} />
              </button>
              <button onClick={removeLink} className="erbe-btn" title="Remove Link">
                <X size={16} />
              </button>
            </div>

            {/* Media Controls */}
            <div className="erbe-toolbar-group">
              <input
                type="url"
                placeholder="YouTube URL…"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="erbe-input"
              />
              <button onClick={embedYouTube} className="erbe-btn" title="Embed YouTube">
                <Film size={16} />
              </button>
            </div>

            {/* File Upload */}
            <div className="erbe-toolbar-group">
              <input
                type="text"
                placeholder="Caption (optional)"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="erbe-input"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,audio/*"
                onChange={handleFileUpload}
                className="erbe-file-input"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="erbe-btn"
                title="Upload Media"
              >
                <Upload size={16} />
              </button>
            </div>

            {/* Action Controls */}
            <div className="erbe-toolbar-group">
              <button onClick={exportHTML} className="erbe-btn" title="Export HTML">
                <Download size={16} />
              </button>
              <button onClick={handleSave} className="erbe-btn" title="Save">
                <Save size={16} />
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="erbe-editor">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="erbe-preview-panel">
          <div className="erbe-preview-header">
            <Eye size={16} />
            <span className="font-medium">Live Preview</span>
            <div className="flex-1"></div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="erbe-toggle-btn"
            >
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
          </div>
          {showPreview && (
            <div 
              className="erbe-preview-content"
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          )}
        </div>
      </div>

      {/* Status Messages */}
      {status && (
        <div className={`erbe-status ${status.includes('failed') || status.includes('error') ? 'error' : 'success'}`}>
          {status}
        </div>
      )}
    </div>
  );
};

export default EnhancedRichBlogEditor;
