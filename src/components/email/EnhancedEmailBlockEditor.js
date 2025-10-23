// Enhanced Email Block Editor with Rich Formatting
// Provides advanced styling controls for email content blocks

import React, { useState } from 'react';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Type, Palette, Link as LinkIcon, Image as ImageIcon,
  ChevronUp, ChevronDown, Trash2, Settings
} from 'lucide-react';
import VariablePicker from './VariablePicker';

const EnhancedEmailBlockEditor = ({ block, onUpdate, onDelete, onMove }) => {
  const [showStylePanel, setShowStylePanel] = useState(false);

  const renderTextEditor = () => {
    const { text, fontSize, fontFamily, color, backgroundColor, alignment, bold, italic, underline, lineHeight } = block.content;

    return (
      <div className="space-y-3">
        {/* Formatting Toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 rounded-lg border">
          {/* Text Formatting */}
          <div className="flex gap-1 border-r pr-2">
            <button
              onClick={() => onUpdate(block.id, { ...block.content, bold: !bold })}
              className={`p-2 rounded hover:bg-gray-200 ${bold ? 'bg-gray-300' : ''}`}
              title="Bold"
            >
              <Bold size={18} />
            </button>
            <button
              onClick={() => onUpdate(block.id, { ...block.content, italic: !italic })}
              className={`p-2 rounded hover:bg-gray-200 ${italic ? 'bg-gray-300' : ''}`}
              title="Italic"
            >
              <Italic size={18} />
            </button>
            <button
              onClick={() => onUpdate(block.id, { ...block.content, underline: !underline })}
              className={`p-2 rounded hover:bg-gray-200 ${underline ? 'bg-gray-300' : ''}`}
              title="Underline"
            >
              <Underline size={18} />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex gap-1 border-r pr-2">
            <button
              onClick={() => onUpdate(block.id, { ...block.content, alignment: 'left' })}
              className={`p-2 rounded hover:bg-gray-200 ${alignment === 'left' ? 'bg-gray-300' : ''}`}
              title="Align Left"
            >
              <AlignLeft size={18} />
            </button>
            <button
              onClick={() => onUpdate(block.id, { ...block.content, alignment: 'center' })}
              className={`p-2 rounded hover:bg-gray-200 ${alignment === 'center' ? 'bg-gray-300' : ''}`}
              title="Align Center"
            >
              <AlignCenter size={18} />
            </button>
            <button
              onClick={() => onUpdate(block.id, { ...block.content, alignment: 'right' })}
              className={`p-2 rounded hover:bg-gray-200 ${alignment === 'right' ? 'bg-gray-300' : ''}`}
              title="Align Right"
            >
              <AlignRight size={18} />
            </button>
          </div>

          {/* Font Size */}
          <select
            value={fontSize || '16'}
            onChange={(e) => onUpdate(block.id, { ...block.content, fontSize: e.target.value })}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="12">12px</option>
            <option value="14">14px</option>
            <option value="16">16px</option>
            <option value="18">18px</option>
            <option value="20">20px</option>
            <option value="24">24px</option>
            <option value="28">28px</option>
            <option value="32">32px</option>
            <option value="36">36px</option>
          </select>

          {/* Font Family */}
          <select
            value={fontFamily || 'Arial'}
            onChange={(e) => onUpdate(block.id, { ...block.content, fontFamily: e.target.value })}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Verdana">Verdana</option>
            <option value="Courier New">Courier New</option>
          </select>

          {/* Text Color */}
          <div className="flex items-center gap-1">
            <Palette size={18} className="text-gray-600" />
            <input
              type="color"
              value={color || '#000000'}
              onChange={(e) => onUpdate(block.id, { ...block.content, color: e.target.value })}
              className="w-8 h-8 border rounded cursor-pointer"
              title="Text Color"
            />
          </div>

          {/* Background Color */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-600">BG:</span>
            <input
              type="color"
              value={backgroundColor || '#ffffff'}
              onChange={(e) => onUpdate(block.id, { ...block.content, backgroundColor: e.target.value })}
              className="w-8 h-8 border rounded cursor-pointer"
              title="Background Color"
            />
          </div>

          {/* Advanced Settings Toggle */}
          <button
            onClick={() => setShowStylePanel(!showStylePanel)}
            className="p-2 rounded hover:bg-gray-200 ml-auto"
            title="Advanced Settings"
          >
            <Settings size={18} />
          </button>
        </div>

        {/* Advanced Style Panel */}
        {showStylePanel && (
          <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line Height
                </label>
                <input
                  type="number"
                  value={lineHeight || '1.5'}
                  onChange={(e) => onUpdate(block.id, { ...block.content, lineHeight: e.target.value })}
                  step="0.1"
                  min="1"
                  max="3"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Padding (px)
                </label>
                <input
                  type="number"
                  value={block.content.padding || '10'}
                  onChange={(e) => onUpdate(block.id, { ...block.content, padding: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* Text Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">Content</label>
            <VariablePicker 
              onInsertVariable={(variable) => {
                const textarea = document.getElementById(`text-${block.id}`);
                if (textarea) {
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const currentText = text || '';
                  const newText = currentText.substring(0, start) + variable + currentText.substring(end);
                  onUpdate(block.id, { ...block.content, text: newText });
                  // Set cursor position after variable
                  setTimeout(() => {
                    textarea.focus();
                    textarea.setSelectionRange(start + variable.length, start + variable.length);
                  }, 0);
                }
              }}
              compact={true}
              buttonText="+ Variable"
            />
          </div>
          <textarea
            id={`text-${block.id}`}
            value={text || ''}
            onChange={(e) => onUpdate(block.id, { ...block.content, text: e.target.value })}
            className="w-full p-3 border rounded-lg"
            rows="6"
            placeholder="Enter your text content... Use + Variable to add personalization"
            style={{
              fontSize: `${fontSize || 16}px`,
              fontFamily: fontFamily || 'Arial',
              color: color || '#000000',
              backgroundColor: backgroundColor || '#ffffff',
              textAlign: alignment || 'left',
              fontWeight: bold ? 'bold' : 'normal',
              fontStyle: italic ? 'italic' : 'normal',
              textDecoration: underline ? 'underline' : 'none',
              lineHeight: lineHeight || '1.5',
              padding: `${block.content.padding || 10}px`
            }}
          />
        </div>
      </div>
    );
  };

  const renderHeadingEditor = () => {
    const { text, level, color, alignment, fontFamily } = block.content;

    return (
      <div className="space-y-3">
        <div className="flex gap-3 items-center">
          {/* Heading Level */}
          <select
            value={level || '1'}
            onChange={(e) => onUpdate(block.id, { ...block.content, level: e.target.value })}
            className="px-3 py-2 border rounded"
          >
            <option value="1">H1</option>
            <option value="2">H2</option>
            <option value="3">H3</option>
            <option value="4">H4</option>
          </select>

          {/* Font Family */}
          <select
            value={fontFamily || 'Arial'}
            onChange={(e) => onUpdate(block.id, { ...block.content, fontFamily: e.target.value })}
            className="px-3 py-2 border rounded flex-1"
          >
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
          </select>

          {/* Color */}
          <input
            type="color"
            value={color || '#000000'}
            onChange={(e) => onUpdate(block.id, { ...block.content, color: e.target.value })}
            className="w-10 h-10 border rounded cursor-pointer"
          />

          {/* Alignment */}
          <div className="flex gap-1">
            <button
              onClick={() => onUpdate(block.id, { ...block.content, alignment: 'left' })}
              className={`p-2 rounded hover:bg-gray-200 ${alignment === 'left' ? 'bg-gray-300' : ''}`}
            >
              <AlignLeft size={18} />
            </button>
            <button
              onClick={() => onUpdate(block.id, { ...block.content, alignment: 'center' })}
              className={`p-2 rounded hover:bg-gray-200 ${alignment === 'center' ? 'bg-gray-300' : ''}`}
            >
              <AlignCenter size={18} />
            </button>
            <button
              onClick={() => onUpdate(block.id, { ...block.content, alignment: 'right' })}
              className={`p-2 rounded hover:bg-gray-200 ${alignment === 'right' ? 'bg-gray-300' : ''}`}
            >
              <AlignRight size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">Heading Text</label>
            <VariablePicker 
              onInsertVariable={(variable) => {
                const input = document.getElementById(`heading-${block.id}`);
                if (input) {
                  const start = input.selectionStart;
                  const end = input.selectionEnd;
                  const currentText = text || '';
                  const newText = currentText.substring(0, start) + variable + currentText.substring(end);
                  onUpdate(block.id, { ...block.content, text: newText });
                  setTimeout(() => {
                    input.focus();
                    input.setSelectionRange(start + variable.length, start + variable.length);
                  }, 0);
                }
              }}
              compact={true}
              buttonText="+ Variable"
            />
          </div>
          <input
            id={`heading-${block.id}`}
            type="text"
            value={text || ''}
            onChange={(e) => onUpdate(block.id, { ...block.content, text: e.target.value })}
            className="w-full p-3 border rounded-lg font-bold"
            placeholder="Enter heading text... Use + Variable to personalize"
            style={{
              fontSize: level === '1' ? '32px' : level === '2' ? '28px' : level === '3' ? '24px' : '20px',
              fontFamily: fontFamily || 'Arial',
              color: color || '#000000',
              textAlign: alignment || 'left'
            }}
          />
        </div>
      </div>
    );
  };

  const renderImageEditor = () => {
    const { src, alt, width, alignment, borderRadius, link } = block.content;

    return (
      <div className="space-y-3">
        {/* Image Preview */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <img
            src={src || 'https://via.placeholder.com/600x300'}
            alt={alt || 'Email image'}
            className="max-w-full rounded"
            style={{
              width: width || '100%',
              margin: alignment === 'center' ? '0 auto' : alignment === 'right' ? '0 0 0 auto' : '0',
              display: 'block',
              borderRadius: `${borderRadius || 0}px`
            }}
          />
        </div>

        {/* Image Settings */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="text"
              value={src || ''}
              onChange={(e) => onUpdate(block.id, { ...block.content, src: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alt Text
            </label>
            <input
              type="text"
              value={alt || ''}
              onChange={(e) => onUpdate(block.id, { ...block.content, alt: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="Image description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width
            </label>
            <select
              value={width || '100%'}
              onChange={(e) => onUpdate(block.id, { ...block.content, width: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="100%">Full Width</option>
              <option value="75%">75%</option>
              <option value="50%">50%</option>
              <option value="25%">25%</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alignment
            </label>
            <select
              value={alignment || 'left'}
              onChange={(e) => onUpdate(block.id, { ...block.content, alignment: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Border Radius (px)
            </label>
            <input
              type="number"
              value={borderRadius || '0'}
              onChange={(e) => onUpdate(block.id, { ...block.content, borderRadius: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              min="0"
              max="50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link URL (optional)
            </label>
            <input
              type="text"
              value={link || ''}
              onChange={(e) => onUpdate(block.id, { ...block.content, link: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>
    );
  };

  const renderButtonEditor = () => {
    const { text, url, color, textColor, borderRadius, fontSize, padding } = block.content;

    return (
      <div className="space-y-3">
        {/* Button Preview */}
        <div className="text-center p-6 bg-gray-50 rounded-lg border">
          <a
            href={url || '#'}
            className="inline-block font-semibold"
            style={{
              backgroundColor: color || '#2563eb',
              color: textColor || '#ffffff',
              borderRadius: `${borderRadius || 8}px`,
              fontSize: `${fontSize || 16}px`,
              padding: `${padding || 12}px ${(padding || 12) * 2}px`,
              textDecoration: 'none'
            }}
          >
            {text || 'Button Text'}
          </a>
        </div>

        {/* Button Settings */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Button Text
              </label>
              <VariablePicker 
                onInsertVariable={(variable) => {
                  const input = document.getElementById(`button-text-${block.id}`);
                  if (input) {
                    const start = input.selectionStart;
                    const end = input.selectionEnd;
                    const currentText = text || '';
                    const newText = currentText.substring(0, start) + variable + currentText.substring(end);
                    onUpdate(block.id, { ...block.content, text: newText });
                    setTimeout(() => {
                      input.focus();
                      input.setSelectionRange(start + variable.length, start + variable.length);
                    }, 0);
                  }
                }}
                compact={true}
                buttonText="+ Variable"
              />
            </div>
            <input
              id={`button-text-${block.id}`}
              type="text"
              value={text || ''}
              onChange={(e) => onUpdate(block.id, { ...block.content, text: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="Click Here"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link URL
            </label>
            <input
              type="text"
              value={url || ''}
              onChange={(e) => onUpdate(block.id, { ...block.content, url: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Button Color
            </label>
            <input
              type="color"
              value={color || '#2563eb'}
              onChange={(e) => onUpdate(block.id, { ...block.content, color: e.target.value })}
              className="w-full h-10 border rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text Color
            </label>
            <input
              type="color"
              value={textColor || '#ffffff'}
              onChange={(e) => onUpdate(block.id, { ...block.content, textColor: e.target.value })}
              className="w-full h-10 border rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Border Radius (px)
            </label>
            <input
              type="number"
              value={borderRadius || '8'}
              onChange={(e) => onUpdate(block.id, { ...block.content, borderRadius: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              min="0"
              max="50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Size (px)
            </label>
            <input
              type="number"
              value={fontSize || '16'}
              onChange={(e) => onUpdate(block.id, { ...block.content, fontSize: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              min="12"
              max="24"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case 'text':
        return renderTextEditor();
      case 'heading':
        return renderHeadingEditor();
      case 'image':
        return renderImageEditor();
      case 'button':
        return renderButtonEditor();
      case 'divider':
        return (
          <div className="space-y-3">
            <hr style={{ borderColor: block.content.color || '#e5e7eb', borderWidth: block.content.thickness || '1px' }} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="color"
                  value={block.content.color || '#e5e7eb'}
                  onChange={(e) => onUpdate(block.id, { ...block.content, color: e.target.value })}
                  className="w-full h-10 border rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thickness (px)</label>
                <input
                  type="number"
                  value={block.content.thickness || '1'}
                  onChange={(e) => onUpdate(block.id, { ...block.content, thickness: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  min="1"
                  max="10"
                />
              </div>
            </div>
          </div>
        );
      case 'spacer':
        return (
          <div className="space-y-3">
            <div className="bg-gray-100 rounded p-4 text-center text-gray-500">
              Spacer: {block.content.height || 20}px
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
              <input
                type="number"
                value={block.content.height || '20'}
                onChange={(e) => onUpdate(block.id, { ...block.content, height: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                min="10"
                max="200"
              />
            </div>
          </div>
        );
      case 'html':
        return (
          <div className="space-y-3">
            <div className="border rounded p-4 bg-white prose max-w-none" dangerouslySetInnerHTML={{ __html: block.content.html }} />
            <textarea
              value={block.content.html || ''}
              onChange={(e) => onUpdate(block.id, { ...block.content, html: e.target.value })}
              className="w-full p-3 border rounded font-mono text-sm"
              rows="8"
              placeholder="<p>Your HTML content...</p>"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 mb-4 hover:border-blue-300 transition">
      {/* Block Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 uppercase">
            {block.type}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMove(block.id, 'up')}
            className="p-1 hover:bg-gray-100 rounded"
            title="Move Up"
          >
            <ChevronUp size={18} />
          </button>
          <button
            onClick={() => onMove(block.id, 'down')}
            className="p-1 hover:bg-gray-100 rounded"
            title="Move Down"
          >
            <ChevronDown size={18} />
          </button>
          <button
            onClick={() => onDelete(block.id)}
            className="p-1 hover:bg-red-100 rounded text-red-600"
            title="Delete Block"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Block Content */}
      {renderBlockContent()}
    </div>
  );
};

export default EnhancedEmailBlockEditor;

