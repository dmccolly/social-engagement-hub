import React, { useState, useRef, useEffect } from 'react';

/**
 * PatchedRichBlogEditor provides a richer blog-post editing
 * experience. It supports uploading images via Cloudinary,
 * inserting them into the text, selecting images to reveal
 * a floating toolbar, resizing images interactively, and
 * positioning them left, center, or right with true text wrap.
 *
 * This component is self-contained and does not depend on
 * external state management. To persist the result, supply
 * onSave and onCancel callbacks.
 */
const PatchedRichBlogEditor = ({ onSave, onCancel }) => {
  // Title and content state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const contentRef = useRef(null);
  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  // Currently selected image ID for toolbar/handles
  const [selectedImageId, setSelectedImageId] = useState(null);

  /**
   * Update the React state when content is edited.
   * Using innerHTML ensures we capture the markup (images,
   * formatting, etc.) instead of plain text.
   */
  const handleContentChange = (e) => {
    setContent(e.target.innerHTML);
  };

  /**
   * Persist the current blog post. The onSave callback
   * receives an object with title and content properties.
   */
  const handleSave = () => {
    if (onSave) {
      onSave({
        title,
        content: contentRef.current?.innerHTML || '',
      });
    }
  };

  // Sync the DOM when the content state changes from external sources.
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== content) {
      contentRef.current.innerHTML = content;
    }
  }, [content]);

  /**
   * Handle image uploads. Sends a POST request to Cloudinary
   * and, on success, inserts the uploaded image into the editor.
   */
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
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
      const newImage = {
        id: Date.now(),
        src: data.secure_url,
        alt: file.name,
        size: 'medium',
        position: 'center',
      };
      insertImageIntoContent(newImage);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error(error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Insert an image into the editor at the current cursor.
   * Also attaches a click handler so the image can be selected
   * later for resizing/positioning.
   */
  const insertImageIntoContent = (image) => {
    const editor = contentRef.current;
    if (!editor) return;
    const selection = window.getSelection();
    let range;
    if (selection && selection.rangeCount > 0) {
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
    img.style.cssText =
      'cursor:pointer; border-radius:8px; max-width:100%; height:auto;';
    img.setAttribute('data-size', image.size);
    img.setAttribute('data-position', image.position);
    img.addEventListener('click', (e) => {
      e.preventDefault();
      selectImage(image.id);
    });
    // Insert image and a trailing space for cursor movement
    range.deleteContents();
    range.insertNode(img);
    const spaceNode = document.createTextNode(' ');
    range.setStartAfter(img);
    range.insertNode(spaceNode);
    range.setStartAfter(spaceNode);
    range.setEndAfter(spaceNode);
    selection.removeAllRanges();
    selection.addRange(range);
    setContent(editor.innerHTML);
  };

  /**
   * Select an image by ID. Highlights the image, displays a toolbar
   * with resize and position options, and creates draggable
   * handles for interactive resizing.
   */
  const selectImage = (imageId) => {
    setSelectedImageId(imageId);
    // Clean up previous selection artifacts
    document
      .querySelectorAll('.selected-image')
      .forEach((el) => el.classList.remove('selected-image'));
    document.querySelectorAll('.resize-handle').forEach((el) => el.remove());
    document.querySelectorAll('.floating-toolbar').forEach((el) => el.remove());
    const img = document.getElementById(`img-${imageId}`);
    if (!img) return;
    img.classList.add('selected-image');
    // Create toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'floating-toolbar';
    toolbar.innerHTML = `
      <button class="toolbar-btn" data-size="small">Small</button>
      <button class="toolbar-btn" data-size="medium">Medium</button>
      <button class="toolbar-btn" data-size="large">Large</button>
      <button class="toolbar-btn" data-size="full">Full</button>
      <span class="toolbar-separator">|</span>
      <button class="toolbar-btn" data-pos="left">← Left</button>
      <button class="toolbar-btn" data-pos="center">Center</button>
      <button class="toolbar-btn" data-pos="right">Right →</button>
      <button class="toolbar-btn close-btn">×</button>
    `;
    // Attach click handlers for the toolbar buttons
    toolbar.querySelectorAll('button.toolbar-btn').forEach((btn) => {
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const size = btn.getAttribute('data-size');
        const pos = btn.getAttribute('data-pos');
        if (size) resizeImage(imageId, size);
        if (pos) positionImage(imageId, pos);
        if (btn.classList.contains('close-btn')) {
          img.classList.remove('selected-image');
          setSelectedImageId(null);
          toolbar.remove();
          document
            .querySelectorAll('.resize-handle')
            .forEach((el) => el.remove());
        }
      });
    });
    document.body.appendChild(toolbar);
    positionToolbar(toolbar, img);
    addResizeHandles(img, toolbar);
  };

  /**
   * Resize the selected image by applying a size class.
   */
  const resizeImage = (imageId, size) => {
    const img = document.getElementById(`img-${imageId}`);
    if (!img) return;
    img.classList.remove('size-small', 'size-medium', 'size-large', 'size-full');
    img.classList.add(`size-${size}`);
    img.setAttribute('data-size', size);
    setContent(contentRef.current?.innerHTML || '');
  };

  /**
   * Position the selected image left, center, or right.
   */
  const positionImage = (imageId, position) => {
    const img = document.getElementById(`img-${imageId}`);
    if (!img) return;
    img.classList.remove('position-left', 'position-center', 'position-right');
    img.classList.add(`position-${position}`);
    img.setAttribute('data-position', position);
    setContent(contentRef.current?.innerHTML || '');
  };

  /**
   * Position the floating toolbar relative to the selected image.
   */
  const positionToolbar = (toolbar, img) => {
    const rect = img.getBoundingClientRect();
    toolbar.style.position = 'fixed';
    toolbar.style.top = `${rect.top - 50}px`;
    toolbar.style.left = `${rect.left}px`;
    toolbar.style.zIndex = '1000';
  };

  /**
   * Create four corner handles for the selected image. Dragging a
   * handle resizes the image and repositions the handles and toolbar.
   */
  const addResizeHandles = (img, toolbar) => {
    const positions = ['nw', 'ne', 'sw', 'se'];
    const handles = [];
    // Update handle positions after resizing
    const updatePositions = () => {
      const rect = img.getBoundingClientRect();
      handles.forEach(({ pos, el }) => {
        if (pos.includes('n')) el.style.top = `${rect.top - 5}px`;
        if (pos.includes('s')) el.style.top = `${rect.bottom - 5}px`;
        if (pos.includes('w')) el.style.left = `${rect.left - 5}px`;
        if (pos.includes('e')) el.style.left = `${rect.right - 5}px`;
      });
      positionToolbar(toolbar, img);
    };
    positions.forEach((pos) => {
      const handleEl = document.createElement('div');
      handleEl.className = `resize-handle resize-${pos}`;
      handleEl.style.position = 'absolute';
      handleEl.style.width = '10px';
      handleEl.style.height = '10px';
      handleEl.style.backgroundColor = '#4285f4';
      handleEl.style.border = '2px solid white';
      handleEl.style.borderRadius = '50%';
      handleEl.style.cursor = `${pos}-resize`;
      handleEl.style.zIndex = '1001';
      // Initial placement
      const rect = img.getBoundingClientRect();
      if (pos.includes('n')) handleEl.style.top = `${rect.top - 5}px`;
      if (pos.includes('s')) handleEl.style.top = `${rect.bottom - 5}px`;
      if (pos.includes('w')) handleEl.style.left = `${rect.left - 5}px`;
      if (pos.includes('e')) handleEl.style.left = `${rect.right - 5}px`;
      // Drag logic
      handleEl.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        const startWidth = img.offsetWidth;
        const onMouseMove = (moveEvt) => {
          const dx = moveEvt.clientX - startX;
          let newWidth = pos.includes('e') ? startWidth + dx : startWidth - dx;
          newWidth = Math.max(newWidth, 50);
          img.style.width = `${newWidth}px`;
          img.style.height = 'auto';
          updatePositions();
        };
        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
          // Save updated content after resizing
          setContent(contentRef.current?.innerHTML || '');
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });
      document.body.appendChild(handleEl);
      handles.push({ pos, el: handleEl });
    });
  };

  // Expose handlers globally for toolbar buttons (if needed)
  useEffect(() => {
    window.resizeImage = resizeImage;
    window.positionImage = positionImage;
    window.setSelectedImageId = setSelectedImageId;
  }, []);

  return (
    <div className="patched-rich-blog-editor">
      {/* Inline styles for the editor and toolbar */}
      <style>{`
        .patched-rich-blog-editor img {
          max-width: 100%;
          height: auto;
          border: 2px solid transparent;
          border-radius: 4px;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .patched-rich-blog-editor img:hover {
          border-color: #667eea;
        }
        .patched-rich-blog-editor img.selected-image {
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
        }
        .patched-rich-blog-editor img.size-small { width: 200px; }
        .patched-rich-blog-editor img.size-medium { width: 400px; }
        .patched-rich-blog-editor img.size-large { width: 600px; }
        .patched-rich-blog-editor img.size-full { width: 100%; }
        .patched-rich-blog-editor img.position-left {
          float: left;
          margin: 0 15px 15px 0;
        }
        .patched-rich-blog-editor img.position-right {
          float: right;
          margin: 0 0 15px 15px;
        }
        .patched-rich-blog-editor img.position-center {
          display: block;
          margin: 15px auto;
        }
        .floating-toolbar {
          background: #333;
          color: white;
          padding: 5px 10px;
          border-radius: 5px;
          display: flex;
          gap: 5px;
          align-items: center;
        }
        .toolbar-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 14px;
        }
        .toolbar-separator {
          color: #666;
        }
        .close-btn {
          font-weight: bold;
        }
      `}</style>
      <input
        type="text"
        placeholder="Enter post title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-4 py-3 text-2xl font-bold border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
      />
      <div className="simple-upload-section mb-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="simple-upload-btn px-4 py-2 bg-blue-500 text-white rounded"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </div>
      <div
        ref={contentRef}
        contentEditable
        onInput={handleContentChange}
        className="w-full min-h-[600px] p-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ direction: 'ltr' }}
        dangerouslySetInnerHTML={{ __html: content }}
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

export default PatchedRichBlogEditor;
