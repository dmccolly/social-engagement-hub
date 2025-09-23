import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Heading from '@tiptap/extension-heading';
import Youtube from '@tiptap/extension-youtube';

const WorkingImageEditor = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [previewContent, setPreviewContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageSize, setImageSize] = useState('medium');
  const [imagePosition, setImagePosition] = useState('center');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState('16');
  const [textColor, setTextColor] = useState('#000000');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Custom Image extension with proper node view
  const CustomImage = Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        width: {
          default: null,
        },
        height: {
          default: null,
        },
        'data-size': {
          default: 'medium',
        },
        'data-position': {
          default: 'center',
        },
        style: {
          default: null,
        },
        class: {
          default: 'editable-image',
        },
      };
    },

    addNodeView() {
      return ({ node, getPos, editor }) => {
        const container = document.createElement('div');
        container.className = 'image-container';
        
        const img = document.createElement('img');
        img.src = node.attrs.src;
        img.alt = node.attrs.alt || '';
        img.className = 'editable-image';
        img.setAttribute('data-size', node.attrs['data-size'] || 'medium');
        img.setAttribute('data-position', node.attrs['data-position'] || 'center');
        
        // Apply size and position styles
        this.updateImageStyles(img, node.attrs['data-size'], node.attrs['data-position']);
        
        // Add click handler for selection
        img.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.selectImage(img, getPos, editor);
        });
        
        container.appendChild(img);
        return {
          dom: container,
          update: (updatedNode) => {
            if (updatedNode.type.name !== 'image') return false;
            img.src = updatedNode.attrs.src;
            img.alt = updatedNode.attrs.alt || '';
            img.setAttribute('data-size', updatedNode.attrs['data-size'] || 'medium');
            img.setAttribute('data-position', updatedNode.attrs['data-position'] || 'center');
            this.updateImageStyles(img, updatedNode.attrs['data-size'], updatedNode.attrs['data-position']);
            return true;
          },
        };
      };
    },

    updateImageStyles(img, size, position) {
      // Size styles
      const sizeMap = {
        small: { width: '200px', maxWidth: '200px' },
        medium: { width: '400px', maxWidth: '400px' },
        large: { width: '600px', maxWidth: '600px' },
        full: { width: '100%', maxWidth: '100%' }
      };
      
      // Position styles
      const positionMap = {
        left: { float: 'left', margin: '0 20px 20px 0' },
        center: { display: 'block', margin: '20px auto' },
        right: { float: 'right', margin: '0 0 20px 20px' }
      };
      
      const sizeStyle = sizeMap[size] || sizeMap.medium;
      const positionStyle = positionMap[position] || positionMap.center;
      
      Object.assign(img.style, {
        ...sizeStyle,
        ...positionStyle,
        height: 'auto',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      });
    },

    selectImage(img, getPos, editor) {
      // Remove previous selections
      document.querySelectorAll('.editable-image').forEach(el => {
        el.classList.remove('selected-image');
      });
      
      // Add selection to clicked image
      img.classList.add('selected-image');
      
      // Show floating toolbar
      this.showImageToolbar(img, getPos, editor);
    },

    showImageToolbar(img, getPos, editor) {
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
        top: ${img.getBoundingClientRect().top - 60}px;
        left: ${img.getBoundingClientRect().left}px;
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
      ['Small', 'Medium', 'Large', 'Full'].forEach(size => {
        const btn = document.createElement('button');
        btn.textContent = size;
        btn.style.cssText = `
          padding: 4px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 12px;
        `;
        btn.addEventListener('click', () => {
          this.resizeImage(img, size.toLowerCase(), getPos, editor);
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
          this.repositionImage(img, positions[index], getPos, editor);
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
        img.classList.remove('selected-image');
      });
      toolbar.appendChild(closeBtn);
      
      document.body.appendChild(toolbar);
      
      // Remove toolbar when clicking elsewhere
      setTimeout(() => {
        const clickHandler = (e) => {
          if (!toolbar.contains(e.target) && e.target !== img) {
            toolbar.remove();
            img.classList.remove('selected-image');
            document.removeEventListener('click', clickHandler);
          }
        };
        document.addEventListener('click', clickHandler);
      }, 100);
    },

    resizeImage(img, size, getPos, editor) {
      const pos = getPos();
      if (pos !== undefined) {
        editor.chain().focus().setNodeMarkup(pos, undefined, {
          ...editor.getAttributes('image'),
          'data-size': size,
        }).run();
      }
    },

    repositionImage(img, position, getPos, editor) {
      const pos = getPos();
      if (pos !== undefined) {
        editor.chain().focus().setNodeMarkup(pos, undefined, {
          ...editor.getAttributes('image'),
          'data-position': position,
        }).run();
      }
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
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
      Underline,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      CustomImage,
      Youtube.configure({
        controls: false,
        nocookie: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '<p>Start writing your content...</p>',
    editorProps: {
      attributes: {
        class: 'working-editor-content',
        style: `font-family: ${fontFamily}; font-size: ${fontSize}px;`,
      },
    },
    onUpdate: ({ editor }) => {
      setPreviewContent(editor.getHTML());
    },
  });

  // File upload handler
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
        
        // Insert image at cursor position with default size and position
        editor.chain().focus().setImage({
          src: data.secure_url,
          alt: file.name,
          'data-size': imageSize,
          'data-position': imagePosition,
        }).run();
        
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

  if (!editor) {
    return <div className="working-loading">Loading Working Image Editor...</div>;
  }

  return (
    <div className="working-image-editor">
      <style>{`
        .working-image-editor {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .working-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 20px;
        }
        
        .working-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .working-subtitle {
          opacity: 0.9;
          font-size: 14px;
        }
        
        .working-main {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .working-editor-panel {
          background: white;
          border: 1px solid #e1e5e9;
          border-radius: 12px;
          padding: 20px;
        }
        
        .working-preview-panel {
          background: #f8f9fa;
          border: 1px solid #e1e5e9;
          border-radius: 12px;
          padding: 20px;
        }
        
        .working-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e1e5e9;
        }
        
        .working-toolbar button {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s ease;
        }
        
        .working-toolbar button:hover {
          background: #e9ecef;
          border-color: #adb5bd;
        }
        
        .working-toolbar select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
          font-size: 13px;
        }
        
        .working-editor-content {
          min-height: 300px;
          padding: 15px;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          background: white;
          line-height: 1.6;
        }
        
        .working-editor-content:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
        }
        
        .editable-image {
          border-radius: 8px;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .editable-image:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: scale(1.02);
        }
        
        .selected-image {
          border: 3px solid #667eea !important;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.25) !important;
        }
        
        .working-upload-section {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 15px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e1e5e9;
        }
        
        .working-upload-btn {
          padding: 10px 20px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .working-upload-btn:hover {
          background: #218838;
        }
        
        .working-upload-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
        
        .working-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 20px;
        }
        
        .working-save-btn {
          padding: 12px 24px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .working-cancel-btn {
          padding: 12px 24px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .working-help {
          background: #e7f3ff;
          border: 1px solid #b3d9ff;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .working-help strong {
          color: #0066cc;
        }
        
        @media (max-width: 768px) {
          .working-main {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="working-header">
        <div className="working-title">Working Image Editor</div>
        <div className="working-subtitle">Upload images and resize/position them with click-to-select and drag handles</div>
      </div>

      <div className="working-main">
        <div className="working-editor-panel">
          <h3>📝 Editor</h3>
          
          <div className="working-toolbar">
            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="Helvetica">Helvetica</option>
            </select>
            
            <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
              <option value="12">12px</option>
              <option value="14">14px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
              <option value="20">20px</option>
            </select>
            
            <button onClick={() => editor.chain().focus().toggleBold().run()}>
              Bold
            </button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()}>
              Italic
            </button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()}>
              Underline
            </button>
          </div>

          <div className="working-help">
            <strong>🎯 How to use:</strong><br/>
            1. Upload an image below<br/>
            2. Click on any image to select it<br/>
            3. Use the floating toolbar to resize (Small/Medium/Large/Full)<br/>
            4. Use the floating toolbar to position (Left/Center/Right)<br/>
            5. Images will show selection border and resize handles
          </div>

          <div className="working-upload-section">
            <select value={imageSize} onChange={(e) => setImageSize(e.target.value)}>
              <option value="small">Small (200px)</option>
              <option value="medium">Medium (400px)</option>
              <option value="large">Large (600px)</option>
              <option value="full">Full Width</option>
            </select>
            
            <select value={imagePosition} onChange={(e) => setImagePosition(e.target.value)}>
              <option value="left">Float Left</option>
              <option value="center">Center</option>
              <option value="right">Float Right</option>
            </select>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            <button 
              className="working-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>

          <EditorContent editor={editor} className="working-editor-content" />
        </div>

        <div className="working-preview-panel">
          <h3>👁️ Live Preview</h3>
          <div 
            className="working-preview-content"
            dangerouslySetInnerHTML={{ __html: previewContent }}
            style={{ 
              minHeight: '300px',
              padding: '15px',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e1e5e9',
              lineHeight: '1.6'
            }}
          />
        </div>
      </div>

      <div className="working-actions">
        <button className="working-save-btn" onClick={() => onSave?.({ title, content: editor.getHTML(), isFeatured })}>
          Save Post
        </button>
        <button className="working-cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default WorkingImageEditor;
