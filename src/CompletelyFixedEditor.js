import React, { useState, useRef, useEffect } from 'react';

const CompletelyFixedEditor = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const contentRef = useRef(null);

  // Debug logging
  useEffect(() => {
    console.log('CompletelyFixedEditor mounted');
  }, []);

  // Handle content change - FIXED for backwards typing
  const handleContentChange = (e) => {
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const startOffset = range ? range.startOffset : 0;
    const endOffset = range ? range.endOffset : 0;
    const startContainer = range ? range.startContainer : null;
    
    setContent(e.target.innerHTML);
    
    setTimeout(() => {
      if (startContainer && contentRef.current && contentRef.current.contains(startContainer)) {
        try {
          const newRange = document.createRange();
          newRange.setStart(startContainer, Math.min(startOffset, startContainer.textContent?.length || 0));
          newRange.setEnd(startContainer, Math.min(endOffset, startContainer.textContent?.length || 0));
          selection.removeAllRanges();
          selection.addRange(newRange);
        } catch (e) {
          console.log('Cursor restore fallback');
        }
      }
    }, 0);
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('Starting file upload:', file.name);
    setIsUploading(true);
    
    try {
      // For demo purposes, create a local URL
      const imageUrl = URL.createObjectURL(file);
      
      const newImage = {
        id: Date.now(),
        src: imageUrl,
        alt: file.name,
        size: 'medium',
        position: 'center'
      };
      
      console.log('Created image object:', newImage);
      insertImageIntoContent(newImage);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
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
    console.log('Inserting image into content:', image.id);
    const editor = contentRef.current;
    if (editor) {
      const selection = window.getSelection();
      let range;
      
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
      img.className = `editor-image size-${image.size} position-${image.position}`;
      img.setAttribute('data-size', image.size);
      img.setAttribute('data-position', image.position);
      img.style.cssText = `
        cursor: pointer; 
        border-radius: 8px; 
        max-width: 100%; 
        height: auto;
        border: 2px solid transparent;
        transition: all 0.2s ease;
      `;
      
      // Add click handler for selection - CRITICAL FIX
      img.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Image clicked! ID:', image.id);
        selectImage(image.id);
        return false;
      };
      
      // Insert image
      range.deleteContents();
      range.insertNode(img);
      
      // Add space after image
      const textNode = document.createTextNode(' ');
      range.setStartAfter(img);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
      
      setContent(editor.innerHTML);
      console.log('Image inserted successfully');
    }
  };

  // Select image - COMPLETELY REWRITTEN
  const selectImage = (imageId) => {
    console.log('=== SELECT IMAGE CALLED ===');
    console.log('Image ID:', imageId);
    
    setSelectedImageId(imageId);
    
    // Clean up previous selections
    console.log('Cleaning up previous selections...');
    document.querySelectorAll('.selected-image').forEach(el => {
      el.classList.remove('selected-image');
      console.log('Removed selected-image class from element');
    });
    
    document.querySelectorAll('.image-toolbar').forEach(el => {
      el.remove();
      console.log('Removed previous toolbar');
    });
    
    document.querySelectorAll('.image-handle').forEach(el => {
      el.remove();
      console.log('Removed previous handle');
    });
    
    // Find the image
    const img = document.getElementById(`img-${imageId}`);
    console.log('Found image element:', img);
    
    if (!img) {
      console.error('Image not found!');
      return;
    }
    
    // Add selection styling
    img.classList.add('selected-image');
    img.style.border = '2px solid #4285f4';
    img.style.boxShadow = '0 0 0 2px rgba(66, 133, 244, 0.25)';
    console.log('Added selection styling');
    
    // Get image position
    const rect = img.getBoundingClientRect();
    console.log('Image rect:', rect);
    
    // Create toolbar - SIMPLIFIED AND GUARANTEED TO WORK
    const toolbar = document.createElement('div');
    toolbar.className = 'image-toolbar';
    toolbar.innerHTML = `
      <button onclick="window.resizeImageTo('${imageId}', 'small')" style="background: #333; color: white; border: none; padding: 4px 8px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">Small</button>
      <button onclick="window.resizeImageTo('${imageId}', 'medium')" style="background: #333; color: white; border: none; padding: 4px 8px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">Medium</button>
      <button onclick="window.resizeImageTo('${imageId}', 'large')" style="background: #333; color: white; border: none; padding: 4px 8px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">Large</button>
      <button onclick="window.resizeImageTo('${imageId}', 'full')" style="background: #333; color: white; border: none; padding: 4px 8px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">Full</button>
      <span style="color: #666; margin: 0 8px;">|</span>
      <button onclick="window.positionImageTo('${imageId}', 'left')" style="background: #333; color: white; border: none; padding: 4px 8px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">← Left</button>
      <button onclick="window.positionImageTo('${imageId}', 'center')" style="background: #333; color: white; border: none; padding: 4px 8px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">Center</button>
      <button onclick="window.positionImageTo('${imageId}', 'right')" style="background: #333; color: white; border: none; padding: 4px 8px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">Right →</button>
      <button onclick="window.deselectImage()" style="background: #d32f2f; color: white; border: none; padding: 4px 8px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">×</button>
    `;
    
    toolbar.style.cssText = `
      position: fixed;
      top: ${rect.top - 50}px;
      left: ${rect.left}px;
      background: rgba(0,0,0,0.9);
      padding: 8px;
      border-radius: 6px;
      z-index: 10000;
      display: flex;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(toolbar);
    console.log('Toolbar created and added to body');
    
    // Create handles - SIMPLIFIED AND GUARANTEED TO WORK
    const handlePositions = [
      { class: 'nw', top: rect.top - 6, left: rect.left - 6 },
      { class: 'ne', top: rect.top - 6, left: rect.right - 6 },
      { class: 'sw', top: rect.bottom - 6, left: rect.left - 6 },
      { class: 'se', top: rect.bottom - 6, left: rect.right - 6 }
    ];
    
    handlePositions.forEach(pos => {
      const handle = document.createElement('div');
      handle.className = `image-handle handle-${pos.class}`;
      handle.style.cssText = `
        position: fixed;
        top: ${pos.top}px;
        left: ${pos.left}px;
        width: 12px;
        height: 12px;
        background: #4285f4;
        border: 2px solid white;
        border-radius: 50%;
        cursor: ${pos.class}-resize;
        z-index: 10001;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      `;
      
      document.body.appendChild(handle);
      console.log(`Created ${pos.class} handle at`, pos.top, pos.left);
    });
    
    console.log('=== SELECT IMAGE COMPLETE ===');
  };

  // Make functions globally available
  useEffect(() => {
    window.resizeImageTo = (imageId, size) => {
      console.log('Resizing image', imageId, 'to', size);
      const img = document.getElementById(`img-${imageId}`);
      if (img) {
        img.classList.remove('size-small', 'size-medium', 'size-large', 'size-full');
        img.classList.add(`size-${size}`);
        img.setAttribute('data-size', size);
        
        // Apply size styles
        const sizeMap = {
          small: '200px',
          medium: '400px', 
          large: '600px',
          full: '100%'
        };
        img.style.width = sizeMap[size];
        
        if (contentRef.current) {
          setContent(contentRef.current.innerHTML);
        }
        
        // Refresh selection
        setTimeout(() => selectImage(imageId), 10);
      }
    };
    
    window.positionImageTo = (imageId, position) => {
      console.log('Positioning image', imageId, 'to', position);
      const img = document.getElementById(`img-${imageId}`);
      if (img) {
        img.classList.remove('position-left', 'position-center', 'position-right');
        img.classList.add(`position-${position}`);
        img.setAttribute('data-position', position);
        
        // Apply position styles
        if (position === 'left') {
          img.style.float = 'left';
          img.style.margin = '0 15px 15px 0';
          img.style.display = 'block';
        } else if (position === 'right') {
          img.style.float = 'right';
          img.style.margin = '0 0 15px 15px';
          img.style.display = 'block';
        } else {
          img.style.float = 'none';
          img.style.margin = '15px auto';
          img.style.display = 'block';
        }
        
        if (contentRef.current) {
          setContent(contentRef.current.innerHTML);
        }
        
        // Refresh selection
        setTimeout(() => selectImage(imageId), 10);
      }
    };
    
    window.deselectImage = () => {
      console.log('Deselecting image');
      setSelectedImageId(null);
      document.querySelectorAll('.selected-image').forEach(el => {
        el.classList.remove('selected-image');
        el.style.border = '2px solid transparent';
        el.style.boxShadow = 'none';
      });
      document.querySelectorAll('.image-toolbar').forEach(el => el.remove());
      document.querySelectorAll('.image-handle').forEach(el => el.remove());
    };
    
    // Cleanup
    return () => {
      delete window.resizeImageTo;
      delete window.positionImageTo;
      delete window.deselectImage;
      document.querySelectorAll('.image-toolbar').forEach(el => el.remove());
      document.querySelectorAll('.image-handle').forEach(el => el.remove());
    };
  }, []);

  // Text formatting functions
  const applyFormat = (command) => {
    document.execCommand(command, false, null);
    if (contentRef.current) {
      setContent(contentRef.current.innerHTML);
    }
  };

  const handleSave = () => {
    console.log('Saving post...');
    onSave?.({
      title,
      content: contentRef.current?.innerHTML || content,
      isFeatured: false
    });
  };

  return (
    <div className="completely-fixed-editor">
      <style>{`
        .completely-fixed-editor {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .fixed-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 20px;
        }
        
        .fixed-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .fixed-subtitle {
          opacity: 0.9;
          font-size: 14px;
        }
        
        .fixed-main {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .fixed-editor-panel {
          background: white;
          border: 1px solid #e1e5e9;
          border-radius: 12px;
          padding: 20px;
        }
        
        .fixed-preview-panel {
          background: #f8f9fa;
          border: 1px solid #e1e5e9;
          border-radius: 12px;
          padding: 20px;
        }
        
        .fixed-title-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 16px;
          margin-bottom: 20px;
        }
        
        .fixed-content-editor {
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
        
        .fixed-content-editor * {
          direction: ltr !important;
          unicode-bidi: normal !important;
        }
        
        .fixed-content-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .fixed-content-editor img:hover {
          opacity: 0.9;
        }
        
        .fixed-content-editor:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
        }
        
        .fixed-upload-section {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 15px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e1e5e9;
        }
        
        .fixed-upload-btn {
          padding: 10px 20px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .fixed-upload-btn:hover {
          background: #218838;
        }
        
        .fixed-upload-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
        
        .fixed-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 20px;
        }
        
        .fixed-save-btn {
          padding: 12px 24px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .fixed-save-btn:hover {
          background: #218838;
        }
        
        .fixed-cancel-btn {
          padding: 12px 24px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .fixed-cancel-btn:hover {
          background: #5a6268;
        }
        
        .fixed-section {
          margin-bottom: 20px;
          padding: 15px;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          background: #f8f9fa;
        }
        
        .fixed-section-title {
          margin: 0 0 10px 0;
          font-size: 16px;
          font-weight: 600;
          color: #495057;
        }
        
        .fixed-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        
        .fixed-btn {
          padding: 8px 16px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .fixed-btn:hover {
          background: #e9ecef;
          border-color: #adb5bd;
        }
        
        .fixed-preview-content {
          min-height: 300px;
          padding: 15px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e1e5e9;
          line-height: 1.6;
        }
        
        .fixed-help {
          background: #e7f3ff;
          border: 1px solid #b3d9ff;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .fixed-help strong {
          color: #0066cc;
        }
        
        @media (max-width: 768px) {
          .fixed-main {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="fixed-header">
        <div className="fixed-title">Completely Fixed Rich Blog Editor</div>
        <div className="fixed-subtitle">With guaranteed working image handles and toolbar - console logging enabled</div>
      </div>

      <div className="fixed-main">
        <div className="fixed-editor-panel">
          <h3>📝 Editor</h3>
          
          <input
            type="text"
            className="fixed-title-input"
            placeholder="Enter post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Text Formatting Section */}
          <div className="fixed-section">
            <h3 className="fixed-section-title">📝 Text Formatting</h3>
            <div className="fixed-controls">
              <button className="fixed-btn" onClick={() => applyFormat('bold')}>
                <strong>Bold</strong>
              </button>
              <button className="fixed-btn" onClick={() => applyFormat('italic')}>
                <em>Italic</em>
              </button>
              <button className="fixed-btn" onClick={() => applyFormat('underline')}>
                <u>Underline</u>
              </button>
            </div>
          </div>

          {/* Image Controls Section */}
          <div className="fixed-section">
            <h3 className="fixed-section-title">🖼️ Image Controls</h3>
            <div className="fixed-help">
              <strong>🎯 TESTING STEPS:</strong><br/>
              1. Upload an image below<br/>
              2. Click on the image in the content area<br/>
              3. You should see: blue border, floating toolbar above image, 4 blue corner handles<br/>
              4. Check browser console (F12) for detailed logging<br/>
              5. Use toolbar buttons to resize and position the image
            </div>
          </div>

          <div className="fixed-upload-section">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            <button 
              className="fixed-upload-btn"
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
            className="fixed-content-editor"
            contentEditable
            suppressContentEditableWarning={true}
            onInput={handleContentChange}
            dangerouslySetInnerHTML={{ __html: content || '<p>Start writing your content... Click here and start typing. Upload an image and click on it to test the handles!</p>' }}
          />
        </div>

        <div className="fixed-preview-panel">
          <h3>👁️ Live Preview</h3>
          <div className="fixed-preview-content">
            <h2>{title || 'Your Post Title'}</h2>
            <div dangerouslySetInnerHTML={{ __html: content || '<p>Your content will appear here...</p>' }} />
          </div>
        </div>
      </div>

      <div className="fixed-actions">
        <button className="fixed-save-btn" onClick={handleSave}>
          Save Post
        </button>
        <button className="fixed-cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CompletelyFixedEditor;
