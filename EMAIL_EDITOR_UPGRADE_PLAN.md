# Email Editor Upgrade Plan

## Current State
The email campaign editor uses a simple `<textarea>` with basic text input.

## Target State
Upgrade to match the blog post editor with:
- Rich text formatting (bold, italic, underline)
- Font family and size selection
- Text and highlight colors
- Lists (bullet points and numbered)
- Image upload with Cloudinary
- Link insertion
- YouTube video embedding
- Alignment options
- Full contentEditable div editor

## Implementation Steps

### 1. Add State Management
```javascript
const [emailContent, setEmailContent] = useState('');
const [showLinkDialog, setShowLinkDialog] = useState(false);
const [showYouTubeDialog, setShowYouTubeDialog] = useState(false);
const [linkData, setLinkData] = useState({ text: '', url: '' });
const [youtubeUrl, setYoutubeUrl] = useState('');
const [isUploadingEmail, setIsUploadingEmail] = useState(false);
const emailContentRef = useRef(null);
const emailFileInputRef = useRef(null);
```

### 2. Add Formatting Functions
- `applyEmailFormat(command)` - Apply text formatting
- `handleEmailFileUpload(event)` - Upload images to Cloudinary
- `insertEmailImage(imageData)` - Insert image into content
- `insertEmailLink()` - Insert hyperlink
- `insertEmailYouTube()` - Embed YouTube video

### 3. Create Rich Text Toolbar
Same toolbar as blog editor with:
- Font family dropdown
- Font size dropdown
- Bold, Italic, Underline buttons
- List buttons (bullet, numbered)
- Text color picker
- Highlight color picker
- Alignment buttons
- Link button
- Image upload button
- YouTube button

### 4. Replace Textarea with ContentEditable Div
```javascript
<div
  ref={emailContentRef}
  className="w-full min-h-[400px] p-4 border rounded-lg bg-white focus:border-blue-500"
  contentEditable
  suppressContentEditableWarning={true}
  onInput={handleEmailContentChange}
  style={{
    direction: 'ltr',
    textAlign: 'left'
  }}
/>
```

### 5. Update Modal Size
Change from `max-w-md` to `max-w-4xl` to accommodate the rich editor

### 6. Add Image Upload Input
```javascript
<input
  ref={emailFileInputRef}
  type="file"
  accept="image/*"
  multiple
  onChange={handleEmailFileUpload}
  className="hidden"
/>
```

## Benefits
- Consistent user experience between blog and email editors
- Professional-looking email campaigns
- Image support for visual emails
- Link and video embedding
- Full HTML email content