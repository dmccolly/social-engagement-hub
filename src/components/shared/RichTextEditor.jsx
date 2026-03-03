// Rich Text Editor — powered by Tiptap (ProseMirror-based)
// Replaces the deprecated document.execCommand() contentEditable approach.

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/extension-bubble-menu';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import Heading from '@tiptap/extension-heading';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Link as LinkIcon, Image as ImageIcon, Video, Music,
  List, ListOrdered, Quote, AlignLeft, AlignCenter, AlignRight,
  X, Type, Heading1, Heading2, Heading3,
  Code, Undo, Redo,
} from 'lucide-react';

// ------------------------------------------------------------------
// Toolbar button helper
// ------------------------------------------------------------------
const Btn = ({ onClick, active, title, disabled, children }) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()} // keep editor focus
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`p-1.5 rounded transition-colors text-sm font-medium
      ${active
        ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
        : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}
      ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-gray-300 mx-1 self-center" />;

// ------------------------------------------------------------------
// Common swatches shown in colour pickers
// ------------------------------------------------------------------
const SWATCHES = [
  '#000000', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#FFFFFF',
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6',
  '#EC4899', '#14B8A6', '#0EA5E9', '#A855F7',
];

// ------------------------------------------------------------------
// Shared modal wrapper
// ------------------------------------------------------------------
const Modal = ({ title, onClose, children }) => (
  <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  </div>
);

const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
    {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
  </div>
);

const TextInput = (props) => (
  <input
    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    {...props}
  />
);

const ModalActions = ({ onCancel, onConfirm, confirmLabel = 'Insert', confirmDisabled }) => (
  <div className="flex justify-end gap-2 pt-2">
    <button
      type="button"
      onClick={onCancel}
      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
    >
      Cancel
    </button>
    <button
      type="button"
      onClick={onConfirm}
      disabled={confirmDisabled}
      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700
        disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      {confirmLabel}
    </button>
  </div>
);

// ------------------------------------------------------------------
// Colour picker dropdown
// ------------------------------------------------------------------
const ColorPicker = ({ value, onChange, onClose }) => (
  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-50 w-52">
    <div className="grid grid-cols-8 gap-1 mb-2">
      {SWATCHES.map(c => (
        <button
          key={c}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => { onChange(c); onClose(); }}
          className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition"
          style={{ backgroundColor: c }}
          title={c}
        />
      ))}
    </div>
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-7 cursor-pointer rounded border border-gray-300"
    />
  </div>
);

// ------------------------------------------------------------------
// Main RichTextEditor component
// ------------------------------------------------------------------
const RichTextEditor = forwardRef(({
  value,
  onChange,
  placeholder = "What's on your mind?",
}, ref) => {
  // Modal visibility
  const [showLink, setShowLink] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showAudio, setShowAudio] = useState(false);

  // Link modal state
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  // Image modal state
  const [imageUrl, setImageUrl] = useState('');
  const [imageMode, setImageMode] = useState('url'); // 'url' | 'upload'
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Video modal state
  const [videoUrl, setVideoUrl] = useState('');
  const [videoMode, setVideoMode] = useState('youtube'); // 'youtube' | 'file'

  // Audio modal state
  const [audioUrl, setAudioUrl] = useState('');

  // Colour picker
  const [textColor, setTextColor] = useState('#000000');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const fileInputRef = useRef(null);
  const isInternalChange = useRef(false);

  // ------------------------------------------------------------------
  // Tiptap editor instance
  // ------------------------------------------------------------------
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [1, 2, 3] }),
      Underline,
      Image.configure({ allowBase64: false, HTMLAttributes: { class: 'editor-img' } }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'rte-link', target: '_blank', rel: 'noopener noreferrer' },
      }),
      Youtube.configure({ nocookie: true, HTMLAttributes: { class: 'editor-youtube' } }),
      Color.configure({ types: [TextStyle.name, 'heading'] }),
      TextStyle,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      isInternalChange.current = true;
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'rte-body focus:outline-none',
        'data-placeholder': placeholder,
      },
    },
  });

  // Sync value prop into editor when it changes externally
  useEffect(() => {
    if (!editor) return;
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    const incoming = value || '';
    if (incoming !== editor.getHTML()) {
      editor.commands.setContent(incoming, false);
    }
  }, [value, editor]);

  // Expose modal openers via ref (backwards-compatible API)
  useImperativeHandle(ref, () => ({
    openLinkModal: () => setShowLink(true),
    openImageModal: () => setShowImage(true),
    openVideoModal: () => setShowVideo(true),
    openAudioModal: () => setShowAudio(true),
  }));

  // ------------------------------------------------------------------
  // Link insertion
  // ------------------------------------------------------------------
  const handleInsertLink = useCallback(() => {
    if (!linkUrl || !editor) return;
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    const { empty } = editor.state.selection;

    if (!empty) {
      editor.chain().focus().setLink({ href: url }).run();
    } else if (linkText) {
      editor.chain().focus()
        .insertContent(`<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a> `)
        .run();
    } else {
      editor.chain().focus()
        .insertContent(`<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a> `)
        .run();
    }
    setShowLink(false);
    setLinkUrl('');
    setLinkText('');
  }, [linkUrl, linkText, editor]);

  // ------------------------------------------------------------------
  // Image insertion — URL
  // ------------------------------------------------------------------
  const handleInsertImageUrl = useCallback(() => {
    if (!imageUrl || !editor) return;
    const src = imageUrl.startsWith('http') ? imageUrl : `https://${imageUrl}`;
    editor.chain().focus().setImage({ src }).run();
    setShowImage(false);
    setImageUrl('');
  }, [imageUrl, editor]);

  // ------------------------------------------------------------------
  // Image insertion — file upload to Cloudinary
  // ------------------------------------------------------------------
  const handleImageFileUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'demo-preset');
      const cloud = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'demo-cloud-name';
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
        { method: 'POST', body: formData }
      );
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      editor.chain().focus().setImage({ src: data.secure_url, alt: file.name }).run();
      setShowImage(false);
      setImageUrl('');
      setImageMode('url');
    } catch {
      alert('Image upload failed. Check your Cloudinary credentials in .env.local.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [editor]);

  // ------------------------------------------------------------------
  // Video insertion
  // ------------------------------------------------------------------
  const handleInsertVideo = useCallback(() => {
    if (!videoUrl || !editor) return;
    if (videoMode === 'youtube') {
      editor.chain().focus().setYoutubeVideo({ src: videoUrl }).run();
    } else {
      const src = videoUrl.startsWith('http') ? videoUrl : `https://${videoUrl}`;
      editor.chain().focus().insertContent(
        `<video controls style="width:100%;border-radius:8px;margin:0.5em 0;">` +
        `<source src="${src}" type="video/mp4">` +
        `<source src="${src}" type="video/webm">` +
        `Your browser does not support video.</video>`
      ).run();
    }
    setShowVideo(false);
    setVideoUrl('');
  }, [videoUrl, videoMode, editor]);

  // ------------------------------------------------------------------
  // Audio insertion
  // ------------------------------------------------------------------
  const handleInsertAudio = useCallback(() => {
    if (!audioUrl || !editor) return;
    const src = audioUrl.startsWith('http') ? audioUrl : `https://${audioUrl}`;
    editor.chain().focus().insertContent(
      `<audio controls style="width:100%;margin:0.5em 0;">` +
      `<source src="${src}" type="audio/mpeg">` +
      `<source src="${src}" type="audio/ogg">` +
      `Your browser does not support audio.</audio>`
    ).run();
    setShowAudio(false);
    setAudioUrl('');
  }, [audioUrl, editor]);

  if (!editor) return null;

  const isActive = (name, attrs) => editor.isActive(name, attrs);

  return (
    <div className="border border-gray-300 rounded-xl overflow-visible bg-white shadow-sm">
      <style>{`
        /* Editor typography */
        .rte-body {
          padding: 1rem;
          min-height: 400px;
          line-height: 1.65;
          color: #111827;
          font-size: 15px;
        }
        .rte-body p { margin: 0 0 0.65em; }
        .rte-body p:last-child { margin-bottom: 0; }
        .rte-body h1 { font-size: 1.875em; font-weight: 700; margin: 1.2em 0 0.5em; line-height: 1.2; }
        .rte-body h2 { font-size: 1.5em; font-weight: 700; margin: 1.1em 0 0.5em; line-height: 1.25; }
        .rte-body h3 { font-size: 1.2em; font-weight: 600; margin: 1em 0 0.4em; line-height: 1.3; }
        .rte-body a.rte-link { color: #2563eb; text-decoration: underline; }
        .rte-body a.rte-link:hover { color: #1d4ed8; }
        .rte-body ul { list-style: disc; padding-left: 1.5em; margin: 0.5em 0; }
        .rte-body ol { list-style: decimal; padding-left: 1.5em; margin: 0.5em 0; }
        .rte-body li { margin: 0.2em 0; }
        .rte-body blockquote {
          border-left: 3px solid #d1d5db;
          padding: 0.5em 1em;
          margin: 0.8em 0;
          color: #6b7280;
          font-style: italic;
          background: #f9fafb;
          border-radius: 0 6px 6px 0;
        }
        .rte-body code {
          background: #f3f4f6;
          padding: 2px 5px;
          border-radius: 4px;
          font-size: 0.875em;
          font-family: monospace;
        }
        .rte-body pre {
          background: #1f2937;
          color: #f9fafb;
          padding: 1em;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1em 0;
        }
        .rte-body pre code { background: none; padding: 0; color: inherit; }
        .rte-body img.editor-img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 0.8em auto;
          display: block;
        }
        .rte-body iframe.editor-youtube {
          width: 100%;
          aspect-ratio: 16/9;
          border: 0;
          border-radius: 8px;
          margin: 1em 0;
          display: block;
        }
        .rte-body video { width: 100%; border-radius: 8px; margin: 0.5em 0; display: block; }
        .rte-body audio { width: 100%; margin: 0.5em 0; display: block; }

        /* Placeholder */
        .rte-body p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }

        /* Bubble menu */
        .rte-bubble {
          display: flex;
          align-items: center;
          gap: 2px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 5px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }
        .rte-bubble button {
          padding: 4px 8px;
          border-radius: 5px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: transparent;
          color: #374151;
          transition: background 0.15s;
          line-height: 1;
        }
        .rte-bubble button:hover { background: #f3f4f6; }
        .rte-bubble button.is-active { background: #3b82f6; color: white; }
        .rte-bubble .bubble-sep {
          width: 1px;
          height: 16px;
          background: #e5e7eb;
          margin: 0 2px;
          align-self: center;
          flex-shrink: 0;
        }
      `}</style>

      {/* ---- Bubble menu — appears on text selection ---- */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 100, placement: 'top' }}
        className="rte-bubble"
      >
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'is-active' : ''}
          style={{ textDecoration: 'underline' }}
        >
          U
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
        >
          <s>S</s>
        </button>
        <div className="bubble-sep" />
        <button onClick={() => setShowLink(true)}>Link</button>
        <button
          onClick={() => editor.chain().focus().unsetLink().run()}
          style={{ color: '#ef4444' }}
        >
          Unlink
        </button>
      </BubbleMenu>

      {/* ---- Main toolbar ---- */}
      <div className="bg-gray-50 border-b border-gray-200 px-2 py-1.5 flex flex-wrap gap-0.5 items-center rounded-t-xl">

        {/* Undo / Redo */}
        <Btn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo size={15} />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo size={15} />
        </Btn>

        <Divider />

        {/* Headings */}
        <Btn
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={isActive('paragraph')}
          title="Paragraph"
        >
          ¶
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={15} />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={15} />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={15} />
        </Btn>

        <Divider />

        {/* Text formatting */}
        <Btn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold size={15} />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic size={15} />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon size={15} />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough size={15} />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={isActive('code')}
          title="Inline code"
        >
          <Code size={15} />
        </Btn>

        <Divider />

        {/* Text colour */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowColorPicker(v => !v)}
            title="Text colour"
            className="flex items-center gap-0.5 p-1.5 rounded hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <Type size={15} className="text-gray-600" />
            <div
              className="w-3 h-1 rounded-sm mt-0.5"
              style={{ backgroundColor: textColor }}
            />
          </button>
          {showColorPicker && (
            <ColorPicker
              value={textColor}
              onChange={(c) => {
                setTextColor(c);
                editor.chain().focus().setColor(c).run();
              }}
              onClose={() => setShowColorPicker(false)}
            />
          )}
        </div>
        <Btn
          onClick={() => editor.chain().focus().unsetColor().run()}
          title="Clear colour"
        >
          <span className="text-xs">A</span>
        </Btn>

        <Divider />

        {/* Alignment */}
        <Btn
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={isActive({ textAlign: 'left' })}
          title="Align left"
        >
          <AlignLeft size={15} />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={isActive({ textAlign: 'center' })}
          title="Align centre"
        >
          <AlignCenter size={15} />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={isActive({ textAlign: 'right' })}
          title="Align right"
        >
          <AlignRight size={15} />
        </Btn>

        <Divider />

        {/* Lists & Blocks */}
        <Btn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={isActive('bulletList')}
          title="Bullet list"
        >
          <List size={15} />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={isActive('orderedList')}
          title="Numbered list"
        >
          <ListOrdered size={15} />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={isActive('blockquote')}
          title="Blockquote"
        >
          <Quote size={15} />
        </Btn>

        <Divider />

        {/* Media */}
        <Btn onClick={() => setShowLink(true)} title="Insert link">
          <LinkIcon size={15} />
        </Btn>
        <Btn onClick={() => setShowImage(true)} title="Insert image">
          <ImageIcon size={15} />
        </Btn>
        <Btn onClick={() => setShowVideo(true)} title="Insert video">
          <Video size={15} />
        </Btn>
        <Btn onClick={() => setShowAudio(true)} title="Insert audio">
          <Music size={15} />
        </Btn>

      </div>

      {/* ---- Editor content area ---- */}
      <div onClick={() => editor.commands.focus()} className="cursor-text">
        <EditorContent editor={editor} />
      </div>

      {/* ============================================================
          MODALS
      ============================================================ */}

      {/* ---- Link modal ---- */}
      {showLink && (
        <Modal
          title="Insert Link"
          onClose={() => { setShowLink(false); setLinkUrl(''); setLinkText(''); }}
        >
          <Field label="URL" hint="e.g. https://example.com">
            <TextInput
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleInsertLink()}
            />
          </Field>
          <Field label="Link text" hint="Leave blank to use selected text or the URL itself">
            <TextInput
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Click here"
              onKeyDown={(e) => e.key === 'Enter' && handleInsertLink()}
            />
          </Field>
          <ModalActions
            onCancel={() => { setShowLink(false); setLinkUrl(''); setLinkText(''); }}
            onConfirm={handleInsertLink}
            confirmDisabled={!linkUrl}
          />
        </Modal>
      )}

      {/* ---- Image modal ---- */}
      {showImage && (
        <Modal
          title="Insert Image"
          onClose={() => { setShowImage(false); setImageUrl(''); setImageMode('url'); }}
        >
          {/* Tab switcher */}
          <div className="flex gap-0 border border-gray-200 rounded-lg overflow-hidden text-sm font-medium">
            {[['url', 'From URL'], ['upload', 'Upload File']].map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => setImageMode(m)}
                className={`flex-1 py-2 transition-colors
                  ${imageMode === m
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {imageMode === 'url' ? (
            <>
              <Field label="Image URL" hint="Paste a direct link to any image">
                <TextInput
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleInsertImageUrl()}
                />
              </Field>
              {imageUrl && (
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-h-40 w-full object-contain bg-gray-50"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
              <ModalActions
                onCancel={() => { setShowImage(false); setImageUrl(''); setImageMode('url'); }}
                onConfirm={handleInsertImageUrl}
                confirmDisabled={!imageUrl}
              />
            </>
          ) : (
            <>
              <Field
                label="Choose image"
                hint="Uploads via Cloudinary — configure REACT_APP_CLOUDINARY_* in .env.local"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  disabled={isUploadingImage}
                  className="w-full text-sm text-gray-600 border border-gray-300 rounded-lg
                    file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </Field>
              {isUploadingImage && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Uploading…
                </div>
              )}
              <ModalActions
                onCancel={() => {
                  setShowImage(false);
                  setImageUrl('');
                  setImageMode('url');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                onConfirm={() => fileInputRef.current?.click()}
                confirmLabel={isUploadingImage ? 'Uploading…' : 'Choose File'}
                confirmDisabled={isUploadingImage}
              />
            </>
          )}
        </Modal>
      )}

      {/* ---- Video modal ---- */}
      {showVideo && (
        <Modal
          title="Insert Video"
          onClose={() => { setShowVideo(false); setVideoUrl(''); setVideoMode('youtube'); }}
        >
          <div className="flex gap-0 border border-gray-200 rounded-lg overflow-hidden text-sm font-medium">
            {[['youtube', 'YouTube / Vimeo'], ['file', 'Video File URL']].map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => setVideoMode(m)}
                className={`flex-1 py-2 transition-colors
                  ${videoMode === m
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <Field
            label={videoMode === 'youtube' ? 'YouTube or Vimeo URL' : 'Video file URL'}
            hint={
              videoMode === 'youtube'
                ? 'e.g. https://youtube.com/watch?v=… or https://vimeo.com/…'
                : 'Direct link to an MP4 or WebM file'
            }
          >
            <TextInput
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder={
                videoMode === 'youtube'
                  ? 'https://www.youtube.com/watch?v=...'
                  : 'https://example.com/video.mp4'
              }
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleInsertVideo()}
            />
          </Field>

          <ModalActions
            onCancel={() => { setShowVideo(false); setVideoUrl(''); setVideoMode('youtube'); }}
            onConfirm={handleInsertVideo}
            confirmDisabled={!videoUrl}
          />
        </Modal>
      )}

      {/* ---- Audio modal ---- */}
      {showAudio && (
        <Modal
          title="Insert Audio"
          onClose={() => { setShowAudio(false); setAudioUrl(''); }}
        >
          <Field label="Audio file URL" hint="Direct link to an MP3, OGG, or WAV file">
            <TextInput
              type="text"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="https://example.com/audio.mp3"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleInsertAudio()}
            />
          </Field>
          <ModalActions
            onCancel={() => { setShowAudio(false); setAudioUrl(''); }}
            onConfirm={handleInsertAudio}
            confirmDisabled={!audioUrl}
          />
        </Modal>
      )}
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
