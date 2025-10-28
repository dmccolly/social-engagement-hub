// Rich Text Editor Component for News Feed
// Supports: Text formatting, links, images, videos (YouTube/Vimeo), and more

import React, { useState, useRef, useEffect } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, Link as LinkIcon, Image as ImageIcon,
  Video, List, ListOrdered, Quote, Code, AlignLeft,
  AlignCenter, AlignRight, X, Check, Youtube, Film, Type, Palette
} from 'lucide-react';

const RichTextEditor = ({ value, onChange, placeholder = "What's on your mind?" }) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedFontFamily, setSelectedFontFamily] = useState('');
  const [selectedFontSize, setSelectedFontSize] = useState('');
  const [selectedTextColor, setSelectedTextColor] = useState('#000000');
  const [selectedBgColor, setSelectedBgColor] = useState('#ffffff');
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const editorRef = useRef(null);

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

    return () => {
      delete window.selectImage;
      delete window.resizeImage;
      delete window.positionImage;
      delete window.deleteImage;
      delete window.clearImageSelection;
    };
  }, []);

  // Handle content changes
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
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

  // Insert image with controls
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
    
    let embedHtml = '';
    if (videoInfo.type === 'youtube') {
      embedHtml = `
        <div class="my-4 relative" style="padding-bottom: 56.25%; height: 0; overflow: hidden;">
          <iframe 
            src="https://www.youtube.com/embed/${videoInfo.id}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            class="absolute top-0 left-0 w-full h-full rounded-lg shadow-md"
          ></iframe>
        </div>
      `;
    } else if (videoInfo.type === 'vimeo') {
      embedHtml = `
        <div class="my-4 relative" style="padding-bottom: 56.25%; height: 0; overflow: hidden;">
          <iframe 
            src="https://player.vimeo.com/video/${videoInfo.id}" 
            frameborder="0" 
            allow="autoplay; fullscreen; picture-in-picture" 
            allowfullscreen
            class="absolute top-0 left-0 w-full h-full rounded-lg shadow-md"
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

  const selectImageInternal = (imageId) => {
    setSelectedImageId(imageId);
    document.querySelectorAll('.selected-image').forEach((el) => el.classList.remove('selected-image'));
    document.querySelectorAll('.resize-handle').forEach((el) => el.remove());
    document.querySelectorAll('.floating-toolbar').forEach((el) => el.remove());
    
    const img = document.getElementById(`img-${imageId}`);
    if (!img) return;
    img.classList.add('selected-image');
    
    const updatePositions = (toolbar, handles) => {
      const rect = img.getBoundingClientRect();
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
      <button onclick="window.resizeImage('${imageId}', 'small')" class="toolbar-btn">Small</button>
      <button onclick="window.resizeImage('${imageId}', 'medium')" class="toolbar-btn">Medium</button>
      <button onclick="window.resizeImage('${imageId}', 'large')" class="toolbar-btn">Large</button>
      <button onclick="window.resizeImage('${imageId}', 'full')" class="toolbar-btn">Full</button>
      <span class="toolbar-separator">|</span>
      <button onclick="window.positionImage('${imageId}', 'left')" class="toolbar-btn">← Left</button>
      <button onclick="window.positionImage('${imageId}', 'center')" class="toolbar-btn">Center</button>
      <button onclick="window.positionImage('${imageId}', 'right')" class="toolbar-btn">Right →</button>
      <span class="toolbar-separator">|</span>
      <button onclick="window.deleteImage('${imageId}')" class="toolbar-btn" style="color:#dc3545;">Delete</button>
      <button onclick="window.clearImageSelection()" class="toolbar-btn close-btn">×</button>
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
  };

  const resizeImageInternal = (imageId, size) => {
    const img = document.getElementById(`img-${imageId}`);
    if (!img) return;
    img.style.width = '';
    img.style.height = '';
    img.classList.remove('size-small', 'size-medium', 'size-large', 'size-full');
    img.classList.add(`size-${size}`);
    img.setAttribute('data-size', size);
    handleInput();
  };

  const positionImageInternal = (imageId, position) => {
    const img = document.getElementById(`img-${imageId}`);
    if (!img) return;
    img.classList.remove('position-left', 'position-center', 'position-right');
    img.classList.add(`position-${position}`);
    img.setAttribute('data-position', position);
    handleInput();
  };

  const deleteImageInternal = (imageId) => {
    const img = document.getElementById(`img-${imageId}`);
    if (!img) return;
    const wrapper = img.parentElement;
    if (wrapper && wrapper.classList.contains('image-wrapper-resizable')) {
      wrapper.remove();
    } else {
      img.remove();
    }
    document.querySelectorAll('.floating-toolbar').forEach(el => el.remove());
    document.querySelectorAll('.resize-handle').forEach(el => el.remove());
    setSelectedImageId(null);
    handleInput();
  };

  const clearImageSelectionInternal = () => {
    document.querySelectorAll('.selected-image').forEach((el) => el.classList.remove('selected-image'));
    document.querySelectorAll('.resize-handle').forEach((el) => el.remove());
    document.querySelectorAll('.floating-toolbar').forEach((el) => el.remove());
    setSelectedImageId(null);
  };

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
        </div>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onClick={() => editorRef.current?.focus()}
        className="p-4 min-h-[120px] max-h-[400px] overflow-y-auto focus:outline-none prose max-w-none cursor-text"
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
              <button onClick={() => setShowImageModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
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
                  onClick={() => setShowImageModal(false)}
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
    </div>
  );
};

export default RichTextEditor;
