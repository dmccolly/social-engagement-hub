# Rich Blog Editor

A production-ready rich-text editor built with React and TipTap, featuring Cloudinary integration for media uploads and comprehensive formatting options.

## Features

- **Rich Text Formatting**: Headings (H2/H3), bold, italic, underline, custom text colors
- **Smart Links**: Add/update/remove hyperlinks with SEO-friendly attributes (nofollow, noopener)
- **YouTube Embeds**: Paste YouTube URLs to embed responsive video players
- **Media Uploads**: Upload images, audio, and video to Cloudinary with unsigned uploads
- **Export Options**: Copy HTML to clipboard or save to backend API
- **Production Ready**: Error handling, validation, responsive design

## Quick Start

### 1. Installation

```bash
# Clone or download the project
cd rich-blog-editor

# Install dependencies
npm install
# or
pnpm install
```

### 2. Environment Setup

Copy the environment template and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset_name
REACT_APP_XANO_API_URL=https://your-api-url.com/api
```

### 3. Cloudinary Configuration

**Required for file uploads to work:**

1. **Create Upload Preset**:
   - Go to Cloudinary Console → Settings → Upload → Upload presets
   - Create or select a preset with these settings:
     - **Signing mode**: Unsigned
     - **Preset name**: Match your `REACT_APP_CLOUDINARY_UPLOAD_PRESET`
     - **Allowed formats**: jpg,png,webp,mp3,wav,m4a,mp4,mov
     - **Default folder**: social-hub (optional)

2. **Configure Security**:
   - Go to Settings → Security
   - Add your domains to "Allowed unsigned upload domains":
     - `localhost:3000` (for development)
     - `*.netlify.app` (for Netlify deployment)
     - Your custom domain

### 4. Run Development Server

```bash
npm run dev
# or
pnpm run dev
```

Visit `http://localhost:3000` to see the editor in action.

## Integration

### Basic Usage

```jsx
import RichBlogEditor from './components/RichBlogEditor';

function MyBlogPage() {
  const handleSave = async (html) => {
    // Save to your backend
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: html })
    });
  };

  return (
    <RichBlogEditor
      initialHTML="<p>Start writing...</p>"
      folder="my-blog"
      onSave={handleSave}
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialHTML` | string | `"<p>Start writing…</p>"` | Initial content for the editor |
| `folder` | string | `"social-hub"` | Cloudinary folder for uploads |
| `onSave` | function | undefined | Custom save handler `(html) => void` |

### Custom Save Handler

If you don't provide an `onSave` prop, the editor will attempt to POST to `${REACT_APP_XANO_API_URL}/posts`. Provide a custom handler for your specific backend:

```jsx
const customSave = async (html) => {
  try {
    const response = await fetch('/api/blog-posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'My Blog Post',
        content: html,
        status: 'draft'
      })
    });
    
    if (!response.ok) throw new Error('Save failed');
    console.log('Post saved successfully');
  } catch (error) {
    console.error('Save error:', error);
    throw error; // Re-throw to show error in UI
  }
};
```

## Deployment

### Netlify

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Drag the `dist` folder to Netlify
   - Or connect your Git repository

3. **Set environment variables** in Netlify:
   - Go to Site settings → Environment variables
   - Add your `REACT_APP_*` variables

4. **Update Cloudinary settings**:
   - Add your Netlify domain to allowed upload domains
   - Example: `mysite.netlify.app`

### Other Platforms

The editor works with any static hosting platform:
- **Vercel**: Set environment variables in project settings
- **GitHub Pages**: Use GitHub Secrets for environment variables
- **AWS S3**: Configure CloudFront for SPA routing

## Testing

### Manual Smoke Test

Execute these tests in order to verify functionality:

