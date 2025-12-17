import React, { useState, useRef, useEffect } from 'react';
import { Edit, Eye, Code } from 'lucide-react';

// Simple WYSIWYG editor component for email HTML blocks
// Uses contentEditable with basic formatting toolbar
const WysiwygEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    // Update the editor content if the value prop changes from outside
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execCommand = (command, arg) => {
    document.execCommand(command, false, arg);
    // After executing a command, trigger onChange with the updated HTML
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border rounded-lg bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
        <button
          type="button"
          className="px-2 py-1 border rounded text-sm hover:bg-gray-200 font-bold"
          onClick={() => execCommand('bold')}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          className="px-2 py-1 border rounded text-sm hover:bg-gray-200 italic"
          onClick={() => execCommand('italic')}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          className="px-2 py-1 border rounded text-sm hover:bg-gray-200 underline"
          onClick={() => execCommand('underline')}
          title="Underline"
        >
          U
        </button>
        <span className="border-l mx-1"></span>
        <button
          type="button"
          className="px-2 py-1 border rounded text-sm hover:bg-gray-200"
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) execCommand('createLink', url);
          }}
          title="Insert Link"
        >
          Link
        </button>
        <button
          type="button"
          className="px-2 py-1 border rounded text-sm hover:bg-gray-200"
          onClick={() => execCommand('unlink')}
          title="Remove Link"
        >
          Unlink
        </button>
        <span className="border-l mx-1"></span>
        <button
          type="button"
          className="px-2 py-1 border rounded text-sm hover:bg-gray-200"
          onClick={() => execCommand('insertUnorderedList')}
          title="Bullet List"
        >
          List
        </button>
        <button
          type="button"
          className="px-2 py-1 border rounded text-sm hover:bg-gray-200"
          onClick={() => execCommand('insertOrderedList')}
          title="Numbered List"
        >
          1. 2.
        </button>
      </div>
      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 prose max-w-none"
        onInput={handleInput}
        style={{ minHeight: '200px' }}
      />
    </div>
  );
};

