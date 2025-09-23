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
    const imageHtml = `<img 
      id="img-${image.id}" 
      src="${image.src}" 
      alt="${image.alt}"
      data-size="${image.size}"
      data-position="${image.position}"
      style="width: ${image.width}px; height: auto; cursor: pointer; border-radius: 8px; margin: 10px;"
      onclick="selectImage(${image.id})"
    />`;
    
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
    
    // Remove previous selections
    document.querySelectorAll('.selected-image').forEach(el => {
      el.classList.remove('selected-image');
    });
    
    // Add selection to clicked image
    const imgElement = document.getElementById(`img-${imageId}`);
    if (imgElement) {
      imgElement.classList.add('selected-image');
      showImageToolbar(imgElement, imageId);
    }
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

  // Make selectImage globally available
  React.useEffect(() => {
    window.selectImage = selectImage;
    return () => {
      delete window.selectImage;
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
        
        .selected-image {
          border: 3px solid #667eea !important;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.25) !important;
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

          <div className="simple-help">
            <strong>🎯 How to use:</strong><br/>
            1. Upload an image below<br/>
            2. Click on any image in the content to select it<br/>
            3. Use the floating toolbar to resize (Small/Medium/Large/Full)<br/>
            4. Use the floating toolbar to position (Left/Center/Right)<br/>
            5. Images will show blue selection border when selected
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