1. **Page loads**: Toolbar visible, editor ready
2. **Typography**: Apply H2, H3, Bold, Italic, Underline
3. **Colors**: Set text color, then clear color
4. **Links**: Select text → Add link → Test in preview → Remove link
5. **YouTube**: Paste `https://youtu.be/VIDEO_ID` → Embed → Verify responsive player
6. **Image Upload**: Upload image → Verify insertion with caption
7. **Audio Upload**: Upload MP3/WAV → Verify `<audio controls>` plays
8. **Video Upload**: Upload MP4 → Verify `<video controls>` plays
9. **Export**: Click "Export HTML" → Verify clipboard copy
10. **Save**: Click "Save" → Verify success (custom handler or API call)

### Expected HTML Output

The editor generates clean, semantic HTML:

```html
<h2>My Heading</h2>
<p>This is <strong>bold</strong> and <em>italic</em> text with a 
<a href="https://example.com" target="_blank" rel="nofollow noopener">link</a>.</p>

<figure>
  <img src="https://res.cloudinary.com/..." alt="">
  <figcaption>Image caption</figcaption>
</figure>

<iframe src="https://www.youtube.com/embed/VIDEO_ID" 
        allowfullscreen loading="lazy" 
        style="width:100%;aspect-ratio:16/9;border:0"></iframe>
```

## Troubleshooting

### Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| "Unknown API key" error | Sending API key in unsigned flow | Remove `api_key` from requests, use unsigned preset |
| "Unsigned upload not allowed" | Wrong preset configuration | Set preset to "Unsigned" mode |
| CORS errors | Domain not whitelisted | Add domain to Cloudinary security settings |
| Upload fails silently | Missing environment variables | Check `REACT_APP_CLOUDINARY_*` variables |
| Styles look broken | CSS conflicts | Component uses scoped styles, check for global CSS overrides |

### Debug Mode

Enable debug logging by adding to your component:

```jsx
const editor = useEditor({
  // ... existing config
  onUpdate: ({ editor }) => {
    console.log('Editor content:', editor.getHTML());
  }
});
```

### Network Issues

Check browser Network tab for failed requests:
- **400 errors**: Usually missing/invalid upload preset
- **401 errors**: Domain not allowed or wrong configuration
- **CORS errors**: Security settings in Cloudinary

## Architecture

### Component Structure

```
RichBlogEditor/
├── Toolbar (sticky, responsive grid)
│   ├── Typography controls (H2, H3, Bold, Italic, Underline)
│   ├── Color picker and clear
│   ├── Link management
│   ├── YouTube embed
│   ├── File upload with caption
│   └── Export/Save actions
├── Editor (TipTap with extensions)
└── Status display
```

### Key Dependencies

- **@tiptap/react**: Core editor framework
- **@tiptap/starter-kit**: Basic editing functionality
- **@tiptap/extension-link**: Link management
- **@tiptap/extension-color**: Text color support
- **@tiptap/extension-text-style**: Text styling
- **@tiptap/extension-heading**: Heading levels

### Security Features

- **Unsigned uploads**: No API keys exposed to client
- **Domain restrictions**: Cloudinary domain whitelist
- **Link attributes**: Automatic `rel="nofollow noopener"`
- **Input validation**: File type and URL validation
- **Error boundaries**: Graceful error handling

## Customization

### Styling

The component uses scoped CSS to prevent conflicts. Customize by modifying the `<style>` block in `RichBlogEditor.jsx`:

```jsx
<style>
  {`
    .rbe-toolbar {
      background: #your-color;
      border: 1px solid #your-border;
    }
    .rbe-editor {
      background: #your-editor-bg;
    }
  `}
</style>
```

### Adding Extensions

Extend functionality with additional TipTap extensions:

```jsx
import { Underline } from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';

const editor = useEditor({
  extensions: [
    StarterKit,
    // ... existing extensions
    Underline,
    Table.configure({
      resizable: true,
    }),
  ],
});
```

### Custom Upload Handler

Replace Cloudinary with your own upload service:

```jsx
async function customUpload(file, folder) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });
  
  return response.json(); // Should return { secure_url: '...' }
}
```

## License

MIT License - feel free to use in your projects.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Verify Cloudinary configuration
4. Test with minimal example

---

**Built with ❤️ using TipTap, React, and modern web technologies.**
