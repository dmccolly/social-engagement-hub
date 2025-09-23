import React, { useState, useRef } from 'react';

const SimpleImageEditor = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const contentRef = useRef(null);

  // Upload image to Cloudinary
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'demo-preset');
      
      const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'demo-cloud-name';
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Create new image object
        const newImage = {
          id: Date.now(),
          src: data.secure_url,
          alt: file.name,
          size: 'medium',
          position: 'center',
          width: 400,
          height: 'auto'
        };
        
        setImages(prev => [...prev, newImage]);
        
        // Insert image into content at cursor position
        insertImageIntoContent(newImage);
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        alert('Upload failed. Please try again.');
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
    const imageHtml = `<div class="image-container" id="container-${image.id}">
      <img 
        id="img-${image.id}" 
        src="${image.src}" 
        alt="${image.alt}"
        data-size="${image.size}"
        data-position="${image.position}"
        style="width: ${image.width}px; height: auto; cursor: pointer; border-radius: 8px; margin: 10px;"
        onclick="selectImage(${image.id})"
        draggable="true"
        ondragstart="handleImageDragStart(event, ${image.id})"
      />
    </div>`;
    
    if (contentRef.current) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createRange().createContextualFragment(imageHtml));
      } else {
        contentRef.current.innerHTML += imageHtml;
      }
      
      // Update content state
      setContent(contentRef.current.innerHTML);
    }
  };

  // Select image
  const selectImage = (imageId) => {
    setSelectedImageId(imageId);
    
    // Remove previous selections and handles
    document.querySelectorAll('.selected-image').forEach(el => {
      el.classList.remove('selected-image');
    });
    document.querySelectorAll('.image-container.selected').forEach(el => {
      el.classList.remove('selected');
    });
    document.querySelectorAll('.resize-handle').forEach(el => {
      el.remove();
    });
    
    // Add selection to clicked image
    const imgElement = document.getElementById(`img-${imageId}`);
    const containerElement = document.getElementById(`container-${imageId}`);
    
    if (imgElement && containerElement) {
      imgElement.classList.add('selected-image');
      containerElement.classList.add('selected');
      
      // Add resize handles
      addResizeHandles(containerElement, imageId);
      
      // Show floating toolbar
      showImageToolbar(imgElement, imageId);
    }
  };

  // Add resize handles to selected image
  const addResizeHandles = (container, imageId) => {
    const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    
    positions.forEach(position => {
      const handle = document.createElement('div');
      handle.className = `resize-handle ${position}`;
      handle.addEventListener('mousedown', (e) => startResize(e, imageId, position));
      container.appendChild(handle);
    });
  };

  // Start resize operation
  const startResize = (e, imageId, position) => {
    e.preventDefault();
    e.stopPropagation();
    
    const imgElement = document.getElementById(`img-${imageId}`);
    if (!imgElement) return;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = imgElement.offsetWidth;
    const startHeight = imgElement.offsetHeight;
    
    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      
      // Calculate new dimensions based on handle position
      if (position.includes('right')) {
        newWidth = startWidth + deltaX;
      } else if (position.includes('left')) {
        newWidth = startWidth - deltaX;
      }
      
      // Maintain aspect ratio
      const aspectRatio = startWidth / startHeight;
      newHeight = newWidth / aspectRatio;
      
      // Apply minimum size constraints
      if (newWidth < 100) newWidth = 100;
      if (newHeight < 50) newHeight = 50;
      
      // Apply new size
      imgElement.style.width = newWidth + 'px';
      imgElement.style.height = newHeight + 'px';
      
      // Update images state
      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, width: newWidth } : img
      ));
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Update content
      setContent(contentRef.current.innerHTML);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Show floating toolbar
  const showImageToolbar = (imgElement, imageId) => {
    // Remove existing toolbar
    const existingToolbar = document.querySelector('.image-floating-toolbar');
    if (existingToolbar) {
      existingToolbar.remove();
    }
    
    // Create floating toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'image-floating-toolbar';
    toolbar.style.cssText = `
      position: fixed;
      top: ${imgElement.getBoundingClientRect().top - 60}px;
      left: ${imgElement.getBoundingClientRect().left}px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      display: flex;
      gap: 8px;
      align-items: center;
    `;
    
    // Size buttons
    ['Small (200px)', 'Medium (400px)', 'Large (600px)', 'Full Width'].forEach((sizeLabel, index) => {
      const sizes = [200, 400, 600, '100%'];
      const btn = document.createElement('button');
      btn.textContent = sizeLabel.split(' ')[0];
      btn.style.cssText = `
        padding: 4px 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        cursor: pointer;
        font-size: 12px;
      `;
      btn.addEventListener('click', () => {
        resizeImage(imageId, sizes[index]);
      });
      toolbar.appendChild(btn);
    });
    
    // Separator
    const sep1 = document.createElement('div');
    sep1.style.cssText = 'width: 1px; height: 20px; background: #ddd; margin: 0 4px;';
    toolbar.appendChild(sep1);
    
    // Position buttons
    ['← Left', 'Center', 'Right →'].forEach((pos, index) => {
      const btn = document.createElement('button');
      btn.textContent = pos;
      btn.style.cssText = `
        padding: 4px 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        cursor: pointer;
        font-size: 12px;
      `;
      const positions = ['left', 'center', 'right'];
      btn.addEventListener('click', () => {
        repositionImage(imageId, positions[index]);
      });
      toolbar.appendChild(btn);
    });
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      padding: 4px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: #f5f5f5;
      cursor: pointer;
      font-size: 12px;
      margin-left: 8px;
    `;
    closeBtn.addEventListener('click', () => {
      toolbar.remove();
      imgElement.classList.remove('selected-image');
      setSelectedImageId(null);
    });
    toolbar.appendChild(closeBtn);
    
    document.body.appendChild(toolbar);
    
    // Remove toolbar when clicking elsewhere
    setTimeout(() => {
      const clickHandler = (e) => {
        if (!toolbar.contains(e.target) && e.target !== imgElement) {
          toolbar.remove();
          imgElement.classList.remove('selected-image');
          setSelectedImageId(null);
          document.removeEventListener('click', clickHandler);
        }
      };
      document.addEventListener('click', clickHandler);
    }, 100);
  };

  // Resize image
  const resizeImage = (imageId, newWidth) => {
    const imgElement = document.getElementById(`img-${imageId}`);
    if (imgElement) {
      if (newWidth === '100%') {
        imgElement.style.width = '100%';
        imgElement.style.maxWidth = '100%';
      } else {
        imgElement.style.width = newWidth + 'px';
        imgElement.style.maxWidth = newWidth + 'px';
      }
      
      // Update images state
      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, width: newWidth } : img
      ));
      
      // Update content
      setContent(contentRef.current.innerHTML);
    }
  };

  // Reposition image
  const repositionImage = (imageId, position) => {
    const imgElement = document.getElementById(`img-${imageId}`);
    if (imgElement) {
      // Remove previous position classes
      imgElement.style.float = '';
      imgElement.style.display = '';
      imgElement.style.margin = '';
      
      // Apply new position
      switch (position) {
        case 'left':
          imgElement.style.float = 'left';
          imgElement.style.margin = '0 20px 20px 0';
          break;
        case 'center':
          imgElement.style.display = 'block';
          imgElement.style.margin = '20px auto';
          break;
        case 'right':
          imgElement.style.float = 'right';
          imgElement.style.margin = '0 0 20px 20px';
          break;
      }
      
      // Update images state
      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, position } : img
      ));
      
      // Update content
      setContent(contentRef.current.innerHTML);
    }
  };

  // Handle image drag start
  const handleImageDragStart = (e, imageId) => {
    e.dataTransfer.setData('text/plain', imageId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Text formatting functions
  const applyFormat = (command) => {
    document.execCommand(command, false, null);
    setContent(contentRef.current.innerHTML);
  };

  const applyFontFamily = (fontFamily) => {
    document.execCommand('fontName', false, fontFamily);
    setContent(contentRef.current.innerHTML);
  };

  const applyFontSize = (fontSize) => {
    document.execCommand('fontSize', false, '7');
    const fontElements = document.querySelectorAll('font[size="7"]');
    fontElements.forEach(el => {
      el.removeAttribute('size');
      el.style.fontSize = fontSize;
    });
    setContent(contentRef.current.innerHTML);
  };

  const applyTextColor = (color) => {
    document.execCommand('foreColor', false, color);
    setContent(contentRef.current.innerHTML);
  };

  const applyHeading = (heading) => {
    if (heading === 'normal') {
      document.execCommand('formatBlock', false, 'div');
    } else {
      document.execCommand('formatBlock', false, heading);
    }
    setContent(contentRef.current.innerHTML);
  };

  const applyAlignment = (alignment) => {
    document.execCommand('justify' + alignment.charAt(0).toUpperCase() + alignment.slice(1), false, null);
    setContent(contentRef.current.innerHTML);
  };

  const addLink = () => {
    const url = document.getElementById('linkUrl').value;
    if (url) {
      document.execCommand('createLink', false, url);
      setContent(contentRef.current.innerHTML);
      document.getElementById('linkUrl').value = '';
    }
  };

  const removeLink = () => {
    document.execCommand('unlink', false, null);
    setContent(contentRef.current.innerHTML);
  };

  // Make functions globally available
  React.useEffect(() => {
    window.selectImage = selectImage;
    window.handleImageDragStart = handleImageDragStart;
    
    return () => {
      delete window.selectImage;
      delete window.handleImageDragStart;
    };
  }, []);

  const handleSave = () => {
    onSave?.({
      title,
      content: contentRef.current?.innerHTML || content,
      isFeatured: false
    });
  };

  return (
    <div className="simple-image-editor">
      <style>{`
        .simple-image-editor {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .simple-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 20px;
        }
        
        .simple-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .simple-subtitle {
          opacity: 0.9;
          font-size: 14px;
        }
        
        .simple-main {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .simple-editor-panel {
          background: white;
          border: 1px solid #e1e5e9;
          border-radius: 12px;
          padding: 20px;
        }
        
        .simple-preview-panel {
          background: #f8f9fa;
          border: 1px solid #e1e5e9;
          border-radius: 12px;
          padding: 20px;
        }
        
        .simple-title-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 16px;
          margin-bottom: 20px;
        }
        
        .simple-content-editor {
          width: 100%;
          min-height: 300px;
          padding: 15px;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          background: white;
          line-height: 1.6;
          font-size: 16px;
          resize: vertical;
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: normal !important;
          writing-mode: horizontal-tb !important;
        }
        
        .simple-content-editor * {
          direction: ltr !important;
          unicode-bidi: normal !important;
        }
        
        .simple-content-editor:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
        }
        
        .simple-upload-section {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 15px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e1e5e9;
        }
        
        .simple-upload-btn {
          padding: 10px 20px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .simple-upload-btn:hover {
          background: #218838;
        }
        
        .simple-upload-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
        
        .simple-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 20px;
        }
        
        .simple-save-btn {
          padding: 12px 24px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .simple-cancel-btn {
          padding: 12px 24px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .simple-help {
          background: #e7f3ff;
          border: 1px solid #b3d9ff;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .simple-help strong {
          color: #0066cc;
        }
        
        .simple-section {
          margin-bottom: 20px;
          padding: 15px;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          background: #f8f9fa;
        }
        
        .simple-section-title {
          margin: 0 0 10px 0;
          font-size: 16px;
          font-weight: 600;
          color: #495057;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .simple-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        
        .simple-select {
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          background: white;
          font-size: 14px;
          min-width: 120px;
        }
        
        .simple-btn {
          padding: 8px 16px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .simple-btn:hover {
          background: #e9ecef;
          border-color: #adb5bd;
        }
        
        .simple-input {
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
          min-width: 200px;
        }
        
        .simple-color-picker {
          width: 40px;
          height: 36px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .selected-image {
          border: 3px solid #667eea !important;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.25) !important;
          position: relative;
        }
        
        .image-container {
          position: relative;
          display: inline-block;
        }
        
        .image-container.selected {
          position: relative;
        }
        
        .resize-handle {
          position: absolute;
          width: 12px;
          height: 12px;
          background: #667eea;
          border: 2px solid white;
          border-radius: 50%;
          cursor: nw-resize;
          z-index: 1001;
        }
        
        .resize-handle.top-left {
          top: -6px;
          left: -6px;
          cursor: nw-resize;
        }
        
        .resize-handle.top-right {
          top: -6px;
          right: -6px;
          cursor: ne-resize;
        }
        
        .resize-handle.bottom-left {
          bottom: -6px;
          left: -6px;
          cursor: sw-resize;
        }
        
        .resize-handle.bottom-right {
          bottom: -6px;
          right: -6px;
          cursor: se-resize;
        }
        
        .image-container img {
          display: block;
          max-width: 100%;
          height: auto;
        }
        
        .simple-preview-content {
          min-height: 300px;
          padding: 15px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e1e5e9;
          line-height: 1.6;
        }
        
        .simple-preview-content img {
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        
        @media (max-width: 768px) {
          .simple-main {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="simple-header">
        <div className="simple-title">Simple Image Editor</div>
        <div className="simple-subtitle">Upload images and click to resize/position them with floating toolbar</div>
      </div>

      <div className="simple-main">
        <div className="simple-editor-panel">
          <h3>📝 Editor</h3>
          
          <input
            type="text"
            className="simple-title-input"
            placeholder="Enter post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Text Formatting Section */}
          <div className="simple-section">
            <h3 className="simple-section-title">📝 Text Formatting</h3>
            <div className="simple-controls">
              <select 
                className="simple-select"
                onChange={(e) => applyFontFamily(e.target.value)}
                defaultValue="Arial"
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Verdana">Verdana</option>
                <option value="Courier New">Courier New</option>
              </select>
              
              <select 
                className="simple-select"
                onChange={(e) => applyFontSize(e.target.value)}
                defaultValue="16px"
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
              
              <button className="simple-btn" onClick={() => applyFormat('bold')}>
                <strong>Bold Text</strong>
              </button>
              <button className="simple-btn" onClick={() => applyFormat('italic')}>
                <em>Italic Text</em>
              </button>
              <button className="simple-btn" onClick={() => applyFormat('underline')}>
                <u>Underline Text</u>
              </button>
              
              <input 
                type="color" 
                className="simple-color-picker"
                onChange={(e) => applyTextColor(e.target.value)}
                title="Text Color"
              />
            </div>
          </div>

          {/* Headings & Structure Section */}
          <div className="simple-section">
            <h3 className="simple-section-title">📋 Headings & Structure</h3>
            <div className="simple-controls">
              <select 
                className="simple-select"
                onChange={(e) => applyHeading(e.target.value)}
                defaultValue="normal"
              >
                <option value="normal">Normal Text</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
              </select>
            </div>
          </div>

          {/* Text Alignment Section */}
          <div className="simple-section">
            <h3 className="simple-section-title">↔️ Text Alignment</h3>
            <div className="simple-controls">
              <button className="simple-btn" onClick={() => applyAlignment('left')}>
                ← Left
              </button>
              <button className="simple-btn" onClick={() => applyAlignment('center')}>
                Center
              </button>
              <button className="simple-btn" onClick={() => applyAlignment('right')}>
                Right →
              </button>
            </div>
          </div>

          {/* Links Section */}
          <div className="simple-section">
            <h3 className="simple-section-title">🔗 Links</h3>
            <div className="simple-controls">
              <input 
                type="url" 
                placeholder="https://example.com"
                className="simple-input"
                id="linkUrl"
              />
              <button className="simple-btn" onClick={addLink}>
                Add Link
              </button>
              <button className="simple-btn" onClick={removeLink}>
                Remove Link
              </button>
            </div>
          </div>

          {/* Image Controls Section */}
          <div className="simple-section">
            <h3 className="simple-section-title">🖼️ Image Controls</h3>
            <div className="simple-help">
              <strong>🎯 How to use:</strong><br/>
              1. Upload an image below<br/>
              2. Click on any image in the content to select it<br/>
              3. Use the floating toolbar to resize (Small/Medium/Large/Full)<br/>
              4. Use the floating toolbar to position (Left/Center/Right)<br/>
              5. <strong>Drag corner handles</strong> to resize manually<br/>
              6. <strong>Drag images</strong> to move them around in content<br/>
              7. Images show blue border and corner handles when selected
            </div>
          </div>

          <div className="simple-upload-section">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            <button 
              className="simple-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </button>
            
            <span style={{ fontSize: '14px', color: '#666' }}>
              Click in the content area first, then upload to insert at cursor position
            </span>
          </div>

          <div
            ref={contentRef}
            className="simple-content-editor"
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => setContent(e.target.innerHTML)}
            dangerouslySetInnerHTML={{ __html: content || '<p>Start writing your content... Click here and start typing.</p>' }}
          />
        </div>

        <div className="simple-preview-panel">
          <h3>👁️ Live Preview</h3>
          <div className="simple-preview-content">
            <h2>{title || 'Your Post Title'}</h2>
            <div dangerouslySetInnerHTML={{ __html: content || '<p>Your content will appear here...</p>' }} />
          </div>
        </div>
      </div>

      <div className="simple-actions">
        <button className="simple-save-btn" onClick={handleSave}>
          Save Post
        </button>
        <button className="simple-cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SimpleImageEditor;
