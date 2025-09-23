import React, { useState, useRef, useEffect } from 'react';

const FixedImageEditor = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const contentRef = useRef(null);

  // Handle content change - FIXED to prevent backwards typing
  const handleContentChange = (e) => {
    // Store cursor position before updating state
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const startOffset = range ? range.startOffset : 0;
    const endOffset = range ? range.endOffset : 0;
    const startContainer = range ? range.startContainer : null;
    
    // Update content state
    setContent(e.target.innerHTML);
    
    // Restore cursor position after React re-render
    setTimeout(() => {
      if (startContainer && contentRef.current && contentRef.current.contains(startContainer)) {
        try {
          const newRange = document.createRange();
          newRange.setStart(startContainer, Math.min(startOffset, startContainer.textContent?.length || 0));
          newRange.setEnd(startContainer, Math.min(endOffset, startContainer.textContent?.length || 0));
          selection.removeAllRanges();
          selection.addRange(newRange);
        } catch (e) {
          // Fallback: place cursor at end
          const newRange = document.createRange();
          newRange.selectNodeContents(contentRef.current);
          newRange.collapse(false);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    }, 0);
  };

  // Handle file upload
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
    const editor = contentRef.current;
    if (editor) {
      const selection = window.getSelection();
      let range;
      
      // If there's a selection, use it; otherwise, insert at the end
      if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
      } else {
        range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
      }
      
      // Create image element
      const img = document.createElement('img');
      img.id = `img-${image.id}`;
      img.src = image.src;
      img.alt = image.alt;
      img.className = `size-${image.size} position-${image.position}`;
      img.setAttribute('data-size', image.size);
      img.setAttribute('data-position', image.position);
      img.style.cssText = 'cursor: pointer; border-radius: 8px;';
      
      // Add click handler for selection
      img.addEventListener('click', (e) => {
        e.preventDefault();
        selectImage(image.id);
      });
      
      // Insert image at cursor position
      range.deleteContents();
      range.insertNode(img);
      
      // Add some space after the image
      const textNode = document.createTextNode(' ');
      range.setStartAfter(img);
      range.insertNode(textNode);
      
      // Move cursor after the space
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Update content state
      setContent(editor.innerHTML);
    }
  };

  // Select image
  const selectImage = (imageId) => {
    setSelectedImageId(imageId);
    
    // Remove previous selections and handles
    document.querySelectorAll('.selected-image').forEach(el => {
      el.classList.remove('selected-image');
    });
    document.querySelectorAll('.resize-handle').forEach(el => {
      el.remove();
    });
    document.querySelectorAll('.floating-toolbar').forEach(el => {
      el.remove();
    });
    
    // Find and select the clicked image
    const img = document.getElementById(`img-${imageId}`);
    if (img) {
      img.classList.add('selected-image');
      
      // Create floating toolbar
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
        <button onclick="window.setSelectedImageId(null)" class="toolbar-btn close-btn">×</button>
      `;
      
      // Position toolbar above the image
      const rect = img.getBoundingClientRect();
      toolbar.style.position = 'fixed';
      toolbar.style.top = (rect.top - 50) + 'px';
      toolbar.style.left = rect.left + 'px';
      toolbar.style.zIndex = '1000';
      
      document.body.appendChild(toolbar);
      
      // Add resize handles
      addResizeHandles(img, imageId);
    }
  };

  // Add resize handles function
  const addResizeHandles = (img, imageId) => {
    const handles = ['nw', 'ne', 'sw', 'se'];
    handles.forEach(handle => {
      const handleEl = document.createElement('div');
      handleEl.className = `resize-handle resize-${handle}`;
      handleEl.style.position = 'fixed';
      handleEl.style.width = '12px';
      handleEl.style.height = '12px';
      handleEl.style.backgroundColor = '#4285f4';
      handleEl.style.border = '2px solid white';
      handleEl.style.borderRadius = '50%';
      handleEl.style.cursor = `${handle}-resize`;
      handleEl.style.zIndex = '1001';
      
      // Position the handle
      const rect = img.getBoundingClientRect();
      if (handle.includes('n')) handleEl.style.top = (rect.top - 6) + 'px';
      if (handle.includes('s')) handleEl.style.top = (rect.bottom - 6) + 'px';
      if (handle.includes('w')) handleEl.style.left = (rect.left - 6) + 'px';
      if (handle.includes('e')) handleEl.style.left = (rect.right - 6) + 'px';
      
      document.body.appendChild(handleEl);
    });
  };

  // Resize image function
  const resizeImage = (imageId, size) => {
    const img = document.getElementById(`img-${imageId}`);
    if (img) {
      // Remove old size classes
      img.classList.remove('size-small', 'size-medium', 'size-large', 'size-full');
      img.classList.add(`size-${size}`);
      
      // Update data attribute
      img.setAttribute('data-size', size);
      
      // Update content state
      if (contentRef.current) {
        setContent(contentRef.current.innerHTML);
      }
      
      // Refresh handles
      setTimeout(() => {
        selectImage(imageId);
      }, 10);
    }
  };

  // Position image function
  const positionImage = (imageId, position) => {
    const img = document.getElementById(`img-${imageId}`);
    if (img) {
      // Remove old position classes
      img.classList.remove('position-left', 'position-center', 'position-right');
      img.classList.add(`position-${position}`);
      
      // Update data attribute
      img.setAttribute('data-position', position);
      
      // Update content state
      if (contentRef.current) {
        setContent(contentRef.current.innerHTML);
      }
      
      // Refresh handles
      setTimeout(() => {
        selectImage(imageId);
      }, 10);
    }
  };

  // Text formatting functions
  const applyFormat = (command) => {
    document.execCommand(command, false, null);
    if (contentRef.current) {
      setContent(contentRef.current.innerHTML);
    }
  };

  const applyFontFamily = (fontFamily) => {
    document.execCommand('fontName', false, fontFamily);
    if (contentRef.current) {
      setContent(contentRef.current.innerHTML);
    }
  };

  const applyFontSize = (fontSize) => {
    document.execCommand('fontSize', false, '7');
    const fontElements = document.querySelectorAll('font[size="7"]');
    fontElements.forEach(el => {
      el.removeAttribute('size');
      el.style.fontSize = fontSize;
    });
    if (contentRef.current) {
      setContent(contentRef.current.innerHTML);
    }
  };

  const applyTextColor = (color) => {
    document.execCommand('foreColor', false, color);
    if (contentRef.current) {
      setContent(contentRef.current.innerHTML);
    }
  };

  const applyHeading = (heading) => {
    if (heading === 'normal') {
      document.execCommand('formatBlock', false, 'div');
    } else {
      document.execCommand('formatBlock', false, heading);
    }
    if (contentRef.current) {
      setContent(contentRef.current.innerHTML);
    }
  };

  const applyAlignment = (alignment) => {
    document.execCommand('justify' + alignment.charAt(0).toUpperCase() + alignment.slice(1), false, null);
    if (contentRef.current) {
      setContent(contentRef.current.innerHTML);
    }
  };

  const addLink = () => {
    const url = document.getElementById('linkUrl').value;
    if (url) {
      document.execCommand('createLink', false, url);
      if (contentRef.current) {
        setContent(contentRef.current.innerHTML);
      }
      document.getElementById('linkUrl').value = '';
    }
  };

  const removeLink = () => {
    document.execCommand('unlink', false, null);
    if (contentRef.current) {
      setContent(contentRef.current.innerHTML);
    }
  };

  // Make functions globally available
  useEffect(() => {
    window.selectImage = selectImage;
    window.resizeImage = resizeImage;
    window.positionImage = positionImage;
    window.setSelectedImageId = setSelectedImageId;
    
    // Cleanup function
    return () => {
      document.querySelectorAll('.floating-toolbar').forEach(el => el.remove());
      document.querySelectorAll('.resize-handle').forEach(el => el.remove());
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
    <div className="fixed-image-editor">
      <style>{`
        .fixed-image-editor {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .editor-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 20px;
        }
        
        .editor-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .editor-subtitle {
          opacity: 0.9;
          font-size: 14px;
        }
        
        .editor-main {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .editor-panel {
          background: white;
          border: 1px solid #e1e5e9;
          border-radius: 12px;
          padding: 20px;
        }
        
        .preview-panel {
          background: #f8f9fa;
          border: 1px solid #e1e5e9;
          border-radius: 12px;
          padding: 20px;
        }
        
        .title-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 16px;
          margin-bottom: 20px;
        }
        
        .content-editor {
          width: 100%;
          min-height: 300px;
          padding: 15px;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          background: white;
          line-height: 1.6;
          font-size: 16px;
          outline: none;
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: normal !important;
          writing-mode: horizontal-tb !important;
        }
        
        .content-editor * {
          direction: ltr !important;
          unicode-bidi: normal !important;
        }
        
        .content-editor img {
          max-width: 100%;
          height: auto;
          border: 2px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .content-editor img:hover {
          border-color: #667eea;
        }
        
        .content-editor img.selected-image {
          border-color: #667eea !important;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.25) !important;
        }
        
        .content-editor img.size-small {
          width: 200px;
        }
        
        .content-editor img.size-medium {
          width: 400px;
        }
        
        .content-editor img.size-large {
          width: 600px;
        }
        
        .content-editor img.size-full {
          width: 100%;
        }
        
        .content-editor img.position-left {
          float: left;
          margin: 0 15px 15px 0;
        }
        
        .content-editor img.position-right {
          float: right;
          margin: 0 0 15px 15px;
        }
        
        .content-editor img.position-center {
          display: block;
          margin: 15px auto;
          float: none;
        }
        
        .content-editor:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
        }
        
        .upload-section {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 15px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e1e5e9;
        }
        
        .upload-btn {
          padding: 10px 20px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .upload-btn:hover {
          background: #218838;
        }
        
        .upload-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
        
        .actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 20px;
        }
        
        .save-btn {
          padding: 12px 24px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .save-btn:hover {
          background: #218838;
        }
        
        .cancel-btn {
          padding: 12px 24px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .cancel-btn:hover {
          background: #5a6268;
        }
        
        .section {
          margin-bottom: 20px;
          padding: 15px;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          background: #f8f9fa;
        }
        
        .section-title {
          margin: 0 0 10px 0;
          font-size: 16px;
          font-weight: 600;
          color: #495057;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .controls {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        
        .select {
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          background: white;
          font-size: 14px;
          min-width: 120px;
        }
        
        .btn {
          padding: 8px 16px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .btn:hover {
          background: #e9ecef;
          border-color: #adb5bd;
        }
        
        .input {
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
          min-width: 200px;
        }
        
        .color-picker {
          width: 40px;
          height: 36px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .floating-toolbar {
          position: fixed;
          background: #333;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          display: flex;
          gap: 8px;
          align-items: center;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        
        .toolbar-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 12px;
        }
        
        .toolbar-btn:hover {
          background: rgba(255,255,255,0.2);
        }
        
        .toolbar-separator {
          color: #666;
          margin: 0 4px;
        }
        
        .close-btn {
          font-weight: bold;
          font-size: 14px;
        }
        
        .resize-handle {
          position: fixed;
          width: 12px;
          height: 12px;
          background: #4285f4;
          border: 2px solid white;
          border-radius: 50%;
          z-index: 1001;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .preview-content {
          min-height: 300px;
          padding: 15px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e1e5e9;
          line-height: 1.6;
        }
        
        .preview-content img {
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        
        .help {
          background: #e7f3ff;
          border: 1px solid #b3d9ff;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .help strong {
          color: #0066cc;
        }
        
        @media (max-width: 768px) {
          .editor-main {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="editor-header">
        <div className="editor-title">Fixed Rich Blog Editor</div>
        <div className="editor-subtitle">Upload images and click to resize/position them with floating toolbar</div>
      </div>

      <div className="editor-main">
        <div className="editor-panel">
          <h3>📝 Editor</h3>
          
          <input
            type="text"
            className="title-input"
            placeholder="Enter post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Text Formatting Section */}
          <div className="section">
            <h3 className="section-title">📝 Text Formatting</h3>
            <div className="controls">
              <select 
                className="select"
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
                className="select"
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
              
              <button className="btn" onClick={() => applyFormat('bold')}>
                <strong>Bold</strong>
              </button>
              <button className="btn" onClick={() => applyFormat('italic')}>
                <em>Italic</em>
              </button>
              <button className="btn" onClick={() => applyFormat('underline')}>
                <u>Underline</u>
              </button>
              
              <input 
                type="color" 
                className="color-picker"
                onChange={(e) => applyTextColor(e.target.value)}
                title="Text Color"
              />
            </div>
          </div>

          {/* Headings & Structure Section */}
          <div className="section">
            <h3 className="section-title">📋 Headings & Structure</h3>
            <div className="controls">
              <select 
                className="select"
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
          <div className="section">
            <h3 className="section-title">↔️ Text Alignment</h3>
            <div className="controls">
              <button className="btn" onClick={() => applyAlignment('left')}>
                ← Left
              </button>
              <button className="btn" onClick={() => applyAlignment('center')}>
                Center
              </button>
              <button className="btn" onClick={() => applyAlignment('right')}>
                Right →
              </button>
            </div>
          </div>

          {/* Links Section */}
          <div className="section">
            <h3 className="section-title">🔗 Links</h3>
            <div className="controls">
              <input 
                type="url" 
                placeholder="https://example.com"
                className="input"
                id="linkUrl"
              />
              <button className="btn" onClick={addLink}>
                Add Link
              </button>
              <button className="btn" onClick={removeLink}>
                Remove Link
              </button>
            </div>
          </div>

          {/* Image Controls Section */}
          <div className="section">
            <h3 className="section-title">🖼️ Image Controls</h3>
            <div className="help">
              <strong>🎯 How to use:</strong><br/>
              1. Upload an image below<br/>
              2. Click on any image in the content to select it<br/>
              3. Use the floating toolbar to resize (Small/Medium/Large/Full)<br/>
              4. Use the floating toolbar to position (Left/Center/Right)<br/>
              5. <strong>Drag corner handles</strong> to resize manually<br/>
              6. Images show blue border and corner handles when selected
            </div>
          </div>

          <div className="upload-section">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            <button 
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </button>
            
            <span style={{ fontSize: '14px', color: '#666' }}>
              Click in content area first, then upload to insert at cursor position
            </span>
          </div>

          <div
            ref={contentRef}
            className="content-editor"
            contentEditable
            suppressContentEditableWarning={true}
            onInput={handleContentChange}
            dangerouslySetInnerHTML={{ __html: content || '<p>Start writing your content... Click here and start typing.</p>' }}
          />
        </div>

        <div className="preview-panel">
          <h3>👁️ Live Preview</h3>
          <div className="preview-content">
            <h2>{title || 'Your Post Title'}</h2>
            <div dangerouslySetInnerHTML={{ __html: content || '<p>Your content will appear here...</p>' }} />
          </div>
        </div>
      </div>

      <div className="actions">
        <button className="save-btn" onClick={handleSave}>
          Save Post
        </button>
        <button className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default FixedImageEditor;
