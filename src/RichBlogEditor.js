import React, { useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Heading from '@tiptap/extension-heading';
import { 
  Bold, Italic, Underline, Type, Link as LinkIcon, 
  Upload, Download, Save, Palette, X, Film, Music, Image 
} from 'lucide-react';

const RichBlogEditor = ({ 
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
    ],
    content: initialHTML,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
  });

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
        const embedHtml = `<iframe src="https://www.youtube.com/embed/${videoId}" allowfullscreen loading="lazy" style="width:100%;aspect-ratio:16/9;border:0"></iframe>`;
        editor.chain().focus().insertContent(embedHtml).run();
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
          const mediaType = file.type.startsWith('audio') ? 'audio' : 
                           file.type.startsWith('video') ? 'video' : 'image';
          
          let mediaHtml = '';
          
          if (mediaType === 'image') {
            mediaHtml = caption ? 
              `<figure><img src="${data.secure_url}" alt=""><figcaption>${caption}</figcaption></figure>` :
              `<img src="${data.secure_url}" alt="">`;
          } else if (mediaType === 'video') {
            mediaHtml = `<video src="${data.secure_url}" controls style="width:100%"></video>`;
          } else if (mediaType === 'audio') {
            mediaHtml = `<audio src="${data.secure_url}" controls style="width:100%"></audio>`;
          }

          editor.chain().focus().insertContent(mediaHtml).run();
          setCaption('');
          setStatus('File uploaded successfully!');
        } else {
          throw new Error(data.error?.message || 'Upload failed');
        }
      } else {
        // Demo mode - use local URL
        const localUrl = URL.createObjectURL(file);
        const mediaType = file.type.startsWith('audio') ? 'audio' : 
                         file.type.startsWith('video') ? 'video' : 'image';
        
        let mediaHtml = '';
        
        if (mediaType === 'image') {
          mediaHtml = caption ? 
            `<figure><img src="${localUrl}" alt=""><figcaption>${caption}</figcaption></figure>` :
            `<img src="${localUrl}" alt="">`;
        } else if (mediaType === 'video') {
          mediaHtml = `<video src="${localUrl}" controls style="width:100%"></video>`;
        } else if (mediaType === 'audio') {
          mediaHtml = `<audio src="${localUrl}" controls style="width:100%"></audio>`;
        }

        editor.chain().focus().insertContent(mediaHtml).run();
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
      // Default save behavior - just show success
      setStatus('Content saved!');
    }
    
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="rbe-container">
      <style>
        {`
          .rbe-container {
            max-width: 100%;
            margin: 0 auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          
          .rbe-toolbar {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px 8px 0 0;
            padding: 12px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
            align-items: center;
          }
          
          .rbe-toolbar-group {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }
          
          .rbe-btn {
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
          }
          
          .rbe-btn:hover {
            background: #f3f4f6;
            border-color: #9ca3af;
          }
          
          .rbe-btn.active {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
          }
          
          .rbe-input {
            padding: 6px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            flex: 1;
            min-width: 120px;
          }
          
          .rbe-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          
          .rbe-editor {
            border: 1px solid #e2e8f0;
            border-top: none;
            border-radius: 0 0 8px 8px;
            min-height: 400px;
            background: white;
          }
          
          .rbe-editor .ProseMirror {
            outline: none;
            padding: 16px;
            min-height: 350px;
          }
          
          .rbe-editor .ProseMirror h2 {
            font-size: 1.5em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
            color: #1f2937;
          }
          
          .rbe-editor .ProseMirror h3 {
            font-size: 1.25em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
            color: #374151;
          }
          
          .rbe-editor .ProseMirror p {
            margin: 0.75em 0;
            line-height: 1.6;
          }
          
          .rbe-editor .ProseMirror a {
            color: #3b82f6;
            text-decoration: underline;
          }
          
          .rbe-editor .ProseMirror figure {
            margin: 1.5em 0;
          }
          
          .rbe-editor .ProseMirror figcaption {
            font-size: 0.875em;
            color: #6b7280;
            text-align: center;
            margin-top: 0.5em;
            font-style: italic;
          }
          
          .rbe-editor .ProseMirror img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
          }
          
          .rbe-editor .ProseMirror iframe {
            border-radius: 8px;
          }
          
          .rbe-status {
            padding: 8px 12px;
            margin-top: 8px;
            border-radius: 6px;
            font-size: 14px;
            text-align: center;
          }
          
          .rbe-status.success {
            background: #dcfce7;
            color: #166534;
            border: 1px solid #bbf7d0;
          }
          
          .rbe-status.error {
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
          }
          
          .rbe-color-input {
            width: 36px;
            height: 36px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            cursor: pointer;
            background: none;
            padding: 0;
          }
          
          .rbe-file-input {
            display: none;
          }
        `}
      </style>

      {/* Configuration Status */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Configuration Status</span>
          <div className="flex gap-4">
            <span className={`px-2 py-1 rounded ${CLOUDINARY_CLOUD ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              Cloudinary: {CLOUDINARY_CLOUD ? 'Configured' : 'Not configured'}
            </span>
            <span className="px-2 py-1 rounded bg-green-100 text-green-700">
              Demo Mode: Active
            </span>
          </div>
        </div>
        {!CLOUDINARY_CLOUD && (
          <p className="text-xs text-gray-600 mt-1">
            Set environment variables to enable cloud features. See documentation below.
          </p>
        )}
      </div>

      {/* Toolbar */}
      <div className="rbe-toolbar">
        {/* Typography Controls */}
        <div className="rbe-toolbar-group">
          <button
            onClick={() => setHeading(2)}
            className={`rbe-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => setHeading(3)}
            className={`rbe-btn ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
            title="Heading 3"
          >
            H3
          </button>
          <button
            onClick={toggleBold}
            className={`rbe-btn ${editor.isActive('bold') ? 'active' : ''}`}
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={toggleItalic}
            className={`rbe-btn ${editor.isActive('italic') ? 'active' : ''}`}
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={toggleUnderline}
            className={`rbe-btn ${editor.isActive('underline') ? 'active' : ''}`}
            title="Underline"
          >
            <Underline size={16} />
          </button>
        </div>

        {/* Color Controls */}
        <div className="rbe-toolbar-group">
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="rbe-color-input"
            title="Text color"
          />
          <button onClick={setColor} className="rbe-btn" title="Apply color">
            <Palette size={16} />
          </button>
          <button onClick={clearColor} className="rbe-btn" title="Clear color">
            Clear Color
          </button>
        </div>

        {/* Link Controls */}
        <div className="rbe-toolbar-group">
          <input
            type="url"
            placeholder="https:// Add link…"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="rbe-input"
          />
          <button onClick={addLink} className="rbe-btn" title="Add/Update Link">
            Add/Update Link
          </button>
          <button onClick={removeLink} className="rbe-btn" title="Remove Link">
            Remove Link
          </button>
        </div>

        {/* YouTube Embed */}
        <div className="rbe-toolbar-group">
          <input
            type="url"
            placeholder="YouTube URL…"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="rbe-input"
          />
          <button onClick={embedYouTube} className="rbe-btn" title="Embed YouTube">
            Embed YouTube
          </button>
        </div>

        {/* File Upload */}
        <div className="rbe-toolbar-group">
          <input
            type="text"
            placeholder="Caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="rbe-input"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,audio/*"
            onChange={handleFileUpload}
            className="rbe-file-input"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rbe-btn"
            title="Upload File"
          >
            Upload
          </button>
        </div>

        {/* Actions */}
        <div className="rbe-toolbar-group">
          <button onClick={exportHTML} className="rbe-btn" title="Export HTML">
            Export HTML
          </button>
          <button onClick={handleSave} className="rbe-btn" title="Save">
            Save
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="rbe-editor">
        <EditorContent editor={editor} />
      </div>

      {/* Status Messages */}
      {status && (
        <div className={`rbe-status ${status.includes('failed') || status.includes('Invalid') ? 'error' : 'success'}`}>
          {status}
        </div>
      )}
    </div>
  );
};

export default RichBlogEditor;
