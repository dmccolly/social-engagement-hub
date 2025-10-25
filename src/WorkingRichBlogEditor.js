import React, { useState, useRef, useEffect } from 'react';

/**
 * WorkingRichBlogEditor
 *
 * This component powers the blog post creation experience within the
 * Social Engagement Hub.  It offers a content‑editable canvas with
 * formatting controls, image uploads via Cloudinary and alignment/sizing
 * tools.  In this patched version we address several shortcomings of
 * earlier builds:
 *
 * - Images loaded from existing content now always have `data-size` and
 *   `data-position` attributes and matching CSS classes applied.  Without
 *   these defaults the image toolbar could not determine how to apply
 *   subsequent sizing/positioning actions (see attachImageListeners).
 * - A new Delete button is added to the floating toolbar allowing users
 *   to remove an inserted image entirely from the editor.  This button
 *   calls a new global function `deleteImage` which cleans up the
 *   resizable wrapper and updates the content state accordingly.
 * - When manually resizing an image the dataset `data-size` is set to
 *   `custom`, ensuring later size changes via the toolbar are applied
 *   correctly.
 */
const WorkingRichBlogEditor = ({ onSave, onCancel, editingPost, isSaving }) => {
  // State management
  const [title, setTitle] = useState(editingPost?.title || '');
  const [content, setContent] = useState(editingPost?.content || '');
  const [images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isFeatured, setIsFeatured] = useState(editingPost?.featured || false);
  const [isPinned, setIsPinned] = useState(editingPost?.pinned || false);
  const [scheduleDate, setScheduleDate] = useState(editingPost?.scheduled_date || '');
  const [scheduleTime, setScheduleTime] = useState(editingPost?.scheduled_time || '');
  const [isScheduled, setIsScheduled] = useState(editingPost?.is_scheduled || false);
  const fileInputRef = useRef(null);
  const contentRef = useRef(null);

  // Local state for inserting media by URL
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('image');

  // When editing a post, populate the editor with the post's existing data
  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || '');
      setContent(editingPost.content || '');
      setIsFeatured(editingPost.featured || false);
      setIsPinned(editingPost.pinned || false);
      setScheduleDate(editingPost.scheduled_date || '');
      setScheduleTime(editingPost.scheduled_time || '');
      setIsScheduled(editingPost.is_scheduled || false);
      if (contentRef.current) {
        contentRef.current.innerHTML = editingPost.content || '';
        attachImageListeners();
      }
    } else if (contentRef.current && !contentRef.current.innerHTML) {
      contentRef.current.innerHTML = '<p>Start writing your content... Click here and start typing.</p>';
    }
  }, [editingPost]);

  /**
   * Attach listeners to every <img> tag in the editor.  This function
   * ensures that images loaded from saved posts have the necessary
   * dataset attributes and CSS classes so that sizing/positioning work
   * predictably.  It also binds a click handler that summons the
   * floating toolbar when an image is clicked.
   */
  const attachImageListeners = () => {
    if (!contentRef.current) return;
    const imgs = contentRef.current.querySelectorAll('img');
    imgs.forEach((img, index) => {
      // Assign a stable id to each image if missing
      if (!img.id) {
        img.id = `img-${Date.now()}-${index}`;
      }
      // Always show pointer cursor for images
      img.style.cursor = 'pointer';
      // Provide default dataset attributes and classes if absent
      if (!img.getAttribute('data-size')) {
        img.setAttribute('data-size', 'medium');
      }
      if (!img.getAttribute('data-position')) {
        img.setAttribute('data-position', 'center');
      }
      const sizeClasses = ['size-small', 'size-medium', 'size-large', 'size-full'];
      const posClasses = ['position-left', 'position-center', 'position-right'];
      if (!sizeClasses.some(cls => img.classList.contains(cls))) {
        img.classList.add('size-medium');
      }
      if (!posClasses.some(cls => img.classList.contains(cls))) {
        img.classList.add('position-center');
      }
      // Click handler to select the image and show toolbar
      img.onclick = (e) => {
        e.preventDefault();
        const imageId = img.id.replace('img-', '');
        // Use global selectImage to allow enhanced behaviour
        if (window.selectImage) window.selectImage(imageId);
        else selectImage(imageId);
      };
    });
  };

  // Sync content state on blur (loss of focus) from the content area
  const handleContentChange = () => {
    if (contentRef.current) {
      setContent(contentRef.current.innerHTML);
    }
  };

  /**
   * Upload an image to Cloudinary and insert it into the editor at the
   * current cursor position.  The new image is tracked in the images
   * state array, though the array is not currently used elsewhere.
   */
  const handleFileUpload = async (event) => {
    const file = event.target?.files?.[0];
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
          height: 'auto',
        };
        setImages(prev => [...prev, newImage]);
        // Wait briefly to ensure selection exists before inserting
        setTimeout(() => insertImageIntoContent(newImage), 50);
      } else {
        alert('Upload failed. Please try again.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /**
   * Create an <img> element from the provided image descriptor and insert
   * it into the editor at the current cursor location.  Assigns
   * dataset attributes and classes for size and position so that the
   * toolbar can operate on it later.
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
    img.setAttribute('data-size', image.size);
    img.setAttribute('data-position', image.position);
    img.style.cursor = 'pointer';
    img.addEventListener('click', (e) => {
      e.preventDefault();
      // Use the globally assigned selectImage handler so updates apply
      if (window.selectImage) window.selectImage(image.id);
      else selectImage(image.id);
    });
    // Insert image into document
    range.deleteContents();
    range.insertNode(img);
    // Add a trailing space to allow cursor movement
    const space = document.createTextNode(' ');
    range.setStartAfter(img);
    range.insertNode(space);
    range.setStartAfter(space);
    range.setEndAfter(space);
    selection?.removeAllRanges();
    selection?.addRange(range);
    setContent(editor.innerHTML);
  };

  /**
   * Called when an image is clicked.  Wraps the image in a resizable
   * container (if not already wrapped) and displays the floating toolbar
   * for size/position/deletion controls.  Only one image can be selected
   * at a time.
   */
  const selectImage = (imageId) => {
    setSelectedImageId(imageId);
    // Clean up any previous selection, handles and toolbars
    document.querySelectorAll('.selected-image').forEach((el) => el.classList.remove('selected-image'));
    document.querySelectorAll('.resize-handle').forEach((el) => el.remove());
    document.querySelectorAll('.floating-toolbar').forEach((el) => el.remove());
    const img = document.getElementById(`img-${imageId}`);
    if (!img) return;
    img.classList.add('selected-image');
    // Helper to reposition toolbar and handles
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
      <span class="toolbar-separator">|</span>
      <button onclick="window.deleteImage('${imageId}')" class="toolbar-btn" style="color:#dc3545;">Delete</button>
      <button onclick="window.clearImageSelection()" class="toolbar-btn close-btn">×</button>
    `;
    document.body.appendChild(toolbar);
    // Create corner handles on document body
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
          if (contentRef.current) setContent(contentRef.current.innerHTML);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
      document.body.appendChild(handle);
      handles.push({ pos, el: handle });
    });
    // Initial placement
    updatePositions(toolbar, handles);
  };

  /**
   * Resize an image to a named size (small, medium, large, full).  Clears
   * any inline width/height set by manual resizing and updates the
   * corresponding dataset attribute.
   */
  const resizeImage = (imageId, size) => {
    const img = document.getElementById(`img-${imageId}`);
    if (!img) return;
    // Reset inline sizing so class widths take effect
    img.style.width = '';
    img.style.height = '';
    img.classList.remove('size-small', 'size-medium', 'size-large', 'size-full');
    img.classList.add(`size-${size}`);
    img.setAttribute('data-size', size);
    if (contentRef.current) setContent(contentRef.current.innerHTML);
  };

  /**
   * Adjust the float/alignment of an image.  Updates both the class and
   * dataset attribute so the preview and subsequent interactions stay in
   * sync.
   */
  const positionImage = (imageId, position) => {
    const img = document.getElementById(`img-${imageId}`);
    if (!img) return;
    img.classList.remove('position-left', 'position-center', 'position-right');
    img.classList.add(`position-${position}`);
    img.setAttribute('data-position', position);
    if (contentRef.current) setContent(contentRef.current.innerHTML);
  };

  /**
   * Delete an image and its resizing wrapper from the editor.  Clears
   * selection state, removes floating toolbars and updates the content.
   */
  const deleteImage = (imageId) => {
    const img = document.getElementById(`img-${imageId}`);
    if (!img) return;
    const wrapper = img.parentElement;
    if (wrapper && wrapper.classList.contains('image-wrapper-resizable')) {
      wrapper.remove();
    } else {
      img.remove();
    }
    // Remove toolbars and clear selection
    document.querySelectorAll('.floating-toolbar').forEach(el => el.remove());
    setSelectedImageId(null);
    if (contentRef.current) setContent(contentRef.current.innerHTML);
  };

  /**
   * Enhanced image selection handler. This variant does not wrap the
   * image in a container. Instead, it draws resize handles on the
   * document body and positions a floating toolbar relative to the
   * image. This avoids disrupting text flow when floating or
   * positioning images and makes selection of subsequent images more
   * reliable. Use window.selectImage to call this function.
   */
  const enhancedSelectImage = (imageId) => {
    setSelectedImageId(imageId);
    // Clear previous selections, handles and toolbars
    document.querySelectorAll('.selected-image').forEach((el) => el.classList.remove('selected-image'));
    document.querySelectorAll('.resize-handle').forEach((el) => el.remove());
    document.querySelectorAll('.floating-toolbar').forEach((el) => el.remove());
    const img = document.getElementById(`img-${imageId}`);
    if (!img) return;
    img.classList.add('selected-image');
    // Helper to reposition toolbar and handles relative to image
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
    // Create floating toolbar with controls
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
    // Create corner resize handles on document body
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
          if (contentRef.current) setContent(contentRef.current.innerHTML);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
      document.body.appendChild(handle);
      handles.push({ pos, el: handle });
    });
    // Initial placement of toolbar and handles
    updatePositions(toolbar, handles);
  };

  /**
   * Insert a media element into the editor based on a URL supplied by the
   * user.  Supports images, videos, audio and YouTube embeds.  Images
   * leverage the existing insertImageIntoContent routine so they can be
   * resized and positioned using the toolbar.  Other media types are
   * inserted as their native HTML tags with controls enabled.
   */
  const handleInsertByUrl = () => {
    const url = mediaUrl.trim();
    if (!url) return;
    if (mediaType === 'image') {
      const newImage = {
        id: Date.now(),
        src: url,
        alt: 'Embedded image',
        size: 'medium',
        position: 'center',
        width: 400,
        height: 'auto',
      };
      insertImageIntoContent(newImage);
    } else if (mediaType === 'video') {
      const editor = contentRef.current;
      if (editor) {
        const selection = window.getSelection();
        let range;
        if (selection && selection.rangeCount > 0) {
          range = selection.getRangeAt(0);
        } else {
          range = document.createRange();
          range.selectNodeContents(editor);
          range.collapse(false);
        }
        const videoEl = document.createElement('video');
        videoEl.src = url;
        videoEl.controls = true;
        videoEl.className = 'size-medium position-center';
        videoEl.setAttribute('data-size', 'medium');
        videoEl.setAttribute('data-position', 'center');
        range.deleteContents();
        range.insertNode(videoEl);
        const space = document.createTextNode(' ');
        range.setStartAfter(videoEl);
        range.insertNode(space);
        range.setStartAfter(space);
        range.setEndAfter(space);
        selection?.removeAllRanges();
        selection?.addRange(range);
        setContent(editor.innerHTML);
      }
    } else if (mediaType === 'audio') {
      const editor = contentRef.current;
      if (editor) {
        const selection = window.getSelection();
        let range;
        if (selection && selection.rangeCount > 0) {
          range = selection.getRangeAt(0);
        } else {
          range = document.createRange();
          range.selectNodeContents(editor);
          range.collapse(false);
        }
        const audioEl = document.createElement('audio');
        audioEl.src = url;
        audioEl.controls = true;
        range.deleteContents();
        range.insertNode(audioEl);
        const space = document.createTextNode(' ');
        range.setStartAfter(audioEl);
        range.insertNode(space);
        range.setStartAfter(space);
        range.setEndAfter(space);
        selection?.removeAllRanges();
        selection?.addRange(range);
        setContent(editor.innerHTML);
      }
    } else if (mediaType === 'youtube') {
      const editor = contentRef.current;
      if (editor) {
        const selection = window.getSelection();
        let range;
        if (selection && selection.rangeCount > 0) {
          range = selection.getRangeAt(0);
        } else {
          range = document.createRange();
          range.selectNodeContents(editor);
          range.collapse(false);
        }
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.width = '560';
        iframe.height = '315';
        iframe.allowFullscreen = true;
        iframe.style.display = 'block';
        iframe.style.margin = '15px auto';
        range.deleteContents();
        range.insertNode(iframe);
        const space = document.createTextNode(' ');
        range.setStartAfter(iframe);
        range.insertNode(space);
        range.setStartAfter(space);
        range.setEndAfter(space);
        selection?.removeAllRanges();
        selection?.addRange(range);
        setContent(editor.innerHTML);
      }
    }
    setMediaUrl('');
  };

  /**
   * Clear the current image selection and close any floating toolbars.  This
   * function can be called from the toolbar to hide itself.  It removes
   * selected classes and resize handles, resets the selectedImageId state
   * and cleans up existing toolbars.
   */
  const clearImageSelection = () => {
    setSelectedImageId(null);
    document.querySelectorAll('.selected-image').forEach(el => el.classList.remove('selected-image'));
    document.querySelectorAll('.resize-handle').forEach(el => el.remove());
    document.querySelectorAll('.floating-toolbar').forEach(el => el.remove());
  };

  // Text formatting commands
  const applyFormat = (command) => {
    document.execCommand(command, false, null);
    if (contentRef.current) setContent(contentRef.current.innerHTML);
  };
  const applyFontFamily = (fontFamily) => {
    document.execCommand('fontName', false, fontFamily);
    if (contentRef.current) setContent(contentRef.current.innerHTML);
  };
  const applyFontSize = (fontSize) => {
    document.execCommand('fontSize', false, '7');
    document.querySelectorAll('font[size="7"]').forEach(el => {
      el.removeAttribute('size');
      el.style.fontSize = fontSize;
    });
    if (contentRef.current) setContent(contentRef.current.innerHTML);
  };
  const applyTextColor = (color) => {
    document.execCommand('foreColor', false, color);
    if (contentRef.current) setContent(contentRef.current.innerHTML);
  };
  const applyHeading = (heading) => {
    if (heading === 'normal') {
      document.execCommand('formatBlock', false, 'div');
    } else {
      document.execCommand('formatBlock', false, heading);
    }
    if (contentRef.current) setContent(contentRef.current.innerHTML);
  };
  const applyAlignment = (alignment) => {
    document.execCommand('justify' + alignment.charAt(0).toUpperCase() + alignment.slice(1), false, null);
    if (contentRef.current) setContent(contentRef.current.innerHTML);
  };
  const addLink = () => {
    const url = document.getElementById('linkUrl')?.value;
    if (url) {
      document.execCommand('createLink', false, url);
      if (contentRef.current) setContent(contentRef.current.innerHTML);
      document.getElementById('linkUrl').value = '';
    }
  };
  const removeLink = () => {
    document.execCommand('unlink', false, null);
    if (contentRef.current) setContent(contentRef.current.innerHTML);
  };

  // Expose helper functions globally for toolbar onclicks and populate
  // initial content.  A timeout is used so that the DOM is ready when
  // attaching image listeners.  We also clean up toolbars on unmount.
  useEffect(() => {
    // Use enhancedSelectImage for improved selection and resizing behaviour
    window.selectImage = enhancedSelectImage;
    window.resizeImage = resizeImage;
    window.positionImage = positionImage;
    window.deleteImage = deleteImage;
    window.setSelectedImageId = setSelectedImageId;
    window.clearImageSelection = clearImageSelection;
    setTimeout(() => {
      if (contentRef.current && !contentRef.current.innerHTML) {
        contentRef.current.innerHTML = content || '<p>Start writing your content... Click here and start typing.</p>';
      }
      attachImageListeners();
    }, 100);
    return () => {
      document.querySelectorAll('.floating-toolbar').forEach(el => el.remove());
    };
  }, []);

  // Prepare a data object and call the provided onSave callback
  const handleSave = () => {
    const postData = {
      title,
      content: contentRef.current?.innerHTML || content,
      featured: isFeatured,
      pinned: isPinned,
      is_scheduled: isScheduled,
      scheduled_date: isScheduled ? scheduleDate : null,
      scheduled_time: isScheduled ? scheduleTime : null,
    };
    if (isScheduled && scheduleDate && scheduleTime) {
      postData.scheduled_datetime = `${scheduleDate}T${scheduleTime}:00`;
    }
    onSave?.(postData);
  };

  // The JSX returned below replicates the original editor UI.  Only
  // minor additions (e.g., the delete button in the toolbar) are
  // implemented via dynamic HTML above.  The structure remains the
  // same as before to avoid unexpected layout changes.
  return (
    <div className="working-rich-blog-editor">
      <style>{`
        .working-rich-blog-editor {
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
          border-radius: 4px;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .content-editor img:hover {
          border-color: #667eea;
        }
        .content-editor img.selected-image {
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
        }
        .content-editor img.size-small { width: 200px; }
        .content-editor img.size-medium { width: 400px; }
        .content-editor img.size-large { width: 600px; }
        .content-editor img.size-full { width: 100%; }
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
        .upload-btn:hover { background: #218838; }
        .upload-btn:disabled { background: #6c757d; cursor: not-allowed; }
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
        .save-btn:hover { background: #218838; }
        .cancel-btn {
          padding: 12px 24px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        .cancel-btn:hover { background: #5a6268; }
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
        .toolbar-separator { color: #666; }
        .close-btn { font-weight: bold; }
        .preview-content {
          min-height: 300px;
          padding: 15px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e1e5e9;
          line-height: 1.6;
        }
        .preview-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        .preview-content img.size-small { width: 200px; }
        .preview-content img.size-medium { width: 400px; }
        .preview-content img.size-large { width: 600px; }
        .preview-content img.size-full { width: 100%; }
        .preview-content img.position-left {
          float: left;
          margin: 0 15px 15px 0;
          clear: left;
        }
        .preview-content img.position-right {
          float: right;
          margin: 0 0 15px 15px;
          clear: right;
        }
        .preview-content img.position-center {
          display: block;
          margin: 15px auto;
          float: none;
        }
        @media (max-width: 768px) {
          .editor-main { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="editor-header">
        <div className="editor-title">Rich Blog Editor</div>
        <div className="editor-subtitle">Full formatting tools with image upload and positioning</div>
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
            style={{ fontWeight: 'bold', fontSize: '18px' }}
          />
          {/* Post Options Section */}
          <div className="section">
            <h3 className="section-title">⚙️ Post Options</h3>
            <div className="controls">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: '500' }}>⭐ Feature this post (show first)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginLeft: '20px' }}>
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: '500' }}>📌 Pin to top</span>
              </label>
            </div>
          </div>
          {/* Scheduling Section */}
          <div className="section">
            <h3 className="section-title">📅 Schedule Post</h3>
            <div className="controls" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '10px' }}>
                <input
                  type="checkbox"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: '500' }}>Schedule this post for later</span>
              </label>
              {isScheduled && (
                <div style={{ display: 'flex', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="input"
                      style={{ width: '100%' }}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div style={{ flex: '1', minWidth: '150px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>
                      Time
                    </label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="input"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              )}
              {isScheduled && scheduleDate && scheduleTime && (
                <div style={{ marginTop: '10px', padding: '10px', background: '#e3f2fd', borderRadius: '4px', fontSize: '14px' }}>
                  📅 Post will be published on {new Date(`${scheduleDate}T${scheduleTime}`).toLocaleString()}
                </div>
              )}
            </div>
          </div>
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
              <button className="btn" onClick={() => applyAlignment('left')}>← Left</button>
              <button className="btn" onClick={() => applyAlignment('center')}>Center</button>
              <button className="btn" onClick={() => applyAlignment('right')}>Right →</button>
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
              <button className="btn" onClick={addLink}>Add Link</button>
              <button className="btn" onClick={removeLink}>Remove Link</button>
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

          {/* Insert Media by URL Section */}
          <div className="section">
            <h3 className="section-title">🎞️ Insert Media by URL</h3>
            <div className="controls" style={{ flexWrap: 'wrap' }}>
              <input
                type="url"
                placeholder="https://..."
                className="input"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                style={{ flexGrow: 1 }}
              />
              <select
                className="select"
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                style={{ minWidth: '120px' }}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="youtube">YouTube</option>
              </select>
              <button className="btn" onClick={handleInsertByUrl} style={{ whiteSpace: 'nowrap' }}>
                Insert
              </button>
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
              Paste a Cloudinary URL or YouTube link, choose the media type and click Insert.
            </p>
          </div>
          <div
            ref={contentRef}
            className="content-editor"
            contentEditable
            suppressContentEditableWarning={true}
            onBlur={handleContentChange}
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
        <button className="save-btn" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Post'}
        </button>
        <button className="cancel-btn" onClick={onCancel} disabled={isSaving}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default WorkingRichBlogEditor;
