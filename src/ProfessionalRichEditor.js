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

const ProfessionalRichEditor = ({ 
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
  const [fontSize, setFontSize] = useState('16');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [imageSize, setImageSize] = useState('medium');
  const [imagePosition, setImagePosition] = useState('center');
  const fileInputRef = useRef(null);

  // Helper functions for image styling
  const getImageSizeClass = () => {
    switch(imageSize) {
      case 'small': return 'pre-img-small';
      case 'medium': return 'pre-img-medium';
      case 'large': return 'pre-img-large';
      case 'full': return 'pre-img-full';
      default: return 'pre-img-medium';
    }
  };

  const getImagePositionClass = () => {
    switch(imagePosition) {
      case 'left': return 'pre-img-left';
      case 'center': return 'pre-img-center';
      case 'right': return 'pre-img-right';
      default: return 'pre-img-center';
    }
  };

  const getImageStyle = () => {
    const styles = [];
    
    // Size styles
    switch(imageSize) {
      case 'small':
        styles.push('max-width: 200px');
        break;
      case 'medium':
        styles.push('max-width: 400px');
        break;
      case 'large':
        styles.push('max-width: 600px');
        break;
      case 'full':
        styles.push('width: 100%');
        break;
    }
    
    // Position styles
    switch(imagePosition) {
      case 'left':
        styles.push('float: left', 'margin: 0 16px 16px 0');
        break;
      case 'right':
        styles.push('float: right', 'margin: 0 0 16px 16px');
        break;
      case 'center':
        styles.push('display: block', 'margin: 16px auto');
        break;
    }
    
    styles.push('height: auto', 'border-radius: 8px');
    return styles.join('; ');
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable default heading and link from StarterKit to avoid duplicates
        heading: false,
        link: false,
      }),
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
        levels: [1, 2, 3, 4, 5, 6],
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'pre-image',
        },
      }),
      Youtube.configure({
        controls: false,
        nocookie: true,
        HTMLAttributes: {
          class: 'pre-youtube',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: initialHTML,
    editorProps: {
      attributes: {
        class: 'pre-editor-content',
        style: `font-family: ${fontFamily}; font-size: ${fontSize}px;`,
      },
    },
    onUpdate: ({ editor }) => {
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

  // Update editor font styles
  useEffect(() => {
    if (editor) {
      editor.view.dom.style.fontFamily = fontFamily;
      editor.view.dom.style.fontSize = fontSize + 'px';
    }
  }, [editor, fontFamily, fontSize]);

  if (!editor) {
    return <div className="pre-loading">Loading Professional Editor...</div>;
  }

  // Toolbar functions
  const setHeading = (level) => {
    if (level === 0) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level }).run();
    }
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
      setStatus('Link added successfully!');
      setTimeout(() => setStatus(''), 3000);
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
    setStatus('Link removed!');
    setTimeout(() => setStatus(''), 3000);
  };

  const embedYouTube = () => {
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
        editor.chain().focus().setYoutubeVideo({
          src: youtubeUrl,
          width: 640,
          height: 360,
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

    setStatus('Uploading file...');

    try {
      let mediaUrl;
      
      if (CLOUDINARY_CLOUD && CLOUDINARY_PRESET) {
        console.log('Uploading to Cloudinary:', CLOUDINARY_CLOUD, CLOUDINARY_PRESET);
        
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

        console.log('Cloudinary response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Cloudinary error response:', errorText);
          throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Cloudinary response data:', data);

        if (data.secure_url) {
          mediaUrl = data.secure_url;
        } else {
          throw new Error(data.error?.message || 'No secure URL returned from Cloudinary');
        }
      } else {
        // Demo mode - use local URL
        console.log('Using demo mode - creating local URL');
        mediaUrl = URL.createObjectURL(file);
        setStatus('Demo mode: File loaded locally (not uploaded to cloud)');
      }

      if (file.type.startsWith('image')) {
        // Get current image size and position settings
        const sizeClass = getImageSizeClass();
        const positionClass = getImagePositionClass();
        
        editor.chain().focus().setImage({ 
          src: mediaUrl, 
          alt: caption || 'Uploaded image',
          class: `pre-uploaded-image ${sizeClass} ${positionClass}`,
          style: getImageStyle()
        }).run();
      } else if (file.type.startsWith('video')) {
        const videoHtml = `<video src="${mediaUrl}" controls style="max-width: 100%; height: auto;"></video>`;
        editor.chain().focus().insertContent(videoHtml).run();
      } else if (file.type.startsWith('audio')) {
        const audioHtml = `<audio src="${mediaUrl}" controls style="width: 100%;"></audio>`;
        editor.chain().focus().insertContent(audioHtml).run();
      }
      
      setCaption('');
      
      if (CLOUDINARY_CLOUD && CLOUDINARY_PRESET) {
        setStatus('File uploaded to Cloudinary successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setStatus(`Upload failed: ${error.message}`);
    }

    setTimeout(() => setStatus(''), 5000);
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
        setStatus('Post saved successfully!');
      } catch (error) {
        setStatus('Save failed: ' + error.message);
      }
    } else {
      setStatus('Content saved!');
    }
    
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="pre-container">
      <style>
        {`
          .pre-container {
            max-width: 100%;
            margin: 0 auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          
          .pre-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
          }
          
          .pre-header h3 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          
          .pre-header p {
            margin: 8px 0 0 0;
            opacity: 0.9;
            font-size: 14px;
          }
          
          .pre-config-status {
            background: #f8fafc;
            padding: 16px 20px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
          }
          
          .pre-config-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
          }
          
          .pre-config-success {
            background: #dcfce7;
            color: #166534;
          }
          
          .pre-config-warning {
            background: #fef3c7;
            color: #92400e;
          }
          
          .pre-layout {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0;
            min-height: 600px;
          }
          
          .pre-editor-panel {
            display: flex;
            flex-direction: column;
            border-right: 1px solid #e2e8f0;
          }
          
          .pre-preview-panel {
            display: flex;
            flex-direction: column;
            background: #fafafa;
          }
          
          .pre-toolbar {
            background: white;
            border-bottom: 1px solid #e2e8f0;
            padding: 20px;
          }
          
          .pre-toolbar-section {
            margin-bottom: 20px;
          }
          
          .pre-toolbar-section:last-child {
            margin-bottom: 0;
          }
          
          .pre-section-title {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .pre-section-title::before {
            content: '';
            width: 4px;
            height: 16px;
            background: #3b82f6;
            border-radius: 2px;
          }
          
          .pre-toolbar-row {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 12px;
          }
          
          .pre-toolbar-row:last-child {
            margin-bottom: 0;
          }
          
          .pre-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            background: white;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
            font-weight: 500;
            color: #374151;
            min-height: 42px;
            white-space: nowrap;
          }
          
          .pre-btn:hover {
            background: #f3f4f6;
            border-color: #3b82f6;
            color: #3b82f6;
          }
          
          .pre-btn.active {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
          }
          
          .pre-btn-primary {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
          }
          
          .pre-btn-primary:hover {
            background: #2563eb;
            border-color: #2563eb;
          }
          
          .pre-btn-success {
            background: #10b981;
            color: white;
            border-color: #10b981;
          }
          
          .pre-btn-success:hover {
            background: #059669;
            border-color: #059669;
          }
          
          .pre-input {
            padding: 10px 14px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            flex: 1;
            min-width: 200px;
            transition: all 0.2s;
          }
          
          .pre-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          
          .pre-select {
            padding: 10px 14px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            background: white;
            cursor: pointer;
            min-width: 120px;
            transition: all 0.2s;
          }
          
          .pre-select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          
          .pre-color-input {
            width: 42px;
            height: 42px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            cursor: pointer;
            background: none;
            padding: 0;
            transition: all 0.2s;
          }
          
          .pre-color-input:hover {
            border-color: #3b82f6;
          }
          
          .pre-editor {
            flex: 1;
            background: white;
            overflow-y: auto;
          }
          
          .pre-editor-content {
            outline: none;
            padding: 24px;
            min-height: 400px;
            line-height: 1.7;
          }
          
          .pre-editor-content h1 {
            font-size: 2.25em;
            font-weight: bold;
            margin: 1.5em 0 0.75em 0;
            color: #111827;
          }
          
          .pre-editor-content h2 {
            font-size: 1.875em;
            font-weight: bold;
            margin: 1.25em 0 0.625em 0;
            color: #1f2937;
          }
          
          .pre-editor-content h3 {
            font-size: 1.5em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
            color: #374151;
          }
          
          .pre-editor-content h4 {
            font-size: 1.25em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
            color: #4b5563;
          }
          
          .pre-editor-content h5 {
            font-size: 1.125em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
            color: #6b7280;
          }
          
          .pre-editor-content h6 {
            font-size: 1em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
            color: #9ca3af;
          }
          
          .pre-editor-content p {
            margin: 1em 0;
          }
          
          .pre-editor-content a {
            color: #3b82f6;
            text-decoration: underline;
          }
          
          .pre-editor-content ul, .pre-editor-content ol {
            margin: 1em 0;
            padding-left: 2em;
          }
          
          .pre-editor-content li {
            margin: 0.5em 0;
          }
          
          .pre-editor-content img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 1em 0;
          }
          
          /* Image Size Classes */
          .pre-uploaded-image.pre-img-small {
            max-width: 200px !important;
          }
          
          .pre-uploaded-image.pre-img-medium {
            max-width: 400px !important;
          }
          
          .pre-uploaded-image.pre-img-large {
            max-width: 600px !important;
          }
          
          .pre-uploaded-image.pre-img-full {
            width: 100% !important;
            max-width: 100% !important;
          }
          
          /* Image Position Classes */
          .pre-uploaded-image.pre-img-left {
            float: left !important;
            margin: 0 16px 16px 0 !important;
            clear: left;
          }
          
          .pre-uploaded-image.pre-img-right {
            float: right !important;
            margin: 0 0 16px 16px !important;
            clear: right;
          }
          
          .pre-uploaded-image.pre-img-center {
            display: block !important;
            margin: 16px auto !important;
            float: none !important;
          }
          
          /* Responsive breakpoints for Webflow compatibility */
          @media (max-width: 768px) {
            .pre-uploaded-image.pre-img-small {
              max-width: 150px !important;
            }
            
            .pre-uploaded-image.pre-img-medium {
              max-width: 280px !important;
            }
            
            .pre-uploaded-image.pre-img-large {
              max-width: 100% !important;
            }
            
            .pre-uploaded-image.pre-img-left,
            .pre-uploaded-image.pre-img-right {
              float: none !important;
              display: block !important;
              margin: 16px auto !important;
            }
          }
          
          @media (max-width: 480px) {
            .pre-uploaded-image.pre-img-small,
            .pre-uploaded-image.pre-img-medium {
              max-width: 100% !important;
            }
          }
          
          .pre-editor-content iframe {
            max-width: 100%;
            border-radius: 8px;
            margin: 1em 0;
          }
          
          .pre-preview-header {
            background: white;
            padding: 16px 20px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          
          .pre-preview-title {
            font-size: 16px;
            font-weight: 600;
            color: #374151;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .pre-preview-title::before {
            content: '👁';
            font-size: 18px;
          }
          
          .pre-preview-content {
            flex: 1;
            padding: 24px;
            overflow-y: auto;
            background: white;
            margin: 16px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .pre-preview-content h1 {
            font-size: 2.25em;
            font-weight: bold;
            margin: 1.5em 0 0.75em 0;
            color: #111827;
          }
          
          .pre-preview-content h2 {
            font-size: 1.875em;
            font-weight: bold;
            margin: 1.25em 0 0.625em 0;
            color: #1f2937;
          }
          
          .pre-preview-content h3 {
            font-size: 1.5em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
            color: #374151;
          }
          
          .pre-preview-content h4 {
            font-size: 1.25em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
            color: #4b5563;
          }
          
          .pre-preview-content h5 {
            font-size: 1.125em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
            color: #6b7280;
          }
          
          .pre-preview-content h6 {
            font-size: 1em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
            color: #9ca3af;
          }
          
          .pre-preview-content p {
            margin: 1em 0;
            line-height: 1.7;
          }
          
          .pre-preview-content a {
            color: #3b82f6;
            text-decoration: underline;
          }
          
          .pre-preview-content ul, .pre-preview-content ol {
            margin: 1em 0;
            padding-left: 2em;
          }
          
          .pre-preview-content li {
            margin: 0.5em 0;
          }
          
          .pre-preview-content img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 1em 0;
          }
          
          /* Apply same image classes to preview */
          .pre-preview-content .pre-uploaded-image.pre-img-small {
            max-width: 200px !important;
          }
          
          .pre-preview-content .pre-uploaded-image.pre-img-medium {
            max-width: 400px !important;
          }
          
          .pre-preview-content .pre-uploaded-image.pre-img-large {
            max-width: 600px !important;
          }
          
          .pre-preview-content .pre-uploaded-image.pre-img-full {
            width: 100% !important;
            max-width: 100% !important;
          }
          
          .pre-preview-content .pre-uploaded-image.pre-img-left {
            float: left !important;
            margin: 0 16px 16px 0 !important;
            clear: left;
          }
          
          .pre-preview-content .pre-uploaded-image.pre-img-right {
            float: right !important;
            margin: 0 0 16px 16px !important;
            clear: right;
          }
          
          .pre-preview-content .pre-uploaded-image.pre-img-center {
            display: block !important;
            margin: 16px auto !important;
            float: none !important;
          }
          
          .pre-preview-content iframe {
            max-width: 100%;
            border-radius: 8px;
            margin: 1em 0;
          }
          
          .pre-status {
            padding: 12px 20px;
            margin: 16px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            text-align: center;
            animation: slideIn 0.3s ease-out;
          }
          
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .pre-status.success {
            background: #dcfce7;
            color: #166534;
            border: 2px solid #bbf7d0;
          }
          
          .pre-status.error {
            background: #fef2f2;
            color: #dc2626;
            border: 2px solid #fecaca;
          }
          
          .pre-file-input {
            display: none;
          }
          
          .pre-loading {
            padding: 40px;
            text-align: center;
            font-size: 18px;
            color: #6b7280;
          }
          
          @media (max-width: 768px) {
            .pre-layout {
              grid-template-columns: 1fr;
            }
            
            .pre-toolbar-row {
              flex-direction: column;
              align-items: stretch;
            }
            
            .pre-btn {
              justify-content: center;
            }
          }
        `}
      </style>

      {/* Header */}
      <div className="pre-header">
        <h3>Professional Rich Text Editor</h3>
        <p>Create beautiful, professional blog posts with advanced formatting and media</p>
      </div>

      {/* Configuration Status */}
      <div className="pre-config-status">
        <div className="pre-config-item pre-config-success">
          ✅ Professional Editor Active
        </div>
        <div className={`pre-config-item ${CLOUDINARY_CLOUD ? 'pre-config-success' : 'pre-config-warning'}`}>
          {CLOUDINARY_CLOUD ? '✅ Cloudinary Configured' : '⚠️ Cloudinary Not Configured'}
        </div>
        <div className="pre-config-item pre-config-success">
          ✅ Live Preview Active
        </div>
      </div>

      <div className="pre-layout">
        {/* Editor Panel */}
        <div className="pre-editor-panel">
          {/* Toolbar */}
          <div className="pre-toolbar">
            {/* Text Formatting Section */}
            <div className="pre-toolbar-section">
              <div className="pre-section-title">Text Formatting</div>
              
              <div className="pre-toolbar-row">
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="pre-select"
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Courier New">Courier New</option>
                </select>
                
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="pre-select"
                >
                  <option value="12">12px</option>
                  <option value="14">14px</option>
                  <option value="16">16px</option>
                  <option value="18">18px</option>
                  <option value="20">20px</option>
                  <option value="24">24px</option>
                  <option value="28">28px</option>
                  <option value="32">32px</option>
                </select>
              </div>

              <div className="pre-toolbar-row">
                <button
                  onClick={toggleBold}
                  className={`pre-btn ${editor.isActive('bold') ? 'active' : ''}`}
                >
                  Bold Text
                </button>
                <button
                  onClick={toggleItalic}
                  className={`pre-btn ${editor.isActive('italic') ? 'active' : ''}`}
                >
                  Italic Text
                </button>
                <button
                  onClick={toggleUnderline}
                  className={`pre-btn ${editor.isActive('underline') ? 'active' : ''}`}
                >
                  Underline Text
                </button>
              </div>

              <div className="pre-toolbar-row">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="pre-color-input"
                  title="Choose text color"
                />
                <button onClick={setColor} className="pre-btn">
                  Apply Color
                </button>
                <button onClick={clearColor} className="pre-btn">
                  Clear Color
                </button>
              </div>
            </div>

            {/* Headings Section */}
            <div className="pre-toolbar-section">
              <div className="pre-section-title">Headings & Structure</div>
              
              <div className="pre-toolbar-row">
                <button
                  onClick={() => setHeading(0)}
                  className={`pre-btn ${!editor.isActive('heading') ? 'active' : ''}`}
                >
                  Normal Text
                </button>
                <button
                  onClick={() => setHeading(1)}
                  className={`pre-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
                >
                  Heading 1
                </button>
                <button
                  onClick={() => setHeading(2)}
                  className={`pre-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
                >
                  Heading 2
                </button>
                <button
                  onClick={() => setHeading(3)}
                  className={`pre-btn ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
                >
                  Heading 3
                </button>
              </div>
            </div>

            {/* Alignment Section */}
            <div className="pre-toolbar-section">
              <div className="pre-section-title">Text Alignment</div>
              
              <div className="pre-toolbar-row">
                <button
                  onClick={() => setAlignment('left')}
                  className={`pre-btn ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
                >
                  Align Left
                </button>
                <button
                  onClick={() => setAlignment('center')}
                  className={`pre-btn ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
                >
                  Align Center
                </button>
                <button
                  onClick={() => setAlignment('right')}
                  className={`pre-btn ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
                >
                  Align Right
                </button>
              </div>
            </div>

            {/* Links Section */}
            <div className="pre-toolbar-section">
              <div className="pre-section-title">Links</div>
              
              <div className="pre-toolbar-row">
                <input
                  type="url"
                  placeholder="Enter link URL (https://...)"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="pre-input"
                />
                <button onClick={addLink} className="pre-btn pre-btn-primary">
                  Add Link
                </button>
                <button onClick={removeLink} className="pre-btn">
                  Remove Link
                </button>
              </div>
            </div>

            {/* Media Section */}
            <div className="pre-toolbar-section">
              <div className="pre-section-title">Media & Files</div>
              
              <div className="pre-toolbar-row">
                <input
                  type="url"
                  placeholder="YouTube URL (https://youtu.be/...)"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="pre-input"
                />
                <button onClick={embedYouTube} className="pre-btn pre-btn-primary">
                  Embed YouTube Video
                </button>
              </div>

              <div className="pre-toolbar-row">
                <select
                  value={imageSize}
                  onChange={(e) => setImageSize(e.target.value)}
                  className="pre-select"
                  title="Image size for uploads"
                >
                  <option value="small">Small (200px)</option>
                  <option value="medium">Medium (400px)</option>
                  <option value="large">Large (600px)</option>
                  <option value="full">Full Width</option>
                </select>
                
                <select
                  value={imagePosition}
                  onChange={(e) => setImagePosition(e.target.value)}
                  className="pre-select"
                  title="Image position for uploads"
                >
                  <option value="left">Float Left</option>
                  <option value="center">Center</option>
                  <option value="right">Float Right</option>
                </select>
              </div>

              <div className="pre-toolbar-row">
                <input
                  type="text"
                  placeholder="Image caption (optional)"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="pre-input"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,audio/*"
                  onChange={handleFileUpload}
                  className="pre-file-input"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="pre-btn pre-btn-primary"
                >
                  Upload Image
                </button>
              </div>
            </div>

            {/* Actions Section */}
            <div className="pre-toolbar-section">
              <div className="pre-section-title">Actions</div>
              
              <div className="pre-toolbar-row">
                <button onClick={exportHTML} className="pre-btn">
                  Export HTML
                </button>
                <button onClick={handleSave} className="pre-btn pre-btn-success">
                  Save Post
                </button>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="pre-editor">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="pre-preview-panel">
          <div className="pre-preview-header">
            <div className="pre-preview-title">Live Preview</div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="pre-btn"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
          {showPreview && (
            <div 
              className="pre-preview-content"
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          )}
        </div>
      </div>

      {/* Status Messages */}
      {status && (
        <div className={`pre-status ${status.includes('failed') || status.includes('error') ? 'error' : 'success'}`}>
          {status}
        </div>
      )}
    </div>
  );
};

export default ProfessionalRichEditor;
