import React from 'react';

// Memoized block editor components to prevent focus loss
const BlockEditor = React.memo(({ block, onUpdate }) => {
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
          <div className="border rounded p-4 bg-white prose max-w-none" dangerouslySetInnerHTML={{ __html: block.content.html }} />
          <textarea 
            value={block.content.html} 
            onChange={(e) => handleChange('html', e.target.value)}
            className="w-full p-2 border rounded mt-2 font-mono text-sm" 
            rows="6" 
            placeholder="<p>Your HTML content...</p>" 
          />
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