// Memoized block editor components to prevent focus loss
const BlockEditor = React.memo(({ block, onUpdate }) => {
  // Mode: 'wysiwyg' (default), 'preview', or 'html' (advanced)
  // Default to WYSIWYG so users can immediately edit content visually
  const [editMode, setEditMode] = useState('wysiwyg');
  
  const handleChange = (field, value) => {
    onUpdate(block.id, { ...block.content, [field]: value });
  };

  switch(block.type) {
    case 'heading':
      return (
        <div className="email-block">
          <input 
            type="text" 
            value={block.content.text} 
            onChange={(e) => handleChange('text', e.target.value)}
            className="text-2xl font-bold w-full p-2 border rounded" 
            placeholder="Heading text..." 
          />
        </div>
      );
    
    case 'text':
      return (
        <div className="email-block">
          <textarea 
            value={block.content.text} 
            onChange={(e) => handleChange('text', e.target.value)}
            className="w-full p-2 border rounded" 
            rows="4" 
            placeholder="Your text content..." 
          />
        </div>
      );
    
    case 'html':
      return (
        <div className="email-block">
          {/* Toggle buttons for Edit/Preview/HTML mode - sticky header so it's always visible */}
          <div className="flex items-center justify-between mb-2 pb-2 border-b bg-white sticky top-0 z-10 -mx-2 px-2 pt-2">
            <span className="text-sm font-medium text-gray-600">Content Block</span>
            <div className="flex gap-1">
              <button
                onClick={() => setEditMode('wysiwyg')}
                className={`flex items-center gap-1 px-3 py-1 text-sm rounded ${editMode === 'wysiwyg' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Edit size={14} />
                Edit
              </button>
              <button
                onClick={() => setEditMode('preview')}
                className={`flex items-center gap-1 px-3 py-1 text-sm rounded ${editMode === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Eye size={14} />
                Preview
              </button>
              <button
                onClick={() => setEditMode('html')}
                className={`flex items-center gap-1 px-3 py-1 text-sm rounded ${editMode === 'html' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                title="Advanced: Edit raw HTML"
              >
                <Code size={14} />
                HTML
              </button>
            </div>
          </div>
          
          {editMode === 'wysiwyg' ? (
            /* WYSIWYG mode - click and edit like a word processor */
            <div>
              <WysiwygEditor 
                value={block.content.html} 
                onChange={(html) => handleChange('html', html)}
              />
              <p className="text-xs text-gray-500 mt-1">Click to edit. Use the toolbar for formatting.</p>
            </div>
          ) : editMode === 'preview' ? (
            /* Preview mode - show rendered HTML */
            <div>
              <div className="border rounded p-4 bg-white prose max-w-none min-h-[100px]" dangerouslySetInnerHTML={{ __html: block.content.html }} />
              <p className="text-xs text-gray-500 mt-1">Click "Edit" to modify this content.</p>
            </div>
          ) : (
            /* HTML mode - advanced raw HTML editing */
            <div>
              <textarea 
                value={block.content.html} 
                onChange={(e) => handleChange('html', e.target.value)}
                className="w-full p-3 border rounded font-mono text-sm bg-gray-50" 
                rows="12" 
                placeholder="<p>Your HTML content...</p>" 
              />
              <p className="text-xs text-gray-500 mt-1">Advanced: Edit raw HTML directly.</p>
            </div>
          )}
        </div>
      );
    
    case 'image':
      const imgFloat = block.content.float;
      const imgStyle = imgFloat === 'left' || imgFloat === 'right' 
        ? { 
            width: `${block.content.width || 40}%`,
            maxWidth: '100%',
            float: imgFloat,
            margin: imgFloat === 'left' ? '0 16px 16px 0' : '0 0 16px 16px'
          }
        : { 
            width: `${block.content.width || 100}%`,
            maxWidth: '100%',
            display: 'block',
            margin: block.content.align === 'center' ? '0 auto' : block.content.align === 'right' ? '0 0 0 auto' : '0'
          };
      return (
        <div className="email-block">
          <div style={{ overflow: 'hidden' }}>
            <img 
              src={block.content.src} 
              alt={block.content.alt || 'Email image'} 
              className="rounded" 
              style={imgStyle} 
            />
            {imgFloat && (
              <p className="text-gray-400 text-sm">Text will wrap around this image in the email.</p>
            )}
          </div>
          <div className="mt-2 space-y-2" style={{ clear: 'both' }}>
            <input 
              type="text" 
              value={block.content.src || ''} 
              onChange={(e) => handleChange('src', e.target.value)}
              className="w-full p-2 border rounded" 
              placeholder="Image URL..." 
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-600">Width (%)</label>
                <input 
                  type="range" 
                  min="20" 
                  max="100" 
                  value={block.content.width || (imgFloat ? 40 : 100)} 
                  onChange={(e) => handleChange('width', parseInt(e.target.value))}
                  className="w-full" 
                />
                <div className="text-xs text-center text-gray-600">{block.content.width || (imgFloat ? 40 : 100)}%</div>
              </div>
              <div>
                <label className="text-xs text-gray-600">Text Wrap</label>
                <select 
                  value={block.content.float || 'none'} 
                  onChange={(e) => handleChange('float', e.target.value === 'none' ? undefined : e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                >
                  <option value="none">No wrap</option>
                  <option value="left">Wrap right</option>
                  <option value="right">Wrap left</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600">Alignment</label>
                <select 
                  value={block.content.align || 'left'} 
                  onChange={(e) => handleChange('align', e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                  disabled={!!imgFloat}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      );
    
    case 'button':
      return (
        <div className="email-block text-center">
          <button style={{ backgroundColor: block.content.color }} className="px-6 py-3 text-white rounded-lg font-semibold">
            {block.content.text}
          </button>
          <div className="mt-2 space-y-2">
            <input 
              type="text" 
              value={block.content.text} 
              onChange={(e) => handleChange('text', e.target.value)}
              className="w-full p-2 border rounded" 
              placeholder="Button text..." 
            />
            <input 
              type="text" 
              value={block.content.url} 
              onChange={(e) => handleChange('url', e.target.value)}
              className="w-full p-2 border rounded" 
              placeholder="Button URL..." 
            />
          </div>
        </div>
      );
    
    case 'divider':
      return (
        <div className="email-block">
          <hr className="my-4" style={{ borderColor: block.content.color }} />
        </div>
      );
    
    case 'spacer':
      return (
        <div className="email-block">
          <div style={{ height: `${block.content.height}px` }} className="bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-sm">
            Spacer: {block.content.height}px
          </div>
        </div>
      );
    
    default:
      return null;
  }
});

BlockEditor.displayName = 'BlockEditor';

export default BlockEditor;

