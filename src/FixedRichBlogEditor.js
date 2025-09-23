import React, { useState, useRef, useEffect } from 'react';

const FixedRichBlogEditor = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const contentRef = useRef(null);

  // Handle content change - FIXED VERSION
  const handleContentChange = () => {
    if (contentRef.current) {
      setContent(contentRef.current.innerHTML);
    }
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
        insertImageIntoContent(newImage);
        
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
      
      if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
      } else {
        range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
      }
      
      const img = document.createElement('img');
      img.id = `img-${image.id}`;
      img.src = image.src;
      img.alt = image.alt;
      img.className = `size-${image.size} position-${image.position}`;
      img.setAttribute('data-size', image.size);
      img.setAttribute('data-position', image.position);
      img.style.cssText = 'cursor: pointer; border-radius: 8px; max-width: 100%; height: auto;';
      
      img.addEventListener('click', (e) => {
        e.preventDefault();
        selectImage(image.id);
      });
      
      range.deleteContents();
      range.insertNode(img);
      
      const textNode = document.createTextNode(' ');
      range.setStartAfter(img);
      range.insertNode(textNode);
      
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
      
      handleContentChange();
    }
  };

  // Select image
  const selectImage = (imageId) => {
    setSelectedImageId(imageId);
    
    document.querySelectorAll('.selected-image').forEach(el => {
      el.classList.remove('selected-image');
    });
    document.querySelectorAll('.resize-handle').forEach(el => {
      el.remove();
    });
    document.querySelectorAll('.floating-toolbar').forEach(el => {
      el.remove();
    });
    
    const img = document.getElementById(`img-${imageId}`);
    if (img) {
      img.classList.add('selected-image');
      
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
      
      const rect = img.getBoundingClientRect();
      toolbar.style.position = 'fixed';
      toolbar.style.top = (rect.top - 50) + 'px';
      toolbar.style.left = rect.left + 'px';
      toolbar.style.zIndex = '1000';
      
      document.body.appendChild(toolbar);
    }
  };

  // Resize image function
  const resizeImage = (imageId, size) => {
    const img = document.getElementById(`img-${imageId}`);
    if (img) {
      img.classList.remove('size-small', 'size-medium', 'size-large', 'size-full');
      img.classList.add(`size-${size}`);
      img.setAttribute('data-size', size);
      
      handleContentChange();
    }
  };

  // Position image function
  const positionImage = (imageId, position) => {
    const img = document.getElementById(`img-${imageId}`);
    if (img) {
      img.classList.remove('position-left', 'position-center', 'position-right');
      img.classList.add(`position-${position}`);
      img.setAttribute('data-position', position);
      
      handleContentChange();
    }
  };

  // Make functions globally available
  useEffect(() => {
    window.selectImage = selectImage;
    window.resizeImage = resizeImage;
    window.positionImage = positionImage;
    window.setSelectedImageId = setSelectedImageId;
  }, []);

  const handleSave = () => {
    onSave?.({
      title,
      content: contentRef.current?.innerHTML || '',
    });
  };

  return (
    <div className="fixed-rich-blog-editor">
      <style>{`
        .fixed-rich-blog-editor img {
          max-width: 100%;
          height: auto;
          border: 2px solid transparent;
          border-radius: 4px;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .fixed-rich-blog-editor img:hover {
          border-color: #667eea;
        }
        .fixed-rich-blog-editor img.selected-image {
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
        }
        .fixed-rich-blog-editor img.size-small {
          width: 200px;
        }
        .fixed-rich-blog-editor img.size-medium {
          width: 400px;
        }
        .fixed-rich-blog-editor img.size-large {
          width: 600px;
        }
        .fixed-rich-blog-editor img.size-full {
          width: 100%;
        }
        .fixed-rich-blog-editor img.position-left {
          float: left;
          margin: 0 15px 15px 0;
        }
        .fixed-rich-blog-editor img.position-right {
          float: right;
          margin: 0 0 15px 15px;
        }
        .fixed-rich-blog-editor img.position-center {
          display: block;
          margin: 15px auto;
        }
        .floating-toolbar {
          position: fixed;
          background: #333;
          color: white;
          padding: 5px 10px;
          border-radius: 5px;
          display: flex;
          gap: 5px;
          align-items: center;
          z-index: 1000;
        }
        .toolbar-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 2px 5px;
        }
        .toolbar-btn:hover {
          background: rgba(255,255,255,0.2);
        }
        .toolbar-separator {
          color: #666;
        }
        .close-btn {
          font-weight: bold;
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
      `}</style>
      
      <input
        type="text"
        placeholder="Enter post title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-4 py-3 text-2xl font-bold border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
      />
      
      <div className="upload-section">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="upload-btn"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </button>
        {isUploading && <span>Please wait...</span>}
      </div>
      
      <div
        ref={contentRef}
        contentEditable={true}
        onInput={handleContentChange}
        className="w-full min-h-[300px] p-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ 
          direction: 'ltr',
          textAlign: 'left',
          unicodeBidi: 'normal'
        }}
        suppressContentEditableWarning={true}
      />
      
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default FixedRichBlogEditor;
