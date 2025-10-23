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
      return (
        <div className="email-block">
          <img src={block.content.src} alt={block.content.alt} className="w-full rounded" />
          <input 
            type="text" 
            value={block.content.src} 
            onChange={(e) => handleChange('src', e.target.value)}
            className="w-full p-2 border rounded mt-2" 
            placeholder="Image URL..." 
          />
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

