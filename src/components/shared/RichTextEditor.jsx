// Rich Text Editor Component for News Feed
// Supports: Text formatting, links, images, videos (YouTube/Vimeo), and more

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, Link as LinkIcon, Image as ImageIcon,
  Video, List, ListOrdered, Quote, Code, AlignLeft,
  AlignCenter, AlignRight, X, Check, Youtube, Film, Type, Palette, Music
} from 'lucide-react';

const RichTextEditor = forwardRef(({ value, onChange, placeholder = "What's on your mind?" }, ref) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [selectedFontFamily, setSelectedFontFamily] = useState('');
  const [selectedFontSize, setSelectedFontSize] = useState('');
  const [selectedTextColor, setSelectedTextColor] = useState('#000000');
  const [selectedBgColor, setSelectedBgColor] = useState('#ffffff');
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [imageUploadMode, setImageUploadMode] = useState('url');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const throttleFrameRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  useEffect(() => {
    window.selectImage = (imageId) => selectImageInternal(imageId);
    window.resizeImage = (imageId, size) => resizeImageInternal(imageId, size);
    window.positionImage = (imageId, position) => positionImageInternal(imageId, position);
    window.deleteImage = (imageId) => deleteImageInternal(imageId);
    window.clearImageSelection = () => clearImageSelectionInternal();
    window.selectMedia = (mediaId) => selectMediaInternal(mediaId);
    window.resizeMedia = (mediaId, size) => resizeMediaInternal(mediaId, size);
    window.positionMedia = (mediaId, position) => positionMediaInternal(mediaId, position);
    window.deleteMedia = (mediaId) => deleteMediaInternal(mediaId);
    window.clearMediaSelection = () => clearMediaSelectionInternal();

    return () => {
      delete window.selectImage;
      delete window.resizeImage;
      delete window.positionImage;
      delete window.deleteImage;
      delete window.clearImageSelection;
      delete window.selectMedia;
      delete window.resizeMedia;
      delete window.positionMedia;
      delete window.deleteMedia;
      delete window.clearMediaSelection;
    };
  }, []);

  // Handle content changes with throttling
  const handleInput = () => {
    if (editorRef.current) {
      if (throttleFrameRef.current) {
        cancelAnimationFrame(throttleFrameRef.current);
      }
      throttleFrameRef.current = requestAnimationFrame(() => {
        onChange(editorRef.current.innerHTML);
        throttleFrameRef.current = null;
      });
    }
  };

  // Execute formatting command
  const execCommand = (command, value = null) => {
    if (editorRef.current) {
      // Ensure the editor is focused
      editorRef.current.focus();
      
      // For format commands, ensure there's a selection or content
      const selection = window.getSelection();
      if (!selection.rangeCount) {
        // Create a range at the end of the content
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      // Execute the command
      const success = document.execCommand(command, false, value);
      console.log(`execCommand(${command}, ${value}):`, success);
      
      // Update the content
      handleInput();
    }
  };

  // Handle font family change
  const handleFontFamilyChange = (e) => {
    const fontFamily = e.target.value;
    setSelectedFontFamily(fontFamily);
    if (fontFamily) {
      execCommand('fontName', fontFamily);
    }
  };

  // Handle font size change
  const handleFontSizeChange = (e) => {
    const fontSize = e.target.value;
    setSelectedFontSize(fontSize);
    if (fontSize) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontSize = fontSize;
        range.surroundContents(span);
        handleInput();
      }
    }
  };

  // Handle text color change
  const handleTextColorChange = (color) => {
    setSelectedTextColor(color);
    execCommand('foreColor', color);
    setShowTextColorPicker(false);
  };

  // Handle background color change
  const handleBgColorChange = (color) => {
    setSelectedBgColor(color);
    execCommand('backColor', color);
    setShowBgColorPicker(false);
  };

  const fontFamilies = [
    { value: '', label: 'Default Font' },
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Courier New, monospace', label: 'Courier New' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' },
    { value: 'Comic Sans MS, cursive', label: 'Comic Sans MS' },
    { value: 'Impact, sans-serif', label: 'Impact' },
    { value: 'Palatino, serif', label: 'Palatino' },
    { value: 'Garamond, serif', label: 'Garamond' },
  ];

  const fontSizes = [
    { value: '', label: 'Default Size' },
    { value: '8px', label: '8px' },
    { value: '10px', label: '10px' },
    { value: '12px', label: '12px' },
    { value: '14px', label: '14px' },
    { value: '16px', label: '16px' },
    { value: '18px', label: '18px' },
    { value: '20px', label: '20px' },
    { value: '24px', label: '24px' },
    { value: '28px', label: '28px' },
    { value: '32px', label: '32px' },
    { value: '36px', label: '36px' },
    { value: '48px', label: '48px' },
    { value: '60px', label: '60px' },
    { value: '72px', label: '72px' },
  ];

  const commonColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#008000', '#800000', '#808080', '#C0C0C0', '#FFD700',
  ];

  const ensureFocusAndSelection = () => {
    if (!editorRef.current) return false;
    
    // Ensure the editor is focused
    editorRef.current.focus();
    
    // Ensure there's a selection
    const selection = window.getSelection();
    if (!selection.rangeCount) {
      // Create a range at the end of the content
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    return true;
  };

  useImperativeHandle(ref, () => ({
    openLinkModal: () => setShowLinkModal(true),
    openImageModal: () => setShowImageModal(true),
    openVideoModal: () => setShowVideoModal(true),
  }));

  // Insert link
  const insertLink = () => {
    if (!linkUrl) return;
    
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    const text = linkText || url;
    
    const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${text}</a>`;
    
    // Ensure focus and selection before insert
    if (ensureFocusAndSelection()) {
      const success = document.execCommand('insertHTML', false, linkHtml);
      console.log('insertLink success:', success);
    }
    
    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
    handleInput();
  };

  // Handle file upload to Cloudinary
  const handleImageFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append(
        'upload_preset',
        process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'demo-preset'
      );
      const cloudName =
        process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'demo-cloud-name';
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      const data = await response.json();
      
      // Insert the uploaded image
      const imageId = Date.now();
      const imageHtml = `<img id="img-${imageId}" src="${data.secure_url}" alt="${file.name}" class="size-medium position-center" data-size="medium" data-position="center" style="cursor: pointer;" onclick="window.selectImage('${imageId}')" />`;
      
      // Ensure focus and selection before insert
      if (ensureFocusAndSelection()) {
        const success = document.execCommand('insertHTML', false, imageHtml);
        console.log('insertImage from upload success:', success);
      }
      
      setShowImageModal(false);
      setImageUrl('');
      setImageUploadMode('url');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      handleInput();
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Insert image with controls (from URL)
  const insertImage = () => {
    if (!imageUrl) return;
    
    const url = imageUrl.startsWith('http') ? imageUrl : `https://${imageUrl}`;
    const imageId = Date.now();
    const imageHtml = `<img id="img-${imageId}" src="${url}" alt="Uploaded image" class="size-medium position-center" data-size="medium" data-position="center" style="cursor: pointer;" onclick="window.selectImage('${imageId}')" />`;
    
    // Ensure focus and selection before insert
    if (ensureFocusAndSelection()) {
      const success = document.execCommand('insertHTML', false, imageHtml);
      console.log('insertImage success:', success);
    }
    
    setShowImageModal(false);
    setImageUrl('');
    setImageUploadMode('url');
    handleInput();
  };

  // Extract video ID from YouTube/Vimeo URL
  const extractVideoId = (url) => {
    // YouTube patterns
    const youtubePatterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of youtubePatterns) {
      const match = url.match(pattern);
      if (match) return { type: 'youtube', id: match[1] };
    }
    
    // Vimeo pattern
    const vimeoPattern = /vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoPattern);
    if (vimeoMatch) return { type: 'vimeo', id: vimeoMatch[1] };
    
    return null;
  };

  // Insert video embed
  const insertVideo = () => {
    if (!videoUrl) return;
    
    const videoInfo = extractVideoId(videoUrl);
    if (!videoInfo) {
      alert('Please enter a valid YouTube or Vimeo URL');
      return;
    }
    
    const mediaId = Date.now();
    let embedHtml = '';
    if (videoInfo.type === 'youtube') {
      embedHtml = `
        <div id="media-${mediaId}" class="media-wrapper size-medium position-center" data-size="medium" data-position="center" data-media-type="video" style="cursor: pointer; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;" onclick="window.selectMedia('${mediaId}')">
          <iframe 
            src="https://www.youtube.com/embed/${videoInfo.id}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            class="absolute top-0 left-0 w-full h-full rounded-lg shadow-md"
            style="pointer-events: none;"
          ></iframe>
        </div>
      `;
    } else if (videoInfo.type === 'vimeo') {
      embedHtml = `
        <div id="media-${mediaId}" class="media-wrapper size-medium position-center" data-size="medium" data-position="center" data-media-type="video" style="cursor: pointer; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;" onclick="window.selectMedia('${mediaId}')">
          <iframe 
            src="https://player.vimeo.com/video/${videoInfo.id}" 
            frameborder="0" 
            allow="autoplay; fullscreen; picture-in-picture" 
            allowfullscreen
            class="absolute top-0 left-0 w-full h-full rounded-lg shadow-md"
            style="pointer-events: none;"
          ></iframe>
        </div>
      `;
    }
    
    // Ensure focus and selection before insert
    if (ensureFocusAndSelection()) {
      const success = document.execCommand('insertHTML', false, embedHtml);
      console.log('insertVideo success:', success);
    }
    
    setShowVideoModal(false);
    setVideoUrl('');
    handleInput();
  };

  // Insert audio embed
  const insertAudio = () => {
    if (!audioUrl) return;
    
    const url = audioUrl.startsWith('http') ? audioUrl : `https://${audioUrl}`;
    const audioHtml = `
      <div class="my-4">
        <audio controls class="w-full rounded-lg shadow-md" style="max-width: 100%;">
          <source src="${url}" type="audio/mpeg">
          <source src="${url}" type="audio/ogg">
          <source src="${url}" type="audio/wav">
          Your browser does not support the audio element.
        </audio>
      </div>
    `;
    
    // Ensure focus and selection before insert
    if (ensureFocusAndSelection()) {
      const success = document.execCommand('insertHTML', false, audioHtml);
      console.log('insertAudio success:', success);
    }
    
    setShowAudioModal(false);
    setAudioUrl('');
    handleInput();
  };

  const selectMediaInternal = (mediaId) => {
    setSelectedImageId(mediaId);
    document.querySelectorAll('.selected-image').forEach((el) => el.classList.remove('selected-image'));
    document.querySelectorAll('.resize-handle').forEach((el) => el.remove());
    document.querySelectorAll('.floating-toolbar').forEach((el) => el.remove());
    
    const img = document.getElementById(`img-${mediaId}`);
    const media = document.getElementById(`media-${mediaId}`);
    const element = img || media;
    
    if (!element) return;
    element.classList.add('selected-image');
    
    const updatePositions = (toolbar, handles) => {
      const rect = element.getBoundingClientRect();
      if (toolbar) {
        toolbar.style.top = `${rect.top - 50}px`;
        toolbar.style.left = `${rect.left}px`;
      }
      if (handles) {
        handles.forEach(({ pos, el }) => {
          if (pos.includes('n')) el.style.top = `${rect.top - 6}px`;
          if (pos.includes('s')) el.style.top = `${rect.bottom - 6}px`;
          if (pos.includes('w')) el.style.left = `${rect.left - 6}px`;
          if (pos.includes('e')) el.style.left = `${rect.right - 6}px`;
        });
      }
    };
    
    const toolbar = document.createElement('div');
    toolbar.className = 'floating-toolbar';
    toolbar.innerHTML = `
      <button onclick="window.resizeMedia('${mediaId}', 'small')" class="toolbar-btn">Small</button>
      <button onclick="window.resizeMedia('${mediaId}', 'medium')" class="toolbar-btn">Medium</button>
      <button onclick="window.resizeMedia('${mediaId}', 'large')" class="toolbar-btn">Large</button>
      <button onclick="window.resizeMedia('${mediaId}', 'full')" class="toolbar-btn">Full</button>
      <span class="toolbar-separator">|</span>
      <button onclick="window.positionMedia('${mediaId}', 'left')" class="toolbar-btn">← Left</button>
      <button onclick="window.positionMedia('${mediaId}', 'center')" class="toolbar-btn">Center</button>
      <button onclick="window.positionMedia('${mediaId}', 'right')" class="toolbar-btn">Right →</button>
      <span class="toolbar-separator">|</span>
      <button onclick="window.positionMedia('${mediaId}', 'wrap-left')" class="toolbar-btn">Wrap Left</button>
      <button onclick="window.positionMedia('${mediaId}', 'wrap-right')" class="toolbar-btn">Wrap Right</button>
      <span class="toolbar-separator">|</span>
      <button onclick="window.deleteMedia('${mediaId}')" class="toolbar-btn" style="color:#dc3545;">Delete</button>
      <button onclick="window.clearMediaSelection()" class="toolbar-btn close-btn">×</button>
    `;
    document.body.appendChild(toolbar);
    
    const positions = ['nw', 'ne', 'sw', 'se'];
    const handles = [];
    positions.forEach((pos) => {
      const handle = document.createElement('div');
      handle.className = `resize-handle resize-handle-${pos}`;
      handle.style.position = 'fixed';
      handle.style.width = '12px';
      handle.style.height = '12px';
      handle.style.background = '#667eea';
      handle.style.border = '2px solid white';
      handle.style.borderRadius = '50%';
      handle.style.zIndex = '1001';
      handle.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      handle.style.cursor = `${pos.includes('n') ? (pos.includes('w') ? 'nw' : 'ne') : (pos.includes('w') ? 'sw' : 'se')}-resize`;
      
      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        const startWidth = img.offsetWidth;
        
        const onMouseMove = (moveEvt) => {
          const deltaX = moveEvt.clientX - startX;
          let newWidth = startWidth;
          if (pos.includes('e')) newWidth = startWidth + deltaX;
          else if (pos.includes('w')) newWidth = startWidth - deltaX;
          
          if (newWidth > 100 && newWidth < 1200) {
            img.style.width = `${newWidth}px`;
            img.style.height = 'auto';
            img.classList.remove('size-small', 'size-medium', 'size-large', 'size-full');
            img.setAttribute('data-size', 'custom');
            updatePositions(toolbar, handles);
          }
        };
        
        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          handleInput();
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
      
      document.body.appendChild(handle);
      handles.push({ pos, el: handle });
    });
    
    updatePositions(toolbar, handles);
    
    const onScrollOrResize = () => updatePositions(toolbar, handles);
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    
    toolbar.dataset.scrollListener = 'true';
    toolbar.dataset.resizeListener = 'true';
  };

  const resizeMediaInternal = (mediaId, size) => {
    const img = document.getElementById(`img-${mediaId}`);
    const media = document.getElementById(`media-${mediaId}`);
    const element = img || media;
    if (!element) return;
    element.style.width = '';
    element.style.height = '';
    element.classList.remove('size-small', 'size-medium', 'size-large', 'size-full');
    element.classList.add(`size-${size}`);
    element.setAttribute('data-size', size);
    handleInput();
  };

  const positionMediaInternal = (mediaId, position) => {
    const img = document.getElementById(`img-${mediaId}`);
    const media = document.getElementById(`media-${mediaId}`);
    const element = img || media;
    if (!element) return;
    element.classList.remove('position-left', 'position-center', 'position-right', 'position-wrap-left', 'position-wrap-right');
    element.classList.add(`position-${position}`);
    element.setAttribute('data-position', position);
    handleInput();
  };

  const deleteMediaInternal = (mediaId) => {
    const img = document.getElementById(`img-${mediaId}`);
    const media = document.getElementById(`media-${mediaId}`);
    const element = img || media;
    if (!element) return;
    const wrapper = element.parentElement;
    if (wrapper && wrapper.classList.contains('image-wrapper-resizable')) {
      wrapper.remove();
    } else {
      element.remove();
    }
    document.querySelectorAll('.floating-toolbar').forEach(el => el.remove());
    document.querySelectorAll('.resize-handle').forEach(el => el.remove());
    setSelectedImageId(null);
    handleInput();
  };

  const clearMediaSelectionInternal = () => {
    document.querySelectorAll('.selected-image').forEach((el) => el.classList.remove('selected-image'));
    document.querySelectorAll('.resize-handle').forEach((el) => el.remove());
    document.querySelectorAll('.floating-toolbar').forEach((el) => {
      if (el.dataset.scrollListener) {
        window.removeEventListener('scroll', () => {}, true);
      }
      if (el.dataset.resizeListener) {
        window.removeEventListener('resize', () => {});
      }
      el.remove();
    });
    setSelectedImageId(null);
  };

  const resizeImageInternal = resizeMediaInternal;
  const positionImageInternal = positionMediaInternal;
  const deleteImageInternal = deleteMediaInternal;
  const clearImageSelectionInternal = clearMediaSelectionInternal;
  const selectImageInternal = selectMediaInternal;

  // Toolbar button component
  const ToolbarButton = ({ icon: Icon, onClick, title, active = false }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      onMouseDown={(e) => e.preventDefault()}
      title={title}
      className={`p-2 rounded hover:bg-gray-200 transition ${active ? 'bg-gray-200' : ''}`}
    >
      <Icon size={18} className="text-gray-700" />
    </button>
  );

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
        
        /* Editor content spacing - fix excessive paragraph gaps */
        .editor-content {
          line-height: 1.5;
        }
        .editor-content p,
        .editor-content div:not(.media-wrapper),
        .editor-content ul,
        .editor-content ol {
          margin: 0 0 0.6em;
        }
        .editor-content p:last-child,
        .editor-content div:last-child {
          margin-bottom: 0;
        }
        .editor-content ul,
        .editor-content ol {
          padding-left: 1.5em;
        }
        
        /* Media (images, videos, iframes) spacing and sizing */
        .editor-content img,
        .editor-content .media-wrapper {
          display: block;
          margin: 0 0 0.6em;
          max-width: 100%;
        }
        .editor-content img {
          height: auto;
        }
        
        /* Media size classes */
        .size-small { width: 25%; }
        .size-medium { width: 50%; }
        .size-large { width: 75%; }
        .size-full { width: 100%; }
        
        /* Media position classes */
        .position-left { margin-left: 0; margin-right: auto; }
        .position-center { margin-left: auto; margin-right: auto; }
        .position-right { margin-left: auto; margin-right: 0; }
        
        /* Media wrap classes for text wrapping */
        .position-wrap-left {
          float: left;
          margin-right: 1em;
          margin-bottom: 0.6em;
        }
        .position-wrap-right {
          float: right;
          margin-left: 1em;
          margin-bottom: 0.6em;
        }
        
        /* Clear floats after wrapped media */
        .editor-content::after {
          content: "";
          display: table;
          clear: both;
        }
      `}</style>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-2">
        {/* Font Family */}
        <div className="flex items-center gap-1">
          <select
            value={selectedFontFamily}
            onChange={handleFontFamilyChange}
            className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Font Family"
          >
            {fontFamilies.map(font => (
              <option key={font.value} value={font.value}>{font.label}</option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <select
            value={selectedFontSize}
            onChange={handleFontSizeChange}
            className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Font Size"
          >
            {fontSizes.map(size => (
              <option key={size.value} value={size.value}>{size.label}</option>
            ))}
          </select>
        </div>

        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <ToolbarButton icon={Bold} onClick={() => execCommand('bold')} title="Bold (Ctrl+B)" />
          <ToolbarButton icon={Italic} onClick={() => execCommand('italic')} title="Italic (Ctrl+I)" />
          <ToolbarButton icon={Underline} onClick={() => execCommand('underline')} title="Underline (Ctrl+U)" />
          <ToolbarButton icon={Strikethrough} onClick={() => execCommand('strikeThrough')} title="Strikethrough" />
        </div>

        {/* Colors */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 relative">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTextColorPicker(!showTextColorPicker)}
              onMouseDown={(e) => e.preventDefault()}
              title="Text Color"
              className="p-2 rounded hover:bg-gray-200 transition flex items-center gap-1"
            >
              <Type size={18} className="text-gray-700" />
              <div className="w-4 h-1 rounded" style={{ backgroundColor: selectedTextColor }}></div>
            </button>
            {showTextColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-50">
                <div className="grid grid-cols-5 gap-1 mb-2">
                  {commonColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleTextColorChange(color)}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={selectedTextColor}
                  onChange={(e) => handleTextColorChange(e.target.value)}
                  className="w-full h-8 cursor-pointer"
                />
              </div>
            )}
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowBgColorPicker(!showBgColorPicker)}
              onMouseDown={(e) => e.preventDefault()}
              title="Background Color"
              className="p-2 rounded hover:bg-gray-200 transition flex items-center gap-1"
            >
              <Palette size={18} className="text-gray-700" />
              <div className="w-4 h-1 rounded" style={{ backgroundColor: selectedBgColor }}></div>
            </button>
            {showBgColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-50">
                <div className="grid grid-cols-5 gap-1 mb-2">
                  {commonColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleBgColorChange(color)}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={selectedBgColor}
                  onChange={(e) => handleBgColorChange(e.target.value)}
                  className="w-full h-8 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <ToolbarButton icon={List} onClick={() => execCommand('insertUnorderedList')} title="Bullet List" />
          <ToolbarButton icon={ListOrdered} onClick={() => execCommand('insertOrderedList')} title="Numbered List" />
          <ToolbarButton icon={Quote} onClick={() => execCommand('formatBlock', '<blockquote>')} title="Quote" />
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <ToolbarButton icon={AlignLeft} onClick={() => execCommand('justifyLeft')} title="Align Left" />
          <ToolbarButton icon={AlignCenter} onClick={() => execCommand('justifyCenter')} title="Align Center" />
          <ToolbarButton icon={AlignRight} onClick={() => execCommand('justifyRight')} title="Align Right" />
        </div>

        {/* Media */}
        <div className="flex gap-1">
          <ToolbarButton icon={LinkIcon} onClick={() => setShowLinkModal(true)} title="Insert Link" />
          <ToolbarButton icon={ImageIcon} onClick={() => setShowImageModal(true)} title="Insert Image" />
          <ToolbarButton icon={Video} onClick={() => setShowVideoModal(true)} title="Insert Video" />
          <ToolbarButton icon={Music} onClick={() => setShowAudioModal(true)} title="Insert Audio" />
        </div>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onClick={() => editorRef.current?.focus()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            document.execCommand(e.shiftKey ? 'insertLineBreak' : 'insertParagraph');
            handleInput();
          }
        }}
        className="p-4 min-h-[120px] max-h-[400px] overflow-y-auto focus:outline-none editor-content cursor-text"
        style={{ wordWrap: 'break-word' }}
        suppressContentEditableWarning
        data-placeholder={placeholder}
      />

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Insert Link</h3>
              <button onClick={() => setShowLinkModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Text (optional)</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Click here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={insertLink}
                  disabled={!linkUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Insert Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Insert Image</h3>
              <button onClick={() => { setShowImageModal(false); setImageUploadMode('url'); setImageUrl(''); }} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            {/* Tab Switcher */}
            <div className="flex gap-2 mb-4 border-b border-gray-200">
              <button
                onClick={() => setImageUploadMode('url')}
                className={`px-4 py-2 font-medium transition ${
                  imageUploadMode === 'url'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                From URL
              </button>
              <button
                onClick={() => setImageUploadMode('upload')}
                className={`px-4 py-2 font-medium transition ${
                  imageUploadMode === 'upload'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Upload File
              </button>
            </div>

            <div className="space-y-4">
              {imageUploadMode === 'url' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter the URL of an image from the web</p>
                  </div>
                  {imageUrl && (
                    <div className="border border-gray-200 rounded-lg p-2">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <img src={imageUrl} alt="Preview" className="max-w-full h-auto rounded" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setShowImageModal(false); setImageUploadMode('url'); setImageUrl(''); }}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={insertImage}
                      disabled={!imageUrl}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Insert Image
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileUpload}
                      accept="image/*"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isUploadingImage}
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload an image from your computer (via Cloudinary)</p>
                  </div>
                  {isUploadingImage && (
                    <div className="flex items-center justify-center gap-2 py-4">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-600">Uploading image...</span>
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setShowImageModal(false); setImageUploadMode('url'); setImageUrl(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                      disabled={isUploadingImage}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Youtube size={20} className="text-red-600" />
                Insert Video
              </h3>
              <button onClick={() => setShowVideoModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube or Vimeo URL</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports YouTube and Vimeo links
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Examples:</strong><br />
                  • https://www.youtube.com/watch?v=dQw4w9WgXcQ<br />
                  • https://youtu.be/dQw4w9WgXcQ<br />
                  • https://vimeo.com/123456789
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={insertVideo}
                  disabled={!videoUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Insert Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio Modal */}
      {showAudioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Music size={20} className="text-purple-600" />
                Insert Audio
              </h3>
              <button onClick={() => setShowAudioModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Audio File URL</label>
                <input
                  type="text"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://example.com/audio.mp3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the URL of an audio file (MP3, OGG, WAV)
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm text-purple-800">
                  <strong>Supported formats:</strong><br />
                  • MP3 (.mp3)<br />
                  • OGG (.ogg)<br />
                  • WAV (.wav)<br />
                  Perfect for podcasts, music, and radio content!
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAudioModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={insertAudio}
                  disabled={!audioUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Insert Audio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
