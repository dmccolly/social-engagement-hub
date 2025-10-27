// Rich Text Editor Component for News Feed
// Supports: Text formatting, links, images, videos (YouTube/Vimeo), and more

import React, { useState, useRef, useEffect } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, Link as LinkIcon, Image as ImageIcon,
  Video, List, ListOrdered, Quote, Code, Heading1, Heading2, AlignLeft,
  AlignCenter, AlignRight, X, Check, Youtube, Film
} from 'lucide-react';

const RichTextEditor = ({ value, onChange, placeholder = "What's on your mind?" }) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  // Handle content changes
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Execute formatting command
  const execCommand = (command, value = null) => {
    if (editorRef.current) {
      // Ensure the editor is focused
      editorRef.current.focus();
      
      // For format commands, ensure there's a selection or content
      const selection = window.getSelection();
      if (!selection.rangeCount) {
        // Create a range at the end of the content
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      // Execute the command
      const success = document.execCommand(command, false, value);
      console.log(`execCommand(${command}, ${value}):`, success);
      
      // Update the content
      handleInput();
    }
  };

  // Insert link
  const insertLink = () => {
    if (!linkUrl) return;
    
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    const text = linkText || url;
    
    const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${text}</a>`;
    document.execCommand('insertHTML', false, linkHtml);
    
    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
    editorRef.current?.focus();
    handleInput();
  };

  // Insert image
  const insertImage = () => {
    if (!imageUrl) return;
    
    const url = imageUrl.startsWith('http') ? imageUrl : `https://${imageUrl}`;
    const imageHtml = `<div class="my-4"><img src="${url}" alt="Uploaded image" class="max-w-full h-auto rounded-lg shadow-md" /></div>`;
    document.execCommand('insertHTML', false, imageHtml);
    
    setShowImageModal(false);
    setImageUrl('');
    editorRef.current?.focus();
    handleInput();
  };

  // Extract video ID from YouTube/Vimeo URL
  const extractVideoId = (url) => {
    // YouTube patterns
    const youtubePatterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of youtubePatterns) {
      const match = url.match(pattern);
      if (match) return { type: 'youtube', id: match[1] };
    }
    
    // Vimeo pattern
    const vimeoPattern = /vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoPattern);
    if (vimeoMatch) return { type: 'vimeo', id: vimeoMatch[1] };
    
    return null;
  };

  // Insert video embed
  const insertVideo = () => {
    if (!videoUrl) return;
    
    const videoInfo = extractVideoId(videoUrl);
    if (!videoInfo) {
      alert('Please enter a valid YouTube or Vimeo URL');
      return;
    }
    
    let embedHtml = '';
    if (videoInfo.type === 'youtube') {
      embedHtml = `
        <div class="my-4 relative" style="padding-bottom: 56.25%; height: 0; overflow: hidden;">
          <iframe 
            src="https://www.youtube.com/embed/${videoInfo.id}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            class="absolute top-0 left-0 w-full h-full rounded-lg shadow-md"
          ></iframe>
        </div>
      `;
    } else if (videoInfo.type === 'vimeo') {
      embedHtml = `
        <div class="my-4 relative" style="padding-bottom: 56.25%; height: 0; overflow: hidden;">
          <iframe 
            src="https://player.vimeo.com/video/${videoInfo.id}" 
            frameborder="0" 
            allow="autoplay; fullscreen; picture-in-picture" 
            allowfullscreen
            class="absolute top-0 left-0 w-full h-full rounded-lg shadow-md"
          ></iframe>
        </div>
      `;
    }
    
    document.execCommand('insertHTML', false, embedHtml);
    
    setShowVideoModal(false);
    setVideoUrl('');
    editorRef.current?.focus();
    handleInput();
  };

  // Toolbar button component
  const ToolbarButton = ({ icon: Icon, onClick, title, active = false }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      onMouseDown={(e) => e.preventDefault()}
      title={title}
      className={`p-2 rounded hover:bg-gray-200 transition ${active ? 'bg-gray-200' : ''}`}
    >
      <Icon size={18} className="text-gray-700" />
    </button>
  );

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
      `}</style>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <ToolbarButton icon={Bold} onClick={() => execCommand('bold')} title="Bold (Ctrl+B)" />
          <ToolbarButton icon={Italic} onClick={() => execCommand('italic')} title="Italic (Ctrl+I)" />
          <ToolbarButton icon={Underline} onClick={() => execCommand('underline')} title="Underline (Ctrl+U)" />
          <ToolbarButton icon={Strikethrough} onClick={() => execCommand('strikeThrough')} title="Strikethrough" />
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <ToolbarButton icon={Heading1} onClick={() => execCommand('formatBlock', '<h1>')} title="Heading 1" />
          <ToolbarButton icon={Heading2} onClick={() => execCommand('formatBlock', '<h2>')} title="Heading 2" />
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <ToolbarButton icon={List} onClick={() => execCommand('insertUnorderedList')} title="Bullet List" />
          <ToolbarButton icon={ListOrdered} onClick={() => execCommand('insertOrderedList')} title="Numbered List" />
          <ToolbarButton icon={Quote} onClick={() => execCommand('formatBlock', '<blockquote>')} title="Quote" />
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <ToolbarButton icon={AlignLeft} onClick={() => execCommand('justifyLeft')} title="Align Left" />
          <ToolbarButton icon={AlignCenter} onClick={() => execCommand('justifyCenter')} title="Align Center" />
          <ToolbarButton icon={AlignRight} onClick={() => execCommand('justifyRight')} title="Align Right" />
        </div>

        {/* Media */}
        <div className="flex gap-1">
          <ToolbarButton icon={LinkIcon} onClick={() => setShowLinkModal(true)} title="Insert Link" />
          <ToolbarButton icon={ImageIcon} onClick={() => setShowImageModal(true)} title="Insert Image" />
          <ToolbarButton icon={Video} onClick={() => setShowVideoModal(true)} title="Insert Video" />
        </div>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onClick={() => editorRef.current?.focus()}
        className="p-4 min-h-[120px] max-h-[400px] overflow-y-auto focus:outline-none prose max-w-none cursor-text"
        style={{ wordWrap: 'break-word' }}
        suppressContentEditableWarning
        data-placeholder={placeholder}
      />

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Insert Link</h3>
              <button onClick={() => setShowLinkModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Text (optional)</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Click here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={insertLink}
                  disabled={!linkUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Insert Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Insert Image</h3>
              <button onClick={() => setShowImageModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">Enter the URL of an image from the web</p>
              </div>
              {imageUrl && (
                <div className="border border-gray-200 rounded-lg p-2">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img src={imageUrl} alt="Preview" className="max-w-full h-auto rounded" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowImageModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={insertImage}
                  disabled={!imageUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Insert Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Youtube size={20} className="text-red-600" />
                Insert Video
              </h3>
              <button onClick={() => setShowVideoModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube or Vimeo URL</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports YouTube and Vimeo links
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Examples:</strong><br />
                  • https://www.youtube.com/watch?v=dQw4w9WgXcQ<br />
                  • https://youtu.be/dQw4w9WgXcQ<br />
                  • https://vimeo.com/123456789
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={insertVideo}
                  disabled={!videoUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Insert Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
